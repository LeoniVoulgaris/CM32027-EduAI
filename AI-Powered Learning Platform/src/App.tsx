import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { AIContentGenerator } from "./components/AIContentGenerator";
import { StudentAnalytics } from "./components/StudentAnalytics";
import { AssignmentManager } from "./components/AssignmentManager";
import { ReviewQueue } from "./components/ReviewQueue";
import { StudentDashboard } from "./components/StudentDashboard";
import { StudentAssignmentView } from "./components/StudentAssignmentView";
import { StudentProgress } from "./components/StudentProgress";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { LMSOverlay } from "./components/LMSOverlay";
import { LMSSimulator } from "./components/LMSSimulator";
import { 
  LayoutDashboard, 
  Sparkles, 
  BarChart3, 
  BookOpen, 
  ClipboardCheck,
  Bell,
  Settings,
  User,
  GraduationCap,
  Users,
  TrendingUp,
  Layers
} from "lucide-react";

// Mock student data for analytics
const students = [
  { id: "1", name: "Emma Chen", risk: "needs-support", successScore: 42 },
  { id: "2", name: "Marcus Johnson", risk: "needs-attention", successScore: 67 },
  { id: "3", name: "Sarah Kim", risk: "on-track", successScore: 89 },
  { id: "4", name: "David Park", risk: "needs-attention", successScore: 71 },
  { id: "5", name: "Lisa Wang", risk: "on-track", successScore: 92 },
  { id: "6", name: "Alex Rodriguez", risk: "needs-support", successScore: 38 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userRole, setUserRole] = useState<"teacher" | "student">("teacher");
  const [selectedStudentId, setSelectedStudentId] = useState("1");
  const [viewMode, setViewMode] = useState<"platform" | "lms">("platform");
  const [selectedLMS, setSelectedLMS] = useState<"canvas" | "moodle" | "classroom">("canvas");
  
  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">EduAI Platform</h1>
                <p className="text-xs text-gray-500">
                  {userRole === "teacher" ? "AI-Powered Learning Management" : "Your Personal Learning Journey"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Switcher */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "platform" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("platform")}
                  className="h-8"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Platform
                </Button>
                <Button
                  variant={viewMode === "lms" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("lms")}
                  className="h-8"
                >
                  <Layers className="w-4 h-4 mr-1" />
                  LMS Demo
                </Button>
              </div>

              {/* LMS Selector - Only shown in LMS view */}
              {viewMode === "lms" && (
                <Select value={selectedLMS} onValueChange={(value: any) => setSelectedLMS(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="canvas">Canvas LMS</SelectItem>
                    <SelectItem value="moodle">Moodle</SelectItem>
                    <SelectItem value="classroom">Google Classroom</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Student Selector - Only shown in teacher analytics view */}
              {viewMode === "platform" && userRole === "teacher" && activeTab === "student-analytics" && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          <div className="flex items-center justify-between w-full gap-3">
                            <span>{student.name}</span>
                            <Badge 
                              variant={student.risk === "needs-support" ? "destructive" : "outline"} 
                              className={student.risk === "needs-attention" ? "bg-yellow-50 text-yellow-700" : student.risk === "on-track" ? "bg-green-50 text-green-700" : ""}
                            >
                              {student.successScore}%
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* View Switcher */}
              {viewMode === "platform" && (
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={userRole === "teacher" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setUserRole("teacher");
                      setActiveTab("dashboard");
                    }}
                    className="h-8"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Teacher
                  </Button>
                  <Button
                    variant={userRole === "student" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setUserRole("student");
                      setActiveTab("student-dashboard");
                    }}
                    className="h-8"
                  >
                    <GraduationCap className="w-4 h-4 mr-1" />
                    Student
                  </Button>
                </div>
              )}

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-600 text-xs">
                  {userRole === "teacher" ? "5" : "2"}
                </Badge>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 border-l pl-4">
                <div className={`w-8 h-8 ${userRole === "teacher" ? "bg-blue-600" : "bg-purple-600"} rounded-full flex items-center justify-center`}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p>{userRole === "teacher" ? "Dr. Martinez" : "Emma Chen"}</p>
                  <p className="text-xs text-gray-500">{userRole === "teacher" ? "Teacher" : "Student"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === "lms" ? (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">LMS Integration Demo</h2>
              <p className="text-gray-600">
                This demonstrates how the EduAI overlay integrates seamlessly into existing Learning Management Systems.
                Click the floating AI assistant button in the bottom-right corner to access help and insights.
              </p>
            </div>
            <LMSSimulator platform={selectedLMS} />
            <LMSOverlay role={userRole} />
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {userRole === "teacher" ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-6 w-full mb-8">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="student-analytics" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="class-insights" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Class Insights
                  </TabsTrigger>
                  <TabsTrigger value="ai-generator" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Generator
                  </TabsTrigger>
                  <TabsTrigger value="assignments" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Assignments
                  </TabsTrigger>
                  <TabsTrigger value="review" className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Review Queue
                    <Badge className="bg-yellow-600">12</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <TeacherDashboard />
                </TabsContent>

                <TabsContent value="student-analytics">
                  <div className="mb-6">
                    <h2 className="text-2xl mb-2">Student Performance Analytics Dashboard</h2>
                    <p className="text-gray-600">
                      Early Warning & Predictive Analytics • Evidence-based metrics for intervention planning
                    </p>
                  </div>
                  <AnalyticsDashboard student={selectedStudent} />
                </TabsContent>

                <TabsContent value="class-insights">
                  <StudentAnalytics />
                </TabsContent>

                <TabsContent value="ai-generator">
                  <AIContentGenerator />
                </TabsContent>

                <TabsContent value="assignments">
                  <AssignmentManager />
                </TabsContent>

                <TabsContent value="review">
                  <ReviewQueue />
                </TabsContent>
              </Tabs>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full md:w-2/3 lg:w-1/2 mx-auto mb-8">
                  <TabsTrigger value="student-dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Home
                  </TabsTrigger>
                  <TabsTrigger value="student-assignment" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Assignment
                  </TabsTrigger>
                  <TabsTrigger value="student-progress" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Progress
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="student-dashboard">
                  <StudentDashboard />
                </TabsContent>

                <TabsContent value="student-assignment">
                  <StudentAssignmentView />
                </TabsContent>

                <TabsContent value="student-progress">
                  <StudentProgress />
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            {userRole === "teacher" ? (
              <>
                <div>
                  <h4 className="mb-2">Platform Features</h4>
                  <ul className="space-y-1">
                    <li>✓ LMS Integration (Google Classroom, Canvas, Moodle)</li>
                    <li>✓ Real-time Performance Tracking</li>
                    <li>✓ AI Content Generation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2">Teacher Control</h4>
                  <ul className="space-y-1">
                    <li>✓ Human-in-the-Loop Review</li>
                    <li>✓ Full Edit Control</li>
                    <li>✓ Transparent AI Attribution</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2">Analytics & Insights</h4>
                  <ul className="space-y-1">
                    <li>• Early Warning Risk Profiles</li>
                    <li>• Predictive Student Analytics</li>
                    <li>• Evidence-Based Interventions</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h4 className="mb-2">Your Learning Journey</h4>
                  <ul className="space-y-1">
                    <li>✓ Personalized Practice</li>
                    <li>✓ Real-time Feedback</li>
                    <li>✓ Progress Tracking</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2">Smart Features</h4>
                  <ul className="space-y-1">
                    <li>✓ AI-Powered Recommendations</li>
                    <li>✓ Adaptive Learning Paths</li>
                    <li>✓ Instant Help</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2">Your Success</h4>
                  <ul className="space-y-1">
                    <li>• Teacher-approved content</li>
                    <li>• Safe and private</li>
                    <li>• Always improving</li>
                  </ul>
                </div>
              </>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>EduAI Platform - Empowering {userRole === "teacher" ? "Teachers" : "Students"} with AI • Not a replacement, but an enhancement</p>
          </div>
        </div>
      </footer>
    </div>
  );
}