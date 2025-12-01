// Company Detail Page
// Displays company information with Concepts and Jobs tabs

import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyBySlug, getCompanyConcepts, getCompanyJobs } from '../../services/api';
import ConceptCard from '../../component/cards/ConceptCard';
import JobCard from '../../component/cards/JobCard';
import Swal from 'sweetalert2';

const CompanyDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('concepts'); // 'concepts' or 'jobs'

  useEffect(() => {
    fetchCompanyData();
  }, [slug]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);

      // Fetch company details
      const companyResponse = await getCompanyBySlug(slug);
      setCompany(companyResponse.data);

      // Fetch concepts for this company
      const conceptsResponse = await getCompanyConcepts(slug);
      const conceptsData = Array.isArray(conceptsResponse.data) 
        ? conceptsResponse.data 
        : conceptsResponse.data?.results || [];
      setConcepts(conceptsData);

      // Fetch jobs for this company
      if (companyResponse.data.id) {
        const jobsResponse = await getCompanyJobs(companyResponse.data.id);
        const jobsData = Array.isArray(jobsResponse.data) 
          ? jobsResponse.data 
          : jobsResponse.data?.results || [];
        setJobs(jobsData);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load company details. Please try again.',
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
          <p className="mt-3 text-muted">Loading company details...</p>
        </div>
      </div>
      </Fragment>
    );
  }

  if (!company) {
    return (
      <Fragment>
        <div style={{ paddingTop: '100px' }}></div>
        <div className="container-fluid px-5 py-5">
        <div className="text-center py-5">
          <i className="fas fa-exclamation-circle fa-4x text-danger mb-3"></i>
          <h4>Company not found</h4>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/companies')}>
            Back to Companies
          </button>
        </div>
      </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      
      {/* Page Header with proper spacing */}
      <div style={{ paddingTop: '100px' }}></div>
      
      <div className="container-fluid px-5 py-4">
      {/* Back Button */}
      <div className="mb-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/companies')}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Companies
        </button>
      </div>

      {/* Company Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                {/* Company Logo */}
                <div className="col-md-2 text-center">
                  {(company.image_display || company.image) ? (
                    <img
                      src={company.image_display || company.image}
                      alt={company.name}
                      className="img-fluid"
                      style={{ maxHeight: '150px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center bg-light rounded"
                      style={{ height: '150px' }}
                    >
                      <i className="fas fa-building fa-4x text-muted"></i>
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="col-md-7">
                  <div className="d-flex align-items-center mb-3">
                    <h1 className="mb-0 me-3">{company.name}</h1>
                    {company.is_hiring_open ? (
                      <span className="badge bg-success fs-6">
                        <i className="fas fa-circle"></i> Hiring Open
                      </span>
                    ) : (
                      <span className="badge bg-secondary fs-6">
                        <i className="fas fa-circle"></i> Hiring Closed
                      </span>
                    )}
                  </div>

                  <div className="company-badges mb-3">
                    {company.industry && (
                      <span className="badge bg-light text-dark me-2">
                        <i className="fas fa-industry"></i> {company.industry}
                      </span>
                    )}
                    {company.location && (
                      <span className="badge bg-light text-dark me-2">
                        <i className="fas fa-map-marker-alt"></i> {company.location}
                      </span>
                    )}
                    {company.employee_count && (
                      <span className="badge bg-light text-dark me-2">
                        <i className="fas fa-users"></i> {company.employee_count}
                      </span>
                    )}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="badge bg-primary text-decoration-none"
                      >
                        <i className="fas fa-external-link-alt"></i> Website
                      </a>
                    )}
                  </div>

                  {/* Hiring Period */}
                  {company.hiring_period_start && company.hiring_period_end && (
                    <div className="hiring-period">
                      <h6 className="text-info">
                        <i className="fas fa-calendar"></i> Hiring Period:{' '}
                        {new Date(company.hiring_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                        {new Date(company.hiring_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </h6>
                      {company.is_hiring_open && company.days_until_hiring_ends > 0 && (
                        <p className="text-success mb-0">
                          <i className="fas fa-hourglass-half"></i>{' '}
                          {company.days_until_hiring_ends} days remaining to apply!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="col-md-3">
                  <div className="company-stats text-center">
                    <div className="row">
                      <div className="col-6">
                        <h3 className="text-primary">{company.total_concepts || 0}</h3>
                        <p className="mb-0">Concepts</p>
                      </div>
                      <div className="col-6">
                        <h3 className="text-primary">{company.total_challenges || 0}</h3>
                        <p className="mb-0">Challenges</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Description */}
      {company.description && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h4 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  About {company.name}
                </h4>
              </div>
              <div className="card-body">
                <p className="mb-0">{company.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs nav-fill">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'concepts' ? 'active' : ''}`}
                onClick={() => setActiveTab('concepts')}
              >
                <i className="fas fa-brain me-2"></i>
                Coding Concepts ({concepts.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
              >
                <i className="fas fa-briefcase me-2"></i>
                Job Openings ({jobs.length})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="row">
        <div className="col-12">
          {/* Concepts Tab */}
          {activeTab === 'concepts' && (
            <div className="concepts-section">
              {concepts.length > 0 ? (
                concepts.map((concept) => (
                  <ConceptCard
                    key={concept.id}
                    concept={concept}
                    companySlug={slug}
                    showProgress={false}
                  />
                ))
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-brain fa-4x text-muted mb-3"></i>
                  <h5 className="text-muted">No concepts available yet</h5>
                  <p className="text-muted">Check back later for coding challenges</p>
                </div>
              )}
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="jobs-section">
              {jobs.length > 0 ? (
                <div className="row g-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="col-lg-4 col-md-6 col-sm-12">
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-briefcase fa-4x text-muted mb-3"></i>
                  <h5 className="text-muted">No job openings available</h5>
                  <p className="text-muted">Check back later for new opportunities</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </Fragment>
  );
};

export default CompanyDetail;
