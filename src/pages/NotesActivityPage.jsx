import { Card } from '../components';
import { QuickNotes, NotesHistory } from '../features/notes';
import { MeetingTranscript, MeetingHistory, FathomSyncStatus, FathomSettings } from '../features/meetings';
import { useNotes, useMeetings, useActivities, useFathomSync } from '../hooks';
import { getDisplayName } from '../utils/formatters';

/**
 * Combined Notes, Meetings & Activity page
 */
export const NotesActivityPage = ({ client, clients }) => {
  const clientName = client?.client;

  const {
    notes,
    addNote,
    updateNote,
    removeNote,
    refreshNotes
  } = useNotes(clientName);

  const {
    meetings,
    analyzing,
    saving,
    analysis,
    error: meetingError,
    processTranscript,
    saveMeeting,
    removeMeeting,
    clearError: clearMeetingError,
    refreshMeetings
  } = useMeetings(clientName);

  const { activities } = useActivities(clientName);

  const {
    syncLog,
    domainMappings,
    syncing,
    stats,
    lastSyncResult,
    error: fathomError,
    runSync,
    addMapping,
    removeMapping,
    loadingMappings,
    clearError: clearFathomError,
  } = useFathomSync();

  if (!client) {
    return (
      <Card className="p-12 text-center text-slate-500">
        Select a client to view notes and activity
      </Card>
    );
  }

  const handleSaveMeeting = async (meetingData) => {
    const result = await saveMeeting(meetingData, addNote);
    if (result) {
      refreshNotes();
    }
    return result;
  };

  const handleFathomSync = async (createdAfter) => {
    const result = await runSync(createdAfter);
    if (result) {
      // Refresh meetings and notes after sync to pick up new imports
      refreshMeetings();
      refreshNotes();
    }
    return result;
  };

  return (
    <div className="space-y-6">
      {/* Fathom Auto-Sync */}
      <FathomSyncStatus
        syncLog={syncLog}
        stats={stats}
        syncing={syncing}
        lastSyncResult={lastSyncResult}
        error={fathomError}
        onSync={handleFathomSync}
        onClearError={clearFathomError}
      />

      {/* Fathom Settings (collapsible) */}
      <FathomSettings
        domainMappings={domainMappings}
        onAddMapping={addMapping}
        onRemoveMapping={removeMapping}
        loading={loadingMappings}
        clients={clients}
      />

      {/* Quick Notes */}
      <QuickNotes onAddNote={(text) => addNote(text)} />

      {/* Notes History */}
      <NotesHistory
        notes={notes}
        onUpdate={updateNote}
        onDelete={removeNote}
      />

      {/* Meeting Transcript */}
      <MeetingTranscript
        onAnalyze={processTranscript}
        onSave={handleSaveMeeting}
        analyzing={analyzing}
        saving={saving}
        analysis={analysis}
        error={meetingError}
        onClearError={clearMeetingError}
      />

      {/* Meeting History */}
      <MeetingHistory
        meetings={meetings}
        onDelete={removeMeeting}
      />

      {/* Activity Log */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Activity Log</h3>
        {activities.length === 0 ? (
          <div className="text-slate-500 text-center py-4">No activity yet</div>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar">
            {activities.map(a => (
              <div key={a.id} className="p-3 bg-dark-800 rounded-lg flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-purple font-medium text-sm">
                      {getDisplayName(a.user_email)}
                    </span>
                    <span className="text-slate-600 text-xs">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-400 text-sm">{a.action}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotesActivityPage;
