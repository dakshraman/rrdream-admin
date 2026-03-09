import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DataTable from "react-data-table-component";
import { useGetBiddingHistoryGaliQuery, useEditGaliBidMutation } from "@/store/backendSlice/apiAPISlice";
import Swal from "sweetalert2";
const BiddingSkeleton = () => (_jsxs("div", { style: {
        display: "flex", alignItems: "center",
        padding: "12px 16px", gap: "12px",
        borderBottom: "1px solid #f0f0f0", flexWrap: "wrap"
    }, children: [_jsx(Skeleton, { width: 40, height: 20 }), _jsx(Skeleton, { width: 60, height: 20 }), _jsx(Skeleton, { width: 90, height: 24, borderRadius: 6 }), _jsx(Skeleton, { width: 70, height: 24, borderRadius: 6 }), _jsx(Skeleton, { width: 50, height: 20 }), _jsx(Skeleton, { width: 70, height: 20 }), _jsx(Skeleton, { width: 100, height: 16 })] }));
export default function BiddingHistoryGali() {
    var _a;
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
        var _a;
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
        }
        catch (err) {
            Swal.fire('Error', ((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update bid', 'error');
        }
    };
    const allBiddings = (data === null || data === void 0 ? void 0 : data.biddings) || (data === null || data === void 0 ? void 0 : data.data) || (Array.isArray(data) ? data : []);
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
            var _a, _b, _c, _d;
            const matchType = gameTypeFilter ? ((_a = b.game_type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === gameTypeFilter.toLowerCase() : true;
            const matchSearch = searchText
                ? ((_b = b.name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchText.toLowerCase())) ||
                    String((_c = b.open) !== null && _c !== void 0 ? _c : "").includes(searchText) ||
                    String((_d = b.close) !== null && _d !== void 0 ? _d : "").includes(searchText)
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
        if (!dateString)
            return "N/A";
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
        const key = type === null || type === void 0 ? void 0 : type.toLowerCase().replace(/_/g, " ");
        const s = map[key] || { bg: "#fff7ed", color: "#ea580c" };
        return (_jsx("span", { style: {
                backgroundColor: s.bg, color: s.color,
                padding: "3px 8px", borderRadius: "5px",
                fontSize: "10px", fontWeight: "700",
                textTransform: "uppercase", whiteSpace: "nowrap"
            }, children: type || "N/A" }));
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
    const FiltersSection = () => (_jsxs("div", { style: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "8px", width: "100%", margin: "10px 0"
        }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }, children: "Period" }), _jsxs("select", { value: activeFilter, onChange: (e) => { setActiveFilter(e.target.value); setPage(1); }, style: Object.assign(Object.assign({}, inputStyle), { marginTop: "3px", cursor: "pointer" }), children: [_jsx("option", { value: "all", children: "All Time" }), _jsx("option", { value: "today", children: "Today" }), _jsx("option", { value: "week", children: "This Week" }), _jsx("option", { value: "month", children: "This Month" })] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }, children: "Game Type" }), _jsxs("select", { value: gameTypeFilter, onChange: (e) => { setGameTypeFilter(e.target.value); setPage(1); }, style: Object.assign(Object.assign({}, inputStyle), { marginTop: "3px", cursor: "pointer" }), children: [_jsx("option", { value: "", children: "All Types" }), gameTypeOptions.map((t, i) => (_jsx("option", { value: t, children: t }, i)))] })] }), _jsxs("div", { style: { gridColumn: isMobile ? "1 / -1" : "auto" }, children: [_jsx("label", { style: { fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }, children: "Search" }), _jsx("input", { type: "text", placeholder: "Search game, open, close...", value: searchText, onChange: (e) => { setSearchText(e.target.value); setPage(1); }, style: Object.assign(Object.assign({}, inputStyle), { marginTop: "3px" }) })] }), _jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "flex-end", gridColumn: isMobile ? "1 / -1" : "auto", paddingTop: "16px" }, children: [hasActiveFilters && (_jsx("button", { onClick: clearFilters, style: {
                            padding: "8px 12px", backgroundColor: "#ef4444", color: "#fff",
                            border: "none", borderRadius: "8px", cursor: "pointer",
                            fontSize: "13px", fontWeight: "600", flex: 1, minHeight: "38px"
                        }, children: "\u2715 Clear" })), _jsx("button", { onClick: refetch, style: {
                            padding: "8px 12px", backgroundColor: "#ea580c", color: "#fff",
                            border: "none", borderRadius: "8px", cursor: "pointer",
                            fontSize: "13px", fontWeight: "600", flex: 1, minHeight: "38px"
                        }, children: "\uD83D\uDD04 Refresh" })] })] }));
    const StatsRow = () => (_jsxs("div", { style: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "10px", margin: "10px 0"
        }, children: [_jsxs("div", { style: { backgroundColor: "#fff7ed", padding: "12px 16px", borderRadius: "10px", borderLeft: "4px solid #ea580c" }, children: [_jsx("p", { style: { fontSize: "11px", color: "#6b7280", margin: 0 }, children: "Total Bids" }), _jsx("p", { style: { fontSize: "22px", fontWeight: "700", color: "#1f2937", margin: "4px 0 0" }, children: totalBids })] }), _jsxs("div", { style: { backgroundColor: "#fefce8", padding: "12px 16px", borderRadius: "10px", borderLeft: "4px solid #f59e0b" }, children: [_jsx("p", { style: { fontSize: "11px", color: "#6b7280", margin: 0 }, children: "Total Points" }), _jsxs("p", { style: { fontSize: "22px", fontWeight: "700", color: "#f59e0b", margin: "4px 0 0" }, children: ["\u20B9", totalPoints.toLocaleString('en-IN')] })] })] }));
    const MobileTable = () => {
        const th = {
            padding: "9px 8px", fontSize: "10px", fontWeight: "700", color: "#6b7280",
            backgroundColor: "#f9fafb", textTransform: "uppercase", letterSpacing: "0.4px",
            whiteSpace: "nowrap", borderBottom: "2px solid #e5e7eb", textAlign: "left"
        };
        const td = (extra = {}) => (Object.assign({ padding: "9px 8px", fontSize: "11px", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap", verticalAlign: "middle" }, extra));
        return (_jsx("div", { style: { overflowX: "auto", WebkitOverflowScrolling: "touch" }, children: _jsxs("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: "550px" }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "#" }), _jsx("th", { style: th, children: "Game" }), _jsx("th", { style: th, children: "Type" }), _jsx("th", { style: th, children: "Open" }), _jsx("th", { style: th, children: "Close" }), _jsx("th", { style: th, children: "Points" }), _jsx("th", { style: th, children: "Date" })] }) }), _jsx("tbody", { children: paginated.map((row, index) => {
                            var _a, _b;
                            return (_jsxs("tr", { style: { backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb" }, children: [_jsx("td", { style: td({ color: "#9ca3af", fontWeight: "600" }), children: ((currentPage - 1) * perPage) + index + 1 }), _jsx("td", { style: td({ fontWeight: "700", color: "#111827" }), children: row.name || "N/A" }), _jsx("td", { style: td(), children: getGameTypeBadge(row.game_type) }), _jsx("td", { style: td({ fontWeight: "700", color: "#ea580c", fontFamily: "monospace", fontSize: "13px" }), children: (_a = row.open) !== null && _a !== void 0 ? _a : "—" }), _jsx("td", { style: td({ fontWeight: "700", color: "#f59e0b", fontFamily: "monospace", fontSize: "13px" }), children: (_b = row.close) !== null && _b !== void 0 ? _b : "—" }), _jsxs("td", { style: td({ fontWeight: "700", color: "#059669" }), children: ["\u20B9", parseFloat(row.points || 0).toLocaleString('en-IN')] }), _jsx("td", { style: td({ color: "#6b7280" }), children: formatDate(row.created_at) }), _jsx("td", { style: td(), children: _jsx("button", { onClick: () => openEditModal(row), style: { padding: "4px 8px", fontSize: "11px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontWeight: "600", color: "#374151" }, children: "Edit" }) })] }, row.id || index));
                        }) })] }) }));
    };
    const columns = [
        {
            name: "S.No",
            selector: (row, i) => ((currentPage - 1) * perPage) + i + 1,
            width: "65px",
            cell: (row, i) => _jsx("span", { style: { color: "#9ca3af", fontWeight: "600" }, children: ((currentPage - 1) * perPage) + i + 1 })
        },
        {
            name: "ID",
            selector: (row) => row.id,
            width: "75px",
            cell: (row) => _jsxs("span", { style: { fontWeight: "600", color: "#ea580c" }, children: ["#", row.id] })
        },
        {
            name: "Game Name",
            selector: (row) => row.name,
            sortable: true,
            width: "130px",
            cell: (row) => _jsx("span", { style: { fontWeight: "700", color: "#111827", fontSize: "13px" }, children: row.name || "N/A" })
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
            cell: (row) => { var _a; return _jsx("span", { style: { fontWeight: "700", color: "#ea580c", fontFamily: "monospace", fontSize: "15px" }, children: (_a = row.open) !== null && _a !== void 0 ? _a : "—" }); }
        },
        {
            name: "Close",
            selector: (row) => row.close,
            sortable: true,
            width: "90px",
            cell: (row) => { var _a; return _jsx("span", { style: { fontWeight: "700", color: "#f59e0b", fontFamily: "monospace", fontSize: "15px" }, children: (_a = row.close) !== null && _a !== void 0 ? _a : "—" }); }
        },
        {
            name: "Points",
            selector: (row) => parseFloat(row.points || 0),
            sortable: true,
            width: "100px",
            cell: (row) => _jsxs("span", { style: { fontWeight: "700", color: "#059669", fontSize: "14px" }, children: ["\u20B9", parseFloat(row.points || 0).toLocaleString('en-IN')] })
        },
        {
            name: "Date",
            selector: (row) => row.created_at,
            sortable: true,
            width: "160px",
            cell: (row) => _jsx("span", { style: { fontSize: "12px", color: "#6b7280" }, children: formatDate(row.created_at) })
        },
        {
            name: "Action",
            width: "80px",
            cell: (row) => (_jsx("button", { onClick: () => openEditModal(row), style: { padding: "6px 12px", fontSize: "11px", backgroundColor: "#ffedd5", border: "1px solid #fdba74", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#c2410c", transition: "all 0.2s" }, onMouseOver: (e) => { e.target.style.backgroundColor = "#fdba74"; }, onMouseOut: (e) => { e.target.style.backgroundColor = "#ffedd5"; }, children: "Edit" }))
        },
    ];
    const customStyles = {
        headRow: { style: { backgroundColor: "#fff7ed", borderBottom: "2px solid #fed7aa" } },
        headCells: { style: { fontWeight: "700", fontSize: "12px", color: "#374151", paddingLeft: "10px", paddingRight: "10px" } },
        rows: { style: { fontSize: "13px", minHeight: "52px" }, highlightOnHoverStyle: { backgroundColor: "#fff7ed" } },
        cells: { style: { paddingLeft: "10px", paddingRight: "10px" } },
        pagination: { style: { borderTop: "1px solid #e5e7eb" } },
    };
    const SkeletonLoader = () => (_jsx("div", { style: { width: "100%", padding: "0 8px" }, children: [...Array(8)].map((_, i) => _jsx(BiddingSkeleton, {}, i)) }));
    const noDataComponent = (_jsxs("div", { style: { padding: "40px", textAlign: "center", color: "#6b7280" }, children: [_jsx("span", { style: { fontSize: "40px", display: "block", marginBottom: "10px" }, children: "\uD83C\uDFAF" }), _jsx("p", { style: { fontWeight: "600", marginBottom: "4px" }, children: "No Gali Desavar bids found" }), _jsx("p", { style: { fontSize: "12px", color: "#9ca3af" }, children: hasActiveFilters ? "Try adjusting your filters" : "Gali Desavar bids will appear here once placed" }), hasActiveFilters && (_jsx("button", { onClick: clearFilters, style: {
                    marginTop: "12px", padding: "8px 16px", backgroundColor: "#ea580c",
                    color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer"
                }, children: "Clear Filters" }))] }));
    if (isError) {
        return (_jsx("main", { style: { padding: "16px" }, children: _jsxs("div", { style: {
                    color: "#dc2626", padding: "30px", textAlign: "center",
                    backgroundColor: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca"
                }, children: [_jsx("h3", { style: { marginBottom: "8px" }, children: "Error loading Gali Desavar bid history" }), _jsx("p", { style: { fontSize: "14px" }, children: ((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.message) || (error === null || error === void 0 ? void 0 : error.message) || "Something went wrong" }), _jsx("button", { onClick: () => refetch(), style: {
                            marginTop: "12px", padding: "10px 20px", backgroundColor: "#dc2626",
                            color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer"
                        }, children: "Retry" })] }) }));
    }
    return (_jsxs("main", { style: { padding: isMobile ? "8px" : "12px" }, children: [_jsxs("div", { style: {
                    backgroundColor: "#fff", borderRadius: "12px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden",
                    padding: isMobile ? "12px" : "0"
                }, children: [_jsxs("div", { style: {
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: isMobile ? "0 0 8px 0" : "12px 16px 0",
                            borderBottom: isMobile ? "1px solid #f0f0f0" : "none"
                        }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [_jsx("span", { style: { fontSize: "17px", fontWeight: "700", color: "#111827" }, children: "\uD83C\uDFAF Gali Desavar Bid History" }), totalRows > 0 && (_jsxs("span", { style: {
                                            fontSize: "11px", color: "#6b7280",
                                            backgroundColor: "#fff7ed", padding: "3px 8px", borderRadius: "20px"
                                        }, children: [totalRows, " total"] }))] }), totalRows > 0 && (_jsxs("span", { style: { fontSize: "11px", color: "#9ca3af" }, children: ["Pg ", currentPage, "/", lastPage] }))] }), _jsx("div", { style: { padding: isMobile ? "8px 0 0" : "0 16px" }, children: !isLoading && allBiddings.length > 0 && _jsx(StatsRow, {}) }), _jsx("div", { style: { padding: isMobile ? "0" : "0 16px" }, children: _jsx(FiltersSection, {}) }), isMobile ? (_jsx(_Fragment, { children: isLoading ? _jsx(SkeletonLoader, {}) : paginated.length === 0 ? noDataComponent : (_jsxs(_Fragment, { children: [_jsx(MobileTable, {}), _jsxs("div", { style: {
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "12px 4px", borderTop: "1px solid #e5e7eb", marginTop: "4px"
                                    }, children: [_jsx("button", { disabled: currentPage <= 1, onClick: () => setPage(p => p - 1), style: {
                                                padding: "8px 14px", borderRadius: "8px",
                                                backgroundColor: currentPage <= 1 ? "#f3f4f6" : "#ea580c",
                                                color: currentPage <= 1 ? "#9ca3af" : "#fff",
                                                border: "none", cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                                                fontWeight: "600", fontSize: "13px"
                                            }, children: "\u2190 Prev" }), _jsxs("span", { style: { fontSize: "12px", color: "#6b7280" }, children: ["Page ", currentPage, " of ", lastPage] }), _jsx("button", { disabled: currentPage >= lastPage, onClick: () => setPage(p => p + 1), style: {
                                                padding: "8px 14px", borderRadius: "8px",
                                                backgroundColor: currentPage >= lastPage ? "#f3f4f6" : "#ea580c",
                                                color: currentPage >= lastPage ? "#9ca3af" : "#fff",
                                                border: "none", cursor: currentPage >= lastPage ? "not-allowed" : "pointer",
                                                fontWeight: "600", fontSize: "13px"
                                            }, children: "Next \u2192" })] })] })) })) : (_jsx(DataTable, { columns: columns, data: paginated, striped: true, highlightOnHover: true, pagination: true, paginationServer: true, paginationTotalRows: totalRows, paginationPerPage: perPage, paginationDefaultPage: currentPage, paginationRowsPerPageOptions: [10, 15, 30, 50], onChangePage: (p) => setPage(p), progressPending: isLoading, progressComponent: _jsx(SkeletonLoader, {}), responsive: true, customStyles: customStyles, noDataComponent: noDataComponent }))] }), editModalOpen && editTarget && (_jsx("div", { style: {
                    position: "fixed", inset: 0, zIndex: 9999,
                    backgroundColor: "rgba(17, 24, 39, 0.6)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
                }, children: _jsxs("div", { style: {
                        backgroundColor: "#fff", borderRadius: "16px",
                        width: "100%", maxWidth: "400px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }, children: [_jsxs("div", { style: { padding: "20px 24px", borderBottom: "1px solid #fed7aa", backgroundColor: "#fff7ed", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx("h3", { style: { margin: 0, fontSize: "18px", fontWeight: "700", color: "#c2410c" }, children: "\uD83C\uDFAF Edit Gali Desavar Bid" }), _jsx("button", { onClick: () => setEditModalOpen(false), style: { background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", color: "#c2410c" }, children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleEditBid, style: { padding: "24px" }, children: [_jsxs("div", { style: { marginBottom: "16px" }, children: [_jsx("label", { style: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }, children: "Open Digit" }), _jsx("input", { type: "number", value: editForm.open, onChange: (e) => setEditForm(Object.assign(Object.assign({}, editForm), { open: e.target.value })), style: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none", boxSizing: "border-box" } })] }), _jsxs("div", { style: { marginBottom: "24px" }, children: [_jsx("label", { style: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }, children: "Close Digit" }), _jsx("input", { type: "number", value: editForm.close, onChange: (e) => setEditForm(Object.assign(Object.assign({}, editForm), { close: e.target.value })), style: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none", boxSizing: "border-box" } })] }), _jsxs("div", { style: { display: "flex", gap: "12px", justifyContent: "flex-end" }, children: [_jsx("button", { type: "button", onClick: () => setEditModalOpen(false), style: { padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#374151", fontWeight: "600", cursor: "pointer", fontSize: "14px" }, children: "Cancel" }), _jsx("button", { type: "submit", disabled: isEditing, style: { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#ea580c", color: "#fff", fontWeight: "600", cursor: isEditing ? "not-allowed" : "pointer", fontSize: "14px", opacity: isEditing ? 0.7 : 1 }, children: isEditing ? "Saving..." : "Save Changes" })] })] })] }) }))] }));
}
