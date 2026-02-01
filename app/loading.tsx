"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Loader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // smooth & fast

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>Loading Dashboard...</p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(255, 245, 245, 0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  card: {
    background: "#fff",
    padding: "32px 48px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(220, 38, 38, 0.15)",
    textAlign: "center",
  },

  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #fde2e2",
    borderTop: "4px solid #dc2626",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },

  text: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#991b1b",
    letterSpacing: "0.3px",
  },
};
