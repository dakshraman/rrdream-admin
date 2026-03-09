
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

const BROADCAST_TOPIC = "all-users";

const pageStyle = {
  minHeight: "100%",
  padding: "16px",
  background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
};

const cardStyle = {
  maxWidth: "920px",
  margin: "0 auto",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
  padding: "20px",
};

const fieldLabelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: "700",
  color: "#1f2937",
};

const inputStyle = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "11px 12px",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "90px",
  resize: "vertical",
  lineHeight: 1.4,
};

const helperStyle = {
  marginTop: "6px",
  fontSize: "12px",
  color: "#6b7280",
};

export default function NotificationsPage() {
  const [form, setForm] = useState({
    title: "",
    body: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [response, setResponse] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setForm({
      title: "",
      body: "",
    });
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setResponse(null);
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setImageFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required.");
      return;
    }

    setIsSending(true);
    setResponse(null);

    try {
      const formDataPayload = new FormData();
      formDataPayload.append("title", form.title);
      formDataPayload.append("body", form.body);
      if (imageFile) {
        formDataPayload.append("imageFile", imageFile);
      }

      const res = await fetch("/api/notifications/send", {
        method: "POST",
        body: formDataPayload,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.message || "Unable to send notification.");
      }

      setResponse(result);
      toast.success("Notification sent to all devices.");
    } catch (error) {
      toast.error(error?.message || "Unable to send notification.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={{ marginBottom: "18px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "22px",
              color: "#111827",
              fontWeight: "800",
            }}
          >
            Send FCM Notification
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: "13px" }}>
            Uses your Firebase service account on the server to send FCM push
            notifications.
          </p>
          <p style={{ margin: "8px 0 0", color: "#1f2937", fontSize: "13px" }}>
            Broadcast target: <strong>{BROADCAST_TOPIC}</strong> (all devices)
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gap: "14px",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            <div>
              <label htmlFor="title" style={fieldLabelStyle}>
                Notification Title
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: Wallet Updated"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="imageFile" style={fieldLabelStyle}>
                Notification Image (Optional)
              </label>
              <input
                ref={fileInputRef}
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                style={inputStyle}
              />
              <p style={helperStyle}>
                Upload from this device. Supported: PNG, JPG, WEBP, GIF (max 1MB).
              </p>
              {imageFile && (
                <p style={{ ...helperStyle, color: "#111827" }}>
                  Selected: {imageFile.name}
                </p>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="body" style={fieldLabelStyle}>
                Notification Body
              </label>
              <textarea
                id="body"
                name="body"
                value={form.body}
                onChange={handleChange}
                rows={4}
                placeholder="Write the message body"
                style={textareaStyle}
              />
            </div>

          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              disabled={isSending}
              style={{
                border: "none",
                borderRadius: "10px",
                background: isSending ? "#9ca3af" : "#2563eb",
                color: "#fff",
                padding: "11px 16px",
                fontWeight: "700",
                cursor: isSending ? "not-allowed" : "pointer",
              }}
            >
              {isSending ? "Sending..." : "Send Notification"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isSending}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                background: "#fff",
                color: "#374151",
                padding: "11px 16px",
                fontWeight: "700",
                cursor: isSending ? "not-allowed" : "pointer",
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {response && (
          <div
            style={{
              marginTop: "18px",
              border: "1px solid #d1fae5",
              borderRadius: "10px",
              background: "#ecfdf5",
              padding: "14px",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "14px",
                fontWeight: "800",
                color: "#065f46",
              }}
            >
              Send Result
            </h2>
            <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#064e3b" }}>
              Topic: {response.topic || BROADCAST_TOPIC}
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#064e3b" }}>
              Message ID: {response.messageId || "N/A"}
            </p>
            {response.imageUrl && (
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#064e3b" }}>
                Image: {response.imageUrl}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
