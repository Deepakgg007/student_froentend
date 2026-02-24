import React, { useState, useEffect, Fragment } from 'react';
import { getCompanies } from '../../services/api';
import CompanyCard from '../../component/cards/CompanyCard';
import Swal from 'sweetalert2';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [industries, setIndustries] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination states - now using backend pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    hiring_status: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCompanies();
  }, [filters, currentPage]);

  useEffect(() => {
    fetchIndustries();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Calculate total pages based on total items from backend
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Pagination component
  const Pagination = () => {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalItems === 0) return null;

    return (
      <div className="mt-4">
        {/* Page Info */}
        <div className="text-center mb-3">
          <p className="text-muted mb-0">
            Showing <strong>{startIndex}-{endIndex}</strong> of <strong>{totalItems}</strong> companies
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </p>
        </div>

        {/* Pagination Controls - Only show if more than 1 page */}
        {totalPages > 1 && (
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
              </li>

              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show first page, last page, and pages around current page
                const showPage =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                if (!showPage) {
                  // Show ellipsis for skipped pages
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <li key={pageNum} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                  }
                  return null;
                }

                return (
                  <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        background: currentPage === pageNum
                          ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                          : 'white',
                        borderColor: currentPage === pageNum ? '#6366f1' : '#dee2e6',
                        color: currentPage === pageNum ? 'white' : '#6366f1',
                        fontWeight: currentPage === pageNum ? 'bold' : 'normal',
                        minWidth: '40px',
                      }}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    );
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {
        is_active: filters.is_active,
        page: currentPage,
        page_size: itemsPerPage,
      };
      if (filters.search) params.search = filters.search;
      if (filters.industry && filters.industry.trim() !== '') params.industry = filters.industry;
      if (filters.hiring_status === 'hiring') params.is_hiring = true;
      else if (filters.hiring_status === 'not_hiring') params.is_hiring = false;

      const response = await getCompanies(params);

      // Handle paginated response
      if (response.data?.count !== undefined) {
        // Backend paginated response
        const companiesData = response.data?.results || [];
        setCompanies(companiesData);
        setTotalItems(response.data.count);
      } else {
        // Fallback for non-paginated response
        const companiesData = Array.isArray(response.data)
          ? response.data
          : response.data?.results || response.data?.data || [];
        setCompanies(companiesData);
        setTotalItems(companiesData.length);
      }
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

      <div
        className="page-header-content text-center position-relative overflow-hidden"
        style={{
          paddingTop: '85px',
          paddingBottom: '60px',
        }}
      >
      </div>

      {/* 🟢 Mobile Filter Header (on top like JobList) */}
      <div className="container-fluid d-md-none px-3" style={{ background: '#f8fafc' }}>
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

      {/* Company Results Section */}
      <div className="container-fluid px-4 pb-5" style={{ background: '#f8fafc' }}>
        {loading ? (
          <div className="row g-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="text-center mb-3">
                      <div className="skeleton-line rounded-circle mx-auto" style={{ width: '80px', height: '80px' }}></div>
                    </div>
                    <div className="skeleton-line mx-auto mb-2" style={{ width: '70%', height: '20px' }}></div>
                    <div className="skeleton-line mx-auto mb-3" style={{ width: '50%', height: '16px' }}></div>
                    <div className="d-flex justify-content-center gap-2 mb-3">
                      <div className="skeleton-line rounded" style={{ width: '60px', height: '20px' }}></div>
                      <div className="skeleton-line rounded" style={{ width: '50px', height: '20px' }}></div>
                    </div>
                    <div className="skeleton-line rounded" style={{ width: '100%', height: '36px' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* All Companies Section */}
            <div>
              {companies.length > 0 ? (
                <>
                  <div className="row g-4">
                    {companies.map((company) => (
                      <div key={company.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                        <CompanyCard company={company} />
                      </div>
                    ))}
                  </div>
                  <Pagination />
                </>
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
            </div>

            {/* No companies at all */}
            {companies.length === 0 && (
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

    </Fragment>
  );
};

export default CompanyList;
