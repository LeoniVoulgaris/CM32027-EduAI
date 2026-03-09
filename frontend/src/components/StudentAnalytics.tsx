import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { TrendingDown, TrendingUp, AlertCircle, ChevronDown, ChevronRight, Users, Sparkles } from "lucide-react";
import { useState } from "react";

interface TopicMastery {
  topic: string;
  mastery: number;
  students: number;
  trend: "up" | "down" | "stable";
}

interface StudentPerformance {
  name: string;
  score: number;
  trend: "up" | "down" | "stable";
  risk: "needs-support" | "needs-attention" | "on-track";
  weakTopics: string[];
}

interface Misconception {
  topic: string;
  description: string;
  affectedStudents: number;
  studentList: string[];
  suggestedIntervention: string;
}

export function StudentAnalytics() {
  const topicMasteryData: TopicMastery[] = [
    { topic: "Linear Equations", mastery: 85, students: 28, trend: "up" },
    { topic: "Quadratic Equations", mastery: 68, students: 28, trend: "down" },
    { topic: "Word Problems", mastery: 62, students: 28, trend: "stable" },
    { topic: "Functions", mastery: 78, students: 28, trend: "up" },
    { topic: "Graphing", mastery: 72, students: 28, trend: "stable" },
  ];

  const performanceTrendData = [
    { week: "Week 1", average: 75, class: "9A" },
    { week: "Week 2", average: 78, class: "9A" },
    { week: "Week 3", average: 82, class: "9A" },
    { week: "Week 4", average: 79, class: "9A" },
    { week: "Week 5", average: 84, class: "9A" },
    { week: "Week 6", average: 86, class: "9A" },
  ];

  const studentHeatmapData: StudentPerformance[] = [
    { name: "Alex Kim", score: 92, trend: "up", risk: "on-track", weakTopics: [] },
    { name: "Sarah Johnson", score: 88, trend: "up", risk: "on-track", weakTopics: [] },
    { name: "Marcus Lee", score: 76, trend: "down", risk: "needs-attention", weakTopics: ["Quadratic Equations"] },
    { name: "Emma Chen", score: 58, trend: "down", risk: "needs-support", weakTopics: ["Quadratic Equations", "Word Problems"] },
    { name: "David Park", score: 84, trend: "stable", risk: "on-track", weakTopics: [] },
    { name: "Lisa Wang", score: 72, trend: "stable", risk: "needs-attention", weakTopics: ["Word Problems"] },
    { name: "Ryan Smith", score: 79, trend: "up", risk: "on-track", weakTopics: [] },
    { name: "Sofia Garcia", score: 91, trend: "up", risk: "on-track", weakTopics: [] },
  ];

  const misconceptions: Misconception[] = [
    {
      topic: "Quadratic Formula Application",
      description: "Students are confusing the signs when using the quadratic formula, particularly with negative b values.",
      affectedStudents: 12,
      studentList: ["Emma Chen", "Marcus Lee", "David Park", "Lisa Wang", "+8 more"],
      suggestedIntervention: "Generate practice problems focusing on sign conventions"
    },
    {
      topic: "Word Problem Setup",
      description: "Students struggle to translate word problems into equations, especially with 'more than' and 'less than' phrases.",
      affectedStudents: 8,
      studentList: ["Emma Chen", "Lisa Wang", "Alex Kim", "+5 more"],
      suggestedIntervention: "Provide scaffolded examples with step-by-step translation guide"
    },
    {
      topic: "Vertex Form Transformation",
      description: "Confusion between vertex form parameters (h, k) and their relationship to graph position.",
      affectedStudents: 5,
      studentList: ["Marcus Lee", "David Park", "+3 more"],
      suggestedIntervention: "Visual demonstrations using graphing tools"
    }
  ];

  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);
  const [expandedMisconception, setExpandedMisconception] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "needs-support": return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Needs Support</Badge>;
      case "needs-attention": return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Needs Attention</Badge>;
      default: return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">On Track</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Class Performance Analytics</h2>
        <p className="text-gray-600">Grade 9 Math A - Real-time insights synced from Google Classroom</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="misconceptions">
            Misconceptions
            <Badge className="ml-2 bg-red-600">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Top 3 Class Misconceptions Summary */}
          <Card className="p-6 border-l-4 border-l-red-500 bg-red-50">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg mb-2">Top 3 Class Misconceptions</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI-detected patterns across student work • Click to view details and affected students
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {misconceptions.slice(0, 3).map((misc, index) => (
                    <button
                      key={index}
                      onClick={() => setExpandedMisconception(misc.topic)}
                      className="bg-white p-4 rounded-lg border border-red-200 hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm pr-2">{misc.topic}</p>
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex-shrink-0">
                          {misc.affectedStudents}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {misc.affectedStudents} students affected
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => document.querySelector('[value="misconceptions"]')?.dispatchEvent(new MouseEvent('click'))}>
                    View All Misconceptions
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg mb-4">Topic Mastery Levels</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicMasteryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="mastery" fill="#3b82f6">
                    {topicMasteryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.mastery >= 80 ? "#10b981" : entry.mastery >= 70 ? "#f59e0b" : "#ef4444"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg mb-4">Class Progress Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        {/* New Misconceptions Tab */}
        <TabsContent value="misconceptions" className="space-y-6 mt-6">
          {/* Teacher Control Settings */}
          <Card className="p-6 bg-purple-50 border-purple-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="text-lg mb-1">Auto-assign Remedial Work</h3>
                  <p className="text-sm text-gray-600">
                    When enabled, AI can automatically create and suggest practice sets for students with detected misconceptions.
                    You'll review all content before it's assigned.
                  </p>
                </div>
              </div>
              <Switch
                checked={autoAssignEnabled}
                onCheckedChange={setAutoAssignEnabled}
              />
            </div>
          </Card>

          {/* Misconception Cards */}
          <div className="space-y-4">
            {misconceptions.map((misc, index) => (
              <Card key={index} className="p-6 border-l-4 border-l-red-500">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg">{misc.topic}</h3>
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                          {misc.affectedStudents} students
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{misc.description}</p>
                    </div>
                  </div>

                  <Collapsible open={expandedMisconception === misc.topic} onOpenChange={(open) => setExpandedMisconception(open ? misc.topic : null)}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">View affected students</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedMisconception === misc.topic ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {misc.studentList.map((student, i) => (
                            <Badge key={i} variant="outline" className="bg-white">
                              {student}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-900">Why recommended?</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-blue-600" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-3 p-4 bg-white border border-blue-200 rounded-lg">
                        <p className="text-sm mb-2">
                          <strong className="text-gray-900">AI Analysis:</strong>
                        </p>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Pattern detected across {misc.affectedStudents} students' recent assessments</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Similar error types in question responses</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Performance trend shows this is a growing challenge</span>
                          </li>
                        </ul>
                        <p className="text-sm mt-3">
                          <strong className="text-gray-900">Suggested Action:</strong><br />
                          <span className="text-gray-700">{misc.suggestedIntervention}</span>
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">View Student Details</Button>
                    <Button size="sm">
                      {autoAssignEnabled ? "Generate & Auto-suggest" : "Generate Practice Set"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg mb-4">Student Performance Heatmap</h3>
            <div className="space-y-2">
              {studentHeatmapData.map((student, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-40">
                    <div className="flex items-center gap-2">
                      <span>{student.name}</span>
                      {student.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {student.trend === "down" && <TrendingDown className="w-4 h-4 text-red-600" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div 
                          className={`${getScoreColor(student.score)} h-full rounded-full flex items-center justify-end pr-2`}
                          style={{ width: `${student.score}%` }}
                        >
                          <span className="text-xs text-white">{student.score}%</span>
                        </div>
                      </div>
                      <div className="w-32">
                        {getRiskBadge(student.risk)}
                      </div>
                    </div>
                  </div>
                  {student.weakTopics.length > 0 && (
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1">
                        {student.weakTopics.map((topic, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg mb-4">Topic-by-Topic Breakdown</h3>
            <div className="space-y-4">
              {topicMasteryData.map((topic, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4>{topic.topic}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{topic.mastery}% mastery</span>
                      {topic.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {topic.trend === "down" && <TrendingDown className="w-4 h-4 text-red-600" />}
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={topic.mastery >= 80 ? "bg-green-500" : topic.mastery >= 70 ? "bg-yellow-500" : "bg-red-500"}
                      style={{ width: `${topic.mastery}%`, height: "100%" }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{topic.students} students assessed</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg mb-4">Performance Trends & Predictions</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={3} name="Class Average" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="mb-2">AI Prediction</h4>
              <p className="text-sm text-gray-700">
                Based on current trends, the class is projected to achieve an 88% average by Week 8. 
                However, 5 students may fall below 70% without targeted intervention.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}