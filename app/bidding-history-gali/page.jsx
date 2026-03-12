import { useState, useEffect, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DataTable from "react-data-table-component";
import { useGetBiddingHistoryGaliQuery, useEditGaliBidMutation } from "@/store/backendSlice/apiAPISlice";
import Swal from "sweetalert2";

const BiddingSkeleton = () => (
    <div style={{
        display: "flex", alignItems: "center",
        padding: "12px 16px", gap: "12px",
        borderBottom: "1px solid #f0f0f0", flexWrap: "wrap"
    }}>
        <Skeleton width={40} height={20} />
        <Skeleton width={60} height={20} />
        <Skeleton width={90} height={24} borderRadius={6} />
        <Skeleton width={70} height={24} borderRadius={6} />
        <Skeleton width={50} height={20} />
        <Skeleton width={70} height={20} />
        <Skeleton width={100} height={16} />
    </div>
);

export default function BiddingHistoryGali() {
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

    const { data, isLoading, isError, error, refetch } = useGetBiddingHistoryGaliQuery();
    const [editGaliBid, { isLoading: isEditing }] = useEditGaliBidMutation();

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm] = useState({ open: "", close: "" });

    const openEditModal = (row) => {
        setEditTarget(row);
        setEditForm({
            open: row.open || row.pana || "",
            close: row.close || row.digit || ""
        });
        setEditModalOpen(true);
    };

    const handleEditBid = async (e) => {
        e.preventDefault();
        try {
            await editGaliBid({
                id: editTarget.id,
                pana: editForm.open,
                digit: editForm.close
            }).unwrap();
            Swal.fire('Success', 'Bid updated successfully', 'success');
            setEditModalOpen(false);
            setEditTarget(null);
            refetch();
        } catch (err) {
            Swal.fire('Error', err?.data?.message || err?.message || 'Failed to update bid', 'error');
        }
    };

    const allBiddings = data?.biddings || data?.data || (Array.isArray(data) ? data : []);

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

    const filteredBiddings = useMemo(() => {
        return dateFiltered.filter(b => {
            const matchType = gameTypeFilter ? b.game_type?.toLowerCase() === gameTypeFilter.toLowerCase() : true;
            const matchSearch = searchText
                ? b.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                String(b.open ?? "").includes(searchText) ||
                String(b.close ?? "").includes(searchText)
                : true;
            return matchType && matchSearch;
        });
    }, [dateFiltered, gameTypeFilter, searchText]);

    const gameTypeOptions = useMemo(() => {
        const types = allBiddings.map(b => b.game_type).filter(Boolean);
        return [...new Set(types)];
    }, [allBiddings]);

    const totalPoints = filteredBiddings.reduce((sum, b) => sum + parseFloat(b.points || 0), 0);
    const totalBids = filteredBiddings.length;
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
            "single": { bg: "#dbeafe", color: "#1d4ed8" },
            "jodi": { bg: "#fce7f3", color: "#be185d" },
        };
        const key = type?.toLowerCase().replace(/_/g, " ");
        const s = map[key] || { bg: "#fff7ed", color: "#ea580c" };
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

    const FiltersSection = () => (
        <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "8px", width: "100%", margin: "10px 0"
        }}>
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

            <div style={{ gridColumn: isMobile ? "1 / -1" : "auto" }}>
                <label style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Search</label>
                <input
                    type="text"
                    placeholder="Search game, open, close..."
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
                    style={{ ...inputStyle, marginTop: "3px" }}
                />
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
                    padding: "8px 12px", backgroundColor: "#ea580c", color: "#fff",
                    border: "none", borderRadius: "8px", cursor: "pointer",
                    fontSize: "13px", fontWeight: "600", flex: 1, minHeight: "38px"
                }}>🔄 Refresh</button>
            </div>
        </div>
    );

    const StatsRow = () => (
        <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "10px", margin: "10px 0"
        }}>
            <div style={{ backgroundColor: "#fff7ed", padding: "12px 16px", borderRadius: "10px", borderLeft: "4px solid #ea580c" }}>
                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Total Bids</p>
                <p style={{ fontSize: "22px", fontWeight: "700", color: "#1f2937", margin: "4px 0 0" }}>{totalBids}</p>
            </div>
            <div style={{ backgroundColor: "#fefce8", padding: "12px 16px", borderRadius: "10px", borderLeft: "4px solid #f59e0b" }}>
                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Total Points</p>
                <p style={{ fontSize: "22px", fontWeight: "700", color: "#f59e0b", margin: "4px 0 0" }}>₹{totalPoints.toLocaleString('en-IN')}</p>
            </div>
        </div>
    );

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
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "550px" }}>
                    <thead>
                        <tr>
                            <th style={th}>#</th>
                            <th style={th}>Game</th>
                            <th style={th}>Type</th>
                            <th style={th}>Open</th>
                            <th style={th}>Close</th>
                            <th style={th}>Points</th>
                            <th style={th}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((row, index) => (
                            <tr key={row.id || index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb" }}>
                                <td style={td({ color: "#9ca3af", fontWeight: "600" })}>
                                    {((currentPage - 1) * perPage) + index + 1}
                                </td>
                                <td style={td({ fontWeight: "700", color: "#111827" })}>{row.name || "N/A"}</td>
                                <td style={td()}>{getGameTypeBadge(row.game_type)}</td>
                                <td style={td({ fontWeight: "700", color: "#ea580c", fontFamily: "monospace", fontSize: "13px" })}>{row.open ?? "—"}</td>
                                <td style={td({ fontWeight: "700", color: "#f59e0b", fontFamily: "monospace", fontSize: "13px" })}>{row.close ?? "—"}</td>
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
            cell: (row) => <span style={{ fontWeight: "600", color: "#ea580c" }}>#{row.id}</span>
        },
        {
            name: "Game Name",
            selector: (row) => row.name,
            sortable: true,
            width: "130px",
            cell: (row) => <span style={{ fontWeight: "700", color: "#111827", fontSize: "13px" }}>{row.name || "N/A"}</span>
        },
        {
            name: "Type",
            selector: (row) => row.game_type,
            sortable: true,
            width: "140px",
            cell: (row) => getGameTypeBadge(row.game_type)
        },
        {
            name: "Open",
            selector: (row) => row.open,
            sortable: true,
            width: "90px",
            cell: (row) => <span style={{ fontWeight: "700", color: "#ea580c", fontFamily: "monospace", fontSize: "15px" }}>{row.open ?? "—"}</span>
        },
        {
            name: "Close",
            selector: (row) => row.close,
            sortable: true,
            width: "90px",
            cell: (row) => <span style={{ fontWeight: "700", color: "#f59e0b", fontFamily: "monospace", fontSize: "15px" }}>{row.close ?? "—"}</span>
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
                <button onClick={() => openEditModal(row)} style={{ padding: "6px 12px", fontSize: "11px", backgroundColor: "#ffedd5", border: "1px solid #fdba74", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#c2410c", transition: "all 0.2s" }} onMouseOver={(e) => { e.target.style.backgroundColor = "#fdba74" }} onMouseOut={(e) => { e.target.style.backgroundColor = "#ffedd5" }}>Edit</button>
            )
        },
    ];

    const customStyles = {
        headRow: { style: { backgroundColor: "#fff7ed", borderBottom: "2px solid #fed7aa" } },
        headCells: { style: { fontWeight: "700", fontSize: "12px", color: "#374151", paddingLeft: "10px", paddingRight: "10px" } },
        rows: { style: { fontSize: "13px", minHeight: "52px" }, highlightOnHoverStyle: { backgroundColor: "#fff7ed" } },
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
            <p style={{ fontWeight: "600", marginBottom: "4px" }}>No Gali Desavar bids found</p>
            <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                {hasActiveFilters ? "Try adjusting your filters" : "Gali Desavar bids will appear here once placed"}
            </p>
            {hasActiveFilters && (
                <button onClick={clearFilters} style={{
                    marginTop: "12px", padding: "8px 16px", backgroundColor: "#ea580c",
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
                    <h3 style={{ marginBottom: "8px" }}>Error loading Gali Desavar bid history</h3>
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
                            🎯 Gali Desavar Bid History
                        </span>
                        {totalRows > 0 && (
                            <span style={{
                                fontSize: "11px", color: "#6b7280",
                                backgroundColor: "#fff7ed", padding: "3px 8px", borderRadius: "20px"
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
                                <div style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "12px 4px", borderTop: "1px solid #e5e7eb", marginTop: "4px"
                                }}>
                                    <button
                                        disabled={currentPage <= 1}
                                        onClick={() => setPage(p => p - 1)}
                                        style={{
                                            padding: "8px 14px", borderRadius: "8px",
                                            backgroundColor: currentPage <= 1 ? "#f3f4f6" : "#ea580c",
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
                                            backgroundColor: currentPage >= lastPage ? "#f3f4f6" : "#ea580c",
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
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid #fed7aa", backgroundColor: "#fff7ed", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#c2410c" }}>🎯 Edit Gali Desavar Bid</h3>
                            <button onClick={() => setEditModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", color: "#c2410c" }}>×</button>
                        </div>
                        <form onSubmit={handleEditBid} style={{ padding: "24px" }}>
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Open Digit</label>
                                <input type="number" value={editForm.open} onChange={(e) => setEditForm({ ...editForm, open: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                            </div>
                            <div style={{ marginBottom: "24px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Close Digit</label>
                                <input type="number" value={editForm.close} onChange={(e) => setEditForm({ ...editForm, close: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                            </div>
                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                                <button type="button" onClick={() => setEditModalOpen(false)} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#374151", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
                                <button type="submit" disabled={isEditing} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#ea580c", color: "#fff", fontWeight: "600", cursor: isEditing ? "not-allowed" : "pointer", fontSize: "14px", opacity: isEditing ? 0.7 : 1 }}>
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
