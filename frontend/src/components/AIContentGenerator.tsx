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

  const mockGeneratedQuestions: GeneratedQuestion[] = [
    {
      id: "1",
      question: "Solve for x: 2x² + 5x - 3 = 0",
      difficulty: "medium",
      answer: "x = 0.5 or x = -3",
      explanation: "Use the quadratic formula: x = (-b ± √(b²-4ac)) / 2a"
    },
    {
      id: "2",
      question: "A rectangle has a length that is 3 units more than twice its width. If the perimeter is 36 units, find the dimensions.",
      difficulty: "hard",
      answer: "Width = 5 units, Length = 13 units",
      explanation: "Set up equations: L = 2W + 3 and 2(L + W) = 36, then solve the system"
    },
    {
      id: "3",
      question: "Simplify: (x + 3)² - (x - 2)²",
      difficulty: "easy",
      answer: "10x + 5",
      explanation: "Expand both squares and combine like terms"
    },
    {
      id: "4",
      question: "If f(x) = x² - 4x + 3, find the vertex of the parabola.",
      difficulty: "medium",
      answer: "(2, -1)",
      explanation: "Use vertex formula: x = -b/2a, then substitute to find y"
    },
    {
      id: "5",
      question: "Factor completely: 3x² - 12x + 12",
      difficulty: "easy",
      answer: "3(x - 2)²",
      explanation: "Factor out the GCF first, then recognize the perfect square trinomial"
    }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedContent(mockGeneratedQuestions);
      setIsGenerating(false);
    }, 1500);
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
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
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
              <Button size="sm">
                <Send className="w-4 h-4 mr-2" />
                Send to Review Queue
              </Button>
            </div>
          </div>

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
                      className="min-h-[80px]"
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
