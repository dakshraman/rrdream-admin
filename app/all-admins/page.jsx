'use client';
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetAdminQuery } from "@/store/backendSlice/apiAPISlice";

export default function ManageAdminData() {
    const { data: adminData, isLoading, isError, error, refetch } = useGetAdminQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const admin = adminData?.data?.Admin || adminData?.data?.admin || null;

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

    const getTimeSince = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffYears = Math.floor(diffDays / 365);
        const diffMonths = Math.floor((diffDays % 365) / 30);

        if (diffYears > 0) {
            return `${diffYears} year${diffYears > 1 ? 's' : ''} ${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        } else if (diffMonths > 0) {
            return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        } else {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }
    };

    if (isLoading) {
        return (
            <main style={{ padding: "20px" }}>
                <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    maxWidth: "800px",
                    margin: "0 auto"
                }}>
                    <div style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        padding: "40px",
                        textAlign: "center"
                    }}>
                        <Skeleton circle width={120} height={120} />
                        <Skeleton width={200} height={28} style={{ marginTop: "20px" }} />
                        <Skeleton width={150} height={20} style={{ marginTop: "10px" }} />
                    </div>
                    <div style={{ padding: "30px" }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} style={{ marginBottom: "20px" }}>
                                <Skeleton width={100} height={14} />
                                <Skeleton width="100%" height={20} style={{ marginTop: "8px" }} />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    if (isError) {
        return (
            <main style={{ padding: "20px" }}>
                <div style={{
                    color: "#dc2626",
                    padding: "60px 40px",
                    textAlign: "center",
                    backgroundColor: "#fef2f2",
                    borderRadius: "16px",
                    border: "1px solid #fecaca",
                    maxWidth: "500px",
                    margin: "0 auto"
                }}>
                    <div style={{ fontSize: "60px", marginBottom: "20px" }}>⚠️</div>
                    <h3 style={{ marginBottom: "10px", fontSize: "20px", fontWeight: "600" }}>Error loading admin data</h3>
                    <p style={{ color: "#991b1b", marginBottom: "20px" }}>{error?.data?.message || error?.message || "Something went wrong"}</p>
                    <button
                        onClick={() => refetch()}
                        style={{
                            padding: "12px 28px",
                            backgroundColor: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "15px",
                            fontWeight: "500",
                            transition: "all 0.2s"
                        }}
                    >
                        🔄 Retry
                    </button>
                </div>
            </main>
        );
    }

    if (!admin) {
        return (
            <main style={{ padding: "20px" }}>
                <div style={{
                    padding: "60px 40px",
                    textAlign: "center",
                    backgroundColor: "#f9fafb",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    maxWidth: "500px",
                    margin: "0 auto"
                }}>
                    <div style={{ fontSize: "60px", marginBottom: "20px" }}>👤</div>
                    <h3 style={{ marginBottom: "10px", fontSize: "20px", fontWeight: "600", color: "#374151" }}>No Admin Found</h3>
                    <p style={{ color: "#6b7280" }}>Admin data is not available</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{ padding: "20px" }}>
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                overflow: "hidden",
                maxWidth: "800px",
                margin: "0 auto"
            }}>
                <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "40px 30px",
                    textAlign: "center",
                    position: "relative"
                }}>
                    <button
                        onClick={() => refetch()}
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            padding: "8px 16px",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.3)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            backdropFilter: "blur(10px)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}
                    >
                        🔄 Refresh
                    </button>

                    <div style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #fff 0%, #e0e7ff 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        border: "4px solid rgba(255,255,255,0.3)"
                    }}>
                        <span style={{
                            fontSize: "48px",
                            fontWeight: "700",
                            color: "#667eea"
                        }}>
                            {(admin.name || "A").charAt(0).toUpperCase()}
                        </span>
                    </div>

                    <h1 style={{
                        color: "#fff",
                        fontSize: "28px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                        {admin.name || "N/A"}
                    </h1>

                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        padding: "8px 20px",
                        borderRadius: "30px",
                        backdropFilter: "blur(10px)"
                    }}>
                        <span style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "#22c55e",
                            boxShadow: "0 0 8px #22c55e"
                        }}></span>
                        <span style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>
                            Super Admin
                        </span>
                    </div>

                    <p style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "13px",
                        marginTop: "15px"
                    }}>
                        Admin ID: #{admin.id}
                    </p>
                </div>

                <div style={{ padding: "30px" }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "20px"
                    }}>
                        <div style={{
                            backgroundColor: "#f9fafb",
                            borderRadius: "12px",
                            padding: "20px",
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "8px"
                            }}>
                                <span style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    backgroundColor: "#dbeafe",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px"
                                }}>📧</span>
                                <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: "500" }}>Email Address</span>
                            </div>
                            <p style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#111827",
                                paddingLeft: "52px"
                            }}>
                                {admin.email || "N/A"}
                            </p>
                        </div>

                        <div style={{
                            backgroundColor: "#f9fafb",
                            borderRadius: "12px",
                            padding: "20px",
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "8px"
                            }}>
                                <span style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    backgroundColor: "#dcfce7",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px"
                                }}>👤</span>
                                <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: "500" }}>Username</span>
                            </div>
                            <p style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#111827",
                                paddingLeft: "52px"
                            }}>
                                {admin.username || "N/A"}
                            </p>
                        </div>

                        <div style={{
                            backgroundColor: "#f9fafb",
                            borderRadius: "12px",
                            padding: "20px",
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "8px"
                            }}>
                                <span style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    backgroundColor: "#fef3c7",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px"
                                }}>📅</span>
                                <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: "500" }}>Account Created</span>
                            </div>
                            <p style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#111827",
                                paddingLeft: "52px"
                            }}>
                                {formatDate(admin.created_at)}
                            </p>
                            <p style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                paddingLeft: "52px",
                                marginTop: "4px"
                            }}>
                                {getTimeSince(admin.created_at)}
                            </p>
                        </div>

                        <div style={{
                            backgroundColor: "#f9fafb",
                            borderRadius: "12px",
                            padding: "20px",
                            border: "1px solid #e5e7eb"
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "8px"
                            }}>
                                <span style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    backgroundColor: "#e0e7ff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px"
                                }}>🔄</span>
                                <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: "500" }}>Last Updated</span>
                            </div>
                            <p style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#111827",
                                paddingLeft: "52px"
                            }}>
                                {formatDate(admin.updated_at)}
                            </p>
                            <p style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                paddingLeft: "52px",
                                marginTop: "4px"
                            }}>
                                {getTimeSince(admin.updated_at)}
                            </p>
                        </div>
                    </div>


                </div>

                <div style={{
                    backgroundColor: "#f9fafb",
                    padding: "15px 30px",
                    borderTop: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    <span style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e"
                    }}></span>
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>
                        Main Administrator Account
                    </span>
                </div>
            </div>
        </main>
    );
}