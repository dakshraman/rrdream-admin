
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    useGetAdminsQuery,
    useRegisterAdminMutation,
    useDeleteAdminMutation,
    useUpdateAdminMutation,
    useUpdateAdminDetailsMutation,
    useResetAdminPasswordMutation,
    apiAPISlice
} from "@/store/backendSlice/apiAPISlice";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";

export default function ManageAdminData() {
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

    const admins = data?.admins || [];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            } else {
                Swal.fire('Error', response.message || 'Failed to register admin', 'error');
            }
        } catch (err) {
            Swal.fire('Error', err?.message || 'Error registering admin', 'error');
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
                } else {
                    Swal.fire('Error', 'Failed to delete admin.', 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Failed to delete admin.', 'error');
            }
        }
    };

    if (isLoading) {
        return (
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <Skeleton height={50} count={5} style={{ marginBottom: 15 }} />
                </div>
            </main>
        );
    }

    if (isError) {
        return (
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 text-center">
                    <h3 className="text-lg font-semibold mb-2">Error loading admin data</h3>
                    <p>{error?.data?.message || error?.message || "Something went wrong"}</p>
                    <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Retry
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main style={{ padding: "16px", maxWidth: "1280px", margin: "0 auto", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
            <div style={{ marginBottom: "32px", marginTop: "69px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #f3f4f6", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0", letterSpacing: "-0.025em" }}>Admins Management</h1>
                    <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Manage sub-admins and their access.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 24px", backgroundColor: "#dc2626", color: "#fff", fontWeight: "500", borderRadius: "12px", border: "none", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#b91c1c"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
                >
                    <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Admin
                </button>
            </div>

            <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", border: "1px solid #f3f4f6", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #f3f4f6", fontSize: "14px", fontWeight: "600", color: "#4b5563" }}>
                                <th style={{ padding: "16px 24px" }}>#</th>
                                <th style={{ padding: "16px 24px" }}>Name</th>
                                <th style={{ padding: "16px 24px" }}>Email</th>
                                <th style={{ padding: "16px 24px" }}>Username</th>
                                <th style={{ padding: "16px 24px", textAlign: "right" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: "14px" }}>
                            {admins.length > 0 ? (
                                admins.map((admin, index) => (
                                    <tr key={admin.id} style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                        <td style={{ padding: "16px 24px", color: "#6b7280" }}>{index + 1}</td>
                                        <td style={{ padding: "16px 24px", fontWeight: "500", color: "#111827" }}>{admin.name || "N/A"}</td>
                                        <td style={{ padding: "16px 24px", color: "#4b5563" }}>{admin.email || "N/A"}</td>
                                        <td style={{ padding: "16px 24px", color: "#4b5563" }}>{admin.username || "N/A"}</td>
                                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                            <button
                                                onClick={() => handleDeleteAdmin(admin.id)}
                                                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", color: "#dc2626", backgroundColor: "#fef2f2", borderRadius: "8px", fontWeight: "500", border: "1px solid #fee2e2", cursor: "pointer", transition: "background-color 0.2s" }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: "48px 24px", textAlign: "center", color: "#6b7280" }}>
                                        No admins found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Adding Admin */}
            {isModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "rgba(17, 24, 39, 0.5)", backdropFilter: "blur(4px)" }}>
                    <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", width: "100%", maxWidth: "448px", overflow: "hidden" }}>
                        <div style={{ padding: "24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>Add New Admin</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ color: "#9ca3af", padding: "4px", borderRadius: "8px", border: "none", backgroundColor: "transparent", cursor: "pointer", transition: "color 0.2s, background-color 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.backgroundColor = "#f3f4f6"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.backgroundColor = "transparent"; }}>
                                <svg style={{ width: "24px", height: "24px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleRegisterAdmin} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "4px" }}>Name</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ width: "100%", boxSizing: "border-box", padding: "10px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s" }} placeholder="Enter full name" onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "4px" }}>Email</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: "100%", boxSizing: "border-box", padding: "10px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s" }} placeholder="Enter email address" onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "4px" }}>Username</label>
                                <input required type="text" name="username" value={formData.username} onChange={handleInputChange} style={{ width: "100%", boxSizing: "border-box", padding: "10px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s" }} placeholder="Enter username" onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "4px" }}>Password</label>
                                <input required type="text" name="password" value={formData.password} onChange={handleInputChange} style={{ width: "100%", boxSizing: "border-box", padding: "10px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s" }} placeholder="Enter password" onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                            </div>
                            <div style={{ paddingTop: "16px", display: "flex", gap: "12px" }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "10px 16px", backgroundColor: "#f9fafb", color: "#374151", fontWeight: "500", borderRadius: "12px", border: "1px solid #e5e7eb", cursor: "pointer", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isRegistering} style={{ flex: 1, padding: "10px 16px", backgroundColor: "#dc2626", color: "#fff", fontWeight: "500", borderRadius: "12px", border: "none", cursor: isRegistering ? "not-allowed" : "pointer", opacity: isRegistering ? 0.5 : 1, transition: "background-color 0.2s", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }} onMouseOver={(e) => !isRegistering && (e.currentTarget.style.backgroundColor = "#b91c1c")} onMouseOut={(e) => !isRegistering && (e.currentTarget.style.backgroundColor = "#dc2626")}>
                                    {isRegistering ? <span style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span> : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}