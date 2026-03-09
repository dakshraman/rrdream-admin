import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useGetGamesQuery, useDeclareResultMutation, useDeleteResultMutation, useCheckWinnerMutation, useGetDeclaredResultsQuery } from "@/store/backendSlice/apiAPISlice";
export default function DeclareResult() {
    var _a;
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        result_date: today,
        game_id: "",
        session: "",
        pana: "",
        digit: ""
    });
    const [selectedGame, setSelectedGame] = useState(null);
    const [showGameDropdown, setShowGameDropdown] = useState(false);
    const [showSessionDropdown, setShowSessionDropdown] = useState(false);
    const [showWinnersModal, setShowWinnersModal] = useState(false);
    const [winnersData, setWinnersData] = useState(null); // { winners: [], message: "" }
    const [deletingResultId, setDeletingResultId] = useState(null);
    const { data: gamesResponse, isLoading: gamesLoading } = useGetGamesQuery();
    const [declareResult, { isLoading: declaring, isSuccess, isError, error }] = useDeclareResultMutation();
    const [deleteResult] = useDeleteResultMutation();
    const [checkWinner, { isLoading: checkingWinners }] = useCheckWinnerMutation();
    const { data: declaredResultsResponse, isLoading: declaredResultsLoading, isFetching: declaredResultsFetching, isError: isDeclaredResultsError, error: declaredResultsError, refetch: refetchDeclaredResults } = useGetDeclaredResultsQuery(undefined, { refetchOnMountOrArgChange: true });
    const gamesList = (gamesResponse === null || gamesResponse === void 0 ? void 0 : gamesResponse.games) || (gamesResponse === null || gamesResponse === void 0 ? void 0 : gamesResponse.data) || [];
    const sessions = ["Open", "Close"];
    const declaredResultsListRaw = Array.isArray(declaredResultsResponse === null || declaredResultsResponse === void 0 ? void 0 : declaredResultsResponse.data)
        ? declaredResultsResponse.data
        : [];
    const declaredResultsList = formData.result_date
        ? declaredResultsListRaw.filter((item) => (item === null || item === void 0 ? void 0 : item.result_date) === formData.result_date)
        : declaredResultsListRaw;
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setShowGameDropdown(false);
                setShowSessionDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    useEffect(() => {
        if (isSuccess) {
            alert("Result declared successfully!");
            setFormData({ result_date: today, game_id: "", session: "", pana: "", digit: "" });
            setSelectedGame(null);
            refetchDeclaredResults();
        }
    }, [isSuccess, today, refetchDeclaredResults]);
    useEffect(() => {
        var _a;
        if (isError) {
            alert(((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.message) || "Failed to declare result");
        }
    }, [isError, error]);
    const handleGameSelect = (game) => {
        setSelectedGame(game);
        setFormData(prev => (Object.assign(Object.assign({}, prev), { game_id: game.id, session: "" })));
        setShowGameDropdown(false);
    };
    const handleSessionSelect = (session) => {
        setFormData(prev => (Object.assign(Object.assign({}, prev), { session })));
        setShowSessionDropdown(false);
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => (Object.assign(Object.assign({}, prev), { [field]: value })));
    };
    const sendAutoResultNotification = async ({ title, body }) => {
        try {
            const response = await fetch("/api/notifications/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, body }),
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                console.error("Auto FCM send failed:", (payload === null || payload === void 0 ? void 0 : payload.message) || response.statusText);
            }
        }
        catch (err) {
            console.error("Auto FCM send error:", err);
        }
    };
    const validate = () => {
        if (!formData.result_date) {
            alert("Please select a date");
            return false;
        }
        if (!formData.game_id) {
            alert("Please select a game");
            return false;
        }
        if (!formData.session) {
            alert("Please select a session");
            return false;
        }
        if (!formData.pana) {
            alert("Please enter Pana (3 digits)");
            return false;
        }
        if (formData.pana.length !== 3) {
            alert("Pana must be exactly 3 digits");
            return false;
        }
        if (!formData.digit) {
            alert("Please enter Digit (0-9)");
            return false;
        }
        if (!/^[0-9]$/.test(formData.digit)) {
            alert("Digit must be a single number from 0 to 9");
            return false;
        }
        return true;
    };
    const handleDeclareResult = async () => {
        if (!validate())
            return;
        try {
            const payload = Object.assign({}, formData);
            await declareResult(payload).unwrap();
            const gameName = (selectedGame === null || selectedGame === void 0 ? void 0 : selectedGame.product_name) ||
                (selectedGame === null || selectedGame === void 0 ? void 0 : selectedGame.game_name_hindi) ||
                `Game #${payload.game_id}`;
            void sendAutoResultNotification({
                title: `${gameName} Result Declared`,
                body: `${payload.session} result: ${payload.pana}-${payload.digit} (${payload.result_date})`,
            });
        }
        catch (err) { }
    };
    const handleCheckWinners = async () => {
        var _a;
        if (!validate())
            return;
        try {
            const response = await checkWinner(formData).unwrap();
            console.log("Winners Response:", response);
            // response = { status: true, message: "...", winners: [...] }
            setWinnersData({
                winners: (response === null || response === void 0 ? void 0 : response.winners) || [],
                message: (response === null || response === void 0 ? void 0 : response.message) || ""
            });
            setShowWinnersModal(true);
        }
        catch (err) {
            alert(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || "Failed to fetch winners");
        }
    };
    const formatTime = (time) => {
        if (!time)
            return "";
        return time.slice(0, 5);
    };
    const theme = {
        primary: "#6366f1",
        primaryLight: "#eef2ff",
        text: "#1f2937",
        textMuted: "#6b7280",
        border: "#e5e7eb",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
    };
    const getGameTypeBadgeColor = (type) => {
        const map = {
            "single": { bg: "#dbeafe", color: "#1d4ed8" },
            "jodi": { bg: "#fce7f3", color: "#be185d" },
            "single pana": { bg: "#d1fae5", color: "#047857" },
            "double pana": { bg: "#fef3c7", color: "#b45309" },
            "triple pana": { bg: "#ede9fe", color: "#6d28d9" },
            "double digit": { bg: "#fef3c7", color: "#b45309" },
        };
        return map[type === null || type === void 0 ? void 0 : type.toLowerCase()] || { bg: "#f3f4f6", color: "#374151" };
    };
    const renderSessionResult = (sessionData) => {
        if (!sessionData) {
            return (_jsx("span", { style: {
                    color: theme.textMuted,
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                    padding: "4px 8px",
                    borderRadius: "4px"
                }, children: "Pending" }));
        }
        return (_jsxs("span", { style: {
                fontSize: "12px",
                fontWeight: "600",
                color: theme.text,
                backgroundColor: "#eef2ff",
                border: `1px solid ${theme.border}`,
                padding: "4px 8px",
                borderRadius: "4px",
                fontFamily: "monospace"
            }, children: [sessionData.pana, "-", sessionData.digit] }));
    };
    const handleDeleteResult = async (resultId, sessionLabel, gameName) => {
        var _a;
        if (!resultId)
            return;
        const confirmed = window.confirm(`Delete ${sessionLabel} result for ${gameName || "this game"}?`);
        if (!confirmed)
            return;
        try {
            setDeletingResultId(resultId);
            const response = await deleteResult(resultId).unwrap();
            alert((response === null || response === void 0 ? void 0 : response.message) || "Result deleted successfully");
            refetchDeclaredResults();
        }
        catch (err) {
            alert(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || "Failed to delete result");
        }
        finally {
            setDeletingResultId(null);
        }
    };
    return (_jsxs("main", { style: { padding: "16px", minHeight: "100vh", backgroundColor: "#f8fafc" }, children: [_jsx("h1", { style: { fontSize: "18px", fontWeight: "600", color: theme.text, margin: "0 0 16px 0" }, children: "Declare Result" }), _jsx("div", { style: {
                    backgroundColor: "#fff", borderRadius: "8px",
                    padding: "20px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }, children: _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "14px" }, children: [_jsxs("div", { style: {
                                border: `1px solid ${theme.border}`, borderRadius: "6px",
                                padding: "12px 14px", cursor: "pointer", position: "relative", backgroundColor: "#fff"
                            }, onClick: () => { var _a, _b; return (_b = (_a = document.getElementById('date-input')).showPicker) === null || _b === void 0 ? void 0 : _b.call(_a); }, children: [_jsx("span", { style: { color: formData.result_date ? theme.primary : theme.textMuted, fontSize: "14px" }, children: formData.result_date ? `Select Date: ${formData.result_date}` : "Select Date" }), _jsx("input", { id: "date-input", type: "date", value: formData.result_date, onChange: (e) => handleInputChange('result_date', e.target.value), style: { position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" } })] }), _jsxs("div", { className: "dropdown-container", style: { position: "relative" }, children: [_jsxs("div", { onClick: (e) => { e.stopPropagation(); setShowGameDropdown(!showGameDropdown); setShowSessionDropdown(false); }, style: {
                                        border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "12px 14px",
                                        cursor: "pointer", display: "flex", justifyContent: "space-between",
                                        alignItems: "center", backgroundColor: "#fff"
                                    }, children: [_jsx("span", { style: { color: selectedGame ? theme.primary : theme.textMuted, fontSize: "14px" }, children: selectedGame
                                                ? `${selectedGame.product_name} (${formatTime(selectedGame.open_time)}-${formatTime(selectedGame.close_time)})`
                                                : "Select Game" }), _jsx("span", { style: {
                                                color: theme.primary,
                                                transform: showGameDropdown ? "rotate(180deg)" : "rotate(0deg)",
                                                transition: "transform 0.2s", fontSize: "10px"
                                            }, children: "\u25BC" })] }), showGameDropdown && (_jsx("div", { style: {
                                        position: "absolute", top: "100%", left: 0, right: 0,
                                        backgroundColor: "#fff", border: `1px solid ${theme.border}`,
                                        borderRadius: "6px", marginTop: "4px", maxHeight: "280px",
                                        overflowY: "auto", zIndex: 1000, boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
                                    }, children: gamesLoading ? (_jsx("div", { style: { padding: "16px", textAlign: "center", color: theme.textMuted }, children: "Loading games..." })) : gamesList.length === 0 ? (_jsx("div", { style: { padding: "16px", textAlign: "center", color: theme.textMuted }, children: "No games found" })) : (gamesList.map((game, index) => {
                                        const isSelected = (selectedGame === null || selectedGame === void 0 ? void 0 : selectedGame.id) === game.id;
                                        return (_jsxs("div", { onClick: () => handleGameSelect(game), style: {
                                                padding: "10px 14px", cursor: "pointer",
                                                borderBottom: index < gamesList.length - 1 ? "1px solid #f3f4f6" : "none",
                                                backgroundColor: isSelected ? theme.primaryLight : "#fff",
                                                display: "flex", justifyContent: "space-between",
                                                alignItems: "center", transition: "background-color 0.15s"
                                            }, onMouseEnter: (e) => { if (!isSelected)
                                                e.currentTarget.style.backgroundColor = "#f9fafb"; }, onMouseLeave: (e) => { if (!isSelected)
                                                e.currentTarget.style.backgroundColor = "#fff"; }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [_jsx("span", { style: {
                                                                backgroundColor: isSelected ? theme.primary : "#f3f4f6",
                                                                color: isSelected ? "#fff" : theme.textMuted,
                                                                padding: "3px 8px", borderRadius: "4px",
                                                                fontSize: "11px", fontWeight: "600",
                                                                minWidth: "28px", textAlign: "center"
                                                            }, children: game.id }), _jsxs("div", { children: [_jsx("p", { style: { margin: 0, fontSize: "13px", fontWeight: "500", color: isSelected ? theme.primary : theme.text }, children: game.product_name }), _jsx("p", { style: { margin: "1px 0 0", fontSize: "11px", color: theme.textMuted }, children: game.game_name_hindi })] })] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [_jsx("span", { style: { fontSize: "11px", color: "#059669", backgroundColor: "#d1fae5", padding: "3px 6px", borderRadius: "3px" }, children: formatTime(game.open_time) }), _jsx("span", { style: { color: "#d1d5db", fontSize: "10px" }, children: "\u2192" }), _jsx("span", { style: { fontSize: "11px", color: theme.danger, backgroundColor: "#fee2e2", padding: "3px 6px", borderRadius: "3px" }, children: formatTime(game.close_time) }), game.schedule_status === "Active" && (_jsx("span", { style: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: theme.success } }))] })] }, game.id || index));
                                    })) }))] }), _jsxs("div", { className: "dropdown-container", style: { position: "relative" }, children: [_jsxs("div", { onClick: (e) => { e.stopPropagation(); setShowSessionDropdown(!showSessionDropdown); setShowGameDropdown(false); }, style: {
                                        border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "12px 14px",
                                        cursor: "pointer", display: "flex", justifyContent: "space-between",
                                        alignItems: "center", backgroundColor: "#fff"
                                    }, children: [_jsx("span", { style: { color: formData.session ? theme.primary : theme.textMuted, fontSize: "14px" }, children: formData.session || "Select Session" }), _jsx("span", { style: {
                                                color: theme.primary,
                                                transform: showSessionDropdown ? "rotate(180deg)" : "rotate(0deg)",
                                                transition: "transform 0.2s", fontSize: "10px"
                                            }, children: "\u25BC" })] }), showSessionDropdown && (_jsx("div", { style: {
                                        position: "absolute", top: "100%", left: 0, right: 0,
                                        backgroundColor: "#fff", border: `1px solid ${theme.border}`,
                                        borderRadius: "6px", marginTop: "4px", zIndex: 1000,
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden"
                                    }, children: sessions.map((session, index) => {
                                        const isSelected = formData.session === session;
                                        return (_jsxs("div", { onClick: () => handleSessionSelect(session), style: {
                                                padding: "10px 14px", cursor: "pointer",
                                                borderBottom: index < sessions.length - 1 ? "1px solid #f3f4f6" : "none",
                                                backgroundColor: isSelected ? theme.primaryLight : "#fff",
                                                display: "flex", alignItems: "center", gap: "10px",
                                                transition: "background-color 0.15s"
                                            }, onMouseEnter: (e) => { if (!isSelected)
                                                e.currentTarget.style.backgroundColor = "#f9fafb"; }, onMouseLeave: (e) => { if (!isSelected)
                                                e.currentTarget.style.backgroundColor = "#fff"; }, children: [_jsx("span", { style: { fontSize: "13px", fontWeight: "500", color: isSelected ? theme.primary : theme.text }, children: session }), isSelected && _jsx("span", { style: { marginLeft: "auto", color: theme.primary, fontSize: "12px" }, children: "\u2713" })] }, session));
                                    }) }))] }), _jsxs("div", { className: "form-row-responsive", style: { display: "flex", gap: "14px" }, children: [_jsx("input", { type: "text", placeholder: "Pana (3 digits)", value: formData.pana, maxLength: 3, onChange: (e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^\d+$/.test(value))
                                            handleInputChange('pana', value);
                                    }, style: {
                                        flex: 1, minWidth: '100%', border: `1px solid ${theme.border}`, borderRadius: "6px",
                                        padding: "12px 14px", fontSize: "14px", outline: "none",
                                        transition: "border-color 0.2s, box-shadow 0.2s"
                                    }, onFocus: (e) => { e.target.style.borderColor = theme.primary; e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.1)"; }, onBlur: (e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; } }), _jsx("input", { type: "text", placeholder: "Digit (0-9)", value: formData.digit, maxLength: 1, onChange: (e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^[0-9]$/.test(value))
                                            handleInputChange('digit', value);
                                    }, style: {
                                        flex: 1, minWidth: '100%', border: `1px solid ${theme.border}`, borderRadius: "6px",
                                        padding: "12px 14px", fontSize: "14px", outline: "none",
                                        transition: "border-color 0.2s, box-shadow 0.2s"
                                    }, onFocus: (e) => { e.target.style.borderColor = theme.primary; e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.1)"; }, onBlur: (e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; } })] }), _jsxs("div", { className: "action-row-responsive", style: { display: "flex", gap: "14px", marginTop: "6px" }, children: [_jsx("button", { onClick: handleDeclareResult, disabled: declaring, style: {
                                        flex: 1, backgroundColor: declaring ? "#a5b4fc" : theme.primary,
                                        color: "#fff", border: "none", borderRadius: "6px",
                                        padding: "12px 18px", fontSize: "14px", fontWeight: "600",
                                        cursor: declaring ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                                    }, children: declaring ? (_jsxs(_Fragment, { children: [_jsx("span", { style: { width: "14px", height: "14px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" } }), "Declaring..."] })) : "Declare Result" }), _jsx("button", { onClick: handleCheckWinners, disabled: checkingWinners, style: {
                                        flex: 1, backgroundColor: "#fff", color: theme.primary,
                                        border: `1px solid ${theme.border}`, borderRadius: "6px",
                                        padding: "12px 18px", fontSize: "14px", fontWeight: "600",
                                        cursor: checkingWinners ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                                    }, children: checkingWinners ? (_jsxs(_Fragment, { children: [_jsx("span", { style: { width: "14px", height: "14px", border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" } }), "Checking..."] })) : "Check Winners" })] })] }) }), _jsxs("div", { style: {
                    marginTop: "16px",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    marginBottom: "123px"
                }, children: [_jsxs("div", { style: {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                            gap: "12px",
                            flexWrap: "wrap"
                        }, children: [_jsx("h2", { style: { margin: 0, fontSize: "16px", fontWeight: "600", color: theme.text }, children: "Declared Results" }), _jsxs("div", { style: { fontSize: "12px", color: theme.textMuted }, children: [formData.result_date ? `Date: ${formData.result_date}` : "All dates", declaredResultsFetching ? " • Refreshing..." : ""] })] }), declaredResultsLoading ? (_jsx("div", { style: { color: theme.textMuted, fontSize: "14px", padding: "8px 0" }, children: "Loading declared results..." })) : isDeclaredResultsError ? (_jsx("div", { style: {
                            border: `1px solid #fecaca`,
                            backgroundColor: "#fef2f2",
                            color: "#991b1b",
                            borderRadius: "6px",
                            padding: "10px 12px",
                            fontSize: "13px"
                        }, children: ((_a = declaredResultsError === null || declaredResultsError === void 0 ? void 0 : declaredResultsError.data) === null || _a === void 0 ? void 0 : _a.message) || "Failed to fetch declared results" })) : declaredResultsList.length === 0 ? (_jsx("div", { style: { color: theme.textMuted, fontSize: "14px", padding: "8px 0" }, children: "No declared results found." })) : (_jsx("div", { className: "declared-results-table-wrap", style: {
                            border: `1px solid ${theme.border}`,
                            borderRadius: "8px",
                            overflow: "hidden"
                        }, children: _jsx("div", { className: "declared-results-scroll", children: _jsxs("div", { className: "declared-results-table-inner", children: [_jsxs("div", { className: "declared-results-grid-head", style: {
                                            display: "grid",
                                            gridTemplateColumns: "minmax(180px, 2fr) minmax(110px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr)",
                                            gap: "10px",
                                            padding: "10px 12px",
                                            backgroundColor: "#f8fafc",
                                            borderBottom: `1px solid ${theme.border}`,
                                            fontSize: "12px",
                                            color: theme.textMuted,
                                            fontWeight: "600"
                                        }, children: [_jsx("span", { children: "Game" }), _jsx("span", { children: "Date" }), _jsx("span", { children: "Open" }), _jsx("span", { children: "Close" })] }), declaredResultsList.map((row, index) => {
                                        var _a, _b, _c, _d, _e, _f;
                                        return (_jsxs("div", { className: "declared-results-grid-row", style: {
                                                display: "grid",
                                                gridTemplateColumns: "minmax(180px, 2fr) minmax(110px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr)",
                                                gap: "10px",
                                                padding: "10px 12px",
                                                borderBottom: index < declaredResultsList.length - 1 ? `1px solid ${theme.border}` : "none",
                                                alignItems: "center"
                                            }, children: [_jsx("span", { style: { fontSize: "13px", fontWeight: "600", color: theme.text }, children: row.game_name || "-" }), _jsx("span", { style: { fontSize: "12px", color: theme.textMuted }, children: row.result_date || "-" }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }, children: [renderSessionResult((_a = row === null || row === void 0 ? void 0 : row.sessions) === null || _a === void 0 ? void 0 : _a.open), ((_c = (_b = row === null || row === void 0 ? void 0 : row.sessions) === null || _b === void 0 ? void 0 : _b.open) === null || _c === void 0 ? void 0 : _c.result_id) ? (_jsx("button", { onClick: () => handleDeleteResult(row.sessions.open.result_id, "Open", row.game_name), disabled: deletingResultId === row.sessions.open.result_id, style: {
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                padding: "4px 8px",
                                                                fontSize: "11px",
                                                                fontWeight: "600",
                                                                color: "#fff",
                                                                backgroundColor: deletingResultId === row.sessions.open.result_id ? "#fca5a5" : theme.danger,
                                                                cursor: deletingResultId === row.sessions.open.result_id ? "not-allowed" : "pointer"
                                                            }, children: deletingResultId === row.sessions.open.result_id ? "Deleting..." : "Delete" })) : null] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }, children: [renderSessionResult((_d = row === null || row === void 0 ? void 0 : row.sessions) === null || _d === void 0 ? void 0 : _d.close), ((_f = (_e = row === null || row === void 0 ? void 0 : row.sessions) === null || _e === void 0 ? void 0 : _e.close) === null || _f === void 0 ? void 0 : _f.result_id) ? (_jsx("button", { onClick: () => handleDeleteResult(row.sessions.close.result_id, "Close", row.game_name), disabled: deletingResultId === row.sessions.close.result_id, style: {
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                padding: "4px 8px",
                                                                fontSize: "11px",
                                                                fontWeight: "600",
                                                                color: "#fff",
                                                                backgroundColor: deletingResultId === row.sessions.close.result_id ? "#fca5a5" : theme.danger,
                                                                cursor: deletingResultId === row.sessions.close.result_id ? "not-allowed" : "pointer"
                                                            }, children: deletingResultId === row.sessions.close.result_id ? "Deleting..." : "Delete" })) : null] })] }, `${row.game_name}-${row.result_date}-${index}`));
                                    })] }) }) }))] }), showWinnersModal && (_jsx("div", { onClick: () => setShowWinnersModal(false), style: {
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
                    alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px"
                }, children: _jsxs("div", { onClick: (e) => e.stopPropagation(), style: {
                        backgroundColor: "#fff", borderRadius: "12px", maxWidth: "600px",
                        width: "100%", maxHeight: "80vh", display: "flex", flexDirection: "column",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
                    }, children: [_jsxs("div", { style: {
                                padding: "20px", borderBottom: `1px solid ${theme.border}`,
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }, children: [_jsxs("div", { children: [_jsx("h2", { style: { margin: 0, fontSize: "18px", fontWeight: "600", color: theme.text }, children: "\uD83C\uDFC6 Winners List" }), (winnersData === null || winnersData === void 0 ? void 0 : winnersData.message) && (_jsx("p", { style: { margin: "4px 0 0", fontSize: "12px", color: theme.textMuted }, children: winnersData.message }))] }), _jsx("button", { onClick: () => setShowWinnersModal(false), style: {
                                        backgroundColor: "transparent", border: "none", fontSize: "24px",
                                        cursor: "pointer", color: theme.textMuted, padding: "0",
                                        width: "32px", height: "32px", display: "flex",
                                        alignItems: "center", justifyContent: "center", borderRadius: "6px"
                                    }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = "#f3f4f6", onMouseLeave: (e) => e.currentTarget.style.backgroundColor = "transparent", children: "\u00D7" })] }), _jsx("div", { style: { padding: "20px", overflowY: "auto", flex: 1 }, children: (winnersData === null || winnersData === void 0 ? void 0 : winnersData.winners) && winnersData.winners.length > 0 ? (_jsx("div", { style: { display: "flex", flexDirection: "column", gap: "12px" }, children: winnersData.winners.map((winner, index) => {
                                    const typeBadge = getGameTypeBadgeColor(winner.game_type);
                                    return (_jsxs("div", { style: {
                                            backgroundColor: "#f9fafb",
                                            border: `1px solid ${theme.border}`,
                                            borderLeft: `4px solid ${theme.success}`,
                                            borderRadius: "8px", padding: "14px"
                                        }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [_jsx("div", { style: {
                                                                    width: "32px", height: "32px", borderRadius: "50%",
                                                                    backgroundColor: theme.primary, display: "flex",
                                                                    alignItems: "center", justifyContent: "center",
                                                                    color: "#fff", fontWeight: "700", fontSize: "12px"
                                                                }, children: (winner.user_name || "U").charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: "14px", fontWeight: "600", color: theme.text }, children: winner.user_name || `User #${winner.id}` }), _jsxs("div", { style: { fontSize: "11px", color: theme.textMuted }, children: [winner.game_name, " \u2022 ", winner.session] })] })] }), _jsxs("div", { style: { textAlign: "right" }, children: [_jsx("div", { style: { fontSize: "13px", color: theme.textMuted }, children: "Bid Points" }), _jsxs("div", { style: { fontSize: "16px", fontWeight: "700", color: theme.success }, children: ["\u20B9", parseFloat(winner.points || 0).toLocaleString('en-IN')] })] })] }), _jsxs("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" }, children: [_jsx("span", { style: {
                                                            backgroundColor: typeBadge.bg, color: typeBadge.color,
                                                            padding: "3px 8px", borderRadius: "4px",
                                                            fontSize: "11px", fontWeight: "600"
                                                        }, children: winner.game_type }), _jsxs("span", { style: {
                                                            backgroundColor: "#dbeafe", color: "#1d4ed8",
                                                            padding: "3px 8px", borderRadius: "4px",
                                                            fontSize: "11px", fontWeight: "600", fontFamily: "monospace"
                                                        }, children: ["Pana: ", winner.pana] }), _jsxs("span", { style: {
                                                            backgroundColor: "#ede9fe", color: "#6d28d9",
                                                            padding: "3px 8px", borderRadius: "4px",
                                                            fontSize: "11px", fontWeight: "600", fontFamily: "monospace"
                                                        }, children: ["Digit: ", winner.digit] }), _jsx("span", { style: {
                                                            backgroundColor: "#f0fdf4", color: "#166534",
                                                            padding: "3px 8px", borderRadius: "4px",
                                                            fontSize: "11px", fontWeight: "600"
                                                        }, children: winner.bid_date }), winner.jodi && (_jsxs("span", { style: {
                                                            backgroundColor: "#fce7f3", color: "#be185d",
                                                            padding: "3px 8px", borderRadius: "4px",
                                                            fontSize: "11px", fontWeight: "600"
                                                        }, children: ["Jodi: ", winner.jodi] }))] })] }, winner.id || index));
                                }) })) : (_jsxs("div", { style: { textAlign: "center", padding: "40px 20px", color: theme.textMuted }, children: [_jsx("div", { style: { fontSize: "48px", marginBottom: "12px" }, children: "\uD83C\uDFAF" }), _jsx("div", { style: { fontSize: "16px", fontWeight: "500", marginBottom: "6px" }, children: "No Winners Found" }), _jsx("div", { style: { fontSize: "14px" }, children: (winnersData === null || winnersData === void 0 ? void 0 : winnersData.message) || "No winning bids for this result" })] })) }), (winnersData === null || winnersData === void 0 ? void 0 : winnersData.winners) && winnersData.winners.length > 0 && (_jsx("div", { style: {
                                padding: "16px 20px", borderTop: `1px solid ${theme.border}`,
                                backgroundColor: "#f9fafb", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px"
                            }, children: _jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("span", { style: { fontSize: "14px", fontWeight: "600", color: theme.text }, children: ["Total Winners: ", winnersData.winners.length] }), _jsxs("span", { style: { fontSize: "14px", fontWeight: "600", color: theme.success }, children: ["Total Bid Points: \u20B9", winnersData.winners.reduce((sum, w) => sum + parseFloat(w.points || 0), 0).toLocaleString('en-IN')] })] }) }))] }) })), _jsx("style", { jsx: true, children: `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .form-row-responsive,
                .action-row-responsive {
                    flex-wrap: wrap;
                }

                .form-row-responsive > * ,
                .action-row-responsive > * {
                    min-width: 0;
                }

                .declared-results-scroll {
                    overflow-x: auto;
                    overflow-y: hidden;
                    width: 100%;
                    -webkit-overflow-scrolling: touch;
                    touch-action: pan-x pan-y;
                }

                .declared-results-table-inner {
                    min-width: 700px;
                }

                @media (max-width: 768px) {
                    .action-row-responsive {
                        flex-direction: column;
                    }

                    .action-row-responsive > button {
                        width: 100%;
                    }

                    .form-row-responsive {
                        flex-direction: column;
                    }

                    .declared-results-table-wrap {
                        margin-left: -8px;
                        margin-right: -8px;
                    }
                }
            ` })] }));
}
