import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RUNBOOKS, getRunbook } from "@/lib/runbooks/meta";

export function generateStaticParams() {
  return RUNBOOKS.map((runbook) => ({ slug: runbook.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const runbook = getRunbook(slug);
  return { title: runbook ? `Runbooks · ${runbook.command}` : "Runbooks" };
}

export default async function RunbookCommandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const runbook = getRunbook(slug);
  if (!runbook) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={runbook.command}
        title={runbook.title}
        description={runbook.blurb}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href={`/runbooks/${runbook.tracks[0]}`}>
              <ChevronLeft className="size-4" /> Back to runbooks
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Tracks:</span>
        {runbook.tracks.map((track) => (
          <Badge key={track} variant="secondary">
            <Link href={`/runbooks/${track}`}>
              {track === "advanced" ? "Advanced" : track}
            </Link>
          </Badge>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between pb-0">
          <CardTitle className="text-base">Demo prompt</CardTitle>
          <CopyButton text={runbook.demoPrompt} />
        </CardHeader>
        <CardContent className="pt-3">
          <pre className="overflow-auto rounded-lg border border-border bg-muted/60 p-3 text-sm leading-relaxed whitespace-pre-wrap">
            {runbook.demoPrompt}
          </pre>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">When:</span> {runbook.when} You still review
            the result.
          </p>
          {runbook.setup ? (
            <p className="mt-2 rounded-md bg-indigo-soft px-3 py-2 text-xs leading-relaxed text-foreground">
              <span className="font-medium">Before this beat:</span> {runbook.setup}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <details className="rounded-lg border border-border bg-card">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          Full scope and guardrails
        </summary>
        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              The demo prompt tells the agent to load this canonical instruction before acting.
            </p>
            <CopyButton text={runbook.prompt} label="Copy full prompt" />
          </div>
          <pre className="max-h-105 overflow-auto rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed whitespace-pre-wrap">
            {runbook.prompt}
          </pre>
        </div>
      </details>
    </div>
  );
}
