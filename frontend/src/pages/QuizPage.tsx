import React, { useState, useMemo } from 'react';
import { Award, Flame, CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles, BookOpen, Layers, Zap, Trophy, ShieldCheck } from 'lucide-react';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/quizQuestions';
import { useAudio } from '../context/AudioContext';

interface QuizPageProps {
  onNavigateArena?: (arena: string) => void;
}

export function QuizPage({ onNavigateArena }: QuizPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, { optionId: string; isCorrect: boolean }>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const { play } = useAudio();

  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return QUIZ_QUESTIONS;
    return QUIZ_QUESTIONS.filter((q) => q.category === selectedCategory);
  }, [selectedCategory]);

  const currentQuestion: QuizQuestion | undefined = filteredQuestions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted || !currentQuestion) return;

    setSelectedOptionId(optionId);
    setIsAnswerSubmitted(true);

    const chosenOption = currentQuestion.options.find((o) => o.id === optionId);
    const isCorrect = chosenOption?.isCorrect ?? false;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { optionId, isCorrect },
    }));

    if (isCorrect) {
      play('winner');
      const streakBonus = streak * 50;
      const points = 100 + streakBonus;
      setScore((prev) => prev + points);
      setStreak((prev) => {
        const nextStreak = prev + 1;
        if (nextStreak > maxStreak) setMaxStreak(nextStreak);
        return nextStreak;
      });
    } else {
      play('searchMiss');
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    play('click');
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    play('click');
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setUserAnswers({});
    setIsQuizCompleted(false);
  };

  // Performance tier calculator
  const totalAnswered = Object.keys(userAnswers).length;
  const correctCount = Object.values(userAnswers).filter((a) => a.isCorrect).length;
  const accuracyPercent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  let tierBadge = { title: 'Apprentice Algorithmist', rank: 'Tier 3', color: '#94a3b8', icon: ShieldCheck };
  if (accuracyPercent === 100 && totalAnswered >= 3) {
    tierBadge = { title: 'S-Tier Algorithm Grandmaster', rank: 'S-Tier', color: '#f59e0b', icon: Trophy };
  } else if (accuracyPercent >= 80) {
    tierBadge = { title: 'A-Tier System Architect', rank: 'A-Tier', color: '#38bdf8', icon: Zap };
  } else if (accuracyPercent >= 60) {
    tierBadge = { title: 'B-Tier Algorithm Practitioner', rank: 'B-Tier', color: '#10b981', icon: Award };
  }

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'sorting', label: 'Sorting' },
    { id: 'searching', label: 'Searching' },
    { id: 'pathfinding', label: 'Pathfinding' },
    { id: 'trees', label: 'Trees & BST' },
    { id: 'dp', label: 'Dynamic Programming' },
  ];

  return (
    <main className="page quiz-page-container" style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>LeetCode Diagnostic Quiz Arena</h1>
            <span className="worker-pill-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}>
              <Sparkles size={13} className="text-amber-400" />
              <span>Interview Prep</span>
            </span>
          </div>
          <p>Test your mastery of complexity, edge cases, invariants, and algorithmic trade-offs</p>
        </div>

        {/* Global Stats HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="quiz-hud-chip" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--color-border-line)' }}>
            <Flame size={18} className={streak > 0 ? 'text-amber-400' : 'text-slate-500'} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>STREAK</span>
              <strong style={{ fontSize: '1rem', color: streak > 0 ? '#fbbf24' : 'inherit' }}>{streak}🔥</strong>
            </div>
          </div>

          <div className="quiz-hud-chip" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Award size={18} className="text-indigo-400" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>SCORE</span>
              <strong style={{ fontSize: '1.1rem', color: '#a5b4fc' }}>{score.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="quiz-category-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`btn ${selectedCategory === c.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              play('click');
              setSelectedCategory(c.id);
              setCurrentIndex(0);
              setSelectedOptionId(null);
              setIsAnswerSubmitted(false);
              setIsQuizCompleted(false);
            }}
            style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {!isQuizCompleted && currentQuestion ? (
        <div className="quiz-card-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`,
                  background: 'linear-gradient(90deg, #6366f1, #38bdf8)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              Question {currentIndex + 1} of {filteredQuestions.length}
            </span>
          </div>

          {/* Question Card */}
          <div
            className="quiz-card"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(10, 15, 30, 0.9) 100%)',
              border: '1px solid var(--color-border-line)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
            }}
          >
            {/* Meta Tags */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-primary uppercase-text" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                  {currentQuestion.category}
                </span>
                <span
                  className="badge"
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    background:
                      currentQuestion.difficulty === 'Easy'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : currentQuestion.difficulty === 'Medium'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                    color:
                      currentQuestion.difficulty === 'Easy'
                        ? '#34d399'
                        : currentQuestion.difficulty === 'Medium'
                        ? '#fbbf24'
                        : '#f87171',
                    border: '1px solid currentColor',
                  }}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>

              {currentQuestion.leetcodeReference && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <BookOpen size={13} className="text-amber-400" />
                  <span>{currentQuestion.leetcodeReference}</span>
                </div>
              )}
            </div>

            {/* Question Title & Scenario */}
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '10px' }}>
              {currentQuestion.title}
            </h2>
            <p style={{ fontSize: '0.98rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              {currentQuestion.scenario}
            </p>

            {/* Code Snippet if present */}
            {currentQuestion.codeSnippet && (
              <div
                className="quiz-code-block"
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.86rem',
                  lineHeight: 1.5,
                  overflowX: 'auto',
                  marginBottom: '24px',
                  color: '#e2e8f0',
                }}
              >
                <pre style={{ margin: 0 }}>{currentQuestion.codeSnippet}</pre>
              </div>
            )}

            {/* Options List */}
            <div className="quiz-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                let optionStyle: React.CSSProperties = {
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border-line)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  cursor: isAnswerSubmitted ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                };

                if (isAnswerSubmitted) {
                  if (opt.isCorrect) {
                    optionStyle.borderColor = '#10b981';
                    optionStyle.background = 'rgba(16, 185, 129, 0.12)';
                  } else if (isSelected && !opt.isCorrect) {
                    optionStyle.borderColor = '#ef4444';
                    optionStyle.background = 'rgba(239, 68, 68, 0.12)';
                  }
                } else if (isSelected) {
                  optionStyle.borderColor = '#6366f1';
                  optionStyle.background = 'rgba(99, 102, 241, 0.15)';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`quiz-option-btn ${isAnswerSubmitted ? 'submitted' : ''}`}
                    onClick={() => handleSelectOption(opt.id)}
                    style={optionStyle}
                    disabled={isAnswerSubmitted}
                  >
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: isAnswerSubmitted && opt.isCorrect ? '#10b981' : isAnswerSubmitted && isSelected ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {opt.id.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.92rem', color: 'var(--color-text-primary)', lineHeight: 1.4, flex: 1 }}>
                      {opt.text}
                    </span>
                    {isAnswerSubmitted && opt.isCorrect && (
                      <CheckCircle2 size={20} className="text-emerald-400" style={{ flexShrink: 0 }} />
                    )}
                    {isAnswerSubmitted && isSelected && !opt.isCorrect && (
                      <XCircle size={20} className="text-rose-400" style={{ flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation Box (Revealed after submission) */}
            {isAnswerSubmitted && (
              <div
                className="quiz-explanation-box"
                style={{
                  marginTop: '24px',
                  padding: '18px 20px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  animation: 'modalFadeIn 0.25s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#a5b4fc' }}>
                  <Sparkles size={16} />
                  <span>Technical Explanation & Deep Dive</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {currentQuestion.options.find((o) => o.id === selectedOptionId)?.explanation || currentQuestion.detailedConcept}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" className="btn btn-primary" onClick={handleNextQuestion} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span>{currentIndex + 1 < filteredQuestions.length ? 'Next Question' : 'View Results'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Completed Results Card */
        <div
          className="quiz-completion-card"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 15, 30, 0.95) 100%)',
            border: '1px solid var(--color-border-line)',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <tierBadge.icon size={42} style={{ color: tierBadge.color }} />
          </div>

          <div>
            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: tierBadge.color, border: '1px solid currentColor', fontSize: '0.8rem', padding: '4px 12px', marginBottom: '8px' }}>
              {tierBadge.rank}
            </span>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: '8px 0' }}>
              {tierBadge.title}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '0.95rem' }}>
              You completed the algorithm diagnostic assessment with exceptional analytical accuracy.
            </p>
          </div>

          {/* Results Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', maxWidth: '500px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--color-border-line)', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>ACCURACY</span>
              <h3 style={{ fontSize: '1.6rem', color: '#10b981', margin: '4px 0 0', fontWeight: 800 }}>{accuracyPercent}%</h3>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--color-border-line)', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>MAX STREAK</span>
              <h3 style={{ fontSize: '1.6rem', color: '#fbbf24', margin: '4px 0 0', fontWeight: 800 }}>{maxStreak}🔥</h3>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--color-border-line)', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>TOTAL SCORE</span>
              <h3 style={{ fontSize: '1.6rem', color: '#a5b4fc', margin: '4px 0 0', fontWeight: 800 }}>{score.toLocaleString()}</h3>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-primary" onClick={handleRestartQuiz} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={16} />
              <span>Retake Diagnostic Assessment</span>
            </button>
            {onNavigateArena && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigateArena('sorting')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Layers size={16} />
                <span>Race These Algorithms</span>
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
