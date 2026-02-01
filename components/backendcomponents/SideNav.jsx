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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={closeMobileMenu}
        ></div>
      )}

      <aside className={isMobileMenuOpen ? 'mobile-open' : ''}>
        {/* Close button for mobile */}
        <button
          className="mobile-close-btn"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        >
          ×
        </button>

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
                        className={`nav-item-wrap ${subItems.length ? "hasDropdown" : ""}`}
                        onClick={() =>
                          setOpenIndex(openIndex === index ? null : index)
                        }
                      >
                        <Link
                          href={item.url || "#"}
                          className={isActive ? "active" : ""}
                          onClick={closeMobileMenu}
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
                                className={pathname === sub.url ? "active" : ""}
                                onClick={closeMobileMenu}
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

      <style jsx>{`
        /* Mobile Menu Toggle Button */
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 11%;
    left: -16px;
          transform: translateY(-50%);
          z-index: 10;
          background: var(--primary-a);
          border: none;
          width: 35px;
          height: 35px;
          border-radius: 5px;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          padding: 6px;
        }

        .mobile-menu-toggle span {
          display: block;
          width: 20px;
          height: 2.5px;
          background: white;
          border-radius: 2px;
          transition: 0.3s;
        }

        /* Mobile Close Button */
        .mobile-close-btn {
          display: none;
          position: absolute;
          top: 15px;
          right: 15px;
          background: transparent;
          border: none;
          font-size: 32px;
          color: var(--general-c);
          cursor: pointer;
          z-index: 1001;
          width: 40px;
          height: 40px;
          line-height: 1;
        }

        /* Mobile Overlay */
        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }

        @media (max-width: 767px) {
          .mobile-menu-toggle {
            display: flex;
          }

          .mobile-close-btn {
            display: block;
          }

          .mobile-overlay {
            display: block;
          }

          aside {
            position: fixed;
            left: -100%;
            top: 0;
            bottom: 0;
            width: 280px;
            height: 100vh;
            z-index: 999;
            transition: left 0.3s ease-in-out;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
            overflow-y: auto;
          }

          aside.mobile-open {
            left: 0;
          }

          aside .aside-wrap {
            padding: 60px 0 20px;
          }

          aside .aside-col > ul > li {
            display: block;
            padding: 0 12px;
          }

          aside .aside-col > ul > li > a,
          aside .aside-col > ul > li > .nav-item-wrap > a {
            height: 44px;
            line-height: 44px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0 8px;
            text-align: left;
          }

          aside .aside-col > ul > li > a [data-icon],
          aside .aside-col > ul > li > .nav-item-wrap > a [data-icon] {
            font-size: 18px;
            display: inline-block;
            margin: 0;
          }

          aside .aside-col > ul > li > a span,
          aside .aside-col > ul > li > .nav-item-wrap > a span {
            display: inline-block;
          }

          /* Adjust header padding for hamburger menu */
          header .header-wrapper .colA {
            padding-left: 55px;
          }
        }
      `}</style>
    </>
  );
}