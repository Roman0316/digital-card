export interface DatabaseConfig {
  url: string;
  connectAttempts: number;
  connectDelayMs: number;
  transactionTimeoutMs: number;
  logQueries: boolean;
}
