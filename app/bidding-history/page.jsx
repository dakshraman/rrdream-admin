'use client';
import { useState, useEffect, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DataTable from "react-data-table-component";
import { useGetBiddingHistoryQuery } from "@/store/backendSlice/apiAPISlice";

const BiddingSkeleton = () => (
    <div style={{
        display: "flex", alignItems: "center",
        padding: "12px 16px", gap: "12px",
        borderBottom: "1px solid #f0f0f0", flexWrap: "wrap"
    }}>
        <Skeleton width={40} height={20} />
        <Skeleton width={60} height={20} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Skeleton circle width={36} height={36} />
            <Skeleton width={100} height={16} />
        </div>
        <Skeleton width={90} height={24} borderRadius={6} />
        <Skeleton width={70} height={24} borderRadius={6} />
        <Skeleton width={50} height={20} />
        <Skeleton width={70} height={20} />
    </div>
);

export default function BiddingHistory() {
    const today = new Date().toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        page: 1, date: today, game_name: "", game_type: "",
        session: "", search: "", per_page: 10
    });
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [debouncedSearch]);

    // ── QUERY 1: Fetch all game names for dropdown (once, no filters) ──
    const { data: allDataResponse } = useGetBiddingHistoryQuery(
        { page: 1, per_page: 1000, date: "", game_name: "", game_type: "", session: "", search: "" },
        { refetchOnMountOrArgChange: false }
    );

    const gameNameOptions = useMemo(() => {
        const raw = allDataResponse?.data || [];
        const names = raw.map(row => row.game_name).filter(Boolean);
        return [...new Set(names)].sort((a, b) => a.localeCompare(b));
    }, [allDataResponse]);

    // ── QUERY 2: Filtered table data ──
    const { data: responseData, isLoading, isError, error, refetch } = useGetBiddingHistoryQuery(filters, {
        refetchOnMountOrArgChange: true,
    });

    const biddingHistory = responseData?.data || [];
    const pagination = responseData?.pagination || {};
    const totalRows = pagination.total || 0;
    const currentPage = pagination.current_page || 1;
    const lastPage = pagination.last_page || 1;

    const gameTypes = ["single", "jodi", "single_panna", "double_panna", "triple_panna", "DOUBLE DIGIT"];
    const sessions = ["Open", "Close"];

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getGameTypeBadge = (type) => {
        const map = {
            "single": { bg: "#dbeafe", color: "#1d4ed8" },
            "jodi": { bg: "#fce7f3", color: "#be185d" },
            "single panna": { bg: "#d1fae5", color: "#047857" },
            "double panna": { bg: "#fef3c7", color: "#b45309" },
            "triple panna": { bg: "#ede9fe", color: "#6d28d9" },
            "double digit": { bg: "#fef3c7", color: "#b45309" },
        };
        const key = type?.toLowerCase().replace(/_/g, " ");
        const s = map[key] || { bg: "#f3f4f6", color: "#374151" };
        return (
            <span style={{
                backgroundColor: s.bg, color: s.color, padding: "3px 7px",
                borderRadius: "5px", fontSize: "10px", fontWeight: "700",
                textTransform: "capitalize", whiteSpace: "nowrap"
            }}>{type?.replace(/_/g, " ") || "N/A"}</span>
        );
    };

    const getSessionBadge = (session) => {
        const isOpen = session?.toLowerCase() === "open";
        return (
            <span style={{
                backgroundColor: isOpen ? "#dcfce7" : "#fee2e2",
                color: isOpen ? "#166534" : "#991b1b",
                padding: "3px 7px", borderRadius: "5px",
                fontSize: "10px", fontWeight: "700", textTransform: "capitalize", whiteSpace: "nowrap"
            }}>{session || "N/A"}</span>
        );
    };

    const getResultBadge = (winning_amount, isWin) => {
        if (winning_amount === null || winning_amount === undefined)
            return <span style={{ color: "#9ca3af", fontSize: "10px" }}>Pending</span>;
        return (
            <span style={{
                backgroundColor: isWin ? "#dcfce7" : "#fee2e2",
                color: isWin ? "#166534" : "#991b1b",
                padding: "3px 7px", borderRadius: "5px",
                fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap"
            }}>{isWin ? `Won ₹${winning_amount}` : "Lost"}</span>
        );
    };

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    const handlePageChange = (page) => setFilters(prev => ({ ...prev, page }));
    const handlePerRowsChange = (newPerPage) => setFilters(prev => ({ ...prev, per_page: newPerPage, page: 1 }));
    const clearFilters = () => {
        setFilters({ page: 1, date: today, game_name: "", game_type: "", session: "", search: "", per_page: 10 });
        setDebouncedSearch("");
    };
    const hasActiveFilters = filters.game_name || filters.game_type || filters.session || filters.search || filters.date !== today;

    const inputStyle = {
        padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #d1d5db",
        fontSize: "13px", outline: "none", backgroundColor: "#fff", color: "#111827",
        width: "100%", boxSizing: "border-box", minHeight: "38px",
    };

    const FiltersSection = () => (
        <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "8px", width: "100%", margin: "10px 0"
        }}>
            <div>
                <label style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Date</label>
                <input type="date" value={filters.date} onChange={(e) => handleFilterChange("date", e.target.value)} style={{ ...inputStyle, marginTop: "3px" }} />
            </div>
            <div>
                <label style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Game Name</label>
                <select
                    value={filters.game_name}
                    onChange={(e) => handleFilterChange("game_name", e.target.value)}
                    style={{ ...inputStyle, marginTop: "3px", cursor: "pointer" }}
                >
                    <option value="">All Games</option>
                    {gameNameOptions.map((name, i) => (
                        <option key={i} value={name}>{name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Type</label>
                <select value={filters.game_type} onChange={(e) => handleFilterChange("game_type", e.target.value)} style={{ ...inputStyle, marginTop: "3px" }}>
                    <option value="">All Types</option>
                    {gameTypes.map((t, i) => <option key={i} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
            </div>
            <div>
                <label style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Session</label>
                <select value={filters.session} onChange={(e) => handleFilterChange("session", e.target.value)} style={{ ...inputStyle, marginTop: "3px" }}>
                    <option value="">All Sessions</option>
                    {sessions.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
            </div>
            <div style={{ gridColumn: isMobile ? "1 / -1" : "auto" }}>
                <label style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Search</label>
                <input type="text" placeholder="Search user, phone..." value={debouncedSearch} onChange={(e) => setDebouncedSearch(e.target.value)} style={{ ...inputStyle, marginTop: "3px" }} />
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", gridColumn: isMobile ? "1 / -1" : "auto", paddingTop: "16px" }}>
                {hasActiveFilters && (
                    <button onClick={clearFilters} style={{
                        padding: "8px 12px", backgroundColor: "#ef4444", color: "#fff",
                        border: "none", borderRadius: "8px", cursor: "pointer",
                        fontSize: "13px", fontWeight: "600", flex: 1, minHeight: "38px"
                    }}>✕ Clear</button>
                )}
                <button onClick={refetch} style={{
                    padding: "8px 12px", backgroundColor: "#4f46e5", color: "#fff",
                    border: "none", borderRadius: "8px", cursor: "pointer",
                    fontSize: "13px", fontWeight: "600", flex: 1, minHeight: "38px"
                }}>🔄 Refresh</button>
            </div>
        </div>
    );

    // ── MOBILE HORIZONTAL-SCROLL TABLE ────────────────────────────────────────────
    const MobileTable = () => {
        const th = {
            padding: "9px 8px", fontSize: "10px", fontWeight: "700", color: "#6b7280",
            backgroundColor: "#f9fafb", textTransform: "uppercase", letterSpacing: "0.4px",
            whiteSpace: "nowrap", borderBottom: "2px solid #e5e7eb", textAlign: "left"
        };
        const td = (extra = {}) => ({
            padding: "9px 8px", fontSize: "11px", borderBottom: "1px solid #f0f0f0",
            whiteSpace: "nowrap", verticalAlign: "middle", ...extra
        });

        return (
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "650px" }}>
                    <thead>
                        <tr>
                            <th style={th}>#</th>
                            <th style={th}>User</th>
                            <th style={th}>Game</th>
                            <th style={th}>Type</th>
                            <th style={th}>Session</th>
                            <th style={th}>O.Digit</th>
                            <th style={th}>O.Pana</th>
                            <th style={th}>Points</th>
                            <th style={th}>Result</th>
                            <th style={th}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {biddingHistory.map((row, index) => (
                            <tr key={row.id || index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb" }}>
                                <td style={td({ color: "#9ca3af", fontWeight: "600" })}>
                                    {((filters.page - 1) * filters.per_page) + index + 1}
                                </td>
                                <td style={td()}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <div style={{
                                            width: "26px", height: "26px", borderRadius: "50%",
                                            backgroundColor: "#4f46e5", display: "flex", alignItems: "center",
                                            justifyContent: "center", color: "#fff", fontWeight: "700",
                                            fontSize: "10px", flexShrink: 0
                                        }}>
                                            {(row.username || row.user?.name || "U").charAt(0).toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: "600", fontSize: "11px", color: "#111827" }}>
                                            {row.username || row.user?.name || "N/A"}
                                        </span>
                                    </div>
                                </td>
                                <td style={td({ fontWeight: "700", color: "#111827" })}>{row.game_name || "N/A"}</td>
                                <td style={td()}>{getGameTypeBadge(row.game_type)}</td>
                                <td style={td()}>{getSessionBadge(row.session)}</td>
                                <td style={td({ fontWeight: "700", color: "#4f46e5", fontFamily: "monospace", fontSize: "13px" })}>{row.open_digit ?? "—"}</td>
                                <td style={td({ fontWeight: "700", color: "#4f46e5", fontFamily: "monospace", fontSize: "13px" })}>{row.open_pana ?? "—"}</td>
                                <td style={td({ fontWeight: "700", color: "#059669" })}>₹{parseFloat(row.points || 0).toLocaleString('en-IN')}</td>
                                <td style={td()}>{getResultBadge(row.winning_amount, row.is_win || row.winning_amount > 0)}</td>
                                <td style={td({ color: "#6b7280" })}>{row.date || formatDate(row.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // ── DESKTOP DATATABLE COLUMNS ─────────────────────────────────────────────────
    const columns = [
        { name: "S.No", selector: (row, i) => ((filters.page - 1) * filters.per_page) + i + 1, width: "60px" },
        {
            name: "User", selector: (row) => row.username || row.user?.name || "N/A", sortable: true, width: "160px",
            cell: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "11px", flexShrink: 0 }}>
                        {(row.username || row.user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: "500", fontSize: "12px" }}>{row.username || row.user?.name || "N/A"}</div>
                        {(row.user?.phone || row.phone) && <div style={{ fontSize: "10px", color: "#6b7280" }}>{row.user?.phone || row.phone}</div>}
                    </div>
                </div>
            )
        },
        { name: "Game", selector: (row) => row.game_name, sortable: true, width: "130px", cell: (row) => <span style={{ fontWeight: "600", color: "#111827", fontSize: "12px" }}>{row.game_name || "N/A"}</span> },
        { name: "Type", selector: (row) => row.game_type, sortable: true, width: "120px", cell: (row) => getGameTypeBadge(row.game_type) },
        { name: "Session", selector: (row) => row.session, sortable: true, width: "90px", cell: (row) => getSessionBadge(row.session) },
        { name: "Open Digit", selector: (row) => row.open_digit, sortable: true, width: "95px", cell: (row) => <span style={{ fontWeight: "700", color: "#4f46e5", fontFamily: "monospace", fontSize: "14px" }}>{row.open_digit ?? "—"}</span> },
        { name: "Open Pana", selector: (row) => row.open_pana, sortable: true, width: "95px", cell: (row) => <span style={{ fontWeight: "700", color: "#4f46e5", fontFamily: "monospace", fontSize: "14px" }}>{row.open_pana ?? "—"}</span> },
        { name: "Points", selector: (row) => parseFloat(row.points || 0), sortable: true, width: "90px", cell: (row) => <span style={{ fontWeight: "700", color: "#059669", fontSize: "13px" }}>₹{parseFloat(row.points || 0).toLocaleString('en-IN')}</span> },
        { name: "Result", selector: (row) => row.winning_amount, sortable: true, width: "100px", cell: (row) => getResultBadge(row.winning_amount, row.is_win || row.winning_amount > 0) },
        { name: "Date", selector: (row) => row.date || row.created_at, sortable: true, width: "110px", cell: (row) => <span style={{ fontSize: "11px", color: "#6b7280" }}>{row.date || formatDate(row.created_at)}</span> },
    ];

    const customStyles = {
        headRow: { style: { backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" } },
        headCells: { style: { fontWeight: "700", fontSize: "12px", color: "#374151", paddingLeft: "10px", paddingRight: "10px" } },
        rows: { style: { fontSize: "13px", minHeight: "52px" }, highlightOnHoverStyle: { backgroundColor: "#f3f4f6" } },
        cells: { style: { paddingLeft: "10px", paddingRight: "10px" } },
        pagination: { style: { borderTop: "1px solid #e5e7eb" } },
    };

    const SkeletonLoader = () => (
        <div style={{ width: "100%", padding: "0 8px" }}>
            {[...Array(8)].map((_, i) => <BiddingSkeleton key={i} />)}
        </div>
    );

    const noDataComponent = (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>🎯</span>
            <p style={{ fontWeight: "600", marginBottom: "4px" }}>No bidding history found</p>
            <p style={{ fontSize: "12px", color: "#9ca3af" }}>{hasActiveFilters ? "Try adjusting your filters" : "Bids will appear here once placed"}</p>
            {hasActiveFilters && (
                <button onClick={clearFilters} style={{ marginTop: "12px", padding: "8px 16px", backgroundColor: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Clear Filters</button>
            )}
        </div>
    );

    if (isError) {
        return (
            <main style={{ padding: "16px" }}>
                <div style={{ color: "#dc2626", padding: "30px", textAlign: "center", backgroundColor: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca" }}>
                    <h3 style={{ marginBottom: "8px" }}>Error loading bidding history</h3>
                    <p style={{ fontSize: "14px" }}>{error?.data?.message || error?.message || "Something went wrong"}</p>
                    <button onClick={() => refetch()} style={{ marginTop: "12px", padding: "10px 20px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Retry</button>
                </div>
            </main>
        );
    }

    return (
        <main style={{ padding: isMobile ? "8px" : "12px" }}>
            <div style={{
                backgroundColor: "#fff", borderRadius: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden",
                padding: isMobile ? "12px" : "0"
            }}>
                {/* Title */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: isMobile ? "0 0 8px 0" : "12px 16px 0",
                    borderBottom: isMobile ? "1px solid #f0f0f0" : "none"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "17px", fontWeight: "700", color: "#111827" }}>Bidding History</span>
                        {totalRows > 0 && (
                            <span style={{ fontSize: "11px", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "3px 8px", borderRadius: "20px" }}>
                                {totalRows} total
                            </span>
                        )}
                    </div>
                    {totalRows > 0 && <span style={{ fontSize: "11px", color: "#9ca3af" }}>Pg {currentPage}/{lastPage}</span>}
                </div>

                {/* Filters */}
                <div style={{ padding: isMobile ? "0" : "0 16px" }}>
                    <FiltersSection />
                </div>

                {/* Table */}
                {isMobile ? (
                    <>
                        {isLoading ? <SkeletonLoader /> : biddingHistory.length === 0 ? noDataComponent : (
                            <>
                                <MobileTable />
                                {/* Mobile Pagination */}
                                <div style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "12px 4px", borderTop: "1px solid #e5e7eb", marginTop: "4px"
                                }}>
                                    <button disabled={filters.page <= 1} onClick={() => handlePageChange(filters.page - 1)}
                                        style={{
                                            padding: "8px 14px", borderRadius: "8px",
                                            backgroundColor: filters.page <= 1 ? "#f3f4f6" : "#4f46e5",
                                            color: filters.page <= 1 ? "#9ca3af" : "#fff",
                                            border: "none", cursor: filters.page <= 1 ? "not-allowed" : "pointer",
                                            fontWeight: "600", fontSize: "13px"
                                        }}>← Prev</button>
                                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Page {currentPage} of {lastPage}</span>
                                    <button disabled={filters.page >= lastPage} onClick={() => handlePageChange(filters.page + 1)}
                                        style={{
                                            padding: "8px 14px", borderRadius: "8px",
                                            backgroundColor: filters.page >= lastPage ? "#f3f4f6" : "#4f46e5",
                                            color: filters.page >= lastPage ? "#9ca3af" : "#fff",
                                            border: "none", cursor: filters.page >= lastPage ? "not-allowed" : "pointer",
                                            fontWeight: "600", fontSize: "13px"
                                        }}>Next →</button>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <DataTable
                        columns={columns} data={biddingHistory}
                        striped highlightOnHover
                        pagination paginationServer
                        paginationTotalRows={totalRows}
                        paginationPerPage={filters.per_page}
                        paginationDefaultPage={currentPage}
                        paginationRowsPerPageOptions={[10, 15, 30, 50, 100]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handlePerRowsChange}
                        progressPending={isLoading}
                        progressComponent={<SkeletonLoader />}
                        responsive customStyles={customStyles}
                        noDataComponent={noDataComponent}
                    />
                )}
            </div>
        </main>
    );
}