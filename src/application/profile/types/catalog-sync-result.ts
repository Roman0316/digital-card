export const CatalogSyncStatus = {
  Created: 'created',
  Updated: 'updated',
  Unchanged: 'unchanged',
} as const;

export type CatalogSyncStatus = (typeof CatalogSyncStatus)[keyof typeof CatalogSyncStatus];

export interface CatalogSyncResult {
  status: CatalogSyncStatus;
}
