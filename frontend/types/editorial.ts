export type SourceLink = {
  label: string;
  url: string;
};

export type FactEntry = {
  label: string;
  value: string;
  sources: string[];
};

export type MediaAsset = {
  label: string;
  url: string;
  thumbnail?: string;
};

export type MediaSelection = {
  heroImage: string;
  gallery: MediaAsset[];
  supporting: MediaAsset[];
};

export type EntitySuggestion = {
  label: string;
  type: string;
  confidence: number;
};

export type SpellcheckSuggestion = {
  position: number;
  length: number;
  replacement: string;
  reason: string;
};

export type TranslateAssistResponse = {
  type: 'translate';
  input: string;
  output: string;
  metadata: Record<string, unknown>;
  logEntryId: number | null;
  loggedAt: string;
};

export type SpellcheckAssistResponse = {
  type: 'spell_check';
  input: string;
  suggestions: SpellcheckSuggestion[];
  metadata: Record<string, unknown>;
  logEntryId: number | null;
  loggedAt: string;
};

export type EntityAssistResponse = {
  type: 'entity_tag';
  input: string;
  entities: EntitySuggestion[];
  metadata: Record<string, unknown>;
  logEntryId: number | null;
  loggedAt: string;
};

export type EditorialAssistResponse =
  | TranslateAssistResponse
  | SpellcheckAssistResponse
  | EntityAssistResponse;
