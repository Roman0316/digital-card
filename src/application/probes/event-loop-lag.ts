export function isEventLoopLagAcceptable(
  lagMilliseconds: number,
  thresholdMilliseconds: number,
): boolean {
  return lagMilliseconds <= thresholdMilliseconds;
}
