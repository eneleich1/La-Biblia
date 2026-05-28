import type { LucideIcon } from "lucide-react";

export type TopicNavItem = {
  id: string;
  label: string;
  children?: string[];
};

export type ScriptureItem = {
  label: string;
  text: string;
  href?: string;
};

export type BibleExample = {
  id: string;
  title: string;
  reference?: string;
  referenceHref?: string;
  body: string;
};

export type TopicSection = {
  id: string;
  title: string;
  manifestItems?: {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    href?: string;
  }[];
  intro?: string;
  bullets?: string[];
  scriptureBlockTitle?: string;
  scriptures?: ScriptureItem[];
  quote?: string;
  examplesTitle?: string;
  examples?: BibleExample[];
  afterBullets?: string[];
  verseDeckTitle?: string;
  verseReference?: string;
  verseReferenceHref?: string;
  verseCards?: { id: string; text: string }[];
  html?: string;
};

export type TopicParentLink = {
  label: string;
  href: string;
};

export type RelatedResource = {
  label: string;
  href: string;
};

export type ApologeticTopicPageData = {
  slug: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  parent: TopicParentLink;
  backLabel?: string;
  nav: TopicNavItem[];
  sections: TopicSection[];
  rightNav: { label: string; href: string }[];
  relatedResources: RelatedResource[];
};
