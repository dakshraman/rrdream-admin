'use client';
import { useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetWithdrawRequestsQuery } from "@/store/backendSlice/apiAPISlice";

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
            <Skeleton circle width={40} height={40} />
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
    const { data: withdrawData, isLoading, isError, error, refetch } = useGetWithdrawRequestsQuery();

    const withdrawRequests = withdrawData?.data?.withdraw_requests || [];
    const [rowsPerPage, setRowsPerPage] = useState(10);

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

    const getStatusBadge = (status) => {
        const statusStyles = {
            pending: { backgroundColor: "#f59e0b", color: "#fff" },
            approved: { backgroundColor: "#22c55e", color: "#fff" },
            rejected: { backgroundColor: "#ef4444", color: "#fff" },
        };
        const style = statusStyles[status] || { backgroundColor: "#6b7280", color: "#fff" };
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
                {status}
            </span>
        );
    };

    const columns = [
        {
            name: "S.No",
            selector: (row, index) => index + 1,
            sortable: false,
            width: "70px",
        },
        {
            name: "ID",
            selector: (row) => row.id,
            sortable: true,
            width: "80px",
            cell: (row) => (
                <span style={{ fontWeight: "600", color: "#4f46e5" }}>#{row.id}</span>
            ),
        },
        {
            name: "User",
            selector: (row) => row.user?.name || "N/A",
            sortable: true,
            cell: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#4f46e5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "14px",
                            flexShrink: 0,
                        }}
                    >
                        {(row.user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "500" }}>{row.user?.name || "N/A"}</span>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            {row.user?.phone || "N/A"}
                        </span>
                    </div>
                </div>
            ),
            width: "200px",
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
                    ₹{parseFloat(row.amount || 0).toLocaleString('en-IN')}
                </span>
            ),
            width: "120px",
        },
        {
            name: "Transfer To",
            selector: (row) => row.transfer_to,
            sortable: true,
            cell: (row) => (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>
                        {row.transfer_to || "N/A"}
                    </span>
                    {row.user?.bank_name && (
                        <span style={{ fontSize: "11px", color: "#6b7280" }}>
                            {row.user.bank_name}
                        </span>
                    )}
                </div>
            ),
            width: "220px",
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => getStatusBadge(row.status),
            width: "120px",
        },
        {
            name: "Date",
            selector: (row) => row.created_at,
            sortable: true,
            cell: (row) => (
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    {formatDate(row.created_at)}
                </span>
            ),
            width: "180px",
        },
        {
            name: "Actions",
            cell: (row) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        onClick={() => handleView(row)}
                        style={{
                            padding: "6px 12px",
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                        }}
                    >
                        View
                    </button>
                </div>
            ),
            width: "100px",
        },
    ];

    const handleView = (row) => {
        console.log("View withdraw request:", row);
        // You can add modal or navigation logic here
    };

    const filteredData = withdrawRequests.filter((item) => {
        // Status filter
        if(statusFilter !== "all" && item.status !== statusFilter) {
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
    const pendingCount = withdrawRequests.filter(r => r.status === "pending").length;
    const approvedCount = withdrawRequests.filter(r => r.status === "approved").length;
    const rejectedCount = withdrawRequests.filter(r => r.status === "rejected").length;
    const totalAmount = withdrawRequests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const pendingAmount = withdrawRequests
        .filter(r => r.status === "pending")
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    // Sub header component with dropdown and search
    const subHeaderComponent = (
        <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "15px"
        }}>
            {/* Stats Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
                padding: "10px 0"
            }}>
                <div style={{
                    backgroundColor: "#eff6ff",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #3b82f6"
                }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Total</p>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: "4px 0 0" }}>
                        {withdrawRequests.length}
                    </p>
                    <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
                        ₹{totalAmount.toLocaleString('en-IN')}
                    </p>
                </div>
                <div style={{
                    backgroundColor: "#fefce8",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #f59e0b"
                }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Pending</p>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#f59e0b", margin: "4px 0 0" }}>
                        {pendingCount}
                    </p>
                    <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
                        ₹{pendingAmount.toLocaleString('en-IN')}
                    </p>
                </div>
                <div style={{
                    backgroundColor: "#f0fdf4",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #22c55e"
                }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Approved</p>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#22c55e", margin: "4px 0 0" }}>
                        {approvedCount}
                    </p>
                </div>
                <div style={{
                    backgroundColor: "#fef2f2",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #ef4444"
                }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Rejected</p>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#ef4444", margin: "4px 0 0" }}>
                        {rejectedCount}
                    </p>
                </div>
            </div>

            {/* Search and Filter Row */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                flexWrap: "wrap",
                gap: "15px"
            }}>
                {/* Left side - Filter and Search */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    {/* Status Filter Dropdown */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            fontSize: "14px",
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

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search by name, phone, ID..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            minWidth: "280px",
                            fontSize: "14px",
                            outline: "none",
                        }}
                    />

                    {/* Clear Button */}
                    {(filterText || statusFilter !== "all") && (
                        <button
                            onClick={() => {
                                setFilterText("");
                                setStatusFilter("all");
                            }}
                            style={{
                                padding: "10px 14px",
                                backgroundColor: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            ✕ Clear
                        </button>
                    )}
                </div>

                {/* Right side - Refresh and Stats */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    fontSize: "14px",
                    color: "#6b7280"
                }}>
                    <span>
                        Showing: <strong style={{ color: "#111827" }}>{filteredData.length}</strong> of {withdrawRequests.length}
                    </span>
                    <button
                        onClick={refetch}
                        style={{
                            padding: "10px 14px",
                            backgroundColor: "#4f46e5",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        🔄 Refresh
                    </button>
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
            },
        },
        headCells: {
            style: {
                fontWeight: "600",
                fontSize: "14px",
                color: "#374151",
            },
        },
        rows: {
            style: {
                fontSize: "14px",
                minHeight: "65px",
            },
            highlightOnHoverStyle: {
                backgroundColor: "#f3f4f6",
            },
        },
        pagination: {
            style: {
                borderTop: "1px solid #e5e7eb",
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
        <main style={{ padding: "9px" }}>
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                overflow: "hidden"
            }}>
                <DataTable
                    title={
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 0"
                        }}>
                            <span style={{ fontSize: "18px", fontWeight: "600" }}>Withdraw Requests</span>
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
    );
}