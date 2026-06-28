"use client";

import { useRouter } from "next/navigation";
import { Card, Spinner } from "@/components/ui";
import { useCat } from "./hooks";
import { CatForm } from "./cat-form";

export function EditCat({ catId }: { catId: number }) {
  const router = useRouter();
  const { data: cat, isLoading, isError } = useCat(catId);

  if (isLoading) return <Spinner className="size-6 text-accent-violet" />;
  if (isError || !cat)
    return <p className="text-sm text-accent-pink">Could not load this cat.</p>;

  return (
    <Card className="max-w-xl">
      <CatForm cat={cat} onDone={() => router.push(`/cats/${cat.id}`)} />
    </Card>
  );
}
