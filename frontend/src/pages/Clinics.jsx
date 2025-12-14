import React, { useState, useEffect, useCallback } from 'react';
import { getClinics, getSpecializations } from '../services/api';
import ClinicTile from '../components/ClinicTile';
import Chatbot from '../components/Chatbot';

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

  // Group clinics by specialization (already sorted by backend)
  const groupedClinics = clinics.reduce((groups, clinic) => {
    const spec = clinic.specialization || 'Other';
    if (!groups[spec]) {
      groups[spec] = [];
    }
    groups[spec].push(clinic);
    return groups;
  }, {});

  const API_BASE = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://127.0.0.1:5050';

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '20px', 
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <input
          type="text"
          name="search"
          placeholder="Search by name..."
          value={filters.search}
          onChange={handleFilterChange}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            outline: 'none',
            background: 'rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#1f2937'
          }}
        />
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <select
            name="specialization"
            value={filters.specialization}
            onChange={handleFilterChange}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#1f2937',
              cursor: 'pointer'
            }}
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
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#1f2937',
              cursor: 'pointer'
            }}
          >
            <option value="highest">Sorted by: Highest Reviews</option>
            <option value="lowest">Sorted by: Lowest Reviews</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading clinics...</div>
      ) : filters.specialization ? (
        // Show filtered results as grid when a specific specialization is selected
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {clinics.map(clinic => {
            const profilePictureUrl = clinic.user.profile_picture 
              ? `${API_BASE.replace('/api', '')}${clinic.user.profile_picture}`
              : 'https://via.placeholder.com/200x200?text=Doctor';
            
            return (
              <div
                key={clinic.id}
                onClick={() => window.location.href = `/clinics/${clinic.id}`}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                }}
              >
                <img
                  src={profilePictureUrl}
                  alt={clinic.user.full_name}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '1rem',
                    border: '4px solid #f0f0f0'
                  }}
                />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                  {clinic.user.full_name || clinic.user.username}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                  ⭐ {(clinic.average_rating || 0).toFixed(1)}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        // Show grouped by specialization
        Object.entries(groupedClinics).map(([specialization, clinicsInGroup]) => (
          <div key={specialization} style={{ marginBottom: '3rem' }}>
            <h2 style={{ 
              color: 'white', 
              marginBottom: '1.5rem',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Category: {specialization}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '2rem'
            }}>
              {clinicsInGroup.map(clinic => {
                const profilePictureUrl = clinic.user.profile_picture 
                  ? `${API_BASE.replace('/api', '')}${clinic.user.profile_picture}`
                  : 'https://via.placeholder.com/200x200?text=Doctor';
                
                return (
                  <div
                    key={clinic.id}
                    onClick={() => window.location.href = `/clinics/${clinic.id}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '20px',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 40px rgba(0, 0, 0, 0.15)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    }}
                  >
                    <img
                      src={profilePictureUrl}
                      alt={clinic.user.full_name}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: '1rem',
                        border: '4px solid #f0f0f0'
                      }}
                    />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                      {clinic.user.full_name || clinic.user.username}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                      ⭐ {(clinic.average_rating || 0).toFixed(1)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {!loading && clinics.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          color: '#1f2937'
        }}>
          <h3>No clinics found</h3>
          <p>Try adjusting your search filters</p>
        </div>
      )}
      <Chatbot />
    </div>
  );
}

export default Clinics;
