'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Field,
  Input,
  SelectField,
} from '@/components/ui';
import type { HealthRecordType } from '@/lib/types/api';
import { HEALTH_RECORD_TYPES } from '@/lib/validation/schemas';
import { useCreateRecord } from './hooks';

// Mirrors the backend per-type required field (createHealthRecordSchema superRefine).
const FIELD: Record<
  HealthRecordType,
  { key: string; label: string; numeric?: boolean }
> = {
  vaccination: { key: 'vaccineName', label: 'Vaccine name' },
  deworming: { key: 'product', label: 'Product' },
  vet_visit: { key: 'reason', label: 'Reason' },
  weight: { key: 'weightGrams', label: 'Weight (grams)', numeric: true },
  note: { key: 'text', label: 'Note' },
};

const today = () => new Date().toISOString().slice(0, 10);

export function RecordForm({ catId }: { catId: number }) {
  const create = useCreateRecord(catId);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<HealthRecordType>('vaccination');
  const [detail, setDetail] = useState('');
  const [recordedAt, setRecordedAt] = useState(today());
  const [nextDueDate, setNextDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const meta = FIELD[type];

  async function submit() {
    setError(null);
    if (!detail.trim()) {
      setError(`${meta.label} is required.`);
      return;
    }
    const recordData: Record<string, unknown> = {
      [meta.key]: meta.numeric ? Number(detail) : detail.trim(),
    };
    try {
      await create.mutateAsync({
        catId,
        recordType: type,
        recordData,
        recordedAt,
        nextDueDate: nextDueDate || undefined,
      });
      setDetail('');
      setNextDueDate('');
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the record.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus size={16} /> Add record
        </Button>
      </DialogTrigger>
      <DialogContent title="Add health record">
        <div className="space-y-4">
          <Field label="Type" htmlFor="hr-type">
            <SelectField
              id="hr-type"
              value={type}
              onValueChange={(v) => setType(v as HealthRecordType)}
              options={HEALTH_RECORD_TYPES.map((t) => ({
                value: t,
                label: t.replace('_', ' '),
              }))}
            />
          </Field>
          <Field label={meta.label} htmlFor="hr-detail">
            <Input
              id="hr-detail"
              type={meta.numeric ? 'number' : 'text'}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" htmlFor="hr-date">
              <Input
                id="hr-date"
                type="date"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
              />
            </Field>
            <Field label="Next due (optional)" htmlFor="hr-due">
              <Input
                id="hr-due"
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
              />
            </Field>
          </div>
          {error && <p className="text-sm text-accent-pink">{error}</p>}
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button size="sm" onClick={submit} disabled={create.isPending}>
              {create.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
