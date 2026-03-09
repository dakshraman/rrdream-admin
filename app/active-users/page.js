import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetUsersQuery, useToggleUserMutation, useDeleteUserMutation } from "@/store/backendSlice/apiAPISlice";
import UserViewModal from "../UserViewModal";
import { toast } from "react-hot-toast";
const UserSkeleton = () => (_jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: "20px",
        borderBottom: "1px solid #f0f0f0",
    }, children: [_jsx(Skeleton, { width: 40, height: 20 }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [_jsx(Skeleton, { circle: true, width: 40, height: 40 }), _jsx(Skeleton, { width: 120, height: 16 })] }), _jsx(Skeleton, { width: 120, height: 16 }), _jsx(Skeleton, { width: 80, height: 16 }), _jsx(Skeleton, { width: 60, height: 24, borderRadius: 12 }), _jsx(Skeleton, { width: 100, height: 16 })] }));
export default function ManageUsersData() {
    var _a;
    const [filterText, setFilterText] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [togglingUserId, setTogglingUserId] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
    const { data: userData, isLoading, isError, error } = useGetUsersQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [toggleUser] = useToggleUserMutation();
    const [deleteUser] = useDeleteUserMutation();
    const users = (userData === null || userData === void 0 ? void 0 : userData.users) || [];
    const isMobile = windowWidth < 768;
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const isUserActive = (user) => user.status === true || user.status === 1;
    const normalizeSearchValue = (value) => value === null || value === undefined ? "" : String(value).toLowerCase();
    const matchesSearch = (user, searchValue) => {
        const text = searchValue.trim().toLowerCase();
        if (!text)
            return true;
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
        return searchableFields.some((field) => normalizeSearchValue(field).includes(text));
    };
    const formatCurrency = (amount) => `Rs ${parseFloat(amount || 0).toLocaleString("en-IN")}`;
    const getCreatedAtValue = (user) => (user === null || user === void 0 ? void 0 : user.created_at) || (user === null || user === void 0 ? void 0 : user.createdAt) || (user === null || user === void 0 ? void 0 : user.created_on) || (user === null || user === void 0 ? void 0 : user.createdOn) || "";
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
    const handleView = (row) => {
        setSelectedUserId(row.id);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUserId(null);
    };
    const handleToggleStatus = async (row) => {
        var _a;
        const isActive = isUserActive(row);
        const action = isActive ? "deactivate" : "activate";
        const userName = row.name || row.phone || `User #${row.id}`;
        const confirmToggle = window.confirm(`Are you sure you want to ${action} "${userName}"?`);
        if (!confirmToggle)
            return;
        setTogglingUserId(row.id);
        try {
            const response = await toggleUser(row.id).unwrap();
            toast.success((response === null || response === void 0 ? void 0 : response.message) || `User "${userName}" ${action}d successfully!`);
        }
        catch (err) {
            const errorMessage = ((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || `Failed to ${action} user`;
            toast.error(errorMessage);
            console.error("Toggle user error:", err);
        }
        finally {
            setTogglingUserId(null);
        }
    };
    const handleDeleteUser = async (row) => {
        var _a;
        const userName = row.name || row.phone || `User #${row.id}`;
        const confirmDelete = window.confirm(`Are you sure you want to DELETE "${userName}"? This action cannot be undone.`);
        if (!confirmDelete)
            return;
        setDeletingUserId(row.id);
        try {
            const response = await deleteUser(row.id).unwrap();
            toast.success((response === null || response === void 0 ? void 0 : response.message) || `User "${userName}" deleted successfully!`);
        }
        catch (err) {
            const errorMessage = ((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || `Failed to delete user`;
            toast.error(errorMessage);
            console.error("Delete user error:", err);
        }
        finally {
            setDeletingUserId(null);
        }
    };
    const filteredData = useMemo(() => users
        .filter((item) => isUserActive(item))
        .filter((item) => matchesSearch(item, filterText)), [users, filterText]);
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
    const getSerialNumber = (index) => (currentPage - 1) * rowsPerPage + index + 1;
    const showFrom = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const showTo = Math.min(currentPage * rowsPerPage, totalRows);
    const totalFunds = filteredData.reduce((sum, user) => sum + parseFloat(user.funds || 0), 0);
    const columns = [
        {
            name: "S.No",
            selector: (_, index) => getSerialNumber(index),
            cell: (_, index) => _jsx("span", { children: getSerialNumber(index) }),
            sortable: false,
            width: "40px",
        },
        {
            name: "Name",
            selector: (row) => row.name || "N/A",
            sortable: true,
            cell: (row) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [_jsx("div", { style: {
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
                        }, children: (row.name || "U").charAt(0).toUpperCase() }), _jsx("span", { style: { fontWeight: "500", fontSize: "13px" }, children: row.name || "N/A" })] })),
            width: "120px",
        },
        {
            name: "Phone",
            selector: (row) => row.phone || "N/A",
            sortable: true,
            cell: (row) => (_jsx("span", { style: { fontFamily: "monospace", fontSize: "13px" }, children: row.phone || "N/A" })),
            width: "110px",
        },
        {
            name: "Funds",
            selector: (row) => parseFloat(row.funds || 0),
            sortable: true,
            cell: (row) => (_jsx("span", { style: {
                    fontWeight: "600",
                    color: parseFloat(row.funds || 0) > 0 ? "#059669" : "#6b7280",
                    fontSize: "13px",
                }, children: formatCurrency(row.funds) })),
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
            cell: (row) => (_jsx("span", { style: { fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }, children: formatDateTime(getCreatedAtValue(row)) })),
            width: "165px",
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => {
                const isActive = isUserActive(row);
                return (_jsx("span", { style: {
                        color: "#fff",
                        fontWeight: "500",
                        backgroundColor: isActive ? "#22c55e" : "#ef4444",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                    }, children: isActive ? "Active" : "Inactive" }));
            },
            width: "100px",
        },
        {
            name: "Actions",
            cell: (row) => {
                const isToggling = togglingUserId === row.id;
                const isDeleting = deletingUserId === row.id;
                const isBusy = isToggling || isDeleting;
                const isActive = isUserActive(row);
                return (_jsxs("div", { style: { display: "flex", gap: "6px" }, children: [_jsx("button", { onClick: () => handleView(row), disabled: isBusy, style: {
                                padding: "5px 10px",
                                backgroundColor: "#3b82f6",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isBusy ? "not-allowed" : "pointer",
                                fontSize: "11px",
                                opacity: isBusy ? 0.6 : 1,
                            }, children: "View" }), _jsx("button", { onClick: () => handleToggleStatus(row), disabled: isBusy, style: {
                                padding: "5px 10px",
                                backgroundColor: isBusy
                                    ? "#9ca3af"
                                    : isActive
                                        ? "#ef4444"
                                        : "#22c55e",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isBusy ? "not-allowed" : "pointer",
                                fontSize: "11px",
                                minWidth: "80px",
                            }, children: isToggling ? "Wait..." : isActive ? "Deactivate" : "Activate" }), _jsx("button", { onClick: () => handleDeleteUser(row), disabled: isBusy, style: {
                                padding: "5px 10px",
                                backgroundColor: isDeleting ? "#9ca3af" : "#7f1d1d",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isBusy ? "not-allowed" : "pointer",
                                fontSize: "11px",
                                minWidth: "55px",
                            }, children: isDeleting ? "..." : "Delete" })] }));
            },
            width: "240px",
        },
    ];
    const subHeaderComponent = (_jsxs("div", { style: { width: "100%", display: "grid", gap: "10px", padding: "10px 0" }, children: [_jsxs("div", { style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: "8px",
                }, children: [_jsxs("div", { style: { border: "1px solid #dbeafe", background: "#eff6ff", borderRadius: "10px", padding: "8px 10px" }, children: [_jsx("p", { style: { margin: 0, fontSize: "11px", color: "#6b7280" }, children: "Active Users" }), _jsx("p", { style: { margin: "2px 0 0", fontSize: "18px", fontWeight: "700", color: "#1d4ed8" }, children: filteredData.length })] }), _jsxs("div", { style: { border: "1px solid #d1fae5", background: "#f0fdf4", borderRadius: "10px", padding: "8px 10px" }, children: [_jsx("p", { style: { margin: 0, fontSize: "11px", color: "#6b7280" }, children: "Total Active Funds" }), _jsx("p", { style: { margin: "2px 0 0", fontSize: "18px", fontWeight: "700", color: "#047857" }, children: formatCurrency(totalFunds) })] })] }), _jsxs("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                }, children: [_jsx("input", { className: "active-users-search-input", type: "text", placeholder: "Search by name, phone or ID...", value: filterText, onChange: (e) => setFilterText(e.target.value), style: {
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
                        } }), filterText && (_jsx("button", { onClick: () => setFilterText(""), style: {
                            padding: "9px 12px",
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                        }, children: "Clear" }))] })] }));
    const SkeletonLoader = () => (_jsx("div", { style: { width: "100%" }, children: [...Array(10)].map((_, i) => (_jsx(UserSkeleton, {}, i))) }));
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
            return (_jsx("div", { style: { display: "grid", gap: "10px", padding: "12px" }, children: [...Array(6)].map((_, index) => (_jsxs("div", { style: {
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "12px",
                    }, children: [_jsx(Skeleton, { height: 18, width: 140 }), _jsx(Skeleton, { height: 14, width: 180, style: { marginTop: "8px" } }), _jsx(Skeleton, { height: 14, width: 110, style: { marginTop: "6px" } }), _jsxs("div", { style: { display: "flex", gap: "8px", marginTop: "12px" }, children: [_jsx(Skeleton, { height: 34, style: { flex: 1 } }), _jsx(Skeleton, { height: 34, style: { flex: 1 } })] })] }, index))) }));
        }
        if (filteredData.length === 0) {
            return (_jsx("div", { style: { textAlign: "center", padding: "28px 16px", color: "#6b7280" }, children: _jsx("p", { style: { margin: 0, fontWeight: "600" }, children: "No users found" }) }));
        }
        return (_jsx("div", { style: { display: "grid", gap: "10px", padding: "12px" }, children: paginatedData.map((row, index) => {
                const isActive = isUserActive(row);
                const isToggling = togglingUserId === row.id;
                const isDeleting = deletingUserId === row.id;
                const isBusy = isToggling || isDeleting;
                return (_jsxs("div", { style: {
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: "10px" }, children: [_jsxs("div", { style: { minWidth: 0 }, children: [_jsx("p", { style: {
                                                margin: 0,
                                                fontSize: "14px",
                                                fontWeight: "700",
                                                color: "#111827",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }, children: row.name || "N/A" }), _jsxs("p", { style: { margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }, children: ["Sr No: ", getSerialNumber(index), " | ", row.phone || "N/A"] })] }), _jsx("span", { style: {
                                        backgroundColor: isActive ? "#dcfce7" : "#fee2e2",
                                        color: isActive ? "#166534" : "#dc2626",
                                        borderRadius: "999px",
                                        padding: "3px 10px",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        height: "fit-content",
                                    }, children: isActive ? "Active" : "Inactive" })] }), _jsxs("div", { style: { marginTop: "10px", fontSize: "12px", color: "#4b5563" }, children: ["Funds: ", _jsx("strong", { style: { color: "#111827" }, children: formatCurrency(row.funds) })] }), _jsxs("div", { style: { marginTop: "6px", fontSize: "12px", color: "#4b5563" }, children: ["Created: ", _jsx("strong", { style: { color: "#111827" }, children: formatDateTime(getCreatedAtValue(row)) })] }), _jsxs("div", { style: {
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: "8px",
                                marginTop: "12px",
                            }, children: [_jsx("button", { onClick: () => handleView(row), disabled: isBusy, style: {
                                        padding: "9px 10px",
                                        border: "none",
                                        borderRadius: "8px",
                                        backgroundColor: "#3b82f6",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: isBusy ? "not-allowed" : "pointer",
                                        opacity: isBusy ? 0.6 : 1,
                                    }, children: "View" }), _jsx("button", { onClick: () => handleToggleStatus(row), disabled: isBusy, style: {
                                        padding: "9px 10px",
                                        border: "none",
                                        borderRadius: "8px",
                                        backgroundColor: isActive ? "#ef4444" : "#22c55e",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: isBusy ? "not-allowed" : "pointer",
                                        opacity: isBusy ? 0.7 : 1,
                                    }, children: isToggling ? "Wait..." : isActive ? "Deactivate" : "Activate" }), _jsx("button", { onClick: () => handleDeleteUser(row), disabled: isBusy, style: {
                                        padding: "9px 10px",
                                        border: "none",
                                        borderRadius: "8px",
                                        backgroundColor: isDeleting ? "#9ca3af" : "#7f1d1d",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: isBusy ? "not-allowed" : "pointer",
                                        opacity: isBusy ? 0.7 : 1,
                                    }, children: isDeleting ? "..." : "Delete" })] })] }, row.id));
            }) }));
    };
    const renderPaginationControls = () => {
        if (isLoading || totalRows === 0)
            return null;
        return (_jsxs("div", { style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "8px 12px 14px",
                borderTop: "1px solid #e5e7eb",
                flexWrap: "wrap",
            }, children: [_jsxs("span", { style: { fontSize: "12px", color: "#6b7280" }, children: ["Showing ", showFrom, "-", showTo, " of ", totalRows] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [_jsx("button", { onClick: () => setCurrentPage((page) => Math.max(1, page - 1)), disabled: currentPage === 1, style: {
                                padding: "6px 10px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                backgroundColor: currentPage === 1 ? "#f3f4f6" : "#fff",
                                color: "#374151",
                                fontSize: "12px",
                                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            }, children: "Prev" }), _jsxs("span", { style: { fontSize: "12px", color: "#374151", minWidth: "72px", textAlign: "center" }, children: ["Page ", currentPage, "/", totalPages] }), _jsx("button", { onClick: () => setCurrentPage((page) => Math.min(totalPages, page + 1)), disabled: currentPage >= totalPages, style: {
                                padding: "6px 10px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                backgroundColor: currentPage >= totalPages ? "#f3f4f6" : "#fff",
                                color: "#374151",
                                fontSize: "12px",
                                cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                            }, children: "Next" })] })] }));
    };
    if (isError) {
        return (_jsx("main", { style: { padding: "20px" }, children: _jsxs("div", { style: {
                    color: "#dc2626",
                    padding: "40px",
                    textAlign: "center",
                    backgroundColor: "#fef2f2",
                    borderRadius: "12px",
                    border: "1px solid #fecaca",
                }, children: [_jsx("h3", { style: { marginBottom: "10px" }, children: "Error loading users" }), _jsx("p", { children: ((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.message) || (error === null || error === void 0 ? void 0 : error.message) || "Something went wrong" }), _jsx("button", { onClick: () => window.location.reload(), style: {
                            marginTop: "15px",
                            padding: "10px 20px",
                            backgroundColor: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }, children: "Retry" })] }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx("style", { jsx: true, children: `
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
            ` }), _jsxs("main", { style: { padding: "9px", height: "100vh", overflow: "auto" }, children: [_jsx("div", { style: {
                            backgroundColor: "#fff",
                            borderRadius: "14px",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
                            overflow: "visible",
                            marginBottom: "74px"
                        }, children: isMobile ? (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                                        padding: "12px",
                                        borderBottom: "1px solid #e5e7eb",
                                        display: "grid",
                                        gap: "10px",
                                    }, children: [_jsx("div", { style: { fontSize: "16px", fontWeight: "700", color: "#111827" }, children: "Active Users" }), _jsxs("div", { style: { fontSize: "12px", color: "#6b7280" }, children: ["Total Active: ", _jsx("strong", { style: { color: "#111827" }, children: filteredData.length }), " | Funds: ", _jsx("strong", { style: { color: "#111827" }, children: formatCurrency(totalFunds) })] }), _jsx("input", { className: "active-users-search-input", type: "text", placeholder: "Search by name, phone or ID...", value: filterText, onChange: (e) => setFilterText(e.target.value), style: {
                                                padding: "10px 12px",
                                                width: "100%",
                                                minWidth: 0,
                                                boxSizing: "border-box",
                                                borderRadius: "8px",
                                                border: "1px solid #d1d5db",
                                                fontSize: "13px",
                                                outline: "none",
                                            } })] }), renderMobileContent(), renderPaginationControls()] })) : (_jsx(DataTable, { title: _jsx("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "8px 0",
                                    position: "relative",
                                    right: "12px",
                                }, children: _jsx("span", { style: { fontSize: "17px", fontWeight: "600" }, children: "Active Users" }) }), columns: columns, data: paginatedData, striped: true, pagination: true, paginationServer: true, highlightOnHover: true, subHeader: true, subHeaderComponent: subHeaderComponent, paginationRowsPerPageOptions: [10, 30, 50, 100], paginationTotalRows: totalRows, onChangePage: (page) => setCurrentPage(page), paginationPerPage: rowsPerPage, onChangeRowsPerPage: (newPerPage) => {
                                setRowsPerPage(newPerPage);
                                setCurrentPage(1);
                            }, progressPending: isLoading, progressComponent: _jsx(SkeletonLoader, {}), responsive: true, customStyles: customStyles, noDataComponent: _jsxs("div", { style: {
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#6b7280",
                                }, children: [_jsx("span", { style: { fontSize: "48px", display: "block", marginBottom: "10px" }, children: "No Data" }), _jsx("p", { children: "No users found" })] }) })) }), showModal && selectedUserId && (_jsx(UserViewModal, { userId: selectedUserId, onClose: handleCloseModal, variant: "default" }))] })] }));
}
