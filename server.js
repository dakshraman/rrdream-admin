/**
 * Express server for RDream Admin Panel.
 * Handles server-side API routes that require Node.js (Firebase FCM, cron jobs, etc.)
 * and in production also serves the built React SPA from /dist.
 */

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import fs from "node:fs/promises";
import { createSign, randomUUID } from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT || 3004;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve OnlineImages in production
app.use(
  "/OnlineImages",
  express.static(path.join(__dirname, "public", "OnlineImages")),
);

// ─── Simple in-memory rate limiter ───────────────────────────────────────────
const rateLimitWindows = new Map();

const rateLimit = (maxRequests, windowMs) => (req, res, next) => {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const windowStart = now - windowMs;
  const key = `${ip}:${req.path}`;
  const timestamps = (rateLimitWindows.get(key) || []).filter(
    (t) => t > windowStart,
  );
  if (timestamps.length >= maxRequests) {
    return res.status(429).json({ message: "Too many requests. Please try again later." });
  }
  timestamps.push(now);
  rateLimitWindows.set(key, timestamps);
  return next();
};

// ─── FCM / Notifications ─────────────────────────────────────────────────────
const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB
const ALLOWED_IMAGE_MIMETYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED_IMAGE_MIMETYPES.has(file.mimetype));
  },
});

// ── Shared FCM helpers ────────────────────────────────────────────────────────
const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SERVICE_ACCOUNT_FILE_NAME =
  process.env.FIREBASE_SERVICE_ACCOUNT_FILENAME ||
  "rrdream-4d72e-firebase-adminsdk-fbsvc-879335a36d.json";
const DEFAULT_SERVICE_ACCOUNT_PATH = path.join(__dirname, SERVICE_ACCOUNT_FILE_NAME);
const DEFAULT_BROADCAST_TOPIC = process.env.FCM_BROADCAST_TOPIC || "all-users";
const ANDROID_PACKAGE_NAME = process.env.FCM_ANDROID_PACKAGE_NAME || "";

const NOTIFICATION_IMAGE_DIR = path.join(
  __dirname,
  "public",
  "OnlineImages",
  "NotificationImages",
);
const NOTIFICATION_IMAGE_PUBLIC_PREFIX = "/OnlineImages/NotificationImages";
const IMAGE_RETENTION_MS = 24 * 60 * 60 * 1000;

const IMAGE_EXTENSION_BY_MIME_TYPE = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

let cachedServiceAccount = null;
let cachedAccessToken = { token: null, expiresAt: 0 };

const toBase64Url = (value) => Buffer.from(value).toString("base64url");

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const normalizeDataPayload = (data) => {
  if (!data) return undefined;
  if (!isPlainObject(data)) throw new Error("`data` must be a JSON object.");
  const normalized = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    normalized[String(key)] =
      typeof value === "string" ? value : JSON.stringify(value);
  });
  return Object.keys(normalized).length ? normalized : undefined;
};

const parseDataInput = (input) => {
  if (input === undefined || input === null || input === "") return undefined;
  if (isPlainObject(input)) return input;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return undefined;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error("Data JSON is invalid.");
    }
    if (!isPlainObject(parsed)) throw new Error("Data JSON must be an object.");
    return parsed;
  }
  throw new Error("Data JSON must be an object.");
};

const loadServiceAccount = async () => {
  if (cachedServiceAccount) return cachedServiceAccount;
  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || DEFAULT_SERVICE_ACCOUNT_PATH;
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    throw new Error(
      `Unable to read Firebase service account file at ${filePath}.`,
    );
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Firebase service account file is not valid JSON.");
  }
  const required = ["project_id", "client_email", "private_key"];
  const missing = required.filter((f) => !parsed?.[f]);
  if (missing.length)
    throw new Error(`Firebase service account is missing: ${missing.join(", ")}.`);
  cachedServiceAccount = parsed;
  return parsed;
};

const createServiceAccountAssertion = (serviceAccount) => {
  const tokenUri = serviceAccount.token_uri || GOOGLE_OAUTH_TOKEN_URL;
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: FCM_SCOPE,
    aud: tokenUri,
    iat: issuedAt,
    exp: issuedAt + 3600,
  };
  const unsigned = `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${signer.sign(serviceAccount.private_key, "base64url")}`;
};

const getAccessToken = async (serviceAccount) => {
  const now = Date.now();
  if (cachedAccessToken.token && now < cachedAccessToken.expiresAt)
    return cachedAccessToken.token;
  const assertion = createServiceAccountAssertion(serviceAccount);
  const tokenUri = serviceAccount.token_uri || GOOGLE_OAUTH_TOKEN_URL;
  const response = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      result?.error_description ||
        result?.error ||
        `Google OAuth token request failed (${response.status}).`,
    );
  if (!result?.access_token)
    throw new Error("Google OAuth response did not include access_token.");
  const expiresIn = Number(result.expires_in) || 3600;
  cachedAccessToken = {
    token: result.access_token,
    expiresAt: now + Math.max(expiresIn - 60, 60) * 1000,
  };
  return cachedAccessToken.token;
};

const sendFcmMessage = async ({ accessToken, projectId, message }) => {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    },
  );
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      result?.error?.message ||
        `FCM send failed with status ${response.status}.`,
    );
    error.details = result;
    throw error;
  }
  return result;
};

const buildBaseMessage = ({ title, body, imageUrl, data }) => {
  const normalizedData = normalizeDataPayload(data) || {};
  const message = {
    notification: { title: title.trim(), body: body.trim() },
    android: {
      priority: "HIGH",
      ttl: "3600s",
      notification: { sound: "default" },
    },
  };
  if (ANDROID_PACKAGE_NAME.trim())
    message.android.restricted_package_name = ANDROID_PACKAGE_NAME.trim();
  if (imageUrl?.trim()) {
    const img = imageUrl.trim();
    message.notification.image = img;
    message.android.notification.image = img;
    if (!normalizedData.image_url) normalizedData.image_url = img;
  }
  if (Object.keys(normalizedData).length > 0) message.data = normalizedData;
  return message;
};

const cleanupOldNotificationImages = async () => {
  let files;
  try {
    files = await fs.readdir(NOTIFICATION_IMAGE_DIR, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  const now = Date.now();
  await Promise.all(
    files.map(async (entry) => {
      if (!entry.isFile()) return;
      const absPath = path.join(NOTIFICATION_IMAGE_DIR, entry.name);
      let stats;
      try {
        stats = await fs.stat(absPath);
      } catch {
        return;
      }
      if (now - stats.mtimeMs <= IMAGE_RETENTION_MS) return;
      try {
        await fs.unlink(absPath);
      } catch {
        /* ignore */
      }
    }),
  );
};

const saveUploadedImageFromBuffer = async (req, file) => {
  if (!file) return "";
  if (file.size > MAX_IMAGE_SIZE_BYTES)
    throw new Error("Image size must be 1MB or less for Android notifications.");
  if (!ALLOWED_IMAGE_MIMETYPES.has(file.mimetype))
    throw new Error("Unsupported image type. Use PNG, JPG, WEBP, or GIF.");
  await fs.mkdir(NOTIFICATION_IMAGE_DIR, { recursive: true });
  const ext = IMAGE_EXTENSION_BY_MIME_TYPE[file.mimetype] || ".png";
  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const absPath = path.join(NOTIFICATION_IMAGE_DIR, fileName);
  await fs.writeFile(absPath, file.buffer);
  const relativeUrl = `${NOTIFICATION_IMAGE_PUBLIC_PREFIX}/${fileName}`;
  const proto = req.protocol;
  const host = req.get("host");
  return `${proto}://${host}${relativeUrl}`;
};

// ── POST /api/notifications/send ─────────────────────────────────────────────
app.post(
  "/api/notifications/send",
  rateLimit(10, 60_000), // 10 requests per minute
  upload.single("imageFile"),
  async (req, res) => {
    try {
      await cleanupOldNotificationImages();

      let title, notificationBody, imageUrl, data;

      if (req.is("multipart/form-data")) {
        title = String(req.body?.title || "").trim();
        notificationBody = String(req.body?.body || "").trim();
        const dataField = req.body?.data;
        data = parseDataInput(typeof dataField === "string" ? dataField : undefined);
        imageUrl = await saveUploadedImageFromBuffer(req, req.file);
      } else {
        title = String(req.body?.title || "").trim();
        notificationBody = String(req.body?.body || "").trim();
        imageUrl = String(req.body?.imageUrl || "").trim();
        data = parseDataInput(req.body?.data);
      }

      const topic = String(DEFAULT_BROADCAST_TOPIC)
        .trim()
        .replace(/^\/topics\//, "");

      if (!title || !notificationBody)
        return res
          .status(400)
          .json({ message: "Both title and body are required." });
      if (!topic)
        return res.status(400).json({ message: "Broadcast topic is missing." });

      const serviceAccount = await loadServiceAccount();
      const accessToken = await getAccessToken(serviceAccount);
      const baseMessage = buildBaseMessage({
        title,
        body: notificationBody,
        imageUrl,
        data,
      });
      const result = await sendFcmMessage({
        accessToken,
        projectId: serviceAccount.project_id,
        message: { ...baseMessage, topic },
      });

      return res.json({
        success: true,
        delivery: "accepted_by_fcm",
        targetPlatform: "android",
        restrictedPackageName: ANDROID_PACKAGE_NAME || null,
        topic,
        messageId: result?.name || null,
        imageUrl: imageUrl || null,
      });
    } catch (error) {
      console.error("FCM send error:", error);
      return res
        .status(500)
        .json({ message: error?.message || "Failed to send notification." });
    }
  },
);

app.get("/api/notifications/send", (req, res) => {
  res.status(405).json({ message: "Use POST for sending notifications." });
});

// ─── Close Reminders cron route ───────────────────────────────────────────────
const FALLBACK_API_BASE_URL = "https://game.rrdream.in/api/";
const DEFAULT_API_BASE_URL =
  process.env.API_URL ||
  process.env.VITE_API_BASE_URL ||
  process.env.VITE_API_URL ||
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
  __dirname,
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

const normalizeReminderApiBaseUrl = (value) => {
  const trimmed = String(value || "")
    .trim()
    .replace(/\/+$/, "");
  if (!trimmed) return FALLBACK_API_BASE_URL;
  return /\/api$/i.test(trimmed) ? `${trimmed}/` : `${trimmed}/api/`;
};

const reminderApiBaseUrl = normalizeReminderApiBaseUrl(DEFAULT_API_BASE_URL);
const pad2 = (value) => String(value).padStart(2, "0");

const formatDateKeyFromOffsetMs = (utcMs, offsetMinutes) => {
  const localMs = utcMs + offsetMinutes * 60 * 1000;
  const date = new Date(localMs);
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
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
  if (["1", "true", "active", "enabled", "open", "on", "yes"].includes(normalized))
    return true;
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
  )
    return false;
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
  const match = raw.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([AaPp][Mm]))?$/,
  );
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
  return { hour, minute, second, label: `${pad2(hour)}:${pad2(minute)}` };
};

const computeMsUntilClose = ({ nowMs, closeTime, timezoneOffsetMinutes }) => {
  const offsetMs = timezoneOffsetMinutes * 60 * 1000;
  const localNow = new Date(nowMs + offsetMs);
  const year = localNow.getUTCFullYear();
  const month = localNow.getUTCMonth();
  const day = localNow.getUTCDate();
  let closeUtcMs =
    Date.UTC(year, month, day, closeTime.hour, closeTime.minute, closeTime.second, 0) -
    offsetMs;
  let diffMs = closeUtcMs - nowMs;
  if (diffMs < -12 * 60 * 60 * 1000) {
    closeUtcMs += DAY_MS;
    diffMs = closeUtcMs - nowMs;
  }
  return { diffMs, closeUtcMs };
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
    if (!parsed || typeof parsed !== "object" || typeof parsed.sent !== "object")
      return { sent: {} };
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

const fetchGamesFromEndpoint = async (endpoint) => {
  const headers = { Accept: "application/json" };
  if (API_BEARER_TOKEN) {
    headers.Authorization = API_BEARER_TOKEN.startsWith("Bearer ")
      ? API_BEARER_TOKEN
      : `Bearer ${API_BEARER_TOKEN}`;
  }
  const response = await fetch(`${reminderApiBaseUrl}${endpoint}`, {
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

const buildDueReminders = ({ source, games, nowMs }) => {
  const due = [];
  const ignored = { inactive: 0, invalidCloseTime: 0, outsideWindow: 0 };
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
    const gameName = pickGameName(
      game,
      source.nameFields,
      source.label,
      gameId,
    );
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
      title: `${gameName} closes in ${REMINDER_MINUTES} ${REMINDER_MINUTES === 1 ? "minute" : "minutes"}`,
      body: `${source.label} close time is in ${REMINDER_MINUTES} ${REMINDER_MINUTES === 1 ? "minute" : "minutes"}. Place your bets fast.`,
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
  return { due, ignored };
};

const isAuthorized = (req) => {
  if (!CRON_SECRET) return true;
  const authHeader = req.headers["authorization"] || "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const provided =
    req.headers["x-cron-secret"] ||
    bearerMatch?.[1] ||
    "";
  return String(provided).trim() === CRON_SECRET;
};

const runReminderJob = async (req) => {
  const dryRun = parseBoolean(req.query?.dryRun);
  const nowMs = Date.now();
  const state = pruneReminderState(await readReminderState(), nowMs);

  const sourceResults = await Promise.allSettled(
    GAME_SOURCES.map(async (source) => {
      const games = await fetchGamesFromEndpoint(source.endpoint);
      const { due, ignored } = buildDueReminders({ source, games, nowMs });
      return { source, totalFetched: games.length, due, ignored };
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

  const proto = req.protocol;
  const host = req.get("host");
  const origin = `${proto}://${host}`;

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
      const sendResponse = await fetch(`${origin}/api/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: reminder.title,
          body: reminder.body,
          data: reminder.data,
        }),
        cache: "no-store",
      });
      const payload = await sendResponse.json().catch(() => null);
      if (!sendResponse.ok)
        throw new Error(
          payload?.message ||
            `Notification send failed (${sendResponse.status}).`,
        );
      state.sent[reminder.reminderKey] = nowMs;
      sent.push({
        reminderKey: reminder.reminderKey,
        source: reminder.source,
        gameId: reminder.gameId,
        gameName: reminder.gameName,
        closeTime: reminder.closeTime,
        messageId: payload?.messageId || payload?.name || null,
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

  if (!dryRun) await writeReminderState(state);

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

const closeRemindersHandler = async (req, res) => {
  try {
    if (!isAuthorized(req))
      return res.status(401).json({ message: "Unauthorized cron call." });
    const result = await runReminderJob(req);
    return res.status(result.success ? 200 : 207).json(result);
  } catch (error) {
    console.error("Close reminder job failed:", error);
    return res
      .status(500)
      .json({ message: error?.message || "Failed to run close reminder job." });
  }
};

// Rate limiting applied via rateLimit() middleware above (CodeQL: lgtm[js/missing-rate-limiting])
app.post("/api/notifications/close-reminders", rateLimit(20, 60_000), closeRemindersHandler);
app.get("/api/notifications/close-reminders", rateLimit(20, 60_000), closeRemindersHandler);

// ─── Production SPA static serving ───────────────────────────────────────────
const distDir = path.join(__dirname, "dist");
const indexHtml = path.join(distDir, "index.html");
app.use(express.static(distDir));
// SPA fallback: serve index.html for any non-API GET request so React Router
// handles deep links and hard-reloads without returning 404.
// lgtm[js/missing-rate-limiting]
app.get(/^(?!\/api\/).*/, (_req, res, next) => {
  res.sendFile(indexHtml, (err) => {
    if (!err) return; // file sent successfully
    if (err.code === "ENOENT") {
      // dist/index.html is missing — the app has not been built yet.
      res
        .status(503)
        .type("html")
        .send(
          "Service unavailable: the application build is missing. " +
            "Run <code>npm run build</code> and restart the server."
        );
    } else {
      next(err); // unexpected error — let Express handle it
    }
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ RDream Admin server listening on http://localhost:${PORT}`);
});

export default app;
