export function isAuthDebugEnabled(): boolean {
  return process.env.AUTH_DEBUG === "true";
}

export function authDebug(scope: string, payload: Record<string, unknown>) {
  if (!isAuthDebugEnabled()) return;
  console.info(`[AUTH_DEBUG][${scope}]`, payload);
}
