'use client';
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetUserByIdQuery } from "@/store/backendSlice/apiAPISlice";

const InfoRow = ({ label, value, isSensitive = false }) => (
    <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #f3f4f6"
    }}>
        <span style={{
            color: "#6b7280",
            fontSize: "14px"
        }}>
            {label}
        </span>
        <span style={{
            fontWeight: "600",
            color: isSensitive ? "#9ca3af" : "#111827",
            fontSize: "14px",
            textAlign: "right",
            maxWidth: "200px",
            wordBreak: "break-word",
            fontFamily: isSensitive ? "monospace" : "inherit"
        }}>
            {value || "N/A"}
        </span>
    </div>
);

const SectionHeader = ({ title }) => (
    <div style={{
        padding: "16px 0 12px",
        borderBottom: "2px solid #e5e7eb",
        marginTop: "16px"
    }}>
        <span style={{ fontSize: "15px", fontWeight: "600", color: "#374151" }}>{title}</span>
    </div>
);

const TabButton = ({ active, onClick, children, count }) => (
    <button
        onClick={onClick}
        style={{
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
        }}
    >
        {children}
        {count !== undefined && (
            <span style={{
                backgroundColor: active ? "rgba(255,255,255,0.2)" : "#e5e7eb",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "11px"
            }}>
                {count}
            </span>
        )}
    </button>
);

const EmptyState = ({ message }) => (
    <div style={{
        textAlign: "center",
        padding: "40px 20px",
        color: "#9ca3af"
    }}>
        <p style={{ margin: 0, fontSize: "14px" }}>{message}</p>
    </div>
);

export default function UserViewModal({ userId, onClose, variant = "default" }) {
    const [activeTab, setActiveTab] = useState("info");

    const { data: userData, isLoading, isError } = useGetUserByIdQuery(userId, {
        skip: !userId,
    });

    console.log("Full userData:", userData);

    // Fixed data extraction based on actual API structure
    const responseData = userData?.user || {};
    const rawUser = responseData?.user;
    const baseUser = Array.isArray(rawUser) ? rawUser[0] || {} : rawUser || {};
    const user = {
        ...baseUser,
        pass:
            baseUser?.pass ??
            baseUser?.password ??
            responseData?.pass ??
            responseData?.password ??
            responseData?.user_pass ??
            null,
    };
    const transactions = responseData?.transactions || [];
    const fundRequests = responseData?.fund_requests || [];
    const withdrawals = responseData?.withdrawal || [];
    const bets = responseData?.bets || [];
    const winningHistory = responseData?.winning_history || [];

    console.log("Extracted user:", user);
    console.log("Transactions:", transactions);
    console.log("Fund Requests:", fundRequests);
    console.log("Withdrawals:", withdrawals);
    console.log("Bets:", bets);
    console.log("Winning History:", winningHistory);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
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

    const isInactive = variant === "inactive" || user.status === 0;
    const headerBgColor = isInactive ? "#fef2f2" : "#f9fafb";
    const avatarBgColor = user.status ? "#4f46e5" : "#9ca3af";
    const statusBgColor = user.status ? "#dcfce7" : "#fef2f2";
    const statusTextColor = user.status ? "#166534" : "#dc2626";
    const actionButtonBg = isInactive ? "#22c55e" : "#4f46e5";
    const actionButtonText = isInactive ? " User" : "Edit User";

    const renderInfoTab = () => (
        <>
            <SectionHeader title="Basic Information" />
            <InfoRow label="User ID" value={`#${user.id}`} />
            <InfoRow label="Name" value={user.name} />
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Pass" value={user.pass} isSensitive />
            <InfoRow label="Funds" value={formatCurrency(user.funds)} />
            <InfoRow label="Login Count" value={user.login_count} />
            <InfoRow label="Referral Code" value={user.referral_code} />
            <InfoRow label="Referrer ID" value={user.referrer_id || "None"} />

            <SectionHeader title="Bank Details" />
            <InfoRow label="Bank Name" value={user.bank_name} />
            <InfoRow label="Account Holder" value={user.account_holder} />
            <InfoRow label="Account Number" value={user.acccount_number} isSensitive />
            <InfoRow label="IFSC Code" value={user.ifsc} />
            <InfoRow label="Bank Address" value={user.bank_address} />

            <SectionHeader title="UPI & Payment" />
            <InfoRow label="UPI ID" value={user.upi} />
            <InfoRow label="Google Pay" value={user.google_pay} />
            <InfoRow label="Phone Pay" value={user.phone_pay} />
            <InfoRow label="Paytm" value={user.paytm} />

            <SectionHeader title="Account Info" />
            <InfoRow label="Created At" value={formatDate(user.created_at)} />
            <InfoRow label="Updated At" value={formatDate(user.updated_at)} />
        </>
    );

    const renderTransactionsTab = () => (
        <>
            {transactions.length === 0 ? (
                <EmptyState message="No transactions found" />
            ) : (
                <div style={{ marginTop: "16px" }}>
                    {transactions.map((txn, index) => (
                        <div key={index} style={{
                            padding: "12px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontWeight: "600", color: "#111827" }}>
                                    {txn.type || "Transaction"}
                                </span>
                                <span style={{
                                    fontWeight: "700",
                                    color: txn.type === "credit" ? "#22c55e" : "#ef4444"
                                }}>
                                    {txn.type === "credit" ? "+" : "-"}{formatCurrency(txn.amount)}
                                </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                {formatDate(txn.created_at)}
                            </div>
                            {txn.description && (
                                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                                    {txn.description}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    const renderFundRequestsTab = () => (
        <>
            {fundRequests.length === 0 ? (
                <EmptyState message="No fund requests found" />
            ) : (
                <div style={{ marginTop: "16px" }}>
                    {fundRequests.map((req, index) => (
                        <div key={index} style={{
                            padding: "12px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontWeight: "600", color: "#111827" }}>
                                    {formatCurrency(req.amount)}
                                </span>
                                <span style={{
                                    padding: "2px 10px",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    backgroundColor: req.status === "approved" ? "#dcfce7" : req.status === "pending" ? "#fef3c7" : "#fef2f2",
                                    color: req.status === "approved" ? "#166534" : req.status === "pending" ? "#b45309" : "#dc2626"
                                }}>
                                    {req.status || "Pending"}
                                </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                {formatDate(req.created_at)}
                            </div>
                            {req.payment_method && (
                                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                                    Method: {req.payment_method}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    const renderWithdrawalsTab = () => (
        <>
            {withdrawals.length === 0 ? (
                <EmptyState message="No withdrawals found" />
            ) : (
                <div style={{ marginTop: "16px" }}>
                    {withdrawals.map((wd, index) => (
                        <div key={index} style={{
                            padding: "12px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontWeight: "600", color: "#111827" }}>
                                    {formatCurrency(wd.amount)}
                                </span>
                                <span style={{
                                    padding: "2px 10px",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    backgroundColor: wd.status === "approved" ? "#dcfce7" : wd.status === "pending" ? "#fef3c7" : "#fef2f2",
                                    color: wd.status === "approved" ? "#166534" : wd.status === "pending" ? "#b45309" : "#dc2626"
                                }}>
                                    {wd.status || "Pending"}
                                </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                {formatDate(wd.created_at)}
                            </div>
                            {wd.payment_method && (
                                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                                    Method: {wd.payment_method}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    const renderBetsTab = () => (
        <>
            {bets.length === 0 ? (
                <EmptyState message="No bets found" />
            ) : (
                <div style={{ marginTop: "16px" }}>
                    {bets.map((bet, index) => (
                        <div key={index} style={{
                            padding: "12px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontWeight: "600", color: "#111827" }}>
                                    {bet.game_name || "Game"}
                                </span>
                                <span style={{ fontWeight: "700", color: "#4f46e5" }}>
                                    {formatCurrency(bet.amount)}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280" }}>
                                <span>Number: {bet.number || "N/A"}</span>
                                <span>{formatDate(bet.created_at)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    const renderWinningTab = () => (
        <>
            {winningHistory.length === 0 ? (
                <EmptyState message="No winning history found" />
            ) : (
                <div style={{ marginTop: "16px" }}>
                    {winningHistory.map((win, index) => (
                        <div key={index} style={{
                            padding: "12px",
                            backgroundColor: "#dcfce7",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            border: "1px solid #bbf7d0"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontWeight: "600", color: "#166534" }}>
                                    {win.game_name || "Win"}
                                </span>
                                <span style={{ fontWeight: "700", color: "#22c55e" }}>
                                    +{formatCurrency(win.amount)}
                                </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#166534" }}>
                                {formatDate(win.created_at)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    const handleAction = () => {
        if (isInactive) {
            // Activate user logic
            console.log("Activating user:", userId);
            // Add your activation API call here
        } else {
            // Edit user logic
            console.log("Editing user:", userId);
            // Add your edit logic here
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
        }} onClick={onClose}>
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                display: "flex",
                flexDirection: "column"
            }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: "20px 24px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: headerBgColor,
                    flexShrink: 0
                }}>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                        {isInactive ? "Inactive User Details" : "User Details"}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "24px",
                            cursor: "pointer",
                            color: "#6b7280",
                            padding: "4px",
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: "24px",
                    overflowY: "auto",
                    flex: 1
                }}>
                    {isLoading ? (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <Skeleton circle width={80} height={80} style={{ marginBottom: "16px" }} />
                            <Skeleton width={150} height={20} style={{ marginBottom: "8px", margin: "0 auto" }} />
                            <Skeleton width={80} height={24} borderRadius={20} style={{ margin: "0 auto" }} />
                            <div style={{ marginTop: "24px" }}>
                                {[...Array(8)].map((_, i) => (
                                    <Skeleton key={i} height={44} style={{ marginBottom: "8px" }} />
                                ))}
                            </div>
                        </div>
                    ) : isError ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#dc2626"
                        }}>
                            <p style={{ margin: 0, fontWeight: "500" }}>Failed to load user details</p>
                            <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#6b7280" }}>
                                Please try again later
                            </p>
                        </div>
                    ) : !user || !user.id ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#6b7280"
                        }}>
                            <p style={{ margin: 0, fontWeight: "500" }}>No user data available</p>
                        </div>
                    ) : (
                        <>
                            {/* User Avatar & Name */}
                            <div style={{
                                textAlign: "center",
                                marginBottom: "20px",
                                paddingBottom: "20px",
                                borderBottom: "1px solid #e5e7eb"
                            }}>
                                <div style={{
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
                                }}>
                                    {(user.name || "U").charAt(0).toUpperCase()}
                                </div>
                                <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700", color: "#111827" }}>
                                    {user.name || "N/A"}
                                </h3>
                                <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{
                                        backgroundColor: statusBgColor,
                                        color: statusTextColor,
                                        padding: "4px 16px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "600"
                                    }}>
                                        {user.status ? "Active" : "Inactive"}
                                    </span>
                                    <span style={{
                                        backgroundColor: "#eef2ff",
                                        color: "#4f46e5",
                                        padding: "4px 16px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "600"
                                    }}>
                                        {formatCurrency(user.funds)}
                                    </span>
                                    <span style={{
                                        backgroundColor: "#fef3c7",
                                        color: "#b45309",
                                        padding: "4px 16px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "600"
                                    }}>
                                        {user.login_count || 0} Logins
                                    </span>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div style={{
                                display: "flex",
                                gap: "8px",
                                marginBottom: "16px",
                                overflowX: "auto",
                                paddingBottom: "8px"
                            }}>
                                <TabButton
                                    active={activeTab === "info"}
                                    onClick={() => setActiveTab("info")}
                                >
                                    Info
                                </TabButton>
                                <TabButton
                                    active={activeTab === "transactions"}
                                    onClick={() => setActiveTab("transactions")}
                                    count={transactions.length}
                                >
                                    Transactions
                                </TabButton>
                                <TabButton
                                    active={activeTab === "funds"}
                                    onClick={() => setActiveTab("funds")}
                                    count={fundRequests.length}
                                >
                                    Funds
                                </TabButton>
                                <TabButton
                                    active={activeTab === "withdrawals"}
                                    onClick={() => setActiveTab("withdrawals")}
                                    count={withdrawals.length}
                                >
                                    Withdrawals
                                </TabButton>
                                <TabButton
                                    active={activeTab === "bets"}
                                    onClick={() => setActiveTab("bets")}
                                    count={bets.length}
                                >
                                    Bets
                                </TabButton>
                                <TabButton
                                    active={activeTab === "winning"}
                                    onClick={() => setActiveTab("winning")}
                                    count={winningHistory.length}
                                >
                                    Wins
                                </TabButton>
                            </div>

                            {/* Tab Content */}
                            <div style={{ minHeight: "200px" }}>
                                {activeTab === "info" && renderInfoTab()}
                                {activeTab === "transactions" && renderTransactionsTab()}
                                {activeTab === "funds" && renderFundRequestsTab()}
                                {activeTab === "withdrawals" && renderWithdrawalsTab()}
                                {activeTab === "bets" && renderBetsTab()}
                                {activeTab === "winning" && renderWinningTab()}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                {!isLoading && !isError && user && user.id && (
                    <div style={{
                        display: "flex",
                        gap: "12px",
                        padding: "16px 24px",
                        borderTop: "1px solid #e5e7eb",
                        backgroundColor: "#f9fafb",
                        flexShrink: 0
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: "12px",
                                backgroundColor: "#fff",
                                color: "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "600"
                            }}
                        >
                            Close
                        </button>
                        <button
                            onClick={handleAction}
                            style={{
                                flex: 1,
                                padding: "12px",
                                backgroundColor: actionButtonBg,
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "600"
                            }}
                        >
                            {actionButtonText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
