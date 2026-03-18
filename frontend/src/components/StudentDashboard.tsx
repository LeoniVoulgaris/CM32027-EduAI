import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { BookOpen, Clock, CheckCircle2, TrendingUp, Target, Star, AlertCircle } from "lucide-react";
import { getAssignments, getMySubmissions, getMyProgress } from "../lib/api";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "not-started" | "in-progress" | "submitted" | "graded";
  score?: number;
  isPersonalized: boolean;
  difficulty: "easy" | "medium" | "hard";
}

interface LearningGoal {
  topic: string;
  progress: number;
  status: "struggling" | "progressing" | "mastered";
}

export function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [recommendedPractice, setRecommendedPractice] = useState<Array<{
    title: string;
    description: string;
    questions: number;
    estimatedTime: string;
  }>>([]);
  const [userName, setUserName] = useState("there");
  const [activeAssignments, setActiveAssignments] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [weeklyChange, setWeeklyChange] = useState(0);

  useEffect(() => {
    Promise.all([getAssignments(), getMyProgress(), getMySubmissions()])
      .then(([assignData, progressData, submissionData]) => {
        const submissions = Array.isArray(submissionData) ? submissionData : [];
        const scores = submissions
          .map((s: any) => Number(s.score))
          .filter((score: number) => Number.isFinite(score));
        const submissionByAssignment = new Map(
          submissions.map((s: any) => [String(s.assignmentId), Number(s.score)])
        );

        const assignmentRows = (Array.isArray(assignData) ? assignData : []).slice(0, 5).map((a: any) => {
          const submissionScore = submissionByAssignment.get(String(a.id));
          return {
            id: String(a.id),
            title: a.title,
            subject: a.class || "General",
            dueDate: a.dueDate,
            status: Number.isFinite(submissionScore) ? "submitted" : "not-started",
            score: Number.isFinite(submissionScore) ? Math.round(submissionScore) : undefined,
            isPersonalized: Boolean(a.aiGenerated),
            difficulty: "medium" as const,
          };
        });

        setAssignments(assignmentRows);
        setActiveAssignments(assignmentRows.filter((a) => a.status !== "submitted").length);
        setAverageScore(scores.length ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0);

        const sortedSubmissions = [...submissions]
          .filter((s: any) => s.submittedAt)
          .sort((a: any, b: any) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
        if (sortedSubmissions.length >= 2) {
          const last = Number(sortedSubmissions[sortedSubmissions.length - 1].score || 0);
          const prev = Number(sortedSubmissions[sortedSubmissions.length - 2].score || 0);
          setWeeklyChange(Math.round(last - prev));
        } else {
          setWeeklyChange(0);
        }

        const topicMastery = Array.isArray(progressData?.topicMastery) ? progressData.topicMastery : [];
        const goals = topicMastery.map((t: any) => ({
          topic: t.topic,
          progress: Math.round(Number(t.mastery || 0)),
          status: Number(t.mastery) >= 80 ? "mastered" : Number(t.mastery) >= 60 ? "progressing" : "struggling",
        }));
        setLearningGoals(goals);

        const practice = [...topicMastery]
          .sort((a: any, b: any) => Number(a.mastery || 0) - Number(b.mastery || 0))
          .slice(0, 2)
          .map((topic: any, index: number) => ({
            title: `${topic.topic} Practice`,
            description: `Targeted review to improve your ${topic.topic.toLowerCase()} mastery`,
            questions: Math.max(5, 10 - index * 2),
            estimatedTime: `${10 + index * 5} min`,
          }));
        setRecommendedPractice(practice);

        if (progressData?.name) setUserName(String(progressData.name).split(" ")[0]);
      })
      .catch(() => {});
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-blue-600"><CheckCircle2 className="w-3 h-3 mr-1" />Submitted</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "graded":
        return <Badge className="bg-green-600"><Star className="w-3 h-3 mr-1" />Graded</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "mastered":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "progressing":
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
        <h2 className="text-3xl mb-2">Welcome back, {userName}! 👋</h2>
        <p className="text-blue-100 mb-6">You're making great progress this week. Keep it up!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl">{activeAssignments}</p>
                <p className="text-sm text-blue-100">Active Assignments</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl">{averageScore}%</p>
                <p className="text-sm text-blue-100">Average Score</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl">{weeklyChange >= 0 ? `+${weeklyChange}` : `${weeklyChange}`}%</p>
                <p className="text-sm text-blue-100">This Week</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Assignments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl">Your Assignments</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4>{assignment.title}</h4>
                        {assignment.isPersonalized && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
                            Personalized for You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{assignment.subject}</p>
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Due {assignment.dueDate}
                      </span>
                      {assignment.score && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Star className="w-4 h-4" />
                          {assignment.score}%
                        </span>
                      )}
                    </div>
                    <Button size="sm" variant={assignment.status === "not-started" ? "default" : "outline"}>
                      {assignment.status === "submitted" ? "View Results" : assignment.status === "in-progress" ? "Continue" : "Start"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Personalized Practice */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl">Recommended Practice for You</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Based on your recent work, we've created custom practice exercises to help you improve.
            </p>
            <div className="space-y-3">
              {recommendedPractice.map((practice, index) => (
                <Card key={index} className="p-4 bg-white border-purple-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="mb-1">{practice.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{practice.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{practice.questions} questions</span>
                        <span>•</span>
                        <span>{practice.estimatedTime}</span>
                      </div>
                    </div>
                    <Button size="sm">Start Practice</Button>
                  </div>
                </Card>
              ))}
              {recommendedPractice.length === 0 && (
                <Card className="p-4 bg-white border-purple-200">
                  <p className="text-sm text-gray-600">Complete an assignment to unlock personalized practice recommendations.</p>
                </Card>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Learning Progress */}
          <Card className="p-6">
            <h3 className="text-lg mb-4">Your Learning Progress</h3>
            <div className="space-y-4">
              {learningGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(goal.status)}
                      <span className="text-sm">{goal.topic}</span>
                    </div>
                    <span className="text-sm">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Tips */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg">Quick Tip</h3>
            </div>
            <p className="text-sm text-gray-700">
              When solving word problems, try underlining key information and writing down what you're looking for before setting up your equation.
            </p>
          </Card>

          {/* Recent Feedback */}
          <Card className="p-6">
            <h3 className="text-lg mb-4">Recent Feedback</h3>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 mb-1">Great work! ✨</p>
                <p className="text-xs text-gray-600">Your approach to solving quadratic equations is improving. Keep practicing!</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 mb-1">Tip for improvement</p>
                <p className="text-xs text-gray-600">Remember to check your signs when using the quadratic formula.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
