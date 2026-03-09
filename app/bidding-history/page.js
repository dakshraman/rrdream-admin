import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DataTable from "react-data-table-component";
import { useGetBiddingHistoryQuery, useEditBidMutation } from "@/store/backendSlice/apiAPISlice";
import Swal from "sweetalert2";
const BiddingSkeleton = () => (_jsxs("div", { style: {
        display: "flex", alignItems: "center",
        padding: "12px 16px", gap: "12px",
        borderBottom: "1px solid #f0f0f0", flexWrap: "wrap"
    }, children: [_jsx(Skeleton, { width: 40, height: 20 }), _jsx(Skeleton, { width: 60, height: 20 }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [_jsx(Skeleton, { circle: true, width: 36, height: 36 }), _jsx(Skeleton, { width: 100, height: 16 })] }), _jsx(Skeleton, { width: 90, height: 24, borderRadius: 6 }), _jsx(Skeleton, { width: 70, height: 24, borderRadius: 6 }), _jsx(Skeleton, { width: 50, height: 20 }), _jsx(Skeleton, { width: 70, height: 20 })] }));
export default function BiddingHistory() {
    var _a;
    const today = new Date().toISOString().split('T')[0];
    const [filters, setFilters] = useState({
        page: 1, date: today, game_name: "", game_type: "",
        session: "", search: "", per_page: 100
    });
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm] = useState({ pana: "", digit: "" });
    const [editBid, { isLoading: isEditing }] = useEditBidMutation();
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => (Object.assign(Object.assign({}, prev), { search: debouncedSearch, page: 1 })));
        }, 500);
        return () => clearTimeout(timer);
    }, [debouncedSearch]);
    const normalizeOptionKey = (value) => String(value !== null && value !== void 0 ? value : "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
    const formatOptionLabel = (value) => String(value !== null && value !== void 0 ? value : "")
        .trim()
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    const getUniqueOptions = (rows, field) => {
        const seen = new Set();
        const options = [];
        for (const row of rows) {
            const rawValue = row === null || row === void 0 ? void 0 : row[field];
            const trimmed = String(rawValue !== null && rawValue !== void 0 ? rawValue : "").trim();
            if (!trimmed)
                continue;
            const key = normalizeOptionKey(trimmed);
            if (seen.has(key))
                continue;
            seen.add(key);
            options.push(trimmed);
        }
        return options.sort((a, b) => a.localeCompare(b));
    };
    const matchesOptionFilter = (rowValue, selectedValue) => {
        if (!selectedValue)
            return true;
        return normalizeOptionKey(rowValue) === normalizeOptionKey(selectedValue);
    };
    // ── QUERY 1: Fetch option source rows for the selected date ──
    const { data: filterOptionsResponse } = useGetBiddingHistoryQuery({
        page: 1,
        per_page: 1000,
        date: filters.date,
        game_name: "",
        game_type: "",
        session: "",
        search: "",
    }, { refetchOnMountOrArgChange: true });
    const dateScopedFilterRows = useMemo(() => {
        const rows = filterOptionsResponse === null || filterOptionsResponse === void 0 ? void 0 : filterOptionsResponse.data;
        return Array.isArray(rows) ? rows : [];
    }, [filterOptionsResponse]);
    // ── QUERY 2: Filtered table data ──
    const { data: responseData, isLoading, isError, error, refetch } = useGetBiddingHistoryQuery(filters, {
        refetchOnMountOrArgChange: true,
    });
    const biddingHistory = (responseData === null || responseData === void 0 ? void 0 : responseData.data) || [];
    const filterSourceRows = useMemo(() => {
        if (dateScopedFilterRows.length > 0)
            return dateScopedFilterRows;
        return Array.isArray(biddingHistory) ? biddingHistory : [];
    }, [dateScopedFilterRows, biddingHistory]);
    const gameNameSourceRows = useMemo(() => filterSourceRows.filter((row) => matchesOptionFilter(row === null || row === void 0 ? void 0 : row.game_type, filters.game_type) &&
        matchesOptionFilter(row === null || row === void 0 ? void 0 : row.session, filters.session)), [filterSourceRows, filters.game_type, filters.session]);
    const gameTypeSourceRows = useMemo(() => filterSourceRows.filter((row) => matchesOptionFilter(row === null || row === void 0 ? void 0 : row.game_name, filters.game_name) &&
        matchesOptionFilter(row === null || row === void 0 ? void 0 : row.session, filters.session)), [filterSourceRows, filters.game_name, filters.session]);
    const sessionSourceRows = useMemo(() => filterSourceRows.filter((row) => matchesOptionFilter(row === null || row === void 0 ? void 0 : row.game_name, filters.game_name) &&
        matchesOptionFilter(row === null || row === void 0 ? void 0 : row.game_type, filters.game_type)), [filterSourceRows, filters.game_name, filters.game_type]);
    const gameNameOptions = useMemo(() => getUniqueOptions(gameNameSourceRows, "game_name"), [gameNameSourceRows]);
    const gameTypeOptions = useMemo(() => getUniqueOptions(gameTypeSourceRows, "game_type"), [gameTypeSourceRows]);
    const sessionOptions = useMemo(() => getUniqueOptions(sessionSourceRows, "session"), [sessionSourceRows]);
    useEffect(() => {
        setFilters((prev) => {
            const next = Object.assign({}, prev);
            let changed = false;
            if (prev.game_name && !gameNameOptions.some((option) => normalizeOptionKey(option) === normalizeOptionKey(prev.game_name))) {
                next.game_name = "";
                changed = true;
            }
            if (prev.game_type && !gameTypeOptions.some((option) => normalizeOptionKey(option) === normalizeOptionKey(prev.game_type))) {
                next.game_type = "";
                changed = true;
            }
            if (prev.session && !sessionOptions.some((option) => normalizeOptionKey(option) === normalizeOptionKey(prev.session))) {
                next.session = "";
                changed = true;
            }
            if (!changed)
                return prev;
            next.page = 1;
            return next;
        });
    }, [gameNameOptions, gameTypeOptions, sessionOptions]);
    const pagination = (responseData === null || responseData === void 0 ? void 0 : responseData.pagination) || {};
    const totalRows = pagination.total || 0;
    const currentPage = pagination.current_page || 1;
    const lastPage = pagination.last_page || 1;
    const formatDate = (dateString) => {
        if (!dateString)
            return "N/A";
        return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const normalizeSessionKey = (value) => String(value !== null && value !== void 0 ? value : "")
        .trim()
        .toLowerCase();
    const hasBidValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";
    const getBidDisplayValues = (row) => {
        const sessionKey = normalizeSessionKey(row === null || row === void 0 ? void 0 : row.session);
        const isCloseSession = sessionKey === "close";
        const digit = isCloseSession
            ? (hasBidValue(row === null || row === void 0 ? void 0 : row.close_digit) ? row.close_digit : row === null || row === void 0 ? void 0 : row.digit)
            : (hasBidValue(row === null || row === void 0 ? void 0 : row.open_digit) ? row.open_digit : row === null || row === void 0 ? void 0 : row.digit);
        const pana = isCloseSession
            ? (hasBidValue(row === null || row === void 0 ? void 0 : row.close_pana) ? row.close_pana : row === null || row === void 0 ? void 0 : row.pana)
            : (hasBidValue(row === null || row === void 0 ? void 0 : row.open_pana) ? row.open_pana : row === null || row === void 0 ? void 0 : row.pana);
        return {
            digit: hasBidValue(digit) ? digit : "—",
            pana: hasBidValue(pana) ? pana : "—",
        };
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
        const key = type === null || type === void 0 ? void 0 : type.toLowerCase().replace(/_/g, " ");
        const s = map[key] || { bg: "#f3f4f6", color: "#374151" };
        return (_jsx("span", { style: {
                backgroundColor: s.bg, color: s.color, padding: "3px 7px",
                borderRadius: "5px", fontSize: "10px", fontWeight: "700",
                textTransform: "capitalize", whiteSpace: "nowrap"
            }, children: (type === null || type === void 0 ? void 0 : type.replace(/_/g, " ")) || "N/A" }));
    };
    const getSessionBadge = (session) => {
        const isOpen = (session === null || session === void 0 ? void 0 : session.toLowerCase()) === "open";
        return (_jsx("span", { style: {
                backgroundColor: isOpen ? "#dcfce7" : "#fee2e2",
                color: isOpen ? "#166534" : "#991b1b",
                padding: "3px 7px", borderRadius: "5px",
                fontSize: "10px", fontWeight: "700", textTransform: "capitalize", whiteSpace: "nowrap"
            }, children: session || "N/A" }));
    };
    const getResultBadge = (winning_amount, isWin) => {
        if (winning_amount === null || winning_amount === undefined)
            return _jsx("span", { style: { color: "#9ca3af", fontSize: "10px" }, children: "Pending" });
        return (_jsx("span", { style: {
                backgroundColor: isWin ? "#dcfce7" : "#fee2e2",
                color: isWin ? "#166534" : "#991b1b",
                padding: "3px 7px", borderRadius: "5px",
                fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap"
            }, children: isWin ? `Won ₹${winning_amount}` : "Lost" }));
    };
    const handleFilterChange = (key, value) => setFilters(prev => (Object.assign(Object.assign({}, prev), { [key]: value, page: 1 })));
    const handlePageChange = (page) => setFilters(prev => (Object.assign(Object.assign({}, prev), { page })));
    const handlePerRowsChange = (newPerPage) => setFilters(prev => (Object.assign(Object.assign({}, prev), { per_page: newPerPage, page: 1 })));
    const clearFilters = () => {
        setFilters({ page: 1, date: today, game_name: "", game_type: "", session: "", search: "", per_page: 100 });
        setDebouncedSearch("");
    };
    const hasActiveFilters = filters.game_name || filters.game_type || filters.session || filters.search || filters.date !== today;
    const openEditModal = (row) => {
        const bidValues = getBidDisplayValues(row);
        setEditTarget(row);
        setEditForm({
            pana: bidValues.pana === "—" ? "" : String(bidValues.pana),
            digit: bidValues.digit === "—" ? "" : String(bidValues.digit)
        });
        setEditModalOpen(true);
    };
    const handleEditBid = async (e) => {
        var _a;
        e.preventDefault();
        try {
            await editBid({
                id: editTarget.id,
                pana: editForm.pana,
                digit: editForm.digit
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
    const inputStyle = {
        padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #d1d5db",
        fontSize: "13px", outline: "none", backgroundColor: "#fff", color: "#111827",
        width: "100%", boxSizing: "border-box", minHeight: "38px",
    };
    const FiltersSection = () => (_jsxs("div", { style: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "8px", width: "100%", margin: "10px 0"
        }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }, children: "Date" }), _jsx("input", { type: "date", value: filters.date, onChange: (e) => handleFilterChange("date", e.target.value), style: Object.assign(Object.assign({}, inputStyle), { marginTop: "3px" }) })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }, children: "Game Name" }), _jsxs("select", { value: filters.game_name, onChange: (e) => handleFilterChange("game_name", e.target.value), style: Object.assign(Object.assign({}, inputStyle), { marginTop: "3px", cursor: "pointer" }), children: [_jsx("option", { value: "", children: "All Games" }), gameNameOptions.map((name) => (_jsx("option", { value: name, children: name }, name)))] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }, children: "Type" }), _jsxs("select", { value: filters.game_type, onChange: (e) => handleFilterChange("game_type", e.target.value), style: Object.assign(Object.assign({}, inputStyle), { marginTop: "3px" }), children: [_jsx("option", { value: "", children: "All Types" }), gameTypeOptions.map((type) => (_jsx("option", { value: type, children: formatOptionLabel(type) }, type)))] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }, children: "Session" }), _jsxs("select", { value: filters.session, onChange: (e) => handleFilterChange("session", e.target.value), style: Object.assign(Object.assign({}, inputStyle), { marginTop: "3px" }), children: [_jsx("option", { value: "", children: "All Sessions" }), sessionOptions.map((session) => (_jsx("option", { value: session, children: formatOptionLabel(session) }, session)))] })] }), _jsxs("div", { style: { gridColumn: isMobile ? "1 / -1" : "auto" }, children: [_jsx("label", { style: { fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }, children: "Search" }), _jsx("input", { type: "text", placeholder: "Search user, phone...", value: debouncedSearch, onChange: (e) => setDebouncedSearch(e.target.value), style: Object.assign(Object.assign({}, inputStyle), { marginTop: "3px" }) })] }), _jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "flex-end", gridColumn: isMobile ? "1 / -1" : "auto", paddingTop: "16px" }, children: [hasActiveFilters && (_jsx("button", { onClick: clearFilters, style: {
                            padding: "8px 12px", backgroundColor: "#ef4444", color: "#fff",
                            border: "none", borderRadius: "8px", cursor: "pointer",
                            fontSize: "13px", fontWeight: "600", flex: 1, minHeight: "38px"
                        }, children: "\u2715 Clear" })), _jsx("button", { onClick: refetch, style: {
                            padding: "8px 12px", backgroundColor: "#4f46e5", color: "#fff",
                            border: "none", borderRadius: "8px", cursor: "pointer",
                            fontSize: "13px", fontWeight: "600", flex: 1, minHeight: "38px"
                        }, children: "\uD83D\uDD04 Refresh" })] })] }));
    // ── MOBILE HORIZONTAL-SCROLL TABLE ────────────────────────────────────────────
    const MobileTable = () => {
        const th = {
            padding: "9px 8px", fontSize: "10px", fontWeight: "700", color: "#6b7280",
            backgroundColor: "#f9fafb", textTransform: "uppercase", letterSpacing: "0.4px",
            whiteSpace: "nowrap", borderBottom: "2px solid #e5e7eb", textAlign: "left"
        };
        const td = (extra = {}) => (Object.assign({ padding: "9px 8px", fontSize: "11px", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap", verticalAlign: "middle" }, extra));
        return (_jsx("div", { style: { overflowX: "auto", WebkitOverflowScrolling: "touch" }, children: _jsxs("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: "650px" }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "#" }), _jsx("th", { style: th, children: "User" }), _jsx("th", { style: th, children: "Game" }), _jsx("th", { style: th, children: "Type" }), _jsx("th", { style: th, children: "Session" }), _jsx("th", { style: th, children: "Digit" }), _jsx("th", { style: th, children: "Pana" }), _jsx("th", { style: th, children: "Points" }), _jsx("th", { style: th, children: "Result" }), _jsx("th", { style: th, children: "Date" })] }) }), _jsx("tbody", { children: biddingHistory.map((row, index) => {
                            var _a, _b;
                            const bidValues = getBidDisplayValues(row);
                            return (_jsxs("tr", { style: { backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb" }, children: [_jsx("td", { style: td({ color: "#9ca3af", fontWeight: "600" }), children: ((filters.page - 1) * filters.per_page) + index + 1 }), _jsx("td", { style: td(), children: _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [_jsx("div", { style: {
                                                        width: "26px", height: "26px", borderRadius: "50%",
                                                        backgroundColor: "#4f46e5", display: "flex", alignItems: "center",
                                                        justifyContent: "center", color: "#fff", fontWeight: "700",
                                                        fontSize: "10px", flexShrink: 0
                                                    }, children: (row.username || ((_a = row.user) === null || _a === void 0 ? void 0 : _a.name) || "U").charAt(0).toUpperCase() }), _jsx("span", { style: { fontWeight: "600", fontSize: "11px", color: "#111827" }, children: row.username || ((_b = row.user) === null || _b === void 0 ? void 0 : _b.name) || "N/A" })] }) }), _jsx("td", { style: td({ fontWeight: "700", color: "#111827" }), children: row.game_name || "N/A" }), _jsx("td", { style: td(), children: getGameTypeBadge(row.game_type) }), _jsx("td", { style: td(), children: getSessionBadge(row.session) }), _jsx("td", { style: td({ fontWeight: "700", color: "#4f46e5", fontFamily: "monospace", fontSize: "13px" }), children: bidValues.digit }), _jsx("td", { style: td({ fontWeight: "700", color: "#4f46e5", fontFamily: "monospace", fontSize: "13px" }), children: bidValues.pana }), _jsx("td", { style: td({ fontWeight: "700", color: "#059669" }), children: parseFloat(row.points || 0).toLocaleString('en-IN') }), _jsx("td", { style: td(), children: getResultBadge(row.winning_amount, row.is_win || row.winning_amount > 0) }), _jsx("td", { style: td({ color: "#6b7280" }), children: row.date || formatDate(row.created_at) }), _jsx("td", { style: td(), children: _jsx("button", { onClick: () => openEditModal(row), style: { padding: "4px 8px", fontSize: "11px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontWeight: "600", color: "#374151" }, children: "Edit" }) })] }, row.id || index));
                        }) })] }) }));
    };
    // ── DESKTOP DATATABLE COLUMNS ─────────────────────────────────────────────────
    const columns = [
        { name: "S.No", selector: (row, i) => ((filters.page - 1) * filters.per_page) + i + 1, width: "60px" },
        {
            name: "User", selector: (row) => { var _a; return row.username || ((_a = row.user) === null || _a === void 0 ? void 0 : _a.name) || "N/A"; }, sortable: true, width: "160px",
            cell: (row) => {
                var _a, _b, _c, _d;
                return (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [_jsx("div", { style: { width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "11px", flexShrink: 0 }, children: (row.username || ((_a = row.user) === null || _a === void 0 ? void 0 : _a.name) || "U").charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: "500", fontSize: "12px" }, children: row.username || ((_b = row.user) === null || _b === void 0 ? void 0 : _b.name) || "N/A" }), (((_c = row.user) === null || _c === void 0 ? void 0 : _c.phone) || row.phone) && _jsx("div", { style: { fontSize: "10px", color: "#6b7280" }, children: ((_d = row.user) === null || _d === void 0 ? void 0 : _d.phone) || row.phone })] })] }));
            }
        },
        { name: "Game", selector: (row) => row.game_name, sortable: true, width: "130px", cell: (row) => _jsx("span", { style: { fontWeight: "600", color: "#111827", fontSize: "12px" }, children: row.game_name || "N/A" }) },
        { name: "Type", selector: (row) => row.game_type, sortable: true, width: "120px", cell: (row) => getGameTypeBadge(row.game_type) },
        { name: "Session", selector: (row) => row.session, sortable: true, width: "90px", cell: (row) => getSessionBadge(row.session) },
        {
            name: "Digit",
            selector: (row) => getBidDisplayValues(row).digit,
            sortable: true,
            width: "95px",
            cell: (row) => _jsx("span", { style: { fontWeight: "700", color: "#4f46e5", fontFamily: "monospace", fontSize: "14px" }, children: getBidDisplayValues(row).digit })
        },
        {
            name: "Pana",
            selector: (row) => getBidDisplayValues(row).pana,
            sortable: true,
            width: "95px",
            cell: (row) => _jsx("span", { style: { fontWeight: "700", color: "#4f46e5", fontFamily: "monospace", fontSize: "14px" }, children: getBidDisplayValues(row).pana })
        },
        { name: "Points", selector: (row) => parseFloat(row.points || 0), sortable: true, width: "90px", cell: (row) => _jsxs("span", { style: { fontWeight: "700", color: "#059669", fontSize: "13px" }, children: ["\u20B9", parseFloat(row.points || 0).toLocaleString('en-IN')] }) },
        { name: "Result", selector: (row) => row.winning_amount, sortable: true, width: "100px", cell: (row) => getResultBadge(row.winning_amount, row.is_win || row.winning_amount > 0) },
        { name: "Date", selector: (row) => row.date || row.created_at, sortable: true, width: "110px", cell: (row) => _jsx("span", { style: { fontSize: "11px", color: "#6b7280" }, children: row.date || formatDate(row.created_at) }) },
        {
            name: "Action", width: "80px", cell: (row) => (_jsx("button", { onClick: () => openEditModal(row), style: { padding: "6px 12px", fontSize: "11px", backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#374151", transition: "all 0.2s" }, onMouseOver: (e) => { e.target.style.backgroundColor = "#e5e7eb"; }, onMouseOut: (e) => { e.target.style.backgroundColor = "#f3f4f6"; }, children: "Edit" }))
        },
    ];
    const customStyles = {
        headRow: { style: { backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" } },
        headCells: { style: { fontWeight: "700", fontSize: "12px", color: "#374151", paddingLeft: "10px", paddingRight: "10px" } },
        rows: { style: { fontSize: "13px", minHeight: "52px" }, highlightOnHoverStyle: { backgroundColor: "#f3f4f6" } },
        cells: { style: { paddingLeft: "10px", paddingRight: "10px" } },
        pagination: { style: { borderTop: "1px solid #e5e7eb" } },
    };
    const SkeletonLoader = () => (_jsx("div", { style: { width: "100%", padding: "0 8px" }, children: [...Array(8)].map((_, i) => _jsx(BiddingSkeleton, {}, i)) }));
    const noDataComponent = (_jsxs("div", { style: { padding: "40px", textAlign: "center", color: "#6b7280" }, children: [_jsx("span", { style: { fontSize: "40px", display: "block", marginBottom: "10px" }, children: "\uD83C\uDFAF" }), _jsx("p", { style: { fontWeight: "600", marginBottom: "4px" }, children: "No bidding history found" }), _jsx("p", { style: { fontSize: "12px", color: "#9ca3af" }, children: hasActiveFilters ? "Try adjusting your filters" : "Bids will appear here once placed" }), hasActiveFilters && (_jsx("button", { onClick: clearFilters, style: { marginTop: "12px", padding: "8px 16px", backgroundColor: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }, children: "Clear Filters" }))] }));
    if (isError) {
        return (_jsx("main", { style: { padding: "16px" }, children: _jsxs("div", { style: { color: "#dc2626", padding: "30px", textAlign: "center", backgroundColor: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca" }, children: [_jsx("h3", { style: { marginBottom: "8px" }, children: "Error loading bidding history" }), _jsx("p", { style: { fontSize: "14px" }, children: ((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.message) || (error === null || error === void 0 ? void 0 : error.message) || "Something went wrong" }), _jsx("button", { onClick: () => refetch(), style: { marginTop: "12px", padding: "10px 20px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }, children: "Retry" })] }) }));
    }
    return (_jsxs("main", { style: { padding: isMobile ? "8px" : "12px" }, children: [_jsxs("div", { style: {
                    backgroundColor: "#fff", borderRadius: "12px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden",
                    padding: isMobile ? "12px" : "0"
                }, children: [_jsxs("div", { style: {
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: isMobile ? "0 0 8px 0" : "12px 16px 0",
                            borderBottom: isMobile ? "1px solid #f0f0f0" : "none"
                        }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [_jsx("span", { style: { fontSize: "17px", fontWeight: "700", color: "#111827" }, children: "Bidding History" }), totalRows > 0 && (_jsxs("span", { style: { fontSize: "11px", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "3px 8px", borderRadius: "20px" }, children: [totalRows, " total"] }))] }), totalRows > 0 && _jsxs("span", { style: { fontSize: "11px", color: "#9ca3af" }, children: ["Pg ", currentPage, "/", lastPage] })] }), _jsx("div", { style: { padding: isMobile ? "0" : "0 16px" }, children: _jsx(FiltersSection, {}) }), isMobile ? (_jsx(_Fragment, { children: isLoading ? _jsx(SkeletonLoader, {}) : biddingHistory.length === 0 ? noDataComponent : (_jsxs(_Fragment, { children: [_jsx(MobileTable, {}), _jsxs("div", { style: {
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "12px 4px", borderTop: "1px solid #e5e7eb", marginTop: "4px"
                                    }, children: [_jsx("button", { disabled: filters.page <= 1, onClick: () => handlePageChange(filters.page - 1), style: {
                                                padding: "8px 14px", borderRadius: "8px",
                                                backgroundColor: filters.page <= 1 ? "#f3f4f6" : "#4f46e5",
                                                color: filters.page <= 1 ? "#9ca3af" : "#fff",
                                                border: "none", cursor: filters.page <= 1 ? "not-allowed" : "pointer",
                                                fontWeight: "600", fontSize: "13px"
                                            }, children: "\u2190 Prev" }), _jsxs("span", { style: { fontSize: "12px", color: "#6b7280" }, children: ["Page ", currentPage, " of ", lastPage] }), _jsx("button", { disabled: filters.page >= lastPage, onClick: () => handlePageChange(filters.page + 1), style: {
                                                padding: "8px 14px", borderRadius: "8px",
                                                backgroundColor: filters.page >= lastPage ? "#f3f4f6" : "#4f46e5",
                                                color: filters.page >= lastPage ? "#9ca3af" : "#fff",
                                                border: "none", cursor: filters.page >= lastPage ? "not-allowed" : "pointer",
                                                fontWeight: "600", fontSize: "13px"
                                            }, children: "Next \u2192" })] })] })) })) : (_jsx(DataTable, { columns: columns, data: biddingHistory, striped: true, highlightOnHover: true, pagination: true, paginationServer: true, paginationTotalRows: totalRows, paginationPerPage: filters.per_page, paginationDefaultPage: currentPage, paginationRowsPerPageOptions: [10, 15, 30, 50, 100], onChangePage: handlePageChange, onChangeRowsPerPage: handlePerRowsChange, progressPending: isLoading, progressComponent: _jsx(SkeletonLoader, {}), responsive: true, customStyles: customStyles, noDataComponent: noDataComponent }))] }), editModalOpen && editTarget && (_jsx("div", { style: {
                    position: "fixed", inset: 0, zIndex: 9999,
                    backgroundColor: "rgba(17, 24, 39, 0.6)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
                }, children: _jsxs("div", { style: {
                        backgroundColor: "#fff", borderRadius: "16px",
                        width: "100%", maxWidth: "400px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }, children: [_jsxs("div", { style: { padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx("h3", { style: { margin: 0, fontSize: "18px", fontWeight: "700", color: "#111827" }, children: "Edit Bid" }), _jsx("button", { onClick: () => setEditModalOpen(false), style: { background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", color: "#9ca3af" }, children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleEditBid, style: { padding: "24px" }, children: [_jsxs("div", { style: { marginBottom: "16px" }, children: [_jsx("label", { style: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }, children: "Pana" }), _jsx("input", { type: "number", required: true, value: editForm.pana, onChange: (e) => setEditForm(Object.assign(Object.assign({}, editForm), { pana: e.target.value })), style: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none", boxSizing: "border-box" } })] }), _jsxs("div", { style: { marginBottom: "24px" }, children: [_jsx("label", { style: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }, children: "Digit" }), _jsx("input", { type: "number", required: true, value: editForm.digit, onChange: (e) => setEditForm(Object.assign(Object.assign({}, editForm), { digit: e.target.value })), style: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none", boxSizing: "border-box" } })] }), _jsxs("div", { style: { display: "flex", gap: "12px", justifyContent: "flex-end" }, children: [_jsx("button", { type: "button", onClick: () => setEditModalOpen(false), style: { padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#374151", fontWeight: "600", cursor: "pointer", fontSize: "14px" }, children: "Cancel" }), _jsx("button", { type: "submit", disabled: isEditing, style: { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#4f46e5", color: "#fff", fontWeight: "600", cursor: isEditing ? "not-allowed" : "pointer", fontSize: "14px", opacity: isEditing ? 0.7 : 1 }, children: isEditing ? "Saving..." : "Save Changes" })] })] })] }) }))] }));
}
