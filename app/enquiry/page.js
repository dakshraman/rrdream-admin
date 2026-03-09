import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetInquiryUsersQuery, useGetUserInquiriesQuery, useReplyInquiryMutation } from "@/store/backendSlice/apiAPISlice";
import { toast } from "react-hot-toast";
// Skeleton component for loading state
const InquirySkeleton = () => (_jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: "20px",
        borderBottom: "1px solid #f0f0f0"
    }, children: [_jsx(Skeleton, { width: 40, height: 20 }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [_jsx(Skeleton, { circle: true, width: 40, height: 40 }), _jsx(Skeleton, { width: 120, height: 16 })] }), _jsx(Skeleton, { width: 80, height: 24, borderRadius: 12 }), _jsx(Skeleton, { width: 100, height: 16 })] }));
// Modal to show user inquiries
const InquiryModal = ({ userId, userName, onClose }) => {
    var _a;
    const { data: inquiryData, isLoading, isError, error, refetch: refetchInquiries } = useGetUserInquiriesQuery(userId);
    const [replyInquiry, { isLoading: isReplying }] = useReplyInquiryMutation();
    const [replyMessage, setReplyMessage] = useState("");
    const inquiries = (inquiryData === null || inquiryData === void 0 ? void 0 : inquiryData.inquiries) || [];
    const formatDate = (dateString) => {
        if (!dateString)
            return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const handleSendReply = async () => {
        var _a;
        if (!replyMessage.trim())
            return;
        try {
            await replyInquiry({ userId, message: replyMessage }).unwrap();
            toast.success("Reply sent successfully!");
            setReplyMessage("");
            refetchInquiries();
        }
        catch (err) {
            toast.error(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || "Failed to send reply");
        }
    };
    return (_jsx("div", { style: {
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
        }, children: _jsxs("div", { style: {
                backgroundColor: "#fff",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "800px",
                maxHeight: "80vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
            }, children: [_jsxs("div", { style: {
                        padding: "20px",
                        borderBottom: "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }, children: [_jsxs("h2", { style: { margin: 0, fontSize: "20px", fontWeight: "600" }, children: ["Inquiries from ", userName] }), _jsx("button", { onClick: onClose, style: {
                                padding: "8px 12px",
                                backgroundColor: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px"
                            }, children: "Close" })] }), _jsxs("div", { style: {
                        padding: "20px",
                        overflow: "auto",
                        flex: 1
                    }, children: [isLoading && (_jsxs("div", { style: { textAlign: "center", padding: "40px" }, children: [_jsx("div", { style: {
                                        width: "40px",
                                        height: "40px",
                                        border: "4px solid #e5e7eb",
                                        borderTopColor: "#3b82f6",
                                        borderRadius: "50%",
                                        animation: "spin 1s linear infinite",
                                        margin: "0 auto"
                                    } }), _jsx("p", { style: { marginTop: "15px", color: "#6b7280" }, children: "Loading inquiries..." })] })), isError && (_jsx("div", { style: {
                                padding: "40px",
                                textAlign: "center",
                                color: "#dc2626"
                            }, children: _jsx("p", { children: ((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.message) || (error === null || error === void 0 ? void 0 : error.message) || "Failed to load inquiries" }) })), !isLoading && !isError && inquiries.length === 0 && (_jsxs("div", { style: {
                                padding: "40px",
                                textAlign: "center",
                                color: "#6b7280"
                            }, children: [_jsx("span", { style: { fontSize: "48px", display: "block", marginBottom: "10px" }, children: "\uD83D\uDCAC" }), _jsx("p", { children: "No inquiries found for this user" })] })), !isLoading && !isError && inquiries.length > 0 && (_jsx("div", { style: { display: "flex", flexDirection: "column", gap: "15px" }, children: inquiries.map((inquiry) => (_jsxs("div", { style: {
                                    padding: "15px",
                                    backgroundColor: inquiry.sender === "user" ? "#eff6ff" : "#f3f4f6",
                                    borderRadius: "8px",
                                    border: "1px solid " + (inquiry.sender === "user" ? "#bfdbfe" : "#e5e7eb")
                                }, children: [_jsxs("div", { style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: "8px"
                                        }, children: [_jsx("span", { style: {
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    color: inquiry.sender === "user" ? "#2563eb" : "#6b7280",
                                                    backgroundColor: inquiry.sender === "user" ? "#dbeafe" : "#e5e7eb",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px"
                                                }, children: inquiry.sender === "user" ? "USER" : "ADMIN" }), _jsx("span", { style: {
                                                    fontSize: "12px",
                                                    color: "#6b7280"
                                                }, children: formatDate(inquiry.created_at) })] }), _jsx("p", { style: {
                                            margin: 0,
                                            fontSize: "14px",
                                            color: "#111827",
                                            lineHeight: "1.5"
                                        }, children: inquiry.message })] }, inquiry.id))) }))] }), !isLoading && !isError && (_jsxs("div", { style: {
                        padding: "15px 20px",
                        borderTop: "1px solid #e5e7eb",
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        backgroundColor: "#f9fafb"
                    }, children: [_jsx("input", { type: "text", value: replyMessage, onChange: (e) => setReplyMessage(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSendReply(), placeholder: "Type your reply here...", style: {
                                flex: 1,
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                fontSize: "14px",
                                outline: "none"
                            } }), _jsx("button", { onClick: handleSendReply, disabled: isReplying || !replyMessage.trim(), style: {
                                padding: "10px 20px",
                                backgroundColor: isReplying || !replyMessage.trim() ? "#9ca3af" : "#4f46e5",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: isReplying || !replyMessage.trim() ? "not-allowed" : "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                transition: "background-color 0.2s"
                            }, children: isReplying ? "Sending..." : "Send" })] }))] }) }));
};
export default function ManageInquiriesData() {
    var _a;
    const [filterText, setFilterText] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const { data: usersData, isLoading, isError, error } = useGetInquiryUsersQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const users = (usersData === null || usersData === void 0 ? void 0 : usersData.users) || [];
    const [rowsPerPage, setRowsPerPage] = useState(100);
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
            cell: (row) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [_jsx("div", { style: {
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
                        }, children: (row.name || "U").charAt(0).toUpperCase() }), _jsx("span", { style: { fontWeight: "500" }, children: row.name || "N/A" })] })),
            width: "250px",
        },
        {
            name: "Actions",
            cell: (row) => (_jsx("div", { style: { display: "flex", gap: "8px" }, children: _jsxs("button", { onClick: () => handleViewInquiries(row), style: {
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
                    }, children: [_jsx("span", { children: "\uD83D\uDCAC" }), " View Inquiries"] }) })),
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
    const subHeaderComponent = (_jsxs("div", { style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 0",
            width: "100%",
            flexWrap: "wrap",
            gap: "15px"
        }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }, children: [_jsx("input", { type: "text", placeholder: "Search by name or ID...", value: filterText, onChange: (e) => setFilterText(e.target.value), style: {
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            minWidth: "280px",
                            fontSize: "14px",
                            outline: "none",
                        } }), filterText && (_jsx("button", { onClick: () => setFilterText(""), style: {
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
                        }, children: "\u2715 Clear" }))] }), _jsx("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    fontSize: "14px",
                    color: "#6b7280"
                }, children: _jsxs("span", { children: ["Showing: ", _jsx("strong", { style: { color: "#111827" }, children: filteredData.length }), " of ", users.length, " users"] }) })] }));
    const SkeletonLoader = () => (_jsx("div", { style: { width: "100%" }, children: [...Array(10)].map((_, i) => (_jsx(InquirySkeleton, {}, i))) }));
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
        return (_jsx("main", { style: { padding: "20px" }, children: _jsxs("div", { style: {
                    color: "#dc2626",
                    padding: "40px",
                    textAlign: "center",
                    backgroundColor: "#fef2f2",
                    borderRadius: "12px",
                    border: "1px solid #fecaca"
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
            ` }), _jsxs("main", { style: { padding: "9px" }, children: [_jsx("div", { style: {
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            overflow: "hidden"
                        }, children: _jsx(DataTable, { title: _jsx("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px 0"
                                }, children: _jsx("span", { style: { fontSize: "18px", fontWeight: "600" }, children: "User Inquiries" }) }), columns: columns, data: filteredData, striped: true, pagination: true, highlightOnHover: true, subHeader: true, subHeaderComponent: subHeaderComponent, paginationRowsPerPageOptions: [10, 30, 50, 100], paginationPerPage: rowsPerPage, onChangeRowsPerPage: (newPerPage) => setRowsPerPage(newPerPage), progressPending: isLoading, progressComponent: _jsx(SkeletonLoader, {}), responsive: true, customStyles: customStyles, noDataComponent: _jsxs("div", { style: {
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#6b7280"
                                }, children: [_jsx("span", { style: { fontSize: "48px", display: "block", marginBottom: "10px" }, children: "\uD83D\uDD0D" }), _jsx("p", { children: "No users with inquiries found" }), filterText && (_jsx("button", { onClick: () => setFilterText(""), style: {
                                            marginTop: "10px",
                                            padding: "8px 16px",
                                            backgroundColor: "#4f46e5",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }, children: "Clear Filters" }))] }) }) }), showModal && selectedUserId && (_jsx(InquiryModal, { userId: selectedUserId, userName: selectedUserName, onClose: handleCloseModal }))] })] }));
}
