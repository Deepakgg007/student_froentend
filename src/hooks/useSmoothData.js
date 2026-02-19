import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook for smooth data loading with fade-in transitions
 * Prevents content flash by adding a smooth animation when data arrives
 *
 * @param {Function} fetchFn - The async function to fetch data
 * @param {Array} deps - Dependency array for useEffect
 * @returns {Object} { data, loading, error, ready }
 *
 * @example
 * const { data: company, loading, error, ready } = useSmoothData(
 *   () => getCompanyBySlug(slug),
 *   [slug]
 * );
 */
export const useSmoothData = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setReady(false);
        const result = await fetchFn();
        if (isMounted) {
          setData(result.data);
          setError(null);
          // Clear any existing timeout
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          // Small delay to trigger smooth transition
          timeoutRef.current = setTimeout(() => {
            if (isMounted) setReady(true);
          }, 50);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setReady(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, deps);

  return { data, loading, error, ready };
};

/**
 * Hook for multiple parallel data fetches with smooth transitions
 *
 * @param {Object} fetchFns - Object with fetch functions
 * @param {Array} deps - Dependency array
 * @returns {Object} Object with all data states
 *
 * @example
 * const { company, concepts, jobs, loading, ready } = useSmoothDataParallel({
 *   company: () => getCompanyBySlug(slug),
 *   concepts: () => getCompanyConcepts(slug),
 *   jobs: () => getCompanyJobs(companyId),
 * }, [slug, companyId]);
 */
export const useSmoothDataParallel = (fetchFns, deps = []) => {
  const [dataStates, setDataStates] = useState(
    () => Object.keys(fetchFns).reduce((acc, key) => ({ ...acc, [key]: null }), {})
  );
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(
    () => Object.keys(fetchFns).reduce((acc, key) => ({ ...acc, [key]: null }), {})
  );
  const [ready, setReady] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setReady(false);

        const entries = Object.entries(fetchFns);
        const results = await Promise.allSettled(
          entries.map(([, fn]) => fn())
        );

        if (isMounted) {
          const newData = {};
          const newErrors = {};

          results.forEach((result, index) => {
            const key = entries[index][0];
            if (result.status === 'fulfilled') {
              newData[key] = result.value.data;
            } else {
              newErrors[key] = result.reason;
            }
          });

          setDataStates(prev => ({ ...prev, ...newData }));
          setErrors(prev => ({ ...prev, ...newErrors }));

          // Trigger smooth transition
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (isMounted) setReady(true);
          }, 50);
        }
      } catch (err) {
        if (isMounted) {
          setErrors(prev => ({ ...prev, general: err }));
          setReady(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, deps);

  return {
    ...dataStates,
    loading,
    errors,
    ready
  };
};
