import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useSmoothData } from "../../hooks/useSmoothData";

const BannerFour = () => {
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const title = (
    <h2 style={{ fontSize: "26px", textAlign: "center" }}>
      Search Your One From <span style={{ color: "#007bff" }}>6</span> Online Courses
    </h2>
  );

  const bannerList = [
    { iconName: "icofont-users-alt-4", text: "150+ Students" },
    { iconName: "icofont-notification", text: "More than 20 Courses" },
    { iconName: "icofont-globe", text: "Learn Anything Online" },
  ];

  // Fetch courses with smooth transition
  const { data: courses = [], loading, error } = useSmoothData(
    async () => {
      const response = await api.get("/courses/");
      const data = response.data;
      const coursesData = Array.isArray(data)
        ? data
        : data.results || data.data || [];
      return { data: coursesData };
    },
    []
  );

  useEffect(() => {
    setFilteredCourses(courses);
  }, [courses]);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHighlightedIndex(-1);

    if (!query.trim()) {
      setFilteredCourses([]);
      setShowSuggestions(false);
      return;
    }

    const results = courses.filter(
      (course) =>
        course.title?.toLowerCase().includes(query.toLowerCase()) ||
        course.category?.name?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCourses(results);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCourses.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          e.preventDefault();
          const selected = filteredCourses[highlightedIndex];
          window.location.href = `/course-single/${selected.course_id || selected.id}`;
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;

    setSearchQuery(selected);

    const results = courses.filter(
      (course) =>
        course.title?.toLowerCase().includes(selected.toLowerCase()) ||
        course.category?.name?.toLowerCase().includes(selected.toLowerCase())
    );

    setFilteredCourses(results);
    setHasSearched(true);
  };

  const handleSuggestionClick = (course) => {
    window.location.href = `/course-single/${course.course_id || course.id}`;
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "assets/images/course/01.jpg";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${
      process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"
    }${imageUrl}`;
  };

  // Styles for results
  const styles = {
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginTop: "25px",
    },
    courseItem: {
      display: "flex",
      gap: "15px",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
      padding: "15px",
      transition: "0.3s ease",
      flexDirection: "row",
    },
    thumbImg: {
      width: "100%",
      maxWidth: "120px",
      height: "90px",
      objectFit: "cover",
      borderRadius: "8px",
    },
    titleText: {
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "8px",
    },
  };

  return (
    <div className="banner-section style-4" style={{ padding: "50px 0" }}>
      <div className="container">

        {/* Title */}
        <div className="banner-content">{title}</div>

        {/* Search Section */}
        <form
          onSubmit={handleSearch}
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Category dropdown */}
          <div style={{ flex: "1 1 200px" }}>
            <select
              onChange={handleCategoryChange}
              defaultValue="all"
              style={{
                width: "100%",
                padding: "12px 15px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
                backgroundColor: "#fff",
                cursor: "pointer"
              }}
            >
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          {/* Search Box */}
          <div style={{ flex: "2 1 300px", position: "relative" }}>
            <input
              type="text"
              name="search"
              placeholder="Search your course"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{
                width: "100%",
                padding: "12px 15px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />

            <button
              type="submit"
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              <i className="icofont-search"></i>
            </button>

            {/* Suggestions */}
            {showSuggestions && filteredCourses.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "#fff",
                  borderRadius: "0 0 8px 8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  zIndex: 1000,
                  maxHeight: "350px",
                  overflowY: "auto",
                }}
              >
                {filteredCourses.map((course, index) => (
                  <div
                    key={course.course_id || course.id}
                    onClick={() => handleSuggestionClick(course)}
                    style={{
                      padding: "10px 15px",
                      backgroundColor:
                        index === highlightedIndex ? "#f0f0f0" : "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <img
                      src={getImageUrl(course.thumbnail || course.image)}
                      alt=""
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />

                    <div>
                      <div style={{ fontWeight: 600 }}>{course.title}</div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {course.category?.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Result Text */}
        <div
          style={{
            marginTop: "15px",
            fontSize: "16px",
            textAlign: "center",
          }}
        >
          {hasSearched ? (
            searchQuery ? (
              <>
                Showing results for{" "}
                <b style={{ color: "#007bff" }}>{searchQuery}</b>
              </>
            ) : (
              <>Please type something to search courses</>
            )
          ) : (
            <>We Have The Largest Collection of Courses</>
          )}
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div style={{ marginTop: "25px" }}>
            {loading ? (
              // Skeleton Loader
              <div style={styles.gridContainer}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={styles.courseItem}>
                    <div
                      className="skeleton-line"
                      style={{
                        width: "120px",
                        height: "90px",
                        borderRadius: "8px",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div style={{ flex: 1 }}>
                      <div
                        className="skeleton-line mb-2"
                        style={{ width: "80%", height: "18px" }}
                      ></div>
                      <div
                        className="skeleton-line"
                        style={{ width: "50%", height: "14px" }}
                      ></div>
                    </div>
                  </div>
                ))}
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
              <div
                style={{
                  ...styles.gridContainer,
                  opacity: filteredCourses.length ? 1 : 0,
                  transform: filteredCourses.length ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
                }}
              >
                {filteredCourses.map((course) => (
                  <div key={course.id} style={styles.courseItem}>
                    <img
                      src={getImageUrl(course.thumbnail || course.image)}
                      alt={course.title}
                      style={styles.thumbImg}
                    />

                    <div>
                      <Link
                        to={`/course-single/${course.course_id || course.id}`}
                      >
                        <h5 style={styles.titleText}>{course.title}</h5>
                      </Link>

                      <div style={{ fontSize: "14px", color: "#666" }}>
                        Course ID: {course.course_id || course.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Banner Bottom Icons */}
        <ul
          className="lab-ul"
          style={{
            marginTop: "30px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            gap: "25px",
            flexWrap: "wrap",
          }}
        >
          {bannerList.map((val, i) => (
            <li key={i} style={{ fontSize: "16px" }}>
              <i className={val.iconName}></i> {val.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BannerFour;
