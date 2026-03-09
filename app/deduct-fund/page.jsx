'use client';
import { useState, useMemo, useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    useGetUsersQuery,
    useDeductFundsMutation,
} from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  .af-root { width: 100%; max-width: 760px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }
  .af-header-card { border: 1px solid #e5e7eb; background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%); border-radius: 14px; padding: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05); margin-bottom: 12px; }
  .af-title { margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #111827; }
  .af-subtitle { margin: 0; font-size: 12px; color: #6b7280; line-height: 1.35; }
  .af-form-card { border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04); padding: 16px; margin-bottom: 12px; display: grid; gap: 14px; }
  .af-field { display: grid; gap: 6px; position: relative; }
  .af-label { font-size: 12px; font-weight: 600; color: #374151; }

  .af-combo-wrap { position: relative; }
  .af-combo-input-row {
    display: flex; align-items: center;
    width: 100%; height: 44px;
    border: 1px solid #d1d5db; border-radius: 8px;
    padding: 0 12px; gap: 8px;
    background: #fff; box-sizing: border-box;
    cursor: text; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .af-combo-input-row:focus-within {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  }
  .af-combo-input {
    flex: 1; border: none; outline: none;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    color: #111827; background: transparent; min-width: 0;
  }
  .af-combo-input::placeholder { color: #9ca3af; }
  .af-combo-chevron { flex-shrink: 0; pointer-events: none; transition: transform 0.2s; }
  .af-combo-chevron.open { transform: rotate(180deg); }
  .af-combo-clear {
    flex-shrink: 0; background: none; border: none; cursor: pointer;
    color: #9ca3af; font-size: 16px; padding: 0; line-height: 1;
    display: flex; align-items: center;
  }
  .af-combo-clear:hover { color: #ef4444; }

  .af-dropdown {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0;
    background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
    box-shadow: 0 8px 24px rgba(15,23,42,0.1);
    z-index: 999; overflow: hidden;
    max-height: 220px; display: flex; flex-direction: column;
    animation: af-dropdown-in 0.12s ease;
  }
  @keyframes af-dropdown-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .af-dropdown-list { overflow-y: auto; flex: 1; }
  .af-dropdown-item {
    padding: 9px 12px; cursor: pointer; font-size: 13px;
    color: #111827; display: flex; flex-direction: column; gap: 1px;
    border-bottom: 1px solid #f3f4f6; transition: background 0.1s;
  }
  .af-dropdown-item:last-child { border-bottom: none; }
  .af-dropdown-item:hover, .af-dropdown-item.highlighted { background: #f5f3ff; }
  .af-dropdown-item-name { font-weight: 600; }
  .af-dropdown-item-meta { font-size: 11px; color: #6b7280; }
  .af-dropdown-empty { padding: 12px; text-align: center; font-size: 13px; color: #9ca3af; }

  .af-input { width: 100%; height: 44px; border: 1px solid #d1d5db; border-radius: 8px; padding: 0 12px; font-size: 15px; font-weight: 600; outline: none; font-family: 'DM Sans', sans-serif; color: #111827; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; }
  .af-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12); }
  .af-input::placeholder { font-weight: 400; color: #9ca3af; }
  .af-selected-user-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 10px 12px; display: grid; gap: 3px; }
  .af-selected-name { font-size: 13px; font-weight: 700; color: #4f46e5; margin: 0; }
  .af-selected-meta { font-size: 11px; color: #6b7280; margin: 0; }
  .af-selected-balance strong { color: #059669; font-weight: 700; }
  .af-btn-submit { width: 100%; height: 46px; border: none; border-radius: 10px; background: #4f46e5; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s, transform 0.1s; }
  .af-btn-submit:hover:not(:disabled) { background: #4338ca; transform: translateY(-1px); }
  .af-btn-submit:active:not(:disabled) { transform: translateY(0); }
  .af-btn-submit:disabled { background: #9ca3af; cursor: not-allowed; transform: none; }
  .af-success-card { border: 1px solid #bbf7d0; background: #f0fdf4; border-radius: 12px; padding: 14px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px; }
  .af-success-title { margin: 0 0 2px; font-size: 13px; font-weight: 700; color: #166534; }
  .af-success-msg { margin: 0; font-size: 12px; color: #4b5563; }
  mark.af-highlight { background: #fef08a; color: inherit; border-radius: 2px; padding: 0 1px; }
`;

const formatCurrency = (amount) =>
    `₹${parseFloat(amount || 0).toLocaleString("en-IN")}`;

const isUserActive = (user) => user.status === true || user.status === 1;

// Always converts to string first — safe for numbers, null, undefined
function highlight(rawText, query) {
    const text = String(rawText ?? "");
    if (!query) return text;
    const q = query.toLowerCase();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="af-highlight">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </>
    );
}

function SearchableUserSelect({ users, loading, value, onChange }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlighted, setHighlighted] = useState(0);
    const wrapRef  = useRef(null);
    const inputRef = useRef(null);
    const listRef  = useRef(null);

    const selectedUser = users.find((u) => String(u.id) === String(value)) || null;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) => {
            const name  = String(u.name  ?? "").toLowerCase();
            const id    = String(u.id    ?? "");
            const phone = String(u.phone ?? "");
            return name.includes(q) || id.includes(q) || phone.includes(q);
        });
    }, [users, query]);

    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => { setHighlighted(0); }, [filtered]);

    useEffect(() => {
        if (!listRef.current) return;
        const items = listRef.current.querySelectorAll(".af-dropdown-item");
        if (items[highlighted]) items[highlighted].scrollIntoView({ block: "nearest" });
    }, [highlighted]);

    const selectUser = (user) => {
        onChange(String(user.id));
        setQuery("");
        setOpen(false);
    };

    const clearSelection = (e) => {
        e.stopPropagation();
        onChange("");
        setQuery("");
        setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!open) { if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true); return; }
        if      (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
        else if (e.key === "ArrowUp")   { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
        else if (e.key === "Enter")     { e.preventDefault(); if (filtered[highlighted]) selectUser(filtered[highlighted]); }
        else if (e.key === "Escape")    { setOpen(false); }
    };

    if (loading) return <Skeleton height={44} borderRadius={8} />;

    const selectedName = selectedUser ? String(selectedUser.name ?? "") : "";

    return (
        <div className="af-combo-wrap" ref={wrapRef}>
            <div
                className="af-combo-input-row"
                onClick={() => { setOpen(true); inputRef.current?.focus(); }}
            >
                {/* Search icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round"
                     strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>

                <input
                    ref={inputRef}
                    className="af-combo-input"
                    placeholder={selectedName || "Search by name, ID or phone…"}
                    value={open ? query : selectedName}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => { setOpen(true); if (selectedUser) setQuery(""); }}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                />

                {selectedUser && !open && (
                    <button className="af-combo-clear" onClick={clearSelection} title="Clear">✕</button>
                )}

                {/* Chevron icon */}
                <svg className={`af-combo-chevron${open ? " open" : ""}`}
                     width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1l5 5 5-5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </div>

            {open && (
                <div className="af-dropdown">
                    <div className="af-dropdown-list" ref={listRef}>
                        {filtered.length === 0 ? (
                            <div className="af-dropdown-empty">No users found</div>
                        ) : (
                            filtered.map((user, idx) => {
                                const uName  = String(user.name  ?? "N/A");
                                const uId    = String(user.id    ?? "");
                                const uPhone = String(user.phone ?? "");
                                return (
                                    <div
                                        key={user.id}
                                        className={`af-dropdown-item${idx === highlighted ? " highlighted" : ""}`}
                                        onMouseEnter={() => setHighlighted(idx)}
                                        onMouseDown={(e) => { e.preventDefault(); selectUser(user); }}
                                    >
                                        <span className="af-dropdown-item-name">
                                            {highlight(uName, query)}
                                        </span>
                                        <span className="af-dropdown-item-meta">
                                            ID: #{highlight(uId, query)}
                                            {uPhone ? <> · {highlight(uPhone, query)}</> : ""}
                                            {" · "}Bal: {formatCurrency(user.funds)}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DeductFund() {
    const [selectedUserId, setSelectedUserId] = useState("");
    const [amount, setAmount]                 = useState("");
    const [lastSuccess, setLastSuccess]       = useState(null);

    const { data: userData, isLoading: usersLoading } =
        useGetUsersQuery(undefined);

    const [deductFunds, { isLoading: isSubmitting }] = useDeductFundsMutation();

    useEffect(() => {
        if (!lastSuccess) return;
        const timer = setTimeout(() => setLastSuccess(null), 2000);
        return () => clearTimeout(timer);
    }, [lastSuccess]);

    const activeUsers = useMemo(() => {
        const users = userData?.users || [];
        return users
            .filter((u) => isUserActive(u))
            .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
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
            const response = await deductFunds({ user_id: selectedUserId, amount: parsedAmount }).unwrap();
            const msg = response?.message ||
                `${formatCurrency(parsedAmount)} deducted from ${selectedUser?.name || "user"} successfully!`;
            toast.success(msg);
            setLastSuccess({
                userName: selectedUser?.name || `User #${selectedUserId}`,
                amount: parsedAmount,
                message: msg,
            });
            setSelectedUserId("");
            setAmount("");
        } catch (err) {
            const errMsg =
                err?.data?.message ||
                err?.data?.errors?.amount?.[0] ||
                err?.data?.errors?.user_id?.[0] ||
                err?.message ||
                "Failed to deduct funds";
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
                        <h1 className="af-title">Deduct Fund</h1>
                        <p className="af-subtitle">Select a user and enter an amount to debit their wallet directly.</p>
                    </div>

                    {lastSuccess && (
                        <div className="af-success-card">
                            <span style={{ fontSize: "20px", flexShrink: 0, lineHeight: 1 }}>✅</span>
                            <div>
                                <p className="af-success-title">Fund Deducted Successfully</p>
                                <p className="af-success-msg">{lastSuccess.message}</p>
                            </div>
                        </div>
                    )}

                    <div className="af-form-card">

                        <div className="af-field">
                            <label className="af-label">Select User *</label>
                            <SearchableUserSelect
                                users={activeUsers}
                                loading={usersLoading}
                                value={selectedUserId}
                                onChange={(id) => { setSelectedUserId(id); setLastSuccess(null); }}
                            />
                        </div>

                        {selectedUser && (
                            <div className="af-selected-user-box">
                                <p className="af-selected-name">{String(selectedUser.name ?? "N/A")}</p>
                                <p className="af-selected-meta">
                                    ID: #{selectedUser.id}&nbsp;&nbsp;|&nbsp;&nbsp;Phone: {String(selectedUser.phone ?? "N/A")}
                                </p>
                                <p className="af-selected-meta af-selected-balance"
                                   style={{ marginTop: "2px", fontSize: "12px", color: "#4b5563" }}>
                                    Current Balance:&nbsp;<strong>{formatCurrency(selectedUser.funds)}</strong>
                                </p>
                            </div>
                        )}

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

                        <button className="af-btn-submit" onClick={handleSubmit} disabled={!canSubmit}>
                            {isSubmitting
                                ? "Deducting Fund..."
                                : canSubmit
                                    ? `Deduct ${formatCurrency(amount)} from ${selectedUser?.name || "User"}`
                                    : "Deduct Fund"}
                        </button>

                    </div>
                </div>
            </main>
        </>
    );
}
