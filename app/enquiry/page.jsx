'use client';
import { useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetInquiryUsersQuery, useGetUserInquiriesQuery } from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";

// Skeleton component for loading state
const InquirySkeleton = () => (
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
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton width={100} height={16} />
    </div>
);

// Modal to show user inquiries
const InquiryModal = ({ userId, userName, onClose }) => {
    const { data: inquiryData, isLoading, isError, error } = useGetUserInquiriesQuery(userId);

    const inquiries = inquiryData?.inquiries || [];

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

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
        }}>
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "800px",
                maxHeight: "80vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
            }}>
                {/* Header */}
                <div style={{
                    padding: "20px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                        Inquiries from {userName}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "8px 12px",
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        Close
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: "20px",
                    overflow: "auto",
                    flex: 1
                }}>
                    {isLoading && (
                        <div style={{ textAlign: "center", padding: "40px" }}>
                            <div style={{
                                width: "40px",
                                height: "40px",
                                border: "4px solid #e5e7eb",
                                borderTopColor: "#3b82f6",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                                margin: "0 auto"
                            }} />
                            <p style={{ marginTop: "15px", color: "#6b7280" }}>Loading inquiries...</p>
                        </div>
                    )}

                    {isError && (
                        <div style={{
                            padding: "40px",
                            textAlign: "center",
                            color: "#dc2626"
                        }}>
                            <p>{error?.data?.message || error?.message || "Failed to load inquiries"}</p>
                        </div>
                    )}

                    {!isLoading && !isError && inquiries.length === 0 && (
                        <div style={{
                            padding: "40px",
                            textAlign: "center",
                            color: "#6b7280"
                        }}>
                            <span style={{ fontSize: "48px", display: "block", marginBottom: "10px" }}>💬</span>
                            <p>No inquiries found for this user</p>
                        </div>
                    )}

                    {!isLoading && !isError && inquiries.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            {inquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    style={{
                                        padding: "15px",
                                        backgroundColor: inquiry.sender === "user" ? "#eff6ff" : "#f3f4f6",
                                        borderRadius: "8px",
                                        border: "1px solid " + (inquiry.sender === "user" ? "#bfdbfe" : "#e5e7eb")
                                    }}
                                >
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: "8px"
                                    }}>
                                        <span style={{
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: inquiry.sender === "user" ? "#2563eb" : "#6b7280",
                                            backgroundColor: inquiry.sender === "user" ? "#dbeafe" : "#e5e7eb",
                                            padding: "4px 8px",
                                            borderRadius: "4px"
                                        }}>
                                            {inquiry.sender === "user" ? "USER" : "ADMIN"}
                                        </span>
                                        <span style={{
                                            fontSize: "12px",
                                            color: "#6b7280"
                                        }}>
                                            {formatDate(inquiry.created_at)}
                                        </span>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: "14px",
                                        color: "#111827",
                                        lineHeight: "1.5"
                                    }}>
                                        {inquiry.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function ManageInquiriesData() {
    const [filterText, setFilterText] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [showModal, setShowModal] = useState(false);

    const { data: usersData, isLoading, isError, error } = useGetInquiryUsersQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    console.log("Inquiry Users Data:", usersData);

    const users = usersData?.users || [];
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleViewInquiries = (row) => {
        setSelectedUserId(row.id);
        setSelectedUserName(row.name);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUserId(null);
        setSelectedUserName("");
    };

    const columns = [
        {
            name: "S.No",
            selector: (row, index) => index + 1,
            sortable: false,
            width: "80px",
        },
        {
            name: "User ID",
            selector: (row) => row.id,
            sortable: true,
            width: "100px",
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
                        {(row.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: "500" }}>{row.name || "N/A"}</span>
                </div>
            ),
            width: "250px",
        },
        {
            name: "Actions",
            cell: (row) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        onClick={() => handleViewInquiries(row)}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}
                    >
                        <span>💬</span> View Inquiries
                    </button>
                </div>
            ),
            width: "200px",
        },
    ];

    const filteredData = users.filter((item) => {
        if (filterText) {
            const searchText = filterText.toLowerCase();
            const name = (item.name || "").toLowerCase();
            const id = (item.id || "").toString().toLowerCase();
            return name.includes(searchText) || id.includes(searchText);
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
                    placeholder="Search by name or ID..."
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
                    Showing: <strong style={{ color: "#111827" }}>{filteredData.length}</strong> of {users.length} users
                </span>
            </div>
        </div>
    );

    const SkeletonLoader = () => (
        <div style={{ width: "100%" }}>
            {[...Array(10)].map((_, i) => (
                <InquirySkeleton key={i} />
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
                minHeight: "60px",
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

    if (isError) {
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
                    <h3 style={{ marginBottom: "10px" }}>Error loading users</h3>
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
        <>
            {/* CSS for spinner animation */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

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
                                <span style={{ fontSize: "18px", fontWeight: "600" }}>User Inquiries</span>
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
                                <p>No users with inquiries found</p>
                                {filterText && (
                                    <button
                                        onClick={() => setFilterText("")}
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

                {/* User Inquiries Modal */}
                {showModal && selectedUserId && (
                    <InquiryModal
                        userId={selectedUserId}
                        userName={selectedUserName}
                        onClose={handleCloseModal}
                    />
                )}
            </main>
        </>
    );
}