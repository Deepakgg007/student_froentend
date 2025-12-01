import { Link, useLocation } from "react-router-dom";

const Footer = () => {
    const location = useLocation();

    // Check if current page is login or signup
    const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/forgetpass";
    return (
        <div className="news-footer-wrap">
            <div className="fs-shape">
                <img src="/assets/images/shape-img/03.png" alt="fst" className="fst-1" />
                <img src="/assets/images/shape-img/04.png" alt="fst" className="fst-2" />
            </div>

            {/* Show this only if NOT on login or signup */}
            {!isAuthPage && (
                <div className="footer-top padding-tb pt-0">
                    <div className="container">
                        <div className="row g-4 row-cols-xl-4 row-cols-md-2 row-cols-1 justify-content-center">
                            <div className="col ">
                                <div className="footer-item">
                                    <div className="footer-inner">
                                        <div className="footer-content">
                                            <div className="title"><h4>Quick Links</h4></div>
                                            <div className="content">
                                                <ul className="lab-ul">
                                                    <li style={{ position: "relative", zIndex: 2 }}><Link to="/course">Courses</Link></li>
                                                    <li><Link to="/challenges">Challenges</Link></li>
                                                    <li><Link to="/jobs">Jobs</Link></li>
                                                    <li><Link to="/leaderboard">Leaderboard</Link></li>
                                                    <li><Link to="/companies">Companies</Link></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col">
                                <div className="footer-item">
                                    <div className="footer-inner">
                                        <div className="footer-content">
                                            <div className="title"><h4>Student Resources</h4></div>
                                            <div className="content">
                                                <ul className="lab-ul">
                                                    <li><Link to="/profile/learning">My Learning</Link></li>
                                                    <li><Link to="/profile">My Profile</Link></li>
                                                    <li><Link to="/profile/certificates">Certificates</Link></li>
                                                    <li><Link to="/profile/achievements">Achievements</Link></li>
                                                    <li><Link to="/profile/saved">Saved Courses</Link></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col">
                                <div className="footer-item">
                                    <div className="footer-inner">
                                        <div className="footer-content">
                                            <div className="title"><h4>Community</h4></div>
                                            <div className="content">
                                                <ul className="lab-ul">
                                                    <li><a href="https://facebook.com/edukon" target="_blank" rel="noreferrer">Facebook</a></li>
                                                    <li><a href="https://twitter.com/edukon" target="_blank" rel="noreferrer">Twitter</a></li>
                                                    <li><a href="https://discord.gg/edukon" target="_blank" rel="noreferrer">Discord</a></li>
                                                    <li><a href="https://youtube.com/edukon" target="_blank" rel="noreferrer">YouTube</a></li>
                                                    <li><a href="https://github.com/edukon" target="_blank" rel="noreferrer">Github</a></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col">
                                <div className="footer-item">
                                    <div className="footer-inner">
                                        <div className="footer-content">
                                            <div className="title"><h4>Learning Support</h4></div>
                                            <div className="content">
                                                <ul className="lab-ul">
                                                    <li><Link to="/support/student">Student Support</Link></li>
                                                    <li><Link to="/learning-paths">Learning Paths</Link></li>
                                                    <li><Link to="/resources">Resources</Link></li>
                                                    <li><Link to="/faq">FAQ</Link></li>
                                                    <li><Link to="/support">Get Help</Link></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Always show this section */}
            <div className="footer-bottom style-2 pt-2">
                <div className="container">
                    <div className="section-wrapper pt-1">
                        <p>
                            &copy; 2025 <Link to="/">Z1</Link> Designed by{" "}
                            <a href="#" target="_blank" rel="noreferrer">
                                Haegl
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
