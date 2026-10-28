export function createRuntimeEnvironment(): NodeJS.ProcessEnv {
  return process.env;
}

export function createWorkingDirectory(): string {
  return process.cwd();
}
