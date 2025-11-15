import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api"; // Adjust path if needed

const Header = () => {
    const [menuToggle, setMenuToggle] = useState(false);
    const [socialToggle, setSocialToggle] = useState(false);
    const [headerFiexd, setHeaderFiexd] = useState(false);
    const [user, setUser] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Detect active route - remove college slug for comparison
    const currentPath = location.pathname;

    // Helper to normalize path by removing college slug
    const getNormalizedPath = (path) => {
        // Remove college slug from beginning if present (e.g., "/delhi-college/course" -> "/course")
        const pathParts = path.split('/').filter(p => p);
        if (pathParts.length > 0 && user && user.college_details) {
            const collegeSlug = user.college_details.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            // If first part matches college slug, remove it
            if (pathParts[0] === collegeSlug) {
                return '/' + pathParts.slice(1).join('/');
            }
        }
        return path;
    };

    const normalizedPath = getNormalizedPath(currentPath);

    // Fixed header on scroll
    useEffect(() => {
        const handleScroll = () => {
            setHeaderFiexd(window.scrollY > 200);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Check authentication - only on component mount
    useEffect(() => {
        // First, try to load cached user data from localStorage to avoid flash
        const cachedUser = localStorage.getItem("student_user");
        if (cachedUser) {
            try {
                const userData = JSON.parse(cachedUser);
                setUser(userData);
            } catch (error) {
                console.error("Error parsing cached user:", error);
            }
        }

        // Then fetch fresh auth data
        const checkOnMount = async () => {
            await checkAuthStatus();
        };
        checkOnMount();
    }, []);

    // Close menu when location changes
    useEffect(() => {
        closeMenu();
    }, [location.pathname]);

    // Update page title with college name
    useEffect(() => {
        const pageName = getPageName(currentPath);

        if (user && user.college_details && user.college_details.name) {
            const collegeName = user.college_details.name;
            const newTitle = `${collegeName} - ${pageName}`;
            document.title = newTitle;
        } else if (user && user.college_name) {
            const collegeName = user.college_name;
            const newTitle = `${collegeName} - ${pageName}`;
            document.title = newTitle;
        } else {
            const newTitle = `Edukon - ${pageName}`;
            document.title = newTitle;
        }
    }, [user, currentPath]);

    const getPageName = (path) => {
        // Remove college slug from path if present
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

        // Default: capitalize first letter of path
        return path.substring(1).charAt(0).toUpperCase() + path.substring(2).replace(/-/g, ' ');
    };

    // Helper function to create college slug
    const createCollegeSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Helper function to get college-specific path
    const getCollegePath = (path) => {
        if (!user || !user.college_details || !user.college_details.name) {
            return path;
        }
        const slug = createCollegeSlug(user.college_details.name);
        return `/${slug}${path}`;
    };

    const checkAuthStatus = async () => {
        const token = localStorage.getItem("student_access_token") || localStorage.getItem("token");
        if (!token) {
            setUser(null);
            return;
        }

        try {
            const response = await api.get("/auth/me");
            if (response.data) {
                // Handle different response formats - check for nested data object
                const userData = response.data.data || response.data.user || response.data;
                setUser(userData);

                // Save fresh user data to localStorage for next mount
                localStorage.setItem("student_user", JSON.stringify(userData));
            }
        } catch (error) {
            setUser(null);
            localStorage.removeItem("student_access_token");
            localStorage.removeItem("token");
            localStorage.removeItem("student_user");
        }
    };

    const handleLogout = () => {
        try {
            setUser(null);
            localStorage.clear();
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


                .logout-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    padding: 10px 18px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    border: 2px solid #ff8306ff;
                    border-radius: 10px;
                    background: transparent;
                }

                .logout-btn:hover {
                    color: white;
                    background: #e63946;
                    border-color: #e63946;
                }

                /* Mobile Menu Styles */
                @media (max-width: 991px) {
                    /* Remove yellow background from menu on mobile */
                    .menu-area .menu {
                        background: white !important;
                    }

                    .menu {
                        background: white !important;
                    }

                    .lab-ul {
                        background: white !important;
                    }

                    .dropdown-menu {
                        display: none !important;
                        max-height: 0;
                        overflow: hidden;
                        opacity: 0;
                        transition: all 0.3s ease;
                        background: white !important;
                    }
                    .dropdown-menu.open {
                        display: block !important;
                        max-height: 500px;
                        opacity: 1;
                    }

                    /* Only add + icon to menu items with children */
                    .menu > .menu-item-has-children > a::after {
                        content: '+';
                        margin-left: 8px;
                        font-size: 18px;
                        font-weight: bold;
                        transition: transform 0.3s ease;
                        display: inline-block;
                    }
                    .menu > .menu-item-has-children.open > a::after {
                        content: '−';
                        color: #ff6600;
                    }
                    .menu > .menu-item-has-children > a {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }

                    /* Prevent double icons - only show one + or - */
                    .menu > .menu-item-has-children > a i {
                        display: none !important;
                    }

                    /* Hide icons from dropdown items */
                    .dropdown-menu i {
                        display: none !important;
                    }

                    /* Header bar styles */
                    .header-bar {
                        display: flex !important;
                    }
                    .header-bar.active ~ .menu {
                        display: block;
                    }
                }
            `}</style>

            <header className={`header-section style-4 ${headerFiexd ? "header-fixed fadeInUp" : ""}`}>
                <div className="header-bottom">
                    <div className="container">
                        <div className="header-wrapper">
                            {/* Logo */}
                            <div className="logo">
                                <Link to={getCollegePath("/")}>
                                    {user && ((user.college_details && user.college_details.logo) || user.college_logo) ? (
                                        <img
                                            src={
                                                (() => {
                                                    const logoUrl = user.college_details?.logo || user.college_logo;
                                                    // If already full URL, use as-is
                                                    if (logoUrl?.startsWith('http')) {
                                                        return logoUrl;
                                                    }
                                                    // Otherwise prepend API base URL
                                                    return `http://16.16.76.74:8000${logoUrl}`;
                                                })()
                                            }
                                            alt={(user.college_details?.name || user.college_name) || "College Logo"}
                                            title={(user.college_details?.name || user.college_name) || "College Logo"}
                                            style={{ maxHeight: '60px', objectFit: 'contain' }}
                                            onError={(e) => {
                                                // Fallback to default logo if college logo fails to load
                                                e.target.src = "assets/images/logo/01.png";
                                            }}
                                        />
                                    ) : (
                                        <img src="assets/images/logo/01.png" alt="logo" />
                                    )}
                                </Link>
                            </div>

                            {/* Menu */}
                            <div className="menu-area">
                                <div className="menu">
                                    <ul className={`lab-ul ${menuToggle ? "active" : ""}`}>
                                        {/* Home */}
                                        <li>
                                            <NavLink
                                                to={getCollegePath("/")}
                                                onClick={closeMenu}
                                                className={({ isActive }) =>
                                                    isActive ? "active-link" : ""
                                                }
                                            >
                                                <i className="icofont-home"></i> Home
                                            </NavLink>
                                        </li>

                                        {/* Practice */}
                                        <li
                                            className={`menu-item-has-children ${
                                                ["/challenges", "/companies", "/jobs"].includes(normalizedPath)
                                                    ? "active-parent"
                                                    : ""
                                            } ${openDropdown === "practice" ? "open" : ""}`}
                                        >
                                            <a
                                                href="#"
                                                onClick={(e) => handleDropdownToggle("practice", e)}
                                            >
                                                <i className="icofont-code"></i> Practice
                                            </a>
                                            <ul className={`lab-ul dropdown-menu ${openDropdown === "practice" ? "open" : ""}`}>
                                                <li>
                                                    <NavLink
                                                        to={getCollegePath("/challenges")}
                                                        onClick={closeMenu}
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-puzzle"></i> Coding Challenges
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
                                                        <i className="icofont-building"></i> Company Challenges
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        to={getCollegePath("/jobs")}
                                                        onClick={closeMenu}
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-briefcase"></i> Job Listings
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </li>

                                        {/* Learn */}
                                        <li
                                            className={`menu-item-has-children ${
                                                ["/course", "/course-single", "/course-view"].some(path => normalizedPath.includes(path))
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
                                                        to={getCollegePath("/course")}
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

                                        {/* Progress */}
                                        <li
                                            className={`menu-item-has-children ${
                                                ["/profile", "/leaderboard"].some(path => normalizedPath.includes(path))
                                                    ? "active-parent"
                                                    : ""
                                            } ${openDropdown === "progress" ? "open" : ""}`}
                                        >
                                            <a
                                                href="#"
                                                onClick={(e) => handleDropdownToggle("progress", e)}
                                            >
                                                <i className="icofont-trophy"></i> Progress
                                            </a>
                                            <ul className={`lab-ul dropdown-menu ${openDropdown === "progress" ? "open" : ""}`}>
                                                <li>
                                                    <NavLink
                                                        to={getCollegePath("/profile")}
                                                        onClick={closeMenu}
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-user-alt-3"></i> My Profile
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        to={getCollegePath("/leaderboard")}
                                                        onClick={closeMenu}
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-trophy-alt"></i> Leaderboard
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </li>

                                       
                                    </ul>
                                </div>

                                {/* Auth Section */}
                                <div className="auth-section d-flex align-items-center gap-2">
                                    {user ? (
                                        <Link
                                            to="#"
                                            className="logout-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleLogout();
                                            }}
                                            title="Logout"
                                        >
                                            
                                            <span className="d-none d-md-inline">Logout</span><i className="icofont-arrow-right"></i>
                                        </Link>
                                    ) : (
                                        <>
                                        </>
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

                                {/* Mobile Social Toggle */}
                                <div
                                    className="ellepsis-bar d-lg-none"
                                    onClick={() => setSocialToggle(!socialToggle)}
                                >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
