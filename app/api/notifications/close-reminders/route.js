import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_API_BASE_URL = "https://game.rrdream.in/api/";
const DEFAULT_API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  FALLBACK_API_BASE_URL;

const CRON_SECRET = String(process.env.FCM_REMINDER_CRON_SECRET || "").trim();
const API_BEARER_TOKEN = String(
  process.env.FCM_REMINDER_API_BEARER_TOKEN || "",
).trim();

const parseIntegerWithDefault = (value, fallback) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const REMINDER_MINUTES = parseIntegerWithDefault(
  process.env.FCM_REMINDER_MINUTES || "5",
  5,
);
const REMINDER_WINDOW_SECONDS = parseIntegerWithDefault(
  process.env.FCM_REMINDER_WINDOW_SECONDS || "75",
  75,
);
const REMINDER_TIMEZONE_OFFSET_MINUTES = parseIntegerWithDefault(
  process.env.FCM_REMINDER_TIMEZONE_OFFSET_MINUTES || "330",
  330,
);

const DAY_MS = 24 * 60 * 60 * 1000;
const STATE_RETENTION_MS = 7 * DAY_MS;
const REMINDER_STATE_FILE = path.join(
  process.cwd(),
  "uploads",
  "fcm-close-reminders-state.json",
);

const GAME_SOURCES = [
  {
    kind: "main",
    label: "Main Game",
    endpoint: "games",
    nameFields: ["product_name", "game_name", "name"],
    idFields: ["id", "game_id"],
    closeTimeFields: ["close_time", "closeTime", "time"],
  },
  {
    kind: "starline",
    label: "Starline",
    endpoint: "starline-allgames",
    nameFields: ["name", "product_name", "game_name"],
    idFields: ["id", "game_id"],
    closeTimeFields: ["close_time", "closeTime", "time"],
  },
  {
    kind: "gali",
    label: "Gali Desawar",
    endpoint: "gali-allgames",
    nameFields: ["name", "product_name", "game_name"],
    idFields: ["id", "game_id"],
    closeTimeFields: ["close_time", "closeTime", "time"],
  },
];

const normalizeApiBaseUrl = (value) => {
  const trimmed = String(value || "").trim().replace(/\/+$/, "");
  if (!trimmed) return FALLBACK_API_BASE_URL;
  return /\/api$/i.test(trimmed) ? `${trimmed}/` : `${trimmed}/api/`;
};

const apiBaseUrl = normalizeApiBaseUrl(DEFAULT_API_BASE_URL);

const pad2 = (value) => String(value).padStart(2, "0");

const formatDateKeyFromOffsetMs = (utcMs, offsetMinutes) => {
  const localMs = utcMs + offsetMinutes * 60 * 1000;
  const date = new Date(localMs);
  const year = date.getUTCFullYear();
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());
  return `${year}-${month}-${day}`;
};

const parseBoolean = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const normalizeStatusValue = (value) => {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;

  if (
    ["1", "true", "active", "enabled", "open", "on", "yes"].includes(
      normalized,
    )
  ) {
    return true;
  }

  if (
    [
      "0",
      "false",
      "inactive",
      "disabled",
      "close",
      "closed",
      "off",
      "no",
      "deactive",
    ].includes(normalized)
  ) {
    return false;
  }

  return null;
};

const isGameActive = (game) => {
  const statusFields = [
    "status",
    "schedule_status",
    "game_status",
    "is_active",
    "active",
    "isActive",
  ];

  const interpreted = statusFields
    .map((field) => normalizeStatusValue(game?.[field]))
    .filter((value) => value !== null);

  if (interpreted.length === 0) return true;
  return interpreted.every(Boolean);
};

const parseCloseTime = (value) => {
  if (value === undefined || value === null) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([AaPp][Mm]))?$/);
  if (!match) return null;

  let hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  const second = Number.parseInt(match[3] || "0", 10);
  const meridiem = match[4] ? match[4].toUpperCase() : "";

  if (minute > 59 || second > 59) return null;

  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "AM" && hour === 12) hour = 0;
    if (meridiem === "PM" && hour !== 12) hour += 12;
  }

  if (hour > 23) return null;

  return {
    hour,
    minute,
    second,
    label: `${pad2(hour)}:${pad2(minute)}`,
  };
};

const computeMsUntilClose = ({ nowMs, closeTime, timezoneOffsetMinutes }) => {
  const offsetMs = timezoneOffsetMinutes * 60 * 1000;
  const localNow = new Date(nowMs + offsetMs);

  const year = localNow.getUTCFullYear();
  const month = localNow.getUTCMonth();
  const day = localNow.getUTCDate();

  let closeUtcMs =
    Date.UTC(
      year,
      month,
      day,
      closeTime.hour,
      closeTime.minute,
      closeTime.second,
      0,
    ) - offsetMs;

  let diffMs = closeUtcMs - nowMs;

  // Handle post-midnight close times while still using the configured local date.
  if (diffMs < -12 * 60 * 60 * 1000) {
    closeUtcMs += DAY_MS;
    diffMs = closeUtcMs - nowMs;
  }

  return {
    diffMs,
    closeUtcMs,
  };
};

const getRequestOrigin = (request) => {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.APP_URL;
  if (configured) {
    return String(configured).replace(/\/+$/, "");
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = forwardedHost || request.headers.get("host");
  if (!hostHeader) return "";

  const host = hostHeader.split(",")[0].trim();
  const protoSource = forwardedProto?.split(",")[0].trim();
  const proto =
    protoSource ||
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
};

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.games)) return payload.games;
  return [];
};

const readReminderState = async () => {
  try {
    const raw = await fs.readFile(REMINDER_STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || typeof parsed.sent !== "object") {
      return { sent: {} };
    }
    return { sent: parsed.sent };
  } catch (error) {
    if (error?.code === "ENOENT") return { sent: {} };
    return { sent: {} };
  }
};

const pruneReminderState = (state, nowMs) => {
  const sent = state?.sent && typeof state.sent === "object" ? state.sent : {};
  const pruned = {};

  Object.entries(sent).forEach(([key, timestamp]) => {
    const createdAt = Number(timestamp);
    if (!Number.isFinite(createdAt)) return;
    if (nowMs - createdAt > STATE_RETENTION_MS) return;
    pruned[key] = createdAt;
  });

  return { sent: pruned };
};

const writeReminderState = async (state) => {
  await fs.mkdir(path.dirname(REMINDER_STATE_FILE), { recursive: true });
  await fs.writeFile(REMINDER_STATE_FILE, JSON.stringify(state, null, 2), "utf8");
};

const pickGameId = (game, idFields) => {
  for (const field of idFields) {
    const value = game?.[field];
    if (value === undefined || value === null || value === "") continue;
    return String(value);
  }
  return "";
};

const pickGameName = (game, nameFields, fallbackLabel, fallbackId) => {
  for (const field of nameFields) {
    const value = String(game?.[field] || "").trim();
    if (value) return value;
  }
  return `${fallbackLabel} #${fallbackId || "NA"}`;
};

const pickCloseTimeValue = (game, closeTimeFields) => {
  for (const field of closeTimeFields || []) {
    const value = game?.[field];
    if (value === undefined || value === null || value === "") continue;
    return value;
  }
  return "";
};

const fetchGamesFromEndpoint = async (endpoint) => {
  const headers = { Accept: "application/json" };
  if (API_BEARER_TOKEN) {
    headers.Authorization = API_BEARER_TOKEN.startsWith("Bearer ")
      ? API_BEARER_TOKEN
      : `Bearer ${API_BEARER_TOKEN}`;
  }

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Failed to fetch ${endpoint} (${response.status}).`;
    throw new Error(message);
  }

  return extractArrayPayload(payload);
};

const buildDueReminders = ({ source, games, nowMs }) => {
  const due = [];
  const ignored = {
    inactive: 0,
    invalidCloseTime: 0,
    outsideWindow: 0,
  };

  const targetSeconds = REMINDER_MINUTES * 60;
  const minWindowMs = Math.max(0, (targetSeconds - REMINDER_WINDOW_SECONDS) * 1000);
  const maxWindowMs = (targetSeconds + REMINDER_WINDOW_SECONDS) * 1000;

  games.forEach((game) => {
    if (!isGameActive(game)) {
      ignored.inactive += 1;
      return;
    }

    const parsedCloseTime = parseCloseTime(
      pickCloseTimeValue(game, source.closeTimeFields),
    );
    if (!parsedCloseTime) {
      ignored.invalidCloseTime += 1;
      return;
    }

    const { diffMs, closeUtcMs } = computeMsUntilClose({
      nowMs,
      closeTime: parsedCloseTime,
      timezoneOffsetMinutes: REMINDER_TIMEZONE_OFFSET_MINUTES,
    });

    if (diffMs < minWindowMs || diffMs > maxWindowMs) {
      ignored.outsideWindow += 1;
      return;
    }

    const gameId = pickGameId(game, source.idFields);
    const gameName = pickGameName(game, source.nameFields, source.label, gameId);
    const closeDateKey = formatDateKeyFromOffsetMs(
      closeUtcMs,
      REMINDER_TIMEZONE_OFFSET_MINUTES,
    );

    const reminderKey = `${source.kind}:${gameId || "na"}:${closeDateKey}:${parsedCloseTime.label}`;

    due.push({
      reminderKey,
      source: source.kind,
      sourceLabel: source.label,
      gameId: gameId || "",
      gameName,
      closeTime: parsedCloseTime.label,
      closesInSeconds: Math.round(diffMs / 1000),
      title: `${gameName} closes in ${REMINDER_MINUTES} minutes`,
      body: `${source.label} close time is in ${REMINDER_MINUTES} minutes. Place your bets fast.`,
      data: {
        type: "close_time_reminder",
        game_type: source.kind,
        game_id: gameId || "",
        game_name: gameName,
        close_time: parsedCloseTime.label,
        reminder_minutes: String(REMINDER_MINUTES),
      },
    });
  });

  return {
    due,
    ignored,
  };
};

const sendReminderNotification = async ({ request, reminder }) => {
  const origin = getRequestOrigin(request);
  if (!origin) {
    throw new Error(
      "Unable to resolve server origin for internal notification send call.",
    );
  }

  const response = await fetch(`${origin}/api/notifications/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: reminder.title,
      body: reminder.body,
      data: reminder.data,
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Notification send failed (${response.status}).`;
    throw new Error(message);
  }

  return payload;
};

const isAuthorized = (request) => {
  if (!CRON_SECRET) return true;

  const authHeader = request.headers.get("authorization") || "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);

  const requestUrl = new URL(request.url);
  const provided =
    request.headers.get("x-cron-secret") ||
    bearerMatch?.[1] ||
    requestUrl.searchParams.get("secret") ||
    "";

  return String(provided).trim() === CRON_SECRET;
};

const runReminderJob = async (request) => {
  const requestUrl = new URL(request.url);
  const dryRun = parseBoolean(requestUrl.searchParams.get("dryRun"));
  const nowMs = Date.now();

  const state = pruneReminderState(await readReminderState(), nowMs);

  const sourceResults = await Promise.allSettled(
    GAME_SOURCES.map(async (source) => {
      const games = await fetchGamesFromEndpoint(source.endpoint);
      const { due, ignored } = buildDueReminders({ source, games, nowMs });
      return {
        source,
        totalFetched: games.length,
        due,
        ignored,
      };
    }),
  );

  const fetchSummary = [];
  const failedSources = [];
  const dueReminders = [];

  sourceResults.forEach((result, index) => {
    const source = GAME_SOURCES[index];

    if (result.status === "rejected") {
      failedSources.push({
        source: source.kind,
        endpoint: source.endpoint,
        message: result.reason?.message || "Unknown fetch error",
      });
      return;
    }

    fetchSummary.push({
      source: source.kind,
      endpoint: source.endpoint,
      totalFetched: result.value.totalFetched,
      dueCandidates: result.value.due.length,
      ignored: result.value.ignored,
    });

    dueReminders.push(...result.value.due);
  });

  const sent = [];
  const skippedAlreadySent = [];
  const failedSends = [];

  for (const reminder of dueReminders) {
    if (state.sent[reminder.reminderKey]) {
      skippedAlreadySent.push({
        reminderKey: reminder.reminderKey,
        source: reminder.source,
        gameId: reminder.gameId,
        gameName: reminder.gameName,
      });
      continue;
    }

    if (dryRun) {
      sent.push({
        dryRun: true,
        reminderKey: reminder.reminderKey,
        source: reminder.source,
        gameId: reminder.gameId,
        gameName: reminder.gameName,
        closeTime: reminder.closeTime,
      });
      continue;
    }

    try {
      const sendResponse = await sendReminderNotification({ request, reminder });
      state.sent[reminder.reminderKey] = nowMs;
      sent.push({
        reminderKey: reminder.reminderKey,
        source: reminder.source,
        gameId: reminder.gameId,
        gameName: reminder.gameName,
        closeTime: reminder.closeTime,
        messageId: sendResponse?.messageId || sendResponse?.name || null,
      });
    } catch (error) {
      failedSends.push({
        reminderKey: reminder.reminderKey,
        source: reminder.source,
        gameId: reminder.gameId,
        gameName: reminder.gameName,
        message: error?.message || "Unknown send error",
      });
    }
  }

  if (!dryRun) {
    await writeReminderState(state);
  }

  return {
    success: failedSources.length === 0 && failedSends.length === 0,
    dryRun,
    reminderMinutes: REMINDER_MINUTES,
    reminderWindowSeconds: REMINDER_WINDOW_SECONDS,
    timezoneOffsetMinutes: REMINDER_TIMEZONE_OFFSET_MINUTES,
    runAt: new Date(nowMs).toISOString(),
    totals: {
      sources: GAME_SOURCES.length,
      dueCandidates: dueReminders.length,
      sent: sent.length,
      skippedAlreadySent: skippedAlreadySent.length,
      failedSources: failedSources.length,
      failedSends: failedSends.length,
    },
    fetchSummary,
    failedSources,
    sent,
    skippedAlreadySent,
    failedSends,
  };
};

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { message: "Unauthorized cron call." },
        { status: 401 },
      );
    }

    const result = await runReminderJob(request);
    return NextResponse.json(result, {
      status: result.success ? 200 : 207,
    });
  } catch (error) {
    console.error("Close reminder job failed:", error);
    return NextResponse.json(
      {
        message: error?.message || "Failed to run close reminder job.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  return POST(request);
}
