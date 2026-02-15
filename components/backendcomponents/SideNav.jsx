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
          top: 15px;
          left: 15px;
          z-index: 1002;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          width: 40px;
          height: 40px;
          border-radius: 8px;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          padding: 0;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .mobile-menu-toggle span {
          display: block;
          width: 22px;
          height: 2px;
          background: #333;
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
          font-size: 28px;
          color: #333;
          cursor: pointer;
          z-index: 1001;
          width: 40px;
          height: 40px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.8);
          border-radius: 50%;
        }

        /* Mobile Overlay */
        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 998;
          opacity: 0;
          animation: fadeIn 0.3s forwards;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        @media (max-width: 991px) {
          .mobile-menu-toggle {
            display: flex;
          }

          .mobile-close-btn {
            display: flex;
          }

          .mobile-overlay {
            display: block;
          }

          aside {
            position: fixed;
            left: -300px; /* Hide completely */
            top: 0;
            bottom: 0;
            width: 280px;
            height: 100vh;
            z-index: 999;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
            background: #fff; /* Ensure background is solid */
            overflow-y: auto;
            transform: translateX(0);
          }

          aside.mobile-open {
            transform: translateX(300px); /* Slide in */
          }
          
          /* When open, ensure it stays at left 0 relative to viewport if we used left:0 instead of transform. 
             But transform is better for performance. Let's adjust.
          */
          aside {
             left: -280px;
             transform: none;
             transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
           aside.mobile-open {
             left: 0;
             transform: none;
           }

          aside .aside-wrap {
            padding: 20px 0;
            margin-top: 50px; /* Space for close button */
          }

          aside .aside-col > ul > li {
            display: block;
            padding: 0 16px;
            margin-bottom: 4px;
          }

          aside .aside-col > ul > li > a,
          aside .aside-col > ul > li > .nav-item-wrap > a {
            height: 48px; /* Larger touch target */
            line-height: 48px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 16px;
            text-align: left;
            border-radius: 8px;
            color: #4b5563;
            font-weight: 500;
            transition: all 0.2s;
          }
          
          aside .aside-col > ul > li > a.active,
          aside .aside-col > ul > li > .nav-item-wrap > a.active {
            background-color: #f3f4f6;
            color: #111827;
            font-weight: 600;
          }

          aside .aside-col > ul > li > a [data-icon],
          aside .aside-col > ul > li > .nav-item-wrap > a [data-icon] {
            font-size: 20px;
            min-width: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          aside .aside-col > ul > li > a span,
          aside .aside-col > ul > li > .nav-item-wrap > a span {
            display: inline-block;
            font-size: 15px;
          }

          /* Adjust header padding for hamburger menu */
          /* We'll handle header padding in global css or Header component if needed */
        }
      `}</style>
    </>
  );
}