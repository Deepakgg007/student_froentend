import { Fragment, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import { useSmoothData } from "../../hooks/useSmoothData";

const CoursePage = () => {
    const { collegeSlug } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');

    // Fetch courses with smooth transition
    const { data: courses = [], loading, error } = useSmoothData(
        async () => {
            const response = await api.get('/courses/?ordering=-updated_at&status=published');
            const data = response.data;
            let coursesData = Array.isArray(data)
                ? data
                : data.results || data.data || [];

            // Sort courses by updated_at (oldest first)
            coursesData = coursesData.sort((a, b) => {
                const dateA = new Date(a.updated_at || a.created_at || 0);
                const dateB = new Date(b.updated_at || b.created_at || 0);
                return dateA - dateB;
            });

            // Return in format expected by useSmoothData (response object with .data property)
            return { data: coursesData };
        },
        [collegeSlug]
    );

    const filteredCourses = (courses || []).filter(course => {
        const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = !difficultyFilter || course.difficulty_level === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });


    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'assets/images/course/01.jpg';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${process.env.REACT_APP_API_BASE_URL}${imageUrl}`;
    };

    return (
        <Fragment>

            {/* Page Header with proper spacing */}
            <div className="page-header-content text-center" style={{
                background: 'linear-gradient(135deg, #f3f1f0ff 0%, #faf5f2ff 100%)'
            }}>
                
            </div>

            {/* Filters Section */}
            <div className="course-section padding-tb">
                <div className="container align-items-center d-flex justify-content-between mb-4">
                    <h3 className="title ">All Courses</h3>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/" >Home</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">Courses</li>
                        </ol>
                    </nav>
                </div>
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
                        // Skeleton Loader
                        <div className="row g-3 justify-content-center row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-1 px-2">
                            {[...Array(8)].map((_, i) => (
                                <div className="col" key={i}>
                                    <div style={{
                                        background: '#fff',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        height: '100%'
                                    }}>
                                        {/* Skeleton Image */}
                                        <div className="skeleton-line" style={{
                                            height: '140px',
                                            width: '100%'
                                        }}></div>
                                        {/* Skeleton Content */}
                                        <div style={{ padding: '14px 16px 16px' }}>
                                            <div className="skeleton-line" style={{ width: '40px', height: '12px', marginBottom: '6px' }}></div>
                                            <div className="skeleton-line" style={{ width: '100%', height: '38px', marginBottom: '6px' }}></div>
                                            <div className="skeleton-line" style={{ width: '100%', height: '32px', marginBottom: '6px' }}></div>
                                            <div className="d-flex gap-2 mb-2">
                                                <div className="skeleton-line rounded" style={{ width: '60px', height: '12px' }}></div>
                                                <div className="skeleton-line rounded" style={{ width: '60px', height: '12px' }}></div>
                                            </div>
                                            <div className="skeleton-line rounded" style={{ width: '100%', height: '36px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                        <div className="row g-3 justify-content-center row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-1 px-2"
                             style={{
                                 opacity: courses.length ? 1 : 0,
                                 transform: courses.length ? 'translateY(0)' : 'translateY(10px)',
                                 transition: 'opacity 0.4s ease-out, transform 0.4s ease-out'
                             }}>
                            {filteredCourses.map((course) => (
                                <div className="col" key={course.id}>
                                    <div className="course-card-modern" style={{
                                        background: '#fff',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        height: '100%'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(29,97,191,0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                    }}
                                    >
                                        {/* Course Image */}
                                        <div style={{
                                            position: 'relative',
                                            height: '140px',
                                            overflow: 'hidden',
                                        }}>
                                            <img
                                                src={getImageUrl(course.thumbnail || course.image)}
                                                alt={course.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                            {/* Difficulty Badge */}
                                            <span style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: 'rgba(255,255,255,0.95)',
                                                color: '#1D61BF',
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                        textTransform: 'uppercase'
                                            }}>
                                                {course.difficulty_level || 'Beginner'}
                                            </span>
                                        </div>

                                        {/* Course Content */}
                                        <div style={{ padding: '14px 16px 16px' }}>
                                            {/* Course ID */}
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                marginBottom: '6px',
                                                display: 'block'
                                            }}>
                                                {course.course_id || 'Course'}
                                            </span>

                                            {/* Title - Truncated */}
                                            <Link to={`/course-single/${course.id}`} style={{ textDecoration: 'none' }}>
                                                <h4 style={{
                                                    fontSize: '15px',
                                                    fontWeight: '600',
                                                    color: '#1e293b',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    height: '38px'
                                                }}>
                                                    {course.title}
                                                </h4>
                                            </Link>

                                            {/* Short Description - Truncated */}
                                            <p style={{
                                                fontSize: '13px',
                                                color: '#6b7280',
                                                marginBottom: '6px',
                                                lineHeight: '1.4',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                height: '32px'
                                            }}>
                                                {course.description || 'Learn this course with comprehensive lessons and hands-on projects.'}
                                            </p>

                                            {/* Rating */}
                                            <div className="mb-2" style={{ display: 'flex', gap: '2px' }}>
                                                {[...Array(5)].map((_, index) => (
                                                    <i
                                                        key={index}
                                                        className={`icofont-star ${index < Math.floor(course.rating || 0) ? 'text-warning' : 'text-muted'}`}
                                                        style={{ fontSize: '10px' }}
                                                    ></i>
                                                ))}
                                                {course.rating && (
                                                    <span style={{
                                                        fontSize: '11px',
                                                        color: '#6b7280',
                                                        marginLeft: '4px'
                                                    }}>
                                                        ({course.rating.toFixed(1)})
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info Row */}
                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '12px',
                                                marginBottom: '12px',
                                                fontSize: '13px',
                                                color: '#6b7280'
                                            }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <i className="icofont-clock-time" style={{ color: '#1D61BF' }}></i>
                                                    {course.duration_hours || 0}h
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <i className="icofont-users-alt-3" style={{ color: '#1D61BF' }}></i>
                                                    {course.current_enrollments || 0}
                                                </span>
                                            </div>

                                            {/* View Button */}
                                            <Link
                                                to={`/course-single/${course.id}`}
                                                style={{
                                                    display: 'block',
                                                    padding: '8px',
                                                    background: '#1D61BF',
                                                    color: '#fff',
                                                    textAlign: 'center',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    textDecoration: 'none',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#0d47a1'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#1D61BF'}
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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