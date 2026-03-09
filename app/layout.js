import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from 'react';
import "../public/admin-assets/styles/style.css";
import MainHeaderFooter from "@/components/backendcomponents/MainHeaderFooter";
import AuthSessionGuard from "@/components/backendcomponents/AuthSessionGuard";
import Loader from "@/app/loading";
import '../public/admin-assets/fonts/font.css';
import { Toaster } from 'react-hot-toast';
import { ReduxProvider } from "../store/ReduxProvider";
export const metadata = {
    title: "RDream Admin Panel",
    description: "RDream Admin Panel",
};
export default function AdminLayout({ children }) {
    return (_jsx("html", { lang: "en", children: _jsx("body", { "cz-shortcut-listen": "true", children: _jsxs(ReduxProvider, { children: [_jsx(Loader, {}), _jsxs(AuthSessionGuard, { children: [_jsx(MainHeaderFooter, {}), _jsx(Suspense, { fallback: _jsx(Loader, {}), children: children })] }), _jsx(Toaster, { position: "top-center", reverseOrder: true, toastOptions: {
                            duration: 1000,
                            style: {
                                borderRadius: '8px',
                                padding: '12px 16px',
                                color: '#fff',
                            },
                            success: {
                                style: { background: '#22c55e' },
                                iconTheme: {
                                    primary: '#ffffff',
                                    secondary: '#16a34a',
                                },
                            },
                            error: {
                                style: { background: '#ef4444' },
                                iconTheme: {
                                    primary: '#ffffff',
                                    secondary: '#b91c1c',
                                },
                            },
                        } })] }) }) }));
}
