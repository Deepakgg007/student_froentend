import React from 'react';

/**
 * Reusable Skeleton Loader components
 * Use these to show a placeholder while content is loading
 */

export const SkeletonLine = ({ width = '100%', height = '16px', className = '', style = {} }) => (
  <div
    className={`skeleton-line ${className}`}
    style={{
      width,
      height,
      ...style
    }}
  />
);

export const SkeletonCard = ({ variant = 'default' }) => {
  if (variant === 'concept') {
    return (
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <SkeletonLine width="40px" height="40px" className="rounded-circle me-3" />
            <div className="flex-grow-1">
              <SkeletonLine width="70%" height="20px" className="mb-2" />
              <SkeletonLine width="40%" height="14px" />
            </div>
          </div>
          <SkeletonLine width="100%" height="14px" className="mb-2" />
          <SkeletonLine width="80%" height="14px" className="mb-3" />
          <div className="d-flex gap-2">
            <SkeletonLine width="60px" height="24px" className="rounded" />
            <SkeletonLine width="80px" height="24px" className="rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'job') {
    return (
      <div className="card shadow-sm h-100">
        <div className="card-body">
          <SkeletonLine width="60%" height="20px" className="mb-3" />
          <SkeletonLine width="40px" height="40px" className="rounded-circle mb-3" />
          <SkeletonLine width="100%" height="14px" className="mb-2" />
          <SkeletonLine width="90%" height="14px" className="mb-3" />
          <div className="d-flex gap-2 mb-3">
            <SkeletonLine width="70px" height="20px" className="rounded" />
            <SkeletonLine width="60px" height="20px" className="rounded" />
          </div>
          <SkeletonLine width="100px" height="36px" className="rounded" />
        </div>
      </div>
    );
  }

  // Default card
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <SkeletonLine width="60%" height="24px" className="mb-3" />
        <SkeletonLine width="100%" height="16px" className="mb-2" />
        <SkeletonLine width="90%" height="16px" className="mb-2" />
        <SkeletonLine width="70%" height="16px" />
      </div>
    </div>
  );
};

export const CompanyHeaderSkeleton = () => (
  <div className="card shadow-sm mb-5">
    <div className="card-body">
      <div className="row align-items-center">
        <div className="col-md-2 text-center">
          <SkeletonLine width="150px" height="150px" className="mx-auto rounded" style={{ minHeight: '150px' }} />
        </div>
        <div className="col-md-7">
          <SkeletonLine width="40%" height="32px" className="mb-3" />
          <div className="d-flex gap-2 mb-3">
            <SkeletonLine width="100px" height="28px" className="rounded" />
            <SkeletonLine width="120px" height="28px" className="rounded" />
            <SkeletonLine width="80px" height="28px" className="rounded" />
          </div>
          <SkeletonLine width="60%" height="20px" />
        </div>
        <div className="col-md-3">
          <div className="text-center">
            <SkeletonLine width="80px" height="40px" className="mx-auto mb-2" />
            <SkeletonLine width="100px" height="16px" className="mx-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 3, variant = 'default' }) => (
  <>
    {[...Array(count)].map((_, index) => (
      <SkeletonCard key={index} variant={variant} />
    ))}
  </>
);
