import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.data.data || []);
    } catch {
      toast.error('Failed to load customer reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Calculations for summary stats
  const stats = useMemo(() => {
    if (reviews.length === 0) return { average: 0, total: 0, breakdown: [0, 0, 0, 0, 0] };

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);

    const breakdown = [0, 0, 0, 0, 0]; // Index 0 is 1 star, 4 is 5 star
    reviews.forEach((r) => {
      const idx = Math.min(Math.max(r.rating - 1, 0), 4);
      breakdown[idx]++;
    });

    return { average, total, breakdown: breakdown.reverse() }; // Return 5-star to 1-star
  }, [reviews]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.comment && r.comment.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRating = ratingFilter === 'All' || r.rating === parseInt(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, ratingFilter]);

  const renderStars = (n) => {
    return (
      <span style={{ color: '#fbbf24', fontSize: '1.25rem', letterSpacing: '2px' }}>
        {'★'.repeat(n)}
        <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>{'★'.repeat(5 - n)}</span>
      </span>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Customer Reviews</h1>
          <p className="page-subtitle">Examine service feedback, ratings, and customer profiles.</p>
        </div>
      </div>

      {loading ? (
        <div className="spinner">⏳ Loading reviews…</div>
      ) : (
        <>
          {/* Summary Panels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {/* Average Rating Card */}
            <div className="card" style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                Average Satisfaction
              </div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {stats.average} <span style={{ fontSize: '28px', color: '#fbbf24' }}>★</span>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                Based on {stats.total} ratings
              </div>
            </div>

            {/* Total Reviews Card */}
            <div className="card" style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.01)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                Total Feedback
              </div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#fff' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                Service reviews submitted
              </div>
            </div>

            {/* Rating Breakdown Card */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                Rating Distribution
              </div>
              {stats.breakdown.map((count, index) => {
                const stars = 5 - index;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                    <span style={{ width: '40px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {stars} <span style={{ color: '#fbbf24' }}>★</span>
                    </span>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#fbbf24', borderRadius: '3px' }} />
                    </div>
                    <span style={{ width: '30px', textAlign: 'right', color: 'rgba(255,255,255,0.4)' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search reviews by customer name, email, or comment…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ width: '180px' }}>
              <select
                className="form-input"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="All">All Star Ratings</option>
                <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                <option value="4">4 Stars ⭐⭐⭐⭐</option>
                <option value="3">3 Stars ⭐⭐⭐</option>
                <option value="2">2 Stars ⭐⭐</option>
                <option value="1">1 Star ⭐</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⭐</div>
              <p className="empty-state-text">No matching reviews found.</p>
            </div>
          ) : (
            <div className="form-stack">
              {filteredReviews.map((r) => (
                <div className="card" key={r.id} style={{ padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                  
                  {/* Customer details box */}
                  <div style={{
                    minWidth: '240px',
                    flex: '1 1 240px',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    paddingRight: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>
                        Customer Profile
                      </span>
                      <h4 style={{ margin: 0, fontWeight: 600, color: '#fff', fontSize: '15px' }}>{r.customerName}</h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)' }}>
                        <span style={{ fontSize: '14px' }}>📧</span>
                        <a href={`mailto:${r.customerEmail}`} style={{ color: 'var(--text-100)', textDecoration: 'none', wordBreak: 'break-all' }} className="link-hover">
                          {r.customerEmail}
                        </a>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)' }}>
                        <span style={{ fontSize: '14px' }}>📞</span>
                        <span style={{ color: 'var(--text-100)' }}>{r.customerPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review rating & comment */}
                  <div style={{ flex: '3 1 400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      {renderStars(r.rating)}
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        Submitted on {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    {r.comment ? (
                      <p style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        fontStyle: 'italic',
                        background: 'rgba(255,255,255,0.015)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        borderLeft: '3px solid #fbbf24'
                      }}>
                        "{r.comment}"
                      </p>
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0 }}>
                        No written comments provided.
                      </p>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerReviews;
