'use client';
import { useState, useEffect } from "react";
import {
    useGetStarlineGamesQuery,
    useStarlineDeclareResultMutation,
    useStarlineCheckWinnerMutation,
} from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";

export default function StarlineDeclareResult() {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        result_date: today,
        game_id: "",
        pana: "",
        digit: "",
    });

    const [selectedGame, setSelectedGame] = useState(null);
    const [showGameDropdown, setShowGameDropdown] = useState(false);
    const [showWinnersModal, setShowWinnersModal] = useState(false);
    const [winnersData, setWinnersData] = useState(null);

    const { data: gamesResponse, isLoading: gamesLoading } = useGetStarlineGamesQuery();
    const [starlineDeclareResult, { isLoading: declaring }] = useStarlineDeclareResultMutation();
    const [starlineCheckWinner, { isLoading: checkingWinners }] = useStarlineCheckWinnerMutation();

    // Support { data: [] } or { games: [] } or plain []
    const gamesList = gamesResponse?.data || gamesResponse?.games || (Array.isArray(gamesResponse) ? gamesResponse : []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if(!e.target.closest('.dropdown-container')) setShowGameDropdown(false);
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
        if(!formData.result_date) { toast.error("Please select a date"); return false; }
        if(!formData.game_id) { toast.error("Please select a game"); return false; }
        if(!formData.pana) { toast.error("Please enter Pana (3 digits)"); return false; }
        if(formData.pana.length !== 3) { toast.error("Pana must be exactly 3 digits"); return false; }
        if(!formData.digit) { toast.error("Please enter Digit (0-9)"); return false; }
        if(!/^[0-9]$/.test(formData.digit)) { toast.error("Digit must be 0-9"); return false; }
        return true;
    };

    const handleDeclareResult = async () => {
        if(!validate()) return;
        try {
            const res = await starlineDeclareResult(formData).unwrap();
            toast.success(res?.message || "Result declared successfully!");
            setFormData({ result_date: today, game_id: "", pana: "", digit: "" });
            setSelectedGame(null);
        } catch(err) {
            toast.error(err?.data?.message || err?.message || "Failed to declare result");
        }
    };

    const handleCheckWinners = async () => {
        if(!validate()) return;
        try {
            const res = await starlineCheckWinner(formData).unwrap();
            console.log("the res", res)
            setWinnersData(res);
            setShowWinnersModal(true);
        } catch(err) {
            toast.error(err?.data?.message || err?.message || "Failed to fetch winners");
        }
    };

    const theme = {
        primary: "#6366f1",
        primaryLight: "#eef2ff",
        text: "#1f2937",
        textMuted: "#6b7280",
        border: "#e5e7eb",
        success: "#22c55e",
        danger: "#ef4444",
    };

    return (
        <main style={{ padding: "16px", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            <h1 style={{ fontSize: "18px", fontWeight: "600", color: theme.text, margin: "0 0 16px" }}>
                Starline Declare Result
            </h1>

            <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                    {/* Date */}
                    <div style={{
                        border: `1px solid ${theme.border}`, borderRadius: "6px",
                        padding: "12px 14px", cursor: "pointer", position: "relative", backgroundColor: "#fff",
                    }} onClick={() => document.getElementById('sl-date-input').showPicker?.()}>
                        <span style={{ color: formData.result_date ? theme.primary : theme.textMuted, fontSize: "14px" }}>
                            {formData.result_date ? `Select Date: ${formData.result_date}` : "Select Date"}
                        </span>
                        <input
                            id="sl-date-input"
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
                                                onMouseEnter={(e) => { if(!isSel) e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                                                onMouseLeave={(e) => { if(!isSel) e.currentTarget.style.backgroundColor = isSel ? theme.primaryLight : "#fff"; }}
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
                                                {game.time && (
                                                    <span style={{
                                                        fontSize: "11px", color: "#059669",
                                                        backgroundColor: "#d1fae5", padding: "3px 6px", borderRadius: "3px",
                                                    }}>{game.time}</span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pana + Digit */}
                    <div style={{ display: "flex", gap: "14px" }}>
                        <input
                            type="text"
                            placeholder="Pana (3 digits)"
                            value={formData.pana}
                            maxLength={3}
                            onChange={(e) => {
                                const v = e.target.value;
                                if(v === '' || /^\d+$/.test(v)) handleInputChange('pana', v);
                            }}
                            style={{ flex: 1, border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "12px 14px", fontSize: "14px", outline: "none" }}
                            onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.1)"; }}
                            onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                        />
                        <input
                            type="text"
                            placeholder="Digit (0-9)"
                            value={formData.digit}
                            maxLength={1}
                            onChange={(e) => {
                                const v = e.target.value;
                                if(v === '' || /^[0-9]$/.test(v)) handleInputChange('digit', v);
                            }}
                            style={{ flex: 1, border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "12px 14px", fontSize: "14px", outline: "none" }}
                            onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.1)"; }}
                            onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                        />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: "14px", marginTop: "6px" }}>
                        <button onClick={handleDeclareResult} disabled={declaring} style={{
                            flex: 1, backgroundColor: declaring ? "#a5b4fc" : theme.primary,
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
                                                    {winner.game_type || 'N/A'} • Digit: {winner.digit || winner.number || 'N/A'}
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

            <style jsx>{`
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