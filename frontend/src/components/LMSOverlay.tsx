import { useEffect, useMemo, useState } from 'react';
import {
  X,
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  Brain,
  CheckCircle,
  Clock,
  Send,
  ChevronRight,
  BarChart3,
  Users,
  Sparkles,
  Shield,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { getClassAnalytics, getMyProgress } from '../lib/api';

interface LMSOverlayProps {
  role: 'student' | 'teacher';
}

interface ChatMessage {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface AlertItem {
  id: number;
  student: string;
  issue: string;
  risk: 'high' | 'medium' | 'low';
  course: string;
}

interface PracticeTopic {
  id: number;
  topic: string;
  mastery: number;
  priority: 'high' | 'medium' | 'low';
}

export function LMSOverlay({ role }: LMSOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'practice' | 'alerts' | 'insights'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text:
        role === 'student'
          ? "Hi! I'm your private learning assistant. Your teacher cannot see this conversation."
          : "Hi! I'm your assistant. I can summarize live class analytics and student risk signals.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [classData, setClassData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        if (role === 'teacher') {
          const data = await getClassAnalytics();
          if (mounted) setClassData(data);
          return;
        }
        const data = await getMyProgress();
        if (mounted) setProgressData(data);
      } catch {
        if (!mounted) return;
        setClassData(null);
        setProgressData(null);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [role]);

  const studentAlerts = useMemo(() => {
    const alerts = Array.isArray(classData?.studentAlerts) ? classData.studentAlerts : [];
    return alerts.map((alert: any, idx: number): AlertItem => ({
      id: idx + 1,
      student: alert.name,
      issue: Array.isArray(alert.reasons) && alert.reasons.length > 0 ? alert.reasons[0] : 'Needs review',
      risk: alert.label === 'needs-support' ? 'high' : alert.label === 'needs-attention' ? 'medium' : 'low',
      course: alert.class || 'Course',
    }));
  }, [classData]);

  const practiceTopics = useMemo(() => {
    const topics = Array.isArray(progressData?.topicMastery) ? progressData.topicMastery : [];
    return topics.map((topic: any, idx: number): PracticeTopic => ({
      id: idx + 1,
      topic: topic.topic,
      mastery: Number(topic.mastery || 0),
      priority: Number(topic.mastery || 0) < 50 ? 'high' : Number(topic.mastery || 0) < 70 ? 'medium' : 'low',
    }));
  }, [progressData]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
    };

    const aiMessage: ChatMessage = {
      id: messages.length + 2,
      sender: 'ai',
      text: 'I can provide conceptual guidance here. For assignment-specific grading feedback, use the assignment view.',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInputMessage('');
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-amber-500';
      case 'medium':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const quickStats = classData?.quickStats || {};
  const classes = Array.isArray(classData?.classes) ? classData.classes : [];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-linear-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        title="AI Learning Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Brain className="w-6 h-6 group-hover:scale-110 transition-transform" />
            {role === 'teacher' && studentAlerts.length > 0 && (
              <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full flex items-center justify-center text-xs">
                {studentAlerts.length}
              </div>
            )}
          </>
        )}
      </button>

      {!isOpen && (
        <div className="fixed bottom-24 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl z-40 text-sm max-w-xs animate-fade-in">
          <p className="mb-1">AI Assistant</p>
          <p className="text-xs text-gray-300">Works inside your LMS</p>
          <div className="absolute bottom-0 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900 transform translate-y-full"></div>
        </div>
      )}

      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <div>
                <div className="text-sm opacity-90">AI Learning Assistant</div>
                <div className="text-xs opacity-75">{role === 'teacher' ? 'Teacher View' : 'Student View'}</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
            <div className="flex items-center gap-2 text-xs text-blue-900">
              <CheckCircle className="w-3 h-3 text-blue-600" />
              <span>Integrated with your LMS account</span>
            </div>
          </div>

          <div className="flex border-b border-gray-200 bg-gray-50">
            {role === 'student' ? (
              <>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-4 py-3 text-sm transition-colors ${
                    activeTab === 'chat' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('practice')}
                  className={`flex-1 px-4 py-3 text-sm transition-colors ${
                    activeTab === 'practice'
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Brain className="w-4 h-4 inline mr-2" />
                  Practice
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`flex-1 px-4 py-3 text-sm transition-colors relative ${
                    activeTab === 'alerts'
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Alerts
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`flex-1 px-4 py-3 text-sm transition-colors ${
                    activeTab === 'insights'
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Insights
                </button>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50">
            {role === 'student' && activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="p-3 bg-purple-50 border-b border-purple-200">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-purple-900">
                      <strong>Private</strong> — teachers do not see this chat thread.
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'
                        }`}
                      >
                        {message.sender === 'ai' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-gray-500">AI Assistant</span>
                          </div>
                        )}
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-white border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Quick Actions</div>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs hover:bg-purple-100 transition-colors flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Simpler explanation
                    </button>
                    <button className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      Give me a hint
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask a question..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {role === 'student' && activeTab === 'practice' && (
              <div className="p-4 space-y-4">
                <div className="bg-linear-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span className="text-sm">Practice Topics</span>
                  </div>
                  <p className="text-xs text-gray-600">Topics are loaded from your current progress data.</p>
                </div>

                {practiceTopics.length === 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm text-gray-500">
                    No topic mastery data is available yet.
                  </div>
                )}

                {practiceTopics.map((topic: PracticeTopic) => (
                  <div key={topic.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm">{topic.topic}</div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded border ${
                              topic.priority === 'high'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : topic.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                  : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            {topic.priority === 'high' ? 'Review Now' : topic.priority === 'medium' ? 'Review Soon' : 'On Track'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    </div>

                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Your Mastery</span>
                        <span
                          className={
                            topic.mastery >= 70 ? 'text-green-600' : topic.mastery >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }
                        >
                          {topic.mastery}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            topic.mastery >= 70 ? 'bg-green-500' : topic.mastery >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${topic.mastery}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {role === 'teacher' && activeTab === 'alerts' && (
              <div className="p-4 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-amber-900">{studentAlerts.length} students need attention</div>
                    <div className="text-xs text-amber-700 mt-1">Alerts are sourced from current class analytics.</div>
                  </div>
                </div>

                {studentAlerts.length === 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm text-gray-500">No active alerts.</div>
                )}

                {studentAlerts.map((alert: AlertItem) => (
                  <div key={alert.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(alert.risk)} shrink-0 mt-1.5`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm mb-1">{alert.student}</div>
                        <div className="text-xs text-gray-600 mb-2">{alert.course}</div>
                        <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 inline-block">{alert.issue}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {role === 'teacher' && activeTab === 'insights' && (
              <div className="p-4 space-y-4">
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">Class Overview</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded p-3">
                      <div className="text-2xl text-blue-600 mb-1">{quickStats.totalStudents || 0}</div>
                      <div className="text-xs text-gray-600">Students</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-2xl text-green-600 mb-1">{quickStats.completedThisWeek || 0}</div>
                      <div className="text-xs text-gray-600">Submissions</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm">Engagement Signals</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Pending Reviews</span>
                      <span className="text-gray-900">{quickStats.pendingReviews || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Assignments Due</span>
                      <span className="text-gray-900">{quickStats.assignmentsDue || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Classes</span>
                      <span className="text-gray-900">{classes.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Class Performance</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {classes.length === 0 && <div className="text-gray-500">No classes found.</div>}
                    {classes.map((course: any) => (
                      <div key={course.className} className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-700">{course.className}</span>
                        <span className="text-gray-900">{Math.round(course.averageScore || 0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <button className="w-full text-xs text-center text-indigo-600 hover:text-indigo-700 transition-colors">
              Open Full Platform →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
