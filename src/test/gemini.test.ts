import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { extractGeminiText, summarizeMeetingWithGemini } from '@/lib/gemini';

const originalFetch = global.fetch;
const env = import.meta.env as ImportMetaEnv & Record<string, string | undefined>;

describe('gemini meeting summaries', () => {
  beforeEach(() => {
    env.VITE_GEMINI_API_KEY = 'test-key';
    env.VITE_GEMINI_MODEL = 'gemini-2.5-flash-lite';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
    delete env.VITE_GEMINI_API_KEY;
    delete env.VITE_GEMINI_MODEL;
  });

  it('extracts text from Gemini candidates', () => {
    expect(
      extractGeminiText({
        candidates: [
          {
            content: {
              parts: [{ text: 'Summary:\n- Launch confirmed.' }],
            },
          },
        ],
      }),
    ).toBe('Summary:\n- Launch confirmed.');
  });

  it('calls Gemini with the configured model and returns the summary text', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: 'Summary:\n- Launch next Tuesday.' }],
              },
            },
          ],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      summarizeMeetingWithGemini({
        title: 'Launch Readiness',
        transcript: 'Alice confirmed the launch is next Tuesday.',
        participants: ['Alice'],
        durationMinutes: '30',
        category: 'Product',
      }),
    ).resolves.toBe('Summary:\n- Launch next Tuesday.');

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
    );
  });

  it('throws a helpful error when the API key is missing', async () => {
    delete env.VITE_GEMINI_API_KEY;

    await expect(
      summarizeMeetingWithGemini({
        title: 'No Key',
        transcript: 'Testing missing key handling.',
      }),
    ).rejects.toThrow('Gemini API key is missing');
  });
});
