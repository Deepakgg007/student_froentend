import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SelectCatagory from "../sidebar/selectCatagory";
import api from "../../services/api";

const BannerFour = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const title = (
    <h2>
      Search Your One From <span>150+</span> Online Courses
    </h2>
  );

  const bannerList = [
    { iconName: "icofont-users-alt-4", text: "150+ Students" },
    { iconName: "icofont-notification", text: "More than 20 Courses" },
    { iconName: "icofont-globe", text: "Learn Anything Online" },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/courses/");
      const data = response.data;
      const coursesData = Array.isArray(data)
        ? data
        : data.results || data.data || [];
      setCourses(coursesData);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCourses.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (highlightedIndex >= 0) {
          e.preventDefault();
          const selected = filteredCourses[highlightedIndex];
          window.location.href = `/course-single/${selected.course_id || selected.id}`;
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };
  
  const handleCategoryChange = (e) => {
    const selected = e.target.value;

    // Update search query
    setSearchQuery(selected);

    // Filter courses immediately
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

  // 🔹 Inline Styles
  const styles = {
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(48%, 1fr))",
      gap: "20px",
      marginTop: "20px",
    },
    courseItem: {
      display: "flex",
      alignItems: "center",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
      transition: "all 0.3s ease",
      padding: "10px",
    },
    thumb: {
      flex: "0 0 50%",
      marginRight: "20px",
    },
    thumbImg: {
      width: "100%",
      height: "100px",
      objectFit: "cover",
      borderRadius: "8px",
    },
    content: {
      flexGrow: 1,
    },
    titleText: {
      fontSize: "20px",
      fontWeight: 600,
      margin: "0 0 8px 0",
      color: "#222",
    },
  };

  return (
    <>
      <div className="banner-section style-4">
        <div className="container">
          <div className="banner-content">
            {title}

            {/* 🔍 Search Bar */}
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <SelectCatagory select={"all"} onChange={handleCategoryChange} />
              <input
                type="text"
                name="search"
                placeholder="Search your course"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <button type="submit">
                <i className="icofont-search"></i>
              </button>

              {/* Live Search Suggestions */}
              {showSuggestions && filteredCourses.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '0 0 8px 8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {filteredCourses.map((course, index) => (
                    <div
                      key={course.course_id || course.id}
                      onClick={() => handleSuggestionClick(course)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      style={{
                        padding: '10px 15px',
                        cursor: 'pointer',
                        backgroundColor: index === highlightedIndex ? '#f0f0f0' : 'white',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <img
                        src={getImageUrl(course.thumbnail || course.image)}
                        alt=""
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                        onError={(e) => e.target.src = "assets/images/course/01.jpg"}
                      />
                      <div>
                        <div style={{ fontWeight: 500 }}>{course.title}</div>
                        {course.category?.name && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {course.category.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>

            {/* 🔸 Dynamic Text (below search bar) */}
            {hasSearched ? (
              searchQuery ? (
                <p style={{ marginTop: "15px" }}>
                  Showing results for{" "}
                  <span style={{ fontWeight: "bold", color: "#007bff" }}>
                    {searchQuery}
                  </span>
                </p>
              ) : (
                <p>Please type something to search courses</p>
              )
            ) : (
              <p>We Have The Largest Collection of Courses</p>
            )}

            {/* 🔹 Search Results (below “Showing results for ...”) */}
            {hasSearched && (
              <div className="container" style={{ marginTop: "20px" }}>
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
                      <div
                        key={course.course_id || course.id}
                        style={styles.courseItem}
                      >
                        <div style={styles.thumb}>
                          <img
                            src={getImageUrl(course.thumbnail || course.image)}
                            alt={course.title}
                            onError={(e) =>
                              (e.target.src = "assets/images/course/01.jpg")
                            }
                            style={styles.thumbImg}
                          />
                        </div>
                        <div style={styles.content}>
                          <Link
                            to={`/course-single/${course.course_id || course.id}`}
                          >
                            <h5 style={styles.titleText}>{course.title}</h5>
                          </Link>
                          <div>
                            <span
                              style={{ fontSize: "14px", color: "#555" }}
                            >
                              Course ID: {course.course_id || course.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 🔹 Icon List (below results) */}
            <ul className="lab-ul" style={{ marginTop: "30px" }}>
              {bannerList.map((val, i) => (
                <li key={i}>
                  <i className={val.iconName}></i> {val.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default BannerFour;
