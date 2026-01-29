'use client';
import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetDeclaredResultsStarlineQuery } from "@/store/backendSlice/apiAPISlice";

const ResultSkeleton = () => (
    <div style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: "20px",
        borderBottom: "1px solid #f0f0f0"
    }}>
        <Skeleton width={40} height={20} />
        <Skeleton width={120} height={20} />
        <Skeleton width={80} height={28} borderRadius={6} />
        <Skeleton width={60} height={28} borderRadius={8} />
        <Skeleton width={100} height={20} />
        <Skeleton width={140} height={16} />
    </div>
);

export default function DeclaredResultsStarline() {
    const today = new Date().toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        page: 1,
        date: today,
        game_name: "",
        game_type: "",
        session: "",
        search: "",
        per_page: 10
    });

    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [debouncedSearch]);

    const { data: responseData, isLoading, isError, error, refetch } = useGetDeclaredResultsStarlineQuery(filters);

    const declaredResults = responseData?.data?.data || [];
    const pagination = responseData?.data?.pagination || {};
    const totalRows = pagination.total || 0;
    const currentPage = pagination.current_page || 1;
    const lastPage = pagination.last_page || 1;

    const gameTypes = ["single", "single_panna", "double_panna", "triple_panna"];

    const formatDate = (dateString) => {
        if(!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (timeString) => {
        if(!timeString) return "N/A";
        return timeString;
    };

    const getResultBadge = (result) => {
        if(!result && result !== 0) {
            return <span style={{ color: "#9ca3af" }}>Pending</span>;
        }
        return (
            <span style={{
                backgroundColor: "#fef3c7",
                color: "#b45309",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "700",
                fontFamily: "monospace",
                letterSpacing: "2px"
            }}>
                {result}
            </span>
        );
    };

    const getGameTypeBadge = (type) => {
        const typeColors = {
            single: { bg: "#dbeafe", color: "#1d4ed8" },
            single_panna: { bg: "#d1fae5", color: "#047857" },
            double_panna: { bg: "#fef3c7", color: "#b45309" },
            triple_panna: { bg: "#ede9fe", color: "#6d28d9" },
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
                {type?.replace(/_/g, " ") || "N/A"}
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
                <span style={{ fontWeight: "600", color: "#f59e0b" }}>#{row.id}</span>
            ),
        },
        {
            name: "Game Name",
            selector: (row) => row.game_name,
            sortable: true,
            cell: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "18px" }}>⭐</span>
                    <span style={{
                        fontWeight: "600",
                        color: "#111827",
                        fontSize: "14px"
                    }}>
                        {row.game_name || "N/A"}
                    </span>
                </div>
            ),
            width: "180px",
        },
        {
            name: "Time",
            selector: (row) => row.game_time || row.time,
            sortable: true,
            cell: (row) => (
                <span style={{
                    fontWeight: "600",
                    color: "#4f46e5",
                    fontSize: "14px",
                    backgroundColor: "#eef2ff",
                    padding: "4px 10px",
                    borderRadius: "6px"
                }}>
                    {formatTime(row.game_time || row.time)}
                </span>
            ),
            width: "110px",
        },
        {
            name: "Result",
            selector: (row) => row.result || row.number,
            sortable: true,
            cell: (row) => getResultBadge(row.result || row.number),
            width: "120px",
        },
        {
            name: "Panna",
            selector: (row) => row.panna,
            sortable: true,
            cell: (row) => (
                <span style={{
                    fontWeight: "700",
                    color: "#059669",
                    fontSize: "15px",
                    fontFamily: "monospace"
                }}>
                    {row.panna || "---"}
                </span>
            ),
            width: "90px",
        },
        {
            name: "Date",
            selector: (row) => row.result_date || row.date,
            sortable: true,
            cell: (row) => (
                <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>
                    {row.result_date || row.date || "N/A"}
                </span>
            ),
            width: "120px",
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => (
                <span style={{
                    backgroundColor: row.status === "declared" ? "#dcfce7" : "#fef3c7",
                    color: row.status === "declared" ? "#166534" : "#b45309",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "500",
                    textTransform: "capitalize"
                }}>
                    {row.status || "Declared"}
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
            width: "160px",
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
            game_type: "",
            session: "",
            search: "",
            per_page: 10
        });
        setDebouncedSearch("");
    };

    const hasActiveFilters = filters.game_name || filters.game_type || filters.session || filters.search || filters.date !== today;

    const subHeaderComponent = (
        <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "15px"
        }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
                padding: "10px 0"
            }}>
                <div style={{
                    backgroundColor: "#fefce8",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #f59e0b"
                }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Total Results</p>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#f59e0b", margin: "4px 0 0" }}>
                        {totalRows}
                    </p>
                </div>
                <div style={{
                    backgroundColor: "#f0fdf4",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #22c55e"
                }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>On This Page</p>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#22c55e", margin: "4px 0 0" }}>
                        {declaredResults.length}
                    </p>
                </div>
                <div style={{
                    backgroundColor: "#eff6ff",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #3b82f6"
                }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Selected Date</p>
                    <p style={{ fontSize: "16px", fontWeight: "700", color: "#3b82f6", margin: "4px 0 0" }}>
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

                <select
                    value={filters.game_type}
                    onChange={(e) => handleFilterChange("game_type", e.target.value)}
                    style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        outline: "none",
                        cursor: "pointer",
                        backgroundColor: "#fff",
                        minWidth: "140px"
                    }}
                >
                    <option value="">All Types</option>
                    {gameTypes.map((type, idx) => (
                        <option key={idx} value={type}>
                            {type.replace(/_/g, " ").charAt(0).toUpperCase() + type.replace(/_/g, " ").slice(1)}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Search..."
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
                        backgroundColor: "#f59e0b",
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
                <ResultSkeleton key={i} />
            ))}
        </div>
    );

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: "#fffbeb",
                borderBottom: "2px solid #fcd34d",
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
                backgroundColor: "#fefce8",
            },
        },
        pagination: {
            style: {
                borderTop: "1px solid #fcd34d",
            },
        },
    };

    if(isError) {
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
                    <h3 style={{ marginBottom: "10px" }}>Error loading starline declared results</h3>
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
                            <span style={{ fontSize: "20px" }}>⭐</span>
                            <span style={{ fontSize: "18px", fontWeight: "600" }}>Starline Declared Results</span>
                            {totalRows > 0 && (
                                <span style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    backgroundColor: "#fef3c7",
                                    padding: "4px 10px",
                                    borderRadius: "20px"
                                }}>
                                    Page {currentPage} of {lastPage}
                                </span>
                            )}
                        </div>
                    }
                    columns={columns}
                    data={declaredResults}
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
                            <span style={{ fontSize: "48px", display: "block", marginBottom: "10px" }}>⭐</span>
                            <p style={{ fontSize: "16px", marginBottom: "5px" }}>No declared results found for the selected date</p>
                            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                                {hasActiveFilters ? "Try adjusting your filters" : "Results will appear here once declared"}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        marginTop: "15px",
                                        padding: "8px 16px",
                                        backgroundColor: "#f59e0b",
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