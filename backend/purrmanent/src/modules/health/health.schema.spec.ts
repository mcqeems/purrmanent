import { createHealthRecordSchema } from './health.schema';

describe('createHealthRecordSchema (discriminated union, spec §2.5)', () => {
  it('rejects a weight record missing weightGrams', () => {
    const res = createHealthRecordSchema.safeParse({
      recordType: 'weight',
      recordData: {},
      catId: 1,
      recordedAt: '2026-06-25',
    });
    expect(res.success).toBe(false);
  });

  it('accepts a valid weight record', () => {
    const res = createHealthRecordSchema.safeParse({
      recordType: 'weight',
      recordData: { weightGrams: 4200 },
      catId: 1,
      recordedAt: '2026-06-25',
      nextDueDate: '2026-07-25',
    });
    expect(res.success).toBe(true);
  });

  it('accepts a vaccination record and rejects an unknown type', () => {
    expect(
      createHealthRecordSchema.safeParse({
        recordType: 'vaccination',
        recordData: { vaccineName: 'FVRCP' },
        catId: 1,
        recordedAt: '2026-06-25',
      }).success,
    ).toBe(true);
    expect(
      createHealthRecordSchema.safeParse({
        recordType: 'haircut',
        recordData: {},
        catId: 1,
        recordedAt: '2026-06-25',
      }).success,
    ).toBe(false);
  });
});
