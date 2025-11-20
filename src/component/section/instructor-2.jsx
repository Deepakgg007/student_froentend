import { useState, useEffect } from "react";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import api from "../../services/api"; // 👈 Use same API instance

const subTitle = "Why Choose Us";
const title = "Become Online Instructor";
const desc =
  "Take courses on any device with our app & learn anytime you want. Just download, install & start learning.";
const btnText = "Signup to Enroll";

const countList = [
  {
    iconName: "icofont-users-alt-4",
    count: "150",
    text: "Students Enrolled",
  },
  {
    iconName: "icofont-graduate-alt",
    count: "5",
    text: "Certified Trainer",
  },
  {
    iconName: "icofont-notification",
    count: "10",
    text: "Professional Courses",
  },
];

const InstructorTwo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟠 Same authentication logic as Header.jsx
  useEffect(() => {
    const checkUser = async () => {
      try {
        const cachedUser = localStorage.getItem("student_user");

        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setLoading(false);
          return;
        }

        const token =
          localStorage.getItem("student_access_token") ||
          localStorage.getItem("token");

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await api.get("/auth/me");
        const userData = response.data.data || response.data.user || response.data;

        setUser(userData);
        localStorage.setItem("student_user", JSON.stringify(userData));
      } catch (err) {
        setUser(null);
        localStorage.removeItem("student_user");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // 🟣 While checking authentication → do not flash the section
  if (loading) return null;

  // 🔴 If user is logged in → do NOT show this instructor section
  if (user) return null;

  // 🟢 User NOT logged in → show the instructor section
  return (
    <div className="instructor-section style-2 padding-tb section-bg-ash">
      <div className="container">
        <div className="section-wrapper">
          <div className="row g-4 justify-content-center row-cols-1 row-cols-md-2 row-cols-xl-3 align-items-center">
            {/* Count Section */}
            <div className="col">
              {countList.map((val, i) => (
                <div className="count-item" key={i}>
                  <div className="count-inner">
                    <div className="count-icon">
                      <i className={val.iconName}></i>
                    </div>
                    <div className="count-content">
                      <h2>
                        <span className="count">
                          <CountUp end={val.count} />
                        </span>
                        <span>+</span>
                      </h2>
                      <p>{val.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="col">
              <div className="instructor-content">
                <span className="subtitle">{subTitle}</span>
                <h2 className="title">{title}</h2>
                <p>{desc}</p>
                <Link to="/signup" className="lab-btn">
                  <span>{btnText}</span>
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="col">
              <div className="instructor-thumb">
                <img
                  src="assets/images/instructor/01.png"
                  alt="education"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorTwo;
