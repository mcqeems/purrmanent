'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Pill,
  Chip,
  Input,
  Select,
  Field,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  Checkbox,
  useToast,
} from '@/components/ui';

export default function StyleguidePage() {
  const { toast } = useToast();
  const [checked, setChecked] = useState(true);

  return (
    <main className="mx-auto max-w-4xl space-y-12 px-6 py-12">
      <h1 className="font-display text-4xl font-bold text-ink-deep">
        Style<Chip>guide</Chip>
      </h1>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2px] text-muted">
          Buttons
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="violet">Violet</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-canvas-dark p-4">
          <Button variant="inverted">Inverted</Button>
          <Button variant="ghost">Ghost on dark</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2px] text-muted">
          Cards (both polarities)
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>Light card</Card>
          <Card variant="featured">Featured (dark)</Card>
          <Card variant="spotlight">Spotlight violet</Card>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <Pill>Neutral</Pill>
        <Pill tone="dark">Dark</Pill>
        <Pill tone="lime">Lime</Pill>
      </section>

      <section className="grid max-w-md gap-4">
        <Field label="Cat name" htmlFor="sg-name" hint="As you call them.">
          <Input id="sg-name" placeholder="Mochi" />
        </Field>
        <Field label="Personality" htmlFor="sg-pers" error="Required">
          <Select id="sg-pers" defaultValue="">
            <option value="" disabled>
              Choose…
            </option>
            <option value="shy">Shy</option>
            <option value="balanced">Balanced</option>
          </Select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-ink-deep">
          <Checkbox
            checked={checked}
            onCheckedChange={(v) => setChecked(Boolean(v))}
          />
          <span className={checked ? 'line-through opacity-60' : ''}>
            Crisis todo (strikethrough on check)
          </span>
        </label>
      </section>

      <section>
        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="phase">Phase</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="pt-4 text-sm">
            Daily board content
          </TabsContent>
          <TabsContent value="phase" className="pt-4 text-sm">
            Phase board content
          </TabsContent>
        </Tabs>
      </section>

      <section className="flex gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent title="Confirm action">
            <p className="text-sm">Add a cat named Mochi?</p>
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          onClick={() =>
            toast({
              tone: 'success',
              title: 'Nice',
              description: 'Toast fired.',
            })
          }
        >
          Fire toast
        </Button>
      </section>
    </main>
  );
}
