const SHEET_EVENTS = 'events_raw';
const SHEET_USERS = 'users';
const SHEET_DAILY = 'daily_funnel';

const PROP_CONFIG = 'MPQ_CONFIG_V1';

const EVENTS_HEADERS = [
  'serverTs',
  'event',
  'sessionId',
  'segment',
  'screenId',
  'screenPos',
  'visibleIndex',
  'email',
  'answersJson',
  'payloadJson',
  'clientTs',
  'path',
  'userAgent'
];

const USERS_BASE_HEADERS = [
  'createdAt',
  'updatedAt',
  'sessionId',
  'segment',
  'email',
  'checkoutInitiated',
  'checkoutAt',
  'firstScreenAt',
  'maxScreenPos',
  'lastScreenId',
  'lastEvent'
];

function doGet() {
  return jsonOutput_({
    ok: true,
    message: 'Use POST to send quiz events.'
  });
}

function doPost(e) {
  try {
    const payload = parseRequestPayload_(e);
    const eventName = String(payload.event || 'unknown');
    const now = new Date();

    ensureSheetsAndHeaders_();
    appendRawEvent_(payload, eventName, now);

    if (eventName === 'quiz_config') {
      storeQuizConfig_(payload);
      ensureDynamicHeaders_();
    }

    upsertUserRow_(payload, eventName, now);

    return jsonOutput_({ ok: true });
  } catch (error) {
    return jsonOutput_({
      ok: false,
      error: String(error && error.message ? error.message : error)
    });
  }
}

function ensureSheetsAndHeaders_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventsSheet = getOrCreateSheet_(ss, SHEET_EVENTS);
  const usersSheet = getOrCreateSheet_(ss, SHEET_USERS);
  const dailySheet = getOrCreateSheet_(ss, SHEET_DAILY);

  ensureHeaders_(eventsSheet, EVENTS_HEADERS);
  ensureHeaders_(usersSheet, USERS_BASE_HEADERS);
  if (dailySheet.getLastRow() === 0) {
    dailySheet.getRange(1, 1, 1, 1).setValues([['date']]);
  }
}

function ensureDynamicHeaders_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = getOrCreateSheet_(ss, SHEET_USERS);
  const dailySheet = getOrCreateSheet_(ss, SHEET_DAILY);

  const cfg = getStoredQuizConfig_();
  const answerFields = Array.isArray(cfg.answerFields) ? cfg.answerFields : [];
  const screenOrder = Array.isArray(cfg.screenOrder) ? cfg.screenOrder : [];

  ensureUsersAnswerHeaders_(usersSheet, answerFields);
  ensureDailyHeaders_(dailySheet, screenOrder);
}

function appendRawEvent_(payload, eventName, now) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet_(ss, SHEET_EVENTS);

  const row = [
    now,
    eventName,
    safeString_(payload.sessionId),
    safeString_(payload.segment || payload.lifeStage),
    safeString_(payload.screenId),
    toNumberOrEmpty_(payload.screenPos),
    toNumberOrEmpty_(payload.visibleIndex),
    safeString_(payload.email),
    toJsonString_(payload.answers),
    toJsonString_(payload),
    safeString_(payload.clientTs),
    safeString_(payload.path),
    safeString_(payload.userAgent)
  ];

  sheet.appendRow(row);
}

function upsertUserRow_(payload, eventName, now) {
  const sessionId = safeString_(payload.sessionId);
  if (!sessionId) return;

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreateSheet_(ss, SHEET_USERS);

    const answers = payload.answers && typeof payload.answers === 'object' ? payload.answers : null;
    if (answers) {
      ensureUsersAnswerHeaders_(sheet, Object.keys(answers));
    }

    const header = getHeaderMap_(sheet);
    const rowIndex = findOrCreateUserRow_(sheet, header, sessionId);
    const lastCol = sheet.getLastColumn();
    const rowValues = sheet.getRange(rowIndex, 1, 1, lastCol).getValues()[0];

    setCellByHeader_(rowValues, header, 'updatedAt', now);
    setCellByHeader_(rowValues, header, 'sessionId', sessionId);
    setCellByHeader_(rowValues, header, 'lastEvent', eventName);

    if (!getCellByHeader_(rowValues, header, 'createdAt')) {
      setCellByHeader_(rowValues, header, 'createdAt', now);
    }

    const segment = safeString_(payload.segment || payload.lifeStage);
    if (segment) {
      setCellByHeader_(rowValues, header, 'segment', segment);
    }

    const email = safeString_(payload.email);
    if (email) {
      setCellByHeader_(rowValues, header, 'email', email);
    }

    const screenId = safeString_(payload.screenId);
    if (screenId) {
      setCellByHeader_(rowValues, header, 'lastScreenId', screenId);
    }

    const screenPos = toNumberOrEmpty_(payload.screenPos);
    if (screenPos !== '') {
      const prevMax = Number(getCellByHeader_(rowValues, header, 'maxScreenPos'));
      if (!Number.isFinite(prevMax) || screenPos > prevMax) {
        setCellByHeader_(rowValues, header, 'maxScreenPos', screenPos);
      }
      if (screenPos === 0 && !getCellByHeader_(rowValues, header, 'firstScreenAt')) {
        setCellByHeader_(rowValues, header, 'firstScreenAt', now);
      }
    }

    if (eventName === 'checkout_initiated') {
      setCellByHeader_(rowValues, header, 'checkoutInitiated', true);
      if (!getCellByHeader_(rowValues, header, 'checkoutAt')) {
        setCellByHeader_(rowValues, header, 'checkoutAt', now);
      }
    }

    if (answers) {
      const keys = Object.keys(answers);
      for (let i = 0; i < keys.length; i += 1) {
        const answerKey = keys[i];
        const colName = answerColumnName_(answerKey);
        if (!header[colName]) continue;
        setCellByHeader_(rowValues, header, colName, normalizeAnswerValue_(answers[answerKey]));
      }
    }

    sheet.getRange(rowIndex, 1, 1, lastCol).setValues([rowValues]);
  } finally {
    lock.releaseLock();
  }
}

function runDailyFunnel(targetDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventsSheet = getOrCreateSheet_(ss, SHEET_EVENTS);
  const dailySheet = getOrCreateSheet_(ss, SHEET_DAILY);
  ensureDynamicHeaders_();

  const tz = Session.getScriptTimeZone();
  const dateKey = targetDate || getYesterdayDateKey_(tz);

  const cfg = getStoredQuizConfig_();
  const configuredOrder = Array.isArray(cfg.screenOrder) ? cfg.screenOrder : [];
  const configuredCount = configuredOrder.length;

  const values = eventsSheet.getDataRange().getValues();
  const seenByPos = [];
  const maxInitial = configuredCount > 0 ? configuredCount : 1;
  for (let i = 0; i < maxInitial; i += 1) seenByPos.push(new Set());

  for (let i = 1; i < values.length; i += 1) {
    const row = values[i];
    const serverTs = row[0];
    const eventName = String(row[1] || '');
    const sessionId = safeString_(row[2]);
    const screenPosRaw = row[5];

    if (eventName !== 'screen_view') continue;
    if (!sessionId) continue;
    if (!isSameDateKey_(serverTs, dateKey, tz)) continue;

    const screenPos = Number(screenPosRaw);
    if (!Number.isFinite(screenPos) || screenPos < 0) continue;

    while (seenByPos.length <= screenPos) {
      seenByPos.push(new Set());
    }
    seenByPos[screenPos].add(sessionId);
  }

  const counts = [];
  for (let i = 0; i < seenByPos.length; i += 1) {
    counts.push(seenByPos[i].size);
  }

  const finalScreenOrder = configuredOrder.length > 0
    ? configuredOrder
    : counts.map(function (_value, index) {
        return { screenId: 'screen_' + (index + 1), screenPos: index };
      });

  ensureDailyHeaders_(dailySheet, finalScreenOrder);
  upsertDailyRow_(dailySheet, dateKey, counts);
}

function installTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i += 1) {
    if (triggers[i].getHandlerFunction() === 'runDailyFunnel') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('runDailyFunnel')
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .nearMinute(10)
    .create();
}

function recomputeDailyFunnelForLastDays(days) {
  const tz = Session.getScriptTimeZone();
  const count = Number(days) || 7;
  for (let i = 1; i <= count; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    runDailyFunnel(Utilities.formatDate(d, tz, 'yyyy-MM-dd'));
  }
}

function parseRequestPayload_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    const payload = JSON.parse(e.postData.contents);
    return payload && typeof payload === 'object' ? payload : {};
  } catch (_error) {
    return {};
  }
}

function storeQuizConfig_(payload) {
  const cfg = {
    configId: safeString_(payload.configId),
    answerFields: Array.isArray(payload.answerFields) ? payload.answerFields : [],
    screenOrder: Array.isArray(payload.screenOrder) ? payload.screenOrder : []
  };
  PropertiesService.getScriptProperties().setProperty(PROP_CONFIG, JSON.stringify(cfg));
}

function getStoredQuizConfig_() {
  const raw = PropertiesService.getScriptProperties().getProperty(PROP_CONFIG);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function ensureUsersAnswerHeaders_(sheet, answerFields) {
  const filtered = [];
  const seen = {};
  for (let i = 0; i < answerFields.length; i += 1) {
    const field = safeString_(answerFields[i]);
    if (!field || seen[field]) continue;
    seen[field] = true;
    filtered.push(field);
  }

  if (filtered.length === 0) return;

  const currentHeaders = getHeaders_(sheet);
  let changed = false;
  for (let i = 0; i < filtered.length; i += 1) {
    const colName = answerColumnName_(filtered[i]);
    if (currentHeaders.indexOf(colName) === -1) {
      currentHeaders.push(colName);
      changed = true;
    }
  }

  if (changed) {
    sheet.getRange(1, 1, 1, currentHeaders.length).setValues([currentHeaders]);
  }
}

function ensureDailyHeaders_(sheet, screenOrder) {
  const headers = ['date'];
  for (let i = 0; i < screenOrder.length; i += 1) {
    const part = sanitizeHeaderPart_(screenOrder[i].screenId || ('screen_' + (i + 1)));
    headers.push('screen_' + (i + 1) + '_' + part);
  }
  ensureHeaders_(sheet, headers);
}

function upsertDailyRow_(sheet, dateKey, counts) {
  const width = Math.max(1 + counts.length, sheet.getLastColumn());
  const rowValues = new Array(width).fill('');
  rowValues[0] = dateKey;
  for (let i = 0; i < counts.length; i += 1) {
    rowValues[i + 1] = counts[i];
  }

  const existingRow = findDateRow_(sheet, dateKey);
  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, width).setValues([rowValues]);
  } else {
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, width).setValues([rowValues]);
  }
}

function findDateRow_(sheet, dateKey) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const range = sheet.getRange(2, 1, lastRow - 1, 1);
  const finder = range.createTextFinder(dateKey).matchEntireCell(true).findNext();
  return finder ? finder.getRow() : -1;
}

function findOrCreateUserRow_(sheet, header, sessionId) {
  const sessionCol = header.sessionId;
  const lastRow = sheet.getLastRow();

  if (lastRow >= 2) {
    const range = sheet.getRange(2, sessionCol, lastRow - 1, 1);
    const finder = range.createTextFinder(sessionId).matchEntireCell(true).findNext();
    if (finder) return finder.getRow();
  }

  const newRowIndex = Math.max(lastRow + 1, 2);
  const emptyRow = new Array(sheet.getLastColumn()).fill('');
  sheet.getRange(newRowIndex, 1, 1, emptyRow.length).setValues([emptyRow]);
  return newRowIndex;
}

function ensureHeaders_(sheet, expectedHeaders) {
  const current = getHeaders_(sheet);
  if (current.length === 0) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    return;
  }

  const merged = current.slice();
  for (let i = 0; i < expectedHeaders.length; i += 1) {
    if (merged.indexOf(expectedHeaders[i]) === -1) {
      merged.push(expectedHeaders[i]);
    }
  }

  const same = merged.length === current.length && merged.every(function (v, i) {
    return v === current[i];
  });
  if (!same) {
    sheet.getRange(1, 1, 1, merged.length).setValues([merged]);
  }
}

function getHeaderMap_(sheet) {
  const headers = getHeaders_(sheet);
  const map = {};
  for (let i = 0; i < headers.length; i += 1) {
    map[String(headers[i])] = i + 1;
  }
  return map;
}

function getHeaders_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1 || sheet.getLastRow() < 1) return [];
  const values = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const clean = [];
  for (let i = 0; i < values.length; i += 1) {
    const val = safeString_(values[i]);
    if (val) clean.push(val);
  }
  return clean;
}

function getOrCreateSheet_(spreadsheet, name) {
  const existing = spreadsheet.getSheetByName(name);
  if (existing) return existing;
  return spreadsheet.insertSheet(name);
}

function setCellByHeader_(rowValues, headerMap, key, value) {
  const col = headerMap[key];
  if (!col) return;
  rowValues[col - 1] = value;
}

function getCellByHeader_(rowValues, headerMap, key) {
  const col = headerMap[key];
  if (!col) return '';
  return rowValues[col - 1];
}

function answerColumnName_(fieldName) {
  return 'answer_' + sanitizeHeaderPart_(fieldName);
}

function normalizeAnswerValue_(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.join('|');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function sanitizeHeaderPart_(value) {
  return safeString_(value)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function toJsonString_(value) {
  if (value == null) return '';
  try {
    return JSON.stringify(value);
  } catch (_error) {
    return '';
  }
}

function toNumberOrEmpty_(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
}

function safeString_(value) {
  if (value == null) return '';
  return String(value).trim();
}

function getYesterdayDateKey_(tz) {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return Utilities.formatDate(d, tz, 'yyyy-MM-dd');
}

function isSameDateKey_(dateValue, dateKey, tz) {
  if (!dateValue) return false;
  const dt = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (String(dt) === 'Invalid Date') return false;
  return Utilities.formatDate(dt, tz, 'yyyy-MM-dd') === dateKey;
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
