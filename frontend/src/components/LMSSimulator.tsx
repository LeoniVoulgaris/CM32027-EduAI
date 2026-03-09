import { BookOpen, FileText, Calendar, Users, Settings, Bell, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';


interface LMSSimulatorProps {
  platform: 'canvas' | 'moodle' | 'classroom';
}

export function LMSSimulator({ platform }: LMSSimulatorProps) {
  const getPlatformStyles = () => {
    switch (platform) {
      case 'canvas':
        return {
          primary: 'bg-red-600',
          secondary: 'bg-red-50',
          text: 'text-red-600',
          name: 'Canvas LMS'
        };
      case 'moodle':
        return {
          primary: 'bg-orange-600',
          secondary: 'bg-orange-50',
          text: 'text-orange-600',
          name: 'Moodle'
        };
      case 'classroom':
        return {
          primary: 'bg-blue-600',
          secondary: 'bg-blue-50',
          text: 'text-blue-600',
          name: 'Google Classroom'
        };
    }
  };

  const styles = getPlatformStyles();

  return (
    <div className="space-y-4">
      {/* Integration Notice - Hidden for Moodle */}
      {platform !== 'moodle' && (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm mb-2">
              <strong className="text-indigo-900">Seamless LMS Integration</strong>
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              EduAI works directly within your existing {styles.name} environment. No new tabs, no context switching — just click the AI assistant button to access all features.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-600">Integrated with:</span>
              <Badge variant="outline" className="bg-white">Canvas LMS</Badge>
              <Badge variant="outline" className="bg-white">Moodle</Badge>
              <Badge variant="outline" className="bg-white">Google Classroom</Badge>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className={platform === 'moodle' ? 'fixed inset-0 z-0' : 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'}>
        {platform === 'moodle' ? (
          // Moodle placeholder
          <div className="relative w-full min-h-[600px] bg-orange-50 flex items-center justify-center rounded-lg border border-orange-200">
            <div className="text-center">
              <div className="text-5xl mb-4">🎓</div>
              <p className="text-orange-700 font-medium">Moodle LMS Interface</p>
              <p className="text-sm text-orange-500 mt-1">EduAI overlay is active — see the button below</p>
            </div>
          </div>
        ) : (
          <>
        {/* LMS Header */}
        <div className={`${styles.primary} text-white p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm opacity-90">{styles.name}</div>
              <div className="text-xs opacity-75">Mathematics - Grade 10</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LMS Navigation */}
        <div className={`${styles.secondary} border-b border-gray-200 px-4 py-2 flex gap-4`}>
          <button className={`px-3 py-2 text-sm ${styles.text} bg-white rounded shadow-sm`}>
            Home
          </button>
          <button className="px-3 py-2 text-sm text-gray-600 hover:bg-white rounded transition-colors">
            Assignments
          </button>
          <button className="px-3 py-2 text-sm text-gray-600 hover:bg-white rounded transition-colors">
            Grades
          </button>
          <button className="px-3 py-2 text-sm text-gray-600 hover:bg-white rounded transition-colors">
            People
          </button>
        </div>

        {/* LMS Content */}
        <div className="p-6 space-y-4">
          {/* Announcement */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-blue-900 mb-1">New Assignment Posted</div>
                <div className="text-xs text-blue-700">
                  Chapter 5: Quadratic Equations - Due Friday, December 6
                </div>
              </div>
            </div>
          </div>

          {/* Course Modules */}
          <div className="space-y-3">
            <div className="text-sm text-gray-500">Course Content</div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm mb-1">Chapter 5: Quadratic Equations</div>
                  <div className="text-xs text-gray-500">Lecture notes and practice problems</div>
                </div>
                <button className={`px-3 py-1 text-xs ${styles.text} ${styles.secondary} rounded`}>
                  View
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm mb-1">Assignment: Solving Quadratic Equations</div>
                  <div className="text-xs text-gray-500">Due Friday, 11:59 PM</div>
                </div>
                <button className={`px-3 py-1 text-xs ${styles.text} ${styles.secondary} rounded`}>
                  Submit
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm mb-1">Quiz: Linear Functions Review</div>
                  <div className="text-xs text-gray-500">Available until December 10</div>
                </div>
                <button className={`px-3 py-1 text-xs ${styles.text} ${styles.secondary} rounded`}>
                  Start
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm mb-1">Discussion: Real-world Applications</div>
                  <div className="text-xs text-gray-500">3 new replies</div>
                </div>
                <button className={`px-3 py-1 text-xs ${styles.text} ${styles.secondary} rounded`}>
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-700 mb-3">Upcoming</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Assignment: Quadratic Equations</span>
                <span className="text-gray-900">Dec 6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quiz: Functions Review</span>
                <span className="text-gray-900">Dec 10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Final Exam</span>
                <span className="text-gray-900">Dec 20</span>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}