import { useState, useEffect } from "react";
import {
    useGetGaliGamesQuery,
    useGaliDeclareResultMutation,
    useGaliCheckWinnerMutation,
    useGetDeclaredResultsGaliQuery
} from "@/store/backendSlice/apiAPISlice";
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

    const gamesList = gamesResponse?.data || gamesResponse?.games || (Array.isArray(gamesResponse) ? gamesResponse : []);
    const declaredResults = declaredResultsData?.data || [];

    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('.dropdown-container')) setShowGameDropdown(false);
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const handleGameSelect = (game) => {
        setSelectedGame(game);
        setFormData((prev) => ({ ...prev, game_id: game.id }));
        setShowGameDropdown(false);
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        if (!formData.result_date) { toast.error("Please select a date"); return false; }
        if (!formData.game_id) { toast.error("Please select a game"); return false; }
        if (!formData.open) { toast.error("Please enter Open value"); return false; }
        if (!formData.close) { toast.error("Please enter Close value"); return false; }
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
                console.error("Auto FCM send failed:", payload?.message || response.statusText);
            }
        } catch (err) {
            console.error("Auto FCM send error:", err);
        }
    };

    const handleDeclareResult = async () => {
        if (!validate()) return;
        try {
            const payload = { ...formData };
            const res = await galiDeclareResult(payload).unwrap();
            toast.success(res?.message || "Result declared successfully!");

            const gameName =
                selectedGame?.name ||
                selectedGame?.product_name ||
                `Gali #${payload.game_id}`;

            void sendAutoResultNotification({
                title: `${gameName} Gali Desawar Result Declared`,
                body: `Open: ${payload.open} | Close: ${payload.close} (${payload.result_date})`,
            });

            setFormData({ result_date: today, game_id: "", open: "", close: "" });
            setSelectedGame(null);
            refetchResults();
        } catch (err) {
            toast.error(err?.data?.message || err?.message || "Failed to declare result");
        }
    };

    const handleCheckWinners = async () => {
        if (!validate()) return;
        try {
            const res = await galiCheckWinner(formData).unwrap();
            console.log("the res", res);
            setWinnersData(res);
            setShowWinnersModal(true);
        } catch (err) {
            toast.error(err?.data?.message || err?.message || "Failed to fetch winners");
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

    return (
        <main style={{ padding: "16px", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            <h1 style={{ fontSize: "18px", fontWeight: "600", color: theme.text, margin: "0 0 16px" }}>
                Gali Desavar Declare Result
            </h1>

            <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                    {/* Date */}
                    <div style={{
                        border: `1px solid ${theme.border}`, borderRadius: "6px",
                        padding: "12px 14px", cursor: "pointer", position: "relative", backgroundColor: "#fff",
                    }} onClick={() => document.getElementById('gali-date-input').showPicker?.()}>
                        <span style={{ color: formData.result_date ? theme.primary : theme.textMuted, fontSize: "14px" }}>
                            {formData.result_date ? `Select Date: ${formData.result_date}` : "Select Date"}
                        </span>
                        <input
                            id="gali-date-input"
                            type="date"
                            value={formData.result_date}
                            onChange={(e) => handleInputChange('result_date', e.target.value)}
                            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" }}
                        />
                    </div>

                    {/* Game Dropdown */}
                    <div className="dropdown-container" style={{ position: "relative" }}>
                        <div
                            onClick={(e) => { e.stopPropagation(); setShowGameDropdown((p) => !p); }}
                            style={{
                                border: `1px solid ${theme.border}`, borderRadius: "6px",
                                padding: "12px 14px", cursor: "pointer",
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                backgroundColor: "#fff",
                            }}
                        >
                            <span style={{ color: selectedGame ? theme.primary : theme.textMuted, fontSize: "14px" }}>
                                {selectedGame ? selectedGame.name || selectedGame.product_name || `Game #${selectedGame.id}` : "Select Game"}
                            </span>
                            <span style={{ color: theme.primary, transform: showGameDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s", fontSize: "10px" }}>▼</span>
                        </div>

                        {showGameDropdown && (
                            <div style={{
                                position: "absolute", top: "100%", left: 0, right: 0,
                                backgroundColor: "#fff", border: `1px solid ${theme.border}`,
                                borderRadius: "6px", marginTop: "4px", maxHeight: "280px",
                                overflowY: "auto", zIndex: 1000, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                            }}>
                                {gamesLoading ? (
                                    <div style={{ padding: "16px", textAlign: "center", color: theme.textMuted }}>Loading games...</div>
                                ) : gamesList.length === 0 ? (
                                    <div style={{ padding: "16px", textAlign: "center", color: theme.textMuted }}>No games found</div>
                                ) : (
                                    gamesList.map((game, idx) => {
                                        const isSel = selectedGame?.id === game.id;
                                        const gameName = game.name || game.product_name || `Game #${game.id}`;
                                        return (
                                            <div key={game.id || idx}
                                                onClick={() => handleGameSelect(game)}
                                                style={{
                                                    padding: "10px 14px", cursor: "pointer",
                                                    borderBottom: idx < gamesList.length - 1 ? "1px solid #f3f4f6" : "none",
                                                    backgroundColor: isSel ? theme.primaryLight : "#fff",
                                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                                }}
                                                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                                                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.backgroundColor = isSel ? theme.primaryLight : "#fff"; }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <span style={{
                                                        backgroundColor: isSel ? theme.primary : "#f3f4f6",
                                                        color: isSel ? "#fff" : theme.textMuted,
                                                        padding: "3px 8px", borderRadius: "4px",
                                                        fontSize: "11px", fontWeight: "600", minWidth: "28px", textAlign: "center",
                                                    }}>{game.id}</span>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: "13px", fontWeight: "500", color: isSel ? theme.primary : theme.text }}>{gameName}</p>
                                                        {game.name_hindi && (
                                                            <p style={{ margin: "1px 0 0", fontSize: "11px", color: theme.textMuted }}>{game.name_hindi}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                                                    {game.open_time && (
                                                        <span style={{ fontSize: "11px", color: "#059669", backgroundColor: "#d1fae5", padding: "2px 6px", borderRadius: "3px" }}>
                                                            Open: {game.open_time}
                                                        </span>
                                                    )}
                                                    {game.close_time && (
                                                        <span style={{ fontSize: "11px", color: "#dc2626", backgroundColor: "#fee2e2", padding: "2px 6px", borderRadius: "3px" }}>
                                                            Close: {game.close_time}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Open + Close */}
                    <div style={{ display: "flex", gap: "14px" }}>
                        <input
                            type="text"
                            placeholder="Open"
                            value={formData.open}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (v === '' || /^\d+$/.test(v)) handleInputChange('open', v);
                            }}
                            style={{ flex: 1, border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "12px 14px", fontSize: "14px", outline: "none" }}
                            onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.boxShadow = "0 0 0 2px rgba(234,88,12,0.1)"; }}
                            onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                        />
                        <input
                            type="text"
                            placeholder="Close"
                            value={formData.close}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (v === '' || /^\d+$/.test(v)) handleInputChange('close', v);
                            }}
                            style={{ flex: 1, border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "12px 14px", fontSize: "14px", outline: "none" }}
                            onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.boxShadow = "0 0 0 2px rgba(234,88,12,0.1)"; }}
                            onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                        />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: "14px", marginTop: "6px" }}>
                        <button onClick={handleDeclareResult} disabled={declaring} style={{
                            flex: 1, backgroundColor: declaring ? "#fdba74" : theme.primary,
                            color: "#fff", border: "none", borderRadius: "6px",
                            padding: "12px 18px", fontSize: "14px", fontWeight: "600",
                            cursor: declaring ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        }}>
                            {declaring ? (
                                <><Spinner /><span>Declaring...</span></>
                            ) : "Declare Result"}
                        </button>

                        <button onClick={handleCheckWinners} disabled={checkingWinners} style={{
                            flex: 1, backgroundColor: "#fff", color: theme.primary,
                            border: `1px solid ${theme.border}`, borderRadius: "6px",
                            padding: "12px 18px", fontSize: "14px", fontWeight: "600",
                            cursor: checkingWinners ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        }}>
                            {checkingWinners ? (
                                <><Spinner color={theme.primary} /><span>Checking...</span></>
                            ) : "Check Winners"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Winners Modal */}
            {showWinnersModal && (
                <div onClick={() => setShowWinnersModal(false)} style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 9999, padding: "16px",
                }}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        backgroundColor: "#fff", borderRadius: "12px",
                        maxWidth: "600px", width: "100%", maxHeight: "80vh",
                        display: "flex", flexDirection: "column",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                    }}>
                        {/* Header */}
                        <div style={{ padding: "20px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.text }}>🏆 Winners List</h2>
                            <button onClick={() => setShowWinnersModal(false)} style={{
                                background: "transparent", border: "none", fontSize: "24px",
                                cursor: "pointer", color: theme.textMuted, width: "32px", height: "32px",
                                display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px",
                            }}>×</button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
                            {winnersData?.data && winnersData.data.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {winnersData.data.map((winner, idx) => (
                                        <div key={winner.id || idx} style={{
                                            backgroundColor: "#f9fafb",
                                            border: `1px solid ${theme.border}`,
                                            borderLeft: `4px solid ${theme.success}`,
                                            borderRadius: "8px", padding: "14px",
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                        }}>
                                            <div>
                                                <div style={{ fontSize: "14px", fontWeight: "600", color: theme.text, marginBottom: "4px" }}>
                                                    {winner.user_name || winner.username || `User #${winner.user_id}`}
                                                </div>
                                                <div style={{ fontSize: "12px", color: theme.textMuted }}>
                                                    {winner.game_type || 'N/A'} • Open: {winner.open ?? 'N/A'} • Close: {winner.close ?? 'N/A'}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: "16px", fontWeight: "700", color: theme.success }}>
                                                ₹{winner.winning_amount || winner.amount || '0'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "40px 20px", color: theme.textMuted }}>
                                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎯</div>
                                    <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "6px" }}>No Winners Found</div>
                                    <div style={{ fontSize: "14px" }}>{winnersData?.message || "No winning bids for this result"}</div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {winnersData?.data && winnersData.data.length > 0 && (
                            <div style={{
                                padding: "16px 20px", borderTop: `1px solid ${theme.border}`,
                                backgroundColor: "#f9fafb", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px",
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                                <span style={{ fontSize: "14px", fontWeight: "600", color: theme.text }}>
                                    Total Winners: {winnersData.data.length}
                                </span>
                                <span style={{ fontSize: "14px", fontWeight: "600", color: theme.success }}>
                                    Total Payout: ₹{winnersData.data.reduce((sum, w) => sum + parseFloat(w.winning_amount || w.amount || 0), 0).toLocaleString('en-IN')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Previously Declared Results Table */}
            <div style={{ marginTop: "24px", backgroundColor: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: theme.text, margin: "0 0 16px" }}>Previously Declared Results</h2>

                {resultsLoading ? (
                    <div style={{ padding: "20px", textAlign: "center", color: theme.textMuted }}>Loading results...</div>
                ) : declaredResults.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: theme.textMuted, backgroundColor: "#f9fafb", borderRadius: "8px" }}>No declared results found</div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ backgroundColor: theme.primaryLight, textAlign: "left", color: theme.primary }}>
                                    <th style={{ padding: "12px 14px", fontWeight: "600", borderBottom: `2px solid ${theme.border}` }}>Result Date</th>
                                    <th style={{ padding: "12px 14px", fontWeight: "600", borderBottom: `2px solid ${theme.border}` }}>Game Name</th>
                                    <th style={{ padding: "12px 14px", fontWeight: "600", borderBottom: `2px solid ${theme.border}` }}>Open Digit</th>
                                    <th style={{ padding: "12px 14px", fontWeight: "600", borderBottom: `2px solid ${theme.border}` }}>Close Digit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {declaredResults.map((resultGroup, gIdx) => (
                                    resultGroup.results && resultGroup.results.map((res, rIdx) => (
                                        <tr key={`${gIdx}-${rIdx}`} style={{ borderBottom: `1px solid ${theme.border}` }}>
                                            <td style={{ padding: "12px 14px", color: theme.text }}>{resultGroup.result_date}</td>
                                            <td style={{ padding: "12px 14px", color: theme.text, fontWeight: "500" }}>{resultGroup.game_name}</td>
                                            <td style={{ padding: "12px 14px", color: theme.text, fontFamily: "monospace", fontSize: "14px", fontWeight: "600" }}>{res.open}</td>
                                            <td style={{ padding: "12px 14px", color: theme.text, fontFamily: "monospace", fontSize: "14px", fontWeight: "600" }}>{res.close}</td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
            `}</style>
        </main>
    );
}

function Spinner({ color = "#fff" }) {
    return (
        <span style={{
            width: "14px", height: "14px",
            border: `2px solid ${color}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 1s linear infinite",
            flexShrink: 0,
        }} />
    );
}

