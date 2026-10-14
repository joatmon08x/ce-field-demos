export type DemoTrack = "101" | "201" | "301";

export type BeatPromptType = "reusable" | "adaptable" | "none";

export type DemoBeat = {
  id: string;
  title: string;
  detail: string;
  promptType?: BeatPromptType;
  example?: string;
  pasteLabel?: string;
  /** Hidden on the runbook page until Include optional cards is checked. */
  optional?: boolean;
};

export type DemoSection = {
  id: string;
  title: string;
  beats: readonly DemoBeat[];
};
