'use client';
import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetUsersQuery, useToggleUserMutation } from "@/store/backendSlice/apiAPISlice";
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

export default function ManageUsersData() {
    const [filterText, setFilterText] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [togglingUserId, setTogglingUserId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1200,
    );

    const { data: userData, isLoading, isError, error } = useGetUsersQuery(undefined, {
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

    const isUserActive = (user) => user.status === true || user.status === 1;
    const normalizeSearchValue = (value) =>
        value === null || value === undefined ? "" : String(value).toLowerCase();

    const matchesSearch = (user, searchValue) => {
        const text = searchValue.trim().toLowerCase();
        if (!text) return true;

        const searchableFields = [
            user.id,
            user.user_id,
            user.name,
            user.username,
            user.phone,
            user.mobile,
            user.email,
            user.pass,
            user.password,
        ];

        return searchableFields.some((field) =>
            normalizeSearchValue(field).includes(text),
        );
    };

    const formatCurrency = (amount) =>
        `Rs ${parseFloat(amount || 0).toLocaleString("en-IN")}`;

    const getCreatedAtValue = (user) =>
        user?.created_at || user?.createdAt || user?.created_on || user?.createdOn || "";

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

    const handleView = (row) => {
        setSelectedUserId(row.id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUserId(null);
    };

    const handleToggleStatus = async (row) => {
        const isActive = isUserActive(row);
        const action = isActive ? "deactivate" : "activate";
        const userName = row.name || row.phone || `User #${row.id}`;

        const confirmToggle = window.confirm(
            `Are you sure you want to ${action} "${userName}"?`,
        );

        if(!confirmToggle) return;

        setTogglingUserId(row.id);

        try {
            const response = await toggleUser(row.id).unwrap();
            toast.success(
                response?.message || `User "${userName}" ${action}d successfully!`,
            );
        } catch (err) {
            const errorMessage =
                err?.data?.message || err?.message || `Failed to ${action} user`;
            toast.error(errorMessage);
            console.error("Toggle user error:", err);
        } finally {
            setTogglingUserId(null);
        }
    };

    const filteredData = useMemo(
        () =>
            users
                .filter((item) => isUserActive(item))
                .filter((item) => matchesSearch(item, filterText)),
        [users, filterText],
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [filterText]);

    const totalRows = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredData, currentPage, rowsPerPage]);

    const showFrom = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const showTo = Math.min(currentPage * rowsPerPage, totalRows);
    const totalFunds = filteredData.reduce((sum, user) => sum + parseFloat(user.funds || 0), 0);

    const columns = [
        {
            name: "S.No",
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
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
                            backgroundColor: isUserActive(row) ? "#4f46e5" : "#9ca3af",
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
            width: "110px",
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
            name: "Created At",
            selector: (row) => {
                const createdAt = getCreatedAtValue(row);
                const time = Date.parse(createdAt);
                return Number.isFinite(time) ? time : 0;
            },
            sortable: true,
            cell: (row) => (
                <span style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>
                    {formatDateTime(getCreatedAtValue(row))}
                </span>
            ),
            width: "165px",
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => {
                const isActive = isUserActive(row);
                return (
                    <span
                        style={{
                            color: "#fff",
                            fontWeight: "500",
                            backgroundColor: isActive ? "#22c55e" : "#ef4444",
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                        }}
                    >
                        {isActive ? "Active" : "Inactive"}
                    </span>
                );
            },
            width: "100px",
        },
        {
            name: "Actions",
            cell: (row) => {
                const isToggling = togglingUserId === row.id;
                const isActive = isUserActive(row);

                return (
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button
                            onClick={() => handleView(row)}
                            disabled={isToggling}
                            style={{
                                padding: "5px 10px",
                                backgroundColor: "#3b82f6",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isToggling ? "not-allowed" : "pointer",
                                fontSize: "11px",
                                opacity: isToggling ? 0.6 : 1,
                            }}
                        >
                            View
                        </button>
                        <button
                            onClick={() => handleToggleStatus(row)}
                            disabled={isToggling}
                            style={{
                                padding: "5px 10px",
                                backgroundColor: isToggling
                                    ? "#9ca3af"
                                    : isActive
                                      ? "#ef4444"
                                      : "#22c55e",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isToggling ? "not-allowed" : "pointer",
                                fontSize: "11px",
                                minWidth: "85px",
                            }}
                        >
                            {isToggling ? "Wait..." : isActive ? "Deactivate" : "Activate"}
                        </button>
                    </div>
                );
            },
            width: "180px",
        },
    ];

    const subHeaderComponent = (
        <div style={{ width: "100%", display: "grid", gap: "10px", padding: "10px 0" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: "8px",
                }}
            >
                <div style={{ border: "1px solid #dbeafe", background: "#eff6ff", borderRadius: "10px", padding: "8px 10px" }}>
                    <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>Active Users</p>
                    <p style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: "700", color: "#1d4ed8" }}>{filteredData.length}</p>
                </div>
                <div style={{ border: "1px solid #d1fae5", background: "#f0fdf4", borderRadius: "10px", padding: "8px 10px" }}>
                    <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>Total Active Funds</p>
                    <p style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: "700", color: "#047857" }}>{formatCurrency(totalFunds)}</p>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                }}
            >
                <input
                    className="active-users-search-input"
                    type="text"
                    placeholder="Search by name, phone or ID..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{
                        padding: "9px 12px",
                        width: "100%",
                        minWidth: 0,
                        flex: "1 1 260px",
                        boxSizing: "border-box",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "13px",
                        outline: "none",
                        backgroundColor: "#fff",
                    }}
                />
                {filterText && (
                    <button
                        onClick={() => {
                            setFilterText("");
                        }}
                        style={{
                            padding: "9px 12px",
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
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
                backgroundColor: "#eef2ff",
                borderBottom: "1px solid #dbeafe",
                minHeight: "46px",
            },
        },
        headCells: {
            style: {
                fontWeight: "600",
                fontSize: "12px",
                color: "#1f2937",
                paddingLeft: "10px",
                paddingRight: "10px",
            },
        },
        rows: {
            style: {
                fontSize: "13px",
                minHeight: "58px",
            },
            highlightOnHoverStyle: {
                backgroundColor: "#f8faff",
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
                minHeight: "50px",
                backgroundColor: "#fcfdff",
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
                    <p style={{ margin: 0, fontWeight: "600" }}>No users found</p>
                </div>
            );
        }

        return (
            <div style={{ display: "grid", gap: "10px", padding: "12px" }}>
                {paginatedData.map((row) => {
                    const isActive = isUserActive(row);
                    const isToggling = togglingUserId === row.id;

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
                                        backgroundColor: isActive ? "#dcfce7" : "#fee2e2",
                                        color: isActive ? "#166534" : "#dc2626",
                                        borderRadius: "999px",
                                        padding: "3px 10px",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        height: "fit-content",
                                    }}
                                >
                                    {isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div style={{ marginTop: "10px", fontSize: "12px", color: "#4b5563" }}>
                                Funds: <strong style={{ color: "#111827" }}>{formatCurrency(row.funds)}</strong>
                            </div>
                            <div style={{ marginTop: "6px", fontSize: "12px", color: "#4b5563" }}>
                                Created: <strong style={{ color: "#111827" }}>{formatDateTime(getCreatedAtValue(row))}</strong>
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
                                    disabled={isToggling}
                                    style={{
                                        padding: "9px 10px",
                                        border: "none",
                                        borderRadius: "8px",
                                        backgroundColor: "#3b82f6",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: isToggling ? "not-allowed" : "pointer",
                                        opacity: isToggling ? 0.6 : 1,
                                    }}
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(row)}
                                    disabled={isToggling}
                                    style={{
                                        padding: "9px 10px",
                                        border: "none",
                                        borderRadius: "8px",
                                        backgroundColor: isActive ? "#ef4444" : "#22c55e",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: isToggling ? "not-allowed" : "pointer",
                                        opacity: isToggling ? 0.7 : 1,
                                    }}
                                >
                                    {isToggling ? "Processing..." : isActive ? "Deactivate" : "Activate"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderPaginationControls = () => {
        if (isLoading || totalRows === 0) return null;

        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    padding: "8px 12px 14px",
                    borderTop: "1px solid #e5e7eb",
                    flexWrap: "wrap",
                }}
            >
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    Showing {showFrom}-{showTo} of {totalRows}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: "6px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            backgroundColor: currentPage === 1 ? "#f3f4f6" : "#fff",
                            color: "#374151",
                            fontSize: "12px",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        }}
                    >
                        Prev
                    </button>
                    <span style={{ fontSize: "12px", color: "#374151", minWidth: "72px", textAlign: "center" }}>
                        Page {currentPage}/{totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        disabled={currentPage >= totalPages}
                        style={{
                            padding: "6px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            backgroundColor: currentPage >= totalPages ? "#f3f4f6" : "#fff",
                            color: "#374151",
                            fontSize: "12px",
                            cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                        }}
                    >
                        Next
                    </button>
                </div>
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
                        border: "1px solid #fecaca",
                    }}
                >
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
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                :global(.active-users-search-input) {
                    width: 100% !important;
                    min-width: 0 !important;
                    height: auto !important;
                    box-sizing: border-box !important;
                }
            `}</style>

            <main style={{ padding: "9px", height: "100vh", overflow: "auto" }}>
                <div
                    style={{
                        backgroundColor: "#fff",
                        borderRadius: "14px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
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
                                    Active Users
                                </div>
                                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                    Total Active: <strong style={{ color: "#111827" }}>{filteredData.length}</strong> | Funds: <strong style={{ color: "#111827" }}>{formatCurrency(totalFunds)}</strong>
                                </div>

                                <input
                                    className="active-users-search-input"
                                    type="text"
                                    placeholder="Search by name, phone or ID..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    style={{
                                        padding: "10px 12px",
                                        width: "100%",
                                        minWidth: 0,
                                        boxSizing: "border-box",
                                        borderRadius: "8px",
                                        border: "1px solid #d1d5db",
                                        fontSize: "13px",
                                        outline: "none",
                                    }}
                                />

                            </div>
                            {renderMobileContent()}
                            {renderPaginationControls()}
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
                                    <span style={{ fontSize: "17px", fontWeight: "600" }}>Active Users</span>
                                </div>
                            }
                            columns={columns}
                            data={paginatedData}
                            striped
                            pagination
                            paginationServer
                            highlightOnHover
                            subHeader
                            subHeaderComponent={subHeaderComponent}
                            paginationRowsPerPageOptions={[10, 30, 50, 100]}
                            paginationTotalRows={totalRows}
                            onChangePage={(page) => setCurrentPage(page)}
                            paginationPerPage={rowsPerPage}
                            onChangeRowsPerPage={(newPerPage) => {
                                setRowsPerPage(newPerPage);
                                setCurrentPage(1);
                            }}
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
                                    <p>No users found</p>
                                </div>
                            }
                        />
                    )}
                </div>

                {showModal && selectedUserId && (
                    <UserViewModal
                        userId={selectedUserId}
                        onClose={handleCloseModal}
                        variant="default"
                    />
                )}
            </main>
        </>
    );
}
