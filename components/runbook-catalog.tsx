import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  RUNBOOK_COMMANDS_ANCHOR,
  runbookSectionHref,
  type DemoSection,
  type RunbookMeta,
} from "@/lib/runbooks/meta";

function PasteBlock({ text, label = "Paste in Cursor" }: { text: string; label?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <CopyButton text={text} label="Copy" />
      </div>
      <pre className="overflow-auto rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  );
}

function RunbookCard({ runbook }: { runbook: RunbookMeta }) {
  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-medium tracking-[0.08em] text-indigo uppercase">
              {runbook.command}
            </p>
            <h4 className="mt-1 text-lg font-semibold tracking-tight">{runbook.title}</h4>
          </div>
          <Badge variant="secondary" className="shrink-0 font-normal">
            {runbook.handsOver}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{runbook.blurb}</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">When:</span> {runbook.when}
        </p>
        {runbook.setup ? (
          <p className="rounded-md bg-indigo-soft px-3 py-2 text-xs leading-relaxed text-foreground">
            <span className="font-medium">Before you paste:</span> {runbook.setup}
          </p>
        ) : null}
        <div className="mt-auto space-y-3">
          <PasteBlock text={runbook.prompt} />
          <div className="flex justify-end">
            <Button asChild size="sm" variant="ghost" className="text-indigo">
              <Link href={`/runbooks/commands/${runbook.slug}`}>
                Full page <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionPanel({ section }: { section: DemoSection }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold tracking-tight">{section.title}</h3>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {section.beats.map((beat) => (
          <Card key={beat.id} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-3">
              <div className="space-y-1.5">
                <p className="font-medium">{beat.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{beat.detail}</p>
              </div>
              {beat.example ? (
                <div className="mt-auto">
                  <PasteBlock text={beat.example} label={beat.pasteLabel} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function RunbookCatalog({
  trackId,
  sections,
  runbooks,
}: {
  trackId: string;
  sections: readonly DemoSection[];
  runbooks: RunbookMeta[];
}) {
  const tabs = [
    ...sections.map((section) => ({ id: section.id, title: section.title })),
    ...(runbooks.length > 0
      ? [{ id: RUNBOOK_COMMANDS_ANCHOR, title: "Runbook commands" }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <nav
        aria-label={`${trackId === "advanced" ? "Advanced" : trackId} sections`}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {tabs.map((tab) => (
          <Button key={tab.id} asChild size="sm" variant="outline" className="shrink-0">
            <a href={runbookSectionHref(trackId, tab.id)}>{tab.title}</a>
          </Button>
        ))}
      </nav>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            <SectionPanel section={section} />
          </section>
        ))}
        {runbooks.length > 0 ? (
          <section id={RUNBOOK_COMMANDS_ANCHOR} className="scroll-mt-20 space-y-3">
            <h3 className="text-lg font-semibold tracking-tight">Runbook commands</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              {runbooks.map((runbook) => (
                <RunbookCard key={`${trackId}-${runbook.slug}`} runbook={runbook} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
