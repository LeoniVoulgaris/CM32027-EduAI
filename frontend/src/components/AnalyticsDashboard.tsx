import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import {
  AlertTriangle,
  Send,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Clock,
  MessageSquare,
  Eye,
  BarChart3
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from "recharts";
import { getStudentAnalytics } from "../lib/api";

interface Student {
  id: string;
  name: string;
  risk: string;
  successScore: number;
}

interface AnalyticsDashboardProps {
  student?: Student;
}

interface StudentAnalyticsResponse {
  successScore?: number;
  topicMastery?: Array<{ topic: string; mastery: number }>;
  submissionTimeliness?: Array<{ assignment: string; hoursBeforeDeadline: number; onTime: boolean; label: string }>;
  studyHeatmap?: Array<{ day: number; weekday: number; intensity: number; date: string }>;
  engagementBreakdown?: { active: number; passive: number };
  activePassiveRatio?: number;
  timeOnTask?: Array<{ week: string; effectiveTime: number; rawTime: number }>;
  networkCentrality?: number;
  gradebookAccess?: Array<{ week: string; checks: number }>;
  consistencyScore?: number;
}

export function AnalyticsDashboard({ student }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<StudentAnalyticsResponse>({});

  useEffect(() => {
    if (!student?.id) {
      setAnalytics({});
      return;
    }

    getStudentAnalytics(student.id)
      .then((data) => setAnalytics(data || {}))
      .catch(() => setAnalytics({}));
  }, [student?.id]);

  const submissionData = analytics.submissionTimeliness || [];
  const studyHeatmapData = analytics.studyHeatmap || [];
  const engagementData = [
    {
      type: "Active",
      value: analytics.engagementBreakdown?.active ?? 0,
      label: "Short-answer responses and completed items"
    },
    {
      type: "Passive",
      value: analytics.engagementBreakdown?.passive ?? 0,
      label: "Low-interaction activity"
    }
  ];
  const timeOnTaskData = analytics.timeOnTask || [];
  const gradebookAccessData = analytics.gradebookAccess || [];
  const consistencyScore = analytics.consistencyScore ?? 0;
  const activePassiveRatio = analytics.activePassiveRatio ?? 0;
  const networkCentrality = analytics.networkCentrality ?? 0;
  const successScore = analytics.successScore ?? student?.successScore ?? 0;

  const weakTopics = useMemo(() => {
    const rows = analytics.topicMastery || [];
    return rows.filter((row) => row.mastery < 70).slice(0, 3);
  }, [analytics.topicMastery]);

  const averageWeeklyChecks = useMemo(() => {
    if (gradebookAccessData.length === 0) return 0;
    const total = gradebookAccessData.reduce((sum, row) => sum + row.checks, 0);
    return +(total / gradebookAccessData.length).toFixed(2);
  }, [gradebookAccessData]);

  const effectiveTimeChange = useMemo(() => {
    if (timeOnTaskData.length < 2) return 0;
    const first = timeOnTaskData[0].effectiveTime;
    const last = timeOnTaskData[timeOnTaskData.length - 1].effectiveTime;
    if (first <= 0) return 0;
    return Math.round(((last - first) / first) * 100);
  }, [timeOnTaskData]);

  const getRiskColor = (score: number) => {
    if (score >= 70) return { text: "text-green-700", border: "border-green-300" };
    if (score >= 50) return { text: "text-yellow-700", border: "border-yellow-300" };
    return { text: "text-red-700", border: "border-red-300" };
  };

  const riskColors = getRiskColor(successScore);
  const COLORS = ["#10b981", "#94a3b8"];

  return (
    <div className="space-y-6">
      <Card className={`p-8 border-2 ${riskColors.border}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className={`w-6 h-6 ${riskColors.text}`} />
              <h2 className="text-2xl">Early Warning Risk Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Success Probability Score</span>
                  <span className={`text-2xl ${riskColors.text}`}>{successScore}%</span>
                </div>
                <Progress value={successScore} className="h-3" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${successScore < 70 ? "bg-red-500" : "bg-green-500"}`} />
                    <span className="text-sm">Academic Performance</span>
                  </div>
                  <p className="text-xs text-gray-600">Current score trend: {successScore}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${submissionData.some((row) => !row.onTime) ? "bg-yellow-500" : "bg-green-500"}`} />
                    <span className="text-sm">Submission Timeliness</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {submissionData.length > 0 ? `${submissionData.filter((row) => row.onTime).length}/${submissionData.length} on time` : "No submissions yet"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${weakTopics.length > 0 ? "bg-yellow-500" : "bg-green-500"}`} />
                    <span className="text-sm">Topic Mastery</span>
                  </div>
                  <p className="text-xs text-gray-600">{weakTopics.length > 0 ? `${weakTopics.length} topic(s) need support` : "No weak topics detected"}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center border-l pl-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">Recommended Action</p>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 mb-4">
                Intervention Recommended
              </Badge>
            </div>
            <Button size="lg" className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Send Intervention Nudge
            </Button>
            <p className="text-xs text-gray-500 text-center mt-3">Message is generated from observed performance and timing patterns.</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg">Submission Timeliness Tracker</h3>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">Time gap between submission and due date. Green indicates earlier submissions.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="category" dataKey="assignment" name="Assignment" angle={-45} textAnchor="end" height={90} />
              <YAxis type="number" dataKey="hoursBeforeDeadline" name="Hours Before Deadline" label={{ value: "Hours Before Deadline", angle: -90, position: "insideLeft" }} />
              <RechartsTooltip />
              <Scatter data={submissionData} fill="#3b82f6">
                {submissionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.hoursBeforeDeadline > 24 ? "#10b981" : entry.hoursBeforeDeadline < 1 ? "#ef4444" : "#f59e0b"}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              {submissionData.some((row) => !row.onTime) ? (
                <TrendingDown className="w-4 h-4 text-red-600" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-600" />
              )}
              <span className="text-sm">
                {submissionData.some((row) => !row.onTime) ? "Late submission risk detected" : "Submission behavior is on track"}
              </span>
            </div>
            <Badge variant={submissionData.some((row) => !row.onTime) ? "destructive" : "secondary"}>
              {submissionData.length} tracked
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg">Study Regularity Heatmap</h3>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">Daily intensity derived from student submission activity in the last 4 weeks.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Consistency Score</span>
              <span className={`text-xl ${consistencyScore >= 70 ? "text-green-600" : consistencyScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                {consistencyScore}/100
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Higher score means steadier weekly engagement.</p>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {studyHeatmapData.map((day, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={`aspect-square rounded-sm ${
                        day.intensity === 0
                          ? "bg-gray-100"
                          : day.intensity === 1
                          ? "bg-green-100"
                          : day.intensity === 2
                          ? "bg-green-200"
                          : day.intensity === 3
                          ? "bg-green-400"
                          : day.intensity === 4
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{day.date}</p>
                    <p className="text-xs">{day.intensity === 0 ? "No activity" : `${day.intensity} activity event(s)`}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg">Active vs. Passive Engagement</h3>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">Estimated from student responses and participation signals in submitted work.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={engagementData} cx="50%" cy="50%" labelLine={false} label={({ type, value }) => `${type}: ${value}%`} outerRadius={80} dataKey="value">
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4 pt-4 border-t">
            {engagementData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm">{item.type}</span>
                </div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm">
              <strong>Ratio Insight:</strong> {activePassiveRatio}% active engagement based on current submissions.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg">Effective Time-on-Task</h3>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">Estimated weekly effort based on completion depth of submitted answers.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeOnTaskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="effectiveTime" fill="#10b981" name="Effective Time" />
              <Bar dataKey="rawTime" fill="#94a3b8" name="Raw Time" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              {effectiveTimeChange < 0 ? <TrendingDown className="w-4 h-4 text-red-600" /> : <TrendingUp className="w-4 h-4 text-green-600" />}
              <span className="text-sm">{effectiveTimeChange < 0 ? "Declining" : "Improving"} effective study time</span>
            </div>
            <Badge variant="outline" className={effectiveTimeChange < 0 ? "bg-red-50 text-red-700 border-red-300" : "bg-green-50 text-green-700 border-green-300"}>
              {effectiveTimeChange >= 0 ? `+${effectiveTimeChange}%` : `${effectiveTimeChange}%`}
            </Badge>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg">Metacognition Monitor</h3>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm max-w-xs">Weekly progress-check behavior plus a social engagement centrality estimate.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={gradebookAccessData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis label={{ value: "Access Count", angle: -90, position: "insideLeft" }} />
            <RechartsTooltip />
            <Line type="monotone" dataKey="checks" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Average Weekly Checks</span>
            <span className="text-red-600">{averageWeeklyChecks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Network Centrality</span>
            <span className="text-gray-700">{networkCentrality}</span>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm">
              <strong>Monitoring Insight:</strong> The student averages {averageWeeklyChecks} progress checks per week.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
