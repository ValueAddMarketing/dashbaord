# Supabase Edge Functions

These edge functions handle AI-powered features securely by proxying requests to the Anthropic API.

## Functions

### analyze-transcript
Analyzes meeting transcripts using Claude AI to extract:
- Meeting summary and title
- Participants and topics
- Key points and action items
- Client sentiment and risk level
- Important notes to flag

### live-call-help
Provides real-time AI assistance during customer calls.

### ingest-fathom
Polls the Fathom Notetaker API for recent meeting recordings, matches them to clients via email domain mapping, runs AI analysis, and saves to the `meeting_notes` table.

**Trigger modes:**
- **Manual**: Called from the dashboard's "Sync Now" button
- **Cron**: Can be set up with an external scheduler to poll periodically
- **Webhook**: Called by the `fathom-webhook` function when a real-time webhook fires

### fathom-webhook
Receives webhook notifications (from Make.com, Zapier, or direct) when a Fathom meeting finishes processing. Validates the payload, fetches the full transcript if needed, and delegates to `ingest-fathom` for processing.

## Deployment

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link your project
```bash
supabase link --project-ref ecmhhonjazfbletyvncw
```

### 4. Set secrets
```bash
supabase secrets set ANTHROPIC_API_KEY=your-api-key-here
supabase secrets set FATHOM_API_KEY=your-fathom-api-key
supabase secrets set FATHOM_WEBHOOK_SECRET=your-webhook-secret  # optional
```

### 5. Deploy the functions
```bash
supabase functions deploy analyze-transcript
supabase functions deploy live-call-help
supabase functions deploy ingest-fathom
supabase functions deploy fathom-webhook
```

### 6. Run the database migration
```bash
supabase db push
```
Or apply the migration manually from `supabase/migrations/20260227_add_fathom_integration.sql`.

## Fathom Integration Setup

1. **Get a Fathom API key** from your Fathom account settings
2. **Set the secret**: `supabase secrets set FATHOM_API_KEY=your_key`
3. **Add domain mappings** in the dashboard under Fathom Settings (Notes & Activity tab)
4. **Click "Sync Now"** to import meetings, or set up a webhook for real-time imports

### Webhook Setup (optional, for real-time)
Point your Make.com/Zapier webhook to:
```
https://ecmhhonjazfbletyvncw.supabase.co/functions/v1/fathom-webhook
```
Include the header `x-webhook-secret: your_secret` if you set a webhook secret.

## Testing locally

```bash
supabase start
supabase functions serve analyze-transcript --env-file .env.local
```

Create a `.env.local` file with:
```
ANTHROPIC_API_KEY=your-api-key-here
FATHOM_API_KEY=your-fathom-api-key
```

## Usage

The frontend automatically calls these functions via `supabase.functions.invoke()`.
