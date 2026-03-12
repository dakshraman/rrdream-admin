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
  return (
    <ReduxProvider>
      <BrowserRouter>
        <Loader />
        <AuthSessionGuard>
          <MainHeaderFooter />
          <Suspense fallback={<Pageloading />}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/active-users" element={<ActiveUsers />} />
              <Route path="/Inactive-users" element={<InactiveUsers />} />
              <Route path="/add-fund" element={<AddFund />} />
              <Route path="/deduct-fund" element={<DeductFund />} />
              <Route path="/fund-requests" element={<FundRequests />} />
              <Route path="/withdraw-requests" element={<WithdrawRequests />} />
              <Route path="/transaction" element={<Transaction />} />
              <Route path="/bidding-history" element={<BiddingHistory />} />
              <Route path="/bidding-history-gali" element={<BiddingHistoryGali />} />
              <Route path="/bidding-history-starline" element={<BiddingHistoryStarline />} />
              <Route path="/declare-result" element={<DeclareResult />} />
              <Route path="/declared-results-starline" element={<DeclaredResultsStarline />} />
              <Route path="/starline-declare-result" element={<StarlineDeclareResult />} />
              <Route path="/gali-desawar-declare-result" element={<GaliDesawarDeclareResult />} />
              <Route path="/game-management" element={<GameManagement />} />
              <Route path="/main-game-rates" element={<MainGameRates />} />
              <Route path="/starline-game-rates" element={<StarlineGameRates />} />
              <Route path="/gali-desawar-game-rates" element={<GaliDesawarGameRates />} />
              <Route path="/starline-game-name" element={<StarlineGameName />} />
              <Route path="/gali-desawar-game-name" element={<GaliDesawarGameName />} />
              <Route path="/manage-banner" element={<ManageBanner />} />
              <Route path="/enquiry" element={<Enquiry />} />
              <Route path="/all-admins" element={<AllAdmins />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/setting-page" element={<SettingPage />} />
            </Routes>
          </Suspense>
        </AuthSessionGuard>
        <Toaster
          position="top-center"
          reverseOrder={true}
          toastOptions={{
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
          }}
        />
      </BrowserRouter>
    </ReduxProvider>
  );
}