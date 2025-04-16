import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './ReviewSection.css';

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);
  const { url, token } = useContext(StoreContext);

  // Calculează ratingul mediu și alte statistici
  const reviewStats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;
    
    return {
      averageRating: Math.round(average * 10) / 10, // Rotunjește la o zecimală
      reviewCount: reviews.length
    };
  }, [reviews]);

  // Obține informațiile utilizatorului curent
  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const response = await axios.get(`${url}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success && response.data.user) {
            setUserData(response.data.user);
          }
        } catch (error) {
          console.error('Eroare la obținerea datelor utilizatorului:', error);
        }
      }
    };

    fetchUserData();
  }, [token, url]);

  // Încarcă recenziile pentru produs
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/reviews/product/${productId}`);
        setReviews(response.data.data || []);
      } catch (error) {
        console.error('Eroare la încărcarea recenziilor:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId, url]);

  // Gestionează schimbarea ratingului
  const handleRatingChange = (newRating) => {
    setUserReview({ ...userReview, rating: newRating });
  };

  // Gestionează schimbarea comentariului
  const handleCommentChange = (e) => {
    setUserReview({ ...userReview, comment: e.target.value });
  };

  // Trimite recenzia
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Verifică dacă utilizatorul este autentificat
    if (!token || !userData) {
      setError('Trebuie să fiți autentificat pentru a adăuga o recenzie.');
      return;
    }
    
    // Verifică dacă comentariul nu este gol
    if (!userReview.comment.trim()) {
      setError('Vă rugăm să adăugați un comentariu.');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      
      const response = await axios.post(
        `${url}/api/reviews`, 
        {
          productId,
          rating: userReview.rating,
          comment: userReview.comment
        },
        {
          headers: { 'auth-token': token }
        }
      );
      
      if (response.data.success) {
        // Adaugă noua recenzie la lista sau actualizează cea existentă
        const existingReviewIndex = reviews.findIndex(
          review => review.userId === response.data.data.userId
        );
        
        if (existingReviewIndex !== -1) {
          // Actualizează recenzia existentă
          const updatedReviews = [...reviews];
          updatedReviews[existingReviewIndex] = response.data.data;
          setReviews(updatedReviews);
        } else {
          // Adaugă noua recenzie
          setReviews(prevReviews => [response.data.data, ...prevReviews]);
        }
        
        // Resetează formularul
        setUserReview({ rating: 5, comment: '' });
        setSuccess('Recenzia dvs. a fost adăugată cu succes!');
      }
    } catch (error) {
      console.error('Eroare la adăugarea recenziei:', error);
      setError(error.response?.data?.message || 'A apărut o eroare la adăugarea recenziei.');
    }
  };

  // Șterge o recenzie
  const handleDeleteReview = async (reviewId) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await axios.delete(
        `${url}/api/reviews/${reviewId}`,
        {
          headers: { 'auth-token': token }
        }
      );
      
      if (response.data.success) {
        // Elimină recenzia din lista
        setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
        setSuccess('Recenzia a fost ștearsă cu succes!');
      }
    } catch (error) {
      console.error('Eroare la ștergerea recenziei:', error);
      setError(error.response?.data?.message || 'A apărut o eroare la ștergerea recenziei.');
    }
  };

  // Verifică dacă utilizatorul a adăugat deja o recenzie
  const userHasReviewed = userData && reviews.some(review => review.userId === userData._id);
  
  // Obține recenzia utilizatorului curent (dacă există)
  const currentUserReview = userData ? reviews.find(review => review.userId === userData._id) : null;

  // Funcție pentru a afișa ratingul ca stele
  const renderStars = (rating, size = 'normal') => {
    const starClass = size === 'large' ? 'star large' : 'star';
    return (
      [...Array(5)].map((_, index) => (
        <span 
          key={index} 
          className={`${starClass} ${index < rating ? 'filled' : ''}`}
        >
          ★
        </span>
      ))
    );
  };

  return (
    <div className="review-section">
      <h2>Recenzii</h2>
      
      {/* Ratingul mediu */}
      {!loading && reviews.length > 0 && (
        <div className="average-rating">
          <div className="average-rating-value">{reviewStats.averageRating}</div>
          <div className="average-rating-stars">
            {renderStars(reviewStats.averageRating, 'large')}
          </div>
          <div className="average-rating-info">
            bazat pe {reviewStats.reviewCount} {reviewStats.reviewCount === 1 ? 'recenzie' : 'recenzii'}
          </div>
        </div>
      )}
      
      {/* Formular pentru adăugarea recenziilor */}
      {token && userData && !loading && (
        <div className="review-form-container">
          <h3>{userHasReviewed ? 'Editează recenzia ta' : 'Adaugă o recenzie'}</h3>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="rating-selector">
              <span>Rating: </span>
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  className={`star ${num <= userReview.rating ? 'selected' : ''}`}
                  onClick={() => handleRatingChange(num)}
                >
                  ★
                </span>
              ))}
            </div>
            
            <div className="comment-input">
              <textarea
                placeholder="Adaugă comentariul tău aici..."
                value={userReview.comment}
                onChange={handleCommentChange}
                rows="4"
              />
            </div>
            
            <button type="submit" className="submit-review-button">
              {userHasReviewed ? 'Actualizează recenzia' : 'Adaugă recenzia'}
            </button>
            
            {userHasReviewed && (
              <button
                type="button"
                className="delete-review-button"
                onClick={() => handleDeleteReview(currentUserReview._id)}
              >
                Șterge recenzia
              </button>
            )}
          </form>
        </div>
      )}
      
      {!token && (
        <div className="login-prompt">
          <p>Trebuie să fii autentificat pentru a adăuga o recenzie.</p>
        </div>
      )}
      
      {/* Listă de recenzii */}
      <div className="reviews-list">
        {loading ? (
          <p>Se încarcă recenziile...</p>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="user-info">
                  <span className="review-author">{review.userName}</span>
                  <span className="review-date">
                    {new Date(review.date).toLocaleDateString('ro-RO')}
                  </span>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              <div className="review-comment">{review.comment}</div>
            </div>
          ))
        ) : (
          <p className="no-reviews">Nu există încă recenzii pentru acest produs.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection; 