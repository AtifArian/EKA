import React, { useState, useEffect, useCallback } from 'react';
import { getClinics, getSpecializations } from '../services/api';
import ClinicTile from '../components/ClinicTile';

function Clinics() {
  const [clinics, setClinics] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    sort: 'highest'
  });
  const [loading, setLoading] = useState(true);

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching clinics with filters:', filters);
      const data = await getClinics(filters);
      console.log('Received clinics data:', data);
      setClinics(data);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSpecializations = useCallback(async () => {
    try {
      const data = await getSpecializations();
      setSpecializations(data);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  }, []);

  useEffect(() => {
    fetchSpecializations();
    fetchClinics();
  }, [fetchSpecializations, fetchClinics]);



  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginBottom: '2rem' }}>Find Your Therapist</h1>
      
      <div className="search-filter-bar">
        <input
          type="text"
          name="search"
          placeholder="Search by name or bio..."
          value={filters.search}
          onChange={handleFilterChange}
          className="search-input"
        />
        
        <select
          name="specialization"
          value={filters.specialization}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Specializations</option>
          {specializations.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
        
        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          className="sort-select"
        >
          <option value="highest">Highest Reviews</option>
          <option value="lowest">Lowest Reviews</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading clinics...</div>
      ) : (
        <div className="clinic-grid">
          {clinics.map(clinic => (
            <ClinicTile key={clinic.id} clinic={clinic} />
          ))}
        </div>
      )}

      {!loading && clinics.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
          <h3>No clinics found</h3>
          <p>Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
}

export default Clinics;
