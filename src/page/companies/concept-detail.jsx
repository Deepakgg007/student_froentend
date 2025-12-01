// Concept Detail Page
// Displays concept information and list of challenges

import React, { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCompanyBySlug, getConceptById, getConceptChallenges, getDifficultyColor } from '../../services/api';
import Swal from 'sweetalert2';

const ConceptDetail = () => {
  const { companySlug, conceptSlug } = useParams(); // conceptSlug is the concept's slug
  const navigate = useNavigate();

  const [concept, setConcept] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConceptData();
  }, [conceptSlug]);

  const fetchConceptData = async () => {
    try {
      setLoading(true);

      // Fetch company details
      const companyResponse = await getCompanyBySlug(companySlug);
      setCompany(companyResponse.data);

      // Fetch concept details by slug
      const conceptResponse = await getConceptById(conceptSlug);
      console.log('Concept Response:', conceptResponse.data);
      setConcept(conceptResponse.data);

      // Fetch challenges for this concept using the slug
      const challengesResponse = await getConceptChallenges(conceptSlug);
      console.log('Concept Challenges Response:', challengesResponse.data);
      const challengesData = Array.isArray(challengesResponse.data) 
        ? challengesResponse.data 
        : challengesResponse.data?.results || [];
      setChallenges(challengesData);
    } catch (error) {
      console.error('Error fetching concept data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load concept details. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Fragment>
        <div style={{ paddingTop: '100px' }}></div>
        <div className="container-fluid px-5 py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading concept details...</p>
        </div>
      </div>
      </Fragment>
    );
  }

  if (!concept) {
    return (
      <Fragment>
        <div style={{ paddingTop: '100px' }}></div>
        <div className="container-fluid px-5 py-5">
        <div className="text-center py-5">
          <i className="fas fa-exclamation-circle fa-4x text-danger mb-3"></i>
          <h4>Concept not found</h4>
          <button className="btn btn-primary mt-3" onClick={() => navigate(`/companies/${companySlug}`)}>
            Back to Company
          </button>
        </div>
      </div>
      </Fragment>
    );
  }

  const difficultyColor = getDifficultyColor(concept.difficulty_level);

  return (
    <Fragment>
      
      {/* Page Header with proper spacing */}
      <div style={{ paddingTop: '100px' }}></div>
      
      <div className="container-fluid px-5 py-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/companies">Companies</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/companies/${companySlug}`}>
              {company?.name || 'Company'}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {concept.name}
          </li>
        </ol>
      </nav>

      {/* Concept Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  {/* Concept Title and Difficulty */}
                  <div className="d-flex align-items-center mb-3">
                    <h1 className="mb-0 me-3">{concept.name}</h1>
                    <span className={`badge bg-${difficultyColor} fs-5`}>
                      {concept.difficulty_level}
                    </span>
                  </div>

                  {/* Company Badge */}
                  <div className="mb-3">
                    <Link 
                      to={`/companies/${companySlug}`}
                      className="badge bg-light text-dark text-decoration-none"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <i className="fas fa-building me-1"></i>
                      {concept.company_name}
                    </Link>
                  </div>

                  {/* Description */}
                  {concept.description && (
                    <p className="text-muted mb-3">{concept.description}</p>
                  )}

                  {/* Concept Metadata */}
                  <div className="d-flex flex-wrap gap-4">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-code text-primary me-2 fs-5"></i>
                      <div>
                        <div className="fw-bold">{challenges.length}</div>
                        <small className="text-muted">Challenges</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-clock text-primary me-2 fs-5"></i>
                      <div>
                        <div className="fw-bold">~{concept.estimated_time_minutes} min</div>
                        <small className="text-muted">Estimated Time</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-trophy text-primary me-2 fs-5"></i>
                      <div>
                        <div className="fw-bold">{concept.max_score || 0}</div>
                        <small className="text-muted">Max Points</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => navigate(`/companies/${companySlug}`)}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Company
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges Section */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-list-ul me-2"></i>
              Challenges
            </h2>
          </div>

          {challenges.length > 0 ? (
            <div className="row g-4">
              {challenges.map((conceptChallenge, index) => {
                const challenge = conceptChallenge.challenge_details || {};
                const challengeDifficultyColor = getDifficultyColor(challenge.difficulty);

                return (
                  <div key={conceptChallenge.id} className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-1 text-center">
                            <div 
                              className="challenge-number bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: '50px', height: '50px', fontSize: '1.2rem', fontWeight: 'bold' }}
                            >
                              {index + 1}
                            </div>
                          </div>

                          <div className="col-md-8">
                            <div className="d-flex align-items-center mb-2">
                              <h5 className="mb-0 me-3">{challenge.title}</h5>
                              <span className={`badge bg-${challengeDifficultyColor} me-2`}>
                                {challenge.difficulty}
                              </span>
                              {challenge.category && (
                                <span className="badge bg-secondary">
                                  {challenge.category}
                                </span>
                              )}
                            </div>

                            <div className="d-flex flex-wrap gap-3">
                              <small className="text-muted">
                                <i className="fas fa-trophy me-1"></i>
                                {conceptChallenge.weighted_max_score} points
                              </small>
                              {conceptChallenge.effective_time_limit && (
                                <small className="text-muted">
                                  <i className="fas fa-clock me-1"></i>
                                  {conceptChallenge.effective_time_limit}s time limit
                                </small>
                              )}
                              {conceptChallenge.has_hint_video && (
                                <small className="text-info">
                                  <i className="fas fa-video me-1"></i>
                                  Hint video available
                                </small>
                              )}
                            </div>
                          </div>

                          <div className="col-md-3 text-md-end mt-3 mt-md-0">
                            {challenge.submission_status ? (
                              // User has attempted this challenge
                              challenge.submission_status === 'ACCEPTED' ? (
                                <Link
                                  to={`/companies/${companySlug}/concepts/${conceptSlug}/challenges/${challenge.slug}/solve`}
                                  className="btn btn-success"
                                >
                                  <i className="fas fa-check-circle me-2"></i>
                                  Score: {challenge.submission_score || 0} - View Code
                                </Link>
                              ) : (
                                <Link
                                  to={`/companies/${companySlug}/concepts/${conceptSlug}/challenges/${challenge.slug}/solve`}
                                  className="btn btn-warning"
                                >
                                  <i className="fas fa-times-circle me-2"></i>
                                  Failed - Try Again
                                </Link>
                              )
                            ) : (
                              // User hasn't attempted yet
                              <Link
                                to={`/companies/${companySlug}/concepts/${conceptSlug}/challenges/${challenge.slug}/solve`}
                                className="btn btn-primary"
                              >
                                <i className="fas fa-play me-2"></i>
                                Solve Challenge
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-code fa-4x text-muted mb-3"></i>
              <h5 className="text-muted">No challenges available yet</h5>
              <p className="text-muted">Check back later for new challenges</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </Fragment>
  );
};

export default ConceptDetail;
