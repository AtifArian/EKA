import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArticles, getTopArticles } from '../services/api';
import ArticleTile from '../components/ArticleTile';
import Chatbot from '../components/Chatbot';
import { getResolvedImageUrl, handleImageError } from '../utils/imageHelper';

function Articles({ user }) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    keywords: '',
    sort: 'highest'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.sort]);

  useEffect(() => {
    fetchTopArticles();
  }, []);

  useEffect(() => {
    if (topArticles.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % topArticles.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [topArticles.length]);

  const fetchArticles = async () => {
    // Only show loading if we don't already have articles displayed
    if (articles.length === 0) setLoading(true);
    try {
      const data = await getArticles(filters);
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopArticles = async () => {
    try {
      const data = await getTopArticles();
      setTopArticles(data || []);
    } catch (error) {
      console.error('Error fetching top articles:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.2rem', fontWeight: '800' }}>
        Wellness Articles & Research
      </h1>

      {/* Featured Section */}
      {topArticles.length > 0 && (
        <section className="featured-section" aria-label="Featured Articles">
          <div className="featured-container">
            {topArticles.map((article, index) => {
              const coverImg = getResolvedImageUrl(article.cover_image, 'article');
              const isActive = index === currentSlide;
              return (
                <div
                  key={article.id}
                  className={`featured-card ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(`/articles/${article.id}`)}
                  role="button"
                  tabIndex={isActive ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/articles/${article.id}`);
                    }
                  }}
                  aria-label={`Featured Article: ${article.title}`}
                >
                  <div className="featured-card-layout">
                    <div className="featured-image-wrapper">
                      <img
                        src={coverImg}
                        alt={article.title || 'Featured Article'}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        onError={(e) => handleImageError(e, 'article')}
                        className="featured-image"
                      />
                      <div className="featured-pill-badge">⭐ FEATURED</div>
                    </div>
                    <div className="featured-card-body">
                      <span className="featured-kicker">Trending in Community</span>
                      <h2 className="featured-title">{article.title}</h2>
                      <p className="featured-excerpt">
                        {article.content ? article.content.substring(0, 200) + '...' : 'Explore mental wellness insights, practical guidance, and clinical perspectives.'}
                      </p>
                      <div className="featured-card-footer">
                        <div className="featured-author-chip">
                          <span>✍️ By {article.author?.username || 'EKA Expert'}</span>
                        </div>
                        <div className="featured-stats">
                          <span>👍 {article.like_count || 0} Likes</span>
                          <span>💬 {article.comment_count || 0} Comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Slider Navigation */}
            {topArticles.length > 1 && (
              <>
                <button
                  className="featured-nav-btn prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev - 1 + topArticles.length) % topArticles.length);
                  }}
                  aria-label="Previous featured article"
                >
                  ‹
                </button>
                <button
                  className="featured-nav-btn next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev + 1) % topArticles.length);
                  }}
                  aria-label="Next featured article"
                >
                  ›
                </button>
                <div className="featured-dots">
                  {topArticles.map((_, idx) => (
                    <button
                      key={idx}
                      className={`featured-dot ${idx === currentSlide ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Search & Filter Bar */}
      <div className="search-filter-bar" style={{
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '20px',
        padding: '1.25rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          name="search"
          placeholder="Search articles by title or keywords..."
          value={filters.search}
          onChange={handleFilterChange}
          className="search-input"
          style={{
            flex: 1,
            minWidth: '220px',
            padding: '0.85rem 1.25rem',
            fontSize: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            outline: 'none',
            background: 'rgba(255, 255, 255, 0.4)',
            color: '#1f2937'
          }}
        />
        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          className="sort-select"
          style={{
            padding: '0.85rem 1.25rem',
            fontSize: '0.95rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.4)',
            color: '#1f2937',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <option value="highest">Sort: Most Liked</option>
          <option value="lowest">Sort: Least Liked</option>
        </select>
      </div>

      {loading && articles.length === 0 ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="skeleton-card" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          color: '#1f2937'
        }}>
          <h3>No articles found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="article-grid">
          {articles.map((article) => (
            <ArticleTile key={article.id} article={article} />
          ))}
        </div>
      )}
      <Chatbot />
    </div>
  );
}

export default Articles;
