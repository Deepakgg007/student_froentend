import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MdPages } from "react-icons/md";
const PublicHeader = () => {
    const [menuToggle, setMenuToggle] = useState(false);
    const [headerFixed, setHeaderFixed] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const location = useLocation();
    const currentPath = location.pathname;

    // Fixed header on scroll
    useEffect(() => {
        const handleScroll = () => {
            setHeaderFixed(window.scrollY > 200);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu when location changes
    useEffect(() => {
        setMenuToggle(false);
        setOpenDropdown(null);
    }, [location.pathname]);

    const handleDropdownToggle = (dropdownName, e) => {
        e.preventDefault();
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    };

    const closeMenu = () => {
        setMenuToggle(false);
        setOpenDropdown(null);
    };

    return (
        <>
            {/* 🔸 Inline CSS for active menu styling */}
            <style>{`
                .active-link {
                    color: #ff6600 !important;
                    font-weight: 600;
                    border-bottom: 2px solid #ff6600;
                    transition: all 0.3s ease;
                }
                .menu a {
                    text-decoration: none;
                    color: #333;
                    transition: color 0.3s ease;
                }
                .menu a:hover {
                    color: #ff6600;
                }
                .menu-item-has-children.active-parent > a {
                    color: #ff6600 !important;
                    font-weight: 600;
                    border-bottom: 2px solid #ff6600;
                }

                /* Login Button Styling */
                .login-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 18px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    border: 2px solid #ff6600;
                    border-radius: 10px;
                    background: transparent;
                    color: #ff6600;
                }

                .login-btn:hover {
                    background: #ff6600;
                    color: white;
                    transform: translateX(5px);
                }

                /* Mobile Menu Styles */
                @media (max-width: 991px) {
                    .dropdown-menu {
                        display: none !important;
                        max-height: 0;
                        overflow: hidden;
                        opacity: 0;
                        transition: all 0.3s ease;
                    }
                    .dropdown-menu.open {
                        display: block !important;
                        max-height: 500px;
                        opacity: 1;
                    }
                    .menu-item-has-children > a::after {
                        margin-left: 8px;
                        font-size: 18px;
                        font-weight: bold;
                        transition: transform 0.3s ease;
                    }
                    .menu-item-has-children.open > a::after {
                        color: #ff6600;
                    }

                    /* Show Login button inside mobile menu too */
                    .mobile-auth-btn {
                        margin-top: 10px;
                        padding-left: 20px;
                    }
                }
            `}</style>

            <header className={`header-section style-4 ${headerFixed ? "header-fixed fadeInUp" : ""}`}>
                <div className="header-bottom">
                    <div className="container">
                        <div className="header-wrapper">
                            
                            {/* Logo */}
                            <div className="logo">
                                <Link to="/">
                                    <img src="assets/images/logo/01.png" alt="logo" />
                                </Link>
                            </div>

                            {/* Menu */}
                            <div className="menu-area">
                                <div className="menu">
                                    <ul className={`lab-ul ${menuToggle ? "active" : ""}`}>
                                        
                                        {/* Home */}
                                        <li>
                                            <NavLink
                                                to="/"
                                                onClick={closeMenu}
                                                className={({ isActive }) =>
                                                    isActive ? "active-link" : ""
                                                }
                                            >
                                                <i className="icofont-home"></i> Home
                                            </NavLink>
                                        </li>

                                        {/* Learn */}
                                        <li
                                            className={`menu-item-has-children ${
                                                ["/course", "/course-single", "/course-view"].some(path => currentPath.includes(path))
                                                    ? "active-parent"
                                                    : ""
                                            } ${openDropdown === "learn" ? "open" : ""}`}
                                        >
                                            <a
                                                href="#"
                                                onClick={(e) => handleDropdownToggle("learn", e)}
                                            >
                                                <i className="icofont-book-alt"></i> Learn
                                            </a>
                                            <ul className={`lab-ul dropdown-menu ${openDropdown === "learn" ? "open" : ""}`}>
                                                <li>
                                                    <NavLink
                                                        to="/course"
                                                        onClick={closeMenu}
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-read-book"></i> All Courses
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </li>

                                        {/* Pages */}
                                        <li
                                            className={`menu-item-has-children ${
                                                ["/about", "/instructor", "/contact"].includes(currentPath)
                                                    ? "active-parent"
                                                    : ""
                                            } ${openDropdown === "pages" ? "open" : ""}`}
                                        >
                                            <a
                                                href="#"
                                                onClick={(e) => handleDropdownToggle("pages", e)}
                                            >
                                            <MdPages size={24} /> Pages
                                            </a>
                                            <ul className={`lab-ul dropdown-menu ${openDropdown === "pages" ? "open" : ""}`}>
                                                <li>
                                                    <NavLink to="/about" onClick={closeMenu}>
                                                        <i className="icofont-info-circle"></i> About
                                                    </NavLink>
                                                </li>
                                                
                                                <li>
                                                    <NavLink to="/instructor" onClick={closeMenu}>
                                                        <i className="icofont-teacher"></i> Instructor
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink to="/contact" onClick={closeMenu}>
                                                        <i className="icofont-ui-contact-list"></i> Contact
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </li>

                                        {/* Mobile Login Button */}
                                        <li className="mobile-auth-btn d-lg-none">
                                            <NavLink
                                                to="/login"
                                                onClick={closeMenu}
                                                className="login-btn"
                                            >
                                                Login <i className="icofont-arrow-right"></i>
                                            </NavLink>
                                        </li>

                                    </ul>
                                </div>

                                {/* Desktop Login Button (Right Side) */}
                                <div className="auth-section d-none d-lg-flex align-items-center ms-3">
                                    <Link to="/login" className="login-btn">
                                        Login <i className="icofont-arrow-right"></i>
                                    </Link>
                                </div>

                                {/* Mobile Menu Toggle */}
                                <div
                                    className={`header-bar d-lg-none ${menuToggle ? "active" : ""}`}
                                    onClick={() => setMenuToggle(!menuToggle)}
                                >
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default PublicHeader;
