import { useState } from 'react';
import { X, MessageCircle, AlertTriangle, TrendingUp, Brain, CheckCircle, Clock, Send, ChevronRight, BarChart3, Users, Sparkles, Shield, HelpCircle, Lightbulb, AlertCircle } from 'lucide-react';

interface LMSOverlayProps {
  role: 'student' | 'teacher';
}

export function LMSOverlay({ role }: LMSOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'practice' | 'alerts' | 'insights'>('chat');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: role === 'student' 
        ? "Hi! I'm your private learning assistant. Your teacher cannot see our conversation. I'm here to help you understand concepts, not to give you answers. What would you like to work on?" 
        : "Hi! I'm here to help you understand your coursework. What would you like to work on today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const studentAlerts = [
    { id: 1, student: 'Emma Wilson', issue: 'Missed 2 consecutive assignments', risk: 'high', course: 'Mathematics' },
    { id: 2, student: 'Lucas Martinez', issue: 'Performance declining in last 3 weeks', risk: 'medium', course: 'Physics' },
    { id: 3, student: 'Sophia Chen', issue: 'Requested help on Chapter 5', risk: 'low', course: 'Chemistry' }
  ];

  const practiceTopics = [
    { id: 1, topic: 'Polynomials', questions: 15, mastery: 42, lastStudied: 14, priority: 'high' },
    { id: 2, topic: 'Quadratic Equations', questions: 12, mastery: 67, lastStudied: 6, priority: 'medium' },
    { id: 3, topic: 'Linear Functions', questions: 8, mastery: 85, lastStudied: 2, priority: 'low' },
    { id: 4, topic: 'Exponents and Radicals', questions: 10, mastery: 55, lastStudied: 21, priority: 'high' },
    { id: 5, topic: 'Functions and Relations', questions: 14, mastery: 72, lastStudied: 9, priority: 'medium' }
  ];

  const getTimeAgoText = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 14) return '1 week ago';
    if (days < 21) return '2 weeks ago';
    if (days < 30) return '3 weeks ago';
    return 'Over a month ago';
  };

  const getPriorityBadge = (priority: string, days: number) => {
    if (priority === 'high' || days >= 14) {
      return { text: 'Review Now', color: 'bg-red-100 text-red-700 border-red-200' };
    } else if (priority === 'medium' || days >= 7) {
      return { text: 'Review Soon', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    }
    return { text: 'Optional', color: 'bg-gray-100 text-gray-600 border-gray-200' };
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'user' as const,
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        sender: 'ai' as const,
        text: "I understand you need help with that topic. Let me break it down for you...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        title="AI Learning Assistant - Works directly in your LMS"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Brain className="w-6 h-6 group-hover:scale-110 transition-transform" />
            {role === 'teacher' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
                3
              </div>
            )}
          </>
        )}
      </button>

      {/* Tooltip */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl z-40 text-sm max-w-xs animate-fade-in">
          <p className="mb-1">✨ AI Assistant</p>
          <p className="text-xs text-gray-300">No new tab needed • Works inside your LMS</p>
          <div className="absolute bottom-0 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900 transform translate-y-full"></div>
        </div>
      )}

      {/* Overlay Panel */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <div>
                <div className="text-sm opacity-90">AI Learning Assistant</div>
                <div className="text-xs opacity-75">{role === 'teacher' ? 'Teacher View' : 'Student View'}</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Integration Badge */}
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-blue-600" />
                <span className="text-blue-900">Seamlessly integrated • Uses your existing login</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {role === 'student' ? (
              <>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-4 py-3 text-sm transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
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
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
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

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {/* Student Chat View */}
            {role === 'student' && activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                {/* Privacy Notice */}
                <div className="p-3 bg-purple-50 border-b border-purple-200">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-purple-900">
                      <strong>Private & Confidential</strong> — Your teacher cannot see this chat. 
                      I'm here to help you learn, not to give you answers.
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-gray-200'
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

                {/* Quick Actions */}
                <div className="p-3 bg-white border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Quick Actions</div>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs hover:bg-purple-100 transition-colors flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Show simpler explanation
                    </button>
                    <button className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      Give me a hint
                    </button>
                    <button className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs hover:bg-green-100 transition-colors">
                      Practice questions
                    </button>
                  </div>
                </div>

                {/* Input Area */}
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

            {/* Student Practice View */}
            {role === 'student' && activeTab === 'practice' && (
              <div className="p-4 space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span className="text-sm">Active Recall Practice</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Topics are prioritized based on when you last studied them. Reviewing older material helps strengthen long-term memory.
                  </p>
                </div>

                {practiceTopics.map((topic) => {
                  const badge = getPriorityBadge(topic.priority, topic.lastStudied);
                  return (
                    <div
                      key={topic.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-sm">{topic.topic}</div>
                            <span className={`text-xs px-2 py-0.5 rounded border ${badge.color}`}>
                              {badge.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Last studied {getTimeAgoText(topic.lastStudied)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                      
                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Your Mastery</span>
                          <span className={topic.mastery >= 70 ? 'text-green-600' : topic.mastery >= 50 ? 'text-yellow-600' : 'text-red-600'}>
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
                        <div className="text-xs text-gray-500">{topic.questions} questions available</div>
                      </div>
                    </div>
                  );
                })}

                <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  View All Topics
                </button>
              </div>
            )}

            {/* Teacher Alerts View */}
            {role === 'teacher' && activeTab === 'alerts' && (
              <div className="p-4 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-amber-900">3 students need attention</div>
                    <div className="text-xs text-amber-700 mt-1">
                      Early warning system has flagged students based on recent performance
                    </div>
                  </div>
                </div>

                {studentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(alert.risk)} flex-shrink-0 mt-1.5`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm mb-1">{alert.student}</div>
                        <div className="text-xs text-gray-600 mb-2">{alert.course}</div>
                        <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 inline-block">
                          {alert.issue}
                        </div>
                      </div>
                      <button className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                ))}

                <button className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  View All Alerts
                </button>
              </div>
            )}

            {/* Teacher Insights View */}
            {role === 'teacher' && activeTab === 'insights' && (
              <div className="p-4 space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">Class Overview</span>
                    </div>
                    <span className="text-xs text-gray-500">Last 7 days</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded p-3">
                      <div className="text-2xl text-blue-600 mb-1">94%</div>
                      <div className="text-xs text-gray-600">Avg. Completion</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-2xl text-green-600 mb-1">87%</div>
                      <div className="text-xs text-gray-600">Avg. Score</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm">Engagement Trends</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">AI Assistant Usage</span>
                      <span className="text-green-600">↑ 23%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Practice Questions</span>
                      <span className="text-green-600">↑ 18%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Time on Task</span>
                      <span className="text-red-600">↓ 5%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Recent AI Actions</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 pb-2 border-b border-gray-100">
                      <Clock className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-gray-900">Generated 24 practice questions</div>
                        <div className="text-gray-500">For Quadratic Equations • 2h ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 pb-2 border-b border-gray-100">
                      <Clock className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-gray-900">Identified 3 struggling students</div>
                        <div className="text-gray-500">Early warning system • 4h ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-gray-900">Provided 156 explanations</div>
                        <div className="text-gray-500">To 12 students • Today</div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Open Full Dashboard
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <button className="w-full text-xs text-center text-indigo-600 hover:text-indigo-700 transition-colors">
              Open Full Platform →
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
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