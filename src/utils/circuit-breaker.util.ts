export class CircuitBreakerUtil {
  private failureCount = 0;
  private openedAt: number | null = null;

  constructor(
    private readonly failureThreshold = 3,
    private readonly resetTimeoutMs = 10000,
  ) {}

  canExecute(): boolean {
    if (this.openedAt === null) {
      return true;
    }
    const shouldHalfOpen = Date.now() - this.openedAt > this.resetTimeoutMs;
    if (shouldHalfOpen) {
      this.openedAt = null;
      return true;
    }
    return false;
  }

  onSuccess(): void {
    this.failureCount = 0;
    this.openedAt = null;
  }

  onFailure(): void {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold) {
      this.openedAt = Date.now();
    }
  }
}
