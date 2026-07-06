import { createHealthRecordSchema, updateHealthRecordSchema } from './health.schema';

describe('createHealthRecordSchema (discriminated union)', () => {
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

  it('accepts a valid deworming record', () => {
    const res = createHealthRecordSchema.safeParse({
      recordType: 'deworming',
      recordData: { product: 'Drontal' },
      catId: 1,
      recordedAt: '2026-06-25',
    });
    expect(res.success).toBe(true);
  });

  it('rejects a deworming record missing product', () => {
    const res = createHealthRecordSchema.safeParse({
      recordType: 'deworming',
      recordData: {},
      catId: 1,
      recordedAt: '2026-06-25',
    });
    expect(res.success).toBe(false);
  });

  it('accepts a valid vet_visit record', () => {
    const res = createHealthRecordSchema.safeParse({
      recordType: 'vet_visit',
      recordData: { reason: 'Annual checkup' },
      catId: 1,
      recordedAt: '2026-06-25',
    });
    expect(res.success).toBe(true);
  });

  it('rejects a vet_visit record missing reason', () => {
    const res = createHealthRecordSchema.safeParse({
      recordType: 'vet_visit',
      recordData: {},
      catId: 1,
      recordedAt: '2026-06-25',
    });
    expect(res.success).toBe(false);
  });

  it('accepts a valid note record', () => {
    const res = createHealthRecordSchema.safeParse({
      recordType: 'note',
      recordData: { text: 'Eating well today' },
      catId: 1,
      recordedAt: '2026-06-25',
    });
    expect(res.success).toBe(true);
  });

  it('rejects a note record missing text', () => {
    const res = createHealthRecordSchema.safeParse({
      recordType: 'note',
      recordData: {},
      catId: 1,
      recordedAt: '2026-06-25',
    });
    expect(res.success).toBe(false);
  });
});

describe('updateHealthRecordSchema', () => {
  it('accepts a partial update with recordData only', () => {
    const res = updateHealthRecordSchema.safeParse({
      recordData: { weightGrams: 4500 },
    });
    expect(res.success).toBe(true);
  });

  it('accepts a partial update with recordedAt only', () => {
    const res = updateHealthRecordSchema.safeParse({
      recordedAt: '2026-07-01',
    });
    expect(res.success).toBe(true);
  });

  it('accepts a partial update with nextDueDate', () => {
    const res = updateHealthRecordSchema.safeParse({
      nextDueDate: '2026-08-01',
    });
    expect(res.success).toBe(true);
  });

  it('accepts null nextDueDate (clearing the due date)', () => {
    const res = updateHealthRecordSchema.safeParse({
      nextDueDate: null,
    });
    expect(res.success).toBe(true);
  });

  it('accepts an empty object (no-op update)', () => {
    const res = updateHealthRecordSchema.safeParse({});
    expect(res.success).toBe(true);
  });
});
