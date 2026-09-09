import type { DemoSection } from "@/lib/runbooks/types";

export const RUNBOOK_SECTIONS_ADVANCED = [
  {
    id: "cursor-cli-primer",
    title: "Cursor CLI primer",
    beats: [
      {
        id: "cli-setup",
        title: "Check the CLI",
        detail:
          "Confirm Cursor CLI is installed and signed in. A new clone needs --trust; the app does not need to be running.",
        pasteLabel: "Run in the terminal",
        example: "agent --version\nagent status",
      },
      {
        id: "cli-ask",
        title: "Ask mode",
        detail:
          "Use read-only Ask mode to explain why the page shows v1's $400 result while v2 and stored state are capped at $249.",
        pasteLabel: "Run in the terminal",
        example:
          'agent --trust --mode=ask "Explain why dsp_1043 shows a $400 suggested credit even though the stored credit and v2 response are $249. Cite the source files and do not edit anything."',
      },
      {
        id: "cli-session",
        title: "While the session is open",
        detail:
          "Make model choice explicit, inspect the remaining boundary, and leave the session without editing.",
        pasteLabel: "Paste in the CLI session",
        example:
          "Which file must change to move the client from v1 to v2, and which files remain for dispute resolution? Do not edit them.",
      },
    ],
  },
] as const satisfies readonly DemoSection[];
