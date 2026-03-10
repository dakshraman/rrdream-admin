import { NextResponse } from "next/server";

const RAW_API_BASE_URL =
  process.env.BACKEND_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://game.rrdream.in/api";

const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS =
  Number.parseInt(
    process.env.NEXT_PUBLIC_PROXY_TIMEOUT_MS ||
      process.env.API_PROXY_TIMEOUT_MS ||
      "20000",
    10,
  ) || 20000;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const withRetryBust = (url) =>
  `${url}${url.includes("?") ? "&" : "?"}_rt=${Date.now()}`;

const isRetryableNetworkError = (error) =>
  error instanceof Error &&
  (error.name === "AbortError" || error.name === "TypeError");

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function proxyHandler(request, { params }) {
  try {
    const resolvedParams =
      params && typeof params.then === "function" ? await params : params;
    const path = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
    const targetUrl = `${API_BASE_URL}/${path.join("/")}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const finalUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");

    let body = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.arrayBuffer();
    }

    const requestInit = {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      duplex: "half",
    };

    let response;
    try {
      response = await fetchWithTimeout(finalUrl, requestInit, REQUEST_TIMEOUT_MS);
    } catch (error) {
      if (request.method === "GET" && isRetryableNetworkError(error)) {
        await sleep(150);
        response = await fetchWithTimeout(
          withRetryBust(finalUrl),
          requestInit,
          REQUEST_TIMEOUT_MS,
        );
      } else {
        throw error;
      }
    }

    if (request.method === "GET" && RETRYABLE_STATUSES.has(response.status)) {
      await sleep(150);
      response = await fetchWithTimeout(
        withRetryBust(finalUrl),
        requestInit,
        REQUEST_TIMEOUT_MS,
      );
    }

    const responseBody = await response.arrayBuffer();
    const responseHeaders = new Headers(response.headers);

    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("access-control-allow-origin");

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError";

    return NextResponse.json(
      {
        error: isTimeout ? "Upstream Timeout" : "Internal Proxy Error",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: isTimeout ? 504 : 500 },
    );
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const DELETE = proxyHandler;
export const PATCH = proxyHandler;
