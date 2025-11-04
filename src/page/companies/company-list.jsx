// Company List Page
// Displays all companies with search and filter functionality

import React, { useState, useEffect, Fragment } from 'react';
import { getCompanies } from '../../services/api';
import CompanyCard from '../../component/cards/CompanyCard';
import Header from '../../component/layout/header';
import Footer from '../../component/layout/footer';
import Swal from 'sweetalert2';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [industries, setIndustries] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    hiring_status: '', // 'all', 'hiring', 'not_hiring'
    is_active: true,
  });

  // Fetch companies on mount and when filters change
  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  // Fetch unique industries for filter dropdown
  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = {
        is_active: filters.is_active,
      };

      if (filters.search) {
        params.search = filters.search;
      }

      if (filters.industry) {
        params.industry = filters.industry;
      }

      if (filters.hiring_status === 'hiring') {
        params.is_hiring = true;
      } else if (filters.hiring_status === 'not_hiring') {
        params.is_hiring = false;
      }

      const response = await getCompanies(params);
      console.log('Companies API Response:', response);
      console.log('Companies Data:', response.data);
      console.log('Total Companies:', response.data?.length || 0);
      
      // Handle both array response and paginated response
      const companiesData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.results || response.data?.data || [];
      
      setCompanies(companiesData);
      console.log('Companies set to state:', companiesData.length);
    } catch (error) {
      console.error('Error fetching companies:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load companies. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchIndustries = async () => {
    try {
      // Fetch all companies to extract unique industries
      const response = await getCompanies({ is_active: true });
      const uniqueIndustries = [...new Set(
        response.data
          .map(company => company.industry)
          .filter(industry => industry && industry.trim())
      )];
      setIndustries(uniqueIndustries.sort());
    } catch (error) {
      console.error('Error fetching industries:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      industry: '',
      hiring_status: '',
      is_active: true,
    });
  };

  return (
    <Fragment>
      <Header />
      
      {/* Enhanced Page Header */}
      <div className="page-header-content text-center position-relative overflow-hidden" style={{
        paddingTop: '120px',
        paddingBottom: '60px',
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      }}>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <h2 className="display-4 text-white mb-3" style={{ fontWeight: '700' }}>
            Explore Company Challenges
          </h2>
          <p className="text-white mb-4" style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto' }}>
            Take on real-world coding challenges, showcase your skills, and unlock exciting career opportunities
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <div className="badge bg-white bg-opacity-25 px-4 py-2" style={{ backdropFilter: 'blur(4px)', borderRadius: '20px' }}>
              <i className="fas fa-building me-2 text-white"></i>
              <span className="text-white">{companies.length} Active Companies</span>
            </div>
            <div className="badge bg-white bg-opacity-25 px-4 py-2" style={{ backdropFilter: 'blur(4px)', borderRadius: '20px' }}>
              <i className="fas fa-code me-2 text-white"></i>
              <span className="text-white">Technical Challenges</span>
            </div>
            <div className="badge bg-white bg-opacity-25 px-4 py-2" style={{ backdropFilter: 'blur(4px)', borderRadius: '20px' }}>
              <i className="fas fa-industry me-2 text-white"></i>
              <span className="text-white">{industries.length} Industries</span>
            </div>
          </div>
        </div>
        {/* Animated background elements */}
        <div className="position-absolute w-100 h-100" style={{ top: 0, left: 0, overflow: 'hidden', zIndex: 1 }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: 'translate(-50%, -50%)',
              animation: `float ${3 + i}s ease-in-out infinite`,
              opacity: 0.1
            }}></div>
          ))}
        </div>
      </div>

      <div className="container-fluid px-4 py-5" style={{ background: '#f8fafc' }}>
      {/* Filters Section */}
      <div className="text-center mb-4">
      </div>

      {/* Enhanced Filters Section */}
      <div className="row g-4 mb-5">
        <div className="col-12">
          <div className="card shadow-lg border-0" style={{ 
            borderRadius: '16px', 
            background: 'white',
            transition: 'all 0.3s ease'
          }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <i className="fas fa-filter text-primary me-2" style={{ fontSize: '1.25rem' }}></i>
                  <h5 className="card-title mb-0">Filter Companies</h5>
                </div>
                {(filters.search || filters.industry || filters.hiring_status) && (
                  <button
                    type="button"
                    className="btn btn-light btn-sm d-inline-flex align-items-center"
                    onClick={resetFilters}
                    style={{ 
                      borderRadius: '20px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <i className="fas fa-redo-alt me-2"></i>
                    Reset Filters
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSearchSubmit} className="row g-4">
                {/* Enhanced Search Input */}
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search companies..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      style={{ fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                {/* Enhanced Industry Filter */}
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <i className="fas fa-industry text-muted"></i>
                    </span>
                    <select
                      className="form-select border-start-0 ps-0"
                      value={filters.industry}
                      onChange={(e) => handleFilterChange('industry', e.target.value)}
                      style={{ fontSize: '0.95rem' }}
                    >
                      <option value="">All Industries</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Enhanced Hiring Status Filter */}
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <i className="fas fa-user-tie text-muted"></i>
                    </span>
                    <select
                      className="form-select border-start-0 ps-0"
                      value={filters.hiring_status}
                      onChange={(e) => handleFilterChange('hiring_status', e.target.value)}
                      style={{ fontSize: '0.95rem' }}
                    >
                      <option value="">All Companies</option>
                      <option value="hiring">Currently Hiring</option>
                      <option value="not_hiring">Not Hiring</option>
                    </select>
                  </div>
                </div>

                {/* Enhanced Search Button */}
                <div className="col-md-2">
                  <button 
                    type="submit" 
                    className="btn w-100 d-flex align-items-center justify-content-center"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      height: '40px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <i className="fas fa-search me-2"></i>
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading companies...</p>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="row mb-3">
            <div className="col-12">
              <p className="text-muted">
                Found <strong>{companies.length}</strong> {companies.length === 1 ? 'company' : 'companies'}
              </p>
            </div>
          </div>

          {/* Companies Grid */}
          {companies.length > 0 ? (
            <div className="row g-4">
              {companies.map((company) => (
                <div 
                  key={company.id} 
                  className="col-lg-4 col-md-6 col-sm-12 wow fadeInUp" 
                  data-wow-delay="0.1s"
                >
                  <CompanyCard company={company} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-building fa-4x text-muted mb-3"></i>
              <h4 className="text-muted">No companies found</h4>
              <p className="text-muted">
                Try adjusting your filters or search terms
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
    <Footer />
    </Fragment>
  );
};

export default CompanyList;
