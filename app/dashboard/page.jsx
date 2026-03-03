"use client";
export const dynamic = "force-dynamic";

import { useMemo, useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  useGetUsersQuery,
  useGetWithdrawRequestsQuery,
  useGetFundRequestsQuery,
  useGetProfitQuery,
  useGetConfigQuery,
} from "@/store/backendSlice/apiAPISlice";

const parseAmount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatRupees = (value) => `₹${parseAmount(value).toLocaleString("en-IN")}`;

const normalizeProfitPeriod = (period = {}) => ({
  bidProfit: parseAmount(period.bid_profit),
  fundsProfit: parseAmount(period.funds_profit),
  totalBids: parseAmount(period.total_bids),
  totalDeposits: parseAmount(period.total_deposits),
  totalWinAmount: parseAmount(period.total_win_amount),
  totalWithdrawals: parseAmount(period.total_withdrawals),
});

const profitMetricConfig = [
  { key: "bidProfit", label: "Bid Profit" },
  { key: "fundsProfit", label: "Funds Profit" },
  { key: "totalBids", label: "Total Bids" },
  { key: "totalDeposits", label: "Total Deposits" },
  { key: "totalWinAmount", label: "Win Amount" },
  { key: "totalWithdrawals", label: "Withdrawals" },
];

export default function Dashboard() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("7D");
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmallMobile = windowWidth < 400;
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: configData, isLoading: configLoading } = useGetConfigQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: withdrawData, isLoading: withdrawLoading } = useGetWithdrawRequestsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: fundData, isLoading: fundLoading } = useGetFundRequestsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: profitData, isLoading: profitLoading } = useGetProfitQuery({}, { refetchOnMountOrArgChange: true });

  const isLoading = usersLoading || configLoading || withdrawLoading || fundLoading || profitLoading;

  // Process Users Data
  // usersData: {message: '...', users: Array(88)}
  // configData: {status: true, config: {}, active_users_count: 88, inactive_users_count: 55}
  const usersStats = useMemo(() => {
    const users = usersData?.users || usersData?.data?.users || [];
    const fallbackTotalUsers = users.length;
    const fallbackActiveUsers = users.filter((u) => u.status === 1 || u.status === true).length;
    const fallbackInactiveUsers = Math.max(fallbackTotalUsers - fallbackActiveUsers, 0);

    const parsedActiveUsers = Number(configData?.active_users_count);
    const parsedInactiveUsers = Number(configData?.inactive_users_count);
    const hasActiveUsersFromConfig = Number.isFinite(parsedActiveUsers);
    const hasInactiveUsersFromConfig = Number.isFinite(parsedInactiveUsers);

    const activeUsers = hasActiveUsersFromConfig ? parsedActiveUsers : fallbackActiveUsers;
    const inactiveUsers = hasInactiveUsersFromConfig ? parsedInactiveUsers : fallbackInactiveUsers;
    const totalUsers = (hasActiveUsersFromConfig || hasInactiveUsersFromConfig)
      ? activeUsers + inactiveUsers
      : fallbackTotalUsers;

    return { totalUsers, activeUsers, inactiveUsers };
  }, [usersData, configData]);

  // Process Withdraw Requests
  // withdrawData: {status: true, withdraw_requests: Array(6)}
  // each: {id, amount, status: "approved"/"pending", transfer_to, user_id, user: {...}}
  const withdrawStats = useMemo(() => {
    const requests = withdrawData?.withdraw_requests || withdrawData?.data?.withdraw_requests || withdrawData?.data?.requests || withdrawData?.requests || [];
    const pending = Array.isArray(requests)
      ? requests.filter((r) => r.status === "pending" || r.status === 0).length
      : 0;
    const approved = Array.isArray(requests)
      ? requests.filter((r) => r.status === "approved" || r.status === 1).length
      : 0;
    const totalAmount = Array.isArray(requests)
      ? requests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)
      : 0;
    return { pending, approved, totalAmount };
  }, [withdrawData]);

  // Process Fund Requests
  // fundData: {status: true, fund_requests: Array(2)}
  // each: {fund_request_id, amount, status: "pending"/"approved", app_name, transaction_id, user_name, user_phone}
  const fundStats = useMemo(() => {
    const requests = fundData?.fund_requests || fundData?.data?.fund_requests || fundData?.data?.requests || fundData?.requests || [];
    const pending = Array.isArray(requests)
      ? requests.filter((r) => r.status === "pending" || r.status === 0).length
      : 0;
    const approved = Array.isArray(requests)
      ? requests.filter((r) => r.status === "approved" || r.status === 1).length
      : 0;
    const totalAmount = Array.isArray(requests)
      ? requests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)
      : 0;
    return { pending, approved, totalAmount };
  }, [fundData]);

  // Process Profit Data
  // profitData: {today: {bid_profit, funds_profit, total_bids, total_deposits, total_win_amount, total_withdrawals}, this_month: {...}, this_year: {...}}
  const profitStats = useMemo(() => {
    const today = normalizeProfitPeriod(profitData?.today);
    const thisMonth = normalizeProfitPeriod(profitData?.this_month);
    const thisYear = normalizeProfitPeriod(profitData?.this_year);

    // Build chart data from the 3 periods
    const dailyData = [
      {
        day: "Today",
        amount: today.totalBids,
        profit: today.bidProfit,
      },
      {
        day: "Month",
        amount: thisMonth.totalBids,
        profit: thisMonth.bidProfit,
      },
      {
        day: "Year",
        amount: thisYear.totalBids,
        profit: thisYear.bidProfit,
      },
    ];

    // Use this_month for summary stats
    const totalProfit = thisMonth.bidProfit;
    const totalBets = thisMonth.totalBids;

    const periodBreakdown = [
      { key: "today", label: "Today", values: today },
      { key: "this_month", label: "This Month", values: thisMonth },
      { key: "this_year", label: "This Year", values: thisYear },
    ];

    return {
      dailyData,
      totalProfit,
      totalBets,
      today,
      thisMonth,
      thisYear,
      periodBreakdown,
    };
  }, [profitData]);

  // Dashboard Stats
  const dashboardStats = useMemo(
    () => [
      {
        label: "Total Players",
        value: usersStats.totalUsers.toLocaleString(),
        change: `${usersStats.activeUsers} active / ${usersStats.inactiveUsers} inactive`,
        positive: true,
      },
      {
        label: "Pending Withdrawals",
        value: withdrawStats.pending.toString(),
        change: `₹${withdrawStats.totalAmount.toLocaleString()} total`,
        positive: false,
      },
      {
        label: "Fund Requests",
        value: fundStats.pending.toString(),
        change: `${fundStats.approved} approved`,
        positive: true,
      },
      {
        label: "Total Bets (Month)",
        value: formatRupees(profitStats.totalBets),
        change: `Today: ${formatRupees(profitStats.today.totalBids)}`,
        positive: true,
      },
      {
        label: "Total Profit (Month)",
        value: formatRupees(profitStats.totalProfit),
        change: profitStats.totalProfit > 0 ? "+ve" : "-ve",
        positive: profitStats.totalProfit >= 0,
      },
    ],
    [usersStats, withdrawStats, fundStats, profitStats, profitData]
  );

  // Chart Data
  const chartData = useMemo(() => {
    if (profitStats.dailyData.length > 0) {
      return profitStats.dailyData;
    }
    return [
      { day: "Today", amount: 0, profit: 0 },
      { day: "Month", amount: 0, profit: 0 },
      { day: "Year", amount: 0, profit: 0 },
    ];
  }, [profitStats]);

  // Theme Colors
  const primaryRed = "#dc2626";
  const darkRed = "#b91c1c";
  const softRed = "#fee2e2";
  const lighterRed = "#fef2f2";
  const borderColor = "#fecaca";
  const textDark = "#111827";
  const textMuted = "#6b7280";
  const success = "#16a34a";
  const successBg = "#dcfce7";
  const danger = "#dc2626";
  const dangerBg = "#fee2e2";
  const warning = "#ca8a04";
  const warningBg = "#fef9c3";

  const getContainerPadding = () => {
    if (isSmallMobile) return "12px";
    if (isMobile) return "16px";
    return "24px";
  };

  const getCardStyle = (isHovered = false) => ({
    background: "#ffffff",
    borderRadius: isMobile ? "12px" : "16px",
    padding: isMobile ? "12px" : "16px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: isHovered ? primaryRed : borderColor,
    boxShadow: isHovered
      ? "0 16px 40px rgba(220, 38, 38, 0.15)"
      : "0 8px 24px rgba(220, 38, 38, 0.06)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
  });

  const getLargeCardStyle = () => ({
    background: "#ffffff",
    borderRadius: isMobile ? "12px" : "16px",
    padding: isMobile ? "14px" : "20px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: borderColor,
    boxShadow: "0 8px 24px rgba(220, 38, 38, 0.06)",
  });

  const getKPIGridColumns = () => {
    if (isSmallMobile) return "repeat(2, 1fr)";
    if (isMobile) return "repeat(2, 1fr)";
    if (isTablet) return "repeat(3, 1fr)";
    return "repeat(5, 1fr)";
  };

  const getBottomStatsColumns = () => {
    if (isMobile) return "1fr";
    if (isTablet) return "repeat(2, 1fr)";
    return "repeat(3, 1fr)";
  };

  const getProfitGridColumns = () => {
    if (isMobile) return "1fr";
    if (isTablet) return "repeat(2, 1fr)";
    return "repeat(3, 1fr)";
  };

  const SkeletonCard = () => (
    <div style={getCardStyle()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ width: isMobile ? "32px" : "40px", height: isMobile ? "32px" : "40px", background: lighterRed, borderRadius: "10px" }} />
        <div style={{ width: "50px", height: "20px", background: lighterRed, borderRadius: "10px" }} />
      </div>
      <div style={{ width: "60px", height: isMobile ? "20px" : "24px", background: lighterRed, borderRadius: "6px", marginBottom: "6px" }} />
      <div style={{ width: "80px", height: "14px", background: lighterRed, borderRadius: "4px" }} />
    </div>
  );

  return (
    <main
      style={{
        background: "linear-gradient(135deg, #fafafa 0%, #fff5f5 50%, #fef2f2 100%)",
        padding: "0",
        paddingBottom: "20px",
        color: textDark,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          padding: `0 ${getContainerPadding()}`,
          maxWidth: "1400px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div style={{ marginBottom: isMobile ? "16px" : "20px", marginTop: "14px" }}>
          <h2
            style={{
              fontSize: isMobile ? "20px" : "24px",
              marginBottom: "4px",
              color: textDark,
              fontWeight: 700,
              marginTop: 0,
            }}
          >
            Dashboard Overview
          </h2>
          <p style={{ color: textMuted, fontSize: isMobile ? "12px" : "14px", margin: 0 }}>
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: getKPIGridColumns(),
            gap: isMobile ? "10px" : "16px",
          }}
        >
          {isLoading
            ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
            : dashboardStats.map((item, i) => (
              <div
                key={i}
                style={getCardStyle(hoveredCard === i)}
                onMouseEnter={() => !isMobile && setHoveredCard(i)}
                onMouseLeave={() => !isMobile && setHoveredCard(null)}
                onClick={() => isMobile && setHoveredCard(hoveredCard === i ? null : i)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: isMobile ? "8px" : "12px",
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? "32px" : "40px",
                      height: isMobile ? "32px" : "40px",
                      background: `linear-gradient(135deg, ${lighterRed} 0%, ${softRed} 100%)`,
                      borderRadius: isMobile ? "8px" : "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: isMobile ? "13px" : "16px",
                      fontWeight: "700",
                      color: primaryRed,
                      transition: "transform 0.3s ease",
                      transform: hoveredCard === i ? "scale(1.05)" : "scale(1)",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: isMobile ? "9px" : "11px",
                      fontWeight: "600",
                      padding: isMobile ? "2px 6px" : "3px 8px",
                      borderRadius: "12px",
                      background: item.positive ? successBg : dangerBg,
                      color: item.positive ? success : danger,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.change}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: isMobile ? "16px" : "20px",
                    color: textDark,
                    fontWeight: "700",
                    margin: "0 0 4px 0",
                    wordBreak: "break-word",
                  }}
                >
                  {item.value}
                </h3>
                <p style={{ color: textMuted, margin: 0, fontSize: isMobile ? "10px" : "12px" }}>
                  {item.label}
                </p>
              </div>
            ))}
        </div>

        {/* Chart */}
        <div
          style={{
            marginTop: isMobile ? "14px" : "20px",
          }}
        >
          {/* Betting Analytics Chart */}
          <div style={getLargeCardStyle()}>
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                marginBottom: isMobile ? "12px" : "16px",
                gap: isMobile ? "10px" : "0",
              }}
            >
              <div>
                <h4 style={{ margin: "0 0 2px 0", color: textDark, fontSize: isMobile ? "14px" : "16px", fontWeight: "600" }}>
                  Betting Analytics
                </h4>
                <p style={{ margin: 0, color: textMuted, fontSize: isMobile ? "10px" : "12px" }}>
                  Bet volume & profit by period
                </p>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["7D", "1M", "3M", "1Y"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    style={{
                      padding: isMobile ? "5px 10px" : "6px 12px",
                      fontSize: isMobile ? "10px" : "11px",
                      fontWeight: "600",
                      borderRadius: "8px",
                      borderWidth: "0",
                      borderStyle: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: selectedPeriod === period
                        ? `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`
                        : lighterRed,
                      color: selectedPeriod === period ? "white" : textMuted,
                      boxShadow: selectedPeriod === period ? "0 4px 12px rgba(220, 38, 38, 0.3)" : "none",
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {profitLoading ? (
              <div
                style={{
                  height: isMobile ? "160px" : "200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: textMuted,
                  fontSize: isMobile ? "12px" : "14px",
                }}
              >
                Loading chart data...
              </div>
            ) : (
              <div style={{ marginLeft: isMobile ? "-10px" : "0", marginRight: isMobile ? "-5px" : "0" }}>
                <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={primaryRed} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={primaryRed} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      stroke={textMuted}
                      tickLine={false}
                      axisLine={false}
                      dy={8}
                      tick={{ fontSize: isMobile ? 9 : 11 }}
                      interval={0}
                    />
                    <YAxis
                      stroke={textMuted}
                      tickLine={false}
                      axisLine={false}
                      dx={-8}
                      tick={{ fontSize: isMobile ? 9 : 11 }}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                      width={isMobile ? 35 : 45}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        borderWidth: "0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                        padding: isMobile ? "8px 10px" : "10px 14px",
                        fontSize: isMobile ? "10px" : "12px",
                      }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, ""]}
                    />
                    <Area type="monotone" dataKey="amount" stroke={primaryRed} strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" name="Bets" />
                    <Area type="monotone" dataKey="profit" stroke={success} strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? "16px" : "24px", marginTop: isMobile ? "8px" : "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: isMobile ? "8px" : "10px", height: isMobile ? "8px" : "10px", borderRadius: "50%", background: primaryRed }} />
                <span style={{ fontSize: isMobile ? "10px" : "12px", color: textMuted }}>Total Bets</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: isMobile ? "8px" : "10px", height: isMobile ? "8px" : "10px", borderRadius: "50%", background: success }} />
                <span style={{ fontSize: isMobile ? "10px" : "12px", color: textMuted }}>Profit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profit Breakdown */}
        <div style={{ marginTop: isMobile ? "14px" : "20px" }}>
          <div style={getLargeCardStyle()}>
            <div style={{ marginBottom: isMobile ? "12px" : "16px" }}>
              <h4 style={{ margin: "0 0 2px 0", color: textDark, fontSize: isMobile ? "14px" : "16px", fontWeight: "600" }}>
                Profit Breakdown
              </h4>
              <p style={{ margin: 0, color: textMuted, fontSize: isMobile ? "10px" : "12px" }}>
                Today, this month, and this year values from getprofit
              </p>
            </div>

            {profitLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: isMobile ? "20px" : "30px",
                  color: textMuted,
                  fontSize: isMobile ? "11px" : "13px",
                }}
              >
                Loading profit breakdown...
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: getProfitGridColumns(),
                  gap: isMobile ? "10px" : "14px",
                }}
              >
                {profitStats.periodBreakdown.map((period) => (
                  <div
                    key={period.key}
                    style={{
                      background: lighterRed,
                      border: `1px solid ${borderColor}`,
                      borderRadius: isMobile ? "10px" : "12px",
                      padding: isMobile ? "10px" : "12px",
                    }}
                  >
                    <h5 style={{ margin: "0 0 8px 0", fontSize: isMobile ? "12px" : "13px", fontWeight: "700", color: textDark }}>
                      {period.label}
                    </h5>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isSmallMobile ? "1fr" : "repeat(2, 1fr)",
                        gap: isMobile ? "6px 10px" : "8px 12px",
                      }}
                    >
                      {profitMetricConfig.map((metric) => (
                        <div key={metric.key}>
                          <div style={{ color: textMuted, fontSize: isMobile ? "9px" : "10px", marginBottom: "2px" }}>
                            {metric.label}
                          </div>
                          <div style={{ color: textDark, fontSize: isMobile ? "11px" : "12px", fontWeight: "600" }}>
                            {formatRupees(period.values[metric.key])}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: getBottomStatsColumns(),
            gap: isMobile ? "10px" : "16px",
            marginTop: isMobile ? "14px" : "20px",
            paddingBottom: isMobile ? "200px" : "0",
          }}
        >
          {/* Fund Requests Summary */}
          <div style={getCardStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? "10px" : "12px" }}>
              <h4 style={{ margin: 0, color: textDark, fontSize: isMobile ? "12px" : "14px", fontWeight: "600" }}>Fund Requests</h4>
              <span style={{ fontSize: isMobile ? "14px" : "16px" }}>📥</span>
            </div>
            <div style={{ display: "flex", gap: isMobile ? "8px" : "16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? "9px" : "11px", color: textMuted, marginBottom: "2px" }}>Pending</div>
                <div style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "700", color: warning }}>{fundStats.pending}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? "9px" : "11px", color: textMuted, marginBottom: "2px" }}>Approved</div>
                <div style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "700", color: success }}>{fundStats.approved}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? "9px" : "11px", color: textMuted, marginBottom: "2px" }}>Amount</div>
                <div style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: "700", color: textDark }}>
                  ₹{(fundStats.totalAmount / 1000).toFixed(1)}k
                </div>
              </div>
            </div>
          </div>

          {/* Withdraw Summary */}
          <div style={getCardStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? "10px" : "12px" }}>
              <h4 style={{ margin: 0, color: textDark, fontSize: isMobile ? "12px" : "14px", fontWeight: "600" }}>Withdrawals</h4>
              <span style={{ fontSize: isMobile ? "14px" : "16px" }}>💸</span>
            </div>
            <div style={{ display: "flex", gap: isMobile ? "8px" : "16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? "9px" : "11px", color: textMuted, marginBottom: "2px" }}>Pending</div>
                <div style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "700", color: warning }}>{withdrawStats.pending}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? "9px" : "11px", color: textMuted, marginBottom: "2px" }}>Approved</div>
                <div style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "700", color: success }}>{withdrawStats.approved}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? "9px" : "11px", color: textMuted, marginBottom: "2px" }}>Total</div>
                <div style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: "700", color: textDark }}>
                  ₹{(withdrawStats.totalAmount / 1000).toFixed(1)}k
                </div>
              </div>
            </div>
          </div>

          {/* Users Summary */}
          <div style={getCardStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? "10px" : "12px" }}>
              <h4 style={{ margin: 0, color: textDark, fontSize: isMobile ? "12px" : "14px", fontWeight: "600" }}>Users</h4>
              <span style={{ fontSize: isMobile ? "14px" : "16px" }}>👥</span>
            </div>
            <div style={{ display: "flex", gap: isMobile ? "8px" : "16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? "9px" : "11px", color: textMuted, marginBottom: "2px" }}>Total</div>
                <div style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "700", color: textDark }}>{usersStats.totalUsers}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? "9px" : "11px", color: textMuted, marginBottom: "2px" }}>Active</div>
                <div style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "700", color: success }}>{usersStats.activeUsers}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? "9px" : "11px", color: textMuted, marginBottom: "2px" }}>Inactive</div>
                <div style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "700", color: danger }}>{usersStats.inactiveUsers}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
