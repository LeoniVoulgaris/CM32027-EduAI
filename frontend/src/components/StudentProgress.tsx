import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { TrendingUp, Award, Target, Star, CheckCircle2, Zap } from "lucide-react";
import { getMyProgress, getMySubmissions } from "../lib/api";

interface WeeklyScore {
  week: string;
  score: number;
}

interface TopicMastery {
  topic: string;
  mastery: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: string;
  icon: string;
}

export function StudentProgress() {
  const [weeklyScores, setWeeklyScores] = useState<WeeklyScore[]>([]);
  const [topicMastery, setTopicMastery] = useState<TopicMastery[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentAvg, setCurrentAvg] = useState(0);
  const [assignmentsDone, setAssignmentsDone] = useState(0);

  useEffect(() => {
    Promise.all([getMyProgress(), getMySubmissions()])
      .then(([progressData, submissionsData]) => {
        const weekly = Array.isArray(progressData?.weeklyScores)
          ? progressData.weeklyScores
              .map((item: any) => ({
                week: String(item.week || ""),
                score: Math.max(0, Math.min(100, Number(item.score || 0))),
              }))
              .filter((item: WeeklyScore) => item.week)
          : [];

        const mastery = Array.isArray(progressData?.topicMastery)
          ? progressData.topicMastery
              .map((item: any) => ({
                topic: String(item.topic || "Unknown Topic"),
                mastery: Math.max(0, Math.min(100, Number(item.mastery || 0))),
              }))
              .filter((item: TopicMastery) => item.topic)
          : [];

        setWeeklyScores(weekly);
        setTopicMastery(mastery);
        setAchievements(Array.isArray(progressData?.achievements) ? progressData.achievements : []);

        const successScore = Number(progressData?.successScore);
        if (Number.isFinite(successScore)) {
          setCurrentAvg(Math.round(successScore));
        } else if (weekly.length > 0) {
          const avg = weekly.reduce((sum, item) => sum + item.score, 0) / weekly.length;
          setCurrentAvg(Math.round(avg));
        } else {
          setCurrentAvg(0);
        }

        const submissions = Array.isArray(submissionsData) ? submissionsData : [];
        setAssignmentsDone(submissions.length);
      })
      .catch(() => {});
  }, []);

  const skillRadar = topicMastery.map(item => ({
    skill: item.topic.replace(/\n/g, ' '),
    current: item.mastery,
    target: Math.min(item.mastery + 15, 100),
  }));

  const sortedByMastery = [...topicMastery].sort((a, b) => b.mastery - a.mastery);
  const strengthsAndWeaknesses = {
    strengths: sortedByMastery.slice(0, 3).map(item => ({ skill: item.topic, score: item.mastery })),
    needsPractice: [...sortedByMastery]
      .reverse()
      .slice(0, 3)
      .map(item => ({ skill: item.topic, score: item.mastery }))
  };

  const weakestTopic = strengthsAndWeaknesses.needsPractice[0]?.skill;
  const improvement = weeklyScores.length >= 2 ? weeklyScores[weeklyScores.length - 1].score - weeklyScores[0].score : 0;
  const masteredTopics = topicMastery.filter(topic => topic.mastery >= 90).length;
  const topicExpertTarget = 3;
  const submissionTarget = 10;
  const submissionProgress = Math.min((assignmentsDone / submissionTarget) * 100, 100);
  const topicExpertProgress = Math.min((masteredTopics / topicExpertTarget) * 100, 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Your Learning Journey</h2>
        <p className="text-gray-600">Track your progress and celebrate your achievements</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-linear-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl">{currentAvg}%</p>
              <p className="text-sm text-blue-100">Current Average</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-linear-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl">{assignmentsDone}</p>
              <p className="text-sm text-green-100">Assignments Done</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-linear-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl">{achievements.length}</p>
              <p className="text-sm text-purple-100">Achievements</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-linear-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl">{improvement >= 0 ? `+${improvement}%` : `${improvement}%`}</p>
              <p className="text-sm text-orange-100">Improvement</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList>
          <TabsTrigger value="progress">Progress Over Time</TabsTrigger>
          <TabsTrigger value="skills">Skills Breakdown</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg mb-4">Your Score Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Your Score"
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {weeklyScores.length >= 2 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {improvement >= 0
                      ? `Great progress! You've improved by ${improvement} points over ${weeklyScores.length} weeks.`
                      : `You're currently ${Math.abs(improvement)} points below your first recorded week. Keep practicing to bounce back.`}
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg mb-4">Topic Mastery Levels</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicMastery}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="mastery" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
              {weakestTopic && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <Target className="w-4 h-4 inline mr-1" />
                    Focus on {weakestTopic} to improve your overall score.
                  </p>
                </div>
              )}
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg mb-4">Strengths & Areas for Practice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-green-700">
                  <Star className="w-5 h-5" />
                  Your Strengths
                </h4>
                <div className="space-y-3">
                  {strengthsAndWeaknesses.strengths.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.skill}</span>
                        <Badge className="bg-green-600">{item.score}%</Badge>
                      </div>
                      <Progress value={item.score} className="h-2" />
                    </div>
                  ))}
                  {strengthsAndWeaknesses.strengths.length === 0 && (
                    <p className="text-sm text-gray-500">Complete assignments to reveal your strengths.</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-orange-700">
                  <Target className="w-5 h-5" />
                  Practice These
                </h4>
                <div className="space-y-3">
                  {strengthsAndWeaknesses.needsPractice.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.skill}</span>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          {item.score}%
                        </Badge>
                      </div>
                      <Progress value={item.score} className="h-2" />
                    </div>
                  ))}
                  {strengthsAndWeaknesses.needsPractice.length === 0 && (
                    <p className="text-sm text-gray-500">Your practice recommendations will appear after your first submissions.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg mb-4">Skills Analysis</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={skillRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Your Current Level"
                    dataKey="current"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Target Level"
                    dataKey="target"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillRadar.map((skill, index) => (
              <Card key={index} className="p-4">
                <h4 className="mb-3">{skill.skill}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current</span>
                    <span>{skill.current}%</span>
                  </div>
                  <Progress value={skill.current} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Target</span>
                    <span>{skill.target}%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {skill.current >= skill.target ? (
                      <span className="text-green-600">✓ Target achieved!</span>
                    ) : (
                      <span>{skill.target - skill.current}% to target</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6 mt-6">
          <Card className="p-6 bg-linear-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="text-xl">Your Achievements</h3>
                <p className="text-sm text-gray-600">You've earned {achievements.length} badges!</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-3">{achievement.icon}</div>
                <h4 className="mb-2">{achievement.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                <p className="text-xs text-gray-500">Earned {achievement.earnedDate}</p>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="text-lg mb-4">Next Achievements to Unlock</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-4xl opacity-50">🎯</div>
                <div className="flex-1">
                  <h4 className="mb-1">Submission Streak</h4>
                  <p className="text-sm text-gray-600 mb-2">Submit {submissionTarget} assignments</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{Math.min(assignmentsDone, submissionTarget)} of {submissionTarget} completed</span>
                    </div>
                    <Progress value={submissionProgress} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-4xl opacity-50">📚</div>
                <div className="flex-1">
                  <h4 className="mb-1">Topic Expert</h4>
                  <p className="text-sm text-gray-600 mb-2">Master {topicExpertTarget} topics (90%+ each)</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{Math.min(masteredTopics, topicExpertTarget)} of {topicExpertTarget} mastered</span>
                    </div>
                    <Progress value={topicExpertProgress} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
