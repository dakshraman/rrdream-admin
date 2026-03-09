import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetWithdrawRequestsQuery, useUpdateWithdrawStatusMutation } from "@/store/backendSlice/apiAPISlice";
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
const hasTextValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";
const getTransferKeys = (transferTo) => {
    const normalized = String(transferTo || "")
        .trim()
        .toLowerCase()
        .replace(/[-\s]+/g, "_");
    if (!normalized)
        return [];
    const keys = [normalized];
    if (normalized === "gpay" || normalized === "googlepay") {
        keys.push("google_pay");
    }
    if (normalized === "phonepe" || normalized === "phone_pay") {
        keys.push("phone_pay");
    }
    if (normalized === "account_number") {
        keys.push("acccount_number");
    }
    return [...new Set(keys)];
};
const getTransferDestinationValue = (row) => {
    const user = (row === null || row === void 0 ? void 0 : row.user) || {};
    const keys = getTransferKeys(row === null || row === void 0 ? void 0 : row.transfer_to);
    for (const key of keys) {
        const value = user === null || user === void 0 ? void 0 : user[key];
        if (hasTextValue(value))
            return String(value);
    }
    return "N/A";
};
const WithdrawItemSkeleton = () => (_jsxs("div", { className: "wr-item", children: [_jsxs("div", { className: "wr-row", children: [_jsxs("div", { style: { minWidth: 0, flex: 1 }, children: [_jsx(Skeleton, { width: 140, height: 15 }), _jsx(Skeleton, { width: 120, height: 12, style: { marginTop: 4 } })] }), _jsx(Skeleton, { width: 75, height: 18 })] }), _jsxs("div", { style: { marginTop: 8 }, children: [_jsx(Skeleton, { width: 100, height: 15 }), _jsx(Skeleton, { width: 170, height: 12, style: { marginTop: 4 } }), _jsx(Skeleton, { width: 190, height: 12, style: { marginTop: 4 } })] }), _jsxs("div", { style: { display: "flex", gap: 8, marginTop: 10 }, children: [_jsx(Skeleton, { width: 80, height: 32 }), _jsx(Skeleton, { width: 80, height: 32 })] })] }));
export default function WithdrawRequests() {
    var _a;
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [processingId, setProcessingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const { data: withdrawData, isLoading, isError, error, refetch } = useGetWithdrawRequestsQuery(undefined, { refetchOnMountOrArgChange: true });
    const [updateWithdrawStatus] = useUpdateWithdrawStatusMutation();
    const withdrawRequests = (withdrawData === null || withdrawData === void 0 ? void 0 : withdrawData.withdraw_requests) || [];
    const filteredData = useMemo(() => {
        return withdrawRequests.filter((item) => {
            var _a, _b;
            const status = (item.status || "").toLowerCase();
            if (statusFilter !== "all" && status !== statusFilter)
                return false;
            if (!filterText)
                return true;
            const query = filterText.toLowerCase();
            const transferValue = getTransferDestinationValue(item).toLowerCase();
            return ((((_a = item.user) === null || _a === void 0 ? void 0 : _a.name) || "").toLowerCase().includes(query) ||
                (((_b = item.user) === null || _b === void 0 ? void 0 : _b.phone) || "").toString().includes(query) ||
                (item.id || "").toString().includes(query) ||
                (item.transfer_to || "").toLowerCase().includes(query) ||
                transferValue.includes(query));
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
        var _a, _b;
        if (!window.confirm(`Approve Rs ${formatAmount(row.amount)} for ${((_a = row.user) === null || _a === void 0 ? void 0 : _a.name) || "User"}?`))
            return;
        setProcessingId(row.id);
        try {
            const response = await updateWithdrawStatus({ id: row.id, status: "approved" }).unwrap();
            toast.success((response === null || response === void 0 ? void 0 : response.message) || "Approved");
            refetch();
        }
        catch (err) {
            toast.error(((_b = err === null || err === void 0 ? void 0 : err.data) === null || _b === void 0 ? void 0 : _b.message) || "Failed to approve");
        }
        finally {
            setProcessingId(null);
        }
    };
    const handleReject = async (row) => {
        var _a, _b;
        if (!window.confirm(`Reject Rs ${formatAmount(row.amount)} for ${((_a = row.user) === null || _a === void 0 ? void 0 : _a.name) || "User"}?`))
            return;
        setProcessingId(row.id);
        try {
            const response = await updateWithdrawStatus({ id: row.id, status: "rejected" }).unwrap();
            toast.success((response === null || response === void 0 ? void 0 : response.message) || "Rejected");
            refetch();
        }
        catch (err) {
            toast.error(((_b = err === null || err === void 0 ? void 0 : err.data) === null || _b === void 0 ? void 0 : _b.message) || "Failed to reject");
        }
        finally {
            setProcessingId(null);
        }
    };
    if (isError) {
        return (_jsxs(_Fragment, { children: [_jsx("style", { children: MOBILE_STYLES }), _jsx("main", { style: { padding: "12px", overflow: "auto", WebkitOverflowScrolling: "touch" }, children: _jsxs("div", { className: "wr-root", children: [_jsx("h1", { className: "wr-title", children: "Withdraw Requests" }), _jsxs("div", { className: "wr-empty", children: [_jsx("p", { style: { margin: 0 }, children: ((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.message) || "Something went wrong" }), _jsx("button", { className: "wr-retry-btn", onClick: refetch, children: "Retry" })] })] }) })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: MOBILE_STYLES }), _jsx("main", { style: { padding: "12px", overflow: "auto", WebkitOverflowScrolling: "touch" }, children: _jsxs("div", { className: "wr-root", children: [_jsxs("div", { className: "wr-header-card", children: [_jsx("h1", { className: "wr-title", children: "Withdraw Requests" }), _jsxs("p", { className: "wr-summary", children: ["Total amount: ", _jsxs("strong", { children: ["Rs ", formatAmount(totalAmount)] })] }), _jsxs("div", { className: "wr-metrics", children: [_jsxs("div", { className: "wr-metric", children: [_jsx("p", { className: "wr-metric-label", children: "Total Requests" }), _jsx("p", { className: "wr-metric-value", children: withdrawRequests.length })] }), _jsxs("div", { className: "wr-metric", children: [_jsx("p", { className: "wr-metric-label", children: "Pending" }), _jsx("p", { className: "wr-metric-value", children: pendingCount }), _jsxs("p", { className: "wr-metric-sub", children: ["Rs ", formatAmount(pendingAmount)] })] }), _jsxs("div", { className: "wr-metric", children: [_jsx("p", { className: "wr-metric-label", children: "Approved" }), _jsx("p", { className: "wr-metric-value", children: approvedCount })] }), _jsxs("div", { className: "wr-metric", children: [_jsx("p", { className: "wr-metric-label", children: "Rejected" }), _jsx("p", { className: "wr-metric-value", children: rejectedCount })] })] })] }), _jsx("div", { className: "wr-filter-card", children: _jsxs("div", { className: "wr-filters", children: [_jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" })] }), _jsx("input", { type: "text", placeholder: "Search name, phone, ID, transfer...", value: filterText, onChange: (e) => setFilterText(e.target.value) })] }) }), _jsxs("div", { className: "wr-list", children: [isLoading && [...Array(6)].map((_, idx) => _jsx(WithdrawItemSkeleton, {}, idx)), !isLoading && totalRows === 0 && (_jsxs("div", { className: "wr-empty", children: [_jsx("p", { style: { margin: 0 }, children: "No withdraw requests found" }), (filterText || statusFilter !== "all") && (_jsx("button", { className: "wr-clear-btn", onClick: () => {
                                                setFilterText("");
                                                setStatusFilter("all");
                                            }, children: "Clear Filters" }))] })), !isLoading && paginatedData.map((row) => {
                                    var _a, _b;
                                    const status = getStatusMeta(row.status);
                                    const isPending = (row.status || "").toLowerCase() === "pending";
                                    const isProcessing = processingId === row.id;
                                    const transferDestinationValue = getTransferDestinationValue(row);
                                    return (_jsxs("article", { className: "wr-item", children: [_jsxs("div", { className: "wr-row", children: [_jsxs("div", { className: "wr-user", children: [_jsx("p", { className: "wr-name", children: ((_a = row.user) === null || _a === void 0 ? void 0 : _a.name) || "N/A" }), _jsxs("p", { className: "wr-id", children: ["ID: #", row.id, " | ", ((_b = row.user) === null || _b === void 0 ? void 0 : _b.phone) || "N/A"] })] }), _jsx("span", { className: "wr-status", style: { background: status.bg, color: status.color }, children: status.label })] }), _jsxs("div", { className: "wr-meta", children: [_jsxs("span", { className: "wr-amount", children: ["Rs ", formatAmount(row.amount)] }), _jsxs("span", { children: ["Transfer To: ", _jsx("strong", { children: row.transfer_to || "N/A" })] }), _jsxs("span", { children: ["Transfer Value: ", _jsx("strong", { children: transferDestinationValue })] }), _jsxs("span", { children: ["Created: ", _jsx("strong", { children: formatDateTime(row.created_at) })] })] }), isPending ? (_jsxs("div", { className: "wr-actions", children: [_jsx("button", { className: "wr-btn wr-btn-approve", onClick: () => handleApprove(row), disabled: isProcessing, children: isProcessing ? "Processing..." : "Approve" }), _jsx("button", { className: "wr-btn wr-btn-reject", onClick: () => handleReject(row), disabled: isProcessing, children: "Reject" })] })) : (_jsx("div", { className: "wr-note", children: "No action available" }))] }, row.id));
                                })] }), !isLoading && totalRows > 0 && (_jsxs("div", { className: "wr-pagination", children: [_jsxs("div", { className: "wr-pagination-left", children: [_jsxs("span", { children: ["Showing ", showFrom, "-", showTo, " of ", totalRows] }), _jsxs("select", { value: rowsPerPage, onChange: (e) => setRowsPerPage(Number(e.target.value)), children: [_jsx("option", { value: 10, children: "10" }), _jsx("option", { value: 20, children: "20" }), _jsx("option", { value: 30, children: "30" }), _jsx("option", { value: 50, children: "50" })] })] }), _jsxs("div", { className: "wr-pagination-right", children: [_jsx("button", { className: "wr-page-btn", onClick: () => setCurrentPage((page) => Math.max(1, page - 1)), disabled: currentPage === 1, children: "Prev" }), _jsxs("span", { children: ["Page ", currentPage, "/", totalPages] }), _jsx("button", { className: "wr-page-btn", onClick: () => setCurrentPage((page) => Math.min(totalPages, page + 1)), disabled: currentPage >= totalPages, children: "Next" })] })] }))] }) })] }));
}
