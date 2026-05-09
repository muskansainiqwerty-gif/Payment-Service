export const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const exponentialBackoffDelay = (
  attempt: number,
  baseDelay = 200,
): number => Math.min(baseDelay * Math.pow(2, attempt - 1), 3000);
