'use client';
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetInactiveUsersQuery, useToggleUserMutation } from "@/store/backendSlice/apiAPISlice";
import UserViewModal from "../UserViewModal";
import { toast } from "react-hot-toast";

const UserSkeleton = () => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            gap: "20px",
            borderBottom: "1px solid #f0f0f0",
        }}
    >
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
    const [activatingUserId, setActivatingUserId] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1200,
    );

    const { data: userData, isLoading, isError, error } = useGetInactiveUsersQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [toggleUser] = useToggleUserMutation();

    const users = userData?.users || [];
    const isMobile = windowWidth < 768;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const formatCurrency = (amount) =>
        `Rs ${parseFloat(amount || 0).toLocaleString("en-IN")}`;

    const handleView = (row) => {
        setSelectedUserId(row.id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUserId(null);
    };

    const handleActivate = async (row) => {
        const confirmActivate = window.confirm(
            `Are you sure you want to activate user "${row.name || row.phone}"?`,
        );

        if (!confirmActivate) return;

        setActivatingUserId(row.id);

        try {
            const response = await toggleUser(row.id).unwrap();
            toast.success(
                response?.message || `User "${row.name || row.phone}" activated successfully!`,
            );
        } catch (err) {
            const errorMessage =
                err?.data?.message || err?.message || "Failed to activate user";
            toast.error(errorMessage);
            console.error("Activate user error:", err);
        } finally {
            setActivatingUserId(null);
        }
    };

    const filteredData = users.filter((item) => {
        if (filterText) {
            const searchText = filterText.toLowerCase();
            const name = (item.name || "").toLowerCase();
            const phone = (item.phone || "").toString().toLowerCase();
            const id = (item.id || "").toString().toLowerCase();
            return (
                name.includes(searchText) ||
                phone.includes(searchText) ||
                id.includes(searchText)
            );
        }
        return true;
    });

    const columns = [
        {
            name: "S.No",
            selector: (row, index) => index + 1,
            sortable: false,
            width: "40px",
        },
        {
            name: "Name",
            selector: (row) => row.name || "N/A",
            sortable: true,
            cell: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                        style={{
                            width: "35px",
                            height: "35px",
                            borderRadius: "50%",
                            backgroundColor: "#9ca3af",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "13px",
                            flexShrink: 0,
                        }}
                    >
                        {(row.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: "500", fontSize: "13px" }}>{row.name || "N/A"}</span>
                </div>
            ),
            width: "120px",
        },
        {
            name: "Phone",
            selector: (row) => row.phone || "N/A",
            sortable: true,
            cell: (row) => (
                <span style={{ fontFamily: "monospace", fontSize: "13px" }}>
                    {row.phone || "N/A"}
                </span>
            ),
            width: "120px",
        },
        {
            name: "Funds",
            selector: (row) => parseFloat(row.funds || 0),
            sortable: true,
            cell: (row) => (
                <span
                    style={{
                        fontWeight: "600",
                        color: parseFloat(row.funds || 0) > 0 ? "#059669" : "#6b7280",
                        fontSize: "13px",
                    }}
                >
                    {formatCurrency(row.funds)}
                </span>
            ),
            width: "110px",
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: () => (
                <span
                    style={{
                        color: "#fff",
                        fontWeight: "500",
                        backgroundColor: "#ef4444",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                    }}
                >
                    Inactive
                </span>
            ),
            width: "100px",
        },
        {
            name: "Actions",
            cell: (row) => {
                const isActivating = activatingUserId === row.id;
                return (
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button
                            onClick={() => handleView(row)}
                            disabled={isActivating}
                            style={{
                                padding: "5px 10px",
                                backgroundColor: "#3b82f6",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isActivating ? "not-allowed" : "pointer",
                                fontSize: "11px",
                                opacity: isActivating ? 0.6 : 1,
                            }}
                        >
                            View
                        </button>
                        <button
                            onClick={() => handleActivate(row)}
                            disabled={isActivating}
                            style={{
                                padding: "5px 10px",
                                backgroundColor: isActivating ? "#86efac" : "#22c55e",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isActivating ? "not-allowed" : "pointer",
                                fontSize: "11px",
                                minWidth: "88px",
                            }}
                        >
                            {isActivating ? "Activating..." : "Activate"}
                        </button>
                    </div>
                );
            },
            width: "180px",
        },
    ];

    const subHeaderComponent = (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                width: "100%",
                gap: "12px",
                flexWrap: "wrap",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1", minWidth: "250px" }}>
                <input
                    type="text"
                    placeholder="Search by name, phone or ID..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        flex: "1",
                        fontSize: "13px",
                        outline: "none",
                    }}
                />
                {filterText && (
                    <button
                        onClick={() => setFilterText("")}
                        style={{
                            padding: "8px 12px",
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Clear
                    </button>
                )}
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
                minHeight: "45px",
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
                backgroundColor: "#fff5f5",
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
                minHeight: "50px",
            },
        },
    };

    const renderMobileContent = () => {
        if (isLoading) {
            return (
                <div style={{ display: "grid", gap: "10px", padding: "12px" }}>
                    {[...Array(6)].map((_, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                padding: "12px",
                            }}
                        >
                            <Skeleton height={18} width={140} />
                            <Skeleton height={14} width={180} style={{ marginTop: "8px" }} />
                            <Skeleton height={14} width={110} style={{ marginTop: "6px" }} />
                            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                <Skeleton height={34} style={{ flex: 1 }} />
                                <Skeleton height={34} style={{ flex: 1 }} />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (filteredData.length === 0) {
            return (
                <div style={{ textAlign: "center", padding: "28px 16px", color: "#6b7280" }}>
                    <p style={{ margin: 0, fontWeight: "600" }}>No inactive users found</p>
                </div>
            );
        }

        return (
            <div style={{ display: "grid", gap: "10px", padding: "12px" }}>
                {filteredData.map((row) => {
                    const isActivating = activatingUserId === row.id;

                    return (
                        <div
                            key={row.id}
                            style={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                padding: "12px",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                                <div style={{ minWidth: 0 }}>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: "14px",
                                            fontWeight: "700",
                                            color: "#111827",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {row.name || "N/A"}
                                    </p>
                                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
                                        ID: #{row.id} | {row.phone || "N/A"}
                                    </p>
                                </div>
                                <span
                                    style={{
                                        backgroundColor: "#fee2e2",
                                        color: "#dc2626",
                                        borderRadius: "999px",
                                        padding: "3px 10px",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        height: "fit-content",
                                    }}
                                >
                                    Inactive
                                </span>
                            </div>

                            <div style={{ marginTop: "10px", fontSize: "12px", color: "#4b5563" }}>
                                Funds: <strong style={{ color: "#111827" }}>{formatCurrency(row.funds)}</strong>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "8px",
                                    marginTop: "12px",
                                }}
                            >
                                <button
                                    onClick={() => handleView(row)}
                                    disabled={isActivating}
                                    style={{
                                        padding: "9px 10px",
                                        border: "none",
                                        borderRadius: "8px",
                                        backgroundColor: "#3b82f6",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: isActivating ? "not-allowed" : "pointer",
                                        opacity: isActivating ? 0.6 : 1,
                                    }}
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => handleActivate(row)}
                                    disabled={isActivating}
                                    style={{
                                        padding: "9px 10px",
                                        border: "none",
                                        borderRadius: "8px",
                                        backgroundColor: "#22c55e",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: isActivating ? "not-allowed" : "pointer",
                                        opacity: isActivating ? 0.7 : 1,
                                    }}
                                >
                                    {isActivating ? "Activating..." : "Activate"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (isError) {
        return (
            <main style={{ padding: "20px" }}>
                <div
                    style={{
                        color: "#dc2626",
                        padding: "40px",
                        textAlign: "center",
                        backgroundColor: "#fef2f2",
                        borderRadius: "12px",
                    }}
                >
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
        <>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <main style={{ padding: "9px", height: "100vh", overflow: "auto" }}>
                <div
                    style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        overflow: "visible",
                    }}
                >
                    {isMobile ? (
                        <>
                            <div
                                style={{
                                    padding: "12px",
                                    borderBottom: "1px solid #e5e7eb",
                                    display: "grid",
                                    gap: "10px",
                                }}
                            >
                                <div style={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>
                                    Inactive Users
                                </div>

                                <input
                                    type="text"
                                    placeholder="Search by name, phone or ID..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    style={{
                                        padding: "10px 12px",
                                        borderRadius: "8px",
                                        border: "1px solid #d1d5db",
                                        fontSize: "13px",
                                        outline: "none",
                                        width: "100%",
                                    }}
                                />
                            </div>
                            {renderMobileContent()}
                        </>
                    ) : (
                        <DataTable
                            title={
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "8px 0",
                                        position: "relative",
                                        right: "12px",
                                    }}
                                >
                                    <span style={{ fontSize: "17px", fontWeight: "600" }}>
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
                                <div
                                    style={{
                                        padding: "40px",
                                        textAlign: "center",
                                        color: "#6b7280",
                                    }}
                                >
                                    <span style={{ fontSize: "48px", display: "block", marginBottom: "10px" }}>
                                        No Data
                                    </span>
                                    <p>No inactive users found</p>
                                </div>
                            }
                        />
                    )}
                </div>

                {showModal && selectedUserId && (
                    <UserViewModal
                        userId={selectedUserId}
                        onClose={handleCloseModal}
                        variant="inactive"
                    />
                )}
            </main>
        </>
    );
}
