import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import ReactCountryFlag from 'react-country-flag';
import api from '../services/api';
import { CURRENCIES } from '../utils/currencies';

function Flag({ code }) {
  const countryCode = CURRENCIES[code]?.countryCode;
  if (!countryCode) return <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{code}</span>;
  return (
    <ReactCountryFlag
      countryCode={countryCode}
      svg
      style={{ width: '1.1rem', height: '1.1rem', borderRadius: '2px', flexShrink: 0 }}
      title={CURRENCIES[code]?.name}
    />
  );
}
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

const FavoritesList = forwardRef(function FavoritesList({ onSelectPair }, ref) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/favorites');
      setFavorites(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Expose fetchFavorites to parent via ref
  useImperativeHandle(ref, () => ({ fetchFavorites }), [fetchFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await api.delete(`/api/favorites/${id}`);
      setFavorites((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="sidebar-title">
        <span>★</span>
        <span>Favorites</span>
      </div>

      {loading && (
        <div className="flex-center" style={{ paddingTop: '16px' }}>
          <LoadingSpinner size="sm" />
        </div>
      )}

      {!loading && error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <div className="favorites-list">
          {favorites.length === 0 ? (
            <div className="favorites-empty">
              <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>☆</div>
              <div>No favorites yet.</div>
              <div>Star a currency pair to save it here.</div>
            </div>
          ) : (
            favorites.map((fav) => (
              <button
                key={fav._id}
                id={`favorite-${fav.from}-${fav.to}`}
                className="favorite-item"
                onClick={() => onSelectPair && onSelectPair(fav.from, fav.to)}
                title={`Select ${fav.from} → ${fav.to}`}
              >
                <span className="favorite-pair">
                  <Flag code={fav.from} /> <span>{fav.from}</span>
                  <span className="pair-arrow">→</span>
                  <Flag code={fav.to} /> <span>{fav.to}</span>
                </span>
                <button
                  id={`delete-fav-${fav._id}`}
                  className="favorite-delete"
                  onClick={(e) => handleDelete(e, fav._id)}
                  title="Remove from favorites"
                  aria-label={`Remove ${fav.from}/${fav.to} from favorites`}
                  disabled={deletingId === fav._id}
                >
                  {deletingId === fav._id
                    ? <LoadingSpinner size="sm" />
                    : '✕'}
                </button>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
});

export default FavoritesList;
