import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DataTable from "react-data-table-component";
import { useGetBiddingHistoryStarlineQuery, useEditStarlineBidMutation } from "@/store/backendSlice/apiAPISlice";
import Swal from "sweetalert2";

// Latest starline bid response example (2026-03):
// { id, game_name, game_type, digit, pana, points, username, date }

const BiddingSkeleton = () => (
    <div style={{
        display: "flex", alignItems: "center",
        padding: "12px 16px", gap: "12px",
        borderBottom: "1px solid #f0f0f0", flexWrap: "wrap"
    }}>
        <Skeleton width={40} height={20} />
        <Skeleton width={60} height={20} />
        <Skeleton width={90} height={20} />
        <Skeleton width={90} height={24} borderRadius={6} />
        <Skeleton width={70} height={24} borderRadius={6} />
        <Skeleton width={50} height={20} />
        <Skeleton width={70} height={20} />
        <Skeleton width={100} height={16} />
    </div>
);

export default function BiddingHistoryStarline() {
    const token = useSelector((state) => state.auth?.token);

    const [activeFilter, setActiveFilter] = useState('all');
    const [gameTypeFilter, setGameTypeFilter] = useState('');
    const [searchText, setSearchText] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [page, setPage] = useState(1);
    const perPage = 10;

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const { data, isLoading, isError, error, refetch } = useGetBiddingHistoryStarlineQuery(undefined, {
        skip: !token
    });
    const [editStarlineBid, { isLoading: isEditing }] = useEditStarlineBidMutation();

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm] = useState({ pana: "", digit: "" });

    const openEditModal = (row) => {
        setEditTarget(row);
        setEditForm({
            pana: row.pana || "",
            digit: row.digit || ""
        });
        setEditModalOpen(true);
    };

    const handleEditBid = async (e) => {
        e.preventDefault();
        try {
            await editStarlineBid({
                id: editTarget.id,
                pana: editForm.pana,
                digit: editForm.digit
            }).unwrap();
            Swal.fire('Success', 'Bid updated successfully', 'success');
            setEditModalOpen(false);
            setEditTarget(null);
            refetch();
        } catch (err) {
            Swal.fire('Error', err?.data?.message || err?.message || 'Failed to update bid', 'error');
        }
    };

    const pickBidsArray = (response) => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data?.data)) return response.data.data;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.biddings)) return response.biddings;
        if (Array.isArray(response?.bids)) return response.bids;
        return [];
    };

    const normalizeBid = (bid) => {
        const displayDate = bid?.date || bid?.created_at || bid?.createdAt || bid?.timestamp || null;
        const displayGameName = bid?.game_name || bid?.name || bid?.game || "";
        const displayPana = bid?.pana ?? bid?.open_pana ?? bid?.close_pana ?? null;
        const displayDigit = bid?.digit ?? bid?.open_digit ?? bid?.close_digit ?? null;
        const displayUsername = bid?.username || bid?.user_name || bid?.user || "";
        const displayPoints = bid?.points ?? bid?.point ?? 0;
        const displayGameType = bid?.game_type || bid?.type || "";

        return {
            ...bid,
            game_name: displayGameName,
            game_type: displayGameType,
            pana: displayPana,
            digit: displayDigit,
            username: displayUsername,
            points: displayPoints,
            created_at: displayDate,
        };
    };

    const allBiddings = useMemo(
        () => pickBidsArray(data).map(normalizeBid),
        [data]
    );

    // ── Date filter
    const dateFiltered = useMemo(() => {
        const now = new Date();
        switch (activeFilter) {
            case 'today':
                return allBiddings.filter(b => new Date(b.created_at).toDateString() === now.toDateString());
            case 'week': {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return allBiddings.filter(b => new Date(b.created_at) >= weekAgo);
            }
            case 'month': {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return allBiddings.filter(b => new Date(b.created_at) >= monthAgo);
            }
            default:
                return allBiddings;
        }
    }, [allBiddings, activeFilter]);

    // ── Game type filter + search
    const filteredBiddings = useMemo(() => {
        const lowerSearch = searchText.trim().toLowerCase();

        return dateFiltered.filter(b => {
            const matchType = gameTypeFilter
                ? b.game_type?.toLowerCase() === gameTypeFilter.toLowerCase()
                : true;

            const matchSearch = lowerSearch
                ? (b.game_name?.toLowerCase().includes(lowerSearch) ||
                    b.username?.toLowerCase().includes(lowerSearch) ||
                    String(b.pana ?? "").includes(searchText) ||
                    String(b.digit ?? "").includes(searchText) ||
                    String(b.id ?? "").includes(searchText))
                : true;

            return matchType && matchSearch;
        });
    }, [dateFiltered, gameTypeFilter, searchText]);

    // ── Unique game types for dropdown
    const gameTypeOptions = useMemo(() => {
        const types = allBiddings.map(b => b.game_type).filter(Boolean);
        return [...new Set(types)];
    }, [allBiddings]);

    // ── Stats
    const totalPoints = filteredBiddings.reduce((sum, b) => sum + parseFloat(b.points || 0), 0);
    const totalBids = filteredBiddings.length;

    // ── Client-side pagination
    const totalRows = filteredBiddings.length;
    const lastPage = Math.max(1, Math.ceil(totalRows / perPage));
    const currentPage = Math.min(page, lastPage);
    const paginated = filteredBiddings.slice((currentPage - 1) * perPage, currentPage * perPage);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getGameTypeBadge = (type) => {
        const map = {
            "single pana": { bg: "#d1fae5", color: "#047857" },
            "double pana": { bg: "#fef3c7", color: "#b45309" },
            "triple pana": { bg: "#ede9fe", color: "#6d28d9" },
            "single digit": { bg: "#e0f2fe", color: "#0369a1" },
            "single": { bg: "#dbeafe", color: "#1d4ed8" },
            "jodi": { bg: "#fce7f3", color: "#be185d" },
        };
        const key = type?.toLowerCase().replace(/_/g, " ");
        const s = map[key] || { bg: "#f3f4f6", color: "#374151" };
        return (
            <span style={{
                backgroundColor: s.bg, color: s.color,
                padding: "3px 8px", borderRadius: "5px",
                fontSize: "10px", fontWeight: "700",
                textTransform: "uppercase", whiteSpace: "nowrap"
            }}>{type || "N/A"}</span>
        );
    };

    const clearFilters = () => {
        setActiveFilter('all');
        setGameTypeFilter('');
        setSearchText('');
        setPage(1);
    };

    const hasActiveFilters = activeFilter !== 'all' || gameTypeFilter || searchText;

    const inputStyle = {
        padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #d1d5db",
        fontSize: "13px", outline: "none", backgroundColor: "#fff", color: "#111827",
        width: "100%", boxSizing: "border-box", minHeight: "38px",
    };

    // ── Filters Section ────────────────────────────────────────────────────────
    const FiltersSection = () => (
        <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "8px", width: "100%", margin: "10px 0"
        }}>
            {/* Date range filter */}
            <div>
                <label style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Period</label>
                <select
                    value={activeFilter}
                    onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
                    style={{ ...inputStyle, marginTop: "3px", cursor: "pointer" }}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>

            {/* Game type filter */}
            <div>
                <label style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Game Type</label>
                <select
                    value={gameTypeFilter}
                    onChange={(e) => { setGameTypeFilter(e.target.value); setPage(1); }}
                    style={{ ...inputStyle, marginTop: "3px", cursor: "pointer" }}
                >
                    <option value="">All Types</option>
                    {gameTypeOptions.map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            {/* Search */}
            <div style={{ gridColumn: isMobile ? "1 / -1" : "auto" }}>
                <label style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Search</label>
                <input
                    type="text"
                    placeholder="Search game, user, pana, digit..."
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
                    style={{ ...inputStyle, marginTop: "3px" }}
                />
            </div>

            {/* Action buttons */}
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

    // ── Stats Row ──────────────────────────────────────────────────────────────
    const StatsRow = () => (
        <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "10px", margin: "10px 0"
        }}>
            <div style={{ backgroundColor: "#eff6ff", padding: "12px 16px", borderRadius: "10px", borderLeft: "4px solid #3b82f6" }}>
                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Total Bids</p>
                <p style={{ fontSize: "22px", fontWeight: "700", color: "#1f2937", margin: "4px 0 0" }}>{totalBids}</p>
            </div>
            <div style={{ backgroundColor: "#fefce8", padding: "12px 16px", borderRadius: "10px", borderLeft: "4px solid #f59e0b" }}>
                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Total Points</p>
                <p style={{ fontSize: "22px", fontWeight: "700", color: "#f59e0b", margin: "4px 0 0" }}>₹{totalPoints.toLocaleString('en-IN')}</p>
            </div>
        </div>
    );

    // ── Mobile Table ───────────────────────────────────────────────────────────
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
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                    <thead>
                        <tr>
                            <th style={th}>#</th>
                            <th style={th}>Game</th>
                            <th style={th}>User</th>
                            <th style={th}>Type</th>
                            <th style={th}>Pana</th>
                            <th style={th}>Digit</th>
                            <th style={th}>Points</th>
                            <th style={th}>Date</th>
                            <th style={th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((row, index) => (
                            <tr key={row.id || index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb" }}>
                                <td style={td({ color: "#9ca3af", fontWeight: "600" })}>
                                    {((currentPage - 1) * perPage) + index + 1}
                                </td>
                                <td style={td({ fontWeight: "700", color: "#111827" })}>{row.game_name || "N/A"}</td>
                                <td style={td({ color: "#374151", fontWeight: "600" })}>{row.username || "—"}</td>
                                <td style={td()}>{getGameTypeBadge(row.game_type)}</td>
                                <td style={td({ fontWeight: "700", color: "#4f46e5", fontFamily: "monospace", fontSize: "13px" })}>{row.pana ?? "—"}</td>
                                <td style={td({ fontWeight: "700", color: "#4f46e5", fontFamily: "monospace", fontSize: "13px" })}>{row.digit ?? "—"}</td>
                                <td style={td({ fontWeight: "700", color: "#059669" })}>₹{parseFloat(row.points || 0).toLocaleString('en-IN')}</td>
                                <td style={td({ color: "#6b7280" })}>{formatDate(row.created_at)}</td>
                                <td style={td()}>
                                    <button onClick={() => openEditModal(row)} style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontWeight: "600", color: "#374151" }}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // ── Desktop DataTable columns ──────────────────────────────────────────────
    const columns = [
        {
            name: "S.No",
            selector: (row, i) => ((currentPage - 1) * perPage) + i + 1,
            width: "65px",
            cell: (row, i) => <span style={{ color: "#9ca3af", fontWeight: "600" }}>{((currentPage - 1) * perPage) + i + 1}</span>
        },
        {
            name: "ID",
            selector: (row) => row.id,
            width: "75px",
            cell: (row) => <span style={{ fontWeight: "600", color: "#4f46e5" }}>#{row.id}</span>
        },
        {
            name: "Game Name",
            selector: (row) => row.game_name,
            sortable: true,
            width: "130px",
            cell: (row) => <span style={{ fontWeight: "700", color: "#111827", fontSize: "13px" }}>{row.game_name || "N/A"}</span>
        },
        {
            name: "User",
            selector: (row) => row.username,
            sortable: true,
            width: "150px",
            cell: (row) => <span style={{ fontWeight: "600", color: "#374151" }}>{row.username || "—"}</span>
        },
        {
            name: "Type",
            selector: (row) => row.game_type,
            sortable: true,
            width: "140px",
            cell: (row) => getGameTypeBadge(row.game_type)
        },
        {
            name: "Pana",
            selector: (row) => row.pana,
            sortable: true,
            width: "90px",
            cell: (row) => <span style={{ fontWeight: "700", color: "#4f46e5", fontFamily: "monospace", fontSize: "15px" }}>{row.pana ?? "—"}</span>
        },
        {
            name: "Digit",
            selector: (row) => row.digit,
            sortable: true,
            width: "80px",
            cell: (row) => <span style={{ fontWeight: "700", color: "#f59e0b", fontFamily: "monospace", fontSize: "15px" }}>{row.digit ?? "—"}</span>
        },
        {
            name: "Points",
            selector: (row) => parseFloat(row.points || 0),
            sortable: true,
            width: "100px",
            cell: (row) => <span style={{ fontWeight: "700", color: "#059669", fontSize: "14px" }}>₹{parseFloat(row.points || 0).toLocaleString('en-IN')}</span>
        },
        {
            name: "Date",
            selector: (row) => row.created_at,
            sortable: true,
            width: "160px",
            cell: (row) => <span style={{ fontSize: "12px", color: "#6b7280" }}>{formatDate(row.created_at)}</span>
        },
        {
            name: "Action",
            width: "80px",
            cell: (row) => (
                <button onClick={() => openEditModal(row)} style={{ padding: "6px 12px", fontSize: "11px", backgroundColor: "#fef3c7", border: "1px solid #fde68a", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#b45309", transition: "all 0.2s" }} onMouseOver={(e) => { e.target.style.backgroundColor = "#fde68a" }} onMouseOut={(e) => { e.target.style.backgroundColor = "#fef3c7" }}>Edit</button>
            )
        },
    ];

    const customStyles = {
        headRow: { style: { backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" } },
        headCells: { style: { fontWeight: "700", fontSize: "12px", color: "#374151", paddingLeft: "10px", paddingRight: "10px" } },
        rows: { style: { fontSize: "13px", minHeight: "52px" }, highlightOnHoverStyle: { backgroundColor: "#fefce8" } },
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
            <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>⭐</span>
            <p style={{ fontWeight: "600", marginBottom: "4px" }}>No starline bids found</p>
            <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                {hasActiveFilters ? "Try adjusting your filters" : "Starline bids will appear here once placed"}
            </p>
            {hasActiveFilters && (
                <button onClick={clearFilters} style={{
                    marginTop: "12px", padding: "8px 16px", backgroundColor: "#4f46e5",
                    color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer"
                }}>Clear Filters</button>
            )}
        </div>
    );

    if (isError) {
        return (
            <main style={{ padding: "16px" }}>
                <div style={{
                    color: "#dc2626", padding: "30px", textAlign: "center",
                    backgroundColor: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca"
                }}>
                    <h3 style={{ marginBottom: "8px" }}>Error loading starline bid history</h3>
                    <p style={{ fontSize: "14px" }}>{error?.data?.message || error?.message || "Something went wrong"}</p>
                    <button onClick={() => refetch()} style={{
                        marginTop: "12px", padding: "10px 20px", backgroundColor: "#dc2626",
                        color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer"
                    }}>Retry</button>
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
                        <span style={{ fontSize: "17px", fontWeight: "700", color: "#111827" }}>
                            ⭐ Starline Bid History
                        </span>
                        {totalRows > 0 && (
                            <span style={{
                                fontSize: "11px", color: "#6b7280",
                                backgroundColor: "#fef3c7", padding: "3px 8px", borderRadius: "20px"
                            }}>
                                {totalRows} total
                            </span>
                        )}
                    </div>
                    {totalRows > 0 && (
                        <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                            Pg {currentPage}/{lastPage}
                        </span>
                    )}
                </div>

                {/* Stats */}
                <div style={{ padding: isMobile ? "8px 0 0" : "0 16px" }}>
                    {!isLoading && allBiddings.length > 0 && <StatsRow />}
                </div>

                {/* Filters */}
                <div style={{ padding: isMobile ? "0" : "0 16px" }}>
                    <FiltersSection />
                </div>

                {/* Table */}
                {isMobile ? (
                    <>
                        {isLoading ? <SkeletonLoader /> : paginated.length === 0 ? noDataComponent : (
                            <>
                                <MobileTable />
                                {/* Mobile Pagination */}
                                <div style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "12px 4px", borderTop: "1px solid #e5e7eb", marginTop: "4px"
                                }}>
                                    <button
                                        disabled={currentPage <= 1}
                                        onClick={() => setPage(p => p - 1)}
                                        style={{
                                            padding: "8px 14px", borderRadius: "8px",
                                            backgroundColor: currentPage <= 1 ? "#f3f4f6" : "#4f46e5",
                                            color: currentPage <= 1 ? "#9ca3af" : "#fff",
                                            border: "none", cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                                            fontWeight: "600", fontSize: "13px"
                                        }}
                                    >← Prev</button>
                                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                                        Page {currentPage} of {lastPage}
                                    </span>
                                    <button
                                        disabled={currentPage >= lastPage}
                                        onClick={() => setPage(p => p + 1)}
                                        style={{
                                            padding: "8px 14px", borderRadius: "8px",
                                            backgroundColor: currentPage >= lastPage ? "#f3f4f6" : "#4f46e5",
                                            color: currentPage >= lastPage ? "#9ca3af" : "#fff",
                                            border: "none", cursor: currentPage >= lastPage ? "not-allowed" : "pointer",
                                            fontWeight: "600", fontSize: "13px"
                                        }}
                                    >Next →</button>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <DataTable
                        columns={columns}
                        data={paginated}
                        striped
                        highlightOnHover
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        paginationPerPage={perPage}
                        paginationDefaultPage={currentPage}
                        paginationRowsPerPageOptions={[10, 15, 30, 50]}
                        onChangePage={(p) => setPage(p)}
                        progressPending={isLoading}
                        progressComponent={<SkeletonLoader />}
                        responsive
                        customStyles={customStyles}
                        noDataComponent={noDataComponent}
                    />
                )}
            </div>

            {/* Edit Modal */}
            {editModalOpen && editTarget && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    backgroundColor: "rgba(17, 24, 39, 0.6)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
                }}>
                    <div style={{
                        backgroundColor: "#fff", borderRadius: "16px",
                        width: "100%", maxWidth: "400px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid #fcfhbd", backgroundColor: "#fffbeb", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#b45309" }}>⭐ Edit Starline Bid</h3>
                            <button onClick={() => setEditModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", color: "#b45309" }}>×</button>
                        </div>
                        <form onSubmit={handleEditBid} style={{ padding: "24px" }}>
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Pana</label>
                                <input type="number" value={editForm.pana} onChange={(e) => setEditForm({ ...editForm, pana: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                            </div>
                            <div style={{ marginBottom: "24px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Digit</label>
                                <input type="number" value={editForm.digit} onChange={(e) => setEditForm({ ...editForm, digit: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                            </div>
                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                                <button type="button" onClick={() => setEditModalOpen(false)} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#374151", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
                                <button type="submit" disabled={isEditing} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#d97706", color: "#fff", fontWeight: "600", cursor: isEditing ? "not-allowed" : "pointer", fontSize: "14px", opacity: isEditing ? 0.7 : 1 }}>
                                    {isEditing ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

