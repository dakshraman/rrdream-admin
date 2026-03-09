import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetAdminsQuery, useRegisterAdminMutation, useDeleteAdminMutation, useUpdateAdminMutation, useUpdateAdminDetailsMutation, useResetAdminPasswordMutation, apiAPISlice } from "@/store/backendSlice/apiAPISlice";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
export default function ManageAdminData() {
    var _a;
    const { data, isLoading, isError, error, refetch } = useGetAdminsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [registerAdmin, { isLoading: isRegistering }] = useRegisterAdminMutation();
    const [deleteAdmin] = useDeleteAdminMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
    });
    const admins = (data === null || data === void 0 ? void 0 : data.admins) || [];
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => (Object.assign(Object.assign({}, prev), { [name]: value })));
    };
    const handleRegisterAdmin = async (e) => {
        e.preventDefault();
        try {
            const response = await registerAdmin(formData).unwrap();
            if (response.message === "User registered successfully" || response.status === true) {
                Swal.fire('Success', 'Admin registered successfully', 'success');
                setIsModalOpen(false);
                setFormData({ name: "", email: "", username: "", password: "" });
                refetch();
            }
            else {
                Swal.fire('Error', response.message || 'Failed to register admin', 'error');
            }
        }
        catch (err) {
            Swal.fire('Error', (err === null || err === void 0 ? void 0 : err.message) || 'Error registering admin', 'error');
        }
    };
    const handleDeleteAdmin = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        if (result.isConfirmed) {
            try {
                const response = await deleteAdmin(id).unwrap();
                if (response.status) {
                    Swal.fire('Deleted!', 'Admin has been deleted.', 'success');
                    refetch();
                }
                else {
                    Swal.fire('Error', 'Failed to delete admin.', 'error');
                }
            }
            catch (err) {
                Swal.fire('Error', 'Failed to delete admin.', 'error');
            }
        }
    };
    if (isLoading) {
        return (_jsx("main", { className: "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto", children: _jsx("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-6", children: _jsx(Skeleton, { height: 50, count: 5, style: { marginBottom: 15 } }) }) }));
    }
    if (isError) {
        return (_jsx("main", { className: "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto", children: _jsxs("div", { className: "bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 text-center", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Error loading admin data" }), _jsx("p", { children: ((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.message) || (error === null || error === void 0 ? void 0 : error.message) || "Something went wrong" }), _jsx("button", { onClick: () => refetch(), className: "mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition", children: "Retry" })] }) }));
    }
    return (_jsxs("main", { style: { padding: "16px", maxWidth: "1280px", margin: "0 auto", backgroundColor: "#f9fafb", minHeight: "100vh" }, children: [_jsxs("div", { style: { marginBottom: "32px", marginTop: "69px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #f3f4f6", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", flexWrap: "wrap", gap: "16px" }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0", letterSpacing: "-0.025em" }, children: "Admins Management" }), _jsx("p", { style: { fontSize: "14px", color: "#6b7280", margin: 0 }, children: "Manage sub-admins and their access." })] }), _jsxs("button", { onClick: () => setIsModalOpen(true), style: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 24px", backgroundColor: "#dc2626", color: "#fff", fontWeight: "500", borderRadius: "12px", border: "none", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = "#b91c1c", onMouseOut: (e) => e.currentTarget.style.backgroundColor = "#dc2626", children: [_jsx("svg", { style: { width: "20px", height: "20px" }, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 4v16m8-8H4" }) }), "Add Admin"] })] }), _jsx("div", { style: { backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", border: "1px solid #f3f4f6", overflow: "hidden" }, children: _jsx("div", { style: { overflowX: "auto" }, children: _jsxs("table", { style: { width: "100%", textAlign: "left", borderCollapse: "collapse" }, children: [_jsx("thead", { children: _jsxs("tr", { style: { backgroundColor: "#f9fafb", borderBottom: "1px solid #f3f4f6", fontSize: "14px", fontWeight: "600", color: "#4b5563" }, children: [_jsx("th", { style: { padding: "16px 24px" }, children: "#" }), _jsx("th", { style: { padding: "16px 24px" }, children: "Name" }), _jsx("th", { style: { padding: "16px 24px" }, children: "Email" }), _jsx("th", { style: { padding: "16px 24px" }, children: "Username" }), _jsx("th", { style: { padding: "16px 24px", textAlign: "right" }, children: "Action" })] }) }), _jsx("tbody", { style: { fontSize: "14px" }, children: admins.length > 0 ? (admins.map((admin, index) => (_jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", transition: "background-color 0.2s" }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = "#f9fafb", onMouseOut: (e) => e.currentTarget.style.backgroundColor = "transparent", children: [_jsx("td", { style: { padding: "16px 24px", color: "#6b7280" }, children: index + 1 }), _jsx("td", { style: { padding: "16px 24px", fontWeight: "500", color: "#111827" }, children: admin.name || "N/A" }), _jsx("td", { style: { padding: "16px 24px", color: "#4b5563" }, children: admin.email || "N/A" }), _jsx("td", { style: { padding: "16px 24px", color: "#4b5563" }, children: admin.username || "N/A" }), _jsx("td", { style: { padding: "16px 24px", textAlign: "right" }, children: _jsx("button", { onClick: () => handleDeleteAdmin(admin.id), style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", color: "#dc2626", backgroundColor: "#fef2f2", borderRadius: "8px", fontWeight: "500", border: "1px solid #fee2e2", cursor: "pointer", transition: "background-color 0.2s" }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = "#fee2e2", onMouseOut: (e) => e.currentTarget.style.backgroundColor = "#fef2f2", children: "Delete" }) })] }, admin.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: "5", style: { padding: "48px 24px", textAlign: "center", color: "#6b7280" }, children: "No admins found." }) })) })] }) }) }), isModalOpen && (_jsx("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "rgba(17, 24, 39, 0.5)", backdropFilter: "blur(4px)" }, children: _jsxs("div", { style: { backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", width: "100%", maxWidth: "448px", overflow: "hidden" }, children: [_jsxs("div", { style: { padding: "24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx("h2", { style: { fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }, children: "Add New Admin" }), _jsx("button", { onClick: () => setIsModalOpen(false), style: { color: "#9ca3af", padding: "4px", borderRadius: "8px", border: "none", backgroundColor: "transparent", cursor: "pointer", transition: "color 0.2s, background-color 0.2s" }, onMouseOver: (e) => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.backgroundColor = "#f3f4f6"; }, onMouseOut: (e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.backgroundColor = "transparent"; }, children: _jsx("svg", { style: { width: "24px", height: "24px" }, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("form", { onSubmit: handleRegisterAdmin, style: { padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "4px" }, children: "Name" }), _jsx("input", { required: true, type: "text", name: "name", value: formData.name, onChange: handleInputChange, style: { width: "100%", boxSizing: "border-box", padding: "10px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s" }, placeholder: "Enter full name", onFocus: (e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }, onBlur: (e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "4px" }, children: "Email" }), _jsx("input", { required: true, type: "email", name: "email", value: formData.email, onChange: handleInputChange, style: { width: "100%", boxSizing: "border-box", padding: "10px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s" }, placeholder: "Enter email address", onFocus: (e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }, onBlur: (e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "4px" }, children: "Username" }), _jsx("input", { required: true, type: "text", name: "username", value: formData.username, onChange: handleInputChange, style: { width: "100%", boxSizing: "border-box", padding: "10px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s" }, placeholder: "Enter username", onFocus: (e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }, onBlur: (e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "4px" }, children: "Password" }), _jsx("input", { required: true, type: "text", name: "password", value: formData.password, onChange: handleInputChange, style: { width: "100%", boxSizing: "border-box", padding: "10px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s" }, placeholder: "Enter password", onFocus: (e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }, onBlur: (e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; } })] }), _jsxs("div", { style: { paddingTop: "16px", display: "flex", gap: "12px" }, children: [_jsx("button", { type: "button", onClick: () => setIsModalOpen(false), style: { flex: 1, padding: "10px 16px", backgroundColor: "#f9fafb", color: "#374151", fontWeight: "500", borderRadius: "12px", border: "1px solid #e5e7eb", cursor: "pointer", transition: "background-color 0.2s" }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = "#f3f4f6", onMouseOut: (e) => e.currentTarget.style.backgroundColor = "#f9fafb", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isRegistering, style: { flex: 1, padding: "10px 16px", backgroundColor: "#dc2626", color: "#fff", fontWeight: "500", borderRadius: "12px", border: "none", cursor: isRegistering ? "not-allowed" : "pointer", opacity: isRegistering ? 0.5 : 1, transition: "background-color 0.2s", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }, onMouseOver: (e) => !isRegistering && (e.currentTarget.style.backgroundColor = "#b91c1c"), onMouseOut: (e) => !isRegistering && (e.currentTarget.style.backgroundColor = "#dc2626"), children: isRegistering ? _jsx("span", { style: { width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" } }) : 'Register' })] })] })] }) }))] }));
}
