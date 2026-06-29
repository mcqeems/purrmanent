'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import {
  Button,
  Card,
  Field,
  Textarea,
  SelectField,
  Spinner,
  useToast,
} from '@/components/ui';
import { useActiveCat } from '@/features/cats/active-cat-provider';
import type { CrisisIdentifyResult } from '@/lib/types/api';
import { SlideCarousel } from './slide-carousel';
import { useIdentifyCrisis, useResolveCrisis } from './api';

export function CrisisFlow() {
  const router = useRouter();
  const { toast } = useToast();
  const { cats } = useActiveCat();
  const identify = useIdentifyCrisis();
  const resolve = useResolveCrisis();

  const [pickedCatId, setPickedCatId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<CrisisIdentifyResult | null>(null);
  const [reason, setReason] = useState('');
  const [showResolve, setShowResolve] = useState(false);

  const catId = pickedCatId ?? cats[0]?.id ?? null;
  const activeCat = cats.find((c) => c.id === catId) ?? null;

  if (cats.length === 0 || !activeCat) {
    return (
      <Card>
        <p className="text-sm text-muted">
          Add a cat first to use Crisis Mode.
        </p>
      </Card>
    );
  }

  async function start() {
    if (!prompt.trim() || !activeCat) return;
    const res = await identify.mutateAsync({
      catId: activeCat.id,
      prompt: prompt.trim(),
    });
    setResult(res);
  }

  async function finish(isDone: boolean) {
    if (!result) return;
    await resolve.mutateAsync({
      eventId: result.eventId,
      isDone,
      reasonNotDone: isDone ? undefined : reason.trim() || undefined,
    });
    toast({
      tone: 'success',
      description: isDone
        ? 'Glad it helped!'
        : 'Logged — consider calling a vet.',
    });
    router.push('/dashboard');
  }

  if (!result) {
    return (
      <Card variant="featured" className="space-y-4">
        <div className="flex items-center gap-2 text-accent-pink">
          <AlertTriangle size={20} />
          <h2 className="text-lg font-semibold text-on-primary">
            What&apos;s happening with {activeCat.name}?
          </h2>
        </div>
        {cats.length > 1 && (
          <Field label="Which cat?" htmlFor="crisis-cat">
            <SelectField
              id="crisis-cat"
              value={String(catId)}
              onValueChange={(v) => setPickedCatId(Number(v))}
              options={cats.map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
            />
          </Field>
        )}
        <Field label="Describe the situation" htmlFor="crisis-prompt">
          <Textarea
            id="crisis-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. He hasn't eaten in over a day and is hiding."
          />
        </Field>
        <Button onClick={start} disabled={identify.isPending || !prompt.trim()}>
          {identify.isPending ? 'Finding help…' : 'Get help now'}
        </Button>
        {identify.isError && (
          <p className="text-sm text-accent-pink">
            Could not load a protocol. Please try again.
          </p>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {result.source === 'rule'
          ? "Here's a step-by-step protocol."
          : "Here's guidance compiled for your situation."}
      </p>

      <SlideCarousel eventId={result.eventId} slides={result.slides} />

      {!showResolve ? (
        <Button onClick={() => setShowResolve(true)}>I&apos;m finished</Button>
      ) : (
        <Card className="space-y-3">
          <p className="font-semibold">Is {activeCat.name} okay now?</p>
          <Field
            label="If not, what's still wrong? (optional)"
            htmlFor="reason"
          >
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <div className="flex gap-2">
            <Button onClick={() => finish(true)} disabled={resolve.isPending}>
              Yes, resolved
            </Button>
            <Button
              variant="outline"
              onClick={() => finish(false)}
              disabled={resolve.isPending}
            >
              Not yet
            </Button>
          </div>
          {resolve.isPending && (
            <Spinner className="size-5 text-accent-violet" />
          )}
        </Card>
      )}
    </div>
  );
}
