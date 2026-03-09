import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetBannersQuery, useAddBannerMutation, useDeleteBannerMutation } from "@/store/backendSlice/apiAPISlice";
const inferMimeTypeFromBase64 = (base64Value) => {
    if (base64Value.startsWith("/9j/"))
        return "image/jpeg";
    if (base64Value.startsWith("iVBORw0KGgo"))
        return "image/png";
    if (base64Value.startsWith("R0lGOD"))
        return "image/gif";
    if (base64Value.startsWith("Qk"))
        return "image/bmp";
    if (base64Value.startsWith("UklGR"))
        return "image/webp";
    if (base64Value.startsWith("PHN2Zy"))
        return "image/svg+xml";
    return "image/jpeg";
};
const isLikelyRawBase64Image = (value) => {
    if (!value || value.length < 80)
        return false;
    return /^[A-Za-z0-9+/=]+$/.test(value);
};
const normalizeBannerImageSrc = (imageValue) => {
    if (!imageValue || typeof imageValue !== "string")
        return "";
    const trimmedValue = imageValue.trim();
    if (!trimmedValue)
        return "";
    if (/^data:/i.test(trimmedValue) || /^https?:\/\//i.test(trimmedValue) || trimmedValue.startsWith("blob:")) {
        return trimmedValue;
    }
    const sanitizedBase64 = trimmedValue.replace(/\s+/g, "");
    // Important: check raw base64 before treating leading "/" as a relative URL.
    if (isLikelyRawBase64Image(sanitizedBase64)) {
        const mimeType = inferMimeTypeFromBase64(sanitizedBase64);
        return `data:${mimeType};base64,${sanitizedBase64}`;
    }
    return trimmedValue;
};
// Skeleton component for loading state
const BannerSkeleton = () => (_jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: "20px",
        borderBottom: "1px solid #f0f0f0"
    }, children: [_jsx(Skeleton, { width: 40, height: 20 }), _jsx(Skeleton, { width: 100, height: 60, borderRadius: 8 }), _jsx(Skeleton, { width: 150, height: 16 }), _jsx(Skeleton, { width: 80, height: 32, borderRadius: 6 })] }));
export default function ManageBannersData() {
    var _a;
    const [filterText, setFilterText] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const { data: bannerData, isLoading, isError, error, refetch } = useGetBannersQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    console.log(" the bannerData", bannerData);
    const [addBanner, { isLoading: isAdding }] = useAddBannerMutation();
    const [deleteBanner] = useDeleteBannerMutation();
    const banners = (bannerData === null || bannerData === void 0 ? void 0 : bannerData.banners) || [];
    const normalizedBanners = useMemo(() => banners.map((banner) => (Object.assign(Object.assign({}, banner), { imageSrc: normalizeBannerImageSrc(banner.image || banner.image_url || banner.url || "") }))), [banners]);
    console.log("Extracted banners:", banners);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [deletingId, setDeletingId] = useState(null);
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
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert("Please select a valid image file");
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size should be less than 5MB");
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleAddBanner = async () => {
        var _a;
        if (!selectedImage) {
            alert("Please select an image");
            return;
        }
        const formData = new FormData();
        formData.append("image", selectedImage);
        try {
            const result = await addBanner(formData).unwrap();
            console.log("Add banner result:", result);
            setShowAddModal(false);
            setSelectedImage(null);
            setImagePreview(null);
            alert((result === null || result === void 0 ? void 0 : result.message) || "Banner added successfully!");
            refetch(); // Refresh the banner list
        }
        catch (err) {
            console.error("Add banner error:", err);
            alert(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || "Failed to add banner");
        }
    };
    const handleDeleteBanner = async (id) => {
        var _a;
        if (!window.confirm("Are you sure you want to delete this banner?")) {
            return;
        }
        setDeletingId(id);
        try {
            const result = await deleteBanner(id).unwrap();
            console.log("Delete banner result:", result);
            alert((result === null || result === void 0 ? void 0 : result.message) || "Banner deleted successfully!");
            refetch(); // Refresh the banner list
        }
        catch (err) {
            console.error("Delete banner error:", err);
            alert(((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || "Failed to delete banner");
        }
        finally {
            setDeletingId(null);
        }
    };
    const columns = [
        {
            name: "S.No",
            selector: (row, index) => index + 1,
            sortable: false,
            width: "80px",
        },
        {
            name: "ID",
            selector: (row) => row.id,
            sortable: true,
            width: "80px",
        },
        {
            name: "Image",
            cell: (row) => (_jsx("div", { style: { padding: "8px 0" }, children: _jsx("img", { src: row.imageSrc, alt: `Banner ${row.id}`, style: {
                        width: "120px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        cursor: row.imageSrc ? "pointer" : "default"
                    }, onClick: () => {
                        if (row.imageSrc) {
                            window.open(row.imageSrc, "_blank");
                        }
                    }, onError: (e) => {
                        e.target.src = "https://via.placeholder.com/120x60?text=No+Image";
                    } }) })),
            width: "160px",
        },
        {
            name: "Created At",
            selector: (row) => row.created_at,
            sortable: true,
            cell: (row) => (_jsx("span", { style: { fontSize: "13px", color: "#6b7280" }, children: formatDate(row.created_at) })),
            width: "180px",
        },
        {
            name: "Actions",
            cell: (row) => (_jsx("div", { style: { display: "flex", gap: "8px" }, children: _jsx("button", { onClick: () => handleDeleteBanner(row.id), disabled: deletingId === row.id, style: {
                        padding: "6px 12px",
                        backgroundColor: deletingId === row.id ? "#9ca3af" : "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: deletingId === row.id ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        transition: "background-color 0.2s"
                    }, onMouseOver: (e) => {
                        if (deletingId !== row.id) {
                            e.currentTarget.style.backgroundColor = "#dc2626";
                        }
                    }, onMouseOut: (e) => {
                        if (deletingId !== row.id) {
                            e.currentTarget.style.backgroundColor = "#ef4444";
                        }
                    }, children: deletingId === row.id ? "Deleting..." : "Delete" }) })),
            width: "180px",
        },
    ];
    const filteredData = normalizedBanners.filter((item) => {
        if (filterText) {
            const searchText = filterText.toLowerCase();
            const id = (item.id || "").toString().toLowerCase();
            return id.includes(searchText);
        }
        return true;
    });
    // Sub header component
    const subHeaderComponent = (_jsxs("div", { style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 0",
            width: "100%",
            flexWrap: "wrap",
            gap: "15px"
        }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }, children: [_jsx("button", { onClick: () => setShowAddModal(true), style: {
                            padding: "10px 16px",
                            backgroundColor: "#22c55e",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "background-color 0.2s"
                        }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = "#16a34a", onMouseOut: (e) => e.currentTarget.style.backgroundColor = "#22c55e", children: "+ Add Banner" }), _jsx("input", { type: "text", placeholder: "Search by ID...", value: filterText, onChange: (e) => setFilterText(e.target.value), style: {
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            minWidth: "200px",
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
                        }, children: "\u2715 Clear" }))] }), _jsxs("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    fontSize: "14px",
                    color: "#6b7280"
                }, children: [_jsxs("span", { children: ["Total: ", _jsx("strong", { style: { color: "#111827" }, children: normalizedBanners.length }), " banners"] }), filterText && (_jsxs("span", { children: ["Showing: ", _jsx("strong", { style: { color: "#111827" }, children: filteredData.length })] }))] })] }));
    const SkeletonLoader = () => (_jsx("div", { style: { width: "100%" }, children: [...Array(5)].map((_, i) => (_jsx(BannerSkeleton, {}, i))) }));
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
                minHeight: "80px",
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
    // Add Banner Modal
    const AddBannerModal = () => (_jsx("div", { style: {
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
        }, onClick: () => {
            if (!isAdding) {
                setShowAddModal(false);
                setSelectedImage(null);
                setImagePreview(null);
            }
        }, children: _jsxs("div", { style: {
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "24px",
                width: "90%",
                maxWidth: "500px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                    }, children: [_jsx("h2", { style: { fontSize: "20px", fontWeight: "600", margin: 0 }, children: "Add New Banner" }), _jsx("button", { onClick: () => {
                                if (!isAdding) {
                                    setShowAddModal(false);
                                    setSelectedImage(null);
                                    setImagePreview(null);
                                }
                            }, disabled: isAdding, style: {
                                background: "none",
                                border: "none",
                                fontSize: "24px",
                                cursor: isAdding ? "not-allowed" : "pointer",
                                color: "#6b7280",
                            }, children: "\u00D7" })] }), _jsx("div", { style: {
                        border: "2px dashed #d1d5db",
                        borderRadius: "8px",
                        padding: "40px 20px",
                        textAlign: "center",
                        marginBottom: "20px",
                        backgroundColor: "#f9fafb",
                        position: "relative",
                    }, children: imagePreview ? (_jsxs("div", { children: [_jsx("img", { src: imagePreview, alt: "Preview", style: {
                                    maxWidth: "100%",
                                    maxHeight: "200px",
                                    borderRadius: "8px",
                                    marginBottom: "10px",
                                } }), _jsx("p", { style: { color: "#6b7280", fontSize: "14px", margin: "10px 0" }, children: selectedImage === null || selectedImage === void 0 ? void 0 : selectedImage.name }), _jsx("button", { onClick: () => {
                                    setSelectedImage(null);
                                    setImagePreview(null);
                                }, disabled: isAdding, style: {
                                    marginTop: "10px",
                                    padding: "6px 12px",
                                    backgroundColor: isAdding ? "#9ca3af" : "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: isAdding ? "not-allowed" : "pointer",
                                    fontSize: "12px",
                                }, children: "Remove Image" })] })) : (_jsxs("div", { children: [_jsx("span", { style: { fontSize: "48px" }, children: "\uD83D\uDDBC\uFE0F" }), _jsx("p", { style: { color: "#6b7280", marginTop: "10px", marginBottom: "10px" }, children: "Click to select an image" }), _jsx("p", { style: { color: "#9ca3af", fontSize: "12px", marginBottom: "10px" }, children: "Supported: JPG, PNG, GIF (Max 5MB)" }), _jsxs("label", { style: {
                                    display: "inline-block",
                                    marginTop: "10px",
                                    padding: "8px 16px",
                                    backgroundColor: "#4f46e5",
                                    color: "#fff",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                }, children: ["Select Image", _jsx("input", { type: "file", accept: "image/*", onChange: handleImageChange, style: { display: "none" } })] })] })) }), _jsxs("div", { style: { display: "flex", gap: "12px", justifyContent: "flex-end" }, children: [_jsx("button", { onClick: () => {
                                setShowAddModal(false);
                                setSelectedImage(null);
                                setImagePreview(null);
                            }, disabled: isAdding, style: {
                                padding: "10px 20px",
                                backgroundColor: "#f3f4f6",
                                color: "#374151",
                                border: "none",
                                borderRadius: "8px",
                                cursor: isAdding ? "not-allowed" : "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                            }, children: "Cancel" }), _jsx("button", { onClick: handleAddBanner, disabled: !selectedImage || isAdding, style: {
                                padding: "10px 20px",
                                backgroundColor: !selectedImage || isAdding ? "#9ca3af" : "#22c55e",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: !selectedImage || isAdding ? "not-allowed" : "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                            }, children: isAdding ? "Uploading..." : "Add Banner" })] })] }) }));
    if (isError) {
        return (_jsx("main", { style: { padding: "20px" }, children: _jsxs("div", { style: {
                    color: "#dc2626",
                    padding: "40px",
                    textAlign: "center",
                    backgroundColor: "#fef2f2",
                    borderRadius: "12px",
                    border: "1px solid #fecaca"
                }, children: [_jsx("h3", { style: { marginBottom: "10px" }, children: "Error loading banners" }), _jsx("p", { children: ((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.message) || (error === null || error === void 0 ? void 0 : error.message) || "Something went wrong" }), _jsx("button", { onClick: () => refetch(), style: {
                            marginTop: "15px",
                            padding: "10px 20px",
                            backgroundColor: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }, children: "Retry" })] }) }));
    }
    return (_jsxs("main", { style: { padding: "9px" }, children: [showAddModal && _jsx(AddBannerModal, {}), _jsx("div", { style: {
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    overflow: "hidden"
                }, children: _jsx(DataTable, { title: _jsx("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 0"
                        }, children: _jsx("span", { style: { fontSize: "18px", fontWeight: "600" }, children: "Manage Banners" }) }), columns: columns, data: filteredData, striped: true, pagination: true, highlightOnHover: true, subHeader: true, subHeaderComponent: subHeaderComponent, paginationRowsPerPageOptions: [10, 30, 50, 100], paginationPerPage: rowsPerPage, onChangeRowsPerPage: (newPerPage) => setRowsPerPage(newPerPage), progressPending: isLoading, progressComponent: _jsx(SkeletonLoader, {}), responsive: true, customStyles: customStyles, noDataComponent: _jsxs("div", { style: {
                            padding: "40px",
                            textAlign: "center",
                            color: "#6b7280"
                        }, children: [_jsx("span", { style: { fontSize: "48px", display: "block", marginBottom: "10px" }, children: "\uD83D\uDDBC\uFE0F" }), _jsx("p", { style: { fontSize: "16px", fontWeight: "500", marginBottom: "5px" }, children: "No banners found" }), _jsx("p", { style: { fontSize: "14px", color: "#9ca3af", marginBottom: "15px" }, children: filterText ? "Try adjusting your search" : "Get started by adding your first banner" }), !filterText && (_jsx("button", { onClick: () => setShowAddModal(true), style: {
                                    padding: "8px 16px",
                                    backgroundColor: "#22c55e",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "500"
                                }, children: "+ Add First Banner" }))] }) }) })] }));
}
