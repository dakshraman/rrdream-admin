'use client';
import { useState } from "react";
import { useGetGameSchedulesQuery, useUpdateGameMutation, useUpdateGameScheduleMutation, useToggleScheduleStatusMutation } from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";

export default function GameManagement() {
    const { data: scheduleData, isLoading, isError, error, refetch } = useGetGameSchedulesQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [updateGame, { isLoading: isUpdatingGame }] = useUpdateGameMutation();
    const [updateGameSchedule, { isLoading: isUpdating }] = useUpdateGameScheduleMutation();
    const [toggleScheduleStatus, { isLoading: isToggling }] = useToggleScheduleStatusMutation();

    // State for search
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingGameId, setUpdatingGameId] = useState(null);

    // API returns { data: [...] } so we access scheduleData.data
    const allGames = scheduleData?.data || [];

    // Filter games based on search query
    const games = allGames.filter(game =>
        game.game_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // State for managing edits
    const [editingGameId, setEditingGameId] = useState(null);
    const [gameEditForm, setGameEditForm] = useState({
        game_name: "",
        game_name_hindi: ""
    });
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

    const handleGameEditClick = (game) => {
        setEditingGameId(game.game_id);
        setGameEditForm({
            game_name: game.game_name || "",
            game_name_hindi: game.game_name_hindi || ""
        });
    };

    const handleCancelGameEdit = () => {
        setEditingGameId(null);
        setGameEditForm({ game_name: "", game_name_hindi: "" });
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

    const resolveGameStatusForUpdate = (game, fallbackStatus) => {
        if (fallbackStatus) return fallbackStatus;

        if (typeof game?.status === "string" && game.status.trim()) {
            return game.status === "Active" ? "Active" : "Inactive";
        }

        if (typeof game?.status === "number") {
            return game.status === 1 ? "Active" : "Inactive";
        }

        if (typeof game?.status === "boolean") {
            return game.status ? "Active" : "Inactive";
        }

        return getGameStatusSummary(game).allActive ? "Active" : "Inactive";
    };

    const getExplicitGameStatusForUpdate = (game) => {
        if (typeof game?.status === "string" && game.status.trim()) {
            return game.status === "Active" ? "Active" : "Inactive";
        }

        if (typeof game?.status === "number") {
            return game.status === 1 ? "Active" : "Inactive";
        }

        if (typeof game?.status === "boolean") {
            return game.status ? "Active" : "Inactive";
        }

        return undefined;
    };

    const submitGameUpdate = async (game, overrides = {}, successMessage = "Game updated successfully") => {
        const resolvedStatus =
            overrides.status !== undefined
                ? resolveGameStatusForUpdate(game, overrides.status)
                : getExplicitGameStatusForUpdate(game);

        const payload = {
            id: game.game_id,
            game_name: overrides.game_name ?? game.game_name,
            game_name_hindi: overrides.game_name_hindi ?? game.game_name_hindi,
            status: resolvedStatus,
        };

        setUpdatingGameId(game.game_id);

        try {
            await updateGame(payload).unwrap();
            toast.success(successMessage);
            return true;
        } catch (err) {
            console.error("Update game error:", err);
            toast.error(err?.data?.message || "Failed to update game");
            return false;
        } finally {
            setUpdatingGameId(null);
        }
    };

    const getGameSchedules = (game) => {
        if (!game?.schedule) return [];

        return weekDays.flatMap((day) => (game.schedule?.[day] || []).filter(Boolean));
    };

    const getGameLevelIsActive = (game) => {
        if (typeof game?.status === "string" && game.status.trim()) {
            return game.status === "Active";
        }

        if (typeof game?.status === "number") {
            return game.status === 1;
        }

        if (typeof game?.status === "boolean") {
            return game.status;
        }

        return null;
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
        const gameLevelIsActive = getGameLevelIsActive(game);
        const { allActive } = getGameStatusSummary(game);
        const isCurrentlyActive = gameLevelIsActive ?? allActive;
        const targetStatus = isCurrentlyActive ? "Inactive" : "Active";
        const confirmMsg = `Change ${game.game_name} status to ${targetStatus}? This will update the game via updategame API.`;
        if (!window.confirm(confirmMsg)) return;

        const isUpdated = await submitGameUpdate(game, { status: targetStatus }, `Game status changed to ${targetStatus}`);
        if (!isUpdated) return;

        // Ensure the day-level schedule toggles follow the main game status.
        try {
            const refreshedResult = await refetch();
            const refreshedGames = refreshedResult?.data?.data || [];
            const refreshedGame = refreshedGames.find(
                (item) => String(item?.game_id ?? item?.id) === String(game.game_id)
            );

            const sourceGame = refreshedGame || game;
            const schedulesToSync = getGameSchedules(sourceGame).filter(
                (schedule) => schedule.status !== targetStatus
            );

            if (schedulesToSync.length === 0) return;

            let synced = 0;
            let failed = 0;

            for (const schedule of schedulesToSync) {
                try {
                    await toggleScheduleStatus(schedule.schedule_id).unwrap();
                    synced += 1;
                } catch (err) {
                    failed += 1;
                    console.error("Main toggle day sync error:", err);
                }
            }

            if (failed > 0) {
                toast.error(`Main toggle updated game, but ${failed} day toggle${failed > 1 ? "s" : ""} failed to sync`);
            } else if (synced > 0) {
                toast.success(`Synced ${synced} day toggle${synced > 1 ? "s" : ""}`);
            }
        } catch (err) {
            console.error("Refetch after main toggle failed:", err);
        }
    };

    const handleUpdateGameNames = async (game) => {
        const game_name = (gameEditForm.game_name || "").trim();
        const game_name_hindi = (gameEditForm.game_name_hindi || "").trim();

        if (!game_name || !game_name_hindi) {
            toast.error("Please enter both game name and game name hindi");
            return;
        }

        const isUpdated = await submitGameUpdate(
            game,
            { game_name, game_name_hindi },
            "Game name updated successfully"
        );

        if (isUpdated) {
            handleCancelGameEdit();
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
                    const gameLevelIsActive = getGameLevelIsActive(game);
                    const isGameAllActive = gameLevelIsActive ?? gameStatus.allActive;
                    const isGameMixed = gameStatus.isMixed;
                    const isEditingGame = editingGameId === game.game_id;
                    const isGameHeaderUpdating = isUpdatingGame && updatingGameId === game.game_id;
                    const isGameToggleDisabled = isGameHeaderUpdating || isToggling;
                    const isDayToggleDisabled = isToggling || isGameHeaderUpdating;

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
                                {!!game.game_name_hindi && (
                                    <div style={{
                                        fontSize: "12px",
                                        color: theme.textMuted,
                                        marginTop: "4px",
                                        lineHeight: 1.3
                                    }}>
                                        {game.game_name_hindi}
                                    </div>
                                )}
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
                                <button
                                    onClick={() => isEditingGame ? handleCancelGameEdit() : handleGameEditClick(game)}
                                    disabled={isGameHeaderUpdating}
                                    style={{
                                        marginLeft: "8px",
                                        backgroundColor: "transparent",
                                        color: theme.primary,
                                        border: "none",
                                        fontSize: "12px",
                                        cursor: isGameHeaderUpdating ? "not-allowed" : "pointer",
                                        fontWeight: "500",
                                        padding: 0,
                                        opacity: isGameHeaderUpdating ? 0.6 : 1
                                    }}
                                >
                                    {isEditingGame ? "Cancel Name Edit" : "Edit Name"}
                                </button>
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

                        {isEditingGame && (
                            <div style={{
                                padding: "12px 16px",
                                borderBottom: `1px solid ${theme.border}`,
                                backgroundColor: "#ffffff"
                            }}>
                                <div style={{ display: "grid", gap: "10px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", color: theme.textMuted, marginBottom: "4px" }}>
                                            Game Name
                                        </label>
                                        <input
                                            type="text"
                                            value={gameEditForm.game_name}
                                            onChange={(e) => setGameEditForm((prev) => ({ ...prev, game_name: e.target.value }))}
                                            disabled={isGameHeaderUpdating}
                                            style={{
                                                width: "100%",
                                                padding: "8px 10px",
                                                borderRadius: "6px",
                                                border: `1px solid ${theme.border}`,
                                                fontSize: "13px",
                                                outline: "none",
                                                boxSizing: "border-box"
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", color: theme.textMuted, marginBottom: "4px" }}>
                                            Game Name (Hindi)
                                        </label>
                                        <input
                                            type="text"
                                            value={gameEditForm.game_name_hindi}
                                            onChange={(e) => setGameEditForm((prev) => ({ ...prev, game_name_hindi: e.target.value }))}
                                            disabled={isGameHeaderUpdating}
                                            style={{
                                                width: "100%",
                                                padding: "8px 10px",
                                                borderRadius: "6px",
                                                border: `1px solid ${theme.border}`,
                                                fontSize: "13px",
                                                outline: "none",
                                                boxSizing: "border-box"
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                        <button
                                            onClick={handleCancelGameEdit}
                                            disabled={isGameHeaderUpdating}
                                            style={{
                                                backgroundColor: "#f3f4f6",
                                                color: theme.text,
                                                border: `1px solid ${theme.border}`,
                                                padding: "6px 10px",
                                                borderRadius: "6px",
                                                cursor: isGameHeaderUpdating ? "not-allowed" : "pointer",
                                                fontSize: "12px"
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleUpdateGameNames(game)}
                                            disabled={isGameHeaderUpdating}
                                            style={{
                                                backgroundColor: theme.primary,
                                                color: "white",
                                                border: "none",
                                                padding: "6px 10px",
                                                borderRadius: "6px",
                                                cursor: isGameHeaderUpdating ? "not-allowed" : "pointer",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                opacity: isGameHeaderUpdating ? 0.7 : 1
                                            }}
                                        >
                                            {isGameHeaderUpdating ? "Saving..." : "Save Name"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                                        disabled={isDayToggleDisabled}
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
