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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    hiring_status: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = { is_active: filters.is_active };
      if (filters.search) params.search = filters.search;
      if (filters.industry && filters.industry.trim() !== '') params.industry = filters.industry;
      if (filters.hiring_status === 'hiring') params.is_hiring = true;
      else if (filters.hiring_status === 'not_hiring') params.is_hiring = false;

      const response = await getCompanies(params);
      const companiesData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || response.data?.data || [];

      const filteredData = filters.industry
        ? companiesData.filter(
            (company) =>
              company.industry &&
              company.industry.toLowerCase() === filters.industry.toLowerCase()
          )
        : companiesData;

      setCompanies(filteredData);
    } catch (error) {
      console.error('Error fetching companies:', error);
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
      const response = await getCompanies({ is_active: true });
      const companiesData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || response.data?.data || [];
      const uniqueIndustries = [
        ...new Set(
          companiesData
            .map((company) => company.industry)
            .filter((industry) => industry && industry.trim())
        ),
      ];
      setIndustries(uniqueIndustries.sort());
    } catch (error) {
      console.error('Error fetching industries:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
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

      {/* 🟪 Header Section (Unchanged for Desktop) */}
      <div
        className="page-header-content text-center position-relative overflow-hidden"
        style={{
          paddingTop: '120px',
          paddingBottom: '60px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        }}
      >
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <h2 className="display-5 text-white mb-3 fw-bold">
            Explore Company Challenges
          </h2>
          <p
            className="text-white mb-4"
            style={{
              fontSize: '1.1rem',
              opacity: 0.9,
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            Take on real-world coding challenges, showcase your skills, and unlock exciting career opportunities.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <div className="badge bg-white bg-opacity-25 px-4 py-2 rounded-pill">
              <i className="fas fa-building me-2 text-white"></i>
              <span className="text-white">{companies.length} Active Companies</span>
            </div>
            <div className="badge bg-white bg-opacity-25 px-4 py-2 rounded-pill">
              <i className="fas fa-code me-2 text-white"></i>
              <span className="text-white">Technical Challenges</span>
            </div>
            <div className="badge bg-white bg-opacity-25 px-4 py-2 rounded-pill">
              <i className="fas fa-industry me-2 text-white"></i>
              <span className="text-white">{industries.length} Industries</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 Mobile Filter Header (on top like JobList) */}
      <div className="container-fluid d-md-none px-3 py-3" style={{ background: '#f8fafc' }}>
        <button
          className="btn w-100 d-flex justify-content-between align-items-center shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: 'white',
            borderRadius: '12px',
            fontWeight: '500',
          }}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <span>
            <i className="fas fa-filter me-2"></i> Filter Companies
          </span>
          <i className={`fas ${showMobileFilters ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        </button>

        {/* Animated Expand/Collapse */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showMobileFilters ? 'mt-3 max-h-screen' : 'max-h-0'
          }`}
          style={{
            transition: 'max-height 0.4s ease-in-out',
          }}
        >
          {showMobileFilters && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <form onSubmit={handleSearchSubmit} className="row g-3">
                  <div className="col-12">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search companies..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>

                  <div className="col-10">
                    <select
                      className="form-select"
                      value={filters.industry}
                      onChange={(e) => handleFilterChange('industry', e.target.value)}
                    >
                      <option value="">All Industries</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-10">
                    <select
                      className="form-select"
                      value={filters.hiring_status}
                      onChange={(e) => handleFilterChange('hiring_status', e.target.value)}
                    >
                      <option value="">All Companies</option>
                      <option value="hiring">Currently Hiring</option>
                      <option value="not_hiring">Not Hiring</option>
                    </select>
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary flex-grow-1"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        border: 'none',
                      }}
                    >
                      <i className="fas fa-search me-2"></i>Search
                    </button>
                    {(filters.search || filters.industry || filters.hiring_status) && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={resetFilters}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🟣 Desktop Filters - unchanged */}
      <div className="container-fluid px-4 py-5 d-none d-md-block" style={{ background: '#f8fafc' }}>
        <div className="card shadow-lg border-0">
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
                  }}
                >
                  <i className="fas fa-redo-alt me-2"></i>
                  Reset
                </button>
              )}
            </div>

            {/* Desktop form same as before */}
            <form onSubmit={handleSearchSubmit} className="row g-4">
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
                  />
                </div>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filters.industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                >
                  <option value="">All Industries</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filters.hiring_status}
                  onChange={(e) => handleFilterChange('hiring_status', e.target.value)}
                >
                  <option value="">All Companies</option>
                  <option value="hiring">Currently Hiring</option>
                  <option value="not_hiring">Not Hiring</option>
                </select>
              </div>

              <div className="col-md-2">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    border: 'none',
                  }}
                >
                  <i className="fas fa-search me-2"></i>Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 🟡 Company Results Section (unchanged) */}
      <div className="container-fluid px-4 pb-5" style={{ background: '#f8fafc' }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-3 text-muted">Loading companies...</p>
          </div>
        ) : (
          <>
            <div className="row mb-3">
              <div className="col-12">
                <p className="text-muted">
                  Found <strong>{companies.length}</strong>{' '}
                  {companies.length === 1 ? 'company' : 'companies'}
                </p>
              </div>
            </div>

            {companies.length > 0 ? (
              <div className="row g-4">
                {companies.map((company) => (
                  <div key={company.id} className="col-lg-4 col-md-6 col-sm-12">
                    <CompanyCard company={company} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-building fa-4x text-muted mb-3"></i>
                <h4 className="text-muted">No companies found</h4>
                <p className="text-muted">Try adjusting your filters or search terms</p>
                <button className="btn btn-primary mt-3" onClick={resetFilters}>
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
