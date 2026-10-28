export interface DatabaseHealthCheck {
  ping(): Promise<boolean>;
}

export interface EventLoopHealthCheck {
  isHealthy(): boolean;
}

export interface ReadinessState {
  isReady(): boolean;
}
