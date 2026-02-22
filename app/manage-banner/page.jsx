'use client';
import { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    useGetBannersQuery,
    useAddBannerMutation,
    useDeleteBannerMutation
} from "@/store/backendSlice/apiAPISlice";

const inferMimeTypeFromBase64 = (base64Value) => {
    if (base64Value.startsWith("/9j/")) return "image/jpeg";
    if (base64Value.startsWith("iVBORw0KGgo")) return "image/png";
    if (base64Value.startsWith("R0lGOD")) return "image/gif";
    if (base64Value.startsWith("Qk")) return "image/bmp";
    if (base64Value.startsWith("UklGR")) return "image/webp";
    if (base64Value.startsWith("PHN2Zy")) return "image/svg+xml";
    return "image/jpeg";
};

const isLikelyRawBase64Image = (value) => {
    if (!value || value.length < 80) return false;
    return /^[A-Za-z0-9+/=]+$/.test(value);
};

const normalizeBannerImageSrc = (imageValue) => {
    if (!imageValue || typeof imageValue !== "string") return "";

    const trimmedValue = imageValue.trim();
    if (!trimmedValue) return "";

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
const BannerSkeleton = () => (
    <div style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: "20px",
        borderBottom: "1px solid #f0f0f0"
    }}>
        <Skeleton width={40} height={20} />
        <Skeleton width={100} height={60} borderRadius={8} />
        <Skeleton width={150} height={16} />
        <Skeleton width={80} height={32} borderRadius={6} />
    </div>
);

export default function ManageBannersData() {
    const [filterText, setFilterText] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { data: bannerData, isLoading, isError, error, refetch } = useGetBannersQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    console.log(" the bannerData", bannerData)
    const [addBanner, { isLoading: isAdding }] = useAddBannerMutation();
    const [deleteBanner] = useDeleteBannerMutation();
    const banners = bannerData?.banners || [];
    const normalizedBanners = useMemo(
        () =>
            banners.map((banner) => ({
                ...banner,
                imageSrc: normalizeBannerImageSrc(banner.image || banner.image_url || banner.url || ""),
            })),
        [banners],
    );
    console.log("Extracted banners:", banners);

    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [deletingId, setDeletingId] = useState(null);

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
            alert(result?.message || "Banner added successfully!");
            refetch(); // Refresh the banner list
        } catch (err) {
            console.error("Add banner error:", err);
            alert(err?.data?.message || "Failed to add banner");
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) {
            return;
        }

        setDeletingId(id);
        try {
            const result = await deleteBanner(id).unwrap();
            console.log("Delete banner result:", result);
            alert(result?.message || "Banner deleted successfully!");
            refetch(); // Refresh the banner list
        } catch (err) {
            console.error("Delete banner error:", err);
            alert(err?.data?.message || "Failed to delete banner");
        } finally {
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
            cell: (row) => (
                <div style={{ padding: "8px 0" }}>
                    <img
                        src={row.imageSrc}
                        alt={`Banner ${row.id}`}
                        style={{
                            width: "120px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            cursor: row.imageSrc ? "pointer" : "default"
                        }}
                        onClick={() => {
                            if (row.imageSrc) {
                                window.open(row.imageSrc, "_blank");
                            }
                        }}
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/120x60?text=No+Image";
                        }}
                    />
                </div>
            ),
            width: "160px",
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
                        onClick={() => handleDeleteBanner(row.id)}
                        disabled={deletingId === row.id}
                        style={{
                            padding: "6px 12px",
                            backgroundColor: deletingId === row.id ? "#9ca3af" : "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: deletingId === row.id ? "not-allowed" : "pointer",
                            fontSize: "12px",
                            fontWeight: "500",
                            transition: "background-color 0.2s"
                        }}
                        onMouseOver={(e) => {
                            if (deletingId !== row.id) {
                                e.currentTarget.style.backgroundColor = "#dc2626";
                            }
                        }}
                        onMouseOut={(e) => {
                            if (deletingId !== row.id) {
                                e.currentTarget.style.backgroundColor = "#ef4444";
                            }
                        }}
                    >
                        {deletingId === row.id ? "Deleting..." : "Delete"}
                    </button>
                </div>
            ),
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
            {/* Left side - Add Button and Search */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                {/* Add Banner Button */}
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
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
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#16a34a"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#22c55e"}
                >
                    + Add Banner
                </button>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search by ID..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        minWidth: "200px",
                        fontSize: "14px",
                        outline: "none",
                    }}
                />

                {/* Clear Button */}
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
                        }}
                    >
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* Right side - Stats */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                fontSize: "14px",
                color: "#6b7280"
            }}>
                <span>
                    Total: <strong style={{ color: "#111827" }}>{normalizedBanners.length}</strong> banners
                </span>
                {filterText && (
                    <span>
                        Showing: <strong style={{ color: "#111827" }}>{filteredData.length}</strong>
                    </span>
                )}
            </div>
        </div>
    );

    const SkeletonLoader = () => (
        <div style={{ width: "100%" }}>
            {[...Array(5)].map((_, i) => (
                <BannerSkeleton key={i} />
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
    const AddBannerModal = () => (
        <div
            style={{
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
            }}
            onClick={() => {
                if (!isAdding) {
                    setShowAddModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                }
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    padding: "24px",
                    width: "90%",
                    maxWidth: "500px",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>
                        Add New Banner
                    </h2>
                    <button
                        onClick={() => {
                            if (!isAdding) {
                                setShowAddModal(false);
                                setSelectedImage(null);
                                setImagePreview(null);
                            }
                        }}
                        disabled={isAdding}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "24px",
                            cursor: isAdding ? "not-allowed" : "pointer",
                            color: "#6b7280",
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Image Upload Area */}
                <div style={{
                    border: "2px dashed #d1d5db",
                    borderRadius: "8px",
                    padding: "40px 20px",
                    textAlign: "center",
                    marginBottom: "20px",
                    backgroundColor: "#f9fafb",
                    position: "relative",
                }}>
                    {imagePreview ? (
                        <div>
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "200px",
                                    borderRadius: "8px",
                                    marginBottom: "10px",
                                }}
                            />
                            <p style={{ color: "#6b7280", fontSize: "14px", margin: "10px 0" }}>
                                {selectedImage?.name}
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview(null);
                                }}
                                disabled={isAdding}
                                style={{
                                    marginTop: "10px",
                                    padding: "6px 12px",
                                    backgroundColor: isAdding ? "#9ca3af" : "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: isAdding ? "not-allowed" : "pointer",
                                    fontSize: "12px",
                                }}
                            >
                                Remove Image
                            </button>
                        </div>
                    ) : (
                        <div>
                            <span style={{ fontSize: "48px" }}>🖼️</span>
                            <p style={{ color: "#6b7280", marginTop: "10px", marginBottom: "10px" }}>
                                Click to select an image
                            </p>
                            <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "10px" }}>
                                Supported: JPG, PNG, GIF (Max 5MB)
                            </p>
                            <label style={{
                                display: "inline-block",
                                marginTop: "10px",
                                padding: "8px 16px",
                                backgroundColor: "#4f46e5",
                                color: "#fff",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                            }}>
                                Select Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: "none" }}
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button
                        onClick={() => {
                            setShowAddModal(false);
                            setSelectedImage(null);
                            setImagePreview(null);
                        }}
                        disabled={isAdding}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#f3f4f6",
                            color: "#374151",
                            border: "none",
                            borderRadius: "8px",
                            cursor: isAdding ? "not-allowed" : "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddBanner}
                        disabled={!selectedImage || isAdding}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: !selectedImage || isAdding ? "#9ca3af" : "#22c55e",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: !selectedImage || isAdding ? "not-allowed" : "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                        }}
                    >
                        {isAdding ? "Uploading..." : "Add Banner"}
                    </button>
                </div>
            </div>
        </div>
    );

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
                    <h3 style={{ marginBottom: "10px" }}>Error loading banners</h3>
                    <p>{error?.data?.message || error?.message || "Something went wrong"}</p>
                    <button
                        onClick={() => refetch()}
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
        <main style={{ padding: "9px" }}>
            {showAddModal && <AddBannerModal />}

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
                            <span style={{ fontSize: "18px", fontWeight: "600" }}>Manage Banners</span>
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
                            <span style={{ fontSize: "48px", display: "block", marginBottom: "10px" }}>🖼️</span>
                            <p style={{ fontSize: "16px", fontWeight: "500", marginBottom: "5px" }}>No banners found</p>
                            <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "15px" }}>
                                {filterText ? "Try adjusting your search" : "Get started by adding your first banner"}
                            </p>
                            {!filterText && (
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "#22c55e",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: "500"
                                    }}
                                >
                                    + Add First Banner
                                </button>
                            )}
                        </div>
                    }
                />
            </div>
        </main>
    );
}
