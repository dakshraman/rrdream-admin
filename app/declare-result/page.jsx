'use client';
import { useState, useEffect } from "react";
import {
    useGetGamesQuery,
    useDeclareResultMutation,
    useDeleteResultMutation,
    useCheckWinnerMutation,
    useGetDeclaredResultsQuery
} from "@/store/backendSlice/apiAPISlice";

export default function DeclareResult() {
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
    const {
        data: declaredResultsResponse,
        isLoading: declaredResultsLoading,
        isFetching: declaredResultsFetching,
        isError: isDeclaredResultsError,
        error: declaredResultsError,
        refetch: refetchDeclaredResults
    } = useGetDeclaredResultsQuery(
        undefined,
        { refetchOnMountOrArgChange: true }
    );

    const gamesList = gamesResponse?.games || gamesResponse?.data || [];
    const sessions = ["Open", "Close"];
    const declaredResultsListRaw = Array.isArray(declaredResultsResponse?.data)
        ? declaredResultsResponse.data
        : [];
    const declaredResultsList = formData.result_date
        ? declaredResultsListRaw.filter((item) => item?.result_date === formData.result_date)
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
        if (isError) {
            alert(error?.data?.message || "Failed to declare result");
        }
    }, [isError, error]);

    const handleGameSelect = (game) => {
        setSelectedGame(game);
        setFormData(prev => ({ ...prev, game_id: game.id, session: "" }));
        setShowGameDropdown(false);
    };

    const handleSessionSelect = (session) => {
        setFormData(prev => ({ ...prev, session }));
        setShowSessionDropdown(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        if (!formData.result_date) { alert("Please select a date"); return false; }
        if (!formData.game_id) { alert("Please select a game"); return false; }
        if (!formData.session) { alert("Please select a session"); return false; }
        if (!formData.pana) { alert("Please enter Pana (3 digits)"); return false; }
        if (formData.pana.length !== 3) { alert("Pana must be exactly 3 digits"); return false; }
        if (!formData.digit) { alert("Please enter Digit (0-9)"); return false; }
        if (!/^[0-9]$/.test(formData.digit)) { alert("Digit must be a single number from 0 to 9"); return false; }
        return true;
    };

    const handleDeclareResult = async () => {
        if (!validate()) return;
        try {
            await declareResult(formData).unwrap();
        } catch (err) {}
    };

    const handleCheckWinners = async () => {
        if (!validate()) return;
        try {
            const response = await checkWinner(formData).unwrap();
            console.log("Winners Response:", response);
            // response = { status: true, message: "...", winners: [...] }
            setWinnersData({
                winners: response?.winners || [],
                message: response?.message || ""
            });
            setShowWinnersModal(true);
        } catch (err) {
            alert(err?.data?.message || "Failed to fetch winners");
        }
    };

    const formatTime = (time) => {
        if (!time) return "";
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
        return map[type?.toLowerCase()] || { bg: "#f3f4f6", color: "#374151" };
    };

    const renderSessionResult = (sessionData) => {
        if (!sessionData) {
            return (
                <span style={{
                    color: theme.textMuted,
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                    padding: "4px 8px",
                    borderRadius: "4px"
                }}>
                    Pending
                </span>
            );
        }

        return (
            <span style={{
                fontSize: "12px",
                fontWeight: "600",
                color: theme.text,
                backgroundColor: "#eef2ff",
                border: `1px solid ${theme.border}`,
                padding: "4px 8px",
                borderRadius: "4px",
                fontFamily: "monospace"
            }}>
                {sessionData.pana}-{sessionData.digit}
            </span>
        );
    };

    const handleDeleteResult = async (resultId, sessionLabel, gameName) => {
        if (!resultId) return;

        const confirmed = window.confirm(`Delete ${sessionLabel} result for ${gameName || "this game"}?`);
        if (!confirmed) return;

        try {
            setDeletingResultId(resultId);
            const response = await deleteResult(resultId).unwrap();
            alert(response?.message || "Result deleted successfully");
            refetchDeclaredResults();
        } catch (err) {
            alert(err?.data?.message || "Failed to delete result");
        } finally {
            setDeletingResultId(null);
        }
    };

    return (
        <main style={{ padding: "16px", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            <h1 style={{ fontSize: "18px", fontWeight: "600", color: theme.text, margin: "0 0 16px 0" }}>
                Declare Result
            </h1>

            <div style={{
                backgroundColor: "#fff", borderRadius: "8px",
                padding: "20px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                    {/* Date Picker */}
                    <div
                        style={{
                            border: `1px solid ${theme.border}`, borderRadius: "6px",
                            padding: "12px 14px", cursor: "pointer", position: "relative", backgroundColor: "#fff"
                        }}
                        onClick={() => document.getElementById('date-input').showPicker?.()}
                    >
                        <span style={{ color: formData.result_date ? theme.primary : theme.textMuted, fontSize: "14px" }}>
                            {formData.result_date ? `Select Date: ${formData.result_date}` : "Select Date"}
                        </span>
                        <input
                            id="date-input"
                            type="date"
                            value={formData.result_date}
                            onChange={(e) => handleInputChange('result_date', e.target.value)}
                            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" }}
                        />
                    </div>

                    {/* Game Dropdown */}
                    <div className="dropdown-container" style={{ position: "relative" }}>
                        <div
                            onClick={(e) => { e.stopPropagation(); setShowGameDropdown(!showGameDropdown); setShowSessionDropdown(false); }}
                            style={{
                                border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "12px 14px",
                                cursor: "pointer", display: "flex", justifyContent: "space-between",
                                alignItems: "center", backgroundColor: "#fff"
                            }}
                        >
                            <span style={{ color: selectedGame ? theme.primary : theme.textMuted, fontSize: "14px" }}>
                                {selectedGame
                                    ? `${selectedGame.product_name} (${formatTime(selectedGame.open_time)}-${formatTime(selectedGame.close_time)})`
                                    : "Select Game"}
                            </span>
                            <span style={{
                                color: theme.primary,
                                transform: showGameDropdown ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s", fontSize: "10px"
                            }}>▼</span>
                        </div>

                        {showGameDropdown && (
                            <div style={{
                                position: "absolute", top: "100%", left: 0, right: 0,
                                backgroundColor: "#fff", border: `1px solid ${theme.border}`,
                                borderRadius: "6px", marginTop: "4px", maxHeight: "280px",
                                overflowY: "auto", zIndex: 1000, boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
                            }}>
                                {gamesLoading ? (
                                    <div style={{ padding: "16px", textAlign: "center", color: theme.textMuted }}>Loading games...</div>
                                ) : gamesList.length === 0 ? (
                                    <div style={{ padding: "16px", textAlign: "center", color: theme.textMuted }}>No games found</div>
                                ) : (
                                    gamesList.map((game, index) => {
                                        const isSelected = selectedGame?.id === game.id;
                                        return (
                                            <div
                                                key={game.id || index}
                                                onClick={() => handleGameSelect(game)}
                                                style={{
                                                    padding: "10px 14px", cursor: "pointer",
                                                    borderBottom: index < gamesList.length - 1 ? "1px solid #f3f4f6" : "none",
                                                    backgroundColor: isSelected ? theme.primaryLight : "#fff",
                                                    display: "flex", justifyContent: "space-between",
                                                    alignItems: "center", transition: "background-color 0.15s"
                                                }}
                                                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                                                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#fff"; }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <span style={{
                                                        backgroundColor: isSelected ? theme.primary : "#f3f4f6",
                                                        color: isSelected ? "#fff" : theme.textMuted,
                                                        padding: "3px 8px", borderRadius: "4px",
                                                        fontSize: "11px", fontWeight: "600",
                                                        minWidth: "28px", textAlign: "center"
                                                    }}>{game.id}</span>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: "13px", fontWeight: "500", color: isSelected ? theme.primary : theme.text }}>
                                                            {game.product_name}
                                                        </p>
                                                        <p style={{ margin: "1px 0 0", fontSize: "11px", color: theme.textMuted }}>
                                                            {game.game_name_hindi}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span style={{ fontSize: "11px", color: "#059669", backgroundColor: "#d1fae5", padding: "3px 6px", borderRadius: "3px" }}>
                                                        {formatTime(game.open_time)}
                                                    </span>
                                                    <span style={{ color: "#d1d5db", fontSize: "10px" }}>→</span>
                                                    <span style={{ fontSize: "11px", color: theme.danger, backgroundColor: "#fee2e2", padding: "3px 6px", borderRadius: "3px" }}>
                                                        {formatTime(game.close_time)}
                                                    </span>
                                                    {game.schedule_status === "Active" && (
                                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: theme.success }}></span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Session Dropdown */}
                    <div className="dropdown-container" style={{ position: "relative" }}>
                        <div
                            onClick={(e) => { e.stopPropagation(); setShowSessionDropdown(!showSessionDropdown); setShowGameDropdown(false); }}
                            style={{
                                border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "12px 14px",
                                cursor: "pointer", display: "flex", justifyContent: "space-between",
                                alignItems: "center", backgroundColor: "#fff"
                            }}
                        >
                            <span style={{ color: formData.session ? theme.primary : theme.textMuted, fontSize: "14px" }}>
                                {formData.session || "Select Session"}
                            </span>
                            <span style={{
                                color: theme.primary,
                                transform: showSessionDropdown ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s", fontSize: "10px"
                            }}>▼</span>
                        </div>

                        {showSessionDropdown && (
                            <div style={{
                                position: "absolute", top: "100%", left: 0, right: 0,
                                backgroundColor: "#fff", border: `1px solid ${theme.border}`,
                                borderRadius: "6px", marginTop: "4px", zIndex: 1000,
                                boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden"
                            }}>
                                {sessions.map((session, index) => {
                                    const isSelected = formData.session === session;
                                    return (
                                        <div
                                            key={session}
                                            onClick={() => handleSessionSelect(session)}
                                            style={{
                                                padding: "10px 14px", cursor: "pointer",
                                                borderBottom: index < sessions.length - 1 ? "1px solid #f3f4f6" : "none",
                                                backgroundColor: isSelected ? theme.primaryLight : "#fff",
                                                display: "flex", alignItems: "center", gap: "10px",
                                                transition: "background-color 0.15s"
                                            }}
                                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#fff"; }}
                                        >
                                            <span style={{ fontSize: "13px", fontWeight: "500", color: isSelected ? theme.primary : theme.text }}>
                                                {session}
                                            </span>
                                            {isSelected && <span style={{ marginLeft: "auto", color: theme.primary, fontSize: "12px" }}>✓</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pana and Digit Inputs */}
                    <div className="form-row-responsive" style={{ display: "flex", gap: "14px" }}>
                        <input
                            type="text"
                            placeholder="Pana (3 digits)"
                            value={formData.pana}
                            maxLength={3}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d+$/.test(value)) handleInputChange('pana', value);
                            }}
                            style={{
                                flex: 1, minWidth: '100%', border: `1px solid ${theme.border}`, borderRadius: "6px",
                                padding: "12px 14px", fontSize: "14px", outline: "none",
                                transition: "border-color 0.2s, box-shadow 0.2s"
                            }}
                            onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.1)"; }}
                            onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                        />
                        <input
                            type="text"
                            placeholder="Digit (0-9)"
                            value={formData.digit}
                            maxLength={1}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^[0-9]$/.test(value)) handleInputChange('digit', value);
                            }}
                            style={{
                                flex: 1, minWidth: '100%', border: `1px solid ${theme.border}`, borderRadius: "6px",
                                padding: "12px 14px", fontSize: "14px", outline: "none",
                                transition: "border-color 0.2s, box-shadow 0.2s"
                            }}
                            onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.1)"; }}
                            onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="action-row-responsive" style={{ display: "flex", gap: "14px", marginTop: "6px" }}>
                        <button
                            onClick={handleDeclareResult}
                            disabled={declaring}
                            style={{
                                flex: 1, backgroundColor: declaring ? "#a5b4fc" : theme.primary,
                                color: "#fff", border: "none", borderRadius: "6px",
                                padding: "12px 18px", fontSize: "14px", fontWeight: "600",
                                cursor: declaring ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                            }}
                        >
                            {declaring ? (
                                <>
                                    <span style={{ width: "14px", height: "14px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>
                                    Declaring...
                                </>
                            ) : "Declare Result"}
                        </button>

                        <button
                            onClick={handleCheckWinners}
                            disabled={checkingWinners}
                            style={{
                                flex: 1, backgroundColor: "#fff", color: theme.primary,
                                border: `1px solid ${theme.border}`, borderRadius: "6px",
                                padding: "12px 18px", fontSize: "14px", fontWeight: "600",
                                cursor: checkingWinners ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                            }}
                        >
                            {checkingWinners ? (
                                <>
                                    <span style={{ width: "14px", height: "14px", border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>
                                    Checking...
                                </>
                            ) : "Check Winners"}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{
                marginTop: "16px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "20px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                marginBottom:"123px"
            
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                    gap: "12px",
                    flexWrap: "wrap"
                }}>
                    <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: theme.text }}>
                        Declared Results
                    </h2>
                    <div style={{ fontSize: "12px", color: theme.textMuted }}>
                        {formData.result_date ? `Date: ${formData.result_date}` : "All dates"}
                        {declaredResultsFetching ? " • Refreshing..." : ""}
                    </div>
                </div>

                {declaredResultsLoading ? (
                    <div style={{ color: theme.textMuted, fontSize: "14px", padding: "8px 0" }}>
                        Loading declared results...
                    </div>
                ) : isDeclaredResultsError ? (
                    <div style={{
                        border: `1px solid #fecaca`,
                        backgroundColor: "#fef2f2",
                        color: "#991b1b",
                        borderRadius: "6px",
                        padding: "10px 12px",
                        fontSize: "13px"
                    }}>
                        {declaredResultsError?.data?.message || "Failed to fetch declared results"}
                    </div>
                ) : declaredResultsList.length === 0 ? (
                    <div style={{ color: theme.textMuted, fontSize: "14px", padding: "8px 0" }}>
                        No declared results found.
                    </div>
                ) : (
                    <div className="declared-results-table-wrap" style={{
                        border: `1px solid ${theme.border}`,
                        borderRadius: "8px",
                        overflow: "hidden"
                    }}>
                        <div className="declared-results-scroll">
                            <div className="declared-results-table-inner">
                                <div className="declared-results-grid-head" style={{
                                    display: "grid",
                                    gridTemplateColumns: "minmax(180px, 2fr) minmax(110px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr)",
                                    gap: "10px",
                                    padding: "10px 12px",
                                    backgroundColor: "#f8fafc",
                                    borderBottom: `1px solid ${theme.border}`,
                                    fontSize: "12px",
                                    color: theme.textMuted,
                                    fontWeight: "600"
                                }}>
                                    <span>Game</span>
                                    <span>Date</span>
                                    <span>Open</span>
                                    <span>Close</span>
                                </div>

                                {declaredResultsList.map((row, index) => (
                                    <div
                                        key={`${row.game_name}-${row.result_date}-${index}`}
                                        className="declared-results-grid-row"
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "minmax(180px, 2fr) minmax(110px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr)",
                                            gap: "10px",
                                            padding: "10px 12px",
                                            borderBottom: index < declaredResultsList.length - 1 ? `1px solid ${theme.border}` : "none",
                                            alignItems: "center"
                                        }}
                                    >
                                        <span style={{ fontSize: "13px", fontWeight: "600", color: theme.text }}>
                                            {row.game_name || "-"}
                                        </span>
                                        <span style={{ fontSize: "12px", color: theme.textMuted }}>
                                            {row.result_date || "-"}
                                        </span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                            {renderSessionResult(row?.sessions?.open)}
                                            {row?.sessions?.open?.result_id ? (
                                                <button
                                                    onClick={() => handleDeleteResult(row.sessions.open.result_id, "Open", row.game_name)}
                                                    disabled={deletingResultId === row.sessions.open.result_id}
                                                    style={{
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        padding: "4px 8px",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        color: "#fff",
                                                        backgroundColor: deletingResultId === row.sessions.open.result_id ? "#fca5a5" : theme.danger,
                                                        cursor: deletingResultId === row.sessions.open.result_id ? "not-allowed" : "pointer"
                                                    }}
                                                >
                                                    {deletingResultId === row.sessions.open.result_id ? "Deleting..." : "Delete"}
                                                </button>
                                            ) : null}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                            {renderSessionResult(row?.sessions?.close)}
                                            {row?.sessions?.close?.result_id ? (
                                                <button
                                                    onClick={() => handleDeleteResult(row.sessions.close.result_id, "Close", row.game_name)}
                                                    disabled={deletingResultId === row.sessions.close.result_id}
                                                    style={{
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        padding: "4px 8px",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        color: "#fff",
                                                        backgroundColor: deletingResultId === row.sessions.close.result_id ? "#fca5a5" : theme.danger,
                                                        cursor: deletingResultId === row.sessions.close.result_id ? "not-allowed" : "pointer"
                                                    }}
                                                >
                                                    {deletingResultId === row.sessions.close.result_id ? "Deleting..." : "Delete"}
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Winners Modal */}
            {showWinnersModal && (
                <div
                    onClick={() => setShowWinnersModal(false)}
                    style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
                        alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px"
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: "#fff", borderRadius: "12px", maxWidth: "600px",
                            width: "100%", maxHeight: "80vh", display: "flex", flexDirection: "column",
                            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: "20px", borderBottom: `1px solid ${theme.border}`,
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.text }}>
                                    🏆 Winners List
                                </h2>
                                {winnersData?.message && (
                                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: theme.textMuted }}>
                                        {winnersData.message}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowWinnersModal(false)}
                                style={{
                                    backgroundColor: "transparent", border: "none", fontSize: "24px",
                                    cursor: "pointer", color: theme.textMuted, padding: "0",
                                    width: "32px", height: "32px", display: "flex",
                                    alignItems: "center", justifyContent: "center", borderRadius: "6px"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >×</button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
                            {winnersData?.winners && winnersData.winners.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {winnersData.winners.map((winner, index) => {
                                        const typeBadge = getGameTypeBadgeColor(winner.game_type);
                                        return (
                                            <div
                                                key={winner.id || index}
                                                style={{
                                                    backgroundColor: "#f9fafb",
                                                    border: `1px solid ${theme.border}`,
                                                    borderLeft: `4px solid ${theme.success}`,
                                                    borderRadius: "8px", padding: "14px"
                                                }}
                                            >
                                                {/* Top row: user + points */}
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <div style={{
                                                            width: "32px", height: "32px", borderRadius: "50%",
                                                            backgroundColor: theme.primary, display: "flex",
                                                            alignItems: "center", justifyContent: "center",
                                                            color: "#fff", fontWeight: "700", fontSize: "12px"
                                                        }}>
                                                            {(winner.user_name || "U").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: "14px", fontWeight: "600", color: theme.text }}>
                                                                {winner.user_name || `User #${winner.id}`}
                                                            </div>
                                                            <div style={{ fontSize: "11px", color: theme.textMuted }}>
                                                                {winner.game_name} • {winner.session}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: "right" }}>
                                                        <div style={{ fontSize: "13px", color: theme.textMuted }}>Bid Points</div>
                                                        <div style={{ fontSize: "16px", fontWeight: "700", color: theme.success }}>
                                                            ₹{parseFloat(winner.points || 0).toLocaleString('en-IN')}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom row: badges */}
                                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                    <span style={{
                                                        backgroundColor: typeBadge.bg, color: typeBadge.color,
                                                        padding: "3px 8px", borderRadius: "4px",
                                                        fontSize: "11px", fontWeight: "600"
                                                    }}>
                                                        {winner.game_type}
                                                    </span>
                                                    <span style={{
                                                        backgroundColor: "#dbeafe", color: "#1d4ed8",
                                                        padding: "3px 8px", borderRadius: "4px",
                                                        fontSize: "11px", fontWeight: "600", fontFamily: "monospace"
                                                    }}>
                                                        Pana: {winner.pana}
                                                    </span>
                                                    <span style={{
                                                        backgroundColor: "#ede9fe", color: "#6d28d9",
                                                        padding: "3px 8px", borderRadius: "4px",
                                                        fontSize: "11px", fontWeight: "600", fontFamily: "monospace"
                                                    }}>
                                                        Digit: {winner.digit}
                                                    </span>
                                                    <span style={{
                                                        backgroundColor: "#f0fdf4", color: "#166534",
                                                        padding: "3px 8px", borderRadius: "4px",
                                                        fontSize: "11px", fontWeight: "600"
                                                    }}>
                                                        {winner.bid_date}
                                                    </span>
                                                    {winner.jodi && (
                                                        <span style={{
                                                            backgroundColor: "#fce7f3", color: "#be185d",
                                                            padding: "3px 8px", borderRadius: "4px",
                                                            fontSize: "11px", fontWeight: "600"
                                                        }}>
                                                            Jodi: {winner.jodi}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "40px 20px", color: theme.textMuted }}>
                                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎯</div>
                                    <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "6px" }}>No Winners Found</div>
                                    <div style={{ fontSize: "14px" }}>{winnersData?.message || "No winning bids for this result"}</div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {winnersData?.winners && winnersData.winners.length > 0 && (
                            <div style={{
                                padding: "16px 20px", borderTop: `1px solid ${theme.border}`,
                                backgroundColor: "#f9fafb", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "600", color: theme.text }}>
                                        Total Winners: {winnersData.winners.length}
                                    </span>
                                    <span style={{ fontSize: "14px", fontWeight: "600", color: theme.success }}>
                                        Total Bid Points: ₹{winnersData.winners.reduce((sum, w) => sum + parseFloat(w.points || 0), 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
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
            `}</style>
        </main>
    );
}
