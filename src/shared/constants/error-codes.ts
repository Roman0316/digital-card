export const ErrorCode = {
  Validation: 'VALIDATION_ERROR',
  BadRequest: 'BAD_REQUEST',
  NotFound: 'NOT_FOUND',
  ProfileNotFound: 'PROFILE_NOT_FOUND',
  Conflict: 'CONFLICT',
  NotReady: 'NOT_READY',
  NotLive: 'NOT_LIVE',
  Internal: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
