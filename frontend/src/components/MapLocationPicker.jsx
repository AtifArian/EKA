import React, { useState, useEffect, useRef } from 'react';

function MapLocationPicker({ initialPosition, onLocationSelect }) {
  const [position, setPosition] = useState(initialPosition || { lat: 23.8103, lng: 90.4125 }); // Default: Dhaka, Bangladesh
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const initialMount = useRef(true);

  useEffect(() => {
    // Skip calling onLocationSelect on initial mount to avoid infinite loop
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    // Notify parent component when position changes (user interaction)
    if (onLocationSelect) {
      onLocationSelect(position);
    }
  }, [position]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap's geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    const newPosition = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
    setPosition(newPosition);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#333'
      }}>
        Clinic Location
      </label>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for your clinic location..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSearching ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: isSearching ? 0.6 : 1
            }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleSelectResult(result)}
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderBottom: index < searchResults.length - 1 ? '1px solid #eee' : 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                <div style={{ fontSize: '0.95rem', color: '#333' }}>
                  {result.display_name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        height: '400px',
        borderRadius: '15px',
        overflow: 'hidden',
        border: '2px solid #e0e0e0',
        marginBottom: '0.5rem'
      }}>
        <iframe
          title="Location Picker Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${position.lat},${position.lng}&zoom=14`}
          key={`${position.lat}-${position.lng}`}
        />
      </div>

      <small style={{
        display: 'block',
        color: '#666',
        fontSize: '0.85rem',
        marginTop: '0.5rem'
      }}>
        <strong>Instructions:</strong> Search for your clinic location above using the search box.
        <br />
        Selected: Latitude {position.lat.toFixed(6)}, Longitude {position.lng.toFixed(6)}
        <br />
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#667eea', textDecoration: 'none' }}
        >
          Adjust location on Google Maps →
        </a>
      </small>
    </div>
  );
}

export default MapLocationPicker;
