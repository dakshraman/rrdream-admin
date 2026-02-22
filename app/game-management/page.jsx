'use client';
import { useState } from "react";
import { useGetGameSchedulesQuery, useUpdateGameScheduleMutation, useToggleScheduleStatusMutation } from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";

export default function GameManagement() {
    const { data: scheduleData, isLoading, isError, error } = useGetGameSchedulesQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [updateGameSchedule, { isLoading: isUpdating }] = useUpdateGameScheduleMutation();
    const [toggleScheduleStatus, { isLoading: isToggling }] = useToggleScheduleStatusMutation();

    // State for search
    const [searchQuery, setSearchQuery] = useState("");
    const [bulkTogglingGameId, setBulkTogglingGameId] = useState(null);

    // API returns { data: [...] } so we access scheduleData.data
    const allGames = scheduleData?.data || [];

    // Filter games based on search query
    const games = allGames.filter(game =>
        game.game_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // State for managing edits
    const [editingScheduleId, setEditingScheduleId] = useState(null);
    const [editForm, setEditForm] = useState({
        open_time: "",
        close_time: ""
    });

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

    const handleEditClick = (schedule) => {
        setEditingScheduleId(schedule.schedule_id);
        const openTime = schedule.open_time?.slice(0, 5) || ""; // Extract HH:MM
        const closeTime = schedule.close_time?.slice(0, 5) || "";
        setEditForm({
            open_time: openTime,
            close_time: closeTime
        });
    };

    const handleCancelEdit = () => {
        setEditingScheduleId(null);
        setEditForm({ open_time: "", close_time: "" });
    };

    const handleUpdateSchedule = async (scheduleId) => {
        if (!editForm.open_time || !editForm.close_time) {
            toast.error("Please select both open and close times");
            return;
        }

        try {
            await updateGameSchedule({
                id: scheduleId,
                open_time: editForm.open_time,
                close_time: editForm.close_time
            }).unwrap();

            toast.success("Schedule updated successfully");
            setEditingScheduleId(null);
        } catch (err) {
            console.error("Update error:", err);
            toast.error(err?.data?.message || "Failed to update schedule");
        }
    };

    const handleToggleStatus = async (scheduleId, currentStatus) => {
        const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
        const confirmMsg = `Are you sure you want to change status to ${newStatus}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            await toggleScheduleStatus(scheduleId).unwrap();
            toast.success(`Status changed to ${newStatus}`);
        } catch (err) {
            console.error("Toggle status error:", err);
            toast.error(err?.data?.message || "Failed to toggle status");
        }
    };

    const getGameSchedules = (game) => {
        if (!game?.schedule) return [];

        return weekDays.flatMap((day) => (game.schedule?.[day] || []).filter(Boolean));
    };

    const getGameStatusSummary = (game) => {
        const schedules = getGameSchedules(game);
        const total = schedules.length;
        const activeCount = schedules.filter((schedule) => schedule.status === "Active").length;

        return {
            schedules,
            total,
            activeCount,
            allActive: total > 0 && activeCount === total,
            someActive: activeCount > 0,
            isMixed: activeCount > 0 && activeCount < total,
        };
    };

    const handleToggleGameStatus = async (game) => {
        const { schedules, total, allActive } = getGameStatusSummary(game);

        if (!total) {
            toast.error("No schedules found for this game");
            return;
        }

        const targetStatus = allActive ? "Inactive" : "Active";
        const schedulesToToggle = schedules.filter((schedule) => schedule.status !== targetStatus);

        if (schedulesToToggle.length === 0) {
            toast.success(`All day schedules are already ${targetStatus}`);
            return;
        }

        const confirmMsg = `Change all ${schedulesToToggle.length} day toggles for ${game.game_name} to ${targetStatus}?`;
        if (!window.confirm(confirmMsg)) return;

        setBulkTogglingGameId(game.game_id);

        let successCount = 0;
        let failedCount = 0;

        try {
            for (const schedule of schedulesToToggle) {
                try {
                    await toggleScheduleStatus(schedule.schedule_id).unwrap();
                    successCount += 1;
                } catch (err) {
                    failedCount += 1;
                    console.error("Bulk toggle status error:", err);
                }
            }

            if (successCount > 0) {
                toast.success(`Updated ${successCount} day toggle${successCount > 1 ? "s" : ""} to ${targetStatus}`);
            }

            if (failedCount > 0) {
                toast.error(`Failed to update ${failedCount} day toggle${failedCount > 1 ? "s" : ""}`);
            }
        } finally {
            setBulkTogglingGameId(null);
        }
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
                Error loading games: {error?.data?.message || "Unknown error"}
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

                {/* Search Input */}
                <div style={{ marginTop: "16px" }}>
                    <input
                        type="text"
                        placeholder="Search game by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: `1px solid ${theme.border}`,
                            fontSize: "14px",
                            width: "100%",
                            maxWidth: "400px",
                            outline: "none",
                            transition: "border-color 0.2s"
                        }}
                    />
                </div>
            </div>

            {/* Grid Layout */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "20px"
            }}>
                {games.map((game) => {
                    const gameStatus = getGameStatusSummary(game);
                    const isGameAllActive = gameStatus.allActive;
                    const isGameMixed = gameStatus.isMixed;
                    const isGameToggleDisabled = isToggling || bulkTogglingGameId === game.game_id;

                    return (
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
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    color: isGameMixed
                                        ? theme.warning
                                        : (isGameAllActive ? theme.success : theme.danger)
                                }}>
                                    {isGameMixed ? "Mixed" : (isGameAllActive ? "All Active" : "All Inactive")}
                                </span>
                                <label style={{ position: "relative", display: "inline-block", width: "38px", height: "22px" }} title="Toggle all days">
                                    <input
                                        type="checkbox"
                                        checked={isGameAllActive}
                                        onChange={() => handleToggleGameStatus(game)}
                                        disabled={isGameToggleDisabled}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: "absolute",
                                        cursor: isGameToggleDisabled ? "not-allowed" : "pointer",
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: isGameAllActive ? theme.success : (isGameMixed ? theme.warning : "#ccc"),
                                        borderRadius: "34px",
                                        transition: ".4s",
                                        opacity: isGameToggleDisabled ? 0.65 : 1
                                    }}>
                                        <span style={{
                                            position: "absolute",
                                            content: "",
                                            height: "16px",
                                            width: "16px",
                                            left: isGameAllActive ? "18px" : "4px",
                                            bottom: "3px",
                                            backgroundColor: "white",
                                            borderRadius: "50%",
                                            transition: ".4s"
                                        }}></span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Schedule List */}
                        <div style={{ padding: "12px 16px", flex: 1 }}>
                            {weekDays.map((day, index) => {
                                const daySchedules = game.schedule?.[day] || [];
                                const daySchedule = daySchedules[0];

                                // Skip if no schedule (though usually there should be one)
                                if (!daySchedule) return null;

                                const isEditing = editingScheduleId === daySchedule.schedule_id;
                                const isActive = daySchedule.status === "Active";

                                return (
                                    <div key={day} style={{
                                        padding: "12px 0",
                                        borderBottom: index < weekDays.length - 1 ? `1px solid #f3f4f6` : "none",
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ fontSize: "14px", fontWeight: "500", color: theme.text }}>
                                                {day}
                                            </span>

                                            {/* Status Toggle */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{
                                                    fontSize: "11px",
                                                    fontWeight: "600",
                                                    color: isActive ? theme.success : theme.danger
                                                }}>
                                                    {daySchedule.status}
                                                </span>
                                                <label style={{ position: "relative", display: "inline-block", width: "34px", height: "20px" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isActive}
                                                        onChange={() => handleToggleStatus(daySchedule.schedule_id, daySchedule.status)}
                                                        disabled={isGameToggleDisabled}
                                                        style={{ opacity: 0, width: 0, height: 0 }}
                                                    />
                                                    <span style={{
                                                        position: "absolute",
                                                        cursor: "pointer",
                                                        top: 0, left: 0, right: 0, bottom: 0,
                                                        backgroundColor: isActive ? theme.success : "#ccc",
                                                        borderRadius: "34px",
                                                        transition: ".4s"
                                                    }}>
                                                        <span style={{
                                                            position: "absolute",
                                                            content: "",
                                                            height: "14px",
                                                            width: "14px",
                                                            left: isActive ? "16px" : "4px",
                                                            bottom: "3px",
                                                            backgroundColor: "white",
                                                            borderRadius: "50%",
                                                            transition: ".4s"
                                                        }}></span>
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Edit Mode */}
                                        {isEditing ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontSize: "10px", color: theme.textMuted, display: "block" }}>Open</span>
                                                    <input
                                                        type="time"
                                                        value={editForm.open_time}
                                                        onChange={(e) => setEditForm({ ...editForm, open_time: e.target.value })}
                                                        style={{
                                                            width: "100%",
                                                            padding: "4px",
                                                            fontSize: "12px",
                                                            border: `1px solid ${theme.border}`,
                                                            borderRadius: "4px"
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontSize: "10px", color: theme.textMuted, display: "block" }}>Close</span>
                                                    <input
                                                        type="time"
                                                        value={editForm.close_time}
                                                        onChange={(e) => setEditForm({ ...editForm, close_time: e.target.value })}
                                                        style={{
                                                            width: "100%",
                                                            padding: "4px",
                                                            fontSize: "12px",
                                                            border: `1px solid ${theme.border}`,
                                                            borderRadius: "4px"
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ display: "flex", gap: "4px", alignSelf: "flex-end" }}>
                                                    <button
                                                        onClick={() => handleUpdateSchedule(daySchedule.schedule_id)}
                                                        disabled={isUpdating}
                                                        style={{
                                                            backgroundColor: theme.success,
                                                            color: "white",
                                                            border: "none",
                                                            padding: "6px",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            display: "flex", alignItems: "center", justifyContent: "center"
                                                        }}
                                                        title="Save"
                                                    >
                                                        ✔️
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        style={{
                                                            backgroundColor: theme.danger,
                                                            color: "white",
                                                            border: "none",
                                                            padding: "6px",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            display: "flex", alignItems: "center", justifyContent: "center"
                                                        }}
                                                        title="Cancel"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* View Mode */
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
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
                                                <button
                                                    onClick={() => handleEditClick(daySchedule)}
                                                    style={{
                                                        backgroundColor: "transparent",
                                                        color: theme.primary,
                                                        border: "none",
                                                        fontSize: "12px",
                                                        cursor: "pointer",
                                                        fontWeight: "500",
                                                        padding: "4px"
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )})}
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
