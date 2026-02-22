'use client';
import { useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    useGetWithdrawRequestsQuery,
    useUpdateWithdrawStatusMutation
} from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";

const MOBILE_STYLES = `
  .wr-root {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
  }

  .wr-header-card {
    border: 1px solid #e5e7eb;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    border-radius: 14px;
    padding: 12px;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
    margin-bottom: 12px;
  }

  .wr-title {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .wr-summary {
    margin: 0;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.35;
  }

  .wr-summary strong {
    color: #111827;
    font-weight: 700;
  }

  .wr-metrics {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .wr-metric {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 8px 10px;
  }

  .wr-metric-label {
    margin: 0;
    font-size: 11px;
    color: #6b7280;
  }

  .wr-metric-value {
    margin: 3px 0 0;
    font-size: 16px;
    font-weight: 800;
    color: #111827;
    line-height: 1;
  }

  .wr-metric-sub {
    margin: 3px 0 0;
    font-size: 11px;
    color: #6b7280;
  }

  .wr-filter-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    padding: 10px;
    margin-bottom: 12px;
  }

  .wr-filters {
    display: grid;
    gap: 8px;
  }

  .wr-filters select,
  .wr-filters input {
    width: 100%;
    height: 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 14px;
    outline: none;
    background: #fff;
    font-family: inherit;
  }

  .wr-list {
    display: grid;
    gap: 10px;
    background: transparent;
  }

  .wr-item {
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
  }

  .wr-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  .wr-user {
    min-width: 0;
  }

  .wr-name {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .wr-id {
    margin: 4px 0 0;
    font-size: 12px;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .wr-status {
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-transform: capitalize;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .wr-meta {
    margin-top: 8px;
    display: grid;
    gap: 4px;
    font-size: 12px;
    color: #4b5563;
  }

  .wr-meta strong {
    color: #111827;
  }

  .wr-amount {
    color: #059669;
    font-size: 16px;
    font-weight: 800;
  }

  .wr-actions {
    margin-top: 10px;
    display: flex;
    gap: 8px;
  }

  .wr-btn {
    border: none;
    border-radius: 8px;
    min-height: 34px;
    padding: 0 12px;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .wr-btn:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .wr-btn-approve {
    background: #22c55e;
  }

  .wr-btn-reject {
    background: #ef4444;
  }

  .wr-note {
    margin-top: 10px;
    font-size: 12px;
    color: #9ca3af;
    font-style: italic;
  }

  .wr-pagination {
    margin-top: 12px;
    padding: 10px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .wr-pagination-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #6b7280;
  }

  .wr-pagination-left select {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 12px;
    background: #fff;
    font-family: inherit;
  }

  .wr-pagination-right {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #374151;
  }

  .wr-page-btn {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    min-height: 30px;
    padding: 0 10px;
    background: #fff;
    color: #374151;
    font-size: 12px;
    cursor: pointer;
  }

  .wr-page-btn:disabled {
    cursor: not-allowed;
    background: #f3f4f6;
    color: #9ca3af;
  }

  .wr-empty {
    text-align: center;
    color: #6b7280;
    padding: 30px 10px;
    font-size: 14px;
  }

  .wr-clear-btn,
  .wr-retry-btn {
    border: none;
    border-radius: 8px;
    min-height: 34px;
    padding: 0 14px;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 10px;
  }

  .wr-clear-btn {
    background: #4f46e5;
  }

  .wr-retry-btn {
    background: #dc2626;
  }
`;

const formatAmount = (amount) => parseFloat(amount || 0).toLocaleString("en-IN");

const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getStatusMeta = (status) => {
    const value = (status || "").toLowerCase();
    if (value === "pending") return { label: "Pending", bg: "#fef3c7", color: "#b45309" };
    if (value === "approved") return { label: "Approved", bg: "#dcfce7", color: "#166534" };
    if (value === "rejected") return { label: "Rejected", bg: "#fee2e2", color: "#b91c1c" };
    return { label: status || "N/A", bg: "#f3f4f6", color: "#374151" };
};

const WithdrawItemSkeleton = () => (
    <div className="wr-item">
        <div className="wr-row">
            <div style={{ minWidth: 0, flex: 1 }}>
                <Skeleton width={140} height={15} />
                <Skeleton width={120} height={12} style={{ marginTop: 4 }} />
            </div>
            <Skeleton width={75} height={18} />
        </div>
        <div style={{ marginTop: 8 }}>
            <Skeleton width={100} height={15} />
            <Skeleton width={170} height={12} style={{ marginTop: 4 }} />
            <Skeleton width={190} height={12} style={{ marginTop: 4 }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Skeleton width={80} height={32} />
            <Skeleton width={80} height={32} />
        </div>
    </div>
);

export default function WithdrawRequests() {
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [processingId, setProcessingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);

    const { data: withdrawData, isLoading, isError, error, refetch } =
        useGetWithdrawRequestsQuery(undefined, { refetchOnMountOrArgChange: true });
    const [updateWithdrawStatus] = useUpdateWithdrawStatusMutation();

    const withdrawRequests = withdrawData?.withdraw_requests || [];

    const filteredData = useMemo(() => {
        return withdrawRequests.filter((item) => {
            const status = (item.status || "").toLowerCase();
            if (statusFilter !== "all" && status !== statusFilter) return false;

            if (!filterText) return true;
            const query = filterText.toLowerCase();
            return (
                (item.user?.name || "").toLowerCase().includes(query) ||
                (item.user?.phone || "").toString().includes(query) ||
                (item.id || "").toString().includes(query) ||
                (item.transfer_to || "").toLowerCase().includes(query)
            );
        });
    }, [withdrawRequests, filterText, statusFilter]);

    const totalRows = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    useEffect(() => {
        setCurrentPage(1);
    }, [filterText, statusFilter, rowsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, currentPage, rowsPerPage]);

    const showFrom = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const showTo = Math.min(currentPage * rowsPerPage, totalRows);

    const pendingCount = withdrawRequests.filter((r) => (r.status || "").toLowerCase() === "pending").length;
    const approvedCount = withdrawRequests.filter((r) => (r.status || "").toLowerCase() === "approved").length;
    const rejectedCount = withdrawRequests.filter((r) => (r.status || "").toLowerCase() === "rejected").length;
    const totalAmount = withdrawRequests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const pendingAmount = withdrawRequests
        .filter((r) => (r.status || "").toLowerCase() === "pending")
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    const handleApprove = async (row) => {
        if (!window.confirm(`Approve Rs ${formatAmount(row.amount)} for ${row.user?.name || "User"}?`)) return;
        setProcessingId(row.id);
        try {
            const response = await updateWithdrawStatus({ id: row.id, status: "approved" }).unwrap();
            toast.success(response?.message || "Approved");
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to approve");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (row) => {
        if (!window.confirm(`Reject Rs ${formatAmount(row.amount)} for ${row.user?.name || "User"}?`)) return;
        setProcessingId(row.id);
        try {
            const response = await updateWithdrawStatus({ id: row.id, status: "rejected" }).unwrap();
            toast.success(response?.message || "Rejected");
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to reject");
        } finally {
            setProcessingId(null);
        }
    };

    if (isError) {
        return (
            <>
                <style>{MOBILE_STYLES}</style>
                <main style={{ padding: "12px", overflow: "auto", WebkitOverflowScrolling: "touch" }}>
                    <div className="wr-root">
                        <h1 className="wr-title">Withdraw Requests</h1>
                        <div className="wr-empty">
                            <p style={{ margin: 0 }}>{error?.data?.message || "Something went wrong"}</p>
                            <button className="wr-retry-btn" onClick={refetch}>Retry</button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <style>{MOBILE_STYLES}</style>
            <main style={{ padding: "12px", overflow: "auto", WebkitOverflowScrolling: "touch" }}>
                <div className="wr-root">
                    <div className="wr-header-card">
                        <h1 className="wr-title">Withdraw Requests</h1>
                        <p className="wr-summary">
                            Total amount: <strong>Rs {formatAmount(totalAmount)}</strong>
                        </p>
                        <div className="wr-metrics">
                            <div className="wr-metric">
                                <p className="wr-metric-label">Total Requests</p>
                                <p className="wr-metric-value">{withdrawRequests.length}</p>
                            </div>
                            <div className="wr-metric">
                                <p className="wr-metric-label">Pending</p>
                                <p className="wr-metric-value">{pendingCount}</p>
                                <p className="wr-metric-sub">Rs {formatAmount(pendingAmount)}</p>
                            </div>
                            <div className="wr-metric">
                                <p className="wr-metric-label">Approved</p>
                                <p className="wr-metric-value">{approvedCount}</p>
                            </div>
                            <div className="wr-metric">
                                <p className="wr-metric-label">Rejected</p>
                                <p className="wr-metric-value">{rejectedCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="wr-filter-card">
                        <div className="wr-filters">
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Search name, phone, ID, transfer..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="wr-list">
                        {isLoading && [...Array(6)].map((_, idx) => <WithdrawItemSkeleton key={idx} />)}

                        {!isLoading && totalRows === 0 && (
                            <div className="wr-empty">
                                <p style={{ margin: 0 }}>No withdraw requests found</p>
                                {(filterText || statusFilter !== "all") && (
                                    <button
                                        className="wr-clear-btn"
                                        onClick={() => {
                                            setFilterText("");
                                            setStatusFilter("all");
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {!isLoading && paginatedData.map((row) => {
                            const status = getStatusMeta(row.status);
                            const isPending = (row.status || "").toLowerCase() === "pending";
                            const isProcessing = processingId === row.id;

                            return (
                                <article className="wr-item" key={row.id}>
                                    <div className="wr-row">
                                        <div className="wr-user">
                                            <p className="wr-name">{row.user?.name || "N/A"}</p>
                                            <p className="wr-id">ID: #{row.id} | {row.user?.phone || "N/A"}</p>
                                        </div>
                                        <span className="wr-status" style={{ background: status.bg, color: status.color }}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="wr-meta">
                                        <span className="wr-amount">Rs {formatAmount(row.amount)}</span>
                                        <span>Transfer To: <strong>{row.transfer_to || "N/A"}</strong></span>
                                        <span>Created: <strong>{formatDateTime(row.created_at)}</strong></span>
                                    </div>

                                    {isPending ? (
                                        <div className="wr-actions">
                                            <button
                                                className="wr-btn wr-btn-approve"
                                                onClick={() => handleApprove(row)}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? "Processing..." : "Approve"}
                                            </button>
                                            <button
                                                className="wr-btn wr-btn-reject"
                                                onClick={() => handleReject(row)}
                                                disabled={isProcessing}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="wr-note">No action available</div>
                                    )}
                                </article>
                            );
                        })}
                    </div>

                    {!isLoading && totalRows > 0 && (
                        <div className="wr-pagination">
                            <div className="wr-pagination-left">
                                <span>Showing {showFrom}-{showTo} of {totalRows}</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={30}>30</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="wr-pagination-right">
                                <button
                                    className="wr-page-btn"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </button>
                                <span>Page {currentPage}/{totalPages}</span>
                                <button
                                    className="wr-page-btn"
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={currentPage >= totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
