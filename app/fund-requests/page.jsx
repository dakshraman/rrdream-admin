
import { useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    useGetFundRequestsQuery,
    useApproveFundRequestMutation,
    useRejectFundRequestMutation
} from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";

const MOBILE_STYLES = `
  .fr-root {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
  }

  .fr-header-card {
    border: 1px solid #e5e7eb;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    border-radius: 14px;
    padding: 12px;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
    margin-bottom: 12px;
  }

  .fr-title {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .fr-summary {
    margin: 0;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.35;
  }

  .fr-summary strong {
    color: #111827;
    font-weight: 700;
  }

  .fr-metrics {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .fr-metric {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 8px 10px;
  }

  .fr-metric-label {
    margin: 0;
    font-size: 11px;
    color: #6b7280;
  }

  .fr-metric-value {
    margin: 3px 0 0;
    font-size: 16px;
    font-weight: 800;
    color: #111827;
    line-height: 1;
  }

  .fr-metric-sub {
    margin: 3px 0 0;
    font-size: 11px;
    color: #6b7280;
  }

  .fr-filter-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    padding: 10px;
    margin-bottom: 12px;
  }

  .fr-filters {
    display: grid;
    gap: 8px;
  }

  .fr-filters select,
  .fr-filters input {
    width: 100%;
    height: 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 14px;
    outline: none;
    background: #fff;
    font-family: inherit;
    box-sizing: border-box;
  }

  .fr-list {
    display: grid;
    gap: 10px;
    background: transparent;
  }

  .fr-item {
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
  }

  .fr-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  .fr-user {
    min-width: 0;
  }

  .fr-name {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fr-id {
    margin: 4px 0 0;
    font-size: 12px;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fr-status {
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-transform: capitalize;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .fr-meta {
    margin-top: 8px;
    display: grid;
    gap: 4px;
    font-size: 12px;
    color: #4b5563;
  }

  .fr-meta strong {
    color: #111827;
  }

  .fr-amount {
    color: #059669;
    font-size: 16px;
    font-weight: 800;
  }

  .fr-actions {
    margin-top: 10px;
    display: flex;
    gap: 8px;
  }

  .fr-btn {
    border: none;
    border-radius: 8px;
    min-height: 34px;
    padding: 0 12px;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .fr-btn:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .fr-btn-approve {
    background: #22c55e;
  }

  .fr-btn-reject {
    background: #ef4444;
  }

  .fr-note {
    margin-top: 10px;
    font-size: 12px;
    color: #9ca3af;
    font-style: italic;
  }

  .fr-pagination {
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

  .fr-pagination-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #6b7280;
  }

  .fr-pagination-left select {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 12px;
    background: #fff;
    font-family: inherit;
  }

  .fr-pagination-right {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #374151;
  }

  .fr-page-btn {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    min-height: 30px;
    padding: 0 10px;
    background: #fff;
    color: #374151;
    font-size: 12px;
    cursor: pointer;
  }

  .fr-page-btn:disabled {
    cursor: not-allowed;
    background: #f3f4f6;
    color: #9ca3af;
  }

  .fr-empty {
    text-align: center;
    color: #6b7280;
    padding: 30px 10px;
    font-size: 14px;
  }

  .fr-clear-btn,
  .fr-retry-btn {
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

  .fr-clear-btn {
    background: #4f46e5;
  }

  .fr-retry-btn {
    background: #dc2626;
  }
`;

const formatAmount = (amount) => parseFloat(amount || 0).toLocaleString("en-IN");

const formatDateTime = (value) => {
    if(!value) return "N/A";
    const date = new Date(value);
    if(Number.isNaN(date.getTime())) return "N/A";
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
    if(value === "pending") return { label: "Pending", bg: "#fef3c7", color: "#b45309" };
    if(value === "approved") return { label: "Approved", bg: "#dcfce7", color: "#166534" };
    if(value === "rejected") return { label: "Rejected", bg: "#fee2e2", color: "#b91c1c" };
    return { label: status || "N/A", bg: "#f3f4f6", color: "#374151" };
};

const FundItemSkeleton = () => (
    <div className="fr-item">
        <div className="fr-row">
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
            <Skeleton width={160} height={12} style={{ marginTop: 4 }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Skeleton width={80} height={32} />
            <Skeleton width={80} height={32} />
        </div>
    </div>
);

export default function FundRequests() {
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);

    const { data: fundData, isLoading, isError, error, refetch } =
        useGetFundRequestsQuery(undefined, { refetchOnMountOrArgChange: true });
    const [approveFundRequest] = useApproveFundRequestMutation();
    const [rejectFundRequest] = useRejectFundRequestMutation();

    // fundData: { status: true, fund_requests: Array }
    // each: { fund_request_id, amount, status, app_name, transaction_id, user_name, user_phone, created_at }
    const fundRequests = fundData?.fund_requests || fundData?.data?.fund_requests || [];

    const filteredData = useMemo(() => {
        return fundRequests.filter((item) => {
            const status = (item.status || "").toLowerCase();
            if(statusFilter !== "all" && status !== statusFilter) return false;

            if(dateFilter) {
                const itemDate = item.created_at
                    ? item.created_at.toString().split("T")[0].split(" ")[0]
                    : "";
                if(itemDate !== dateFilter) return false;
            }

            if(!filterText) return true;
            const query = filterText.toLowerCase();
            return (
                (item.user_name || "").toLowerCase().includes(query) ||
                (item.user_phone || "").toString().includes(query) ||
                (item.fund_request_id || item.id || "").toString().includes(query) ||
                (item.transaction_id || "").toString().toLowerCase().includes(query) ||
                (item.app_name || "").toLowerCase().includes(query)
            );
        });
    }, [fundRequests, filterText, statusFilter, dateFilter]);

    const totalRows = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    useEffect(() => { setCurrentPage(1); }, [filterText, statusFilter, dateFilter, rowsPerPage]);

    useEffect(() => {
        if(currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, currentPage, rowsPerPage]);

    const showFrom = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const showTo = Math.min(currentPage * rowsPerPage, totalRows);

    const pendingCount = fundRequests.filter((r) => (r.status || "").toLowerCase() === "pending").length;
    const approvedCount = fundRequests.filter((r) => (r.status || "").toLowerCase() === "approved").length;
    const rejectedCount = fundRequests.filter((r) => (r.status || "").toLowerCase() === "rejected").length;
    const totalAmount = fundRequests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const pendingAmount = fundRequests
        .filter((r) => (r.status || "").toLowerCase() === "pending")
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    const handleApprove = async (row) => {
        const userName = row.user_name || "User";
        if(!window.confirm(`Approve ₹${formatAmount(row.amount)} for ${userName}?`)) return;
        const requestId = row.fund_request_id || row.id;
        setProcessingId(requestId);
        try {
            const response = await approveFundRequest(requestId).unwrap();
            toast.success(response?.message || "Fund request approved successfully!");
            refetch();
        } catch(err) {
            const errorMessage =
                err?.data?.errors?.fund_request_id?.[0] ||
                err?.data?.errors?.amount?.[0] ||
                err?.data?.message ||
                err?.message ||
                "Failed to approve fund request";
            toast.error(errorMessage);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (row) => {
        const userName = row.user_name || "User";
        if(!window.confirm(`Reject ₹${formatAmount(row.amount)} request from ${userName}?`)) return;
        const requestId = row.fund_request_id || row.id;
        setProcessingId(requestId);
        try {
            const response = await rejectFundRequest(requestId).unwrap();
            toast.success(response?.message || "Fund request rejected successfully!");
            refetch();
        } catch(err) {
            const errorMessage =
                err?.data?.errors?.id?.[0] ||
                err?.data?.message ||
                err?.message ||
                "Failed to reject fund request";
            toast.error(errorMessage);
        } finally {
            setProcessingId(null);
        }
    };

    const clearFilters = () => {
        setFilterText("");
        setStatusFilter("all");
        setDateFilter("");
    };

    if(isError) {
        return (
            <>
                <style>{MOBILE_STYLES}</style>
                <main style={{ padding: "12px", overflow: "auto", WebkitOverflowScrolling: "touch" }}>
                    <div className="fr-root">
                        <h1 className="fr-title">Fund Requests</h1>
                        <div className="fr-empty">
                            <p style={{ margin: 0 }}>{error?.data?.message || "Something went wrong"}</p>
                            <button className="fr-retry-btn" onClick={refetch}>Retry</button>
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
                <div className="fr-root">

                    {/* Header / Stats Card */}
                    <div className="fr-header-card">
                        <h1 className="fr-title">Fund Requests</h1>
                        <p className="fr-summary">
                            Total amount: <strong>₹{formatAmount(totalAmount)}</strong>
                        </p>
                        <div className="fr-metrics">
                            <div className="fr-metric">
                                <p className="fr-metric-label">Total Requests</p>
                                <p className="fr-metric-value">{fundRequests.length}</p>
                            </div>
                            <div className="fr-metric">
                                <p className="fr-metric-label">Pending</p>
                                <p className="fr-metric-value">{pendingCount}</p>
                                <p className="fr-metric-sub">₹{formatAmount(pendingAmount)}</p>
                            </div>
                            <div className="fr-metric">
                                <p className="fr-metric-label">Approved</p>
                                <p className="fr-metric-value">{approvedCount}</p>
                            </div>
                            <div className="fr-metric">
                                <p className="fr-metric-label">Rejected</p>
                                <p className="fr-metric-value">{rejectedCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters Card */}
                    <div className="fr-filter-card">
                        <div className="fr-filters">
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Search name, phone, ID, transaction..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="fr-list">
                        {isLoading && [...Array(6)].map((_, idx) => <FundItemSkeleton key={idx} />)}

                        {!isLoading && totalRows === 0 && (
                            <div className="fr-empty">
                                <p style={{ margin: 0 }}>No fund requests found</p>
                                {(filterText || statusFilter !== "all" || dateFilter) && (
                                    <button className="fr-clear-btn" onClick={clearFilters}>
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {!isLoading && paginatedData.map((row) => {
                            const requestId = row.fund_request_id || row.id;
                            const status = getStatusMeta(row.status);
                            const isPending = (row.status || "").toLowerCase() === "pending";
                            const isProcessing = processingId === requestId;

                            return (
                                <article className="fr-item" key={requestId}>
                                    <div className="fr-row">
                                        <div className="fr-user">
                                            <p className="fr-name">{row.user_name || "N/A"}</p>
                                            <p className="fr-id">
                                                ID: #{requestId} | {row.user_phone || "N/A"}
                                            </p>
                                        </div>
                                        <span
                                            className="fr-status"
                                            style={{ background: status.bg, color: status.color }}
                                        >
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="fr-meta">
                                        <span className="fr-amount">₹{formatAmount(row.amount)}</span>
                                        <span>App: <strong>{row.app_name || "N/A"}</strong></span>
                                        <span>Transaction ID: <strong>{row.transaction_id || "N/A"}</strong></span>
                                        <span>Created: <strong>{formatDateTime(row.created_at)}</strong></span>
                                    </div>

                                    {isPending ? (
                                        <div className="fr-actions">
                                            <button
                                                className="fr-btn fr-btn-approve"
                                                onClick={() => handleApprove(row)}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? "Processing..." : "Approve"}
                                            </button>
                                            <button
                                                className="fr-btn fr-btn-reject"
                                                onClick={() => handleReject(row)}
                                                disabled={isProcessing}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="fr-note">No action available</div>
                                    )}
                                </article>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {!isLoading && totalRows > 0 && (
                        <div className="fr-pagination">
                            <div className="fr-pagination-left">
                                <span>Showing {showFrom}–{showTo} of {totalRows}</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={30}>30</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className="fr-pagination-right">
                                <button
                                    className="fr-page-btn"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </button>
                                <span>Page {currentPage}/{totalPages}</span>
                                <button
                                    className="fr-page-btn"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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