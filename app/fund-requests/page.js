import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetFundRequestsQuery, useApproveFundRequestMutation, useRejectFundRequestMutation } from "@/store/backendSlice/apiAPISlice";
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
    if (!value)
        return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "N/A";
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
    if (value === "pending")
        return { label: "Pending", bg: "#fef3c7", color: "#b45309" };
    if (value === "approved")
        return { label: "Approved", bg: "#dcfce7", color: "#166534" };
    if (value === "rejected")
        return { label: "Rejected", bg: "#fee2e2", color: "#b91c1c" };
    return { label: status || "N/A", bg: "#f3f4f6", color: "#374151" };
};
const FundItemSkeleton = () => (_jsxs("div", { className: "fr-item", children: [_jsxs("div", { className: "fr-row", children: [_jsxs("div", { style: { minWidth: 0, flex: 1 }, children: [_jsx(Skeleton, { width: 140, height: 15 }), _jsx(Skeleton, { width: 120, height: 12, style: { marginTop: 4 } })] }), _jsx(Skeleton, { width: 75, height: 18 })] }), _jsxs("div", { style: { marginTop: 8 }, children: [_jsx(Skeleton, { width: 100, height: 15 }), _jsx(Skeleton, { width: 170, height: 12, style: { marginTop: 4 } }), _jsx(Skeleton, { width: 190, height: 12, style: { marginTop: 4 } }), _jsx(Skeleton, { width: 160, height: 12, style: { marginTop: 4 } })] }), _jsxs("div", { style: { display: "flex", gap: 8, marginTop: 10 }, children: [_jsx(Skeleton, { width: 80, height: 32 }), _jsx(Skeleton, { width: 80, height: 32 })] })] }));
export default function FundRequests() {
    var _a, _b;
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const { data: fundData, isLoading, isError, error, refetch } = useGetFundRequestsQuery(undefined, { refetchOnMountOrArgChange: true });
    const [approveFundRequest] = useApproveFundRequestMutation();
    const [rejectFundRequest] = useRejectFundRequestMutation();
    // fundData: { status: true, fund_requests: Array }
    // each: { fund_request_id, amount, status, app_name, transaction_id, user_name, user_phone, created_at }
    const fundRequests = (fundData === null || fundData === void 0 ? void 0 : fundData.fund_requests) || ((_a = fundData === null || fundData === void 0 ? void 0 : fundData.data) === null || _a === void 0 ? void 0 : _a.fund_requests) || [];
    const filteredData = useMemo(() => {
        return fundRequests.filter((item) => {
            const status = (item.status || "").toLowerCase();
            if (statusFilter !== "all" && status !== statusFilter)
                return false;
            if (dateFilter) {
                const itemDate = item.created_at
                    ? item.created_at.toString().split("T")[0].split(" ")[0]
                    : "";
                if (itemDate !== dateFilter)
                    return false;
            }
            if (!filterText)
                return true;
            const query = filterText.toLowerCase();
            return ((item.user_name || "").toLowerCase().includes(query) ||
                (item.user_phone || "").toString().includes(query) ||
                (item.fund_request_id || item.id || "").toString().includes(query) ||
                (item.transaction_id || "").toString().toLowerCase().includes(query) ||
                (item.app_name || "").toLowerCase().includes(query));
        });
    }, [fundRequests, filterText, statusFilter, dateFilter]);
    const totalRows = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    useEffect(() => { setCurrentPage(1); }, [filterText, statusFilter, dateFilter, rowsPerPage]);
    useEffect(() => {
        if (currentPage > totalPages)
            setCurrentPage(totalPages);
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
        var _a, _b, _c, _d, _e, _f, _g;
        const userName = row.user_name || "User";
        if (!window.confirm(`Approve ₹${formatAmount(row.amount)} for ${userName}?`))
            return;
        const requestId = row.fund_request_id || row.id;
        setProcessingId(requestId);
        try {
            const response = await approveFundRequest(requestId).unwrap();
            toast.success((response === null || response === void 0 ? void 0 : response.message) || "Fund request approved successfully!");
            refetch();
        }
        catch (err) {
            const errorMessage = ((_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.errors) === null || _b === void 0 ? void 0 : _b.fund_request_id) === null || _c === void 0 ? void 0 : _c[0]) ||
                ((_f = (_e = (_d = err === null || err === void 0 ? void 0 : err.data) === null || _d === void 0 ? void 0 : _d.errors) === null || _e === void 0 ? void 0 : _e.amount) === null || _f === void 0 ? void 0 : _f[0]) ||
                ((_g = err === null || err === void 0 ? void 0 : err.data) === null || _g === void 0 ? void 0 : _g.message) ||
                (err === null || err === void 0 ? void 0 : err.message) ||
                "Failed to approve fund request";
            toast.error(errorMessage);
        }
        finally {
            setProcessingId(null);
        }
    };
    const handleReject = async (row) => {
        var _a, _b, _c, _d;
        const userName = row.user_name || "User";
        if (!window.confirm(`Reject ₹${formatAmount(row.amount)} request from ${userName}?`))
            return;
        const requestId = row.fund_request_id || row.id;
        setProcessingId(requestId);
        try {
            const response = await rejectFundRequest(requestId).unwrap();
            toast.success((response === null || response === void 0 ? void 0 : response.message) || "Fund request rejected successfully!");
            refetch();
        }
        catch (err) {
            const errorMessage = ((_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.errors) === null || _b === void 0 ? void 0 : _b.id) === null || _c === void 0 ? void 0 : _c[0]) ||
                ((_d = err === null || err === void 0 ? void 0 : err.data) === null || _d === void 0 ? void 0 : _d.message) ||
                (err === null || err === void 0 ? void 0 : err.message) ||
                "Failed to reject fund request";
            toast.error(errorMessage);
        }
        finally {
            setProcessingId(null);
        }
    };
    const clearFilters = () => {
        setFilterText("");
        setStatusFilter("all");
        setDateFilter("");
    };
    if (isError) {
        return (_jsxs(_Fragment, { children: [_jsx("style", { children: MOBILE_STYLES }), _jsx("main", { style: { padding: "12px", overflow: "auto", WebkitOverflowScrolling: "touch" }, children: _jsxs("div", { className: "fr-root", children: [_jsx("h1", { className: "fr-title", children: "Fund Requests" }), _jsxs("div", { className: "fr-empty", children: [_jsx("p", { style: { margin: 0 }, children: ((_b = error === null || error === void 0 ? void 0 : error.data) === null || _b === void 0 ? void 0 : _b.message) || "Something went wrong" }), _jsx("button", { className: "fr-retry-btn", onClick: refetch, children: "Retry" })] })] }) })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: MOBILE_STYLES }), _jsx("main", { style: { padding: "12px", overflow: "auto", WebkitOverflowScrolling: "touch" }, children: _jsxs("div", { className: "fr-root", children: [_jsxs("div", { className: "fr-header-card", children: [_jsx("h1", { className: "fr-title", children: "Fund Requests" }), _jsxs("p", { className: "fr-summary", children: ["Total amount: ", _jsxs("strong", { children: ["\u20B9", formatAmount(totalAmount)] })] }), _jsxs("div", { className: "fr-metrics", children: [_jsxs("div", { className: "fr-metric", children: [_jsx("p", { className: "fr-metric-label", children: "Total Requests" }), _jsx("p", { className: "fr-metric-value", children: fundRequests.length })] }), _jsxs("div", { className: "fr-metric", children: [_jsx("p", { className: "fr-metric-label", children: "Pending" }), _jsx("p", { className: "fr-metric-value", children: pendingCount }), _jsxs("p", { className: "fr-metric-sub", children: ["\u20B9", formatAmount(pendingAmount)] })] }), _jsxs("div", { className: "fr-metric", children: [_jsx("p", { className: "fr-metric-label", children: "Approved" }), _jsx("p", { className: "fr-metric-value", children: approvedCount })] }), _jsxs("div", { className: "fr-metric", children: [_jsx("p", { className: "fr-metric-label", children: "Rejected" }), _jsx("p", { className: "fr-metric-value", children: rejectedCount })] })] })] }), _jsx("div", { className: "fr-filter-card", children: _jsxs("div", { className: "fr-filters", children: [_jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" })] }), _jsx("input", { type: "date", value: dateFilter, onChange: (e) => setDateFilter(e.target.value) }), _jsx("input", { type: "text", placeholder: "Search name, phone, ID, transaction...", value: filterText, onChange: (e) => setFilterText(e.target.value) })] }) }), _jsxs("div", { className: "fr-list", children: [isLoading && [...Array(6)].map((_, idx) => _jsx(FundItemSkeleton, {}, idx)), !isLoading && totalRows === 0 && (_jsxs("div", { className: "fr-empty", children: [_jsx("p", { style: { margin: 0 }, children: "No fund requests found" }), (filterText || statusFilter !== "all" || dateFilter) && (_jsx("button", { className: "fr-clear-btn", onClick: clearFilters, children: "Clear Filters" }))] })), !isLoading && paginatedData.map((row) => {
                                    const requestId = row.fund_request_id || row.id;
                                    const status = getStatusMeta(row.status);
                                    const isPending = (row.status || "").toLowerCase() === "pending";
                                    const isProcessing = processingId === requestId;
                                    return (_jsxs("article", { className: "fr-item", children: [_jsxs("div", { className: "fr-row", children: [_jsxs("div", { className: "fr-user", children: [_jsx("p", { className: "fr-name", children: row.user_name || "N/A" }), _jsxs("p", { className: "fr-id", children: ["ID: #", requestId, " | ", row.user_phone || "N/A"] })] }), _jsx("span", { className: "fr-status", style: { background: status.bg, color: status.color }, children: status.label })] }), _jsxs("div", { className: "fr-meta", children: [_jsxs("span", { className: "fr-amount", children: ["\u20B9", formatAmount(row.amount)] }), _jsxs("span", { children: ["App: ", _jsx("strong", { children: row.app_name || "N/A" })] }), _jsxs("span", { children: ["Transaction ID: ", _jsx("strong", { children: row.transaction_id || "N/A" })] }), _jsxs("span", { children: ["Created: ", _jsx("strong", { children: formatDateTime(row.created_at) })] })] }), isPending ? (_jsxs("div", { className: "fr-actions", children: [_jsx("button", { className: "fr-btn fr-btn-approve", onClick: () => handleApprove(row), disabled: isProcessing, children: isProcessing ? "Processing..." : "Approve" }), _jsx("button", { className: "fr-btn fr-btn-reject", onClick: () => handleReject(row), disabled: isProcessing, children: "Reject" })] })) : (_jsx("div", { className: "fr-note", children: "No action available" }))] }, requestId));
                                })] }), !isLoading && totalRows > 0 && (_jsxs("div", { className: "fr-pagination", children: [_jsxs("div", { className: "fr-pagination-left", children: [_jsxs("span", { children: ["Showing ", showFrom, "\u2013", showTo, " of ", totalRows] }), _jsxs("select", { value: rowsPerPage, onChange: (e) => setRowsPerPage(Number(e.target.value)), children: [_jsx("option", { value: 10, children: "10" }), _jsx("option", { value: 20, children: "20" }), _jsx("option", { value: 30, children: "30" }), _jsx("option", { value: 50, children: "50" }), _jsx("option", { value: 100, children: "100" })] })] }), _jsxs("div", { className: "fr-pagination-right", children: [_jsx("button", { className: "fr-page-btn", onClick: () => setCurrentPage((p) => Math.max(1, p - 1)), disabled: currentPage === 1, children: "Prev" }), _jsxs("span", { children: ["Page ", currentPage, "/", totalPages] }), _jsx("button", { className: "fr-page-btn", onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)), disabled: currentPage >= totalPages, children: "Next" })] })] }))] }) })] }));
}
