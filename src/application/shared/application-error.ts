export abstract class ApplicationError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ProfileNotFoundError extends ApplicationError {
  readonly code = 'PROFILE_NOT_FOUND';

  constructor() {
    super('Профиль не найден');
  }
}

export class CatalogSyncConflictError extends ApplicationError {
  readonly code = 'CATALOG_SYNC_CONFLICT';

  constructor() {
    super('Каталог профиля изменился параллельно и не был сохранён');
  }
}
