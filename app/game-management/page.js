import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useGetGameSchedulesQuery, useAddGameMutation, useUpdateGameMutation, useUpdateGameScheduleMutation, useToggleScheduleStatusMutation, } from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";
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
                    background: "#eef2ff", borderRadius: "8px",
                    borderTop: "2px solid #6366f1", borderBottom: "2px solid #6366f1",
                    pointerEvents: "none", zIndex: 1,
                } }), _jsxs("div", { ref: listRef, style: {
                    height: ITEM_H * 3, overflowY: "scroll",
                    scrollbarWidth: "none", msOverflowStyle: "none", width: "100%",
                }, children: [_jsx("div", { style: { height: ITEM_H } }), items.map((item, i) => (_jsx("div", { onClick: () => onSelect(i), style: {
                            height: ITEM_H, display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "16px",
                            fontWeight: i === selectedIndex ? 700 : 400,
                            color: i === selectedIndex ? "#6366f1" : "#6b7280",
                            cursor: "pointer", transition: "all 0.15s",
                            position: "relative", zIndex: 2, userSelect: "none",
                        }, children: item }, i))), _jsx("div", { style: { height: ITEM_H } })] }), _jsx("div", { style: { position: "absolute", top: 0, left: 0, right: 0, height: ITEM_H, background: "linear-gradient(to bottom, rgba(255,255,255,0.95), transparent)", pointerEvents: "none", zIndex: 3 } }), _jsx("div", { style: { position: "absolute", bottom: 0, left: 0, right: 0, height: ITEM_H, background: "linear-gradient(to top, rgba(255,255,255,0.95), transparent)", pointerEvents: "none", zIndex: 3 } })] }));
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
    return `${String(h).padStart(2, "0")}:${String(minIdx).padStart(2, "0")}`;
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
    const handleConfirm = () => { onChange(to24(hourIdx, minIdx, periodIdx)); setOpen(false); };
    const displayLabel = value
        ? (() => { const { hourIdx: h, minIdx: m, periodIdx: p } = parse24(value); return `${HOURS[h]}:${MINUTES[m]} ${PERIODS[p]}`; })()
        : placeholder;
    return (_jsxs("div", { ref: wrapRef, style: { position: "relative", width: "100%" }, children: [_jsxs("button", { type: "button", onClick: () => setOpen((p) => !p), style: {
                    width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px",
                    background: "#fff", fontSize: "13px", color: value ? "#1f2937" : "#9ca3af",
                    textAlign: "left", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    boxSizing: "border-box", outline: "none",
                }, children: [_jsxs("span", { children: ["\uD83D\uDD50 ", displayLabel] }), _jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "#6b7280", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: open ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }, children: _jsx("polyline", { points: "6 9 12 15 18 9" }) })] }), open && (_jsxs("div", { style: {
                    position: "absolute", top: "calc(100% + 6px)", left: 0,
                    background: "#fff", border: "1px solid #e5e7eb",
                    borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                    zIndex: 9999, padding: "12px 16px 14px", minWidth: "220px",
                }, children: [_jsx("p", { style: { margin: "0 0 10px", fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Select Time" }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }, children: [_jsx(ScrollColumn, { items: HOURS, selectedIndex: hourIdx, onSelect: setHourIdx, width: 56 }), _jsx("span", { style: { fontSize: "20px", fontWeight: 700, color: "#374151", lineHeight: 1, paddingBottom: "2px" }, children: ":" }), _jsx(ScrollColumn, { items: MINUTES, selectedIndex: minIdx, onSelect: setMinIdx, width: 56 }), _jsx(ScrollColumn, { items: PERIODS, selectedIndex: periodIdx, onSelect: setPeriodIdx, width: 52 })] }), _jsx("button", { type: "button", onClick: handleConfirm, style: {
                            marginTop: "12px", width: "100%", padding: "9px",
                            background: "#6366f1", color: "#fff", border: "none",
                            borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                        }, children: "Set Time" })] }))] }));
}
// ─────────────────────────────────────────────────────────────────────────────
// ADD GAME MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AddGameModal({ open, onClose }) {
    const [addGame, { isLoading: isSaving }] = useAddGameMutation();
    const [form, setForm] = useState({ game_name: "", game_name_hindi: "", open_time: "", close_time: "" });
    const border = "#e5e7eb";
    const primary = "#6366f1";
    const textMuted = "#6b7280";
    const text = "#1f2937";
    useEffect(() => {
        if (open)
            setForm({ game_name: "", game_name_hindi: "", open_time: "", close_time: "" });
    }, [open]);
    const handleChange = (e) => setForm((p) => (Object.assign(Object.assign({}, p), { [e.target.name]: e.target.value })));
    const handleSubmit = async (e) => {
        var _a;
        e.preventDefault();
        if (!form.game_name.trim() || !form.game_name_hindi.trim() || !form.open_time || !form.close_time) {
            toast.error("All fields are required");
            return;
        }
        try {
            const res = await addGame(form).unwrap();
            toast.success((res === null || res === void 0 ? void 0 : res.message) || "Game added successfully!");
            onClose();
        }
        catch (err) {
            toast.error(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || "Failed to add game");
        }
    };
    if (!open)
        return null;
    const inputStyle = {
        width: "100%", padding: "10px 12px", border: `1px solid ${border}`,
        borderRadius: "8px", fontSize: "14px", outline: "none",
        boxSizing: "border-box", color: text, transition: "border-color 0.2s",
    };
    const labelStyle = {
        display: "block", marginBottom: "6px", fontSize: "12px",
        fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.4px",
    };
    return (_jsx("div", { style: {
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, backdropFilter: "blur(3px)", padding: "16px",
        }, onClick: onClose, children: _jsxs("div", { style: {
                background: "#fff", borderRadius: "16px",
                width: "100%", maxWidth: "480px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
                maxHeight: "90vh", overflowY: "auto",
            }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: {
                        padding: "20px 24px",
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        borderRadius: "16px 16px 0 0",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }, children: [_jsxs("div", { children: [_jsx("h2", { style: { margin: 0, fontSize: "17px", fontWeight: 700, color: "#fff" }, children: "Add New Game" }), _jsx("p", { style: { margin: "2px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.75)" }, children: "POST /api/addgame \u2014 form-data" })] }), _jsx("button", { onClick: onClose, disabled: isSaving, style: {
                                background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                                width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer",
                                fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
                            }, children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSubmit, style: { padding: "24px" }, children: [_jsxs("div", { style: { marginBottom: "16px" }, children: [_jsx("label", { style: labelStyle, children: "game_name" }), _jsx("input", { name: "game_name", value: form.game_name, onChange: handleChange, placeholder: "e.g. Kalyan Night", autoComplete: "off", style: inputStyle, onFocus: (e) => e.target.style.borderColor = primary, onBlur: (e) => e.target.style.borderColor = border })] }), _jsxs("div", { style: { marginBottom: "16px" }, children: [_jsx("label", { style: labelStyle, children: "game_name_hindi" }), _jsx("input", { name: "game_name_hindi", value: form.game_name_hindi, onChange: handleChange, placeholder: "e.g. \u0915\u0932\u094D\u092F\u093E\u0923 \u0928\u093E\u0908\u091F", autoComplete: "off", style: inputStyle, onFocus: (e) => e.target.style.borderColor = primary, onBlur: (e) => e.target.style.borderColor = border })] }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }, children: [_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "open_time" }), _jsx(TimePicker, { value: form.open_time, onChange: (val) => setForm((p) => (Object.assign(Object.assign({}, p), { open_time: val }))), placeholder: "Open time" }), form.open_time && _jsxs("p", { style: { margin: "4px 0 0", fontSize: "11px", color: "#9ca3af" }, children: ["Sends: ", _jsx("strong", { style: { color: "#374151" }, children: form.open_time })] })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "close_time" }), _jsx(TimePicker, { value: form.close_time, onChange: (val) => setForm((p) => (Object.assign(Object.assign({}, p), { close_time: val }))), placeholder: "Close time" }), form.close_time && _jsxs("p", { style: { margin: "4px 0 0", fontSize: "11px", color: "#9ca3af" }, children: ["Sends: ", _jsx("strong", { style: { color: "#374151" }, children: form.close_time })] })] })] }), _jsxs("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end" }, children: [_jsx("button", { type: "button", onClick: onClose, disabled: isSaving, style: {
                                        padding: "10px 18px", background: "#f3f4f6", color: text,
                                        border: `1px solid ${border}`, borderRadius: "8px",
                                        cursor: isSaving ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 500,
                                    }, children: "Cancel" }), _jsx("button", { type: "submit", disabled: isSaving, style: {
                                        padding: "10px 24px",
                                        background: isSaving ? "#a5b4fc" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                        color: "#fff", border: "none", borderRadius: "8px",
                                        cursor: isSaving ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600,
                                        display: "flex", alignItems: "center", gap: "6px",
                                    }, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("span", { style: { width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" } }), "Adding..."] })) : "Add Game" })] })] })] }) }));
}
// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function GameManagement() {
    var _a;
    const { data: scheduleData, isLoading, isError, error, refetch } = useGetGameSchedulesQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [updateGame, { isLoading: isUpdatingGame }] = useUpdateGameMutation();
    const [updateGameSchedule, { isLoading: isUpdating }] = useUpdateGameScheduleMutation();
    const [toggleScheduleStatus, { isLoading: isToggling }] = useToggleScheduleStatusMutation();
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingGameId, setUpdatingGameId] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editingGameId, setEditingGameId] = useState(null);
    const [gameEditForm, setGameEditForm] = useState({ game_name: "", game_name_hindi: "" });
    const [editingScheduleId, setEditingScheduleId] = useState(null);
    const [editForm, setEditForm] = useState({ open_time: "", close_time: "" });
    const allGames = (scheduleData === null || scheduleData === void 0 ? void 0 : scheduleData.data) || [];
    const games = allGames.filter((g) => g.game_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const theme = {
        primary: "#6366f1", primaryLight: "#eef2ff",
        text: "#1f2937", textMuted: "#6b7280", border: "#e5e7eb",
        success: "#22c55e", warning: "#f59e0b", danger: "#ef4444",
        cardBg: "#ffffff", pageBg: "#f8fafc",
    };
    const formatTime = (timeStr) => {
        if (!timeStr)
            return "--:--";
        const [hours, minutes] = timeStr.split(":");
        let hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };
    const handleEditClick = (schedule) => { var _a, _b; setEditingScheduleId(schedule.schedule_id); setEditForm({ open_time: ((_a = schedule.open_time) === null || _a === void 0 ? void 0 : _a.slice(0, 5)) || "", close_time: ((_b = schedule.close_time) === null || _b === void 0 ? void 0 : _b.slice(0, 5)) || "" }); };
    const handleCancelEdit = () => { setEditingScheduleId(null); setEditForm({ open_time: "", close_time: "" }); };
    const handleGameEditClick = (game) => { setEditingGameId(game.game_id); setGameEditForm({ game_name: game.game_name || "", game_name_hindi: game.game_name_hindi || "" }); };
    const handleCancelGameEdit = () => { setEditingGameId(null); setGameEditForm({ game_name: "", game_name_hindi: "" }); };
    const handleUpdateSchedule = async (scheduleId) => {
        var _a;
        if (!editForm.open_time || !editForm.close_time) {
            toast.error("Please select both open and close times");
            return;
        }
        try {
            await updateGameSchedule({ id: scheduleId, open_time: editForm.open_time, close_time: editForm.close_time }).unwrap();
            toast.success("Schedule updated successfully");
            setEditingScheduleId(null);
        }
        catch (err) {
            toast.error(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || "Failed to update schedule");
        }
    };
    const handleToggleStatus = async (scheduleId, currentStatus) => {
        var _a;
        const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
        if (!window.confirm(`Change status to ${newStatus}?`))
            return;
        try {
            await toggleScheduleStatus(scheduleId).unwrap();
            toast.success(`Status changed to ${newStatus}`);
        }
        catch (err) {
            toast.error(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || "Failed to toggle status");
        }
    };
    const getGameSchedules = (game) => !(game === null || game === void 0 ? void 0 : game.schedule) ? [] : weekDays.flatMap((day) => { var _a; return (((_a = game.schedule) === null || _a === void 0 ? void 0 : _a[day]) || []).filter(Boolean); });
    const getGameLevelIsActive = (game) => {
        if (typeof (game === null || game === void 0 ? void 0 : game.status) === "string" && game.status.trim())
            return game.status === "Active";
        if (typeof (game === null || game === void 0 ? void 0 : game.status) === "number")
            return game.status === 1;
        if (typeof (game === null || game === void 0 ? void 0 : game.status) === "boolean")
            return game.status;
        return null;
    };
    const getGameStatusSummary = (game) => {
        const schedules = getGameSchedules(game);
        const total = schedules.length;
        const activeCount = schedules.filter((s) => s.status === "Active").length;
        return { schedules, total, activeCount, allActive: total > 0 && activeCount === total, someActive: activeCount > 0, isMixed: activeCount > 0 && activeCount < total };
    };
    const resolveGameStatusForUpdate = (game, fallbackStatus) => {
        if (fallbackStatus)
            return fallbackStatus;
        if (typeof (game === null || game === void 0 ? void 0 : game.status) === "string" && game.status.trim())
            return game.status === "Active" ? "Active" : "Inactive";
        if (typeof (game === null || game === void 0 ? void 0 : game.status) === "number")
            return game.status === 1 ? "Active" : "Inactive";
        if (typeof (game === null || game === void 0 ? void 0 : game.status) === "boolean")
            return game.status ? "Active" : "Inactive";
        return getGameStatusSummary(game).allActive ? "Active" : "Inactive";
    };
    const getExplicitGameStatusForUpdate = (game) => {
        if (typeof (game === null || game === void 0 ? void 0 : game.status) === "string" && game.status.trim())
            return game.status === "Active" ? "Active" : "Inactive";
        if (typeof (game === null || game === void 0 ? void 0 : game.status) === "number")
            return game.status === 1 ? "Active" : "Inactive";
        if (typeof (game === null || game === void 0 ? void 0 : game.status) === "boolean")
            return game.status ? "Active" : "Inactive";
        return undefined;
    };
    const submitGameUpdate = async (game, overrides = {}, successMessage = "Game updated successfully") => {
        var _a, _b, _c;
        const resolvedStatus = overrides.status !== undefined ? resolveGameStatusForUpdate(game, overrides.status) : getExplicitGameStatusForUpdate(game);
        const payload = { id: game.game_id, game_name: (_a = overrides.game_name) !== null && _a !== void 0 ? _a : game.game_name, game_name_hindi: (_b = overrides.game_name_hindi) !== null && _b !== void 0 ? _b : game.game_name_hindi, status: resolvedStatus };
        setUpdatingGameId(game.game_id);
        try {
            await updateGame(payload).unwrap();
            toast.success(successMessage);
            return true;
        }
        catch (err) {
            toast.error(((_c = err === null || err === void 0 ? void 0 : err.data) === null || _c === void 0 ? void 0 : _c.message) || "Failed to update game");
            return false;
        }
        finally {
            setUpdatingGameId(null);
        }
    };
    const handleToggleGameStatus = async (game) => {
        var _a;
        const gameLevelIsActive = getGameLevelIsActive(game);
        const { allActive } = getGameStatusSummary(game);
        const isCurrentlyActive = gameLevelIsActive !== null && gameLevelIsActive !== void 0 ? gameLevelIsActive : allActive;
        const targetStatus = isCurrentlyActive ? "Inactive" : "Active";
        if (!window.confirm(`Change ${game.game_name} status to ${targetStatus}?`))
            return;
        const isUpdated = await submitGameUpdate(game, { status: targetStatus }, `Game status changed to ${targetStatus}`);
        if (!isUpdated)
            return;
        try {
            const refreshedResult = await refetch();
            const refreshedGames = ((_a = refreshedResult === null || refreshedResult === void 0 ? void 0 : refreshedResult.data) === null || _a === void 0 ? void 0 : _a.data) || [];
            const refreshedGame = refreshedGames.find((item) => { var _a; return String((_a = item === null || item === void 0 ? void 0 : item.game_id) !== null && _a !== void 0 ? _a : item === null || item === void 0 ? void 0 : item.id) === String(game.game_id); });
            const sourceGame = refreshedGame || game;
            const schedulesToSync = getGameSchedules(sourceGame).filter((s) => s.status !== targetStatus);
            if (schedulesToSync.length === 0)
                return;
            let synced = 0, failed = 0;
            for (const schedule of schedulesToSync) {
                try {
                    await toggleScheduleStatus(schedule.schedule_id).unwrap();
                    synced += 1;
                }
                catch (_b) {
                    failed += 1;
                }
            }
            if (failed > 0)
                toast.error(`${failed} day toggle${failed > 1 ? "s" : ""} failed to sync`);
            else if (synced > 0)
                toast.success(`Synced ${synced} day toggle${synced > 1 ? "s" : ""}`);
        }
        catch (err) {
            console.error("Refetch failed:", err);
        }
    };
    const handleUpdateGameNames = async (game) => {
        const game_name = (gameEditForm.game_name || "").trim();
        const game_name_hindi = (gameEditForm.game_name_hindi || "").trim();
        if (!game_name || !game_name_hindi) {
            toast.error("Please enter both game name and game name hindi");
            return;
        }
        const isUpdated = await submitGameUpdate(game, { game_name, game_name_hindi }, "Game name updated successfully");
        if (isUpdated)
            handleCancelGameEdit();
    };
    if (isLoading)
        return _jsx("div", { style: { padding: "24px", textAlign: "center", color: theme.textMuted }, children: "Loading schedules..." });
    if (isError)
        return _jsxs("div", { style: { padding: "24px", textAlign: "center", color: theme.danger }, children: ["Error loading games: ", ((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.message) || "Unknown error"] });
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }` }), _jsxs("main", { style: { padding: "16px", minHeight: "100vh", backgroundColor: theme.pageBg, paddingBottom: "73px" }, children: [_jsxs("div", { style: { marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: "20px", fontWeight: "600", color: theme.text, margin: 0 }, children: "Game Management" }), _jsx("p", { style: { fontSize: "14px", color: theme.textMuted, marginTop: "4px", marginBottom: 0 }, children: "Manage game schedules and timings" })] }), _jsx("button", { onClick: () => setAddModalOpen(true), style: {
                                    padding: "10px 20px",
                                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                    color: "#fff", border: "none", borderRadius: "10px",
                                    cursor: "pointer", fontSize: "13px", fontWeight: 600,
                                    display: "flex", alignItems: "center", gap: "6px",
                                    boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                                }, children: "Add Game" })] }), _jsx("div", { style: { marginBottom: "20px" }, children: _jsx("input", { type: "text", placeholder: "Search game by name...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), style: { padding: "10px 14px", borderRadius: "8px", border: `1px solid ${theme.border}`, fontSize: "14px", width: "100%", maxWidth: "400px", outline: "none" }, onFocus: (e) => e.target.style.borderColor = theme.primary, onBlur: (e) => e.target.style.borderColor = theme.border }) }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }, children: games.map((game) => {
                            const gameStatus = getGameStatusSummary(game);
                            const gameLevelIsActive = getGameLevelIsActive(game);
                            const isGameAllActive = gameLevelIsActive !== null && gameLevelIsActive !== void 0 ? gameLevelIsActive : gameStatus.allActive;
                            const isGameMixed = gameStatus.isMixed;
                            const isEditingGame = editingGameId === game.game_id;
                            const isGameHeaderUpdating = isUpdatingGame && updatingGameId === game.game_id;
                            const isGameToggleDisabled = isGameHeaderUpdating || isToggling;
                            const isDayToggleDisabled = isToggling || isGameHeaderUpdating;
                            return (_jsxs("div", { style: { backgroundColor: theme.cardBg, borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: `1px solid ${theme.border}`, overflow: "hidden", display: "flex", flexDirection: "column" }, children: [_jsxs("div", { style: { padding: "16px", borderBottom: `1px solid ${theme.border}`, backgroundColor: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("div", { children: [_jsx("h3", { style: { fontSize: "16px", fontWeight: "600", color: theme.text, margin: 0 }, children: game.game_name }), !!game.game_name_hindi && _jsx("div", { style: { fontSize: "12px", color: theme.textMuted, marginTop: "4px", lineHeight: 1.3 }, children: game.game_name_hindi }), _jsxs("span", { style: { fontSize: "12px", color: theme.textMuted, backgroundColor: "#e5e7eb", padding: "2px 6px", borderRadius: "4px", marginTop: "4px", display: "inline-block" }, children: ["ID: ", game.game_id] }), _jsx("button", { onClick: () => isEditingGame ? handleCancelGameEdit() : handleGameEditClick(game), disabled: isGameHeaderUpdating, style: { marginLeft: "8px", backgroundColor: "transparent", color: theme.primary, border: "none", fontSize: "12px", cursor: isGameHeaderUpdating ? "not-allowed" : "pointer", fontWeight: "500", padding: 0, opacity: isGameHeaderUpdating ? 0.6 : 1 }, children: isEditingGame ? "Cancel Name Edit" : "Edit Name" })] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [_jsx("span", { style: { fontSize: "11px", fontWeight: "600", color: isGameMixed ? theme.warning : (isGameAllActive ? theme.success : theme.danger) }, children: isGameMixed ? "Mixed" : (isGameAllActive ? "All Active" : "All Inactive") }), _jsxs("label", { style: { position: "relative", display: "inline-block", width: "38px", height: "22px" }, title: "Toggle all days", children: [_jsx("input", { type: "checkbox", checked: isGameAllActive, onChange: () => handleToggleGameStatus(game), disabled: isGameToggleDisabled, style: { opacity: 0, width: 0, height: 0 } }), _jsx("span", { style: { position: "absolute", cursor: isGameToggleDisabled ? "not-allowed" : "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isGameAllActive ? theme.success : (isGameMixed ? theme.warning : "#ccc"), borderRadius: "34px", transition: ".4s", opacity: isGameToggleDisabled ? 0.65 : 1 }, children: _jsx("span", { style: { position: "absolute", height: "16px", width: "16px", left: isGameAllActive ? "18px" : "4px", bottom: "3px", backgroundColor: "white", borderRadius: "50%", transition: ".4s" } }) })] })] })] }), isEditingGame && (_jsx("div", { style: { padding: "12px 16px", borderBottom: `1px solid ${theme.border}`, backgroundColor: "#fff" }, children: _jsxs("div", { style: { display: "grid", gap: "10px" }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: "block", fontSize: "11px", color: theme.textMuted, marginBottom: "4px" }, children: "Game Name" }), _jsx("input", { type: "text", value: gameEditForm.game_name, onChange: (e) => setGameEditForm((p) => (Object.assign(Object.assign({}, p), { game_name: e.target.value }))), disabled: isGameHeaderUpdating, style: { width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, fontSize: "13px", outline: "none", boxSizing: "border-box" } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: "block", fontSize: "11px", color: theme.textMuted, marginBottom: "4px" }, children: "Game Name (Hindi)" }), _jsx("input", { type: "text", value: gameEditForm.game_name_hindi, onChange: (e) => setGameEditForm((p) => (Object.assign(Object.assign({}, p), { game_name_hindi: e.target.value }))), disabled: isGameHeaderUpdating, style: { width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, fontSize: "13px", outline: "none", boxSizing: "border-box" } })] }), _jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px" }, children: [_jsx("button", { onClick: handleCancelGameEdit, disabled: isGameHeaderUpdating, style: { backgroundColor: "#f3f4f6", color: theme.text, border: `1px solid ${theme.border}`, padding: "6px 10px", borderRadius: "6px", cursor: isGameHeaderUpdating ? "not-allowed" : "pointer", fontSize: "12px" }, children: "Cancel" }), _jsx("button", { onClick: () => handleUpdateGameNames(game), disabled: isGameHeaderUpdating, style: { backgroundColor: theme.primary, color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: isGameHeaderUpdating ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "600", opacity: isGameHeaderUpdating ? 0.7 : 1 }, children: isGameHeaderUpdating ? "Saving..." : "Save Name" })] })] }) })), _jsx("div", { style: { padding: "12px 16px", flex: 1 }, children: weekDays.map((day, index) => {
                                            var _a;
                                            const daySchedule = (((_a = game.schedule) === null || _a === void 0 ? void 0 : _a[day]) || [])[0];
                                            if (!daySchedule)
                                                return null;
                                            const isEditing = editingScheduleId === daySchedule.schedule_id;
                                            const isActive = daySchedule.status === "Active";
                                            return (_jsxs("div", { style: { padding: "12px 0", borderBottom: index < weekDays.length - 1 ? `1px solid #f3f4f6` : "none" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px" }, children: [_jsx("span", { style: { fontSize: "14px", fontWeight: "500", color: theme.text }, children: day }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [_jsx("span", { style: { fontSize: "11px", fontWeight: "600", color: isActive ? theme.success : theme.danger }, children: daySchedule.status }), _jsxs("label", { style: { position: "relative", display: "inline-block", width: "34px", height: "20px" }, children: [_jsx("input", { type: "checkbox", checked: isActive, onChange: () => handleToggleStatus(daySchedule.schedule_id, daySchedule.status), disabled: isDayToggleDisabled, style: { opacity: 0, width: 0, height: 0 } }), _jsx("span", { style: { position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isActive ? theme.success : "#ccc", borderRadius: "34px", transition: ".4s" }, children: _jsx("span", { style: { position: "absolute", height: "14px", width: "14px", left: isActive ? "16px" : "4px", bottom: "3px", backgroundColor: "white", borderRadius: "50%", transition: ".4s" } }) })] })] })] }), isEditing ? (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("span", { style: { fontSize: "10px", color: theme.textMuted, display: "block" }, children: "Open" }), _jsx("input", { type: "time", value: editForm.open_time, onChange: (e) => setEditForm(Object.assign(Object.assign({}, editForm), { open_time: e.target.value })), style: { width: "100%", padding: "4px", fontSize: "12px", border: `1px solid ${theme.border}`, borderRadius: "4px" } })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("span", { style: { fontSize: "10px", color: theme.textMuted, display: "block" }, children: "Close" }), _jsx("input", { type: "time", value: editForm.close_time, onChange: (e) => setEditForm(Object.assign(Object.assign({}, editForm), { close_time: e.target.value })), style: { width: "100%", padding: "4px", fontSize: "12px", border: `1px solid ${theme.border}`, borderRadius: "4px" } })] }), _jsxs("div", { style: { display: "flex", gap: "4px", alignSelf: "flex-end" }, children: [_jsx("button", { onClick: () => handleUpdateSchedule(daySchedule.schedule_id), disabled: isUpdating, title: "Save", style: { backgroundColor: theme.success, color: "white", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }, children: "\u2714\uFE0F" }), _jsx("button", { onClick: handleCancelEdit, title: "Cancel", style: { backgroundColor: theme.danger, color: "white", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }, children: "\u2715" })] })] })) : (_jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [_jsx("span", { style: { fontSize: "12px", color: "#15803d", backgroundColor: "#dcfce7", padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }, children: formatTime(daySchedule === null || daySchedule === void 0 ? void 0 : daySchedule.open_time) }), _jsx("span", { style: { fontSize: "12px", color: theme.textMuted }, children: "-" }), _jsx("span", { style: { fontSize: "12px", color: "#b91c1c", backgroundColor: "#fee2e2", padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }, children: formatTime(daySchedule === null || daySchedule === void 0 ? void 0 : daySchedule.close_time) })] }), _jsx("button", { onClick: () => handleEditClick(daySchedule), style: { backgroundColor: "transparent", color: theme.primary, border: "none", fontSize: "12px", cursor: "pointer", fontWeight: "500", padding: "4px" }, children: "Edit" })] }))] }, day));
                                        }) })] }, game.game_id));
                        }) }), !isLoading && games.length === 0 && (_jsx("div", { style: { textAlign: "center", padding: "40px", color: theme.textMuted }, children: "No games found." }))] }), _jsx(AddGameModal, { open: addModalOpen, onClose: () => setAddModalOpen(false) })] }));
}
