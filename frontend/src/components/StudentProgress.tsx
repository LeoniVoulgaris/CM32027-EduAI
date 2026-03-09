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

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: string;
  icon: string;
}

export function StudentProgress() {
  const weeklyScores = [
    { week: "Week 1", score: 75 },
    { week: "Week 2", score: 78 },
    { week: "Week 3", score: 82 },
    { week: "Week 4", score: 79 },
    { week: "Week 5", score: 88 },
    { week: "Week 6", score: 92 },
  ];

  const topicMastery = [
    { topic: "Linear\nEquations", mastery: 95 },
    { topic: "Quadratic\nEquations", mastery: 68 },
    { topic: "Word\nProblems", mastery: 45 },
    { topic: "Functions", mastery: 82 },
    { topic: "Graphing", mastery: 88 },
  ];

  const skillRadar = [
    { skill: "Problem Solving", current: 85, target: 90 },
    { skill: "Calculations", current: 92, target: 95 },
    { skill: "Word Problems", current: 65, target: 80 },
    { skill: "Graphing", current: 88, target: 90 },
    { skill: "Conceptual Understanding", current: 80, target: 85 },
  ];

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "Perfect Score",
      description: "Scored 100% on an assignment",
      earnedDate: "Nov 10, 2025",
      icon: "🏆"
    },
    {
      id: "2",
      title: "Week Streak",
      description: "Completed all assignments for 3 weeks",
      earnedDate: "Nov 15, 2025",
      icon: "🔥"
    },
    {
      id: "3",
      title: "Fast Learner",
      description: "Improved score by 15% in one week",
      earnedDate: "Nov 8, 2025",
      icon: "⚡"
    },
    {
      id: "4",
      title: "Topic Master",
      description: "Achieved 90%+ mastery in Linear Equations",
      earnedDate: "Nov 5, 2025",
      icon: "⭐"
    }
  ];

  const strengthsAndWeaknesses = {
    strengths: [
      { skill: "Linear Equations", score: 95 },
      { skill: "Calculations", score: 92 },
      { skill: "Graphing", score: 88 }
    ],
    needsPractice: [
      { skill: "Word Problems", score: 45 },
      { skill: "Quadratic Equations", score: 68 },
      { skill: "Problem Setup", score: 58 }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Your Learning Journey</h2>
        <p className="text-gray-600">Track your progress and celebrate your achievements</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl">92%</p>
              <p className="text-sm text-blue-100">Current Average</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl">24</p>
              <p className="text-sm text-green-100">Assignments Done</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl">4</p>
              <p className="text-sm text-purple-100">Achievements</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl">+12%</p>
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
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Great progress! You've improved by 17 points in 6 weeks!
                </p>
              </div>
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
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <Target className="w-4 h-4 inline mr-1" />
                  Focus on Word Problems to improve your overall score!
                </p>
              </div>
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
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
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
                  <h4 className="mb-1">Practice Champion</h4>
                  <p className="text-sm text-gray-600 mb-2">Complete 10 practice sessions</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">7 of 10 completed</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-4xl opacity-50">📚</div>
                <div className="flex-1">
                  <h4 className="mb-1">Topic Expert</h4>
                  <p className="text-sm text-gray-600 mb-2">Master 3 topics (90%+ each)</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">1 of 3 mastered</span>
                    </div>
                    <Progress value={33} className="h-2" />
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
