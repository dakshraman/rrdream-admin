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

  // Auto-open dropdown if current path matches a sub-item
  useEffect(() => {
    Menu.filter(item => item.Show === "1").forEach((item, index) => {
      const subItems = item.MoreItem || [];
      const isSubActive = subItems.some(sub => pathname === sub.url);
      if(isSubActive) setOpenIndex(index);
    });
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Hamburger Button - mobile only */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Dark overlay behind menu on mobile */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu} />
      )}

      <aside className={isMobileMenuOpen ? "mobile-open" : ""}>
        {/* Close × button inside sidebar on mobile */}
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
              {Menu.filter(item => item.Show === "1").map((item, index) => {
                // FIX 1: MoreItem entries don't always have Show field — treat missing Show as visible
                const subItems = (item.MoreItem || []).filter(
                  sub => !sub.Show || sub.Show === "1"
                );

                const isActive =
                  pathname === item.url ||
                  pathname === item.addurl ||
                  subItems.some(sub => pathname === sub.url);

                const isOpen = openIndex === index;

                return (
                  <li key={index} className={isActive ? "li-active" : ""}>
                    <div
                      className={`nav-item-wrap ${subItems.length ? "hasDropdown" : ""}`}
                    >
                      {/* FIX 2: If has sub-items, make the whole row a toggle — not a navigation link */}
                      {subItems.length > 0 ? (
                        <button
                          className={`nav-link-btn ${isActive ? "active" : ""}`}
                          onClick={() => setOpenIndex(isOpen ? null : index)}
                          type="button"
                        >
                          {item.icon && parse(item.icon)}
                          <span>{item.title}</span>
                          {/* FIX 3: Visible dropdown arrow */}
                          <svg
                            className={`dropdown-arrow ${isOpen ? "open" : ""}`}
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      ) : (
                        <Link
                          href={item.url || "#"}
                          className={isActive ? "active" : ""}
                          onClick={closeMobileMenu}
                        >
                          {item.icon && parse(item.icon)}
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </div>

                    {/* Dropdown sub-menu */}
                    {subItems.length > 0 && (
                      <ul className={`aside-dropdown ${isOpen ? "open" : ""}`} style={{ padding: "1px 0 10px 42px" }}>
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

              {/* Logout */}
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
        /* ── Dropdown Arrow ── */
        .dropdown-arrow {
          margin-left: auto;
          transition: transform 0.25s ease;
          flex-shrink: 0;
        }
        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        /* ── nav-link-btn resets so it looks identical to <a> ── */
        .nav-link-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0 8px;
          text-align: left;
          color: inherit;
          font: inherit;
          height: 44px;
        }
        .nav-link-btn.active {
          /* match your existing .active styles */
          color: var(--primary-a, #4f46e5);
          font-weight: 600;
        }

        /* ── Dropdown animation ── */
        .aside-dropdown {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .aside-dropdown.open {
          max-height: 600px; /* large enough for all items */
        }

        /* ── Hamburger Button - mobile only ── */
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 4%;
          left: 10px;
          transform: translateY(-50%);
          z-index: 1000;
          background: transparent;
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
          background: black;
          border-radius: 2px;
          transition: 0.3s;
        }

        /* ── Mobile Close Button ── */
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

        /* ── Mobile Overlay ── */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }

        /* ── Mobile breakpoint ── */
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
            box-shadow: 2px 0 15px rgba(0, 0, 0, 0.15);
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
          aside .aside-col > ul > li > .nav-item-wrap > a,
          aside .aside-col > ul > li > .nav-item-wrap > .nav-link-btn {
            height: 44px;
            line-height: 44px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0 8px;
            text-align: left;
          }
          aside .aside-col > ul > li > a span,
          aside .aside-col > ul > li > .nav-item-wrap > a span,
          aside .aside-col > ul > li > .nav-item-wrap > .nav-link-btn span {
            display: inline-block;
          }
          /* Give sub-items a slight indent on mobile */
          .aside-dropdown.open li a {
            padding-left: 24px;
          }
          /* Header padding so content isn't behind hamburger */
          header .header-wrapper .colA {
            padding-left: 55px;
          }
        }
      `}</style>
    </>
  );
}