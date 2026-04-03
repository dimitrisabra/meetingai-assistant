import { describe, expect, it } from 'vitest';
import { createAllDataSnapshot, createExportEnvelope, formatReportMarkdown } from '@/lib/export';

describe('export utilities', () => {
  it('wraps list exports with metadata', () => {
    expect(
      createExportEnvelope('Tasks', [{ id: 'task-1' }, { id: 'task-2' }], 'Admin', '2026-04-03T10:00:00Z'),
    ).toEqual({
      meta: {
        label: 'Tasks',
        exportedBy: 'Admin',
        exportedAt: '2026-04-03T10:00:00Z',
        recordCount: 2,
      },
      data: [{ id: 'task-1' }, { id: 'task-2' }],
    });
  });

  it('wraps all-data snapshots with collection metadata', () => {
    expect(
      createAllDataSnapshot({ users: [{ id: 'u1' }], tasks: [{ id: 't1' }] }, 'Admin', '2026-04-03T10:00:00Z'),
    ).toEqual({
      meta: {
        exportedBy: 'Admin',
        exportedAt: '2026-04-03T10:00:00Z',
        collectionCount: 2,
      },
      data: {
        users: [{ id: 'u1' }],
        tasks: [{ id: 't1' }],
      },
    });
  });

  it('formats reports as markdown', () => {
    expect(
      formatReportMarkdown({
        id: 'r1',
        title: 'Weekly Report',
        type: 'weekly',
        generatedBy: 'Sarah Chen',
        generatedAt: '2026-04-03T10:00:00Z',
        data: { totalMeetings: 12, avgRating: 4.5 },
      }),
    ).toContain('## Metrics');
  });
});
