import { useEffect, useMemo, useState } from 'react';
import { BookOpen, FileText, Calendar, Settings, Bell, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { getAssignments } from '../lib/api';

interface LMSSimulatorProps {
  platform: 'canvas' | 'moodle' | 'classroom';
}

export function LMSSimulator({ platform }: LMSSimulatorProps) {
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    getAssignments()
      .then((data) => {
        if (!mounted) return;
        setAssignments(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setAssignments([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const getPlatformStyles = () => {
    switch (platform) {
      case 'canvas':
        return {
          primary: 'bg-red-600',
          secondary: 'bg-red-50',
          text: 'text-red-600',
          name: 'Canvas LMS',
        };
      case 'moodle':
        return {
          primary: 'bg-orange-600',
          secondary: 'bg-orange-50',
          text: 'text-orange-600',
          name: 'Moodle',
        };
      default:
        return {
          primary: 'bg-blue-600',
          secondary: 'bg-blue-50',
          text: 'text-blue-600',
          name: 'Google Classroom',
        };
    }
  };

  const styles = getPlatformStyles();

  const visibleAssignments = useMemo(() => assignments.slice(0, 4), [assignments]);
  const upcoming = useMemo(() => assignments.filter((item) => item.dueDate).slice(0, 3), [assignments]);

  return (
    <div className="space-y-4">
      {platform !== 'moodle' && (
        <div className="bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm mb-2">
                <strong className="text-indigo-900">Seamless LMS Integration</strong>
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                EduAI runs directly in your {styles.name} workspace and mirrors your live assignment data.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-600">Integrated with:</span>
                <Badge variant="outline" className="bg-white">
                  Canvas LMS
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Moodle
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Google Classroom
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={platform === 'moodle' ? 'fixed inset-0 z-0' : 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'}>
        {platform === 'moodle' ? (
          <div className="relative w-full min-h-150 bg-orange-50 flex items-center justify-center rounded-lg border border-orange-200">
            <div className="text-center">
              <div className="text-5xl mb-4">🎓</div>
              <p className="text-orange-700">Moodle LMS Interface</p>
              <p className="text-sm text-orange-500 mt-1">EduAI overlay is active.</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`${styles.primary} text-white p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm opacity-90">{styles.name}</div>
                  <div className="text-xs opacity-75">{visibleAssignments[0]?.class || 'Class Workspace'}</div>
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

            <div className={`${styles.secondary} border-b border-gray-200 px-4 py-2 flex gap-4`}>
              <button className={`px-3 py-2 text-sm ${styles.text} bg-white rounded shadow-sm`}>Home</button>
              <button className="px-3 py-2 text-sm text-gray-600 hover:bg-white rounded transition-colors">Assignments</button>
              <button className="px-3 py-2 text-sm text-gray-600 hover:bg-white rounded transition-colors">Grades</button>
            </div>

            <div className="p-6 space-y-4">
              {visibleAssignments.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-500">No assignment data available.</div>
              )}

              {visibleAssignments.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    {item.status === 'draft' ? (
                      <FileText className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Calendar className="w-5 h-5 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm mb-1">{item.title}</div>
                      <div className="text-xs text-gray-500">Due: {item.dueDate || 'Not set'} • Status: {item.status}</div>
                    </div>
                    <button className={`px-3 py-1 text-xs ${styles.text} ${styles.secondary} rounded`}>Open</button>
                  </div>
                </div>
              ))}

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-700 mb-3">Upcoming</div>
                <div className="space-y-2 text-xs">
                  {upcoming.length === 0 && <div className="text-gray-500">No upcoming due dates.</div>}
                  {upcoming.map((item) => (
                    <div key={`upcoming-${item.id}`} className="flex justify-between">
                      <span className="text-gray-600 truncate pr-4">{item.title}</span>
                      <span className="text-gray-900">{item.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
