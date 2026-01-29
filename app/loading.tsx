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
    }, 2000); // loader for 1 sec

    return () => clearTimeout(timer);
  }, [pathname]); // runs when route changes

  if (!loading) return null;

  return (
    <p>loainf</p>
  );
}