import { useEffect, useState } from "react";
import AdminStaticData from "./AdminStaticData.json";
import parse from "html-react-parser";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { apiAPISlice, useBackendLogoutMutation } from "@/store/backendSlice/apiAPISlice";
import { logout } from "@/store/backendSlice/authReducer";
import "./SideNav.css";

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const dispatch = useDispatch();
  const [openIndex, setOpenIndex] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const Menu = AdminStaticData?.Menu?.items || [];
  const [backendLogout] = useBackendLogoutMutation();

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
      if (isSubActive) setOpenIndex(index);
    });
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await backendLogout().unwrap();
    } catch (err) {
      console.error("Backend logout failed:", err);
    }
    dispatch(logout());
    dispatch(apiAPISlice.util.resetApiState());
    navigate("/login");
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
    </>
  );
}
