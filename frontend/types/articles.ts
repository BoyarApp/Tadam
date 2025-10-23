export type ArticleCategory = {
  id: number;
  name: string;
  slug?: string | null;
};

export type ArticleDistrict = {
  id: number;
  name: string;
  slug?: string | null;
};

export type ArticleMedia = {
  id?: number;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
};

export type ArticleEntity = {
  id: number;
  name: string;
  type?: string | null;
};

export type ArticleSourceLink = {
  id?: number | string;
  label: string;
  url: string;
};

export type ArticleFactEntry = {
  id?: number | string;
  label: string;
  value: string;
  sources: ArticleSourceLink[];
};

export type ArticleExplainer = {
  id?: number | string;
  title: string;
  summary?: string;
  url?: string;
};

export type ArticleWorkflowHistoryEntry = {
  toStatus: string;
  at: string;
  actor?: number;
  actorRole?: string;
  note?: string;
  metadata?: Record<string, unknown>;
};

export type ArticleWorkflowMeta = {
  lastStatus?: string;
  lastActionAt?: string;
  lastActionBy?: number;
  lastActionRole?: string;
  lastNote?: string;
  lastMetadata?: Record<string, unknown>;
  history: ArticleWorkflowHistoryEntry[];
};

export type ArticleListItem = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  categories: ArticleCategory[];
  districts: ArticleDistrict[];
  publishedAt?: string | null;
  heroImage?: ArticleMedia | null;
};

export type ArticlePayload = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  categories: ArticleCategory[];
  districts: ArticleDistrict[];
  heroImage?: ArticleMedia | null;
  gallery: ArticleMedia[];
  publishedAt?: string | null;
  updatedAt?: string | null;
  factEntries: ArticleFactEntry[];
  sourceLinks: ArticleSourceLink[];
  explainers: ArticleExplainer[];
  entities: ArticleEntity[];
  workflow: ArticleWorkflowMeta;
  related: ArticleListItem[];
};
