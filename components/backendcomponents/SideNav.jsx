'use client';

import { useEffect, useState } from "react";
import AdminStaticData from "./AdminStaticData.json";
import parse from "html-react-parser";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState(null);

  const Menu = AdminStaticData?.Menu?.items || [];

  useEffect(() => {
    const hideBtn = document.querySelector(".hide_menu");
    const sideMenu = document.getElementsByTagName("aside");
    const menuToggle = () => {
      hideBtn?.classList.toggle("collapse");
      Array.from(sideMenu).forEach((item) =>
        item.classList.toggle("collapse")
      );
    };
    hideBtn?.addEventListener("click", menuToggle);
    return () => hideBtn?.removeEventListener("click", menuToggle);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <aside>
      <div className="aside-wrap">
        <div className="aside-col">
          <ul className="Header_nav_Active">
            {Menu
              .filter(item => item.Show === "1")
              .map((item, index) => {
                const subItems =
                  item.MoreItem?.filter(sub => sub.Show === "1") || [];
                const isActive =
                  pathname === item.url ||
                  pathname === item.addurl ||
                  subItems.some(sub => pathname === sub.url);
                return (
                  <li key={index}>
                    <div
                      className={`nav-item-wrap ${subItems.length ? "hasDropdown" : ""
                        }`}
                      onClick={() =>
                        setOpenIndex(openIndex === index ? null : index)
                      }
                    >
                      <Link
                        href={item.url || "#"}
                        className={isActive ? "active" : ""}
                      >
                        {item.icon && parse(item.icon)}
                        <span>{item.title}</span>
                      </Link>
                    </div>
                    {subItems.length > 0 && openIndex === index && (
                      <ul className="aside-dropdown open">
                        {subItems.map((sub, i) => (
                          <li key={i}>
                            <Link
                              href={sub.url}
                              className={
                                pathname === sub.url ? "active" : ""
                              }
                            >
                              {sub.icon && parse(sub.icon)}
                              <span>{sub.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            <li>
              <a onClick={handleLogout} style={{ cursor: "pointer" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    d="M7.023 5.5a9 9 0 1 0 9.953 0M12 2v8"
                  />
                </svg>
                <span>Log Out</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
