import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ReduxProvider } from '@/store/ReduxProvider';
import AuthSessionGuard from '@/components/backendcomponents/AuthSessionGuard';
import MainHeaderFooter from '@/components/backendcomponents/MainHeaderFooter';
import Pageloading from '@/app/Pageloading';
import Loader from '@/app/loading';
import '../public/admin-assets/styles/style.css';
import '../public/admin-assets/fonts/font.css';
// Lazy-load pages
const Login = React.lazy(() => import('@/app/login/page'));
const Dashboard = React.lazy(() => import('@/app/dashboard/page'));
const ActiveUsers = React.lazy(() => import('@/app/active-users/page'));
const InactiveUsers = React.lazy(() => import('@/app/Inactive-users/page'));
const AddFund = React.lazy(() => import('@/app/add-fund/page'));
const DeductFund = React.lazy(() => import('@/app/deduct-fund/page'));
const FundRequests = React.lazy(() => import('@/app/fund-requests/page'));
const WithdrawRequests = React.lazy(() => import('@/app/withdraw-requests/page'));
const Transaction = React.lazy(() => import('@/app/transaction/page'));
const BiddingHistory = React.lazy(() => import('@/app/bidding-history/page'));
const BiddingHistoryGali = React.lazy(() => import('@/app/bidding-history-gali/page'));
const BiddingHistoryStarline = React.lazy(() => import('@/app/bidding-history-starline/page'));
const DeclareResult = React.lazy(() => import('@/app/declare-result/page'));
const DeclaredResultsStarline = React.lazy(() => import('@/app/declared-results-starline/page'));
const StarlineDeclareResult = React.lazy(() => import('@/app/starline-declare-result/page'));
const GaliDesawarDeclareResult = React.lazy(() => import('@/app/gali-desawar-declare-result/page'));
const GameManagement = React.lazy(() => import('@/app/game-management/page'));
const MainGameRates = React.lazy(() => import('@/app/main-game-rates/page'));
const StarlineGameRates = React.lazy(() => import('@/app/starline-game-rates/page'));
const GaliDesawarGameRates = React.lazy(() => import('@/app/gali-desawar-game-rates/page'));
const StarlineGameName = React.lazy(() => import('@/app/starline-game-name/page'));
const GaliDesawarGameName = React.lazy(() => import('@/app/gali-desawar-game-name/page'));
const ManageBanner = React.lazy(() => import('@/app/manage-banner/page'));
const Enquiry = React.lazy(() => import('@/app/enquiry/page'));
const AllAdmins = React.lazy(() => import('@/app/all-admins/page'));
const Notifications = React.lazy(() => import('@/app/notifications/page'));
const SettingPage = React.lazy(() => import('@/app/setting-page/page'));
export default function App() {
    return (_jsx(ReduxProvider, { children: _jsxs(BrowserRouter, { children: [_jsx(Loader, {}), _jsxs(AuthSessionGuard, { children: [_jsx(MainHeaderFooter, {}), _jsx(Suspense, { fallback: _jsx(Pageloading, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/active-users", element: _jsx(ActiveUsers, {}) }), _jsx(Route, { path: "/Inactive-users", element: _jsx(InactiveUsers, {}) }), _jsx(Route, { path: "/add-fund", element: _jsx(AddFund, {}) }), _jsx(Route, { path: "/deduct-fund", element: _jsx(DeductFund, {}) }), _jsx(Route, { path: "/fund-requests", element: _jsx(FundRequests, {}) }), _jsx(Route, { path: "/withdraw-requests", element: _jsx(WithdrawRequests, {}) }), _jsx(Route, { path: "/transaction", element: _jsx(Transaction, {}) }), _jsx(Route, { path: "/bidding-history", element: _jsx(BiddingHistory, {}) }), _jsx(Route, { path: "/bidding-history-gali", element: _jsx(BiddingHistoryGali, {}) }), _jsx(Route, { path: "/bidding-history-starline", element: _jsx(BiddingHistoryStarline, {}) }), _jsx(Route, { path: "/declare-result", element: _jsx(DeclareResult, {}) }), _jsx(Route, { path: "/declared-results-starline", element: _jsx(DeclaredResultsStarline, {}) }), _jsx(Route, { path: "/starline-declare-result", element: _jsx(StarlineDeclareResult, {}) }), _jsx(Route, { path: "/gali-desawar-declare-result", element: _jsx(GaliDesawarDeclareResult, {}) }), _jsx(Route, { path: "/game-management", element: _jsx(GameManagement, {}) }), _jsx(Route, { path: "/main-game-rates", element: _jsx(MainGameRates, {}) }), _jsx(Route, { path: "/starline-game-rates", element: _jsx(StarlineGameRates, {}) }), _jsx(Route, { path: "/gali-desawar-game-rates", element: _jsx(GaliDesawarGameRates, {}) }), _jsx(Route, { path: "/starline-game-name", element: _jsx(StarlineGameName, {}) }), _jsx(Route, { path: "/gali-desawar-game-name", element: _jsx(GaliDesawarGameName, {}) }), _jsx(Route, { path: "/manage-banner", element: _jsx(ManageBanner, {}) }), _jsx(Route, { path: "/enquiry", element: _jsx(Enquiry, {}) }), _jsx(Route, { path: "/all-admins", element: _jsx(AllAdmins, {}) }), _jsx(Route, { path: "/notifications", element: _jsx(Notifications, {}) }), _jsx(Route, { path: "/setting-page", element: _jsx(SettingPage, {}) })] }) })] }), _jsx(Toaster, { position: "top-center", reverseOrder: true, toastOptions: {
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
                    } })] }) }));
}
