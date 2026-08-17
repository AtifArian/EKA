import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClinics, getSpecializations } from '../services/api';
import Chatbot from '../components/Chatbot';
import { getResolvedImageUrl, handleImageError } from '../utils/imageHelper';

function Clinics() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    sort: 'highest'
  });
  const [loading, setLoading] = useState(true);

  const fetchClinics = useCallback(async () => {
    if (clinics.length === 0) setLoading(true);
    try {
      const data = await getClinics(filters);
      setClinics(data || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, clinics.length]);

  const fetchSpecializations = useCallback(async () => {
    try {
      const data = await getSpecializations();
      setSpecializations(data || []);
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

  // Group clinics by specialization
  const groupedClinics = clinics.reduce((groups, clinic) => {
    const spec = clinic.specialization || 'General Wellness';
    if (!groups[spec]) {
      groups[spec] = [];
    }
    groups[spec].push(clinic);
    return groups;
  }, {});

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.2rem', fontWeight: '800' }}>
        Verified Doctors & Clinics
      </h1>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '20px', 
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <input
          type="text"
          name="search"
          placeholder="Search doctors by name..."
          value={filters.search}
          onChange={handleFilterChange}
          style={{
            width: '100%',
            padding: '0.85rem 1.25rem',
            fontSize: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            outline: 'none',
            background: 'rgba(255, 255, 255, 0.4)',
            color: '#1f2937',
            boxSizing: 'border-box'
          }}
        />
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          <select
            name="specialization"
            value={filters.specialization}
            onChange={handleFilterChange}
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.95rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.4)',
              color: '#1f2937',
              cursor: 'pointer',
              fontWeight: '600'
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
              padding: '0.65rem 1.25rem',
              fontSize: '0.95rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.4)',
              color: '#1f2937',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <option value="highest">Sorted by: Highest Reviews</option>
            <option value="lowest">Sorted by: Lowest Reviews</option>
          </select>
        </div>
      </div>

      {loading && clinics.length === 0 ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="skeleton-card" />
          ))}
        </div>
      ) : filters.specialization ? (
        // Show filtered results as grid when a specific specialization is selected
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {clinics.map(clinic => {
            const profilePic = getResolvedImageUrl(clinic.user?.profile_picture, 'doctor');
            const doctorName = clinic.user?.full_name || clinic.user?.username || 'Doctor';
            
            return (
              <div
                key={clinic.id}
                onClick={() => navigate(`/clinics/${clinic.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/clinics/${clinic.id}`);
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
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
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.15)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 30px rgba(0,0,0,0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                }}
              >
                <img
                  src={profilePic}
                  alt={doctorName}
                  loading="lazy"
                  onError={(e) => handleImageError(e, 'doctor')}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '1rem',
                    border: '4px solid rgba(255,255,255,0.6)'
                  }}
                />
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', color: '#1f2937', fontWeight: '700' }}>
                  {doctorName}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#4B5563', margin: '0 0 0.5rem 0' }}>
                  {clinic.specialization || 'Mental Health Specialist'}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>
                  ⭐ {(clinic.average_rating || 0).toFixed(1)} ({clinic.review_count || 0})
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
              fontWeight: '700'
            }}>
              {specialization}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '2rem'
            }}>
              {clinicsInGroup.map(clinic => {
                const profilePic = getResolvedImageUrl(clinic.user?.profile_picture, 'doctor');
                const doctorName = clinic.user?.full_name || clinic.user?.username || 'Doctor';
                
                return (
                  <div
                    key={clinic.id}
                    onClick={() => navigate(`/clinics/${clinic.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/clinics/${clinic.id}`);
                      }
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)',
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
                      src={profilePic}
                      alt={doctorName}
                      loading="lazy"
                      onError={(e) => handleImageError(e, 'doctor')}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: '1rem',
                        border: '4px solid rgba(255,255,255,0.6)'
                      }}
                    />
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', color: '#1f2937', fontWeight: '700' }}>
                      {doctorName}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#4B5563', margin: '0 0 0.5rem 0' }}>
                      {clinic.specialization || 'Mental Health Specialist'}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>
                      ⭐ {(clinic.average_rating || 0).toFixed(1)} ({clinic.review_count || 0})
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
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
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
