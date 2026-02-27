import { useState } from 'react';
import { Card, Button, Badge } from '../../components';

/**
 * Manage email domain → client name mappings for Fathom auto-matching.
 * Also shows setup instructions for connecting Fathom.
 */
export const FathomSettings = ({
  domainMappings,
  onAddMapping,
  onRemoveMapping,
  loading,
  clients,
}) => {
  const [newDomain, setNewDomain] = useState('');
  const [newClient, setNewClient] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newDomain.trim() || !newClient.trim()) return;
    setAdding(true);
    const result = await onAddMapping(newDomain, newClient);
    if (result) {
      setNewDomain('');
      setNewClient('');
    }
    setAdding(false);
  };

  // Get unique client names for the dropdown
  const clientNames = clients
    ? [...new Set(clients.map(c => c.client).filter(Boolean))].sort()
    : [];

  return (
    <Card>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-lg font-semibold text-white">Fathom Settings</h3>
        <span className="text-slate-400 text-sm">
          {showSettings ? 'Hide' : 'Show'} ({domainMappings.length} mappings)
        </span>
      </button>

      {showSettings && (
        <div className="mt-4 space-y-4">
          {/* Setup Instructions */}
          <div className="p-4 bg-dark-800 rounded-xl">
            <h4 className="text-sm font-semibold text-brand-cyan mb-2">Setup Instructions</h4>
            <ol className="space-y-2 text-sm text-slate-400">
              <li>
                <span className="text-brand-purple font-medium">1.</span> Get your Fathom API key from your Fathom account settings
              </li>
              <li>
                <span className="text-brand-purple font-medium">2.</span> Add it to Supabase:{' '}
                <code className="bg-dark-700 px-2 py-0.5 rounded text-xs text-brand-cyan">
                  supabase secrets set FATHOM_API_KEY=your_key
                </code>
              </li>
              <li>
                <span className="text-brand-purple font-medium">3.</span> Add domain mappings below so meetings auto-match to clients
              </li>
              <li>
                <span className="text-brand-purple font-medium">4.</span> Click "Sync Now" above to import meetings, or set up a cron/webhook for automation
              </li>
            </ol>
          </div>

          {/* Webhook Setup */}
          <div className="p-4 bg-dark-800 rounded-xl">
            <h4 className="text-sm font-semibold text-brand-cyan mb-2">Webhook (Real-time)</h4>
            <p className="text-sm text-slate-400 mb-2">
              For automatic imports when meetings end, set up a Make.com or Zapier webhook pointing to:
            </p>
            <code className="block bg-dark-700 p-2 rounded text-xs text-brand-cyan break-all">
              https://ecmhhonjazfbletyvncw.supabase.co/functions/v1/fathom-webhook
            </code>
            <p className="text-xs text-slate-500 mt-2">
              Optional: Set a webhook secret via{' '}
              <code className="bg-dark-700 px-1 py-0.5 rounded text-brand-cyan">
                supabase secrets set FATHOM_WEBHOOK_SECRET=your_secret
              </code>
              {' '}and include it as an <code className="bg-dark-700 px-1 py-0.5 rounded text-brand-cyan">x-webhook-secret</code> header.
            </p>
          </div>

          {/* Domain Mappings */}
          <div>
            <h4 className="text-sm font-semibold text-brand-cyan mb-3">
              Email Domain Mappings
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Map client email domains (e.g. "acmecorp.com") or specific emails to client names.
              When Fathom records a meeting with matching invitees, it auto-assigns to that client.
            </p>

            {/* Add New Mapping */}
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                placeholder="Email domain (e.g. acmecorp.com)"
                className="flex-1 min-w-[200px] bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500"
              />
              {clientNames.length > 0 ? (
                <select
                  value={newClient}
                  onChange={e => setNewClient(e.target.value)}
                  className="flex-1 min-w-[200px] bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">Select client...</option>
                  {clientNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newClient}
                  onChange={e => setNewClient(e.target.value)}
                  placeholder="Client name (exact match)"
                  className="flex-1 min-w-[200px] bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500"
                />
              )}
              <Button
                onClick={handleAdd}
                disabled={!newDomain.trim() || !newClient.trim() || adding}
                loading={adding}
                size="sm"
              >
                Add Mapping
              </Button>
            </div>

            {/* Existing Mappings */}
            {loading ? (
              <div className="text-sm text-slate-500 text-center py-3">Loading mappings...</div>
            ) : domainMappings.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4 bg-dark-800 rounded-lg">
                No domain mappings yet. Add one above to enable auto-matching.
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar">
                {domainMappings.map(mapping => (
                  <div
                    key={mapping.id}
                    className="flex items-center justify-between p-3 bg-dark-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="text-xs font-mono">
                        {mapping.domain}
                      </Badge>
                      <span className="text-slate-500 text-xs">&rarr;</span>
                      <Badge variant="purple" className="text-xs">
                        {mapping.client_name}
                      </Badge>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Remove mapping ${mapping.domain} → ${mapping.client_name}?`)) {
                          onRemoveMapping(mapping.id);
                        }
                      }}
                      className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FathomSettings;
