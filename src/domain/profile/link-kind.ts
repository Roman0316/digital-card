export const LinkKind = {
  Github: 'GITHUB',
  Linkedin: 'LINKEDIN',
  Telegram: 'TELEGRAM',
  Website: 'WEBSITE',
  Other: 'OTHER',
} as const;

export type LinkKind = (typeof LinkKind)[keyof typeof LinkKind];

const LINK_KINDS = new Set<string>(Object.values(LinkKind));

export function isLinkKind(value: string): value is LinkKind {
  return LINK_KINDS.has(value);
}
