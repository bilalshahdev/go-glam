
import { useState, useEffect } from 'react';
import { useTryOnSession } from '@/hooks/useTryOnSession';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save, History, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SessionManagerProps {
  onLoadSession?: (sessionData: any) => void;
}

export const SessionManager = ({ onLoadSession }: SessionManagerProps) => {
  const { sessions, loading, saveSession, loadSessions, loadSession } = useTryOnSession();
  const [sessionName, setSessionName] = useState('');
  const [showSessions, setShowSessions] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSaveSession = async () => {
    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }
    await saveSession(sessionName);
    setSessionName('');
  };

  const handleLoadSession = async (sessionId: string) => {
    await loadSession(sessionId);
    setShowSessions(false);
    if (onLoadSession) {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        onLoadSession({
          makeup: session.makeup_look,
          hairStyle: session.hair_style,
          hairColor: session.hair_color,
        });
      }
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Save className="w-5 h-5" />
        Session Manager
      </h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Session name..."
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleSaveSession}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>

        <Button
          onClick={() => setShowSessions(!showSessions)}
          variant="outline"
          className="w-full"
        >
          <History className="w-4 h-4 mr-2" />
          {showSessions ? 'Hide' : 'Show'} Saved Sessions ({sessions.length})
        </Button>

        {showSessions && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No saved sessions yet
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{session.session_name}</p>
                    <p className="text-xs text-gray-500">
                      {session.makeup_look && `Makeup: ${session.makeup_look}`}
                      {session.hair_style && ` • Style: ${session.hair_style}`}
                      {session.hair_color && ` • Color: ${session.hair_color}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleLoadSession(session.id!)}
                    className="ml-2"
                  >
                    Load
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
