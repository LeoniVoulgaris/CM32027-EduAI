import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Send, RefreshCw, CheckCircle2, Clock, BookOpen, ExternalLink } from "lucide-react";
import { getAssignments } from "../lib/api";

interface Assignment {
  id: string;
  title: string;
  status: "draft" | "pending" | "published" | "synced";
  dueDate: string;
  createdAt?: string | null;
  class: string;
  students: number;
  submissions: number;
  aiGenerated: boolean;
  lmsPlatform: "google" | "canvas" | "moodle";
}

function formatRelativeTime(isoDate?: string | null) {
  if (!isoDate) return "recently";
  const ts = new Date(isoDate).getTime();
  if (Number.isNaN(ts)) return "recently";

  const diffMinutes = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function AssignmentManager() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    getAssignments()
      .then(data => setAssignments(data))
      .catch(() => {});
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "synced":
        return <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Synced to LMS</Badge>;
      case "published":
        return <Badge className="bg-blue-600">Published</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getLMSIcon = (platform: string) => {
    return <ExternalLink className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2">Assignment Manager</h2>
          <p className="text-gray-600">Manage and sync assignments across your LMS platforms</p>
        </div>
        <Button>
          <BookOpen className="w-4 h-4 mr-2" />
          Create New Assignment
        </Button>
      </div>

      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg mb-2">LMS Integration Active</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-white text-gray-900 border border-gray-300">
                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='%234285F4'%3E%3Cpath d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='%2334A853'/%3E%3Cpath d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='%23FBBC05'/%3E%3Cpath d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='%23EA4335'/%3E%3C/svg%3E" alt="Google Classroom" className="w-4 h-4 mr-1" />
                  Google Classroom
                </Badge>
                <span className="text-sm text-gray-600">3 classes synced</span>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Sync Now
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Bi-directional sync enabled: Grades and submissions will update automatically
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg">{assignment.title}</h3>
                    {assignment.aiGenerated && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                        AI-Generated
                      </Badge>
                    )}
                    {getStatusBadge(assignment.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{assignment.class}</span>
                    <span>•</span>
                    <span>Due: {assignment.dueDate}</span>
                    <span>•</span>
                    <span>{assignment.submissions}/{assignment.students} submitted</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {assignment.status === "pending" && (
                    <>
                      <Button variant="outline" size="sm">Review Content</Button>
                      <Button size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Approve & Send to LMS
                      </Button>
                    </>
                  )}
                  {assignment.status === "synced" && (
                    <Button variant="outline" size="sm">
                      {getLMSIcon(assignment.lmsPlatform)}
                      <span className="ml-2">View in Google Classroom</span>
                    </Button>
                  )}
                  {assignment.status === "draft" && (
                    <Button size="sm">Continue Editing</Button>
                  )}
                </div>
              </div>

              {assignment.status === "synced" && (
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">Last synced: {formatRelativeTime(assignment.createdAt)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Grades and feedback sync automatically
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch id={`auto-grade-${assignment.id}`} defaultChecked />
                        <Label htmlFor={`auto-grade-${assignment.id}`} className="text-sm">Auto-grade</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id={`auto-feedback-${assignment.id}`} defaultChecked />
                        <Label htmlFor={`auto-feedback-${assignment.id}`} className="text-sm">AI Feedback</Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {assignments.filter(a => a.status === "pending").map((assignment) => (
            <Card key={assignment.id} className="p-5 border-l-4 border-l-yellow-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg">{assignment.title}</h3>
                    {assignment.aiGenerated && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                        AI-Generated
                      </Badge>
                    )}
                    {getStatusBadge(assignment.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{assignment.class}</span>
                    <span>•</span>
                    <span>Due: {assignment.dueDate}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Review Content</Button>
                  <Button size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Approve & Send to LMS
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="published" className="space-y-4 mt-6">
          {assignments.filter(a => a.status === "synced" || a.status === "published").map((assignment) => (
            <Card key={assignment.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg">{assignment.title}</h3>
                    {getStatusBadge(assignment.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{assignment.class}</span>
                    <span>•</span>
                    <span>Due: {assignment.dueDate}</span>
                    <span>•</span>
                    <span>{assignment.submissions}/{assignment.students} submitted</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {getLMSIcon(assignment.lmsPlatform)}
                  <span className="ml-2">View in Google Classroom</span>
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
