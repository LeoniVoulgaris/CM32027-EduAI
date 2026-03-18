import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { CheckCircle2, XCircle, Edit3, Eye, History, Sparkles, AlertTriangle, ChevronDown, Users, CheckSquare } from "lucide-react";
import { getReviewItems, approveReviewItem, rejectReviewItem } from "../lib/api";

interface ReviewItem {
  id: string;
  type: "question" | "feedback" | "lesson" | "worksheet";
  content: string;
  context: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected" | "edited";
  originalContent?: string;
  teacherEdits?: string;
  riskLevel?: "low" | "medium" | "high";
  riskReasons?: string[];
}

export function ReviewQueue() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editedContent, setEditedContent] = useState<{ [key: string]: string }>({});
  const [quickEditMode, setQuickEditMode] = useState<{ [key: string]: boolean }>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);

  const approvedCount = reviewItems.filter(item => item.status === "approved" || item.status === "edited").length;
  const rejectedCount = reviewItems.filter(item => item.status === "rejected").length;
  const editedCount = reviewItems.filter(item => !!item.teacherEdits).length;
  const decidedCount = approvedCount + rejectedCount;
  const approvalRate = decidedCount > 0 ? Math.round((approvedCount / decidedCount) * 100) : 0;
  const editRate = approvedCount > 0 ? Math.round((editedCount / approvedCount) * 100) : 0;
  const rejectionRate = decidedCount > 0 ? Math.round((rejectedCount / decidedCount) * 100) : 0;

  useEffect(() => {
    getReviewItems()
      .then(data => setReviewItems(data))
      .catch(() => {});
  }, []);

  // Sort items: high risk first, then medium, then low
  const sortedPendingItems = reviewItems
    .filter(item => item.status === "pending")
    .sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      return riskOrder[a.riskLevel || "low"] - riskOrder[b.riskLevel || "low"];
    });

  const handleApprove = async (id: string) => {
    const edits = editedContent[id] || null;
    await approveReviewItem(id, edits).catch(() => {});
    setReviewItems(prev => prev.map(i => i.id === id ? { ...i, status: "approved" } : i));
  };

  const handleReject = async (id: string) => {
    await rejectReviewItem(id).catch(() => {});
    setReviewItems(prev => prev.map(i => i.id === id ? { ...i, status: "rejected" } : i));
  };

  const handleEdit = (id: string) => {
    setEditMode({ ...editMode, [id]: true });
    const item = reviewItems.find(i => i.id === id);
    if (item) {
      setEditedContent({ ...editedContent, [id]: item.content });
    }
  };

  const handleSaveEdit = (id: string) => {
    setEditMode({ ...editMode, [id]: false });
    setQuickEditMode({ ...quickEditMode, [id]: false });
    handleApprove(id);
  };

  const handleQuickEdit = (id: string) => {
    setQuickEditMode({ ...quickEditMode, [id]: !quickEditMode[id] });
    const item = reviewItems.find(i => i.id === id);
    if (item && !editedContent[id]) {
      setEditedContent({ ...editedContent, [id]: item.content });
    }
  };

  const handleBulkApprove = () => {
    selectedItems.forEach(id => handleApprove(id));
    setSelectedItems([]);
    console.log("Bulk approved:", selectedItems);
  };

  const handleBulkReject = () => {
    selectedItems.forEach(id => handleReject(id));
    setSelectedItems([]);
    console.log("Bulk rejected:", selectedItems);
  };

  const handleBulkEdit = () => {
    selectedItems.forEach(id => handleQuickEdit(id));
    console.log("Bulk edit mode enabled for:", selectedItems);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === sortedPendingItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(sortedPendingItems.map(item => item.id));
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      question: "bg-blue-100 text-blue-800 border-blue-300",
      feedback: "bg-green-100 text-green-800 border-green-300",
      lesson: "bg-purple-100 text-purple-800 border-purple-300",
      worksheet: "bg-orange-100 text-orange-800 border-orange-300"
    };
    return <Badge variant="outline" className={colors[type as keyof typeof colors]}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>;
  };

  const getRiskIndicator = (level: "low" | "medium" | "high") => {
    const config = {
      high: { color: "bg-amber-100 text-amber-800 border-amber-300", label: "Needs Review", icon: AlertTriangle },
      medium: { color: "bg-blue-100 text-blue-800 border-blue-300", label: "Check Recommended", icon: Eye },
      low: { color: "bg-gray-100 text-gray-600 border-gray-300", label: "Ready", icon: CheckCircle2 }
    };
    const { color, label, icon: Icon } = config[level];
    return (
      <Badge variant="outline" className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Human-in-the-Loop Review Queue</h2>
        <p className="text-gray-600">Review and approve AI-generated content before it reaches students</p>
      </div>

      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-4">
          <Eye className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg mb-2">Teacher Control & Transparency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-purple-200">
                <p className="text-purple-800 mb-1">✓ You approve everything</p>
                <p className="text-gray-600">No AI content goes to students without your explicit approval</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-200">
                <p className="text-purple-800 mb-1">✓ Full edit control</p>
                <p className="text-gray-600">Modify any AI suggestion to match your teaching style</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-200">
                <p className="text-purple-800 mb-1">✓ Clear audit trail</p>
                <p className="text-gray-600">Always see what was AI-generated vs. teacher-created</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review
            <Badge className="ml-2 bg-yellow-600">{sortedPendingItems.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {/* Bulk Actions Bar */}
          {sortedPendingItems.length > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedItems.length === sortedPendingItems.length}
                    onCheckedChange={handleSelectAll}
                    id="select-all"
                  />
                  <label htmlFor="select-all" className="text-sm cursor-pointer">
                    Select All ({sortedPendingItems.length} items)
                  </label>
                  {selectedItems.length > 0 && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {selectedItems.length} selected
                    </Badge>
                  )}
                </div>
                {selectedItems.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkEdit}
                      className="text-blue-600"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Selected
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkReject}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject Selected
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleBulkApprove}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve Selected
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {sortedPendingItems.map((item) => (
            <Card key={item.id} className={`p-5 border-l-4 ${
              item.riskLevel === "high"
                ? "border-l-amber-500 bg-amber-50/30"
                : item.riskLevel === "medium"
                ? "border-l-blue-500"
                : "border-l-purple-500"
            }`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleSelectItem(item.id)}
                    />
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    {getTypeBadge(item.type)}
                    {item.riskLevel && getRiskIndicator(item.riskLevel)}
                    <span className="text-sm text-gray-500">{item.createdAt}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickEdit(item.id)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      {quickEditMode[item.id] ? "Cancel Edit" : "Quick Edit"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(item.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-2">Context: {item.context}</p>
                </div>

                {/* Possible Issues Indicator */}
                {item.riskLevel && item.riskLevel !== "low" && item.riskReasons && item.riskReasons.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="w-full">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="text-sm text-amber-900">Possible Issues Detected</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-amber-600" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="bg-white border border-amber-200 rounded-lg p-3">
                        <ul className="text-sm text-gray-700 space-y-1">
                          {item.riskReasons.map((reason, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-amber-600">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Quick Edit Mode - Inline */}
                {quickEditMode[item.id] ? (
                  <div className="space-y-3">
                    <Input
                      value={editedContent[item.id] || item.content}
                      onChange={(e) => setEditedContent({ ...editedContent, [item.id]: e.target.value })}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(item.id)}>
                        Save & Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setQuickEditMode({ ...quickEditMode, [item.id]: false })}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : editMode[item.id] ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editedContent[item.id] || item.content}
                      onChange={(e) => setEditedContent({ ...editedContent, [item.id]: e.target.value })}
                      className="min-h-[120px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(item.id)}>
                        Save Changes & Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditMode({ ...editMode, [item.id]: false })}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-900">{item.content}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <History className="w-3 h-3" />
                    <span>Generated by AI • You can edit, approve, or reject</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Share with Department
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {sortedPendingItems.length === 0 && (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl mb-2">All caught up!</h3>
              <p className="text-gray-600">No pending items to review</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {reviewItems.filter(item => item.status === "approved").map((item) => (
            <Card key={item.id} className="p-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    {getTypeBadge(item.type)}
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>
                    <span className="text-sm text-gray-500">{item.createdAt}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Share with Department
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Context: {item.context}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-900">{item.content}</p>
                </div>

                {item.teacherEdits && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 mb-1">✏️ Teacher-edited</p>
                    <p className="text-sm text-gray-600">You modified this content before approval</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg mb-4">Review History</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Approved {approvedCount} items</span>
                </div>
                <span className="text-sm text-gray-500">{approvalRate}% approval rate</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Edited {editedCount} items before approval</span>
                </div>
                <span className="text-sm text-gray-500">{editRate}% edit rate</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Rejected {rejectedCount} items</span>
                </div>
                <span className="text-sm text-gray-500">{rejectionRate}% rejection rate</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}