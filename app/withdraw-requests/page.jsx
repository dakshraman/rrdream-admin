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

// Skeleton component for loading state
const WithdrawSkeleton = () => (
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
            <Skeleton circle={true} width={40} height={40} />
            <Skeleton width={120} height={16} />
        </div>
        <Skeleton width={100} height={16} />
        <Skeleton width={150} height={16} />
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton width={120} height={16} />
    </div>
);

export default function WithdrawRequests() {
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [processingId, setProcessingId] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const { data: withdrawData, isLoading, isError, error, refetch } = useGetWithdrawRequestsQuery();
    const [updateWithdrawStatus] = useUpdateWithdrawStatusMutation();
    
    console.log("the v", withdrawData);

    const withdrawRequests = withdrawData?.withdraw_requests || [];

    const formatDate = (dateString) => {
        if(!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleApprove = async (row) => {
        const userName = row.user?.name || "User";
        const confirmApprove = window.confirm(
            `Are you sure you want to approve ₹${row.amount} withdrawal for ${userName}?`
        );

        if (!confirmApprove) return;

        setProcessingId(row.id);

        try {
            console.log("Approving withdraw ID:", row.id);
            
            const response = await updateWithdrawStatus({
                id: row.id,
                status: "approved"
            }).unwrap();
            
            console.log("Approve response:", response);
            toast.success(response?.message || "Withdrawal approved successfully!");
            refetch();
        } catch (err) {
            console.error("Approve error:", err);
            const errorMessage = 
                err?.data?.message || 
                err?.message || 
                "Failed to approve withdrawal";
            toast.error(errorMessage);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (row) => {
        const userName = row.user?.name || "User";
        const confirmReject = window.confirm(
            `Are you sure you want to reject ₹${row.amount} withdrawal request from ${userName}?`
        );

        if (!confirmReject) return;

        setProcessingId(row.id);

        try {
            console.log("Rejecting withdraw ID:", row.id);
            
            const response = await updateWithdrawStatus({
                id: row.id,
                status: "rejected"
            }).unwrap();
            
            console.log("Reject response:", response);
            toast.success(response?.message || "Withdrawal rejected successfully!");
            refetch();
        } catch (err) {
            console.error("Reject error:", err);
            const errorMessage = 
                err?.data?.message || 
                err?.message || 
                "Failed to reject withdrawal";
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
        };
        const style = statusStyles[statusLower] || { backgroundColor: "#6b7280", color: "#fff" };
        return (
            <span
                style={{
                    ...style,
                    fontWeight: "500",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    textTransform: "capitalize"
                }}
            >
                {status || "N/A"}
            </span>
        );
    };

    const columns = [
        {
            name: "S.No",
            selector: (row, index) => index + 1,
            sortable: false,
            width: "40px",
        },
        {
            name: "User",
            selector: (row) => row.user?.name || "N/A",
            sortable: true,
            cell: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                        style={{
                            width: "35px",
                            height: "35px",
                            borderRadius: "50%",
                            backgroundColor: "#4f46e5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "13px",
                            flexShrink: 0,
                        }}
                    >
                        {(row.user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "500", fontSize: "13px" }}>{row.user?.name || "N/A"}</span>
                        <span style={{ fontSize: "11px", color: "#6b7280" }}>
                            {row.user?.phone || "N/A"}
                        </span>
                    </div>
                </div>
            ),
            width: "150px",
        },
        {
            name: "Amount",
            selector: (row) => parseFloat(row.amount || 0),
            sortable: true,
            cell: (row) => (
                <span style={{
                    fontWeight: "700",
                    color: "#059669",
                    fontSize: "14px"
                }}>
                    ₹{parseFloat(row.amount || 0).toLocaleString('en-IN')}
                </span>
            ),
            width: "90px",
        },
        {
            name: "Transfer To",
            selector: (row) => row.transfer_to,
            sortable: true,
            cell: (row) => (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "500" }}>
                        {row.transfer_to || "N/A"}
                    </span>
                    {row.user?.bank_name && (
                        <span style={{ fontSize: "10px", color: "#6b7280" }}>
                            {row.user.bank_name}
                        </span>
                    )}
                </div>
            ),
            width: "110px",
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => getStatusBadge(row.status),
            width: "100px",
        },
        {
            name: "Actions",
            cell: (row) => {
                const isProcessing = processingId === row.id;
                const isPending = (row.status || "").toLowerCase() === "pending";

                if (!isPending) {
                    return (
                        <span style={{
                            color: "#9ca3af",
                            fontSize: "11px",
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
                                padding: "5px 10px",
                                backgroundColor: isProcessing ? "#9ca3af" : "#22c55e",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isProcessing ? "not-allowed" : "pointer",
                                fontSize: "11px",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                minWidth: "65px",
                            }}
                        >
                            {isProcessing ? (
                                <span style={{
                                    width: "10px",
                                    height: "10px",
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
                                padding: "5px 10px",
                                backgroundColor: isProcessing ? "#9ca3af" : "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isProcessing ? "not-allowed" : "pointer",
                                fontSize: "11px",
                                fontWeight: "500",
                                minWidth: "55px",
                            }}
                        >
                            Reject
                        </button>
                    </div>
                );
            },
            width: "160px",
        },
    ];

    const filteredData = withdrawRequests.filter((item) => {
        // Status filter
        const itemStatus = (item.status || "").toLowerCase();
        if(statusFilter !== "all" && itemStatus !== statusFilter) {
            return false;
        }
        // Text filter
        if(filterText) {
            const searchText = filterText.toLowerCase();
            const name = (item.user?.name || "").toLowerCase();
            const phone = (item.user?.phone || "").toString().toLowerCase();
            const id = (item.id || "").toString().toLowerCase();
            const transferTo = (item.transfer_to || "").toLowerCase();
            return (
                name.includes(searchText) ||
                phone.includes(searchText) ||
                id.includes(searchText) ||
                transferTo.includes(searchText)
            );
        }
        return true;
    });

    // Stats calculations
    const pendingCount = withdrawRequests.filter(r => (r.status || "").toLowerCase() === "pending").length;
    const approvedCount = withdrawRequests.filter(r => (r.status || "").toLowerCase() === "approved").length;
    const rejectedCount = withdrawRequests.filter(r => (r.status || "").toLowerCase() === "rejected").length;
    const totalAmount = withdrawRequests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const pendingAmount = withdrawRequests
        .filter(r => (r.status || "").toLowerCase() === "pending")
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    // Sub header component with dropdown and search
    const subHeaderComponent = (
        <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "12px"
        }}>
            {/* Stats Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "10px",
                marginBottom: "8px"
            }}>
                <div style={{
                    padding: "10px 12px",
                    backgroundColor: "#faf5ff",
                    borderRadius: "8px",
                    borderLeft: "4px solid #8b5cf6"
                }}>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Total</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#8b5cf6" }}>
                        {withdrawRequests.length}
                    </div>
                    <div style={{ fontSize: "10px", color: "#6b7280" }}>
                        ₹{totalAmount.toLocaleString('en-IN')}
                    </div>
                </div>
                <div style={{
                    padding: "10px 12px",
                    backgroundColor: "#fffbeb",
                    borderRadius: "8px",
                    borderLeft: "4px solid #f59e0b"
                }}>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Pending</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#f59e0b" }}>
                        {pendingCount}
                    </div>
                    <div style={{ fontSize: "10px", color: "#6b7280" }}>
                        ₹{pendingAmount.toLocaleString('en-IN')}
                    </div>
                </div>
                <div style={{
                    padding: "10px 12px",
                    backgroundColor: "#f0fdf4",
                    borderRadius: "8px",
                    borderLeft: "4px solid #22c55e"
                }}>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Approved</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#22c55e" }}>
                        {approvedCount}
                    </div>
                </div>
                <div style={{
                    padding: "10px 12px",
                    backgroundColor: "#fef2f2",
                    borderRadius: "8px",
                    borderLeft: "4px solid #ef4444"
                }}>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Rejected</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#ef4444" }}>
                        {rejectedCount}
                    </div>
                </div>
            </div>

            {/* Search and Filter Row */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                flexWrap: "wrap",
                gap: "10px"
            }}>
                {/* Left side - Filter and Search */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1", minWidth: "250px", flexWrap: "wrap",marginBottom:"8px" }}>
                    {/* Status Filter Dropdown */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                            fontSize: "13px",
                            outline: "none",
                            cursor: "pointer",
                            backgroundColor: "#fff"
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search by name, phone, ID..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                            minWidth: "200px",
                            fontSize: "13px",
                            outline: "none",
                            flex: "1",
                            height:"35px"
                        }}
                    />
                </div>

            </div>
        </div>
    );

    const SkeletonLoader = () => (
        <div style={{ width: "100%" }}>
            {[...Array(10)].map((_, i) => (
                <WithdrawSkeleton key={i} />
            ))}
        </div>
    );

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: "#f9fafb",
                borderBottom: "2px solid #e5e7eb",
                minHeight: "45px"
            },
        },
        headCells: {
            style: {
                fontWeight: "600",
                fontSize: "13px",
                color: "#374151",
                paddingLeft: "8px",
                paddingRight: "8px",
            },
        },
        rows: {
            style: {
                fontSize: "13px",
                minHeight: "55px",
            },
            highlightOnHoverStyle: {
                backgroundColor: "#f3f4f6",
            },
        },
        cells: {
            style: {
                paddingLeft: "8px",
                paddingRight: "8px",
            },
        },
        pagination: {
            style: {
                borderTop: "1px solid #e5e7eb",
                minHeight: "50px"
            },
        },
    };

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
                    <h3 style={{ marginBottom: "10px" }}>Error loading withdraw requests</h3>
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
            `}</style>
            
            <main style={{ padding: "9px", height: "100vh", overflow: "auto" }}>
                <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    overflow: "visible"
                }}>
                    <DataTable
                        title={
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 0"
                            }}>
                                <span style={{ fontSize: "17px", fontWeight: "600" }}>Withdraw Requests</span>
                            </div>
                        }
                        columns={columns}
                        data={filteredData}
                        striped
                        pagination
                        highlightOnHover
                        subHeader
                        subHeaderComponent={subHeaderComponent}
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
                                <span style={{ fontSize: "48px", display: "block", marginBottom: "10px" }}>🔍</span>
                                <p>No withdraw requests found</p>
                                {(filterText || statusFilter !== "all") && (
                                    <button
                                        onClick={() => {
                                            setFilterText("");
                                            setStatusFilter("all");
                                        }}
                                        style={{
                                            marginTop: "10px",
                                            padding: "8px 16px",
                                            backgroundColor: "#4f46e5",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        }
                    />
                </div>
            </main>
        </>
    );
}