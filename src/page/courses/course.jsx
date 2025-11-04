import { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../../component/layout/footer";
import Header from "../../component/layout/header";
import api from "../../services/api";

const CoursePage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/courses/');

            const data = response.data;
            const coursesData = Array.isArray(data)
                ? data
                : data.results || data.data || [];

            console.log('Courses API Response:', coursesData);
            if (coursesData.length > 0) {
                console.log('First course data:', coursesData[0]);
            }

            setCourses(coursesData);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
            setError('Failed to load courses. Please try again later.');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = !difficultyFilter || course.difficulty_level === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    const getDifficultyBadgeClass = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'beginner': return 'bg-success';
            case 'intermediate': return 'bg-warning';
            case 'advanced': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'assets/images/course/01.jpg';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${imageUrl}`;
    };

    return (
        <Fragment>
            <Header />

            {/* Page Header with proper spacing */}
            <div className="page-header-content text-center" style={{
                paddingTop: '120px',
                paddingBottom: '40px',
                background: 'linear-gradient(135deg, #e96b39ff 0%, #ddc8c0ff 100%)'
            }}>
                <div className="container">
                    <h2 className="title text-white">All Courses</h2>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center">
                            <li className="breadcrumb-item"><Link to="/" className="text-white">Home</Link></li>
                            <li className="breadcrumb-item active text-white" aria-current="page">Courses</li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Filters Section */}
            <div className="course-section padding-tb">
                <div className="container">
                    <div className="course-filter-area mb-4">
                        <div className="row g-3">
                            <div className="col-md-8">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search courses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '12px 20px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px'
                                    }}
                                />
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-control"
                                    value={difficultyFilter}
                                    onChange={(e) => setDifficultyFilter(e.target.value)}
                                    style={{
                                        padding: '12px 20px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <option value="">All Difficulty Levels</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p>Loading courses...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="icofont-book-alt" style={{ fontSize: '60px', color: '#ccc' }}></i>
                            <h5 className="text-muted mt-3">No courses found</h5>
                            <p className="text-muted">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="row g-4 justify-content-center row-cols-xl-3 row-cols-md-2 row-cols-1">
                            {filteredCourses.map((course) => (
                                <div className="col" key={course.id}>
                                    <div className="course-item hover-card">
                                        <div className="course-inner">
                                            <div className="course-thumb">
                                                <img
                                                    src={getImageUrl(course.thumbnail || course.image)}
                                                    alt={course.title}
                                                    style={{ height: '200px', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.src = 'assets/images/course/01.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="course-content">
                                                <Link to={`/course-single/${course.id}`}>
                                                    <h4>{course.title} <span  style={{fontSize: '15px'}}>({course.course_id})</span></h4>
                                                </Link>
                                                <div className="course-details mt-2 align-items-center d-flex justify-content-center">
                                                    <div className="couse-count">
                                                        {[...Array(5)].map((_, index) => (
                                                            <i
                                                                key={index}
                                                                className={`icofont-star ${index < Math.floor(course.rating || 0) ? 'text-warning' : 'text-muted'}`}
                                                            ></i>
                                                        ))}
                                                        
                                                    </div>
                                                </div>
                                                <div className="course-details mt-3">
                                                    <div className="couse-count">
                                                        <i className="icofont-signal"></i> {course.difficulty_level?.toUpperCase() || 'BEGINNER'}
                                                    </div>
                                                    {course.is_featured && (
                                                        <div className="couse-count">
                                                            <i className="icofont-star"></i> Featured
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="course-details mt-2">
                                                    <div className="couse-count">
                                                        <i className="icofont-clock-time"></i> {course.duration_hours || 0} Hours
                                                    </div>
                                                    <div className="couse-count">
                                                        <i className="icofont-users-alt-3"></i> {course.current_enrollments || 0} Enrolled
                                                    </div>
                                                </div>
                                                
                                                <div className="course-footer mt-3">
                                                    <Link to={`/course-single/${course.id}`} className="lab-btn w-100 text-center">
                                                        <span>View Details</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />

            <style>{`
                .hover-card {
                    transition: all 0.3s ease;
                }
                .hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                }
            `}</style>
        </Fragment>
    );
}

export default CoursePage;