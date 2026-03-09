import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-hot-toast";
import { useGetGaliGamesQuery, useAddGaliGameMutation, useUpdateGaliGameMutation, useToggleGaliGameMutation, } from "@/store/backendSlice/apiAPISlice";
// ─────────────────────────────────────────────────────────────────────────────
// SCROLL-WHEEL TIME PICKER
// ─────────────────────────────────────────────────────────────────────────────
function ScrollColumn({ items, selectedIndex, onSelect, width = 56 }) {
    const ITEM_H = 40;
    const listRef = useRef(null);
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTo({ top: selectedIndex * ITEM_H, behavior: "smooth" });
        }
    }, [selectedIndex]);
    useEffect(() => {
        const el = listRef.current;
        if (!el)
            return;
        let timer;
        const onScroll = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const idx = Math.round(el.scrollTop / ITEM_H);
                const clamped = Math.max(0, Math.min(idx, items.length - 1));
                el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
                if (clamped !== selectedIndex)
                    onSelect(clamped);
            }, 120);
        };
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, [items.length, selectedIndex, onSelect]);
    return (_jsxs("div", { style: { position: "relative", width, display: "flex", flexDirection: "column", alignItems: "center" }, children: [_jsx("div", { style: {
                    position: "absolute", top: "50%", left: 0, right: 0,
                    height: ITEM_H, transform: "translateY(-50%)",
                    background: "#fff7ed", borderRadius: "8px",
                    borderTop: "2px solid #ea580c",
                    borderBottom: "2px solid #ea580c",
                    pointerEvents: "none", zIndex: 1,
                } }), _jsxs("div", { ref: listRef, style: {
                    height: ITEM_H * 3, overflowY: "scroll",
                    scrollbarWidth: "none", msOverflowStyle: "none", width: "100%",
                }, children: [_jsx("div", { style: { height: ITEM_H } }), items.map((item, i) => (_jsx("div", { onClick: () => onSelect(i), style: {
                            height: ITEM_H, display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "16px", fontWeight: i === selectedIndex ? 700 : 400,
                            color: i === selectedIndex ? "#ea580c" : "#6b7280",
                            cursor: "pointer", transition: "all 0.15s",
                            position: "relative", zIndex: 2, userSelect: "none",
                        }, children: item }, i))), _jsx("div", { style: { height: ITEM_H } })] }), _jsx("div", { style: {
                    position: "absolute", top: 0, left: 0, right: 0, height: ITEM_H,
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.95), transparent)",
                    pointerEvents: "none", zIndex: 3,
                } }), _jsx("div", { style: {
                    position: "absolute", bottom: 0, left: 0, right: 0, height: ITEM_H,
                    background: "linear-gradient(to top, rgba(255,255,255,0.95), transparent)",
                    pointerEvents: "none", zIndex: 3,
                } })] }));
}
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];
function parse24(val) {
    if (!val)
        return { hourIdx: 0, minIdx: 0, periodIdx: 0 };
    const [hStr, mStr] = val.split(":");
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const periodIdx = h >= 12 ? 1 : 0;
    if (h === 0)
        h = 12;
    else if (h > 12)
        h -= 12;
    return { hourIdx: h - 1, minIdx: m, periodIdx };
}
function to24(hourIdx, minIdx, periodIdx) {
    let h = hourIdx + 1;
    if (periodIdx === 0) {
        if (h === 12)
            h = 0;
    }
    else {
        if (h !== 12)
            h += 12;
    }
    return `${h}:${String(minIdx).padStart(2, "0")}`;
}
function TimePicker({ value, onChange, placeholder = "Select time" }) {
    const [open, setOpen] = useState(false);
    const { hourIdx: hi, minIdx: mi, periodIdx: pi } = parse24(value);
    const [hourIdx, setHourIdx] = useState(hi);
    const [minIdx, setMinIdx] = useState(mi);
    const [periodIdx, setPeriodIdx] = useState(pi);
    const wrapRef = useRef(null);
    useEffect(() => {
        const { hourIdx: h, minIdx: m, periodIdx: p } = parse24(value);
        setHourIdx(h);
        setMinIdx(m);
        setPeriodIdx(p);
    }, [value]);
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    const handleConfirm = () => {
        onChange(to24(hourIdx, minIdx, periodIdx));
        setOpen(false);
    };
    const displayLabel = value
        ? (() => {
            const { hourIdx: h, minIdx: m, periodIdx: p } = parse24(value);
            return `${HOURS[h]}:${MINUTES[m]} ${PERIODS[p]}`;
        })()
        : placeholder;
    return (_jsxs("div", { ref: wrapRef, style: { position: "relative", width: "100%" }, children: [_jsxs("button", { type: "button", onClick: () => setOpen((p) => !p), style: {
                    width: "100%", padding: "9px 12px",
                    border: "1px solid #d1d5db", borderRadius: "8px",
                    background: "#fff", fontSize: "13px",
                    color: value ? "#1f2937" : "#9ca3af",
                    textAlign: "left", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    boxSizing: "border-box", outline: "none",
                }, children: [_jsx("span", { children: displayLabel }), _jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "#6b7280", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: open ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }, children: _jsx("polyline", { points: "6 9 12 15 18 9" }) })] }), open && (_jsxs("div", { style: {
                    position: "absolute", top: "calc(100% + 6px)", left: 0,
                    background: "#fff", border: "1px solid #e5e7eb",
                    borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                    zIndex: 9999, padding: "12px 16px 14px", minWidth: "220px",
                }, children: [_jsx("p", { style: { margin: "0 0 10px", fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Select Time" }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }, children: [_jsx(ScrollColumn, { items: HOURS, selectedIndex: hourIdx, onSelect: setHourIdx, width: 56 }), _jsx("span", { style: { fontSize: "20px", fontWeight: 700, color: "#374151", lineHeight: 1, paddingBottom: "2px" }, children: ":" }), _jsx(ScrollColumn, { items: MINUTES, selectedIndex: minIdx, onSelect: setMinIdx, width: 56 }), _jsx(ScrollColumn, { items: PERIODS, selectedIndex: periodIdx, onSelect: setPeriodIdx, width: 52 })] }), _jsx("button", { type: "button", onClick: handleConfirm, style: {
                            marginTop: "12px", width: "100%", padding: "9px",
                            background: "#ea580c", color: "#fff",
                            border: "none", borderRadius: "8px", cursor: "pointer",
                            fontSize: "13px", fontWeight: 600,
                        }, children: "Set Time" })] }))] }));
}
// ─── Skeleton row ─────────────────────────────────────────────────────────────
const GameSkeleton = () => (_jsxs("div", { style: { display: "flex", alignItems: "center", padding: "12px 16px", gap: "20px", borderBottom: "1px solid #f0f0f0" }, children: [_jsx(Skeleton, { width: 35, height: 16 }), _jsx(Skeleton, { width: 100, height: 16 }), _jsx(Skeleton, { width: 100, height: 16 }), _jsx(Skeleton, { width: 75, height: 16 }), _jsx(Skeleton, { width: 75, height: 16 }), _jsx(Skeleton, { circle: true, width: 34, height: 34 }), _jsx(Skeleton, { width: 95, height: 20, borderRadius: 12 }), _jsx(Skeleton, { width: 55, height: 28, borderRadius: 6 })] }));
// ─── Modal ────────────────────────────────────────────────────────────────────
function GameModal({ open, onClose, editData }) {
    const isEdit = !!editData;
    const [form, setForm] = useState({ name: "", name_hindi: "", open_time: "", close_time: "" });
    const [addGaliGame, { isLoading: isAdding }] = useAddGaliGameMutation();
    const [updateGaliGame, { isLoading: isUpdating }] = useUpdateGaliGameMutation();
    const isSaving = isAdding || isUpdating;
    useEffect(() => {
        if (open) {
            setForm(editData
                ? {
                    name: editData.name || "",
                    name_hindi: editData.name_hindi || "",
                    open_time: editData.open_time || "",
                    close_time: editData.close_time || "",
                }
                : { name: "", name_hindi: "", open_time: "", close_time: "" });
        }
    }, [editData, open]);
    const handleChange = (e) => setForm((p) => (Object.assign(Object.assign({}, p), { [e.target.name]: e.target.value })));
    const handleSubmit = async (e) => {
        var _a;
        e.preventDefault();
        if (!form.name.trim() || !form.name_hindi.trim() || !form.open_time || !form.close_time) {
            toast.error("All fields are required");
            return;
        }
        try {
            if (isEdit) {
                const res = await updateGaliGame(Object.assign({ id: editData.id }, form)).unwrap();
                toast.success((res === null || res === void 0 ? void 0 : res.message) || "Game updated!");
            }
            else {
                const res = await addGaliGame(form).unwrap();
                toast.success((res === null || res === void 0 ? void 0 : res.message) || "Game added!");
            }
            onClose();
        }
        catch (err) {
            toast.error(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || "Something went wrong");
        }
    };
    if (!open)
        return null;
    return (_jsx("div", { style: {
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, backdropFilter: "blur(2px)", padding: "16px",
        }, onClick: onClose, children: _jsxs("div", { style: {
                background: "#fff", borderRadius: "14px", padding: "28px",
                width: "100%", maxWidth: "460px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                maxHeight: "90vh", overflowY: "auto",
            }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }, children: [_jsx("h2", { style: { margin: 0, fontSize: "16px", fontWeight: 700, color: "#1f2937" }, children: isEdit ? "Edit Gali Game" : "Add Gali Game" }), _jsx("button", { onClick: onClose, disabled: isSaving, style: { background: "transparent", border: "none", fontSize: "26px", cursor: "pointer", color: "#6b7280", lineHeight: 1 }, children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { marginBottom: "16px" }, children: [_jsx("label", { style: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }, children: "Game Name" }), _jsx("input", { name: "name", value: form.name, onChange: handleChange, placeholder: "e.g. Gali Morning", style: { width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", color: "#1f2937" }, autoComplete: "off" })] }), _jsxs("div", { style: { marginBottom: "16px" }, children: [_jsx("label", { style: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }, children: "Game Name (Hindi)" }), _jsx("input", { name: "name_hindi", value: form.name_hindi, onChange: handleChange, placeholder: "e.g. \u0917\u0932\u0940 \u0938\u0941\u092C\u0939", style: { width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", color: "#1f2937" }, autoComplete: "off" })] }), _jsxs("div", { style: { marginBottom: "16px" }, children: [_jsx("label", { style: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }, children: "Open Time" }), _jsx(TimePicker, { value: form.open_time, onChange: (val) => setForm((p) => (Object.assign(Object.assign({}, p), { open_time: val }))), placeholder: "Select open time" }), form.open_time && (_jsxs("p", { style: { margin: "5px 0 0", fontSize: "11px", color: "#9ca3af" }, children: ["Sends to API: ", _jsx("strong", { style: { color: "#374151" }, children: form.open_time })] }))] }), _jsxs("div", { style: { marginBottom: "16px" }, children: [_jsx("label", { style: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }, children: "Close Time" }), _jsx(TimePicker, { value: form.close_time, onChange: (val) => setForm((p) => (Object.assign(Object.assign({}, p), { close_time: val }))), placeholder: "Select close time" }), form.close_time && (_jsxs("p", { style: { margin: "5px 0 0", fontSize: "11px", color: "#9ca3af" }, children: ["Sends to API: ", _jsx("strong", { style: { color: "#374151" }, children: form.close_time })] }))] }), _jsxs("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }, children: [_jsx("button", { type: "button", onClick: onClose, disabled: isSaving, style: { padding: "9px 16px", background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500 }, children: "Cancel" }), _jsx("button", { type: "submit", disabled: isSaving, style: { padding: "9px 20px", background: "#ea580c", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.7 : 1 }, children: isSaving ? "Saving..." : isEdit ? "Update Game" : "Add Game" })] })] })] }) }));
}
// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function GaliGameName() {
    var _a;
    const [filterText, setFilterText] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const { data: gamesData, isLoading, isError, error } = useGetGaliGamesQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [toggleGaliGame] = useToggleGaliGameMutation();
    const games = (gamesData === null || gamesData === void 0 ? void 0 : gamesData.data) || (gamesData === null || gamesData === void 0 ? void 0 : gamesData.games) || (Array.isArray(gamesData) ? gamesData : []);
    console.log(" the games0", games);
    const isRowActive = (row) => row.status === true || row.status === 1 || row.status === "Active" || row.is_active === 1;
    const getMarketStatus = (row) => {
        if (row.market_status)
            return row.market_status;
        return isRowActive(row) ? "MARKET OPEN" : "MARKET CLOSED";
    };
    const handleToggle = async (row) => {
        var _a;
        setTogglingId(row.id);
        try {
            const res = await toggleGaliGame(row.id).unwrap();
            toast.success((res === null || res === void 0 ? void 0 : res.message) || "Status updated!");
        }
        catch (err) {
            toast.error(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || "Toggle failed");
        }
        finally {
            setTogglingId(null);
        }
    };
    const filteredData = (Array.isArray(games) ? games : []).filter((item) => {
        if (!filterText)
            return true;
        const q = filterText.toLowerCase();
        return ((item.name || "").toLowerCase().includes(q) ||
            (item.name_hindi || "").toLowerCase().includes(q) ||
            (item.open_time || "").toLowerCase().includes(q) ||
            (item.close_time || "").toLowerCase().includes(q));
    });
    const columns = [
        {
            name: _jsx("span", { className: "col-header", children: "#" }),
            selector: (_, i) => i + 1,
            sortable: false,
            width: "40px",
            cell: (_, i) => _jsx("span", { style: { color: "#6b7280", fontWeight: 500, fontSize: "13px" }, children: i + 1 }),
        },
        {
            name: _jsx("span", { className: "col-header", style: { fontSize: "12px" }, children: "Game Name" }),
            selector: (row) => row.name || "",
            sortable: true,
            cell: (row) => _jsx("span", { style: { fontWeight: 500, fontSize: "13px" }, children: row.name || "—" }),
        },
        {
            name: _jsx("span", { className: "col-header", style: { fontSize: "10px" }, children: "Game Name (Hindi)" }),
            selector: (row) => row.name_hindi || "",
            sortable: true,
            cell: (row) => _jsx("span", { style: { fontSize: "13px" }, children: row.name_hindi || "—" }),
        },
        {
            name: _jsx("span", { className: "col-header", children: "Open Time" }),
            selector: (row) => row.open_time || "",
            sortable: true,
            width: "110px",
            cell: (row) => (_jsx("span", { style: { fontFamily: "monospace", fontSize: "13px", color: "#374151" }, children: row.open_time || "—" })),
        },
        {
            name: _jsx("span", { className: "col-header", children: "Close Time" }),
            selector: (row) => row.close_time || "",
            sortable: true,
            width: "115px",
            cell: (row) => (_jsx("span", { style: { fontFamily: "monospace", fontSize: "13px", color: "#374151" }, children: row.close_time || "—" })),
        },
        {
            name: _jsx("span", { className: "col-header", children: "Active" }),
            selector: (row) => isRowActive(row),
            sortable: true,
            width: "90px",
            cell: (row) => {
                const active = isRowActive(row);
                const isToggling = togglingId === row.id;
                return (_jsx("button", { onClick: () => handleToggle(row), disabled: isToggling, title: active ? "Click to deactivate" : "Click to activate", style: {
                        width: "36px", height: "36px", borderRadius: "50%", border: "none",
                        background: isToggling ? "#9ca3af" : active ? "#22c55e" : "#ef4444",
                        color: "#fff", cursor: isToggling ? "not-allowed" : "pointer",
                        fontWeight: 700, fontSize: "11px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.2s", flexShrink: 0,
                    }, children: isToggling ? (_jsx("span", { style: {
                            width: 10, height: 10, border: "2px solid #fff",
                            borderTopColor: "transparent", borderRadius: "50%",
                            display: "inline-block", animation: "spin 0.8s linear infinite",
                        } })) : (active ? "Yes" : "No") }));
            },
        },
        {
            name: _jsx("span", { className: "col-header", children: "Market Status" }),
            selector: (row) => getMarketStatus(row),
            sortable: true,
            width: "150px",
            cell: (row) => {
                const status = getMarketStatus(row);
                const isOpen = status === "MARKET OPEN";
                return (_jsx("span", { style: {
                        fontSize: "11px", fontWeight: 600,
                        color: isOpen ? "#059669" : "#dc2626",
                        background: isOpen ? "#d1fae5" : "#fee2e2",
                        padding: "4px 10px", borderRadius: "20px", whiteSpace: "nowrap",
                    }, children: status }));
            },
        },
        {
            name: _jsx("span", { className: "col-header", children: "Action" }),
            width: "90px",
            cell: (row) => (_jsx("button", { onClick: () => { setEditData(row); setModalOpen(true); }, style: {
                    padding: "5px 14px", background: "#ea580c", color: "#fff",
                    border: "none", borderRadius: "6px", cursor: "pointer",
                    fontSize: "11px", fontWeight: 600,
                }, children: "EDIT" })),
        },
    ];
    const subHeaderComponent = (_jsxs("div", { style: {
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0", width: "100%", gap: "12px", flexWrap: "wrap",
        }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px", flexWrap: "wrap" }, children: [_jsx("input", { type: "text", placeholder: "Search by name or time...", value: filterText, onChange: (e) => setFilterText(e.target.value), style: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", minWidth: "200px", fontSize: "13px", outline: "none", flex: 1 } }), filterText && (_jsx("button", { onClick: () => setFilterText(""), style: {
                            padding: "8px 12px", background: "#ef4444", color: "#fff",
                            border: "none", borderRadius: "6px", cursor: "pointer",
                            fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap",
                        }, children: "\u2715 Clear" }))] }), _jsx("button", { onClick: () => { setEditData(null); setModalOpen(true); }, style: {
                    padding: "8px 20px", background: "#ea580c", color: "#fff",
                    border: "none", borderRadius: "6px", cursor: "pointer",
                    fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap",
                }, children: "+ Add Game" })] }));
    const SkeletonLoader = () => (_jsx("div", { style: { width: "100%" }, children: [...Array(10)].map((_, i) => _jsx(GameSkeleton, {}, i)) }));
    const customStyles = {
        headRow: { style: { backgroundColor: "#ea580c", minHeight: "46px" } },
        headCells: { style: { backgroundColor: "#ea580c", color: "#ffffff", fontWeight: "700", fontSize: "13px", paddingLeft: "10px", paddingRight: "10px" } },
        rows: { style: { fontSize: "13px", minHeight: "54px" }, highlightOnHoverStyle: { backgroundColor: "#fff7ed" }, stripedStyle: { backgroundColor: "#fafafa" } },
        cells: { style: { paddingLeft: "10px", paddingRight: "10px" } },
        pagination: { style: { borderTop: "1px solid #e5e7eb", minHeight: "50px" } },
    };
    if (isError) {
        return (_jsx("main", { style: { padding: "20px" }, children: _jsxs("div", { style: { color: "#dc2626", padding: "40px", textAlign: "center", background: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca" }, children: [_jsx("h3", { style: { marginBottom: "10px" }, children: "Error loading games" }), _jsx("p", { children: ((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.message) || (error === null || error === void 0 ? void 0 : error.message) || "Something went wrong" }), _jsx("button", { onClick: () => window.location.reload(), style: { marginTop: "15px", padding: "10px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }, children: "Retry" })] }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx("style", { jsx: true, global: true, children: `
                @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
                .gl-table .rdt_TableHead .rdt_TableHeadRow { background-color: #ea580c !important; min-height: 46px !important; }
                .gl-table .rdt_TableHead .rdt_TableHeadRow .rdt_TableCol { background-color: #ea580c !important; color: #ffffff !important; font-weight: 700 !important; font-size: 13px !important; }
                .gl-table .rdt_TableHead .rdt_TableHeadRow .col-header { color: #ffffff !important; }
                .gl-table .rdt_TableCol_Sortable svg { fill: rgba(255,255,255,0.8) !important; }
                @media (max-width: 600px) {
                    .gl-table .rdt_TableCell, .gl-table .rdt_TableCol { padding-left: 6px !important; padding-right: 6px !important; font-size: 12px !important; }
                }
            ` }), _jsx("main", { style: { padding: "9px", minHeight: "100vh", overflow: "auto", paddingBottom: "73px" }, children: _jsx("div", { className: "gl-table", style: { background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "visible" }, children: _jsx(DataTable, { title: _jsx("div", { style: { padding: "8px 0", position: "relative", right: "12px" }, children: _jsx("span", { style: { fontSize: "17px", fontWeight: 700, color: "#111827" }, children: "Gali Game Name List" }) }), columns: columns, data: filteredData, striped: true, pagination: true, highlightOnHover: true, subHeader: true, subHeaderComponent: subHeaderComponent, paginationRowsPerPageOptions: [10, 30, 50, 100], paginationPerPage: rowsPerPage, onChangeRowsPerPage: (n) => setRowsPerPage(n), progressPending: isLoading, progressComponent: _jsx(SkeletonLoader, {}), responsive: true, customStyles: customStyles, noDataComponent: _jsxs("div", { style: { padding: "40px", textAlign: "center", color: "#6b7280" }, children: [_jsx("span", { style: { fontSize: "48px", display: "block", marginBottom: "10px" }, children: "\uD83C\uDFAE" }), _jsx("p", { children: "No games found" }), filterText && (_jsx("button", { onClick: () => setFilterText(""), style: { marginTop: "10px", padding: "8px 16px", background: "#ea580c", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }, children: "Clear Filter" }))] }) }) }) }), _jsx(GameModal, { open: modalOpen, onClose: () => { setModalOpen(false); setEditData(null); }, editData: editData })] }));
}
