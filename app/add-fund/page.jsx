'use client';
import { useState, useMemo, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    useGetUsersQuery,
    useAdminAddFundsMutation,
} from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";

const STYLES = `
  .af-root { width: 100%; max-width: 760px; margin: 0 auto; }
  .af-header-card { border: 1px solid #e5e7eb; background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%); border-radius: 14px; padding: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05); margin-bottom: 12px; }
  .af-title { margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #111827; }
  .af-subtitle { margin: 0; font-size: 12px; color: #6b7280; line-height: 1.35; }
  .af-form-card { border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04); padding: 16px; margin-bottom: 12px; display: grid; gap: 14px; }
  .af-field { display: grid; gap: 6px; }
  .af-label { font-size: 12px; font-weight: 600; color: #374151; }
  .af-select { width: 100%; height: 44px; border: 1px solid #d1d5db; border-radius: 8px; padding: 0 36px 0 12px; font-size: 14px; outline: none; background: #fff; font-family: inherit; color: #111827; box-sizing: border-box; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
  .af-select:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12); }
  .af-input { width: 100%; height: 44px; border: 1px solid #d1d5db; border-radius: 8px; padding: 0 12px; font-size: 15px; font-weight: 600; outline: none; font-family: inherit; color: #111827; box-sizing: border-box; }
  .af-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12); }
  .af-input::placeholder { font-weight: 400; color: #9ca3af; }
  .af-selected-user-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 10px 12px; display: grid; gap: 3px; }
  .af-selected-name { font-size: 13px; font-weight: 700; color: #4f46e5; margin: 0; }
  .af-selected-meta { font-size: 11px; color: #6b7280; margin: 0; }
  .af-selected-balance strong { color: #059669; font-weight: 700; }
  .af-btn-submit { width: 100%; height: 46px; border: none; border-radius: 10px; background: #4f46e5; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.15s, transform 0.1s; }
  .af-btn-submit:hover:not(:disabled) { background: #4338ca; transform: translateY(-1px); }
  .af-btn-submit:active:not(:disabled) { transform: translateY(0); }
  .af-btn-submit:disabled { background: #9ca3af; cursor: not-allowed; transform: none; }
  .af-success-card { border: 1px solid #bbf7d0; background: #f0fdf4; border-radius: 12px; padding: 14px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px; }
  .af-success-title { margin: 0 0 2px; font-size: 13px; font-weight: 700; color: #166534; }
  .af-success-msg { margin: 0; font-size: 12px; color: #4b5563; }
`;

const formatCurrency = (amount) =>
    `₹${parseFloat(amount || 0).toLocaleString("en-IN")}`;

const isUserActive = (user) => user.status === true || user.status === 1;

export default function AddFund() {
    const [selectedUserId, setSelectedUserId] = useState("");
    const [amount, setAmount]                 = useState("");
    const [lastSuccess, setLastSuccess]       = useState(null);

    const { data: userData, isLoading: usersLoading } =
        useGetUsersQuery(undefined, { refetchOnMountOrArgChange: true });

    const [adminAddFunds, { isLoading: isSubmitting }] = useAdminAddFundsMutation();

    // Auto-dismiss success banner after 2 seconds
    useEffect(() => {
        if (!lastSuccess) return;
        const timer = setTimeout(() => setLastSuccess(null), 2000);
        return () => clearTimeout(timer);
    }, [lastSuccess]);

    const activeUsers = useMemo(() => {
        const users = userData?.users || [];
        return users
            .filter((u) => isUserActive(u))
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }, [userData]);

    const selectedUser = useMemo(
        () => activeUsers.find((u) => String(u.id) === String(selectedUserId)) || null,
        [activeUsers, selectedUserId],
    );

    const handleSubmit = async () => {
        if (!selectedUserId) { toast.error("Please select a user"); return; }
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) { toast.error("Please enter a valid amount"); return; }

        try {
            const response = await adminAddFunds({ user_id: selectedUserId, amount: parsedAmount }).unwrap();
            const msg = response?.message || `${formatCurrency(parsedAmount)} added to ${selectedUser?.name || "user"} successfully!`;
            toast.success(msg);
            setLastSuccess({ userName: selectedUser?.name || `User #${selectedUserId}`, amount: parsedAmount, message: msg });
            setSelectedUserId("");
            setAmount("");
        } catch (err) {
            const errMsg = err?.data?.message || err?.data?.errors?.amount?.[0] || err?.data?.errors?.user_id?.[0] || err?.message || "Failed to add funds";
            toast.error(errMsg);
        }
    };

    const canSubmit = selectedUserId && amount && parseFloat(amount) > 0 && !isSubmitting;

    return (
        <>
            <style>{STYLES}</style>
            <main style={{ padding: "12px", overflow: "auto", WebkitOverflowScrolling: "touch" }}>
                <div className="af-root">

                    <div className="af-header-card">
                        <h1 className="af-title">Add Fund</h1>
                        <p className="af-subtitle">Select a user and enter an amount to credit their wallet directly.</p>
                    </div>

                    {/* Success banner — auto-dismisses after 2s */}
                    {lastSuccess && (
                        <div className="af-success-card">
                            <span style={{ fontSize: "20px", flexShrink: 0, lineHeight: 1 }}>✅</span>
                            <div>
                                <p className="af-success-title">Fund Added Successfully</p>
                                <p className="af-success-msg">{lastSuccess.message}</p>
                            </div>
                        </div>
                    )}

                    <div className="af-form-card">

                        {/* User Dropdown */}
                        <div className="af-field">
                            <label className="af-label">Select User *</label>
                            {usersLoading ? (
                                <Skeleton height={44} borderRadius={8} />
                            ) : (
                                <select
                                    className="af-select"
                                    value={selectedUserId}
                                    onChange={(e) => { setSelectedUserId(e.target.value); setLastSuccess(null); }}
                                >
                                    <option value="">— Choose a user —</option>
                                    {activeUsers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name || "N/A"}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Selected user info */}
                        {selectedUser && (
                            <div className="af-selected-user-box">
                                <p className="af-selected-name">{selectedUser.name || "N/A"}</p>
                                <p className="af-selected-meta">ID: #{selectedUser.id}&nbsp;&nbsp;|&nbsp;&nbsp;Phone: {selectedUser.phone || "N/A"}</p>
                                <p className="af-selected-meta af-selected-balance" style={{ marginTop: "2px", fontSize: "12px", color: "#4b5563" }}>
                                    Current Balance:&nbsp;<strong>{formatCurrency(selectedUser.funds)}</strong>
                                </p>
                            </div>
                        )}

                        {/* Amount */}
                        <div className="af-field">
                            <label className="af-label">Amount (₹) *</label>
                            <input
                                className="af-input"
                                type="number"
                                min="1"
                                step="1"
                                placeholder="e.g. 100"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) handleSubmit(); }}
                            />
                        </div>

                        {/* Submit */}
                        <button className="af-btn-submit" onClick={handleSubmit} disabled={!canSubmit}>
                            {isSubmitting
                                ? "Adding Fund..."
                                : canSubmit
                                    ? `Add ${formatCurrency(amount)} to ${selectedUser?.name || "User"}`
                                    : "Add Fund"}
                        </button>

                    </div>
                </div>
            </main>
        </>
    );
}