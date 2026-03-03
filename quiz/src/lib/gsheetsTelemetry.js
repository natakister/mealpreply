const DEFAULT_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbwBMKSk1p4Tv6jRRC3wrVCF0kQ10z1J5_78738hssZFnalokBaB6dV9r6vlqfQ5jgka/exec';

const SESSION_ID_STORAGE_KEY = 'mpq_session_id';
const SENT_ONCE_SESSION_STORAGE_PREFIX = 'mpq_telemetry_sent:';

const getWebAppUrl = () =>
  import.meta.env.VITE_GSHEETS_WEBAPP_URL || DEFAULT_WEB_APP_URL;

const safeNowIso = () => {
  try {
    return new Date().toISOString();
  } catch {
    return '';
  }
};

const generateId = () => {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    // ignore
  }
  return `sid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
};

export const getOrCreateSessionId = () => {
  try {
    const existing = localStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (existing) return existing;
  } catch {
    // ignore
  }

  const next = generateId();
  try {
    localStorage.setItem(SESSION_ID_STORAGE_KEY, next);
  } catch {
    // ignore
  }
  return next;
};

const markSentOnce = (key) => {
  const storageKey = `${SENT_ONCE_SESSION_STORAGE_PREFIX}${key}`;
  try {
    if (sessionStorage.getItem(storageKey)) return false;
    sessionStorage.setItem(storageKey, '1');
    return true;
  } catch {
    // If sessionStorage is unavailable, don't dedupe.
    return true;
  }
};

export const trackEvent = (event, payload = {}) => {
  const url = getWebAppUrl();
  if (!url) return;

  const body = JSON.stringify({
    event,
    ...payload,
    clientTs: payload.clientTs || safeNowIso(),
    path: payload.path || globalThis.location?.pathname || '',
    userAgent: payload.userAgent || globalThis.navigator?.userAgent || ''
  });

  try {
    if (globalThis.navigator?.sendBeacon) {
      const blob = new Blob([body], { type: 'text/plain;charset=UTF-8' });
      globalThis.navigator.sendBeacon(url, blob);
      return;
    }
  } catch {
    // ignore and fall back to fetch
  }

  try {
    void fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body,
      keepalive: true
    });
  } catch {
    // ignore
  }
};

export const trackEventOnce = (key, event, payload = {}) => {
  if (!markSentOnce(key)) return;
  trackEvent(event, payload);
};

