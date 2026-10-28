import { DomainError } from '../../shared/domain-error';

export const CatalogViolation = {
  Slug: 'SLUG',
  Name: 'NAME',
  Description: 'DESCRIPTION',
  Collection: 'COLLECTION',
  Link: 'LINK',
  Skill: 'SKILL',
  Experience: 'EXPERIENCE',
  Achievement: 'ACHIEVEMENT',
  Project: 'PROJECT',
  SortOrder: 'SORT_ORDER',
  CurrentRole: 'CURRENT_ROLE',
} as const;

export type CatalogViolation = (typeof CatalogViolation)[keyof typeof CatalogViolation];

export class InvalidProfileCatalogError extends DomainError {
  readonly code = 'INVALID_PROFILE_CATALOG';

  constructor(
    readonly violation: CatalogViolation,
    message: string,
  ) {
    super(message);
  }
}
