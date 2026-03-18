import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Sparkles, Edit3, Send, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { createAssignment, generateContent } from "../lib/api";

interface GeneratedQuestion {
  id: string;
  question: string;
  difficulty: "easy" | "medium" | "hard";
  answer: string;
  explanation: string;
}

export function AIContentGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("mixed");
  const [numQuestions, setNumQuestions] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [publishMessage, setPublishMessage] = useState("");

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setError("");
    setPublishMessage("");
    try {
      const data = await generateContent(topic, difficulty, parseInt(numQuestions));
      setGeneratedContent(data.questions || []);
    } catch (err: any) {
      setError(err.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishAssignment = async () => {
    if (!topic || generatedContent.length === 0) return;
    setError("");
    setPublishMessage("");
    try {
      const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const payload = {
        title: `${topic} Practice Set`,
        due_date: due,
        status: "published",
        ai_generated: true,
        lms_platform: "google",
        questions: generatedContent.map((q) => ({
          question: q.question,
          difficulty: q.difficulty,
          answer: q.answer,
          explanation: q.explanation,
          question_type: "short-answer",
        })),
      };
      const created = await createAssignment(payload as any);
      setPublishMessage(`Published assignment: ${created.title}`);
    } catch (err: any) {
      setError(err.message || "Failed to publish assignment");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 border-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "hard": return "bg-red-100 text-red-800 border-red-300";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-linear-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl">AI Content Generator</h2>
          <Badge className="ml-2 bg-blue-600">Beta</Badge>
        </div>
        <p className="text-gray-600 mb-6">
          Generate personalized learning materials instantly. All content can be reviewed and edited before sharing with students.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="topic">Topic or Learning Objective</Label>
            <Input
              id="topic"
              placeholder="e.g., Quadratic Equations, Fractions, Photosynthesis"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="mixed">Mixed (Differentiated)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="numQuestions">Number of Questions</Label>
            <Select value={numQuestions} onValueChange={setNumQuestions}>
              <SelectTrigger id="numQuestions" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 questions</SelectItem>
                <SelectItem value="10">10 questions</SelectItem>
                <SelectItem value="15">15 questions</SelectItem>
                <SelectItem value="20">20 questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="contentType">Content Type</Label>
            <Select defaultValue="questions">
              <SelectTrigger id="contentType" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="questions">Practice Questions</SelectItem>
                <SelectItem value="slides">Lesson Slides</SelectItem>
                <SelectItem value="feedback">Feedback Statements</SelectItem>
                <SelectItem value="worksheet">Worksheet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !topic}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </Card>

      {generatedContent.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl mb-1">Generated Content</h3>
              <p className="text-sm text-gray-600">
                <Badge variant="outline" className="mr-2 bg-purple-100 text-purple-800">AI-Generated</Badge>
                Review and edit before publishing to students
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate All
              </Button>
              <Button size="sm" onClick={handlePublishAssignment}>
                <Send className="w-4 h-4 mr-2" />
                Publish Assignment
              </Button>
            </div>
          </div>
          {publishMessage && <p className="text-sm text-green-700 mb-4">{publishMessage}</p>}

          <div className="space-y-4">
            {generatedContent.map((item) => (
              <Card key={item.id} className="p-4 border-l-4 border-l-purple-500">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                    {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {editingId === item.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={item.question}
                      className="min-h-20"
                    />
                    <div className="flex gap-2">
                      <Button size="sm">Save Changes</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-900">{item.question}</p>
                    <Tabs defaultValue="answer" className="mt-3">
                      <TabsList>
                        <TabsTrigger value="answer">Answer</TabsTrigger>
                        <TabsTrigger value="explanation">Explanation</TabsTrigger>
                      </TabsList>
                      <TabsContent value="answer" className="mt-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm">{item.answer}</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="explanation" className="mt-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{item.explanation}</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
