"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
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
  useGetBiddingHistoryQuery,
} from "@/store/backendSlice/apiAPISlice";

export default function Dashboard() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBet, setHoveredBet] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("7D");
  const [windowWidth, setWindowWidth] = useState(1200);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive breakpoints
  const isSmallMobile = windowWidth < 400;
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // API Queries
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data: withdrawData, isLoading: withdrawLoading } =
    useGetWithdrawRequestsQuery();
  const { data: fundData, isLoading: fundLoading } = useGetFundRequestsQuery();
  const { data: profitData, isLoading: profitLoading } = useGetProfitQuery({});
  const { data: biddingData, isLoading: biddingLoading } =
    useGetBiddingHistoryQuery({
      page: 1,
      per_page: 10,
    });

  const isLoading =
    usersLoading ||
    withdrawLoading ||
    fundLoading ||
    profitLoading ||
    biddingLoading;

  // Process Users Data
  const usersStats = useMemo(() => {
    const users = usersData?.data?.users || usersData?.users || [];
    const totalUsers = users.length;
    const activeUsers = users.filter(
      (u) => u.status === 1 || u.status === true
    ).length;
    return { totalUsers, activeUsers };
  }, [usersData]);

  // Process Withdraw Requests
  const withdrawStats = useMemo(() => {
    const requests =
      withdrawData?.data?.requests ||
      withdrawData?.requests ||
      withdrawData?.data ||
      [];
    const pending = Array.isArray(requests)
      ? requests.filter((r) => r.status === "pending" || r.status === 0).length
      : 0;
    const totalAmount = Array.isArray(requests)
      ? requests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)
      : 0;
    return { pending, totalAmount };
  }, [withdrawData]);

  // Process Fund Requests
  const fundStats = useMemo(() => {
    const requests =
      fundData?.data?.requests || fundData?.requests || fundData?.data || [];
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
  const profitStats = useMemo(() => {
    const profits =
      profitData?.data?.profits || profitData?.profits || profitData?.data || [];
    const dailyData = [];

    if (Array.isArray(profits) && profits.length > 0) {
      const groupedByDate = profits.reduce((acc, item) => {
        const date =
          item.date || item.created_at?.split("T")[0] || "Unknown";
        if (!acc[date]) {
          acc[date] = { bets: 0, profit: 0 };
        }
        acc[date].bets += parseFloat(item.total_bets || item.amount || 0);
        acc[date].profit += parseFloat(item.profit || item.total_profit || 0);
        return acc;
      }, {});

      Object.keys(groupedByDate)
        .slice(-7)
        .forEach((date) => {
          const dayName = new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
          });
          dailyData.push({
            day: dayName || date,
            amount: groupedByDate[date].bets,
            profit: groupedByDate[date].profit,
          });
        });
    }

    const totalProfit = Array.isArray(profits)
      ? profits.reduce(
          (sum, p) => sum + parseFloat(p.profit || p.total_profit || 0),
          0
        )
      : 0;
    const totalBets = Array.isArray(profits)
      ? profits.reduce(
          (sum, p) => sum + parseFloat(p.total_bets || p.amount || 0),
          0
        )
      : 0;

    return { dailyData, totalProfit, totalBets };
  }, [profitData]);

  // Process Bidding History for Recent Bets
  const recentBets = useMemo(() => {
    const bids =
      biddingData?.data?.bids ||
      biddingData?.bids ||
      biddingData?.data?.data ||
      [];

    if (!Array.isArray(bids)) return [];

    return bids.slice(0, 4).map((bid) => {
      const userName =
        bid.user?.name || bid.user_name || bid.name || "Unknown";
      const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      const createdAt = bid.created_at ? new Date(bid.created_at) : new Date();
      const timeDiff = Math.floor((new Date() - createdAt) / 60000);
      const timeAgo =
        timeDiff < 1
          ? "Just now"
          : timeDiff < 60
          ? `${timeDiff} min ago`
          : `${Math.floor(timeDiff / 60)}h ago`;

      return {
        user: userName,
        game: bid.game_name || bid.game_type || "Game",
        amount: parseFloat(bid.amount || 0),
        status:
          bid.status === 1 || bid.status === "win"
            ? "Win"
            : bid.status === 0 || bid.status === "loss"
            ? "Loss"
            : "Pending",
        time: timeAgo,
        avatar: initials || "??",
      };
    });
  }, [biddingData]);

  // Dashboard Stats
  const dashboardStats = useMemo(
    () => [
      {
        label: "Total Players",
        value: usersStats.totalUsers.toLocaleString(),
        change: `${usersStats.activeUsers} active`,
        positive: true,
      },
      {
        label: "Pending Withdrawals",
        value: withdrawStats.pending.toString(),
        change: `₹${withdrawStats.totalAmount.toLocaleString()}`,
        positive: false,
      },
      {
        label: "Fund Requests",
        value: fundStats.pending.toString(),
        change: `${fundStats.approved} approved`,
        positive: true,
      },
      {
        label: "Total Bets",
        value: `₹${profitStats.totalBets.toLocaleString()}`,
        change: "This period",
        positive: true,
      },
      {
        label: "Total Profit",
        value: `₹${profitStats.totalProfit.toLocaleString()}`,
        change: profitStats.totalProfit > 0 ? "+ve" : "-ve",
        positive: profitStats.totalProfit >= 0,
      },
    ],
    [usersStats, withdrawStats, fundStats, profitStats]
  );

  // Chart Data
  const chartData = useMemo(() => {
    if (profitStats.dailyData.length > 0) {
      return profitStats.dailyData;
    }
    return [
      { day: "Mon", amount: 0, profit: 0 },
      { day: "Tue", amount: 0, profit: 0 },
      { day: "Wed", amount: 0, profit: 0 },
      { day: "Thu", amount: 0, profit: 0 },
      { day: "Fri", amount: 0, profit: 0 },
      { day: "Sat", amount: 0, profit: 0 },
      { day: "Sun", amount: 0, profit: 0 },
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

  // Responsive styles
  const getContainerPadding = () => {
    if (isSmallMobile) return "12px";
    if (isMobile) return "16px";
    return "24px";
  };

  // Card styles using non-shorthand properties only
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

  // KPI Grid columns based on screen size
  const getKPIGridColumns = () => {
    if (isSmallMobile) return "repeat(2, 1fr)";
    if (isMobile) return "repeat(2, 1fr)";
    if (isTablet) return "repeat(3, 1fr)";
    return "repeat(5, 1fr)";
  };

  // Chart and Bets grid
  const getChartGridColumns = () => {
    if (isMobile) return "1fr";
    return "2fr 1fr";
  };

  // Bottom stats grid
  const getBottomStatsColumns = () => {
    if (isMobile) return "1fr";
    if (isTablet) return "repeat(2, 1fr)";
    return "repeat(3, 1fr)";
  };

  const SkeletonCard = () => (
    <div style={getCardStyle()}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: isMobile ? "32px" : "40px",
            height: isMobile ? "32px" : "40px",
            background: lighterRed,
            borderRadius: "10px",
          }}
        />
        <div
          style={{
            width: "50px",
            height: "20px",
            background: lighterRed,
            borderRadius: "10px",
          }}
        />
      </div>
      <div
        style={{
          width: "60px",
          height: isMobile ? "20px" : "24px",
          background: lighterRed,
          borderRadius: "6px",
          marginBottom: "6px",
        }}
      />
      <div
        style={{
          width: "80px",
          height: "14px",
          background: lighterRed,
          borderRadius: "4px",
        }}
      />
    </div>
  );

  return (
    <main
      style={{
        background:
          "linear-gradient(135deg, #fafafa 0%, #fff5f5 50%, #fef2f2 100%)",
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
        {/* Title */}
        <div style={{ marginBottom: isMobile ? "16px" : "20px" }}>
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
          <p
            style={{
              color: textMuted,
              fontSize: isMobile ? "12px" : "14px",
              margin: 0,
            }}
          >
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* KPI Cards - Responsive Grid with Wrap */}
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
                  onClick={() =>
                    isMobile && setHoveredCard(hoveredCard === i ? null : i)
                  }
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
                        transform:
                          hoveredCard === i ? "scale(1.05)" : "scale(1)",
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
                  <p
                    style={{
                      color: textMuted,
                      margin: 0,
                      fontSize: isMobile ? "10px" : "12px",
                    }}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
        </div>

        {/* Chart + Recent Bets */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: getChartGridColumns(),
            gap: isMobile ? "14px" : "20px",
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
                <h4
                  style={{
                    margin: "0 0 2px 0",
                    color: textDark,
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "600",
                  }}
                >
                  Betting Analytics
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: textMuted,
                    fontSize: isMobile ? "10px" : "12px",
                  }}
                >
                  Daily bet volume & profit trends
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
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
                      background:
                        selectedPeriod === period
                          ? `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`
                          : lighterRed,
                      color: selectedPeriod === period ? "white" : textMuted,
                      boxShadow:
                        selectedPeriod === period
                          ? "0 4px 12px rgba(220, 38, 38, 0.3)"
                          : "none",
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
              <div
                style={{
                  marginLeft: isMobile ? "-10px" : "0",
                  marginRight: isMobile ? "-5px" : "0",
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height={isMobile ? 160 : 200}
                >
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorAmount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={primaryRed}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={primaryRed}
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorProfit"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={success}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={success}
                          stopOpacity={0}
                        />
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
                      formatter={(value) => [
                        `₹${value.toLocaleString()}`,
                        "",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke={primaryRed}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                      name="Bets"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke={success}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                      name="Profit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: isMobile ? "16px" : "24px",
                marginTop: isMobile ? "8px" : "12px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: isMobile ? "8px" : "10px",
                    height: isMobile ? "8px" : "10px",
                    borderRadius: "50%",
                    background: primaryRed,
                  }}
                />
                <span
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    color: textMuted,
                  }}
                >
                  Total Bets
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: isMobile ? "8px" : "10px",
                    height: isMobile ? "8px" : "10px",
                    borderRadius: "50%",
                    background: success,
                  }}
                />
                <span
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    color: textMuted,
                  }}
                >
                  Profit
                </span>
              </div>
            </div>
          </div>

          {/* Recent Bets */}
          <div style={getLargeCardStyle()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isMobile ? "10px" : "14px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: textDark,
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: "600",
                }}
              >
                Recent Bets
              </h4>
              <span
                onClick={() => router.push("/bidding-history")}
                style={{
                  fontSize: isMobile ? "10px" : "12px",
                  color: primaryRed,
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                View All
              </span>
            </div>

            {biddingLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: isMobile ? "20px" : "30px",
                  color: textMuted,
                  fontSize: isMobile ? "11px" : "13px",
                }}
              >
                Loading recent bets...
              </div>
            ) : recentBets.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: isMobile ? "20px" : "30px",
                  color: textMuted,
                  fontSize: isMobile ? "11px" : "13px",
                }}
              >
                No recent bets found
              </div>
            ) : (
              recentBets.map((bet, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: isMobile ? "8px" : "10px",
                    marginBottom: isMobile ? "6px" : "8px",
                    borderRadius: isMobile ? "8px" : "10px",
                    background: hoveredBet === i ? lighterRed : "transparent",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => !isMobile && setHoveredBet(i)}
                  onMouseLeave={() => !isMobile && setHoveredBet(null)}
                  onClick={() =>
                    isMobile && setHoveredBet(hoveredBet === i ? null : i)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? "8px" : "10px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: isMobile ? "32px" : "36px",
                        height: isMobile ? "32px" : "36px",
                        background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                        borderRadius: isMobile ? "8px" : "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: isMobile ? "10px" : "11px",
                        fontWeight: "600",
                        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
                        flexShrink: 0,
                      }}
                    >
                      {bet.avatar}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong
                        style={{
                          fontSize: isMobile ? "11px" : "13px",
                          color: textDark,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {bet.user}
                      </strong>
                      <p
                        style={{
                          color: textMuted,
                          margin: "2px 0 0 0",
                          fontSize: isMobile ? "9px" : "11px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {bet.game} • {bet.time}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      flexShrink: 0,
                      marginLeft: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 3px 0",
                        fontWeight: "600",
                        fontSize: isMobile ? "11px" : "13px",
                        color: textDark,
                      }}
                    >
                      ₹{bet.amount.toLocaleString()}
                    </p>
                    <span
                      style={{
                        fontSize: isMobile ? "8px" : "10px",
                        fontWeight: "600",
                        padding: isMobile ? "2px 6px" : "3px 8px",
                        borderRadius: "12px",
                        background:
                          bet.status === "Win"
                            ? successBg
                            : bet.status === "Loss"
                            ? dangerBg
                            : warningBg,
                        color:
                          bet.status === "Win"
                            ? success
                            : bet.status === "Loss"
                            ? danger
                            : warning,
                      }}
                    >
                      {bet.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats Row - Compact Cards with padding bottom for mobile */}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isMobile ? "10px" : "12px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: textDark,
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: "600",
                }}
              >
                Fund Requests
              </h4>
              <span style={{ fontSize: isMobile ? "14px" : "16px" }}>📥</span>
            </div>
            <div
              style={{
                display: "flex",
                gap: isMobile ? "8px" : "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: isMobile ? "9px" : "11px",
                    color: textMuted,
                    marginBottom: "2px",
                  }}
                >
                  Pending
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "700",
                    color: warning,
                  }}
                >
                  {fundStats.pending}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: isMobile ? "9px" : "11px",
                    color: textMuted,
                    marginBottom: "2px",
                  }}
                >
                  Approved
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "700",
                    color: success,
                  }}
                >
                  {fundStats.approved}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: isMobile ? "9px" : "11px",
                    color: textMuted,
                    marginBottom: "2px",
                  }}
                >
                  Amount
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: "700",
                    color: textDark,
                  }}
                >
                  ₹{(fundStats.totalAmount / 1000).toFixed(1)}k
                </div>
              </div>
            </div>
          </div>

          {/* Withdraw Summary */}
          <div style={getCardStyle()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isMobile ? "10px" : "12px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: textDark,
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: "600",
                }}
              >
                Withdrawals
              </h4>
              <span style={{ fontSize: isMobile ? "14px" : "16px" }}>💸</span>
            </div>
            <div
              style={{
                display: "flex",
                gap: isMobile ? "8px" : "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: isMobile ? "9px" : "11px",
                    color: textMuted,
                    marginBottom: "2px",
                  }}
                >
                  Pending
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "700",
                    color: warning,
                  }}
                >
                  {withdrawStats.pending}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: isMobile ? "9px" : "11px",
                    color: textMuted,
                    marginBottom: "2px",
                  }}
                >
                  Total
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: "700",
                    color: textDark,
                  }}
                >
                  ₹{(withdrawStats.totalAmount / 1000).toFixed(1)}k
                </div>
              </div>
            </div>
          </div>

          {/* Users Summary */}
          <div style={getCardStyle()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isMobile ? "10px" : "12px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: textDark,
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: "600",
                }}
              >
                Users
              </h4>
              <span style={{ fontSize: isMobile ? "14px" : "16px" }}>👥</span>
            </div>
            <div
              style={{
                display: "flex",
                gap: isMobile ? "8px" : "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: isMobile ? "9px" : "11px",
                    color: textMuted,
                    marginBottom: "2px",
                  }}
                >
                  Total
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "700",
                    color: textDark,
                  }}
                >
                  {usersStats.totalUsers}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: isMobile ? "9px" : "11px",
                    color: textMuted,
                    marginBottom: "2px",
                  }}
                >
                  Active
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "700",
                    color: success,
                  }}
                >
                  {usersStats.activeUsers}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}