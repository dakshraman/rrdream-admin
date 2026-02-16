'use client';
import { useGetGameSchedulesQuery } from "@/store/backendSlice/apiAPISlice";
import parse from "html-react-parser";

export default function GameManagement() {
    const { data: scheduleData, isLoading, isError, error } = useGetGameSchedulesQuery();
    // API returns { data: [...] } so we access scheduleData.data
    const games = scheduleData?.data || [];

    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const theme = {
        primary: "#6366f1",
        primaryLight: "#eef2ff",
        text: "#1f2937",
        textMuted: "#6b7280",
        border: "#e5e7eb",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        cardBg: "#ffffff",
        pageBg: "#f8fafc",
    };

    // Helper to format time "15:25:00" -> "03:25 PM"
    const formatTime = (timeStr) => {
        if (!timeStr) return "--:--";
        const [hours, minutes] = timeStr.split(':');
        let hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    if (isLoading) {
        return (
            <div style={{ padding: "24px", textAlign: "center", color: theme.textMuted }}>
                Loading schedules...
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ padding: "24px", textAlign: "center", color: theme.danger }}>
                Error loading schedules: {error?.data?.message || "Unknown error"}
            </div>
        );
    }

    return (
        <main style={{ padding: "16px", minHeight: "100vh", backgroundColor: theme.pageBg }}>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: "600", color: theme.text, margin: 0 }}>
                    Game Management
                </h1>
                <p style={{ fontSize: "14px", color: theme.textMuted, marginTop: "4px" }}>
                    Manage game schedules and timings
                </p>
            </div>

            {/* Grid Layout */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px"
            }}>
                {games.map((game) => (
                    <div key={game.game_id} style={{
                        backgroundColor: theme.cardBg,
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        border: `1px solid ${theme.border}`,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        {/* Card Header */}
                        <div style={{
                            padding: "16px",
                            borderBottom: `1px solid ${theme.border}`,
                            backgroundColor: "#f9fafb",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: "600", color: theme.text, margin: 0 }}>
                                    {game.game_name}
                                </h3>
                                <span style={{
                                    fontSize: "12px",
                                    color: theme.textMuted,
                                    backgroundColor: "#e5e7eb",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    marginTop: "4px",
                                    display: "inline-block"
                                }}>
                                    ID: {game.game_id}
                                </span>
                            </div>
                        </div>

                        {/* Schedule List */}
                        <div style={{ padding: "12px 16px", flex: 1 }}>
                            {weekDays.map((day, index) => {
                                // Default to empty array if no schedule for the day
                                const daySchedules = game.schedule?.[day] || [];
                                const daySchedule = daySchedules[0]; // Assuming single schedule per day for now as per JSON example
                                const isInactive = !daySchedule || daySchedule.status === "Inactive";

                                return (
                                    <div key={day} style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "8px 0",
                                        borderBottom: index < weekDays.length - 1 ? `1px solid #f3f4f6` : "none",
                                    }}>
                                        <span style={{
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            color: theme.text,
                                            width: "80px"
                                        }}>
                                            {day}
                                        </span>

                                        {isInactive ? (
                                            <span style={{
                                                fontSize: "11px",
                                                color: theme.danger,
                                                fontWeight: "600",
                                                backgroundColor: "#fee2e2",
                                                padding: "2px 8px",
                                                borderRadius: "4px"
                                            }}>
                                                Closed
                                            </span>
                                        ) : (
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{
                                                    fontSize: "12px",
                                                    color: "#15803d",
                                                    backgroundColor: "#dcfce7",
                                                    padding: "2px 6px",
                                                    borderRadius: "4px",
                                                    fontWeight: "500"
                                                }}>
                                                    {formatTime(daySchedule?.open_time)}
                                                </span>
                                                <span style={{ fontSize: "12px", color: theme.textMuted }}>-</span>
                                                <span style={{
                                                    fontSize: "12px",
                                                    color: "#b91c1c",
                                                    backgroundColor: "#fee2e2",
                                                    padding: "2px 6px",
                                                    borderRadius: "4px",
                                                    fontWeight: "500"
                                                }}>
                                                    {formatTime(daySchedule?.close_time)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            {/* Empty State */}
            {!isLoading && games.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: theme.textMuted }}>
                    No games found.
                </div>
            )}
        </main>
    );
}
