"use client";

import { useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetTransactionsMutation } from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";

// Skeleton component for loading state
const TransactionSkeleton = () => (
    <div style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: "20px",
        borderBottom: "1px solid #f0f0f0"
    }}>
        <Skeleton width={60} height={20} />
        <Skeleton width={80} height={24} borderRadius={14} />
        <Skeleton width={100} height={20} />
        <Skeleton width={200} height={16} />
        <Skeleton width={150} height={16} />
    </div>
);

export default function TransactionsPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filterText, setFilterText] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const [getTransactions, { data, isLoading }] = useGetTransactionsMutation();
    console.log('the data', data);
    
    const transactions = data?.transactions || [];

    const handleSearch = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select start & end date");
            return;
        }

        // Validate date range
        if (new Date(startDate) > new Date(endDate)) {
            toast.error("Start date cannot be after end date");
            return;
        }

        try {
            await getTransactions({
                start_date: startDate,
                end_date: endDate,
            }).unwrap();
            toast.success("Transactions loaded successfully");
        } catch (err) {
            console.error("Transaction fetch error:", err);
            toast.error(err?.data?.message || "Failed to load transactions");
        }
    };

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
        setFilterText("");
        setTypeFilter("all");
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTypeBadge = (type) => {
        const typeLower = (type || "").toLowerCase();
        const styles = {
            withdraw: { background: "#fee2e2", color: "#b91c1c" },
            deposit: { background: "#dcfce7", color: "#166534" },
            credit: { background: "#dcfce7", color: "#166534" },
            debit: { background: "#fee2e2", color: "#b91c1c" },
            win: { background: "#dbeafe", color: "#1d4ed8" },
            bet: { background: "#fef3c7", color: "#b45309" },
            refund: { background: "#e0e7ff", color: "#4338ca" },
        };
        const style = styles[typeLower] || { background: "#f3f4f6", color: "#374151" };
        
        return (
            <span
                style={{
                    padding: "4px 12px",
                    borderRadius: "14px",
                    fontSize: "12px",
                    fontWeight: "500",
                    textTransform: "capitalize",
                    ...style,
                }}
            >
                {type || "N/A"}
            </span>
        );
    };

    // Filter data based on search text and type filter
    const filteredData = transactions.filter((t) => {
        // Type filter
        if (typeFilter !== "all" && (t.type || "").toLowerCase() !== typeFilter) {
            return false;
        }
        
        // Text filter
        if (filterText) {
            const search = filterText.toLowerCase();
            return (
                (t.id || "").toString().includes(search) ||
                (t.type || "").toLowerCase().includes(search) ||
                (t.description || "").toLowerCase().includes(search) ||
                (t.amount || "").toString().includes(search) ||
                (t.user_id || "").toString().includes(search)
            );
        }
        return true;
    });

    // Calculate stats
    const totalAmount = filteredData.reduce(
        (sum, t) => sum + parseFloat(t.amount || 0),
        0
    );

    const withdrawTotal = filteredData
        .filter((t) => (t.type || "").toLowerCase() === "withdraw")
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const depositTotal = filteredData
        .filter((t) => ["deposit", "credit"].includes((t.type || "").toLowerCase()))
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Get unique types for filter dropdown
    const uniqueTypes = [...new Set(transactions.map((t) => (t.type || "").toLowerCase()))];

    const columns = [
        {
            name: "ID",
            selector: (row) => row.id,
            sortable: true,
            width: "80px",
            cell: (row) => (
                <span style={{ fontWeight: "600", color: "#4f46e5" }}>#{row.id}</span>
            ),
        },
        {
            name: "User ID",
            selector: (row) => row.user_id,
            sortable: true,
            width: "100px",
            cell: (row) => (
                <span style={{ fontWeight: "500", color: "#6b7280" }}>
                    {row.user_id || "N/A"}
                </span>
            ),
        },
        {
            name: "Type",
            selector: (row) => row.type,
            sortable: true,
            width: "120px",
            cell: (row) => getTypeBadge(row.type),
        },
        {
            name: "Amount",
            selector: (row) => parseFloat(row.amount || 0),
            sortable: true,
            width: "130px",
            cell: (row) => {
                const typeLower = (row.type || "").toLowerCase();
                const isDebit = ["withdraw", "debit", "bet"].includes(typeLower);
                return (
                    <strong style={{ 
                        color: isDebit ? "#dc2626" : "#059669",
                        fontSize: "14px"
                    }}>
                        {isDebit ? "-" : "+"}₹{Number(row.amount || 0).toLocaleString("en-IN")}
                    </strong>
                );
            },
        },
        {
            name: "Description",
            selector: (row) => row.description,
            wrap: true,
            minWidth: "250px",
            cell: (row) => (
                <span style={{ fontSize: "13px", color: "#374151" }}>
                    {row.description || "N/A"}
                </span>
            ),
        },
        {
            name: "Bid ID",
            selector: (row) => row.bid_id,
            width: "100px",
            cell: (row) => (
                <span style={{ color: "#6b7280", fontSize: "13px" }}>
                    {row.bid_id || "-"}
                </span>
            ),
        },
        {
            name: "Date",
            selector: (row) => row.created_at,
            sortable: true,
            width: "180px",
            cell: (row) => (
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    {formatDate(row.created_at)}
                </span>
            ),
        },
    ];

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: "#f9fafb",
                borderBottom: "2px solid #e5e7eb",
            },
        },
        headCells: {
            style: {
                fontWeight: "600",
                fontSize: "14px",
                color: "#374151",
            },
        },
        rows: {
            style: {
                fontSize: "14px",
                minHeight: "55px",
            },
            highlightOnHoverStyle: {
                backgroundColor: "#f3f4f6",
            },
        },
        pagination: {
            style: {
                borderTop: "1px solid #e5e7eb",
            },
        },
    };

    const SkeletonLoader = () => (
        <div style={{ width: "100%" }}>
            {[...Array(8)].map((_, i) => (
                <TransactionSkeleton key={i} />
            ))}
        </div>
    );

    return (
        <main style={{ padding: "16px" }}>
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
            >
                {/* Title */}
                <h2 style={{ 
                    fontSize: "20px", 
                    fontWeight: "600", 
                    marginBottom: "20px",
                    color: "#111827"
                }}>
                    💰 Transactions History
                </h2>

                {/* Date Filters */}
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "16px",
                        alignItems: "center",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                fontSize: "14px",
                                outline: "none",
                            }}
                        />
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                fontSize: "14px",
                                outline: "none",
                            }}
                        />
                    </div>
                    
                    <div style={{ display: "flex", gap: "8px", alignSelf: "flex-end" }}>
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            style={{
                                padding: "10px 20px",
                                background: isLoading ? "#9ca3af" : "#4f46e5",
                                color: "#fff",
                                borderRadius: "8px",
                                border: "none",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                fontWeight: "500",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span style={{
                                        width: "14px",
                                        height: "14px",
                                        border: "2px solid #fff",
                                        borderTopColor: "transparent",
                                        borderRadius: "50%",
                                        animation: "spin 1s linear infinite",
                                    }} />
                                    Loading...
                                </>
                            ) : (
                                <>🔍 Search</>
                            )}
                        </button>
                        
                        {(startDate || endDate || filterText || typeFilter !== "all") && (
                            <button
                                onClick={handleClear}
                                style={{
                                    padding: "10px 16px",
                                    background: "#ef4444",
                                    color: "#fff",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                }}
                            >
                                ✕ Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Search and Type Filter */}
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "16px",
                        alignItems: "center",
                    }}
                >
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            fontSize: "14px",
                            outline: "none",
                            cursor: "pointer",
                            backgroundColor: "#fff",
                            minWidth: "140px",
                        }}
                    >
                        <option value="all">All Types</option>
                        {uniqueTypes.map((type) => (
                            <option key={type} value={type} style={{ textTransform: "capitalize" }}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Search by ID, type, description, amount..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            minWidth: "300px",
                            fontSize: "14px",
                            outline: "none",
                            flex: "1",
                        }}
                    />
                </div>

                {/* Stats Cards */}
                {transactions.length > 0 && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "12px",
                            marginBottom: "20px",
                        }}
                    >
                        <div
                            style={{
                                padding: "16px",
                                backgroundColor: "#f0f9ff",
                                borderRadius: "10px",
                                borderLeft: "4px solid #3b82f6",
                            }}
                        >
                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                                Total Records
                            </div>
                            <div style={{ fontSize: "24px", fontWeight: "700", color: "#3b82f6" }}>
                                {filteredData.length}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "16px",
                                backgroundColor: "#faf5ff",
                                borderRadius: "10px",
                                borderLeft: "4px solid #8b5cf6",
                            }}
                        >
                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                                Total Amount
                            </div>
                            <div style={{ fontSize: "24px", fontWeight: "700", color: "#8b5cf6" }}>
                                ₹{totalAmount.toLocaleString("en-IN")}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "16px",
                                backgroundColor: "#fef2f2",
                                borderRadius: "10px",
                                borderLeft: "4px solid #ef4444",
                            }}
                        >
                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                                Withdrawals
                            </div>
                            <div style={{ fontSize: "24px", fontWeight: "700", color: "#ef4444" }}>
                                ₹{withdrawTotal.toLocaleString("en-IN")}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "16px",
                                backgroundColor: "#f0fdf4",
                                borderRadius: "10px",
                                borderLeft: "4px solid #22c55e",
                            }}
                        >
                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                                Deposits/Credits
                            </div>
                            <div style={{ fontSize: "24px", fontWeight: "700", color: "#22c55e" }}>
                                ₹{depositTotal.toLocaleString("en-IN")}
                            </div>
                        </div>
                    </div>
                )}

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    paginationRowsPerPageOptions={[10, 25, 50, 100]}
                    highlightOnHover
                    striped
                    progressPending={isLoading}
                    progressComponent={<SkeletonLoader />}
                    customStyles={customStyles}
                    noDataComponent={
                        <div style={{
                            padding: "60px 20px",
                            textAlign: "center",
                            color: "#6b7280",
                        }}>
                            <span style={{ fontSize: "48px", display: "block", marginBottom: "12px" }}>
                                📊
                            </span>
                            <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                                {transactions.length === 0 
                                    ? "No transactions loaded yet" 
                                    : "No transactions match your filters"
                                }
                            </p>
                            <p style={{ fontSize: "14px", color: "#9ca3af" }}>
                                {transactions.length === 0 
                                    ? "Select a date range and click Search to load transactions"
                                    : "Try adjusting your search or filter criteria"
                                }
                            </p>
                        </div>
                    }
                />
            </div>

            {/* CSS for spin animation */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </main>
    );
}