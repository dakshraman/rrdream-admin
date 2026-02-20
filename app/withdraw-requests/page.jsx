'use client';
import { useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    useGetWithdrawRequestsQuery,
    useUpdateWithdrawStatusMutation
} from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";

const MOBILE_STYLES = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* ── STATS GRID: 2 cols mobile, 4 cols desktop ── */
  .wr-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }
  @media (min-width: 600px) {
    .wr-stats-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .wr-stat-card {
    padding: 10px 12px;
    border-radius: 8px;
    border-left: 4px solid var(--clr);
    background: var(--bg);
  }
  .wr-stat-card__label { font-size: 10px; color: #6b7280; margin-bottom: 2px; }
  .wr-stat-card__val   { font-size: 18px; font-weight: 700; color: var(--clr); line-height: 1; }
  .wr-stat-card__sub   { font-size: 10px; color: #9ca3af; margin-top: 2px; }

  /* ── TOOLBAR: wraps on mobile ── */
  .wr-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 4px;
  }
  .wr-toolbar select,
  .wr-toolbar input {
    flex: 1;
    min-width: 110px;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    font-size: 13px;
    outline: none;
    background: #fff;
    height: 36px;
    font-family: inherit;
  }

  /* ── TABLE: horizontal scroll on small screens ── */
  .wr-table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* ── MOBILE cell tweaks ── */
  @media (max-width: 600px) {
    .wr-avatar     { width: 28px !important; height: 28px !important; font-size: 11px !important; }
    .wr-user-name  { font-size: 12px !important; max-width: 85px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
    .wr-user-phone { font-size: 10px !important; max-width: 85px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
    .wr-amount     { font-size: 12px !important; }
    .wr-transfer   { max-width: 68px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; font-size: 11px !important; }
    .wr-btn-approve,
    .wr-btn-reject { padding: 4px 7px !important; font-size: 10px !important; min-width: 0 !important; }
  }
`;

const WithdrawSkeleton = () => (
    <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: "16px", borderBottom: "1px solid #f0f0f0" }}>
        <Skeleton width={24} height={16} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Skeleton circle width={32} height={32} />
            <Skeleton width={80} height={13} />
        </div>
        <Skeleton width={55} height={13} />
        <Skeleton width={75} height={13} />
        <Skeleton width={55} height={20} borderRadius={12} />
        <Skeleton width={95} height={26} borderRadius={6} />
    </div>
);

export default function WithdrawRequests() {
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [processingId, setProcessingId] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data: withdrawData, isLoading, isError, error, refetch } =
        useGetWithdrawRequestsQuery(undefined, { refetchOnMountOrArgChange: true });
    const [updateWithdrawStatus] = useUpdateWithdrawStatusMutation();

    const withdrawRequests = withdrawData?.withdraw_requests || [];

    const handleApprove = async (row) => {
        if(!window.confirm(`Approve ₹${row.amount} for ${row.user?.name || "User"}?`)) return;
        setProcessingId(row.id);
        try {
            const res = await updateWithdrawStatus({ id: row.id, status: "approved" }).unwrap();
            toast.success(res?.message || "Approved!");
            refetch();
        } catch(err) {
            toast.error(err?.data?.message || "Failed to approve");
        } finally { setProcessingId(null); }
    };

    const handleReject = async (row) => {
        if(!window.confirm(`Reject ₹${row.amount} from ${row.user?.name || "User"}?`)) return;
        setProcessingId(row.id);
        try {
            const res = await updateWithdrawStatus({ id: row.id, status: "rejected" }).unwrap();
            toast.success(res?.message || "Rejected!");
            refetch();
        } catch(err) {
            toast.error(err?.data?.message || "Failed to reject");
        } finally { setProcessingId(null); }
    };

    const getStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        const map = {
            pending: { bg: "#fef3c7", color: "#b45309" },
            approved: { bg: "#d1fae5", color: "#065f46" },
            rejected: { bg: "#fee2e2", color: "#991b1b" },
        };
        const st = map[s] || { bg: "#f3f4f6", color: "#374151" };
        return (
            <span style={{
                background: st.bg, color: st.color, padding: "3px 9px",
                borderRadius: "20px", fontSize: "10px", fontWeight: "700",
                textTransform: "capitalize", whiteSpace: "nowrap"
            }}>
                {status || "N/A"}
            </span>
        );
    };

    const columns = [
        {
            name: "#",
            width: "40px",
            cell: (_, i) => <span style={{ fontSize: "12px", color: "#9ca3af" }}>{i + 1}</span>,
        },
        {
            name: "User",
            selector: (row) => row.user?.name || "N/A",
            sortable: true,
            minWidth: "130px",
            cell: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "4px 0" }}>
                    <div className="wr-avatar" style={{
                        width: "34px", height: "34px", borderRadius: "50%",
                        background: "#4f46e5", display: "flex", alignItems: "center",
                        justifyContent: "center", color: "#fff", fontWeight: "700",
                        fontSize: "13px", flexShrink: 0,
                    }}>
                        {(row.user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <span className="wr-user-name" style={{ fontWeight: "500", fontSize: "13px" }}>
                            {row.user?.name || "N/A"}
                        </span>
                        <span className="wr-user-phone" style={{ fontSize: "11px", color: "#9ca3af" }}>
                            {row.user?.phone || "N/A"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            name: "Amount",
            selector: (row) => parseFloat(row.amount || 0),
            sortable: true,
            width: "85px",
            cell: (row) => (
                <span className="wr-amount" style={{ fontWeight: "700", color: "#059669", fontSize: "13px" }}>
                    ₹{parseFloat(row.amount || 0).toLocaleString("en-IN")}
                </span>
            ),
        },
        {
            name: "Transfer To",
            selector: (row) => row.transfer_to,
            sortable: true,
            width: "105px",
            cell: (row) => (
                <div>
                    <span className="wr-transfer" style={{ fontSize: "12px", fontWeight: "500" }}>
                        {row.transfer_to || "N/A"}
                    </span>
                    {row.user?.bank_name && (
                        <span style={{ fontSize: "10px", color: "#9ca3af", display: "block" }}>
                            {row.user.bank_name}
                        </span>
                    )}
                </div>
            ),
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            width: "95px",
            cell: (row) => getStatusBadge(row.status),
        },
        {
            name: "Actions",
            width: "135px",
            cell: (row) => {
                const isProcessing = processingId === row.id;
                const isPending = (row.status || "").toLowerCase() === "pending";
                const isApproved = (row.status || "").toLowerCase() === "approved";

                if(!isPending) return (
                    <span style={{ color: "#9ca3af", fontSize: "11px", fontStyle: "italic" }}>
                        {isApproved ? "✓ Approved" : "✗ Rejected"}
                    </span>
                );

                return (
                    <div style={{ display: "flex", gap: "5px" }}>
                        <button
                            className="wr-btn-approve"
                            onClick={() => handleApprove(row)}
                            disabled={isProcessing}
                            style={{
                                padding: "5px 10px",
                                background: isProcessing ? "#9ca3af" : "#22c55e",
                                color: "#fff", border: "none", borderRadius: "6px",
                                cursor: isProcessing ? "not-allowed" : "pointer",
                                fontSize: "11px", fontWeight: "600",
                                display: "flex", alignItems: "center", gap: "3px",
                                minWidth: "56px",
                            }}
                        >
                            {isProcessing
                                ? <span style={{ width: 10, height: 10, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
                                : "✓ OK"
                            }
                        </button>
                        <button
                            className="wr-btn-reject"
                            onClick={() => handleReject(row)}
                            disabled={isProcessing}
                            style={{
                                padding: "5px 8px",
                                background: isProcessing ? "#9ca3af" : "#ef4444",
                                color: "#fff", border: "none", borderRadius: "6px",
                                cursor: isProcessing ? "not-allowed" : "pointer",
                                fontSize: "11px", fontWeight: "600", minWidth: "36px",
                            }}
                        >
                            ✕
                        </button>
                    </div>
                );
            },
        },
    ];

    const filteredData = withdrawRequests.filter((item) => {
        const s = (item.status || "").toLowerCase();
        if(statusFilter !== "all" && s !== statusFilter) return false;
        if(filterText) {
            const q = filterText.toLowerCase();
            return (
                (item.user?.name || "").toLowerCase().includes(q) ||
                (item.user?.phone || "").toString().includes(q) ||
                (item.id || "").toString().includes(q) ||
                (item.transfer_to || "").toLowerCase().includes(q)
            );
        }
        return true;
    });

    const pendingCount = withdrawRequests.filter(r => (r.status || "").toLowerCase() === "pending").length;
    const approvedCount = withdrawRequests.filter(r => (r.status || "").toLowerCase() === "approved").length;
    const rejectedCount = withdrawRequests.filter(r => (r.status || "").toLowerCase() === "rejected").length;
    const totalAmount = withdrawRequests.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
    const pendingAmount = withdrawRequests
        .filter(r => (r.status || "").toLowerCase() === "pending")
        .reduce((s, r) => s + parseFloat(r.amount || 0), 0);

    const subHeaderComponent = (
        <div style={{ width: "100%" }}>
            <div className="wr-stats-grid">
                {[
                    { label: "Total", val: withdrawRequests.length, sub: `₹${totalAmount.toLocaleString("en-IN")}`, clr: "#8b5cf6", bg: "#faf5ff" },
                    { label: "Pending", val: pendingCount, sub: `₹${pendingAmount.toLocaleString("en-IN")}`, clr: "#f59e0b", bg: "#fffbeb" },
                    { label: "Approved", val: approvedCount, sub: null, clr: "#22c55e", bg: "#f0fdf4" },
                    { label: "Rejected", val: rejectedCount, sub: null, clr: "#ef4444", bg: "#fef2f2" },
                ].map(({ label, val, sub, clr, bg }) => (
                    <div key={label} className="wr-stat-card" style={{ "--clr": clr, "--bg": bg }}>
                        <div className="wr-stat-card__label">{label}</div>
                        <div className="wr-stat-card__val">{val}</div>
                        {sub && <div className="wr-stat-card__sub">{sub}</div>}
                    </div>
                ))}
            </div>

            <div className="wr-toolbar">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <input
                    type="text"
                    placeholder="Search name, phone, ID..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </div>
        </div>
    );

    if(isError) return (
        <main style={{ padding: "16px" }}>
            <style>{MOBILE_STYLES}</style>
            <div style={{ textAlign: "center", padding: "40px", background: "#fef2f2", borderRadius: "12px", color: "#dc2626" }}>
                <p style={{ marginBottom: "12px" }}>{error?.data?.message || "Something went wrong"}</p>
                <button onClick={refetch} style={{ padding: "8px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                    Retry
                </button>
            </div>
        </main>
    );

    return (
        <>
            <style>{MOBILE_STYLES}</style>
            <main style={{ padding: "9px", height: "100vh", overflow: "auto" }}>
                <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,.1)" }}>
                    {/* Horizontal scroll wrapper keeps table intact on mobile */}
                    <div className="wr-table-wrap">
                        <DataTable
                            title={<span style={{ fontSize: "16px", fontWeight: "700" }}>Withdraw Requests</span>}
                            columns={columns}
                            data={filteredData}
                            striped
                            pagination
                            highlightOnHover
                            subHeader
                            subHeaderComponent={subHeaderComponent}
                            paginationRowsPerPageOptions={[10, 30, 50, 100]}
                            paginationPerPage={rowsPerPage}
                            onChangeRowsPerPage={(n) => setRowsPerPage(n)}
                            progressPending={isLoading}
                            progressComponent={
                                <div style={{ width: "100%" }}>
                                    {[...Array(8)].map((_, i) => <WithdrawSkeleton key={i} />)}
                                </div>
                            }
                            responsive
                            customStyles={{
                                headRow: { style: { backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb", minHeight: "42px" } },
                                headCells: { style: { fontWeight: "600", fontSize: "12px", color: "#374151", padding: "0 8px" } },
                                rows: { style: { fontSize: "13px", minHeight: "52px" }, highlightOnHoverStyle: { backgroundColor: "#f3f4f6" } },
                                cells: { style: { padding: "4px 8px" } },
                                pagination: { style: { borderTop: "1px solid #e5e7eb", minHeight: "48px", fontSize: "12px" } },
                                subHeader: { style: { padding: "10px 12px 4px" } },
                            }}
                            noDataComponent={
                                <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔍</div>
                                    <p style={{ marginBottom: "12px" }}>No withdraw requests found</p>
                                    {(filterText || statusFilter !== "all") && (
                                        <button
                                            onClick={() => { setFilterText(""); setStatusFilter("all"); }}
                                            style={{ padding: "8px 16px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            }
                        />
                    </div>
                </div>
            </main>
        </>
    );
}