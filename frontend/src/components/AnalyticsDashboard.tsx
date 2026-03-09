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
  Legend,
  RadialBarChart,
  RadialBar
} from "recharts";

interface Student {
  id: string;
  name: string;
  risk: string;
  successScore: number;
}

interface AnalyticsDashboardProps {
  student: Student;
}

export function AnalyticsDashboard({ student }: AnalyticsDashboardProps) {
  // Mock data for submission timeliness (last 5 assignments)
  const submissionData = [
    { assignment: "Quiz 1", hoursBeforeDeadline: 48, onTime: true, label: "48h early" },
    { assignment: "Essay 1", hoursBeforeDeadline: 2, onTime: true, label: "2h early" },
    { assignment: "Quiz 2", hoursBeforeDeadline: 0.5, onTime: true, label: "30min early" },
    { assignment: "Lab Report", hoursBeforeDeadline: -2, onTime: false, label: "2h late" },
    { assignment: "Midterm Prep", hoursBeforeDeadline: 72, onTime: true, label: "72h early" },
  ];

  // Mock data for study regularity (last 28 days)
  const studyHeatmapData = Array.from({ length: 28 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - i));
    const intensity = Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0;
    return {
      day: date.getDate(),
      weekday: date.getDay(),
      intensity,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  // Mock data for active vs passive engagement
  const engagementData = [
    { type: "Active", value: 45, label: "Forum Posts, Quizzes, Edits" },
    { type: "Passive", value: 55, label: "Video Views, PDF Downloads" },
  ];
  const COLORS = ['#10b981', '#94a3b8'];

  // Mock data for time-on-task
  const timeOnTaskData = [
    { week: "Week 1", effectiveTime: 8.5, rawTime: 12.3 },
    { week: "Week 2", effectiveTime: 6.2, rawTime: 9.1 },
    { week: "Week 3", effectiveTime: 4.1, rawTime: 7.8 },
    { week: "Week 4", effectiveTime: 5.8, rawTime: 8.5 },
  ];

  // Mock data for social network
  const networkCentrality = 0.35; // 0-1 scale (0.35 = somewhat isolated)

  // Mock data for metacognition
  const gradebookAccessData = [
    { week: "W1", checks: 3 },
    { week: "W2", checks: 2 },
    { week: "W3", checks: 1 },
    { week: "W4", checks: 1 },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 70) return { bg: "bg-green-500", text: "text-green-700", border: "border-green-300" };
    if (score >= 50) return { bg: "bg-yellow-500", text: "text-yellow-700", border: "border-yellow-300" };
    return { bg: "bg-red-500", text: "text-red-700", border: "border-red-300" };
  };

  const riskColors = getRiskColor(student.successScore);

  const consistencyScore = 62; // 0-100 (Low Entropy = High Consistency)
  const activePassiveRatio = 45; // % active

  return (
    <div className="space-y-6">
      {/* Hero Section: Early Warning Risk Profile */}
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
                  <span className={`text-2xl ${riskColors.text}`}>{student.successScore}%</span>
                </div>
                <Progress value={student.successScore} className="h-3" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Academic History</span>
                  </div>
                  <p className="text-xs text-gray-600">Below average GPA (2.8)</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Submission Latency</span>
                  </div>
                  <p className="text-xs text-gray-600">Recent late submissions</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Study Regularity</span>
                  </div>
                  <p className="text-xs text-gray-600">Inconsistent patterns</p>
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
            <p className="text-xs text-gray-500 text-center mt-3">
              Personalized message based on behavioral patterns
            </p>
          </div>
        </div>
      </Card>

      {/* Row 1: Self-Regulation & Time Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Timeliness Tracker */}
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
                  <p className="text-sm max-w-xs">
                    Time gap between submission and deadline. Green = Planning (&gt;24h early), 
                    Red = Procrastination (&lt;1h before deadline)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="category" 
                dataKey="assignment" 
                name="Assignment"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                type="number" 
                dataKey="hoursBeforeDeadline" 
                name="Hours Before Deadline"
                label={{ value: 'Hours Before Deadline', angle: -90, position: 'insideLeft' }}
              />
              <RechartsTooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold">{data.assignment}</p>
                        <p className="text-sm text-gray-600">{data.label}</p>
                        <p className="text-xs mt-1">
                          {data.onTime ? 
                            <span className="text-green-600">On Time</span> : 
                            <span className="text-red-600">Late Submission</span>
                          }
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={submissionData} fill="#3b82f6">
                {submissionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.hoursBeforeDeadline > 24 ? '#10b981' : // Green: >24h early (Planning)
                      entry.hoursBeforeDeadline < 1 ? '#ef4444' : // Red: <1h before (Procrastination)
                      '#f59e0b' // Yellow: Between 1-24h
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm">Increasing procrastination pattern</span>
            </div>
            <Badge variant="destructive">Alert</Badge>
          </div>
        </Card>

        {/* Study Regularity Heatmap */}
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
                  <p className="text-sm max-w-xs">
                    Daily login intensity over the past 4 weeks. Green = Distributed Practice, 
                    Red bursts = Cramming behavior
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Consistency Score</span>
              <span className={`text-xl ${consistencyScore >= 70 ? 'text-green-600' : consistencyScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {consistencyScore}/100
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Low Entropy = High Consistency</p>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {studyHeatmapData.map((day, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger>
                    <div 
                      className={`aspect-square rounded-sm ${
                        day.intensity === 0 ? 'bg-gray-100' :
                        day.intensity === 1 ? 'bg-green-100' :
                        day.intensity === 2 ? 'bg-green-200' :
                        day.intensity === 3 ? 'bg-green-400' :
                        day.intensity === 4 ? 'bg-green-600' :
                        'bg-red-600'
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{day.date}</p>
                    <p className="text-xs">
                      {day.intensity === 0 ? 'No activity' : 
                       day.intensity >= 4 ? 'High intensity (cramming?)' :
                       `${day.intensity} sessions`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
              <span>None</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
              <span>Cramming</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Engagement Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active vs Passive Ratio */}
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
                  <p className="text-sm max-w-xs">
                    Active = Forum Posts, Quizzes, Wiki Edits. 
                    Passive = Video Views, PDF Downloads
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, value }) => `${type}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
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
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm">{item.type}</span>
                </div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm">
              <strong>Ratio Alert:</strong> Only {activePassiveRatio}% active engagement. 
              Recommend more interactive activities.
            </p>
          </div>
        </Card>

        {/* Effective Time-on-Task */}
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
                  <p className="text-sm max-w-xs">
                    Effective Study Time: Raw time filtered for idle sessions &gt;10 mins
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeOnTaskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="effectiveTime" fill="#10b981" name="Effective Time" />
              <Bar dataKey="rawTime" fill="#94a3b8" name="Raw Time" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm">Declining effective study time</span>
            </div>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
              -40% from Week 1
            </Badge>
          </div>
        </Card>
      </div>

      {/* Row 3: Metacognitive */}
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
                <p className="text-sm max-w-xs">
                  How often does the student check their own progress? 
                  Tracks gradebook access frequency.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={gradebookAccessData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis label={{ value: 'Access Count', angle: -90, position: 'insideLeft' }} />
            <RechartsTooltip />
            <Line 
              type="monotone" 
              dataKey="checks" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Average Weekly Checks</span>
            <span className="text-red-600">1.75</span>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm">
              <strong>Low Self-Monitoring:</strong> Declining gradebook access suggests 
              reduced metacognitive awareness. Recommended: Progress check-in prompts.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}