export type DemoTrack = "101" | "201" | "301";

export type BeatPromptType = "reusable" | "adaptable" | "none";

/** Feature name copied from an `[Optional - Feature]` tag. */
export type OptionalFeature = {
  feature: string;
};

export type DemoBeat = {
  id: string;
  title: string;
  detail: string;
  promptType?: BeatPromptType;
  example?: string;
  pasteLabel?: string;
  /**
   * Set on beats the Outline marks `[Optional - Feature]`.
   * The runbooks page can hide every beat for one feature.
   * Required beats omit this.
   */
  optional?: OptionalFeature;
};

export type DemoSection = {
  id: string;
  title: string;
  beats: readonly DemoBeat[];
};
