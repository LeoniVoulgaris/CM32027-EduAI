import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { AlertTriangle, TrendingUp, Users, BookOpen, Clock, CheckCircle2, ChevronDown, Edit } from "lucide-react";
import { getClassAnalytics } from "../lib/api";

interface ClassOverview {
  className: string;
  totalStudents: number;
  averageScore: number;
  trend: "up" | "down" | "stable";
  atRiskStudents: number;
}

interface QuickStat {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: "positive" | "negative" | "neutral";
}

interface StudentAlert {
  name: string;
  class: string;
  label: "needs-support" | "needs-attention" | "on-track";
  reasons: string[];
  metrics: {
    testScores?: string;
    homeworkCompletion?: string;
    attendance?: string;
    engagement?: string;
  };
}

export function TeacherDashboard() {
  const [classes, setClasses] = useState<ClassOverview[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([
    { label: "Total Students", value: "—", icon: <Users className="w-5 h-5" />, trend: "neutral" },
    { label: "Pending Reviews", value: "—", icon: <Clock className="w-5 h-5" />, trend: "neutral" },
    { label: "Assignments Due", value: "—", icon: <BookOpen className="w-5 h-5" />, trend: "neutral" },
    { label: "Completed This Week", value: "—", icon: <CheckCircle2 className="w-5 h-5" />, trend: "positive" },
  ]);
  const [studentAlerts, setStudentAlerts] = useState<StudentAlert[]>([]);

  useEffect(() => {
    getClassAnalytics()
      .then(data => {
        if (data.classes) setClasses(data.classes);
        if (data.quickStats) {
          const qs = data.quickStats;
          setQuickStats(prev => [
            { ...prev[0], value: qs.totalStudents ?? prev[0].value },
            { ...prev[1], value: qs.pendingReviews ?? prev[1].value },
            { ...prev[2], value: qs.assignmentsDue ?? prev[2].value },
            { ...prev[3], value: qs.completedThisWeek ?? prev[3].value },
          ]);
        }
        if (data.studentAlerts) setStudentAlerts(data.studentAlerts);
      })
      .catch(() => {});
  }, []);

  const getSupportLabelBadge = (label: "needs-support" | "needs-attention" | "on-track") => {
    const config = {
      "needs-support": { color: "bg-amber-100 text-amber-800 border-amber-300", text: "Needs Support" },
      "needs-attention": { color: "bg-blue-100 text-blue-800 border-blue-300", text: "Needs Attention" },
      "on-track": { color: "bg-gray-100 text-gray-700 border-gray-300", text: "On Track" }
    };
    return <Badge variant="outline" className={config[label].color}>{config[label].text}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl">{stat.value}</p>
              </div>
              <div className="text-blue-600">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Predictive Alerts - Softer, More Transparent */}
      <Card className="p-6 border-l-4 border-l-blue-500 bg-blue-50">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg mb-2">Students Who May Need Support</h3>
            <p className="text-sm text-gray-600 mb-4">
              Early indicators based on performance patterns • Labels are suggestions you can override
            </p>
            <div className="space-y-3">
              {studentAlerts.map((alert, index) => (
                <Card key={index} className="bg-white p-4 border border-blue-200">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span>{alert.name}</span>
                            {getSupportLabelBadge(alert.label)}
                          </div>
                          <p className="text-sm text-gray-500">{alert.class}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-gray-600">
                        <Edit className="w-3 h-3 mr-1" />
                        Override Label
                      </Button>
                    </div>

                    <Collapsible>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <span className="text-sm text-gray-700">Why this label?</span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                          <div>
                            <p className="text-sm mb-2">
                              <strong className="text-gray-900">Indicators:</strong>
                            </p>
                            <ul className="text-sm text-gray-700 space-y-1 ml-4">
                              {alert.reasons.map((reason, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-blue-600">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="text-sm mb-2">
                              <strong className="text-gray-900">Performance Metrics:</strong>
                            </p>
                            <div className="text-sm text-gray-700 space-y-1 ml-4">
                              {alert.metrics.testScores && (
                                <p>• Test scores: {alert.metrics.testScores}</p>
                              )}
                              {alert.metrics.homeworkCompletion && (
                                <p>• Homework completion: {alert.metrics.homeworkCompletion}</p>
                              )}
                              {alert.metrics.attendance && (
                                <p>• Attendance: {alert.metrics.attendance}</p>
                              )}
                              {alert.metrics.engagement && (
                                <p>• Engagement: {alert.metrics.engagement}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Student Profile</Button>
                      <Button size="sm">Generate Support Materials</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Class Overview */}
      <div>
        <h3 className="text-xl mb-4">Your Classes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classItem, index) => (
            <Card key={index} className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="text-lg">{classItem.className}</h4>
                  {classItem.trend === "up" && (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Students</span>
                    <span>{classItem.totalStudents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average Score</span>
                    <span className={classItem.trend === "up" ? "text-green-600" : classItem.trend === "down" ? "text-red-600" : ""}>
                      {classItem.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">May Need Support</span>
                    <Badge variant={classItem.atRiskStudents > 3 ? "outline" : "outline"} className={classItem.atRiskStudents > 3 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}>
                      {classItem.atRiskStudents}
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600 mb-2">Topic Weak Points:</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">Quadratic Equations</Badge>
                    <Badge variant="secondary" className="text-xs">Word Problems</Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}