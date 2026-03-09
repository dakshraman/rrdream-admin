import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useGetGaliGamesQuery, useGaliDeclareResultMutation, useGaliCheckWinnerMutation, useGetDeclaredResultsGaliQuery } from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";
export default function GaliDeclareResult() {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        result_date: today,
        game_id: "",
        open: "",
        close: "",
    });
    const [selectedGame, setSelectedGame] = useState(null);
    const [showGameDropdown, setShowGameDropdown] = useState(false);
    const [showWinnersModal, setShowWinnersModal] = useState(false);
    const [winnersData, setWinnersData] = useState(null);
    const { data: gamesResponse, isLoading: gamesLoading } = useGetGaliGamesQuery();
    const [galiDeclareResult, { isLoading: declaring }] = useGaliDeclareResultMutation();
    const [galiCheckWinner, { isLoading: checkingWinners }] = useGaliCheckWinnerMutation();
    const { data: declaredResultsData, isLoading: resultsLoading, refetch: refetchResults } = useGetDeclaredResultsGaliQuery();
    const gamesList = (gamesResponse === null || gamesResponse === void 0 ? void 0 : gamesResponse.data) || (gamesResponse === null || gamesResponse === void 0 ? void 0 : gamesResponse.games) || (Array.isArray(gamesResponse) ? gamesResponse : []);
    const declaredResults = (declaredResultsData === null || declaredResultsData === void 0 ? void 0 : declaredResultsData.data) || [];
    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('.dropdown-container'))
                setShowGameDropdown(false);
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);
    const handleGameSelect = (game) => {
        setSelectedGame(game);
        setFormData((prev) => (Object.assign(Object.assign({}, prev), { game_id: game.id })));
        setShowGameDropdown(false);
    };
    const handleInputChange = (field, value) => {
        setFormData((prev) => (Object.assign(Object.assign({}, prev), { [field]: value })));
    };
    const validate = () => {
        if (!formData.result_date) {
            toast.error("Please select a date");
            return false;
        }
        if (!formData.game_id) {
            toast.error("Please select a game");
            return false;
        }
        if (!formData.open) {
            toast.error("Please enter Open value");
            return false;
        }
        if (!formData.close) {
            toast.error("Please enter Close value");
            return false;
        }
        return true;
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
    const handleDeclareResult = async () => {
        var _a;
        if (!validate())
            return;
        try {
            const payload = Object.assign({}, formData);
            const res = await galiDeclareResult(payload).unwrap();
            toast.success((res === null || res === void 0 ? void 0 : res.message) || "Result declared successfully!");
            const gameName = (selectedGame === null || selectedGame === void 0 ? void 0 : selectedGame.name) ||
                (selectedGame === null || selectedGame === void 0 ? void 0 : selectedGame.product_name) ||
                `Gali #${payload.game_id}`;
            void sendAutoResultNotification({
                title: `${gameName} Gali Desawar Result Declared`,
                body: `Open: ${payload.open} | Close: ${payload.close} (${payload.result_date})`,
            });
            setFormData({ result_date: today, game_id: "", open: "", close: "" });
            setSelectedGame(null);
            refetchResults();
        }
        catch (err) {
            toast.error(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || "Failed to declare result");
        }
    };
    const handleCheckWinners = async () => {
        var _a;
        if (!validate())
            return;
        try {
            const res = await galiCheckWinner(formData).unwrap();
            console.log("the res", res);
            setWinnersData(res);
            setShowWinnersModal(true);
        }
        catch (err) {
            toast.error(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || "Failed to fetch winners");
        }
    };
    const theme = {
        primary: "#ea580c",
        primaryLight: "#fff7ed",
        text: "#1f2937",
        textMuted: "#6b7280",
        border: "#e5e7eb",
        success: "#22c55e",
        danger: "#ef4444",
    };
    return (_jsxs("main", { style: { padding: "16px", minHeight: "100vh", backgroundColor: "#f8fafc" }, children: [_jsx("h1", { style: { fontSize: "18px", fontWeight: "600", color: theme.text, margin: "0 0 16px" }, children: "Gali Desavar Declare Result" }), _jsx("div", { style: { backgroundColor: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }, children: _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "14px" }, children: [_jsxs("div", { style: {
                                border: `1px solid ${theme.border}`, borderRadius: "6px",
                                padding: "12px 14px", cursor: "pointer", position: "relative", backgroundColor: "#fff",
                            }, onClick: () => { var _a, _b; return (_b = (_a = document.getElementById('gali-date-input')).showPicker) === null || _b === void 0 ? void 0 : _b.call(_a); }, children: [_jsx("span", { style: { color: formData.result_date ? theme.primary : theme.textMuted, fontSize: "14px" }, children: formData.result_date ? `Select Date: ${formData.result_date}` : "Select Date" }), _jsx("input", { id: "gali-date-input", type: "date", value: formData.result_date, onChange: (e) => handleInputChange('result_date', e.target.value), style: { position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" } })] }), _jsxs("div", { className: "dropdown-container", style: { position: "relative" }, children: [_jsxs("div", { onClick: (e) => { e.stopPropagation(); setShowGameDropdown((p) => !p); }, style: {
                                        border: `1px solid ${theme.border}`, borderRadius: "6px",
                                        padding: "12px 14px", cursor: "pointer",
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        backgroundColor: "#fff",
                                    }, children: [_jsx("span", { style: { color: selectedGame ? theme.primary : theme.textMuted, fontSize: "14px" }, children: selectedGame ? selectedGame.name || selectedGame.product_name || `Game #${selectedGame.id}` : "Select Game" }), _jsx("span", { style: { color: theme.primary, transform: showGameDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s", fontSize: "10px" }, children: "\u25BC" })] }), showGameDropdown && (_jsx("div", { style: {
                                        position: "absolute", top: "100%", left: 0, right: 0,
                                        backgroundColor: "#fff", border: `1px solid ${theme.border}`,
                                        borderRadius: "6px", marginTop: "4px", maxHeight: "280px",
                                        overflowY: "auto", zIndex: 1000, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                                    }, children: gamesLoading ? (_jsx("div", { style: { padding: "16px", textAlign: "center", color: theme.textMuted }, children: "Loading games..." })) : gamesList.length === 0 ? (_jsx("div", { style: { padding: "16px", textAlign: "center", color: theme.textMuted }, children: "No games found" })) : (gamesList.map((game, idx) => {
                                        const isSel = (selectedGame === null || selectedGame === void 0 ? void 0 : selectedGame.id) === game.id;
                                        const gameName = game.name || game.product_name || `Game #${game.id}`;
                                        return (_jsxs("div", { onClick: () => handleGameSelect(game), style: {
                                                padding: "10px 14px", cursor: "pointer",
                                                borderBottom: idx < gamesList.length - 1 ? "1px solid #f3f4f6" : "none",
                                                backgroundColor: isSel ? theme.primaryLight : "#fff",
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                            }, onMouseEnter: (e) => { if (!isSel)
                                                e.currentTarget.style.backgroundColor = "#f9fafb"; }, onMouseLeave: (e) => { if (!isSel)
                                                e.currentTarget.style.backgroundColor = isSel ? theme.primaryLight : "#fff"; }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [_jsx("span", { style: {
                                                                backgroundColor: isSel ? theme.primary : "#f3f4f6",
                                                                color: isSel ? "#fff" : theme.textMuted,
                                                                padding: "3px 8px", borderRadius: "4px",
                                                                fontSize: "11px", fontWeight: "600", minWidth: "28px", textAlign: "center",
                                                            }, children: game.id }), _jsxs("div", { children: [_jsx("p", { style: { margin: 0, fontSize: "13px", fontWeight: "500", color: isSel ? theme.primary : theme.text }, children: gameName }), game.name_hindi && (_jsx("p", { style: { margin: "1px 0 0", fontSize: "11px", color: theme.textMuted }, children: game.name_hindi }))] })] }), _jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }, children: [game.open_time && (_jsxs("span", { style: { fontSize: "11px", color: "#059669", backgroundColor: "#d1fae5", padding: "2px 6px", borderRadius: "3px" }, children: ["Open: ", game.open_time] })), game.close_time && (_jsxs("span", { style: { fontSize: "11px", color: "#dc2626", backgroundColor: "#fee2e2", padding: "2px 6px", borderRadius: "3px" }, children: ["Close: ", game.close_time] }))] })] }, game.id || idx));
                                    })) }))] }), _jsxs("div", { style: { display: "flex", gap: "14px" }, children: [_jsx("input", { type: "text", placeholder: "Open", value: formData.open, onChange: (e) => {
                                        const v = e.target.value;
                                        if (v === '' || /^\d+$/.test(v))
                                            handleInputChange('open', v);
                                    }, style: { flex: 1, border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "12px 14px", fontSize: "14px", outline: "none" }, onFocus: (e) => { e.target.style.borderColor = theme.primary; e.target.style.boxShadow = "0 0 0 2px rgba(234,88,12,0.1)"; }, onBlur: (e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; } }), _jsx("input", { type: "text", placeholder: "Close", value: formData.close, onChange: (e) => {
                                        const v = e.target.value;
                                        if (v === '' || /^\d+$/.test(v))
                                            handleInputChange('close', v);
                                    }, style: { flex: 1, border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "12px 14px", fontSize: "14px", outline: "none" }, onFocus: (e) => { e.target.style.borderColor = theme.primary; e.target.style.boxShadow = "0 0 0 2px rgba(234,88,12,0.1)"; }, onBlur: (e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; } })] }), _jsxs("div", { style: { display: "flex", gap: "14px", marginTop: "6px" }, children: [_jsx("button", { onClick: handleDeclareResult, disabled: declaring, style: {
                                        flex: 1, backgroundColor: declaring ? "#fdba74" : theme.primary,
                                        color: "#fff", border: "none", borderRadius: "6px",
                                        padding: "12px 18px", fontSize: "14px", fontWeight: "600",
                                        cursor: declaring ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                    }, children: declaring ? (_jsxs(_Fragment, { children: [_jsx(Spinner, {}), _jsx("span", { children: "Declaring..." })] })) : "Declare Result" }), _jsx("button", { onClick: handleCheckWinners, disabled: checkingWinners, style: {
                                        flex: 1, backgroundColor: "#fff", color: theme.primary,
                                        border: `1px solid ${theme.border}`, borderRadius: "6px",
                                        padding: "12px 18px", fontSize: "14px", fontWeight: "600",
                                        cursor: checkingWinners ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                    }, children: checkingWinners ? (_jsxs(_Fragment, { children: [_jsx(Spinner, { color: theme.primary }), _jsx("span", { children: "Checking..." })] })) : "Check Winners" })] })] }) }), showWinnersModal && (_jsx("div", { onClick: () => setShowWinnersModal(false), style: {
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 9999, padding: "16px",
                }, children: _jsxs("div", { onClick: (e) => e.stopPropagation(), style: {
                        backgroundColor: "#fff", borderRadius: "12px",
                        maxWidth: "600px", width: "100%", maxHeight: "80vh",
                        display: "flex", flexDirection: "column",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                    }, children: [_jsxs("div", { style: { padding: "20px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx("h2", { style: { margin: 0, fontSize: "18px", fontWeight: "600", color: theme.text }, children: "\uD83C\uDFC6 Winners List" }), _jsx("button", { onClick: () => setShowWinnersModal(false), style: {
                                        background: "transparent", border: "none", fontSize: "24px",
                                        cursor: "pointer", color: theme.textMuted, width: "32px", height: "32px",
                                        display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px",
                                    }, children: "\u00D7" })] }), _jsx("div", { style: { padding: "20px", overflowY: "auto", flex: 1 }, children: (winnersData === null || winnersData === void 0 ? void 0 : winnersData.data) && winnersData.data.length > 0 ? (_jsx("div", { style: { display: "flex", flexDirection: "column", gap: "12px" }, children: winnersData.data.map((winner, idx) => {
                                    var _a, _b;
                                    return (_jsxs("div", { style: {
                                            backgroundColor: "#f9fafb",
                                            border: `1px solid ${theme.border}`,
                                            borderLeft: `4px solid ${theme.success}`,
                                            borderRadius: "8px", padding: "14px",
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                        }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: "14px", fontWeight: "600", color: theme.text, marginBottom: "4px" }, children: winner.user_name || winner.username || `User #${winner.user_id}` }), _jsxs("div", { style: { fontSize: "12px", color: theme.textMuted }, children: [winner.game_type || 'N/A', " \u2022 Open: ", (_a = winner.open) !== null && _a !== void 0 ? _a : 'N/A', " \u2022 Close: ", (_b = winner.close) !== null && _b !== void 0 ? _b : 'N/A'] })] }), _jsxs("div", { style: { fontSize: "16px", fontWeight: "700", color: theme.success }, children: ["\u20B9", winner.winning_amount || winner.amount || '0'] })] }, winner.id || idx));
                                }) })) : (_jsxs("div", { style: { textAlign: "center", padding: "40px 20px", color: theme.textMuted }, children: [_jsx("div", { style: { fontSize: "48px", marginBottom: "12px" }, children: "\uD83C\uDFAF" }), _jsx("div", { style: { fontSize: "16px", fontWeight: "500", marginBottom: "6px" }, children: "No Winners Found" }), _jsx("div", { style: { fontSize: "14px" }, children: (winnersData === null || winnersData === void 0 ? void 0 : winnersData.message) || "No winning bids for this result" })] })) }), (winnersData === null || winnersData === void 0 ? void 0 : winnersData.data) && winnersData.data.length > 0 && (_jsxs("div", { style: {
                                padding: "16px 20px", borderTop: `1px solid ${theme.border}`,
                                backgroundColor: "#f9fafb", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px",
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                            }, children: [_jsxs("span", { style: { fontSize: "14px", fontWeight: "600", color: theme.text }, children: ["Total Winners: ", winnersData.data.length] }), _jsxs("span", { style: { fontSize: "14px", fontWeight: "600", color: theme.success }, children: ["Total Payout: \u20B9", winnersData.data.reduce((sum, w) => sum + parseFloat(w.winning_amount || w.amount || 0), 0).toLocaleString('en-IN')] })] }))] }) })), _jsxs("div", { style: { marginTop: "24px", backgroundColor: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }, children: [_jsx("h2", { style: { fontSize: "16px", fontWeight: "600", color: theme.text, margin: "0 0 16px" }, children: "Previously Declared Results" }), resultsLoading ? (_jsx("div", { style: { padding: "20px", textAlign: "center", color: theme.textMuted }, children: "Loading results..." })) : declaredResults.length === 0 ? (_jsx("div", { style: { padding: "30px", textAlign: "center", color: theme.textMuted, backgroundColor: "#f9fafb", borderRadius: "8px" }, children: "No declared results found" })) : (_jsx("div", { style: { overflowX: "auto" }, children: _jsxs("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: "600px", fontSize: "13px" }, children: [_jsx("thead", { children: _jsxs("tr", { style: { backgroundColor: theme.primaryLight, textAlign: "left", color: theme.primary }, children: [_jsx("th", { style: { padding: "12px 14px", fontWeight: "600", borderBottom: `2px solid ${theme.border}` }, children: "Result Date" }), _jsx("th", { style: { padding: "12px 14px", fontWeight: "600", borderBottom: `2px solid ${theme.border}` }, children: "Game Name" }), _jsx("th", { style: { padding: "12px 14px", fontWeight: "600", borderBottom: `2px solid ${theme.border}` }, children: "Open Digit" }), _jsx("th", { style: { padding: "12px 14px", fontWeight: "600", borderBottom: `2px solid ${theme.border}` }, children: "Close Digit" })] }) }), _jsx("tbody", { children: declaredResults.map((resultGroup, gIdx) => (resultGroup.results && resultGroup.results.map((res, rIdx) => (_jsxs("tr", { style: { borderBottom: `1px solid ${theme.border}` }, children: [_jsx("td", { style: { padding: "12px 14px", color: theme.text }, children: resultGroup.result_date }), _jsx("td", { style: { padding: "12px 14px", color: theme.text, fontWeight: "500" }, children: resultGroup.game_name }), _jsx("td", { style: { padding: "12px 14px", color: theme.text, fontFamily: "monospace", fontSize: "14px", fontWeight: "600" }, children: res.open }), _jsx("td", { style: { padding: "12px 14px", color: theme.text, fontFamily: "monospace", fontSize: "14px", fontWeight: "600" }, children: res.close })] }, `${gIdx}-${rIdx}`))))) })] }) }))] }), _jsx("style", { jsx: true, children: `
                @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
            ` })] }));
}
function Spinner({ color = "#fff" }) {
    return (_jsx("span", { style: {
            width: "14px", height: "14px",
            border: `2px solid ${color}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 1s linear infinite",
            flexShrink: 0,
        } }));
}
