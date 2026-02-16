import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authReducer";

const baseUrl = "/api";

const baseQueryRaw = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (!headers.has("Content-Type") && !headers.get("Content-Type")) {
         headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});

export const baseQuery = async (args, api, extraOptions) => {
    // Log Request
    const { url, method, body, params } = typeof args === 'string' ? { url: args, method: 'GET' } : args;
    const token = api.getState().auth?.token;
    
    console.groupCollapsed(`API Request: ${method || 'GET'} ${url}`);
    console.log("Full URL:", `${baseUrl}/${url}`);
    console.log("Method:", method || 'GET');
    console.log("Params/Body:", body || params || "None");
    console.log("Token:", token ? `Bearer ${token.substring(0, 10)}...` : "None");
    console.groupEnd();

    const result = await baseQueryRaw(args, api, extraOptions);

    // Log Response
    console.groupCollapsed(`API Response: ${method || 'GET'} ${url}`);
    console.log("Status:", result.meta?.response?.status);
    if (result.error) {
        console.error("Error:", result.error);
        if (result.error.status === 401 || result.error.status === 422) {
            console.warn("Auth Error or Validation Error (401/422) - Clearing Session");
            api.dispatch(logout()); // Dispatch logout action
            
            // Clear storage explicitly
            if (typeof window !== "undefined") {
                localStorage.clear(); 
                sessionStorage.clear();
                // Redirect to login
                setTimeout(() => {
                   window.location.href = "/login";
                }, 100);
            }
        }
    } else {
        console.log("Data:", result.data);
    }
    console.groupEnd();

    return result;
};
