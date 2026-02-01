'use client';
import { useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetInactiveUsersQuery } from "@/store/backendSlice/apiAPISlice";
import UserViewModal from "../UserViewModal"; 

// Skeleton component for loading state
const UserSkeleton = () => (
    <div style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: "20px",
        borderBottom: "1px solid #f0f0f0"
    }}>
        <Skeleton width={40} height={20} />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Skeleton circle width={40} height={40} />
            <Skeleton width={120} height={16} />
        </div>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={16} />
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={100} height={16} />
    </div>
);


export default function ManageInactiveUsersData() {
    const [filterText, setFilterText] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    const { data: userData, isLoading, isError, error } = useGetInactiveUsersQuery();
    const users = userData?.users || [];
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleView = (row) => {
        setSelectedUserId(row.id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUserId(null);
    };

    const handleActivate = (row) => {
        console.log("Activate user:", row);
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
        },
        {
            name: "Name",
            selector: (row) => row.name || "N/A",
            sortable: true,
            cell: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#9ca3af",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "14px",
                            flexShrink: 0,
                        }}
                    >
                        {(row.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: "500" }}>{row.name || "N/A"}</span>
                </div>
            ),
            width: "200px",
        },
        {
            name: "Phone",
            selector: (row) => row.phone || "N/A",
            sortable: true,
            cell: (row) => (
                <span style={{ fontFamily: "monospace", fontSize: "14px" }}>
                    {row.phone || "N/A"}
                </span>
            ),
            width: "150px",
        },
        {
            name: "Funds",
            selector: (row) => parseFloat(row.funds || 0),
            sortable: true,
            cell: (row) => (
                <span style={{
                    fontWeight: "600",
                    color: parseFloat(row.funds || 0) > 0 ? "#059669" : "#6b7280"
                }}>
                    ₹{parseFloat(row.funds || 0).toLocaleString('en-IN')}
                </span>
            ),
            width: "120px",
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => (
                <span
                    style={{
                        color: "#fff",
                        fontWeight: "500",
                        backgroundColor: "#ef4444",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                    }}
                >
                    Inactive
                </span>
            ),
            width: "110px",
        },
        {
            name: "Created At",
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
                    <button
                        onClick={() => handleActivate(row)}
                        style={{
                            padding: "6px 12px",
                            backgroundColor: "#22c55e",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                        }}
                    >
                        Activate
                    </button>
                </div>
            ),
            width: "180px",
        },
    ];

    const filteredData = users.filter((item) => {
        if (filterText) {
            const searchText = filterText.toLowerCase();
            const name = (item.name || "").toLowerCase();
            const phone = (item.phone || "").toString().toLowerCase();
            const id = (item.id || "").toString().toLowerCase();
            return name.includes(searchText) || phone.includes(searchText) || id.includes(searchText);
        }
        return true;
    });

    const subHeaderComponent = (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 0",
            width: "100%",
            flexWrap: "wrap",
            gap: "15px"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <input
                    type="text"
                    placeholder="Search by name, phone or ID..."
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
                {filterText && (
                    <button
                        onClick={() => setFilterText("")}
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
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                fontSize: "14px",
                color: "#6b7280"
            }}>
                <span>
                    Showing: <strong style={{ color: "#111827" }}>{filteredData.length}</strong> users
                </span>
            </div>
        </div>
    );

    const SkeletonLoader = () => (
        <div style={{ width: "100%" }}>
            {[...Array(10)].map((_, i) => (
                <UserSkeleton key={i} />
            ))}
        </div>
    );

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: "#fef2f2",
                borderBottom: "2px solid #fecaca",
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
                minHeight: "60px",
            },
            highlightOnHoverStyle: {
                backgroundColor: "#fff5f5",
            },
        },
        pagination: {
            style: {
                borderTop: "1px solid #e5e7eb",
            },
        },
    };

    if (isError) {
        return (
            <main style={{ padding: "20px" }}>
                <div style={{
                    color: "#dc2626",
                    padding: "40px",
                    textAlign: "center",
                    backgroundColor: "#fef2f2",
                    borderRadius: "12px",
                }}>
                    <h3 style={{ marginBottom: "10px" }}>Error loading inactive users</h3>
                    <p>{error?.data?.message || error?.message || "Something went wrong"}</p>
                    <button
                        onClick={() => window.location.reload()}
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
        <main style={{ padding: "0px 9px" }}>
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                overflow: "hidden",
            }}>
                <DataTable
                    title={
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 0"
                        }}>
                            <span style={{ fontSize: "18px", fontWeight: "600" }}>
                                Inactive Users
                            </span>
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
                            <span style={{ fontSize: "48px", display: "block", marginBottom: "10px" }}>✅</span>
                            <p style={{ fontSize: "16px", fontWeight: "500", color: "#22c55e" }}>
                                Great! No inactive users found
                            </p>
                            <p style={{ fontSize: "14px", marginTop: "5px" }}>
                                All users are currently active
                            </p>
                            {filterText && (
                                <button
                                    onClick={() => setFilterText("")}
                                    style={{
                                        marginTop: "15px",
                                        padding: "8px 16px",
                                        backgroundColor: "#4f46e5",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    }
                />
            </div>
            {showModal && selectedUserId && (
                <UserViewModal 
                    userId={selectedUserId} 
                    onClose={handleCloseModal}
                    variant="inactive"
                />
            )}
        </main>
    );
}