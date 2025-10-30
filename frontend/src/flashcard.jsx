import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import './flashcard.css';

export default function Flashcard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // รับ parameters จาก URL
  const questionsParam = searchParams.get('questions') || '10';
  const [numQuestions] = useState(parseInt(questionsParam));

  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const generateFlashcards = useCallback(async () => {
    if (!id) {
      setError('Document ID not found');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/flashcards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: id,
          num_questions: numQuestions
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFlashcards(data.flashcards);
      setCurrentCard(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError('Unable to generate flashcards - Please check if backend server is running');
    } finally {
      setLoading(false);
    }
  }, [id, numQuestions]);

  useEffect(() => {
    if (id) {
      generateFlashcards();
    }
  }, [id, generateFlashcards]);

  const flipCard = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const nextCard = useCallback(() => {
    if (currentCard < flashcards.length - 1 && !isTransitioning) {
      setDirection('next');
      setIsTransitioning(true);
      setIsFlipped(false);
      
      setTimeout(() => {
        setCurrentCard(prev => prev + 1);
        setTimeout(() => {
          setIsTransitioning(false);
          setDirection('');
        }, 50);
      }, 300);
    }
  }, [currentCard, flashcards.length, isTransitioning]);

  const prevCard = useCallback(() => {
    if (currentCard > 0 && !isTransitioning) {
      setDirection('prev');
      setIsTransitioning(true);
      setIsFlipped(false);
      
      setTimeout(() => {
        setCurrentCard(prev => prev - 1);
        setTimeout(() => {
          setIsTransitioning(false);
          setDirection('');
        }, 50);
      }, 300);
    }
  }, [currentCard, isTransitioning]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (flashcards.length === 0 || isTransitioning) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevCard();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextCard();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          flipCard();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flashcards.length, flipCard, nextCard, prevCard, isTransitioning]);

  const handleRegenerate = async () => {
    if (!id) {
      setError('Document ID not found');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/flashcards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: id,
          num_questions: numQuestions
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFlashcards(data.flashcards);
      setCurrentCard(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error regenerating flashcards:', error);
      setError('Unable to regenerate flashcards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flashcard-container page-transition">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Generating flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-container page-transition">
        <div className="error-box">
          <h2>Error Occurred</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={generateFlashcards} className="btn-generate">
              Try Again
            </button>
            {id && (
              <button onClick={() => navigate(`/document/${id}`)} className="btn-secondary">
                Back to Document
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flashcard-container page-transition">
        <div className="empty-state">
          <h1>Flashcard</h1>
          <p>No flashcards available for this document</p>
          <button onClick={generateFlashcards} className="btn-generate">
            Generate Flashcards
          </button>
          {id && (
            <button onClick={() => navigate(`/document/${id}`)} className="btn-secondary">
              Back to Document
            </button>
          )}
        </div>
      </div>
    );
  }

  const card = flashcards[currentCard];
  const progress = ((currentCard + 1) / flashcards.length) * 100;

  return (
    <div className="flashcard-container page-transition">
      <div className="flashcard-header">
        <button onClick={() => navigate(`/document/${id}`)} className="btn-back">
          Back
        </button>
        <div>
          <h1>Flashcard</h1>
          <p className="flashcard-settings">
            {numQuestions} Questions
          </p>
        </div>
        <div className="spacer"></div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="card-counter">
        Card {currentCard + 1} of {flashcards.length}
      </div>

      <div className="card-wrapper">
        <div 
          className={`card ${isFlipped ? 'flipped' : ''} ${direction ? `slide-${direction}` : ''} ${isTransitioning ? 'transitioning' : ''}`} 
          onClick={flipCard}
        >
          <div className="card-inner">
            <div className="card-front">
              <div className="card-label">Question</div>
              <div className="card-content">
                <p>{card.question}</p>
              </div>
              <div className="card-hint">Click to see answer</div>
            </div>
            <div className="card-back">
              <div className="card-label">Answer</div>
              <div className="card-content">
                <p>{card.answer}</p>
              </div>
              <div className="card-hint">Click to see question</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-controls">
        <button 
          onClick={prevCard} 
          disabled={currentCard === 0 || isTransitioning}
          className="btn-nav"
          aria-label="Previous card"
        >
          <span className="btn-text">Previous</span>
        </button>
        
        <button onClick={flipCard} className="btn-flip" disabled={isTransitioning}>
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>
        
        <button 
          onClick={nextCard} 
          disabled={currentCard === flashcards.length - 1 || isTransitioning}
          className="btn-nav"
          aria-label="Next card"
        >
          <span className="btn-text">Next</span>
        </button>
      </div>

      <div className="keyboard-hint">
        Tip: Use ← → arrows to navigate cards, and Space/Enter to flip cards
      </div>

      <div className="action-controls">
        <button onClick={handleRegenerate} className="btn-regenerate" disabled={loading}>
          {loading ? 'Generating...' : 'Regenerate'}
        </button>
      </div>
    </div>
  );
}