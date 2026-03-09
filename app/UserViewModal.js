import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetUserByIdQuery } from "@/store/backendSlice/apiAPISlice";
const InfoRow = ({ label, value, isSensitive = false }) => (_jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #f3f4f6"
    }, children: [_jsx("span", { style: {
                color: "#6b7280",
                fontSize: "14px"
            }, children: label }), _jsx("span", { style: {
                fontWeight: "600",
                color: isSensitive ? "#9ca3af" : "#111827",
                fontSize: "14px",
                textAlign: "right",
                maxWidth: "200px",
                wordBreak: "break-word",
                fontFamily: isSensitive ? "monospace" : "inherit"
            }, children: value || "N/A" })] }));
const SectionHeader = ({ title }) => (_jsx("div", { style: {
        padding: "16px 0 12px",
        borderBottom: "2px solid #e5e7eb",
        marginTop: "16px"
    }, children: _jsx("span", { style: { fontSize: "15px", fontWeight: "600", color: "#374151" }, children: title }) }));
const TabButton = ({ active, onClick, children, count }) => (_jsxs("button", { onClick: onClick, style: {
        padding: "10px 16px",
        backgroundColor: active ? "#4f46e5" : "#f3f4f6",
        color: active ? "#fff" : "#374151",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s",
        whiteSpace: "nowrap"
    }, children: [children, count !== undefined && (_jsx("span", { style: {
                backgroundColor: active ? "rgba(255,255,255,0.2)" : "#e5e7eb",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "11px"
            }, children: count }))] }));
const EmptyState = ({ message }) => (_jsx("div", { style: {
        textAlign: "center",
        padding: "40px 20px",
        color: "#9ca3af"
    }, children: _jsx("p", { style: { margin: 0, fontSize: "14px" }, children: message }) }));
const UserSummaryRow = ({ label, value }) => (_jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #e5e7eb"
    }, children: [_jsx("span", { style: { color: "#6b7280", fontSize: "13px" }, children: label }), _jsx("span", { style: { fontWeight: "600", fontSize: "13px", color: "#111827" }, children: value || "N/A" })] }));
export default function UserViewModal({ userId, onClose, variant = "default" }) {
    var _a, _b, _c, _d, _e;
    const [activeTab, setActiveTab] = useState("info");
    const [isMobileView, setIsMobileView] = useState(false);
    const { data: userData, isLoading, isError } = useGetUserByIdQuery(userId, {
        skip: !userId,
    });
    console.log("Full userData:", userData);
    // Fixed data extraction based on actual API structure
    const responseData = (userData === null || userData === void 0 ? void 0 : userData.user) || {};
    const rawUser = responseData === null || responseData === void 0 ? void 0 : responseData.user;
    const baseUser = Array.isArray(rawUser) ? rawUser[0] || {} : rawUser || {};
    const user = Object.assign(Object.assign({}, baseUser), { pass: (_e = (_d = (_c = (_b = (_a = baseUser === null || baseUser === void 0 ? void 0 : baseUser.pass) !== null && _a !== void 0 ? _a : baseUser === null || baseUser === void 0 ? void 0 : baseUser.password) !== null && _b !== void 0 ? _b : responseData === null || responseData === void 0 ? void 0 : responseData.pass) !== null && _c !== void 0 ? _c : responseData === null || responseData === void 0 ? void 0 : responseData.password) !== null && _d !== void 0 ? _d : responseData === null || responseData === void 0 ? void 0 : responseData.user_pass) !== null && _e !== void 0 ? _e : null });
    const transactions = (responseData === null || responseData === void 0 ? void 0 : responseData.transactions) || [];
    const fundRequests = (responseData === null || responseData === void 0 ? void 0 : responseData.fund_requests) || [];
    const withdrawals = (responseData === null || responseData === void 0 ? void 0 : responseData.withdrawal) || [];
    const biddingHistory = (responseData === null || responseData === void 0 ? void 0 : responseData.bidding_history) || (responseData === null || responseData === void 0 ? void 0 : responseData.bets) || [];
    const winningHistory = (responseData === null || responseData === void 0 ? void 0 : responseData.winning_history) || [];
    console.log("Extracted user:", user);
    console.log("Transactions:", transactions);
    console.log("Fund Requests:", fundRequests);
    console.log("Withdrawals:", withdrawals);
    console.log("Bidding History:", biddingHistory);
    console.log("Winning History:", winningHistory);
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const updateView = () => setIsMobileView(mediaQuery.matches);
        updateView();
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", updateView);
            return () => mediaQuery.removeEventListener("change", updateView);
        }
        mediaQuery.addListener(updateView);
        return () => mediaQuery.removeListener(updateView);
    }, []);
    useEffect(() => {
        if (!isMobileView)
            return;
        const mobileTabs = ["transactions", "funds", "withdrawals", "winning", "bidding"];
        if (!mobileTabs.includes(activeTab)) {
            setActiveTab("transactions");
        }
    }, [activeTab, isMobileView]);
    const formatDate = (dateString) => {
        if (!dateString)
            return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
    };
    const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";
    const normalizeGameType = (value) => String(value || "")
        .trim()
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\s+/g, " ");
    const getBidDisplayRows = (bet) => {
        const gameType = normalizeGameType(bet === null || bet === void 0 ? void 0 : bet.game_type);
        const rows = [];
        if (gameType === "double digit") {
            rows.push({ label: "Jodi", value: hasValue(bet === null || bet === void 0 ? void 0 : bet.jodi) ? bet.jodi : "N/A" });
            return rows;
        }
        if (hasValue(bet === null || bet === void 0 ? void 0 : bet.pana))
            rows.push({ label: "Pana", value: bet.pana });
        if (hasValue(bet === null || bet === void 0 ? void 0 : bet.digit))
            rows.push({ label: "Digit", value: bet.digit });
        if (rows.length === 0 && hasValue(bet === null || bet === void 0 ? void 0 : bet.jodi))
            rows.push({ label: "Jodi", value: bet.jodi });
        if (rows.length === 0)
            rows.push({ label: "Bid", value: "N/A" });
        return rows;
    };
    const getWinningDisplayInfo = (win) => {
        const gameType = normalizeGameType(win === null || win === void 0 ? void 0 : win.game_type);
        if (gameType === "double digit") {
            return {
                label: "Jodi",
                value: hasValue(win === null || win === void 0 ? void 0 : win.jodi)
                    ? win.jodi
                    : hasValue(win === null || win === void 0 ? void 0 : win.digit)
                        ? win.digit
                        : hasValue(win === null || win === void 0 ? void 0 : win.number)
                            ? win.number
                            : "N/A",
            };
        }
        if (gameType === "single pana" ||
            gameType === "double pana" ||
            gameType === "triple pana") {
            return {
                label: "Pana",
                value: hasValue(win === null || win === void 0 ? void 0 : win.pana)
                    ? win.pana
                    : hasValue(win === null || win === void 0 ? void 0 : win.digit)
                        ? win.digit
                        : "N/A",
            };
        }
        if (hasValue(win === null || win === void 0 ? void 0 : win.pana))
            return { label: "Pana", value: win.pana };
        if (hasValue(win === null || win === void 0 ? void 0 : win.jodi))
            return { label: "Jodi", value: win.jodi };
        if (hasValue(win === null || win === void 0 ? void 0 : win.digit))
            return { label: "Digit", value: win.digit };
        if (hasValue(win === null || win === void 0 ? void 0 : win.number))
            return { label: "Number", value: win.number };
        return { label: "Number", value: "N/A" };
    };
    const isInactive = variant === "inactive" || user.status === 0;
    const headerBgColor = isInactive ? "#fef2f2" : "#f9fafb";
    const avatarBgColor = user.status ? "#4f46e5" : "#9ca3af";
    const statusBgColor = user.status ? "#dcfce7" : "#fef2f2";
    const statusTextColor = user.status ? "#166534" : "#dc2626";
    const renderInfoTab = () => (_jsxs(_Fragment, { children: [_jsx(SectionHeader, { title: "Basic Information" }), _jsx(InfoRow, { label: "User ID", value: `#${user.id}` }), _jsx(InfoRow, { label: "Name", value: user.name }), _jsx(InfoRow, { label: "Phone", value: user.phone }), _jsx(InfoRow, { label: "Email", value: user.email }), _jsx(InfoRow, { label: "Pass", value: user.pass, isSensitive: true }), _jsx(InfoRow, { label: "Funds", value: formatCurrency(user.funds) }), _jsx(InfoRow, { label: "Login Count", value: user.login_count }), _jsx(InfoRow, { label: "Referral Code", value: user.referral_code }), _jsx(InfoRow, { label: "Referrer ID", value: user.referrer_id || "None" }), _jsx(SectionHeader, { title: "Bank Details" }), _jsx(InfoRow, { label: "Bank Name", value: user.bank_name }), _jsx(InfoRow, { label: "Account Holder", value: user.account_holder }), _jsx(InfoRow, { label: "Account Number", value: user.acccount_number, isSensitive: true }), _jsx(InfoRow, { label: "IFSC Code", value: user.ifsc }), _jsx(InfoRow, { label: "Bank Address", value: user.bank_address }), _jsx(SectionHeader, { title: "UPI & Payment" }), _jsx(InfoRow, { label: "UPI ID", value: user.upi }), _jsx(InfoRow, { label: "Google Pay", value: user.google_pay }), _jsx(InfoRow, { label: "Phone Pay", value: user.phone_pay }), _jsx(InfoRow, { label: "Paytm", value: user.paytm }), _jsx(SectionHeader, { title: "Account Info" }), _jsx(InfoRow, { label: "Created At", value: formatDate(user.created_at) }), _jsx(InfoRow, { label: "Updated At", value: formatDate(user.updated_at) })] }));
    const renderTransactionsTab = () => (_jsx(_Fragment, { children: transactions.length === 0 ? (_jsx(EmptyState, { message: "No transactions found" })) : (_jsx("div", { style: { marginTop: "16px" }, children: transactions.map((txn, index) => (_jsxs("div", { style: {
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    border: "1px solid #e5e7eb"
                }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px" }, children: [_jsx("span", { style: { fontWeight: "600", color: "#111827" }, children: txn.type || "Transaction" }), _jsxs("span", { style: {
                                    fontWeight: "700",
                                    color: txn.type === "credit" ? "#22c55e" : "#ef4444"
                                }, children: [txn.type === "credit" ? "+" : "-", formatCurrency(txn.amount)] })] }), _jsx("div", { style: { fontSize: "12px", color: "#6b7280" }, children: formatDate(txn.created_at) }), txn.description && (_jsx("div", { style: { fontSize: "12px", color: "#6b7280", marginTop: "4px" }, children: txn.description }))] }, index))) })) }));
    const renderFundRequestsTab = () => (_jsx(_Fragment, { children: fundRequests.length === 0 ? (_jsx(EmptyState, { message: "No fund requests found" })) : (_jsx("div", { style: { marginTop: "16px" }, children: fundRequests.map((req, index) => (_jsxs("div", { style: {
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    border: "1px solid #e5e7eb"
                }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px" }, children: [_jsx("span", { style: { fontWeight: "600", color: "#111827" }, children: formatCurrency(req.amount) }), _jsx("span", { style: {
                                    padding: "2px 10px",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    backgroundColor: req.status === "approved" ? "#dcfce7" : req.status === "pending" ? "#fef3c7" : "#fef2f2",
                                    color: req.status === "approved" ? "#166534" : req.status === "pending" ? "#b45309" : "#dc2626"
                                }, children: req.status || "Pending" })] }), _jsx("div", { style: { fontSize: "12px", color: "#6b7280" }, children: formatDate(req.created_at) }), req.payment_method && (_jsxs("div", { style: { fontSize: "12px", color: "#6b7280", marginTop: "4px" }, children: ["Method: ", req.payment_method] }))] }, index))) })) }));
    const renderWithdrawalsTab = () => (_jsx(_Fragment, { children: withdrawals.length === 0 ? (_jsx(EmptyState, { message: "No withdrawals found" })) : (_jsx("div", { style: { marginTop: "16px" }, children: withdrawals.map((wd, index) => (_jsxs("div", { style: {
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    border: "1px solid #e5e7eb"
                }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px" }, children: [_jsx("span", { style: { fontWeight: "600", color: "#111827" }, children: formatCurrency(wd.amount) }), _jsx("span", { style: {
                                    padding: "2px 10px",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    backgroundColor: wd.status === "approved" ? "#dcfce7" : wd.status === "pending" ? "#fef3c7" : "#fef2f2",
                                    color: wd.status === "approved" ? "#166534" : wd.status === "pending" ? "#b45309" : "#dc2626"
                                }, children: wd.status || "Pending" })] }), _jsx("div", { style: { fontSize: "12px", color: "#6b7280" }, children: formatDate(wd.created_at) }), wd.payment_method && (_jsxs("div", { style: { fontSize: "12px", color: "#6b7280", marginTop: "4px" }, children: ["Method: ", wd.payment_method] }))] }, index))) })) }));
    const renderBiddingTab = () => (_jsx(_Fragment, { children: biddingHistory.length === 0 ? (_jsx(EmptyState, { message: "No bidding history found" })) : (_jsx("div", { style: { marginTop: "16px" }, children: biddingHistory.map((bet, index) => {
                var _a;
                const bidRows = getBidDisplayRows(bet);
                return (_jsxs("div", { style: {
                        padding: "12px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        border: "1px solid #e5e7eb"
                    }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px" }, children: [_jsx("span", { style: { fontWeight: "600", color: "#111827" }, children: bet.game_id || bet.game_name || "Game" }), _jsx("span", { style: {
                                        fontWeight: "700",
                                        color: "#4f46e5",
                                        backgroundColor: "#eef2ff",
                                        padding: "2px 8px",
                                        borderRadius: "999px",
                                        fontSize: "11px"
                                    }, children: bet.game_type || "N/A" })] }), _jsxs("div", { style: { fontSize: "12px", color: "#4b5563", marginBottom: "6px" }, children: [_jsx("strong", { children: "Session:" }), " ", bet.session || "N/A"] }), bidRows.map((row) => (_jsxs("div", { style: { fontSize: "12px", color: "#4b5563", marginBottom: "6px" }, children: [_jsxs("strong", { children: [row.label, ":"] }), " ", row.value] }, row.label))), _jsxs("div", { style: { fontSize: "12px", color: "#4b5563", marginBottom: "6px" }, children: [_jsx("strong", { children: "Points:" }), " ", (_a = bet.points) !== null && _a !== void 0 ? _a : "N/A"] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280" }, children: [_jsxs("span", { children: ["Bid Date: ", bet.bid_date || "N/A"] }), _jsx("span", { children: formatDate(bet.created_at) })] })] }, index));
            }) })) }));
    const renderWinningTab = () => (_jsx(_Fragment, { children: winningHistory.length === 0 ? (_jsx(EmptyState, { message: "No winning history found" })) : (_jsx("div", { style: { marginTop: "16px" }, children: winningHistory.map((win, index) => {
                var _a, _b, _c, _d;
                const winningAmount = (_b = (_a = win.win_points) !== null && _a !== void 0 ? _a : win.amount) !== null && _b !== void 0 ? _b : 0;
                const { label: playedLabel, value: playedNumber } = getWinningDisplayInfo(win);
                return (_jsxs("div", { style: {
                        padding: "12px",
                        backgroundColor: "#dcfce7",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        border: "1px solid #bbf7d0"
                    }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px", gap: "8px" }, children: [_jsx("span", { style: { fontWeight: "700", color: "#14532d" }, children: win.game_name || "Win" }), _jsxs("span", { style: { fontWeight: "700", color: "#15803d" }, children: ["+", formatCurrency(winningAmount)] })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px", color: "#166534" }, children: [_jsxs("span", { children: [_jsx("strong", { children: "Type:" }), " ", win.game_type || "N/A"] }), _jsxs("span", { children: [_jsx("strong", { children: "Session:" }), " ", win.session || "N/A"] })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px", color: "#166534" }, children: [_jsxs("span", { children: [_jsxs("strong", { children: [playedLabel, ":"] }), " ", playedNumber] }), _jsxs("span", { children: [_jsx("strong", { children: "Points:" }), " ", (_c = win.points) !== null && _c !== void 0 ? _c : "N/A"] })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px", color: "#166534" }, children: [_jsxs("span", { children: [_jsx("strong", { children: "Rate:" }), " ", (_d = win.rate) !== null && _d !== void 0 ? _d : "N/A"] }), _jsxs("span", { children: [_jsx("strong", { children: "Bid Date:" }), " ", win.bid_date || "N/A"] })] }), _jsxs("div", { style: { fontSize: "12px", color: "#166534" }, children: [_jsx("strong", { children: "Result Date:" }), " ", win.result_date || formatDate(win.created_at)] })] }, index));
            }) })) }));
    return (_jsx("div", { style: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: isMobileView ? "stretch" : "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobileView ? "0" : "20px"
        }, onClick: onClose, children: _jsxs("div", { style: {
                backgroundColor: "#fff",
                borderRadius: isMobileView ? "0" : "16px",
                width: "100%",
                maxWidth: isMobileView ? "100vw" : "600px",
                height: isMobileView ? "100vh" : "auto",
                maxHeight: isMobileView ? "100vh" : "90vh",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                display: "flex",
                flexDirection: "column"
            }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: {
                        padding: "20px 24px",
                        borderBottom: "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: headerBgColor,
                        flexShrink: 0
                    }, children: [_jsx("h2", { style: { margin: 0, fontSize: "18px", fontWeight: "600" }, children: isInactive ? "Inactive User Details" : "User Details" }), _jsx("button", { onClick: onClose, style: {
                                background: "none",
                                border: "none",
                                fontSize: "24px",
                                cursor: "pointer",
                                color: "#6b7280",
                                padding: "4px",
                                lineHeight: 1
                            }, children: "\u00D7" })] }), _jsx("div", { style: {
                        padding: "24px",
                        overflowY: "auto",
                        flex: 1
                    }, children: isLoading ? (_jsxs("div", { style: { textAlign: "center", padding: "20px 0" }, children: [_jsx(Skeleton, { circle: true, width: 80, height: 80, style: { marginBottom: "16px" } }), _jsx(Skeleton, { width: 150, height: 20, style: { marginBottom: "8px", margin: "0 auto" } }), _jsx(Skeleton, { width: 80, height: 24, borderRadius: 20, style: { margin: "0 auto" } }), _jsx("div", { style: { marginTop: "24px" }, children: [...Array(8)].map((_, i) => (_jsx(Skeleton, { height: 44, style: { marginBottom: "8px" } }, i))) })] })) : isError ? (_jsxs("div", { style: {
                            textAlign: "center",
                            padding: "40px",
                            color: "#dc2626"
                        }, children: [_jsx("p", { style: { margin: 0, fontWeight: "500" }, children: "Failed to load user details" }), _jsx("p", { style: { margin: "8px 0 0", fontSize: "14px", color: "#6b7280" }, children: "Please try again later" })] })) : !user || !user.id ? (_jsx("div", { style: {
                            textAlign: "center",
                            padding: "40px",
                            color: "#6b7280"
                        }, children: _jsx("p", { style: { margin: 0, fontWeight: "500" }, children: "No user data available" }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "10px",
                                    padding: "0 12px",
                                    marginBottom: "16px"
                                }, children: [_jsx(UserSummaryRow, { label: "User Name", value: user.name }), _jsx(UserSummaryRow, { label: "Mobile", value: user.phone }), _jsx(UserSummaryRow, { label: "Password", value: user.pass }), _jsx("div", { style: { padding: "10px 0" }, children: _jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx("span", { style: { color: "#6b7280", fontSize: "13px" }, children: "Funds" }), _jsx("span", { style: { fontWeight: "700", fontSize: "13px", color: "#4f46e5" }, children: formatCurrency(user.funds) })] }) })] }), !isMobileView && (_jsxs("div", { style: {
                                    textAlign: "center",
                                    marginBottom: "20px",
                                    paddingBottom: "20px",
                                    borderBottom: "1px solid #e5e7eb"
                                }, children: [_jsx("div", { style: {
                                            width: "80px",
                                            height: "80px",
                                            borderRadius: "50%",
                                            backgroundColor: avatarBgColor,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#fff",
                                            fontWeight: "bold",
                                            fontSize: "32px",
                                            margin: "0 auto 16px",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                        }, children: (user.name || "U").charAt(0).toUpperCase() }), _jsx("h3", { style: { margin: "0 0 8px", fontSize: "20px", fontWeight: "700", color: "#111827" }, children: user.name || "N/A" }), _jsxs("div", { style: { display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }, children: [_jsx("span", { style: {
                                                    backgroundColor: statusBgColor,
                                                    color: statusTextColor,
                                                    padding: "4px 16px",
                                                    borderRadius: "20px",
                                                    fontSize: "12px",
                                                    fontWeight: "600"
                                                }, children: user.status ? "Active" : "Inactive" }), _jsx("span", { style: {
                                                    backgroundColor: "#eef2ff",
                                                    color: "#4f46e5",
                                                    padding: "4px 16px",
                                                    borderRadius: "20px",
                                                    fontSize: "12px",
                                                    fontWeight: "600"
                                                }, children: formatCurrency(user.funds) }), _jsxs("span", { style: {
                                                    backgroundColor: "#fef3c7",
                                                    color: "#b45309",
                                                    padding: "4px 16px",
                                                    borderRadius: "20px",
                                                    fontSize: "12px",
                                                    fontWeight: "600"
                                                }, children: [user.login_count || 0, " Logins"] })] })] })), _jsx("div", { style: {
                                    display: "flex",
                                    gap: "8px",
                                    marginBottom: "16px",
                                    overflowX: "auto",
                                    paddingBottom: "8px"
                                }, children: isMobileView ? (_jsxs(_Fragment, { children: [_jsx(TabButton, { active: activeTab === "transactions", onClick: () => setActiveTab("transactions"), count: transactions.length, children: "Transactions" }), _jsx(TabButton, { active: activeTab === "funds", onClick: () => setActiveTab("funds"), count: fundRequests.length, children: "Fund Requests" }), _jsx(TabButton, { active: activeTab === "withdrawals", onClick: () => setActiveTab("withdrawals"), count: withdrawals.length, children: "Withdrawal History" }), _jsx(TabButton, { active: activeTab === "winning", onClick: () => setActiveTab("winning"), count: winningHistory.length, children: "Winning" }), _jsx(TabButton, { active: activeTab === "bidding", onClick: () => setActiveTab("bidding"), count: biddingHistory.length, children: "Bidding History" })] })) : (_jsxs(_Fragment, { children: [_jsx(TabButton, { active: activeTab === "info", onClick: () => setActiveTab("info"), children: "Info" }), _jsx(TabButton, { active: activeTab === "transactions", onClick: () => setActiveTab("transactions"), count: transactions.length, children: "Transactions" }), _jsx(TabButton, { active: activeTab === "funds", onClick: () => setActiveTab("funds"), count: fundRequests.length, children: "Fund Requests" }), _jsx(TabButton, { active: activeTab === "withdrawals", onClick: () => setActiveTab("withdrawals"), count: withdrawals.length, children: "Withdrawal History" }), _jsx(TabButton, { active: activeTab === "bidding", onClick: () => setActiveTab("bidding"), count: biddingHistory.length, children: "Bidding History" }), _jsx(TabButton, { active: activeTab === "winning", onClick: () => setActiveTab("winning"), count: winningHistory.length, children: "Wins" })] })) }), _jsxs("div", { style: { minHeight: "200px" }, children: [activeTab === "info" && renderInfoTab(), activeTab === "transactions" && renderTransactionsTab(), activeTab === "funds" && renderFundRequestsTab(), activeTab === "withdrawals" && renderWithdrawalsTab(), activeTab === "bidding" && renderBiddingTab(), activeTab === "winning" && renderWinningTab()] })] })) })] }) }));
}
