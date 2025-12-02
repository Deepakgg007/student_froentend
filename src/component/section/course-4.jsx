import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const title = "Our Courses";
const btnText = "Get Started Now";
const staticCategories = [];

const CourseFour = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchCourses();
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");
      // Fetch courses ordered by updated_at from backend (oldest first)
      const response = await api.get("/courses/?ordering=updated_at");
      const data = response.data;
      let coursesData = Array.isArray(data)
        ? data
        : data.results || data.data || [];

      // Sort courses by updated_at (oldest first) - backup sort if backend doesn't do it
      coursesData = coursesData.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0);
        const dateB = new Date(b.updated_at || b.created_at || 0);
        return dateA - dateB;
      });

      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError("Failed to load courses. Please try again later.");
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Desktop-only filter function (hidden on mobile)
  const filterItem = (category) => {
    if (isMobile) return; // disable filtering on mobile
    setActiveFilter(category);
    if (category === "All") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course) => {
        const titleMatch = course.title
          ?.toLowerCase()
          .includes(category.toLowerCase());
        const categoryMatch =
          course.category?.name?.toLowerCase() === category.toLowerCase() ||
          course.category?.toLowerCase() === category.toLowerCase();
        return titleMatch || categoryMatch;
      });
      setFilteredCourses(filtered);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "assets/images/course/01.jpg";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${
      process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"
    }${imageUrl}`;
  };

  // Styles
  const styles = {
    gridContainer: {
      display: isMobile ? "flex" : "grid",
      gridTemplateColumns: isMobile
        ? "none"
        : "repeat(auto-fit, minmax(28%, 2fr))",
      gap: "20px",
      overflowX: isMobile ? "auto" : "visible",
      whiteSpace: isMobile ? "nowrap" : "normal",
      scrollSnapType: isMobile ? "x mandatory" : "none",
      WebkitOverflowScrolling: isMobile ? "touch" : "auto",
      paddingBottom: isMobile ? "10px" : "0",
    },
    courseItem: {
      display: "flex",
      alignItems: "center",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
      transition: "all 0.3s ease",
      padding: "10px",
      flex: isMobile ? "0 0 auto" : "unset",
      width: isMobile ? "280px" : "auto",
      scrollSnapAlign: isMobile ? "start" : "unset",
    },
    thumb: {
      flex: "0 0 120px",
      marginRight: "15px",
    },
    thumbImg: {
      width: "100%",
      height: "75px",
      objectFit: "cover",
      borderRadius: "8px",
    },
    content: { flexGrow: 1 },
    titleText: {
      fontSize: "18px",
      fontWeight: 600,
      margin: "0 0 8px 0",
      color: "#222",
    },
    filterBtn: {
      cursor: "pointer",
      padding: "8px 18px",
      borderRadius: "25px",
      border: "1px solid #ddd",
      transition: "all 0.3s",
      marginRight: "8px",
      display: "inline-block",
    },
    filterBtnActive: {
      backgroundColor: "#007bff",
      color: "#fff",
      borderColor: "#007bff",
    },
  };

  return (
    <div id="course-4" className="course-section style-3 padding-tb">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center mb-5">
          <h2 className="title mb-3">{title}</h2>

          {/* Hide filter buttons on mobile */}
          {!isMobile && (
            <div className="course-filter-group">
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "inline-flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {staticCategories.map((cat, idx) => (
                  <li
                    key={idx}
                    style={{
                      ...styles.filterBtn,
                      ...(activeFilter === cat ? styles.filterBtnActive : {}),
                    }}
                    onClick={() => filterItem(cat)}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="section-wrapper">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status"></div>
              <p className="mt-3">Loading courses...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center">{error}</div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="icofont-book-alt"
                style={{ fontSize: "60px", color: "#ccc" }}
              ></i>
              <h5 className="text-muted mt-3">No courses found</h5>
            </div>
          ) : (
            <div style={styles.gridContainer}>
              {filteredCourses.map((course) => (
                <Link 
  to={`/course-single/${course.id}`} 
  style={{ textDecoration: "none", color: "inherit" }}
>
  <div
    key={course.course_id || course.id}
    style={styles.courseItem}
  >
    <div style={styles.thumb}>
      <img
        src={getImageUrl(course.thumbnail || course.image)}
        alt={course.title}
        onError={(e) => {
          e.target.src = "assets/images/course/01.jpg";
        }}
        style={styles.thumbImg}
      />
    </div>

    <div style={styles.content}>
      <h5 style={styles.titleText}>{course.title}</h5>
      <span style={{ fontSize: "14px", color: "#555" }}>
        Course ID: {course.course_id || course.id}
      </span>
    </div>
  </div>
</Link>

              ))}
            </div>
          )}

          {/* Get Started Button */}
          <div className="text-center mt-5">
  <Link
    to="/course"
    className="lab-btn"
    style={{
      background: "#1d61bf",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.25)",
      borderRadius: "8px"
    }}
  >
    <span>{btnText}</span>
  </Link>
</div>
        </div>
      </div>
    </div>
  );
};

export default CourseFour;
