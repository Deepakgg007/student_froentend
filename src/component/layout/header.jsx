import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { MdPages } from "react-icons/md";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useHeaderVisibility } from "../../context/HeaderVisibilityContext";

/**
 * Unified Header Component
 *
 * Displays different content based on authentication state:
 * - NOT LOGGED IN: Z1 logo + Login button + public menu
 * - LOGGED IN: College logo + Logout button + authenticated menu
 */
const UnifiedHeader = () => {
    const { isAuthenticated, setAuth } = useAuth();
    const { shouldHideHeader } = useHeaderVisibility();
    const [menuToggle, setMenuToggle] = useState(false);
    const [headerFixed, setHeaderFixed] = useState(false);
    const [user, setUser] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const navigate = useNavigate();
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
        closeMenu();
    }, [location.pathname]);

    // Load user data when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const cachedUser = localStorage.getItem("student_user");
            if (cachedUser) {
                try {
                    const userData = JSON.parse(cachedUser);
                    setUser(userData);
                } catch (error) {
                    console.error("Error parsing cached user:", error);
                }
            }
            checkAuthStatus();
        } else {
            setUser(null);
        }
    }, [isAuthenticated]);

    // Update page title with college name (when authenticated)
    useEffect(() => {
        if (isAuthenticated && user) {
            const pageName = getPageName(currentPath);
            const collegeName = user.college_details?.name || user.college_name || "Z1";
            document.title = `${collegeName} - ${pageName}`;
        } else {
            const pageName = getPageName(currentPath);
            document.title = `Z1 - ${pageName}`;
        }
    }, [user, currentPath, isAuthenticated]);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem("student_access_token") || localStorage.getItem("token");
        if (!token) {
            setUser(null);
            return;
        }

        try {
            const response = await api.get("/auth/me");
            if (response.data) {
                const userData = response.data.data || response.data.user || response.data;
                setUser(userData);
                localStorage.setItem("student_user", JSON.stringify(userData));
            }
        } catch (error) {
            setUser(null);
            localStorage.removeItem("student_access_token");
            localStorage.removeItem("token");
            localStorage.removeItem("student_user");
        }
    };

    const getPageName = (path) => {
        const pathWithoutSlug = path.replace(/^\/[^\/]+/, '');

        if (path === '/') return 'Home';
        if (pathWithoutSlug === '/course' || path === '/course') return 'Courses';
        if (pathWithoutSlug.startsWith('/course-view/') || path.startsWith('/course-view/')) return 'Course Details';
        if (pathWithoutSlug === '/challenges' || path === '/challenges') return 'Coding Challenges';
        if (pathWithoutSlug === '/companies' || path === '/companies') return 'Company Challenges';
        if (pathWithoutSlug === '/jobs' || path === '/jobs') return 'Job Listings';
        if (pathWithoutSlug === '/leaderboard' || path === '/leaderboard') return 'Leaderboard';
        if (pathWithoutSlug === '/profile' || path === '/profile') return 'My Profile';
        if (pathWithoutSlug.startsWith('/profile/') || path.startsWith('/profile/')) return 'User Profile';
        if (path === '/login') return 'Login';
        if (path === '/signup') return 'Sign Up';

        return path.substring(1).charAt(0).toUpperCase() + path.substring(2).replace(/-/g, ' ');
    };

    const createCollegeSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const getCollegePath = (path) => {
        if (!user || !user.college_details || !user.college_details.name) {
            return path;
        }
        const slug = createCollegeSlug(user.college_details.name);
        return `/${slug}${path}`;
    };

    const handleLogout = () => {
        try {
            // Save remembered credentials before clearing localStorage
            const rememberedEmail = localStorage.getItem('student_remembered_email');
            const rememberedPassword = localStorage.getItem('student_remembered_password');

            setUser(null);
            localStorage.clear();

            // Restore remembered credentials after clearing
            if (rememberedEmail) {
                localStorage.setItem('student_remembered_email', rememberedEmail);
            }
            if (rememberedPassword) {
                localStorage.setItem('student_remembered_password', rememberedPassword);
            }

            setAuth(false);
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 100);
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/login";
        }
    };

    const handleDropdownToggle = (dropdownName, e) => {
        e.preventDefault();
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    };

    const closeMenu = () => {
        setMenuToggle(false);
        setOpenDropdown(null);
    };

    // Get college logo URL
    const getLogoUrl = () => {
        if (!isAuthenticated || !user) {
            return "/assets/images/logo/z1logo.png"; // Public header logo
        }

        // Authenticated user - show college logo
        const logoUrl = user.college_details?.logo || user.college_logo;
        if (!logoUrl) return "/assets/images/logo/z1logo.png";

        if (logoUrl.startsWith('http')) {
            return logoUrl;
        }
        return `http://16.16.76.74:8000${logoUrl}`;
    };

    const getLogoAlt = () => {
        if (isAuthenticated && user) {
            return user.college_details?.name || user.college_name || "College Logo";
        }
        return "Z1 Logo";
    };

    // Don't render header on specific pages
    if (shouldHideHeader) {
        return null;
    }

    return (
        <>
            <style>{`
                .active-link {
                    color: #1D61BF !important;
                    font-weight: 400;
                    transition: all 0.3s ease;
                }
                .menu a {
                    text-decoration: none;
                    color: #333;
                    transition: color 0.3s ease;
                }
                .menu a:hover {
                    color: #1D61BF;
                }
                .menu-item-has-children.active-parent > a {
                    color: #1D61BF !important;
                    font-weight: 600;
                }

                /* Logo Styling */
                .logo img {
                    height: 50px;
                    width: auto;
                    max-width: 100px;
                }

                /* Login/Logout Button Styling */
                .login-btn, .logout-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    border: 2px solid #1D61BF;
                    border-radius: 8px;
                    background: transparent;
                    color: #1D61BF;
                    cursor: pointer;
                    white-space: nowrap;
                    font-size: 14px;
                }

                .login-btn:hover, .logout-btn:hover {
                    background: #1D61BF;
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
                        color: #1D61BF;
                    }

                    .mobile-auth-btn {
                        margin-top: 15px;
                        padding-left: 20px;
                        border-top: 1px solid #f0f0f0;
                        padding-top: 15px;
                    }

                    .mobile-auth-btn .logout-btn,
                    .mobile-auth-btn .login-btn {
                        width: 100%;
                        justify-content: center;
                        padding: 12px 16px;
                        font-size: 16px;
                    }
                }
            `}</style>

            <header className={`header-section style-4 ${headerFixed ? "header-fixed fadeInUp" : ""}`}>
                <div className="header-bottom">
                    <div className="container">
                        <div className="header-wrapper">

                            {/* Logo - Changes based on auth state */}
                            <div className="logo">
                                <Link to={isAuthenticated ? getCollegePath("/") : "/"}>
                                    <img src={getLogoUrl()} alt={getLogoAlt()} />
                                </Link>
                            </div>

                            {/* Menu */}
                            <div className="menu-area">
                                <div className="menu">
                                    <ul className={`lab-ul ${menuToggle ? "active" : ""}`}>

                                        {/* Home */}
                                        <li>
                                            <NavLink
                                                to={isAuthenticated ? getCollegePath("/") : "/"}end
                                                onClick={closeMenu}
                                                className={({ isActive }) =>
                                                    isActive ? "active-link" : ""
                                                }
                                            >
                                                <i className="icofont-home"></i> Home
                                            </NavLink>
                                        </li>

                                        {/* Learn - Always visible */}
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
                                                        to={isAuthenticated ? getCollegePath("/course") : "/course"}
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

                                        {/* Authenticated Only Menu Items */}
                                        {isAuthenticated && (
                                            <>
                                                {/* Challenges */}
                                                <li
                                                    className={`menu-item-has-children ${
                                                        ["/challenges", "/challenge","/companies"].some(path => currentPath.includes(path))
                                                            ? "active-parent"
                                                            : ""
                                                    } ${openDropdown === "challenges" ? "open" : ""}`}
                                                >
                                                    <a
                                                        href="#"
                                                        onClick={(e) => handleDropdownToggle("challenges", e)}
                                                    >
                                                        <i className="icofont-code"></i> Challenges
                                                    </a>
                                                    <ul className={`lab-ul dropdown-menu ${openDropdown === "challenges" ? "open" : ""}`}>
                                                        <li>
                                                            <NavLink
                                                                to={getCollegePath("/challenges")}
                                                                onClick={closeMenu}
                                                                className={({ isActive }) =>
                                                                    isActive ? "active-link" : ""
                                                                }
                                                            >
                                                                <i className="icofont-code-alt"></i> Coding Challenges
                                                            </NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink
                                                                to={getCollegePath("/companies")}
                                                                onClick={closeMenu}
                                                                className={({ isActive }) =>
                                                                    isActive ? "active-link" : ""
                                                                }
                                                            >
                                                                <i className="icofont-briefcase"></i> Company Challenges
                                                            </NavLink>
                                                        </li>
                                                    </ul>
                                                </li>

                                                {/* More - Contains Leaderboard & Profile */}
                                                <li
                                                    className={`menu-item-has-children ${
                                                        ["/leaderboard", "/profile"].some(path => currentPath.includes(path))
                                                            ? "active-parent"
                                                            : ""
                                                    } ${openDropdown === "more" ? "open" : ""}`}
                                                >
                                                    <a
                                                        href="#"
                                                        onClick={(e) => handleDropdownToggle("more", e)}
                                                    >
                                                        <i className="icofont-ellipsis-vertical"></i> More
                                                    </a>
                                                    <ul className={`lab-ul dropdown-menu ${openDropdown === "more" ? "open" : ""}`}>
                                                        <li>
                                                            <NavLink
                                                                to={getCollegePath("/leaderboard")}
                                                                onClick={closeMenu}
                                                                className={({ isActive }) =>
                                                                    isActive ? "active-link" : ""
                                                                }
                                                            >
                                                                <i className="icofont-crown"></i> Leaderboard
                                                            </NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink
                                                                to={getCollegePath("/profile")}
                                                                onClick={closeMenu}
                                                                className={({ isActive }) =>
                                                                    isActive ? "active-link" : ""
                                                                }
                                                            >
                                                                <i className="icofont-user-alt-5"></i> Profile
                                                            </NavLink>
                                                        </li>
                                                        <li>
                                                            <a
                                                                href="https://z1-complier.haegl.in/"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={closeMenu}
                                                            >
                                                                <i className="icofont-settings"></i> Online Compiler
                                                            </a>



                                                        </li>
                                                    </ul>
                                                </li>

                                                {/* Jobs */}
                                                <li
                                                    className={
                                                        currentPath.includes("/jobs") ? "active-parent" : ""
                                                    }
                                                >
                                                    <NavLink
                                                        to={getCollegePath("/jobs")}
                                                        onClick={closeMenu}
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-briefcase"></i> Jobs
                                                    </NavLink>
                                                </li>
                                            </>
                                        )}

                                        {/* Pages - Only for public users */}
                                        {!isAuthenticated && (
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
                                        )}

                                        {/* Mobile Auth Button */}
                                        <li className="mobile-auth-btn d-lg-none">
                                            {isAuthenticated ? (
                                                <button
                                                    onClick={() => {
                                                        closeMenu();
                                                        handleLogout();
                                                    }}
                                                    className="logout-btn"
                                                >
                                                    <i className="icofont-logout"></i> Logout
                                                </button>
                                            ) : (
                                                <NavLink
                                                    to="/login"
                                                    onClick={closeMenu}
                                                    className="login-btn"
                                                >
                                                    <i className="icofont-arrow-right" style={{ color: "#007bff" }}></i> Login
                                                </NavLink>
                                            )}
                                        </li>

                                    </ul>
                                </div>

                                {/* Desktop Auth Section (Right Side) - Only Login/Logout */}
                                <div className="d-none d-lg-flex align-items-center ms-3">
                                    {isAuthenticated ? (
                                        <button
                                            onClick={handleLogout}
                                            className="logout-btn"
                                        >
                                            <i className="icofont-logout" style={{ color: "#007bff" }}></i> Logout
                                        </button>
                                    ) : (
                                        <Link to="/login" className="login-btn">
                                            <i className="icofont-arrow-right" style={{ color: "#007bff" }}></i> Login
                                        </Link>
                                    )}
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

export default UnifiedHeader;
