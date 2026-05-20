import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* Reviews — customer submits and views their service reviews */
const Reviews = () => {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]         = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try { const res = await api.get('/reviews/my'); setReviews(res.data.data || []); }
    catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reviews', { rating: parseInt(form.rating), comment: form.comment });
      toast.success('Review submitted — thank you!');
      setModalOpen(false);
      setForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
    finally { setSubmitting(false); }
  };

  const renderStars = (n) => '⭐'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Reviews</h1>
          <p className="page-subtitle">Rate and review the Vehicle Service Center.</p>
        </div>
        <button id="write-review-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>⭐ Write a Review</button>
      </div>

      {loading ? <div className="spinner">⏳ Loading…</div> : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <p className="empty-state-text">You haven't written any reviews yet. Share your experience!</p>
        </div>
      ) : (
        <div className="form-stack">
          {reviews.map(r => (
            <div className="card card-body" key={r.id}>
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontSize: '1.25rem' }}>{renderStars(r.rating)}</span>
                <span className="text-muted text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.comment && <p style={{ color: 'var(--text-200)', fontSize: '.9375rem', lineHeight: 1.7 }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">⭐ Write a Review</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body form-stack">
                <div className="form-group">
                  <label className="form-label">Rating *</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n} type="button"
                        style={{
                          fontSize: '1.75rem', background: 'none', border: 'none',
                          cursor: 'pointer', opacity: n <= form.rating ? 1 : 0.35,
                          transition: 'opacity .15s',
                        }}
                        onClick={() => setForm(p => ({ ...p, rating: n }))}
                      >⭐</button>
                    ))}
                    <span className="text-muted" style={{ alignSelf: 'center', marginLeft: '.5rem' }}>{form.rating}/5</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Share your experience with the service center…"
                    value={form.comment}
                    onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Review'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
