'use client';
import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetBiddingHistoryGaliQuery } from "@/store/backendSlice/apiAPISlice";

const BidSkeleton = () => (
    <div style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: "20px",
        borderBottom: "1px solid #f0f0f0"
    }}>
        <Skeleton width={40} height={20} />
        <Skeleton width={100} height={20} />
        <Skeleton width={120} height={20} />
        <Skeleton width={80} height={28} borderRadius={6} />
        <Skeleton width={70} height={28} borderRadius={8} />
        <Skeleton width={80} height={20} />
        <Skeleton width={140} height={16} />
    </div>
);

export default function BiddingHistoryGali() {
    const today = new Date().toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        page: 1,
        date: today,
        game_name: "",
        search: "",
        per_page: 15
    });

    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [debouncedSearch]);

    const { data: responseData, isLoading, isError, error, refetch } = useGetBiddingHistoryGaliQuery(filters, {
        refetchOnMountOrArgChange: true,
    });
    const biddingHistory = responseData?.data?.data || [];
    const pagination = responseData?.data?.pagination || {};
    const totalRows = pagination.total || 0;
    const currentPage = pagination.current_page || 1;
    const lastPage = pagination.last_page || 1;

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
        if (!amount && amount !== 0) return "₹0";
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getGameTypeBadge = (type) => {
        const typeColors = {
            left: { bg: "#dbeafe", color: "#1d4ed8" },
            right: { bg: "#d1fae5", color: "#047857" },
            jodi: { bg: "#fef3c7", color: "#b45309" },
            haruf: { bg: "#ede9fe", color: "#6d28d9" },
        };
        const style = typeColors[type?.toLowerCase()] || { bg: "#f3f4f6", color: "#374151" };
        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.color,
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "500",
                textTransform: "capitalize"
            }}>
                {type || "N/A"}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const isWin = status?.toLowerCase() === "win";
        const isLoss = status?.toLowerCase() === "loss";
        const isPending = status?.toLowerCase() === "pending";

        let style = { bg: "#f3f4f6", color: "#374151" };
        if (isWin) style = { bg: "#dcfce7", color: "#166534" };
        if (isLoss) style = { bg: "#fef2f2", color: "#dc2626" };
        if (isPending) style = { bg: "#fef3c7", color: "#b45309" };

        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.color,
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "capitalize"
            }}>
                {status || "Pending"}
            </span>
        );
    };

    const columns = [
        {
            name: "S.No",
            selector: (row, index) => ((filters.page - 1) * filters.per_page) + index + 1,
            sortable: false,
            width: "70px",
        },
        {
            name: "ID",
            selector: (row) => row.id,
            sortable: true,
            width: "80px",
            cell: (row) => (
                <span style={{ fontWeight: "600", color: "#6366f1" }}>#{row.id}</span>
            ),
        },
        {
            name: "User",
            selector: (row) => row.user_name || row.username,
            sortable: true,
            cell: (row) => (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "600", color: "#111827", fontSize: "14px" }}>
                        {row.user_name || row.username || "N/A"}
                    </span>
                    {row.mobile && (
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            {row.mobile}
                        </span>
                    )}
                </div>
            ),
            width: "150px",
        },
        {
            name: "Game Name",
            selector: (row) => row.game_name,
            sortable: true,
            cell: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>🌙</span>
                    <span style={{
                        fontWeight: "600",
                        color: "#111827",
                        fontSize: "14px"
                    }}>
                        {row.game_name || "N/A"}
                    </span>
                </div>
            ),
            width: "160px",
        },
        {
            name: "Game Type",
            selector: (row) => row.game_type,
            sortable: true,
            cell: (row) => getGameTypeBadge(row.game_type),
            width: "110px",
        },
        {
            name: "Number",
            selector: (row) => row.number || row.bid_number,
            sortable: true,
            cell: (row) => (
                <span style={{
                    fontWeight: "700",
                    color: "#4f46e5",
                    fontSize: "16px",
                    fontFamily: "monospace",
                    backgroundColor: "#eef2ff",
                    padding: "4px 10px",
                    borderRadius: "6px"
                }}>
                    {row.number || row.bid_number || "---"}
                </span>
            ),
            width: "100px",
        },
        {
            name: "Amount",
            selector: (row) => row.amount || row.bid_amount,
            sortable: true,
            cell: (row) => (
                <span style={{
                    fontWeight: "700",
                    color: "#059669",
                    fontSize: "14px"
                }}>
                    {formatCurrency(row.amount || row.bid_amount)}
                </span>
            ),
            width: "110px",
        },
        {
            name: "Winning",
            selector: (row) => row.winning_amount,
            sortable: true,
            cell: (row) => (
                <span style={{
                    fontWeight: "700",
                    color: row.winning_amount > 0 ? "#16a34a" : "#9ca3af",
                    fontSize: "14px"
                }}>
                    {row.winning_amount > 0 ? formatCurrency(row.winning_amount) : "—"}
                </span>
            ),
            width: "110px",
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => getStatusBadge(row.status),
            width: "100px",
        },
        {
            name: "Bid Date",
            selector: (row) => row.bid_date || row.date,
            sortable: true,
            cell: (row) => (
                <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>
                    {row.bid_date || row.date || "N/A"}
                </span>
            ),
            width: "110px",
        },
        {
            name: "Created At",
            selector: (row) => row.created_at,
            sortable: true,
            cell: (row) => (
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    {formatDate(row.created_at)}
                </span>
            ),
            width: "150px",
        },
    ];

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handlePerRowsChange = (newPerPage) => {
        setFilters(prev => ({ ...prev, per_page: newPerPage, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            page: 1,
            date: today,
            game_name: "",
            search: "",
            per_page: 15
        });
        setDebouncedSearch("");
    };

    const hasActiveFilters = filters.game_name || filters.search || filters.date !== today;

    // Calculate totals
    const totalBidAmount = biddingHistory.reduce((sum, bid) => sum + (parseFloat(bid.amount || bid.bid_amount) || 0), 0);
    const totalWinning = biddingHistory.reduce((sum, bid) => sum + (parseFloat(bid.winning_amount) || 0), 0);

    const subHeaderComponent = (
        <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "15px",
            margin: "12px 0px"
        }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
                padding: "10px 0"
            }}>
                <div style={{
                    backgroundColor: "#eef2ff",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #6366f1"
                }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Total Bids</p>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#6366f1", margin: "4px 0 0" }}>
                        {totalRows}
                    </p>
                </div>
                <div style={{
                    backgroundColor: "#fef3c7",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #f59e0b"
                }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Bid Amount (Page)</p>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "#f59e0b", margin: "4px 0 0" }}>
                        {formatCurrency(totalBidAmount)}
                    </p>
                </div>
                <div style={{
                    backgroundColor: "#dcfce7",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #22c55e"
                }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Winning (Page)</p>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "#22c55e", margin: "4px 0 0" }}>
                        {formatCurrency(totalWinning)}
                    </p>
                </div>
                <div style={{
                    backgroundColor: "#f3e8ff",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #9333ea"
                }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Selected Date</p>
                    <p style={{ fontSize: "16px", fontWeight: "700", color: "#9333ea", margin: "4px 0 0" }}>
                        {filters.date || today}
                    </p>
                </div>
            </div>

            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center"
            }}>
                <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
                    style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "#fff"
                    }}
                />

                <input
                    type="text"
                    placeholder="Game name..."
                    value={filters.game_name}
                    onChange={(e) => handleFilterChange("game_name", e.target.value)}
                    style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "#fff",
                        minWidth: "150px"
                    }}
                />

                <input
                    type="text"
                    placeholder="Search user, number..."
                    value={debouncedSearch}
                    onChange={(e) => setDebouncedSearch(e.target.value)}
                    style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        minWidth: "180px",
                        fontSize: "14px",
                        outline: "none",
                    }}
                />

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        style={{
                            padding: "10px 14px",
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        ✕ Clear
                    </button>
                )}

                <button
                    onClick={refetch}
                    style={{
                        padding: "10px 14px",
                        backgroundColor: "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginLeft: "auto"
                    }}
                >
                    🔄 Refresh
                </button>
            </div>
        </div>
    );

    const SkeletonLoader = () => (
        <div style={{ width: "100%" }}>
            {[...Array(10)].map((_, i) => (
                <BidSkeleton key={i} />
            ))}
        </div>
    );

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: "#eef2ff",
                borderBottom: "2px solid #c7d2fe",
            },
        },
        headCells: {
            style: {
                fontWeight: "600",
                fontSize: "13px",
                color: "#374151",
            },
        },
        rows: {
            style: {
                fontSize: "14px",
                minHeight: "60px",
            },
            highlightOnHoverStyle: {
                backgroundColor: "#f5f3ff",
            },
        },
        pagination: {
            style: {
                borderTop: "1px solid #c7d2fe",
            },
        },
    };

    if (isError) {
        return (
            <main style={{ padding: "20px" }}>
                <div style={{
                    color: "#dc2626",
                    padding: "40px",
                    textAlign: "center",
                    backgroundColor: "#fef2f2",
                    borderRadius: "12px",
                    border: "1px solid #fecaca"
                }}>
                    <h3 style={{ marginBottom: "10px" }}>Error loading Gali bidding history</h3>
                    <p>{error?.data?.message || error?.message || "Something went wrong"}</p>
                    <button
                        onClick={() => refetch()}
                        style={{
                            marginTop: "15px",
                            padding: "10px 20px",
                            backgroundColor: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        Retry
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main style={{ padding: "9px" }}>
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                overflow: "hidden"
            }}>
                <DataTable
                    title={
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 0"
                        }}>
                            <span style={{ fontSize: "18px", fontWeight: "600" }}>Gali Bidding History</span>
                            {totalRows > 0 && (
                                <span style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    backgroundColor: "#eef2ff",
                                    padding: "4px 10px",
                                    borderRadius: "20px"
                                }}>
                                    Page {currentPage} of {lastPage}
                                </span>
                            )}
                        </div>
                    }
                    columns={columns}
                    data={biddingHistory}
                    striped
                    highlightOnHover
                    subHeader
                    subHeaderComponent={subHeaderComponent}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    paginationPerPage={filters.per_page}
                    paginationDefaultPage={currentPage}
                    paginationRowsPerPageOptions={[10, 15, 30, 50, 100]}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handlePerRowsChange}
                    progressPending={isLoading}
                    progressComponent={<SkeletonLoader />}
                    responsive
                    customStyles={customStyles}
                    noDataComponent={
                        <div style={{
                            padding: "40px",
                            textAlign: "center",
                            color: "#6b7280"
                        }}>
                            <span style={{ fontSize: "48px", display: "block", marginBottom: "10px" }}>🌙</span>
                            <p style={{ fontSize: "16px", marginBottom: "5px" }}>No Gali bidding history found</p>
                            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                                {hasActiveFilters ? "Try adjusting your filters" : "Bids will appear here once placed"}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        marginTop: "15px",
                                        padding: "8px 16px",
                                        backgroundColor: "#6366f1",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    }
                />
            </div>
        </main>
    );
}