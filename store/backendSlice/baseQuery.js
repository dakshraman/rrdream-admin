import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    // Content-Type is set automatically for JSON, and explicitly for FormData if needed (though usually browser handles FormData)
    // If not FormData, we might want to default to application/json, but fetchBaseQuery does this for body objects usually.
    // Existing authAPISlice was setting it explicitly, so we can keep it if body is not FormData.
    if (!headers.has("Content-Type") && !headers.get("Content-Type")) {
         headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});
