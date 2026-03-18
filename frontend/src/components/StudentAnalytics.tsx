import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { TrendingDown, TrendingUp, AlertCircle, ChevronDown, ChevronRight, Users, Sparkles } from "lucide-react";
import { getClassInsights } from "../lib/api";

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

interface TrendPoint {
  week: string;
  average: number;
  class: string;
}

interface ClassInsightsResponse {
  className?: string;
  topicMastery?: TopicMastery[];
  performanceTrend?: TrendPoint[];
  studentHeatmap?: StudentPerformance[];
  misconceptions?: Misconception[];
}

export function StudentAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);
  const [expandedMisconception, setExpandedMisconception] = useState<string | null>(null);
  const [className, setClassName] = useState("Class");
  const [topicMasteryData, setTopicMasteryData] = useState<TopicMastery[]>([]);
  const [performanceTrendData, setPerformanceTrendData] = useState<TrendPoint[]>([]);
  const [studentHeatmapData, setStudentHeatmapData] = useState<StudentPerformance[]>([]);
  const [misconceptions, setMisconceptions] = useState<Misconception[]>([]);

  useEffect(() => {
    getClassInsights()
      .then((data: ClassInsightsResponse) => {
        setClassName(data.className || "Class");
        setTopicMasteryData(Array.isArray(data.topicMastery) ? data.topicMastery : []);
        setPerformanceTrendData(Array.isArray(data.performanceTrend) ? data.performanceTrend : []);
        setStudentHeatmapData(Array.isArray(data.studentHeatmap) ? data.studentHeatmap : []);
        setMisconceptions(Array.isArray(data.misconceptions) ? data.misconceptions : []);
      })
      .catch(() => {
        setTopicMasteryData([]);
        setPerformanceTrendData([]);
        setStudentHeatmapData([]);
        setMisconceptions([]);
      });
  }, []);

  const needsSupportCount = useMemo(
    () => studentHeatmapData.filter((student) => student.risk !== "on-track").length,
    [studentHeatmapData]
  );

  const predictedAverage = useMemo(() => {
    if (performanceTrendData.length === 0) return null;
    return performanceTrendData[performanceTrendData.length - 1].average;
  }, [performanceTrendData]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "needs-support":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Needs Support</Badge>;
      case "needs-attention":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Needs Attention</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">On Track</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Class Performance Analytics</h2>
        <p className="text-gray-600">{className} - Real-time insights synced from LMS data</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="misconceptions">
            Misconceptions
            <Badge className="ml-2 bg-red-600">{misconceptions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="p-6 border-l-4 border-l-red-500 bg-red-50">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg mb-2">Top Class Misconceptions</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Detected patterns across submitted work. Click any card to inspect impacted students.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {misconceptions.slice(0, 3).map((misc) => (
                    <button
                      key={misc.topic}
                      onClick={() => {
                        setExpandedMisconception(misc.topic);
                        setActiveTab("misconceptions");
                      }}
                      className="bg-white p-4 rounded-lg border border-red-200 hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm pr-2">{misc.topic}</p>
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 shrink-0">
                          {misc.affectedStudents}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{misc.affectedStudents} students affected</p>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => setActiveTab("misconceptions")}>
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

        <TabsContent value="misconceptions" className="space-y-6 mt-6">
          <Card className="p-6 bg-purple-50 border-purple-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="text-lg mb-1">Auto-assign Remedial Work</h3>
                  <p className="text-sm text-gray-600">
                    When enabled, AI can draft targeted practice for students with detected misconceptions.
                    You still review content before assignment.
                  </p>
                </div>
              </div>
              <Switch checked={autoAssignEnabled} onCheckedChange={setAutoAssignEnabled} />
            </div>
          </Card>

          <div className="space-y-4">
            {misconceptions.map((misc) => (
              <Card key={misc.topic} className="p-6 border-l-4 border-l-red-500">
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
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedMisconception === misc.topic ? "rotate-180" : ""}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {misc.studentList.map((student, index) => (
                            <Badge key={index} variant="outline" className="bg-white">
                              {student}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="pt-2">
                    <p className="text-sm">
                      <strong className="text-gray-900">Suggested Action:</strong> {misc.suggestedIntervention}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">View Student Details</Button>
                    <Button size="sm">{autoAssignEnabled ? "Generate & Auto-suggest" : "Generate Practice Set"}</Button>
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
              {studentHeatmapData.map((student) => (
                <div key={student.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                        <div className={`${getScoreColor(student.score)} h-full rounded-full flex items-center justify-end pr-2`} style={{ width: `${student.score}%` }}>
                          <span className="text-xs text-white">{student.score}%</span>
                        </div>
                      </div>
                      <div className="w-32">{getRiskBadge(student.risk)}</div>
                    </div>
                  </div>
                  {student.weakTopics.length > 0 && (
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1">
                        {student.weakTopics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
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
              {topicMasteryData.map((topic) => (
                <div key={topic.topic} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4>{topic.topic}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{topic.mastery}% mastery</span>
                      {topic.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {topic.trend === "down" && <TrendingDown className="w-4 h-4 text-red-600" />}
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className={topic.mastery >= 80 ? "bg-green-500" : topic.mastery >= 70 ? "bg-yellow-500" : "bg-red-500"} style={{ width: `${topic.mastery}%`, height: "100%" }} />
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
                {predictedAverage !== null
                  ? `Based on current trends, the class is on pace for around ${predictedAverage}% this cycle. ${needsSupportCount} student(s) currently show support signals.`
                  : "Not enough graded data yet to generate a prediction."}
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
