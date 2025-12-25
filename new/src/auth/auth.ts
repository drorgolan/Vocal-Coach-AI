// src/auth/auth.ts - FIXED VERSION (No localStorage)
// These functions are now just placeholders since we use Context instead

export function saveSession(token: string) {
  // No-op: Session is managed by AuthContext in-memory
  console.warn('saveSession called but using Context instead');
}

export function getSession() {
  // No-op: Session is managed by AuthContext in-memory
  return null;
}

export function clearSession() {
  // No-op: Session is managed by AuthContext in-memory
  console.warn('clearSession called but using Context instead');
}

export function isAuthenticated() {
  // No-op: Use useAuth() hook instead
  return false;
}