'use client';
import { useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    useGetFundRequestsQuery,
    useApproveFundRequestMutation,
    useRejectFundRequestMutation
} from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";

const FundSkeleton = () => (
    <div style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: "20px",
        borderBottom: "1px solid #f0f0f0"
    }}>
        <Skeleton width={40} height={20} />
        <Skeleton width={80} height={20} />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Skeleton circle width={40} height={40} />
            <Skeleton width={120} height={16} />
        </div>
        <Skeleton width={100} height={16} />
        <Skeleton width={150} height={16} />
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton width={120} height={16} />
    </div>
);

export default function FundRequests() {
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [processingId, setProcessingId] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data: fundData, isLoading, isError, error, refetch } = useGetFundRequestsQuery();
    const [approveFundRequest] = useApproveFundRequestMutation();
    const [rejectFundRequest] = useRejectFundRequestMutation();

    const fundRequests = fundData?.fund_requests || fundData?.data?.fund_requests || fundData?.data || [];

    console.log("Fund Requests Data:", fundRequests);

    const formatDate = (dateString) => {
        if(!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleApprove = async (row) => {
        console.log("Approving row:", row);

        const userName = row.user_name || "User";
        const confirmApprove = window.confirm(
            `Are you sure you want to approve ₹${row.amount} for ${userName}?`
        );

        if(!confirmApprove) return;

        const requestId = row.fund_request_id || row.id;
        setProcessingId(requestId);

        try {
            console.log("Sending approve request for ID:", requestId);

            // Pass only the ID - API: POST /api/approvefund/{id}
            const response = await approveFundRequest(requestId).unwrap();

            console.log("Approve response:", response);
            toast.success(response?.message || "Fund request approved successfully!");
            refetch();
        } catch(err) {
            console.error("Approve error:", err);
            const errorMessage =
                err?.data?.errors?.fund_request_id?.[0] ||
                err?.data?.errors?.amount?.[0] ||
                err?.data?.errors?.user_id?.[0] ||
                err?.data?.message ||
                err?.message ||
                "Failed to approve fund request";
            toast.error(errorMessage);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (row) => {
        console.log("Rejecting row:", row);

        const userName = row.user_name || "User";
        const confirmReject = window.confirm(
            `Are you sure you want to reject ₹${row.amount} request from ${userName}?`
        );

        if(!confirmReject) return;

        const requestId = row.fund_request_id || row.id;
        setProcessingId(requestId);

        try {
            console.log("Sending reject request for ID:", requestId);

            // Pass only the ID - API: POST /api/rejectfund/{id}
            const response = await rejectFundRequest(requestId).unwrap();

            console.log("Reject response:", response);
            toast.success(response?.message || "Fund request rejected successfully!");
            refetch();
        } catch(err) {
            console.error("Reject error:", err);
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

    const getStatusBadge = (status) => {
        const statusLower = (status || "").toLowerCase();
        const statusStyles = {
            pending: { backgroundColor: "#f59e0b", color: "#fff" },
            approved: { backgroundColor: "#22c55e", color: "#fff" },
            rejected: { backgroundColor: "#ef4444", color: "#fff" },
            completed: { backgroundColor: "#22c55e", color: "#fff" },
            cancelled: { backgroundColor: "#6b7280", color: "#fff" },
        };
        const style = statusStyles[statusLower] || { backgroundColor: "#6b7280", color: "#fff" };
        return (
            <span
                style={{
                    ...style,
                    fontWeight: "500",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    textTransform: "capitalize"
                }}
            >
                {status || "N/A"}
            </span>
        );
    };

    const columns = [
        {
            name: "#",
            selector: (row, index) => index + 1,
            sortable: false,
            width: "60px",
        },
        {
            name: "User Name",
            selector: (row) => row.user_name || "N/A",
            sortable: true,
            cell: (row) => (
                <span style={{ fontWeight: "500" }}>
                    {row.user_name || "N/A"}
                </span>
            ),
            width: "180px",
        },
        {
            name: "Mobile",
            selector: (row) => row.user_phone || "N/A",
            sortable: true,
            cell: (row) => (
                <span style={{ fontFamily: "monospace", fontSize: "14px" }}>
                    {row.user_phone || "N/A"}
                </span>
            ),
            width: "130px",
        },
        {
            name: "Amount",
            selector: (row) => parseFloat(row.amount || 0),
            sortable: true,
            cell: (row) => (
                <span style={{
                    fontWeight: "700",
                    color: "#059669",
                    fontSize: "15px"
                }}>
                    {parseFloat(row.amount || 0).toLocaleString('en-IN')}
                </span>
            ),
            width: "100px",
        },
        {
            name: "Request No.",
            selector: (row) => row.fund_request_id || row.id,
            sortable: true,
            cell: (row) => (
                <span style={{ fontFamily: "monospace", color: "#6b7280" }}>
                    {row.fund_request_id || row.id}
                </span>
            ),
            width: "110px",
        },
        {
            name: "Date",
            selector: (row) => row.created_at,
            sortable: true,
            cell: (row) => (
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    {formatDate(row.created_at)}
                </span>
            ),
            width: "150px",
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => getStatusBadge(row.status),
            width: "110px",
        },
        {
            name: "Action",
            cell: (row) => {
                const requestId = row.fund_request_id || row.id;
                const isProcessing = processingId === requestId;
                const isPending = (row.status || "").toLowerCase() === "pending";

                if(!isPending) {
                    return (
                        <span style={{
                            color: "#9ca3af",
                            fontSize: "12px",
                            fontStyle: "italic"
                        }}>
                            {(row.status || "").toLowerCase() === "approved" ? "✓ Approved" : "✗ Rejected"}
                        </span>
                    );
                }

                return (
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button
                            onClick={() => handleApprove(row)}
                            disabled={isProcessing}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: isProcessing ? "#9ca3af" : "#8b5cf6",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isProcessing ? "not-allowed" : "pointer",
                                fontSize: "12px",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                minWidth: "70px",
                            }}
                        >
                            {isProcessing ? (
                                <span style={{
                                    width: "12px",
                                    height: "12px",
                                    border: "2px solid #fff",
                                    borderTopColor: "transparent",
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                }} />
                            ) : "Approve"}
                        </button>
                        <button
                            onClick={() => handleReject(row)}
                            disabled={isProcessing}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: isProcessing ? "#9ca3af" : "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isProcessing ? "not-allowed" : "pointer",
                                fontSize: "12px",
                                fontWeight: "500",
                                minWidth: "60px",
                            }}
                        >
                            Reject
                        </button>
                    </div>
                );
            },
            width: "180px",
        },
    ];

    const requestsArray = Array.isArray(fundRequests) ? fundRequests : [];

    const filteredData = requestsArray.filter((item) => {
        const itemStatus = (item.status || "").toLowerCase();
        if(statusFilter !== "all" && itemStatus !== statusFilter) {
            return false;
        }

        if(dateFilter) {
            const itemDate = item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : "";
            if(itemDate !== dateFilter) {
                return false;
            }
        }

        if(filterText) {
            const searchText = filterText.toLowerCase();
            const name = (item.user_name || "").toLowerCase();
            const phone = (item.user_phone || "").toString().toLowerCase();
            const id = (item.fund_request_id || item.id || "").toString();
            const transactionId = (item.transaction_id || "").toString().toLowerCase();
            return (
                name.includes(searchText) ||
                phone.includes(searchText) ||
                id.includes(searchText) ||
                transactionId.includes(searchText)
            );
        }
        return true;
    });

    const dateFilteredRequests = requestsArray.filter(item => {
        if(dateFilter) {
            const itemDate = item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : "";
            return itemDate === dateFilter;
        }
        return true;
    });

    const stats = {
        total: dateFilteredRequests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
        approved: dateFilteredRequests
            .filter(r => (r.status || "").toLowerCase() === "approved")
            .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
        rejected: dateFilteredRequests
            .filter(r => (r.status || "").toLowerCase() === "rejected")
            .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
        pending: dateFilteredRequests
            .filter(r => (r.status || "").toLowerCase() === "pending")
            .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
    };

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: "#f9fafb",
                borderBottom: "2px solid #e5e7eb",
            },
        },
        headCells: {
            style: {
                fontWeight: "600",
                fontSize: "13px",
                color: "#374151",
                paddingLeft: "10px",
                paddingRight: "10px",
            },
        },
        rows: {
            style: {
                fontSize: "14px",
                minHeight: "56px",
            },
            highlightOnHoverStyle: {
                backgroundColor: "#f3f4f6",
            },
        },
        cells: {
            style: {
                paddingLeft: "10px",
                paddingRight: "10px",
            },
        },
        pagination: {
            style: {
                borderTop: "1px solid #e5e7eb",
            },
        },
    };

    const SkeletonLoader = () => (
        <div style={{ width: "100%" }}>
            {[...Array(10)].map((_, i) => (
                <FundSkeleton key={i} />
            ))}
        </div>
    );

    if(isError) {
        return (
            <main style={{ padding: "20px" }}>
                <div style={{
                    color: "#dc2626",
                    padding: "40px",
                    textAlign: "center",
                    backgroundColor: "#fef2f2",
                    borderRadius: "12px",
                    border: "1px solid #fecaca"
                }}>
                    <h3 style={{ marginBottom: "10px" }}>Error loading fund requests</h3>
                    <p>{error?.data?.message || error?.message || "Something went wrong"}</p>
                    <button
                        onClick={() => refetch()}
                        style={{
                            marginTop: "15px",
                            padding: "10px 20px",
                            backgroundColor: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        Retry
                    </button>
                </div>
            </main>
        );
    }

    return (
        <>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .filter-row {
                        flex-direction: column !important;
                    }
                    .filter-row input {
                        width: 100% !important;
                        min-width: unset !important;
                    }
                }
                @media (max-width: 480px) {
                    .stats-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            <main style={{ padding: "10px" }}>
                <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    overflow: "hidden"
                }}>

                    <div style={{ padding: "20px" }}>
                        <div style={{
                            display: "flex",
                            gap: "15px",
                            marginBottom: "20px",
                            flexWrap: "wrap"
                        }} className="filter-row">
                            <div style={{ flex: "0 0 200px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    marginBottom: "4px"
                                }}>Date</label>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "2px solid #8b5cf6",
                                        fontSize: "14px",
                                        outline: "none",
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: "200px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    marginBottom: "4px"
                                }}>Search</label>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "1px solid #d1d5db",
                                        fontSize: "14px",
                                        outline: "none",
                                    }}
                                />
                            </div>
                        </div>

                     

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px",
                            marginBottom: "10px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "14px", color: "#6b7280" }}>
                                    Showing: <strong>{filteredData.length}</strong>
                                </span>
                                <button
                                    onClick={() => {
                                        setFilterText("");
                                        setStatusFilter("all");
                                        setDateFilter("");
                                    }}
                                    style={{
                                        padding: "8px 12px",
                                        backgroundColor: "#f3f4f6",
                                        color: "#374151",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                    }}
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={refetch}
                                    style={{
                                        padding: "8px 12px",
                                        backgroundColor: "#4f46e5",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                    }}
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredData}
                        pagination
                        highlightOnHover
                        striped
                        paginationRowsPerPageOptions={[10, 30, 50, 100]}
                        paginationPerPage={rowsPerPage}
                        onChangeRowsPerPage={(newPerPage) => setRowsPerPage(newPerPage)}
                        progressPending={isLoading}
                        progressComponent={<SkeletonLoader />}
                        responsive
                        customStyles={customStyles}
                        noDataComponent={
                            <div style={{
                                padding: "40px",
                                textAlign: "center",
                                color: "#6b7280"
                            }}>
                                <span style={{ fontSize: "48px", display: "block", marginBottom: "10px" }}>📋</span>
                                <p>No fund requests found</p>
                                <button
                                    onClick={() => {
                                        setFilterText("");
                                        setStatusFilter("all");
                                        setDateFilter("");
                                    }}
                                    style={{
                                        marginTop: "10px",
                                        padding: "8px 16px",
                                        backgroundColor: "#8b5cf6",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        }
                    />
                </div>
            </main>
        </>
    );
}