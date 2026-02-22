'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-hot-toast";
import {
    useGetStarlineGamesQuery,
    useAddStarlineGameMutation,
    useUpdateStarlineGameMutation,
    useToggleStarlineGameMutation,
} from "@/store/backendSlice/apiAPISlice";

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL-WHEEL TIME PICKER
// Sends value as "HH:MM" 24-hr string to satisfy Laravel H:i validation
// ─────────────────────────────────────────────────────────────────────────────
function ScrollColumn({ items, selectedIndex, onSelect, width = 56 }) {
    const ITEM_H = 40;
    const listRef = useRef(null);
    const isScrolling = useRef(false);

    // Scroll to selected item on mount / change
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTo({ top: selectedIndex * ITEM_H, behavior: "smooth" });
        }
    }, [selectedIndex]);

    const handleScroll = useCallback(() => {
        if (isScrolling.current) return;
        const el = listRef.current;
        if (!el) return;
        const idx = Math.round(el.scrollTop / ITEM_H);
        const clamped = Math.max(0, Math.min(idx, items.length - 1));
        if (clamped !== selectedIndex) onSelect(clamped);
    }, [items.length, selectedIndex, onSelect]);

    // Snap on scroll end
    useEffect(() => {
        const el = listRef.current;
        if (!el) return;
        let timer;
        const onScroll = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const idx = Math.round(el.scrollTop / ITEM_H);
                const clamped = Math.max(0, Math.min(idx, items.length - 1));
                el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
                if (clamped !== selectedIndex) onSelect(clamped);
            }, 120);
        };
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, [items.length, selectedIndex, onSelect]);

    return (
        <div style={{
            position: "relative", width, display: "flex",
            flexDirection: "column", alignItems: "center",
        }}>
            {/* Selection highlight bar */}
            <div style={{
                position: "absolute", top: "50%", left: 0, right: 0,
                height: ITEM_H, transform: "translateY(-50%)",
                background: "#f5f3ff", borderRadius: "8px",
                borderTop: "2px solid #7c3aed",
                borderBottom: "2px solid #7c3aed",
                pointerEvents: "none", zIndex: 1,
            }} />

            <div ref={listRef} style={{
                height: ITEM_H * 3,       // show 3 items; middle = selected
                overflowY: "scroll",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                width: "100%",
            }}>
                {/* Top padding so first item centers */}
                <div style={{ height: ITEM_H }} />
                {items.map((item, i) => (
                    <div key={i}
                        onClick={() => { onSelect(i); }}
                        style={{
                            height: ITEM_H,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "16px", fontWeight: i === selectedIndex ? 700 : 400,
                            color: i === selectedIndex ? "#7c3aed" : "#6b7280",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            position: "relative", zIndex: 2,
                            userSelect: "none",
                        }}
                    >
                        {item}
                    </div>
                ))}
                {/* Bottom padding so last item centers */}
                <div style={{ height: ITEM_H }} />
            </div>

            {/* Fade top */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: ITEM_H,
                background: "linear-gradient(to bottom, rgba(255,255,255,0.95), transparent)",
                pointerEvents: "none", zIndex: 3,
            }} />
            {/* Fade bottom */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: ITEM_H,
                background: "linear-gradient(to top, rgba(255,255,255,0.95), transparent)",
                pointerEvents: "none", zIndex: 3,
            }} />

            {/* Hide scrollbar for webkit */}
            <style>{`.scroll-hide::-webkit-scrollbar{display:none}`}</style>
        </div>
    );
}

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")); // "01"…"12"
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));      // "00"…"59"
const PERIODS = ["AM", "PM"];

// Parse "HH:MM" 24hr → { hourIdx, minIdx, periodIdx }
function parse24(val) {
    if (!val) return { hourIdx: 0, minIdx: 0, periodIdx: 0 };
    const [hStr, mStr] = val.split(":");
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const periodIdx = h >= 12 ? 1 : 0;
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return {
        hourIdx: h - 1,           // 0-based index into HOURS
        minIdx: m,
        periodIdx,
    };
}

// Convert { hourIdx, minIdx, periodIdx } → "HH:MM" 24hr
function to24(hourIdx, minIdx, periodIdx) {
    let h = hourIdx + 1;   // 1-12
    if (periodIdx === 0) { // AM
        if (h === 12) h = 0;
    } else {               // PM
        if (h !== 12) h += 12;
    }
    return `${String(h).padStart(2, "0")}:${String(minIdx).padStart(2, "0")}`;
}

function TimePicker({ value, onChange, placeholder = "Select time" }) {
    const [open, setOpen] = useState(false);
    const { hourIdx: hi, minIdx: mi, periodIdx: pi } = parse24(value);
    const [hourIdx, setHourIdx]     = useState(hi);
    const [minIdx, setMinIdx]       = useState(mi);
    const [periodIdx, setPeriodIdx] = useState(pi);
    const wrapRef = useRef(null);

    // Sync internal state when value changes externally (e.g. edit autofill)
    useEffect(() => {
        const { hourIdx: h, minIdx: m, periodIdx: p } = parse24(value);
        setHourIdx(h); setMinIdx(m); setPeriodIdx(p);
    }, [value]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
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

    return (
        <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
            {/* Trigger button */}
            <button type="button" onClick={() => setOpen((p) => !p)}
                style={{
                    width: "100%", padding: "9px 12px",
                    border: "1px solid #d1d5db", borderRadius: "8px",
                    background: "#fff", fontSize: "13px",
                    color: value ? "#1f2937" : "#9ca3af",
                    textAlign: "left", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    boxSizing: "border-box", outline: "none",
                }}
            >
                <span>{displayLabel}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Picker panel */}
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0,
                    background: "#fff", border: "1px solid #e5e7eb",
                    borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                    zIndex: 9999, padding: "12px 16px 14px",
                    minWidth: "220px",
                }}>
                    <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Select Time
                    </p>

                    {/* Scroll wheels row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                        <ScrollColumn items={HOURS}   selectedIndex={hourIdx}   onSelect={setHourIdx}   width={56} />
                        <span style={{ fontSize: "20px", fontWeight: 700, color: "#374151", lineHeight: 1, paddingBottom: "2px" }}>:</span>
                        <ScrollColumn items={MINUTES} selectedIndex={minIdx}    onSelect={setMinIdx}    width={56} />
                        <ScrollColumn items={PERIODS} selectedIndex={periodIdx} onSelect={setPeriodIdx} width={52} />
                    </div>

                    {/* Confirm */}
                    <button type="button" onClick={handleConfirm}
                        style={{
                            marginTop: "12px", width: "100%",
                            padding: "9px", background: "#7c3aed", color: "#fff",
                            border: "none", borderRadius: "8px", cursor: "pointer",
                            fontSize: "13px", fontWeight: 600,
                        }}>
                        Set Time
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const GameSkeleton = () => (
    <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: "20px", borderBottom: "1px solid #f0f0f0" }}>
        <Skeleton width={35} height={16} />
        <Skeleton width={100} height={16} />
        <Skeleton width={100} height={16} />
        <Skeleton width={75} height={16} />
        <Skeleton circle width={34} height={34} />
        <Skeleton width={95} height={20} borderRadius={12} />
        <Skeleton width={55} height={28} borderRadius={6} />
    </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
function GameModal({ open, onClose, editData }) {
    const isEdit = !!editData;
    const [form, setForm] = useState({ name: "", name_hindi: "", time: "" });
    const [addStarlineGame,    { isLoading: isAdding }]   = useAddStarlineGameMutation();
    const [updateStarlineGame, { isLoading: isUpdating }] = useUpdateStarlineGameMutation();
    const isSaving = isAdding || isUpdating;

    useEffect(() => {
        if (open) {
            setForm(editData
                ? { name: editData.name || "", name_hindi: editData.name_hindi || "", time: editData.time || "" }
                : { name: "", name_hindi: "", time: "" }
            );
        }
    }, [editData, open]);

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.name_hindi.trim() || !form.time) {
            toast.error("All fields are required");
            return;
        }
        try {
            if (isEdit) {
                const res = await updateStarlineGame({ id: editData.id, ...form }).unwrap();
                toast.success(res?.message || "Game updated!");
            } else {
                const res = await addStarlineGame(form).unwrap();
                toast.success(res?.message || "Game added!");
            }
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || err?.message || "Something went wrong");
        }
    };

    if (!open) return null;

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, backdropFilter: "blur(2px)", padding: "16px",
        }} onClick={onClose}>
            <div style={{
                background: "#fff", borderRadius: "14px", padding: "28px",
                width: "100%", maxWidth: "460px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                maxHeight: "90vh", overflowY: "auto",
            }} onClick={(e) => e.stopPropagation()}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                    <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
                        {isEdit ? "Edit Game" : "Add Game"}
                    </h2>
                    <button onClick={onClose} disabled={isSaving}
                        style={{ background: "transparent", border: "none", fontSize: "26px", cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Game Name</label>
                        <input name="name" value={form.name} onChange={handleChange}
                            placeholder="e.g. Morning Game"
                            style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", color: "#1f2937" }}
                            autoComplete="off" />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Game Name (Hindi)</label>
                        <input name="name_hindi" value={form.name_hindi} onChange={handleChange}
                            placeholder="e.g. सुबह का खेल"
                            style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", color: "#1f2937" }}
                            autoComplete="off" />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Time</label>
                        <TimePicker
                            value={form.time}
                            onChange={(val) => setForm((p) => ({ ...p, time: val }))}
                            placeholder="Select time"
                        />
                        {form.time && (
                            <p style={{ margin: "5px 0 0", fontSize: "11px", color: "#9ca3af" }}>
                                Sends to API: <strong style={{ color: "#374151" }}>{form.time}</strong>
                            </p>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                        <button type="button" onClick={onClose} disabled={isSaving}
                            style={{ padding: "9px 16px", background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSaving}
                            style={{ padding: "9px 20px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.7 : 1 }}>
                            {isSaving ? "Saving..." : isEdit ? "Update Game" : "Add Game"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StarlineGameName() {
    const [filterText, setFilterText]   = useState("");
    const [modalOpen, setModalOpen]     = useState(false);
    const [editData, setEditData]       = useState(null);
    const [togglingId, setTogglingId]   = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(100);

    const { data: gamesData, isLoading, isError, error } = useGetStarlineGamesQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [toggleStarlineGame] = useToggleStarlineGameMutation();

    const games = gamesData?.data || gamesData?.games || (Array.isArray(gamesData) ? gamesData : []);

    const isRowActive = (row) =>
        row.status === true || row.status === 1 || row.status === "Active" || row.is_active === 1;

    const getMarketStatus = (row) => {
        if (row.market_status) return row.market_status;
        return isRowActive(row) ? "MARKET OPEN" : "MARKET CLOSED";
    };

    const handleToggle = async (row) => {
        setTogglingId(row.id);
        try {
            const res = await toggleStarlineGame(row.id).unwrap();
            toast.success(res?.message || "Status updated!");
        } catch (err) {
            toast.error(err?.data?.message || err?.message || "Toggle failed");
        } finally {
            setTogglingId(null);
        }
    };

    const filteredData = (Array.isArray(games) ? games : []).filter((item) => {
        if (!filterText) return true;
        const q = filterText.toLowerCase();
        return (
            (item.name || "").toLowerCase().includes(q) ||
            (item.name_hindi || "").toLowerCase().includes(q) ||
            (item.time || "").toLowerCase().includes(q)
        );
    });

    const columns = [
        {
            name: <span className="col-header">#</span>,
            selector: (_, i) => i + 1,
            sortable: false,
            width: "55px",
            cell: (_, i) => <span style={{ color: "#6b7280", fontWeight: 500, fontSize: "13px" }}>{i + 1}</span>,
        },
        {
            name: <span className="col-header" style={{fontSize:"12px"}}>Game Name</span>,
            selector: (row) => row.name || "",
            sortable: true,
            cell: (row) => <span style={{ fontWeight: 500, fontSize: "13px" }}>{row.name || "—"}</span>,
        },
        {
            name: <span className="col-header" style={{fontSize:"12px"}}>Game Name (Hindi)</span>,
            selector: (row) => row.name_hindi || "",
            sortable: true,
            cell: (row) => <span style={{ fontSize: "13px" }}>{row.name_hindi || "—"}</span>,
        },
        {
            name: <span className="col-header">Time</span>,
            selector: (row) => row.time || "",
            sortable: true,
            width: "110px",
            cell: (row) => (
                <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#374151" }}>
                    {row.time || "—"}
                </span>
            ),
        },
        {
            name: <span className="col-header">Active</span>,
            selector: (row) => isRowActive(row),
            sortable: true,
            width: "90px",
            cell: (row) => {
                const active = isRowActive(row);
                const isToggling = togglingId === row.id;
                return (
                    <button
                        onClick={() => handleToggle(row)}
                        disabled={isToggling}
                        title={active ? "Click to deactivate" : "Click to activate"}
                        style={{
                            width: "36px", height: "36px", borderRadius: "50%", border: "none",
                            background: isToggling ? "#9ca3af" : active ? "#22c55e" : "#ef4444",
                            color: "#fff", cursor: isToggling ? "not-allowed" : "pointer",
                            fontWeight: 700, fontSize: "11px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 0.2s", flexShrink: 0,
                        }}
                    >
                        {isToggling ? (
                            <span style={{
                                width: 10, height: 10, border: "2px solid #fff",
                                borderTopColor: "transparent", borderRadius: "50%",
                                display: "inline-block", animation: "spin 0.8s linear infinite",
                            }} />
                        ) : (active ? "Yes" : "No")}
                    </button>
                );
            },
        },
        {
            name: <span className="col-header">Market Status</span>,
            selector: (row) => getMarketStatus(row),
            sortable: true,
            width: "150px",
            cell: (row) => {
                const status = getMarketStatus(row);
                const isOpen = status === "MARKET OPEN";
                return (
                    <span style={{
                        fontSize: "11px", fontWeight: 600,
                        color: isOpen ? "#059669" : "#dc2626",
                        background: isOpen ? "#d1fae5" : "#fee2e2",
                        padding: "4px 10px", borderRadius: "20px", whiteSpace: "nowrap",
                    }}>
                        {status}
                    </span>
                );
            },
        },
        {
            name: <span className="col-header">Action</span>,
            width: "90px",
            cell: (row) => (
                <button
                    onClick={() => { setEditData(row); setModalOpen(true); }}
                    style={{
                        padding: "5px 14px", background: "#7c3aed", color: "#fff",
                        border: "none", borderRadius: "6px", cursor: "pointer",
                        fontSize: "11px", fontWeight: 600,
                    }}
                >
                    EDIT
                </button>
            ),
        },
    ];

    const subHeaderComponent = (
        <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0", width: "100%", gap: "12px", flexWrap: "wrap",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px", flexWrap: "wrap" }}>
                <input type="text" placeholder="Search by name or time..."
                    value={filterText} onChange={(e) => setFilterText(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", minWidth: "200px", fontSize: "13px", outline: "none", flex: 1 }}
                />
                {filterText && (
                    <button onClick={() => setFilterText("")} style={{
                        padding: "8px 12px", background: "#ef4444", color: "#fff",
                        border: "none", borderRadius: "6px", cursor: "pointer",
                        fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap",
                    }}>✕ Clear</button>
                )}
            </div>
            <button onClick={() => { setEditData(null); setModalOpen(true); }} style={{
                padding: "8px 20px", background: "#7c3aed", color: "#fff",
                border: "none", borderRadius: "6px", cursor: "pointer",
                fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap",
            }}>+ Add Game</button>
        </div>
    );

    const SkeletonLoader = () => (
        <div style={{ width: "100%" }}>
            {[...Array(10)].map((_, i) => <GameSkeleton key={i} />)}
        </div>
    );

    const customStyles = {
        headRow:   { style: { backgroundColor: "#7c3aed", minHeight: "46px" } },
        headCells: { style: { backgroundColor: "#7c3aed", color: "#ffffff", fontWeight: "700", fontSize: "13px", paddingLeft: "10px", paddingRight: "10px" } },
        rows:      { style: { fontSize: "13px", minHeight: "54px" }, highlightOnHoverStyle: { backgroundColor: "#f5f3ff" }, stripedStyle: { backgroundColor: "#fafafa" } },
        cells:     { style: { paddingLeft: "10px", paddingRight: "10px" } },
        pagination: { style: { borderTop: "1px solid #e5e7eb", minHeight: "50px" } },
    };

    if (isError) {
        return (
            <main style={{ padding: "20px" }}>
                <div style={{ color: "#dc2626", padding: "40px", textAlign: "center", background: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca" }}>
                    <h3 style={{ marginBottom: "10px" }}>Error loading games</h3>
                    <p>{error?.data?.message || error?.message || "Something went wrong"}</p>
                    <button onClick={() => window.location.reload()} style={{ marginTop: "15px", padding: "10px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                        Retry
                    </button>
                </div>
            </main>
        );
    }

    return (
        <>
            <style jsx global>{`
                @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
                .sl-table .rdt_TableHead .rdt_TableHeadRow { background-color: #7c3aed !important; min-height: 46px !important; }
                .sl-table .rdt_TableHead .rdt_TableHeadRow .rdt_TableCol { background-color: #7c3aed !important; color: #ffffff !important; font-weight: 700 !important; font-size: 13px !important; }
                .sl-table .rdt_TableHead .rdt_TableHeadRow .col-header { color: #ffffff !important; }
                .sl-table .rdt_TableCol_Sortable svg { fill: rgba(255,255,255,0.8) !important; }
                @media (max-width: 600px) {
                    .sl-table .rdt_TableCell, .sl-table .rdt_TableCol { padding-left: 6px !important; padding-right: 6px !important; font-size: 12px !important; }
                }
            `}</style>

            <main style={{ padding: "9px", minHeight: "100vh", overflow: "auto" }}>
                <div className="sl-table" style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "visible" }}>
                    <DataTable
                        title={
                            <div style={{ padding: "8px 0", position: "relative", right: "12px" }}>
                                <span style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>Game Name List</span>
                            </div>
                        }
                        columns={columns}
                        data={filteredData}
                        striped
                        pagination
                        highlightOnHover
                        subHeader
                        subHeaderComponent={subHeaderComponent}
                        paginationRowsPerPageOptions={[10, 30, 50, 100]}
                        paginationPerPage={rowsPerPage}
                        onChangeRowsPerPage={(n) => setRowsPerPage(n)}
                        progressPending={isLoading}
                        progressComponent={<SkeletonLoader />}
                        responsive
                        customStyles={customStyles}
                        noDataComponent={
                            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                                <span style={{ fontSize: "48px", display: "block", marginBottom: "10px" }}>🎮</span>
                                <p>No games found</p>
                                {filterText && (
                                    <button onClick={() => setFilterText("")} style={{ marginTop: "10px", padding: "8px 16px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                        Clear Filter
                                    </button>
                                )}
                            </div>
                        }
                    />
                </div>
            </main>

            <GameModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditData(null); }}
                editData={editData}
            />
        </>
    );
}