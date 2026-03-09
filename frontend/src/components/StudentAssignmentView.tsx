import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, ArrowLeft, Send, Clock, Sparkles } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: "multiple-choice" | "short-answer" | "free-response";
  options?: string[];
  correctAnswer?: string;
  userAnswer?: string;
  isSubmitted: boolean;
  isCorrect?: boolean;
  feedback?: string;
  hint?: string;
}

export function StudentAssignmentView() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      question: "Solve for x: 2x² + 5x - 3 = 0",
      type: "short-answer",
      correctAnswer: "x = 0.5 or x = -3",
      userAnswer: "",
      isSubmitted: false,
      hint: "Try using the quadratic formula: x = (-b ± √(b²-4ac)) / 2a",
      feedback: ""
    },
    {
      id: "2",
      question: "Which of the following is the correct vertex form of a quadratic equation?",
      type: "multiple-choice",
      options: [
        "y = ax² + bx + c",
        "y = a(x - h)² + k",
        "y = a(x + h)² + k",
        "y = (x - h)(x - k)"
      ],
      correctAnswer: "y = a(x - h)² + k",
      userAnswer: "",
      isSubmitted: false,
      hint: "The vertex form shows the vertex (h, k) of the parabola.",
      feedback: ""
    },
    {
      id: "3",
      question: "A rectangle has a length that is 3 units more than twice its width. If the perimeter is 36 units, find the dimensions. Show your work.",
      type: "free-response",
      correctAnswer: "Width = 5 units, Length = 13 units",
      userAnswer: "",
      isSubmitted: false,
      hint: "Let w = width. Then length = 2w + 3. Use the perimeter formula: 2(length + width) = 36",
      feedback: ""
    }
  ]);

  const currentQ = questions[currentQuestion];
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => q.userAnswer).length;

  const handleAnswerChange = (value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestion].userAnswer = value;
    setQuestions(updatedQuestions);
  };

  const handleCheckAnswer = () => {
    const updatedQuestions = [...questions];
    const current = updatedQuestions[currentQuestion];
    current.isSubmitted = true;

    if (current.type === "multiple-choice" || current.type === "short-answer") {
      const isCorrect = current.userAnswer?.toLowerCase().trim() === current.correctAnswer?.toLowerCase().trim();
      current.isCorrect = isCorrect;

      if (isCorrect) {
        current.feedback = "Excellent work! Your answer is correct. ✓";
      } else {
        if (current.type === "multiple-choice") {
          current.feedback = `Not quite. The correct answer is: ${current.correctAnswer}. Review the vertex form properties and try to understand why this is the correct format.`;
        } else {
          current.feedback = `Not quite right. The correct answer is: ${current.correctAnswer}. Remember to use the quadratic formula and check both solutions.`;
        }
      }
    } else {
      // Free response - simulate AI feedback
      current.feedback = "Great effort! Your setup is correct. You identified that width = 5 and length = 13. Make sure to show your work step-by-step: setting up the equation 2((2w+3) + w) = 36, then solving for w. This helps you catch any errors!";
      current.isCorrect = true;
    }

    setQuestions(updatedQuestions);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowHint(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowHint(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl mb-1">Quadratic Equations Practice</h2>
            <p className="text-gray-600 text-sm">Personalized for Emma Chen • Math Grade 9A</p>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            Personalized Assignment
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span>{answeredQuestions} of {totalQuestions} questions answered</span>
          </div>
          <Progress value={(answeredQuestions / totalQuestions) * 100} className="h-2" />
        </div>
      </Card>

      {/* Question Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                index === currentQuestion
                  ? "bg-blue-600 text-white"
                  : q.userAnswer
                  ? "bg-green-100 text-green-800 border-2 border-green-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>15 minutes remaining</span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline">Question {currentQuestion + 1} of {totalQuestions}</Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              {currentQ.type === "multiple-choice" ? "Multiple Choice" : currentQ.type === "short-answer" ? "Short Answer" : "Free Response"}
            </Badge>
          </div>
          <h3 className="text-xl mb-6">{currentQ.question}</h3>

          {/* Answer Input */}
          {currentQ.type === "multiple-choice" && (
            <RadioGroup value={currentQ.userAnswer} onValueChange={handleAnswerChange} disabled={currentQ.isSubmitted}>
              <div className="space-y-3">
                {currentQ.options?.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                      currentQ.userAnswer === option
                        ? currentQ.isSubmitted
                          ? currentQ.isCorrect
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {currentQ.isSubmitted && option === currentQ.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {currentQ.isSubmitted && option === currentQ.userAnswer && !currentQ.isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {currentQ.type === "short-answer" && (
            <Input
              value={currentQ.userAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Enter your answer"
              disabled={currentQ.isSubmitted}
              className={`text-lg p-6 ${
                currentQ.isSubmitted
                  ? currentQ.isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                  : ""
              }`}
            />
          )}

          {currentQ.type === "free-response" && (
            <Textarea
              value={currentQ.userAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Show your work here..."
              disabled={currentQ.isSubmitted}
              className={`min-h-[150px] text-lg ${
                currentQ.isSubmitted ? "border-blue-500 bg-blue-50" : ""
              }`}
            />
          )}
        </div>

        {/* Feedback */}
        {currentQ.isSubmitted && currentQ.feedback && (
          <>
            <Card className={`p-4 mb-4 ${currentQ.isCorrect ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}>
              <div className="flex items-start gap-3">
                {currentQ.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <p className={currentQ.isCorrect ? "text-green-900" : "text-blue-900"}>
                    {currentQ.feedback}
                  </p>
                </div>
              </div>
            </Card>
            
            {/* Efficiency Callout */}
            {!currentQ.isCorrect && (
              <Card className="p-3 mb-4 bg-purple-50 border-purple-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-900">
                    <strong>Learn instantly</strong> — No waiting for marking. Get immediate explanations to understand concepts right away.
                  </div>
                </div>
              </Card>
            )}

            {/* Show Another Similar Question */}
            {!currentQ.isCorrect && (
              <div className="mb-4">
                <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-300 hover:bg-blue-50">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Show me another similar question
                </Button>
              </div>
            )}
          </>
        )}

        {/* Hint */}
        {!currentQ.isSubmitted && (
          <div className="mb-6">
            {!showHint ? (
              <Button variant="outline" onClick={() => setShowHint(true)} size="sm">
                <Lightbulb className="w-4 h-4 mr-2" />
                Need a hint?
              </Button>
            ) : (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm mb-1">Hint:</p>
                    <p className="text-sm text-gray-700">{currentQ.hint}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!currentQ.isSubmitted ? (
              <Button onClick={handleCheckAnswer} disabled={!currentQ.userAnswer}>
                Check Answer
              </Button>
            ) : currentQuestion < totalQuestions - 1 ? (
              <Button onClick={handleNextQuestion}>
                Next Question
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4 mr-2" />
                Submit Assignment
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Help Card */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="mb-2">Remember</h4>
            <p className="text-sm text-gray-600">
              You can check your answer after each question to get instant feedback. This helps you learn from your mistakes right away!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}