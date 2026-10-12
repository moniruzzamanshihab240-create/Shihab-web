import { RateLimitStatus } from '../types';

const STORAGE_KEY = 'authsphere_rate_limit';
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 3 * 60 * 1000; // 3 minutes rolling window
const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes lockout

interface StoredRateLimit {
  attempts: number[];
  lockoutUntil: number | null;
}

function getStoredData(): StoredRateLimit {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { attempts: [], lockoutUntil: null };
    return JSON.parse(raw);
  } catch {
    return { attempts: [], lockoutUntil: null };
  }
}

function saveStoredData(data: StoredRateLimit): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage failure fallback
  }
}

export function getRateLimitStatus(): RateLimitStatus {
  const data = getStoredData();
  const now = Date.now();

  // Check if currently locked out
  if (data.lockoutUntil && data.lockoutUntil > now) {
    const secondsRemaining = Math.ceil((data.lockoutUntil - now) / 1000);
    return {
      isLocked: true,
      attemptsRemaining: 0,
      totalAttempts: data.attempts.length,
      lockoutExpiresAt: data.lockoutUntil,
      secondsRemaining,
    };
  }

  // Filter attempts within rolling window
  const activeAttempts = data.attempts.filter(timestamp => now - timestamp < WINDOW_MS);
  const remaining = Math.max(0, MAX_ATTEMPTS - activeAttempts.length);

  return {
    isLocked: false,
    attemptsRemaining: remaining,
    totalAttempts: activeAttempts.length,
    lockoutExpiresAt: null,
    secondsRemaining: 0,
  };
}

export function recordFailedAttempt(): RateLimitStatus {
  const data = getStoredData();
  const now = Date.now();

  // Filter old attempts
  const activeAttempts = data.attempts.filter(timestamp => now - timestamp < WINDOW_MS);
  activeAttempts.push(now);

  let lockoutUntil: number | null = null;
  if (activeAttempts.length >= MAX_ATTEMPTS) {
    lockoutUntil = now + LOCKOUT_DURATION_MS;
  }

  const updated: StoredRateLimit = {
    attempts: activeAttempts,
    lockoutUntil,
  };

  saveStoredData(updated);
  return getRateLimitStatus();
}

export function recordSuccessfulAttempt(): void {
  // Clear failed attempts on successful sign-in
  saveStoredData({ attempts: [], lockoutUntil: null });
}

export function resetRateLimit(): RateLimitStatus {
  saveStoredData({ attempts: [], lockoutUntil: null });
  return getRateLimitStatus();
}

export function simulateLockout(): RateLimitStatus {
  const now = Date.now();
  const lockoutUntil = now + LOCKOUT_DURATION_MS;
  saveStoredData({
    attempts: Array(MAX_ATTEMPTS).fill(now),
    lockoutUntil,
  });
  return getRateLimitStatus();
}
