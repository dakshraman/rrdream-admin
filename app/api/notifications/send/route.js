import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { createSign, randomUUID } from "node:crypto";

export const runtime = "nodejs";

const SERVICE_ACCOUNT_FILE_NAME =
  "rrdream-4d72e-firebase-adminsdk-fbsvc-879335a36d.json";
const DEFAULT_SERVICE_ACCOUNT_PATH = path.join(
  process.cwd(),
  SERVICE_ACCOUNT_FILE_NAME,
);
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const DEFAULT_BROADCAST_TOPIC = process.env.FCM_BROADCAST_TOPIC || "all-users";
const ANDROID_PACKAGE_NAME =
  process.env.FCM_ANDROID_PACKAGE_NAME || "com.rr.dream";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_RETENTION_MS = 24 * 60 * 60 * 1000;
const NOTIFICATION_IMAGE_DIR = path.join(
  process.cwd(),
  "public",
  "OnlineImages",
  "NotificationImages",
);
const NOTIFICATION_IMAGE_PUBLIC_PREFIX = "/OnlineImages/NotificationImages";
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const IMAGE_EXTENSION_BY_MIME_TYPE = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
]);

let cachedServiceAccount = null;
let cachedAccessToken = {
  token: null,
  expiresAt: 0,
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const toBase64Url = (value) => Buffer.from(value).toString("base64url");

const normalizeDataPayload = (data) => {
  if (!data) return undefined;
  if (!isPlainObject(data)) {
    throw new Error("`data` must be a JSON object.");
  }

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

  if (isPlainObject(input)) {
    return input;
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return undefined;

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error("Data JSON is invalid.");
    }

    if (!isPlainObject(parsed)) {
      throw new Error("Data JSON must be an object.");
    }

    return parsed;
  }

  throw new Error("Data JSON must be an object.");
};

const getRequestBaseUrl = (request) => {
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

const cleanupOldNotificationImages = async () => {
  let files;
  try {
    files = await fs.readdir(NOTIFICATION_IMAGE_DIR, { withFileTypes: true });
  } catch (error) {
    // Nothing to clean if the directory doesn't exist yet.
    if (error?.code === "ENOENT") return;
    throw error;
  }

  const now = Date.now();
  await Promise.all(
    files.map(async (entry) => {
      if (!entry.isFile()) return;
      const absolutePath = path.join(NOTIFICATION_IMAGE_DIR, entry.name);

      let stats;
      try {
        stats = await fs.stat(absolutePath);
      } catch {
        return;
      }

      const ageMs = now - stats.mtimeMs;
      if (ageMs <= IMAGE_RETENTION_MS) return;

      try {
        await fs.unlink(absolutePath);
      } catch {
        // Ignore deletion race conditions (already removed, etc.).
      }
    }),
  );
};

const saveUploadedImage = async (file, request) => {
  if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
    return "";
  }

  if (!file.size) return "";

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image size must be 5MB or less.");
  }

  const mimeType = String(file.type || "").toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new Error("Unsupported image type. Use PNG, JPG, WEBP, or GIF.");
  }

  await fs.mkdir(NOTIFICATION_IMAGE_DIR, { recursive: true });

  const originalName = String(file.name || "");
  const extensionFromName = path.extname(originalName).toLowerCase();
  const safeExtension = ALLOWED_IMAGE_EXTENSIONS.has(extensionFromName)
    ? extensionFromName
    : IMAGE_EXTENSION_BY_MIME_TYPE[mimeType] || ".png";

  const fileName = `${Date.now()}-${randomUUID()}${safeExtension}`;
  const absolutePath = path.join(NOTIFICATION_IMAGE_DIR, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolutePath, buffer);

  const relativeUrl = `${NOTIFICATION_IMAGE_PUBLIC_PREFIX}/${fileName}`;
  const baseUrl = getRequestBaseUrl(request);
  return baseUrl ? `${baseUrl}${relativeUrl}` : relativeUrl;
};

const parseRequestPayload = async (request) => {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const notificationBody = String(formData.get("body") || "").trim();
    const dataField = formData.get("data");
    const data = parseDataInput(typeof dataField === "string" ? dataField : undefined);
    const imageFile = formData.get("imageFile");
    const imageUrl = await saveUploadedImage(imageFile, request);

    return { title, notificationBody, imageUrl, data };
  }

  const body = await request.json();
  const title = String(body?.title || "").trim();
  const notificationBody = String(body?.body || "").trim();
  const imageUrl = String(body?.imageUrl || "").trim();
  const data = parseDataInput(body?.data);

  return { title, notificationBody, imageUrl, data };
};

const loadServiceAccount = async () => {
  if (cachedServiceAccount) return cachedServiceAccount;

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || DEFAULT_SERVICE_ACCOUNT_PATH;

  let rawServiceAccount;
  try {
    rawServiceAccount = await fs.readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(
      `Unable to read Firebase service account file at ${filePath}.`,
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(rawServiceAccount);
  } catch {
    throw new Error("Firebase service account file is not valid JSON.");
  }

  const requiredFields = ["project_id", "client_email", "private_key"];
  const missingFields = requiredFields.filter((field) => !parsed?.[field]);
  if (missingFields.length) {
    throw new Error(
      `Firebase service account file is missing: ${missingFields.join(", ")}.`,
    );
  }

  cachedServiceAccount = parsed;
  return parsed;
};

const createServiceAccountAssertion = (serviceAccount) => {
  const tokenUri = serviceAccount.token_uri || GOOGLE_OAUTH_TOKEN_URL;
  const issuedAt = Math.floor(Date.now() / 1000);

  const jwtHeader = {
    alg: "RS256",
    typ: "JWT",
  };

  const jwtPayload = {
    iss: serviceAccount.client_email,
    scope: FCM_SCOPE,
    aud: tokenUri,
    iat: issuedAt,
    exp: issuedAt + 3600,
  };

  const encodedHeader = toBase64Url(JSON.stringify(jwtHeader));
  const encodedPayload = toBase64Url(JSON.stringify(jwtPayload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key, "base64url");

  return `${unsignedToken}.${signature}`;
};

const getAccessToken = async (serviceAccount) => {
  const now = Date.now();
  if (cachedAccessToken.token && now < cachedAccessToken.expiresAt) {
    return cachedAccessToken.token;
  }

  const assertion = createServiceAccountAssertion(serviceAccount);
  const tokenUri = serviceAccount.token_uri || GOOGLE_OAUTH_TOKEN_URL;

  const response = await fetch(tokenUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMessage =
      payload?.error_description ||
      payload?.error ||
      `Google OAuth token request failed (${response.status}).`;
    throw new Error(errorMessage);
  }

  if (!payload?.access_token) {
    throw new Error("Google OAuth token response did not include access_token.");
  }

  const expiresInSeconds = Number(payload.expires_in) || 3600;
  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: now + Math.max(expiresInSeconds - 60, 60) * 1000,
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

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      payload?.error?.message ||
        `FCM send request failed with status ${response.status}.`,
    );
    error.details = payload;
    throw error;
  }

  return payload;
};

const buildBaseMessage = ({ title, body, imageUrl, data }) => {
  const normalizedData = normalizeDataPayload(data) || {};
  const message = {
    notification: {
      title: title.trim(),
      body: body.trim(),
    },
    android: {
      priority: "HIGH",
      ttl: "3600s",
      notification: {
        sound: "default",
      },
    },
  };

  if (ANDROID_PACKAGE_NAME.trim()) {
    message.android.restricted_package_name = ANDROID_PACKAGE_NAME.trim();
  }

  if (imageUrl?.trim()) {
    const normalizedImageUrl = imageUrl.trim();
    message.notification.image = normalizedImageUrl;
    message.android.notification.image = normalizedImageUrl;
    // Keep image URL in data payload too so foreground handlers can render it.
    if (!normalizedData.image_url) {
      normalizedData.image_url = normalizedImageUrl;
    }
  }

  if (Object.keys(normalizedData).length > 0) {
    message.data = normalizedData;
  }

  return message;
};

export async function POST(request) {
  try {
    await cleanupOldNotificationImages();

    const { title, notificationBody, imageUrl, data } =
      await parseRequestPayload(request);
    const topic = String(DEFAULT_BROADCAST_TOPIC)
      .trim()
      .replace(/^\/topics\//, "");

    if (!title || !notificationBody) {
      return NextResponse.json(
        { message: "Both title and body are required." },
        { status: 400 },
      );
    }

    if (!topic) {
      return NextResponse.json(
        { message: "Broadcast topic is missing." },
        { status: 400 },
      );
    }

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

    return NextResponse.json({
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
    return NextResponse.json(
      { message: error?.message || "Failed to send notification." },
      { status: 500 },
    );
  }
}
