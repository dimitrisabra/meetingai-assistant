export interface MeetingSummaryInput {
  title: string;
  transcript: string;
  participants?: string[];
  durationMinutes?: string;
  category?: string;
}

interface GeminiResponsePart {
  text?: string;
}

interface GeminiResponseCandidate {
  content?: {
    parts?: GeminiResponsePart[];
  };
}

interface GeminiErrorResponse {
  error?: {
    message?: string;
  };
  promptFeedback?: {
    blockReason?: string;
  };
}

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';

export function getGeminiSummaryModel(): string {
  return import.meta.env.VITE_GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function hasGeminiApiKey(): boolean {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());
}

function buildMeetingSummaryPrompt({
  title,
  transcript,
  participants = [],
  durationMinutes,
  category,
}: MeetingSummaryInput): string {
  const normalizedParticipants = participants.length > 0 ? participants.join(', ') : 'Not provided';
  const normalizedDuration = durationMinutes?.trim() ? `${durationMinutes.trim()} minutes` : 'Not provided';
  const normalizedCategory = category?.trim() || 'General';

  return [
    'Summarize the meeting transcript below for a busy team.',
    'Write clear plain text with these exact sections:',
    'Summary:',
    'Key decisions:',
    'Action items:',
    'Risks / follow-ups:',
    'Use short bullet points under each section.',
    "If the transcript does not support a section, write '- None noted.'",
    'Do not invent facts.',
    '',
    `Title: ${title.trim()}`,
    `Category: ${normalizedCategory}`,
    `Duration: ${normalizedDuration}`,
    `Participants: ${normalizedParticipants}`,
    '',
    'Transcript:',
    transcript.trim(),
  ].join('\n');
}

export function extractGeminiText(payload: { candidates?: GeminiResponseCandidate[] } & GeminiErrorResponse): string {
  const text = payload.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text?.trim())
    .filter((part): part is string => Boolean(part))
    .join('\n')
    .trim();

  if (text) {
    return text;
  }

  if (payload.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked the request: ${payload.promptFeedback.blockReason}`);
  }

  throw new Error('Gemini returned an empty summary.');
}

export async function summarizeMeetingWithGemini(input: MeetingSummaryInput): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env.local file.');
  }

  const response = await fetch(`${GEMINI_API_ROOT}/${getGeminiSummaryModel()}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildMeetingSummaryPrompt(input) }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { candidates?: GeminiResponseCandidate[] } & GeminiErrorResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini request failed with status ${response.status}.`);
  }

  return extractGeminiText(payload);
}
