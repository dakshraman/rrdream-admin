'use client';
import { useState, useEffect } from "react";
import { useGetGamesQuery, useDeclareResultMutation } from "@/store/backendSlice/apiAPISlice";

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

    // API hooks
    const { data: gamesResponse, isLoading: gamesLoading } = useGetGamesQuery();
    const [declareResult, { isLoading: declaring, isSuccess, isError, error }] = useDeclareResultMutation();

    // Get games list - handle API structure: { games: Array(20) }
    const gamesList = gamesResponse?.games || gamesResponse?.data || [];

    const sessions = ["Open", "Close"];

    // Close dropdowns when clicking outside
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
            setFormData({
                result_date: today,
                game_id: "",
                session: "",
                pana: "",
                digit: ""
            });
            setSelectedGame(null);
        }
    }, [isSuccess, today]);

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

    const handleDeclareResult = async () => {
        if (!formData.result_date) { alert("Please select a date"); return; }
        if (!formData.game_id) { alert("Please select a game"); return; }
        if (!formData.session) { alert("Please select a session"); return; }
        if (!formData.pana) { alert("Please enter Pana"); return; }
        if (!formData.digit) { alert("Please enter Digit"); return; }

        try {
            await declareResult(formData).unwrap();
        } catch (err) {
            console.error("Error declaring result:", err);
        }
    };

    const handleCheckWinners = () => {
        alert("Check Winners functionality coming soon!");
    };

    // Format time from "10:30:00" to "10:30"
    const formatTime = (time) => {
        if (!time) return "";
        return time.slice(0, 5);
    };

    // Theme colors from Withdraw Requests
    const theme = {
        primary: "#6366f1",      // Indigo/purple from left border
        primaryLight: "#eef2ff", // Light indigo background
        text: "#1f2937",         // Dark text
        textMuted: "#6b7280",    // Gray text
        border: "#e5e7eb",       // Border color
        success: "#22c55e",      // Green
        warning: "#f59e0b",      // Orange/Yellow
        danger: "#ef4444",       // Red
    };

    return (
        <main style={{ padding: "16px", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            {/* Title */}
            <h1 style={{
                fontSize: "18px",
                fontWeight: "600",
                color: theme.text,
                margin: "0 0 16px 0"
            }}>
                Declare Result
            </h1>

            {/* Main Form Card */}
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "20px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}>
                {/* Form Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                    {/* Date Picker */}
                    <div
                        style={{
                            border: `1px solid ${theme.border}`,
                            borderRadius: "6px",
                            padding: "12px 14px",
                            cursor: "pointer",
                            position: "relative",
                            backgroundColor: "#fff"
                        }}
                        onClick={() => document.getElementById('date-input').showPicker?.()}
                    >
                        <span style={{
                            color: formData.result_date ? theme.primary : theme.textMuted,
                            fontSize: "14px"
                        }}>
                            {formData.result_date ? `Select Date: ${formData.result_date}` : "Select Date"}
                        </span>
                        <input
                            id="date-input"
                            type="date"
                            value={formData.result_date}
                            onChange={(e) => handleInputChange('result_date', e.target.value)}
                            style={{
                                position: "absolute",
                                opacity: 0,
                                width: "100%",
                                height: "100%",
                                top: 0,
                                left: 0,
                                cursor: "pointer"
                            }}
                        />
                    </div>

                    {/* Game Dropdown */}
                    <div className="dropdown-container" style={{ position: "relative" }}>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowGameDropdown(!showGameDropdown);
                                setShowSessionDropdown(false);
                            }}
                            style={{
                                border: `1px solid ${theme.border}`,
                                borderRadius: "6px",
                                padding: "12px 14px",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: "#fff"
                            }}
                        >
                            <span style={{
                                color: selectedGame ? theme.primary : theme.textMuted,
                                fontSize: "14px"
                            }}>
                                {selectedGame 
                                    ? `${selectedGame.product_name} (${formatTime(selectedGame.open_time)}-${formatTime(selectedGame.close_time)})`
                                    : "Select Game"
                                }
                            </span>
                            <span style={{
                                color: theme.primary,
                                transform: showGameDropdown ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s",
                                fontSize: "10px"
                            }}>▼</span>
                        </div>

                        {/* Game Dropdown List */}
                        {showGameDropdown && (
                            <div style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                backgroundColor: "#fff",
                                border: `1px solid ${theme.border}`,
                                borderRadius: "6px",
                                marginTop: "4px",
                                maxHeight: "280px",
                                overflowY: "auto",
                                zIndex: 1000,
                                boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
                            }}>
                                {gamesLoading ? (
                                    <div style={{ padding: "16px", textAlign: "center", color: theme.textMuted }}>
                                        Loading games...
                                    </div>
                                ) : gamesList.length === 0 ? (
                                    <div style={{ padding: "16px", textAlign: "center", color: theme.textMuted }}>
                                        No games found
                                    </div>
                                ) : (
                                    gamesList.map((game, index) => {
                                        const isSelected = selectedGame?.id === game.id;
                                        return (
                                            <div
                                                key={game.id || index}
                                                onClick={() => handleGameSelect(game)}
                                                style={{
                                                    padding: "10px 14px",
                                                    cursor: "pointer",
                                                    borderBottom: index < gamesList.length - 1 ? "1px solid #f3f4f6" : "none",
                                                    backgroundColor: isSelected ? theme.primaryLight : "#fff",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    transition: "background-color 0.15s"
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) e.currentTarget.style.backgroundColor = "#f9fafb";
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) e.currentTarget.style.backgroundColor = "#fff";
                                                }}
                                            >
                                                {/* Left: ID + Name */}
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <span style={{
                                                        backgroundColor: isSelected ? theme.primary : "#f3f4f6",
                                                        color: isSelected ? "#fff" : theme.textMuted,
                                                        padding: "3px 8px",
                                                        borderRadius: "4px",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        minWidth: "28px",
                                                        textAlign: "center"
                                                    }}>
                                                        {game.id}
                                                    </span>
                                                    <div>
                                                        <p style={{
                                                            margin: 0,
                                                            fontSize: "13px",
                                                            fontWeight: "500",
                                                            color: isSelected ? theme.primary : theme.text
                                                        }}>
                                                            {game.product_name}
                                                        </p>
                                                        <p style={{
                                                            margin: "1px 0 0",
                                                            fontSize: "11px",
                                                            color: theme.textMuted
                                                        }}>
                                                            {game.game_name_hindi}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right: Time badges */}
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span style={{
                                                        fontSize: "11px",
                                                        color: "#059669",
                                                        backgroundColor: "#d1fae5",
                                                        padding: "3px 6px",
                                                        borderRadius: "3px"
                                                    }}>
                                                        {formatTime(game.open_time)}
                                                    </span>
                                                    <span style={{ color: "#d1d5db", fontSize: "10px" }}>→</span>
                                                    <span style={{
                                                        fontSize: "11px",
                                                        color: theme.danger,
                                                        backgroundColor: "#fee2e2",
                                                        padding: "3px 6px",
                                                        borderRadius: "3px"
                                                    }}>
                                                        {formatTime(game.close_time)}
                                                    </span>
                                                    {game.schedule_status === "Active" && (
                                                        <span style={{
                                                            width: "6px",
                                                            height: "6px",
                                                            borderRadius: "50%",
                                                            backgroundColor: theme.success
                                                        }}></span>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSessionDropdown(!showSessionDropdown);
                                setShowGameDropdown(false);
                            }}
                            style={{
                                border: `1px solid ${theme.border}`,
                                borderRadius: "6px",
                                padding: "12px 14px",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: "#fff"
                            }}
                        >
                            <span style={{
                                color: formData.session ? theme.primary : theme.textMuted,
                                fontSize: "14px"
                            }}>
                                {formData.session || "Select Session"}
                            </span>
                            <span style={{
                                color: theme.primary,
                                transform: showSessionDropdown ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s",
                                fontSize: "10px"
                            }}>▼</span>
                        </div>

                        {/* Session Dropdown List */}
                        {showSessionDropdown && (
                            <div style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                backgroundColor: "#fff",
                                border: `1px solid ${theme.border}`,
                                borderRadius: "6px",
                                marginTop: "4px",
                                zIndex: 1000,
                                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                                overflow: "hidden"
                            }}>
                                {sessions.map((session, index) => {
                                    const isSelected = formData.session === session;
                                    return (
                                        <div
                                            key={session}
                                            onClick={() => handleSessionSelect(session)}
                                            style={{
                                                padding: "10px 14px",
                                                cursor: "pointer",
                                                borderBottom: index < sessions.length - 1 ? "1px solid #f3f4f6" : "none",
                                                backgroundColor: isSelected ? theme.primaryLight : "#fff",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                transition: "background-color 0.15s"
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.backgroundColor = "#f9fafb";
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.backgroundColor = "#fff";
                                            }}
                                        >
                                            <span style={{
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                color: isSelected ? theme.primary : theme.text
                                            }}>
                                                {session}
                                            </span>
                                            {isSelected && (
                                                <span style={{ marginLeft: "auto", color: theme.primary, fontSize: "12px" }}>✓</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pana and Digit Inputs */}
                    <div style={{ display: "flex", gap: "14px" }}>
                        <input
                            type="text"
                            placeholder="Pana"
                            value={formData.pana}
                            onChange={(e) => handleInputChange('pana', e.target.value)}
                            style={{
                                flex: 1,
                                border: `1px solid ${theme.border}`,
                                borderRadius: "6px",
                                padding: "12px 14px",
                                fontSize: "14px",
                                outline: "none",
                                transition: "border-color 0.2s, box-shadow 0.2s"
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = theme.primary;
                                e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.1)";
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = theme.border;
                                e.target.style.boxShadow = "none";
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Digit"
                            value={formData.digit}
                            onChange={(e) => handleInputChange('digit', e.target.value)}
                            style={{
                                flex: 1,
                                border: `1px solid ${theme.border}`,
                                borderRadius: "6px",
                                padding: "12px 14px",
                                fontSize: "14px",
                                outline: "none",
                                transition: "border-color 0.2s, box-shadow 0.2s"
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = theme.primary;
                                e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.1)";
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = theme.border;
                                e.target.style.boxShadow = "none";
                            }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "14px", marginTop: "6px" }}>
                        <button
                            onClick={handleDeclareResult}
                            disabled={declaring}
                            style={{
                                flex: 1,
                                backgroundColor: declaring ? "#a5b4fc" : theme.primary,
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "12px 18px",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: declaring ? "not-allowed" : "pointer",
                                transition: "background-color 0.2s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px"
                            }}
                        >
                            {declaring ? (
                                <>
                                    <span style={{
                                        width: "14px",
                                        height: "14px",
                                        border: "2px solid #fff",
                                        borderTopColor: "transparent",
                                        borderRadius: "50%",
                                        animation: "spin 1s linear infinite"
                                    }}></span>
                                    Declaring...
                                </>
                            ) : (
                                "Declare Result"
                            )}
                        </button>

                        <button
                            onClick={handleCheckWinners}
                            style={{
                                flex: 1,
                                backgroundColor: "#fff",
                                color: theme.primary,
                                border: `1px solid ${theme.border}`,
                                borderRadius: "6px",
                                padding: "12px 18px",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            Check Winners
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS for spinner animation */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </main>
    );
}