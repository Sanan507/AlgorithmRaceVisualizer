/**
 * QuizPage.tsx -> AlgoGym & Interactive Challenge Arena
 * A mature, gamified developer training ground featuring:
 * - Live Race Wagering & Multi-Lane Canvas Showdowns
 * - Spot the Bug & Visual Stress-Testing
 * - Procedural Infinite Scenarios
 * - Daily Challenges with Persistent Elo Skill Rating & Streaks
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
  Code2,
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Shuffle,
  BookOpen
} from 'lucide-react';
import {
  GymTrackType,
  GymUserProfile,
  RacePredictionChallenge,
  BugHuntChallenge,
  EloTier
} from '../models/gymTypes';
import { RACE_PREDICTION_CHALLENGES, BUG_HUNT_CHALLENGES } from '../data/gymChallenges';
import { generateProceduralChallenge } from '../utils/gymProceduralGenerator';
import {
  loadGymProfile,
  recordChallengeResult
} from '../utils/gymProfileStorage';
import { GymShowdownCanvas } from '../components/GymShowdownCanvas';
import { useAudio } from '../context/AudioContext';
import { generateDataset } from '../utils/datasetGenerator';

interface QuizPageProps {
  onNavigateArena?: (arena: string) => void;
}

export function QuizPage({ onNavigateArena }: QuizPageProps) {
  const [activeTrack, setActiveTrack] = useState<GymTrackType>('race-prediction');
  const [profile, setProfile] = useState<GymUserProfile>(() => loadGymProfile());

  // Track 1: Race Prediction State
  const [predictionIndex, setPredictionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isWagerLocked, setIsWagerLocked] = useState(false);
  const [isShowdownActive, setIsShowdownActive] = useState(false);
  const [showdownResult, setShowdownResult] = useState<{
    winner: string;
    stats: Record<string, { comparisons: number; swaps: number; timeMs: number }>;
  } | null>(null);
  const [eloDeltaNotification, setEloDeltaNotification] = useState<number | null>(null);

  // Track 2: Bug Hunt State
  const [bugHuntIndex, setBugHuntIndex] = useState(0);
  const [selectedBugFixId, setSelectedBugFixId] = useState<string | null>(null);
  const [isBugAnswerSubmitted, setIsBugAnswerSubmitted] = useState(false);

  // Track 3: Procedural Challenge State
  const [proceduralChallenge, setProceduralChallenge] = useState<RacePredictionChallenge>(() =>
    generateProceduralChallenge(Date.now())
  );
  const [proceduralOptionId, setProceduralOptionId] = useState<string | null>(null);
  const [isProceduralLocked, setIsProceduralLocked] = useState(false);
  const [isProceduralShowdownActive, setIsProceduralShowdownActive] = useState(false);

  const { play } = useAudio();

  const currentPredictionChallenge: RacePredictionChallenge =
    RACE_PREDICTION_CHALLENGES[predictionIndex % RACE_PREDICTION_CHALLENGES.length];

  const currentBugChallenge: BugHuntChallenge =
    BUG_HUNT_CHALLENGES[bugHuntIndex % BUG_HUNT_CHALLENGES.length];

  // Daily seed challenge
  const todaySeed = useMemo(() => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }, []);

  const dailyChallenge = useMemo(() => {
    return generateProceduralChallenge(todaySeed);
  }, [todaySeed]);

  // Handle Race Prediction Wager Submission
  const handleLockWager = (optionId: string) => {
    if (isWagerLocked) return;
    setSelectedOptionId(optionId);
    setIsWagerLocked(true);
    setIsShowdownActive(true);
    play('click');
  };

  // Callback when Showdown Canvas finishes
  const handleShowdownFinish = (
    winner: string,
    stats: Record<string, { comparisons: number; swaps: number; timeMs: number }>
  ) => {
    setShowdownResult({ winner, stats });
    const selectedOption = currentPredictionChallenge.options.find((o) => o.id === selectedOptionId);
    const isCorrect = selectedOption?.isCorrect ?? false;

    if (isCorrect) {
      play('winner');
    } else {
      play('searchMiss');
    }

    const { updatedProfile, eloDelta } = recordChallengeResult(
      currentPredictionChallenge.id,
      isCorrect,
      30
    );
    setProfile(updatedProfile);
    setEloDeltaNotification(eloDelta);
  };

  const handleNextPrediction = () => {
    setPredictionIndex((prev) => prev + 1);
    setSelectedOptionId(null);
    setIsWagerLocked(false);
    setIsShowdownActive(false);
    setShowdownResult(null);
    setEloDeltaNotification(null);
  };

  // Handle Bug Hunt Choice
  const handleSelectBugFix = (fixId: string) => {
    if (isBugAnswerSubmitted) return;
    setSelectedBugFixId(fixId);
    setIsBugAnswerSubmitted(true);

    const fix = currentBugChallenge.options.find((o) => o.id === fixId);
    const isCorrect = fix?.isCorrect ?? false;

    if (isCorrect) {
      play('winner');
    } else {
      play('searchMiss');
    }

    const { updatedProfile, eloDelta } = recordChallengeResult(currentBugChallenge.id, isCorrect, 35);
    setProfile(updatedProfile);
    setEloDeltaNotification(eloDelta);
  };

  const handleNextBugHunt = () => {
    setBugHuntIndex((prev) => prev + 1);
    setSelectedBugFixId(null);
    setIsBugAnswerSubmitted(false);
    setEloDeltaNotification(null);
  };

  // Handle Procedural Next
  const handleGenerateNextProcedural = () => {
    const nextSeed = Date.now() + Math.floor(Math.random() * 10000);
    setProceduralChallenge(generateProceduralChallenge(nextSeed));
    setProceduralOptionId(null);
    setIsProceduralLocked(false);
    setIsProceduralShowdownActive(false);
    setShowdownResult(null);
    setEloDeltaNotification(null);
  };

  // Dataset creation for active prediction challenge
  const activeShowdownDataset = useMemo(() => {
    if (currentPredictionChallenge.datasetPreview && currentPredictionChallenge.datasetPreview.length > 0) {
      return generateDataset(currentPredictionChallenge.datasetSize, currentPredictionChallenge.datasetType);
    }
    return generateDataset(currentPredictionChallenge.datasetSize, currentPredictionChallenge.datasetType);
  }, [currentPredictionChallenge]);

  const activeContenderKeys = useMemo(() => {
    return currentPredictionChallenge.contenders.map((c) => c.algorithmKey);
  }, [currentPredictionChallenge]);

  const eloTierIcons: Record<EloTier, string> = {
    Apprentice: '🥉',
    Practitioner: '🥈',
    'System Architect': '🥇',
    Grandmaster: '💎',
  };

  const accuracyPct = profile.totalAnswered > 0
    ? Math.round((profile.totalCorrect / profile.totalAnswered) * 100)
    : 0;

  return (
    <main className="page gym-page-container">
      {/* Page Header */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>AlgoGym & Interactive Challenge Arena</h1>
            <span className="worker-pill-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: '#6366f1', color: '#a5b4fc' }}>
              <Sparkles size={13} className="text-amber-400" />
              <span>SaaS Gamification Engine</span>
            </span>
          </div>
          <p>Sharpen algorithmic intuition through live race wagering, empirical stress tests, and bug diagnosis.</p>
        </div>

        {/* Developer Skill Profile / Elo HUD */}
        <div className="gym-hero-hud">
          <div className="gym-hud-stat-box">
            <span className="gym-hud-label">Developer Rating</span>
            <div className="gym-hud-value">
              <span className="gym-tier-icon">{eloTierIcons[profile.tier]}</span>
              <strong>{profile.elo}</strong>
              <span className="gym-tier-name">({profile.tier})</span>
            </div>
          </div>

          <div className="gym-hud-stat-box">
            <span className="gym-hud-label">Daily Streak</span>
            <div className="gym-hud-value text-amber-400">
              <Flame size={16} className="text-amber-500 animate-pulse" />
              <strong>{profile.streak}</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Best: {profile.highestStreak}</span>
            </div>
          </div>

          <div className="gym-hud-stat-box">
            <span className="gym-hud-label">Accuracy</span>
            <div className="gym-hud-value text-emerald-400">
              <TrendingUp size={16} />
              <strong>{accuracyPct}%</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>({profile.totalCorrect}/{profile.totalAnswered})</span>
            </div>
          </div>
        </div>
      </header>

      {/* Track Selection Tabs */}
      <div className="gym-track-tabs-bar">
        <button
          type="button"
          className={`gym-track-tab-btn ${activeTrack === 'race-prediction' ? 'active' : ''}`}
          onClick={() => setActiveTrack('race-prediction')}
        >
          <Trophy size={16} />
          <span>🏁 Predict the Winner</span>
        </button>

        <button
          type="button"
          className={`gym-track-tab-btn ${activeTrack === 'bug-hunt' ? 'active' : ''}`}
          onClick={() => setActiveTrack('bug-hunt')}
        >
          <Code2 size={16} />
          <span>🐛 Spot the Bug</span>
        </button>

        <button
          type="button"
          className={`gym-track-tab-btn ${activeTrack === 'procedural' ? 'active' : ''}`}
          onClick={() => setActiveTrack('procedural')}
        >
          <Shuffle size={16} />
          <span>🎲 Procedural Infinite</span>
        </button>

        <button
          type="button"
          className={`gym-track-tab-btn ${activeTrack === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTrack('daily')}
        >
          <Calendar size={16} />
          <span>📅 Daily Challenge</span>
        </button>
      </div>

      {/* =========================================================================
          TRACK 1: PREDICT THE WINNER (SHOWDOWN & LIVE WAGERING)
          ========================================================================= */}
      {activeTrack === 'race-prediction' && (
        <section className="gym-track-content">
          <div className="gym-card">
            {/* Scenario Header */}
            <div className="gym-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="gym-difficulty-badge">{currentPredictionChallenge.difficulty}</span>
                <span className="gym-category-pill">{currentPredictionChallenge.category.toUpperCase()}</span>
              </div>
              <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                Challenge {predictionIndex + 1} of {RACE_PREDICTION_CHALLENGES.length}
              </span>
            </div>

            <h2 className="gym-challenge-title">{currentPredictionChallenge.title}</h2>
            <p className="gym-challenge-desc">{currentPredictionChallenge.scenarioDescription}</p>

            {/* Contender Profiles Matrix */}
            <div className="gym-contenders-row">
              {currentPredictionChallenge.contenders.map((contender) => (
                <div key={contender.name} className="gym-contender-card" style={{ borderLeft: `3px solid ${contender.color}` }}>
                  <div className="gym-contender-name">{contender.name}</div>
                  <div className="gym-contender-complexity">
                    <span>⏱️ {contender.timeComplexity}</span>
                    <span>💾 {contender.spaceComplexity}</span>
                  </div>
                  <p className="gym-contender-behavior">{contender.expectedBehavior}</p>
                </div>
              ))}
            </div>

            {/* Wager Question & Interactive Option Selection */}
            <div className="gym-wager-section">
              <h3 className="gym-wager-prompt">
                <HelpCircle size={17} className="text-cyan-400" />
                <span>{currentPredictionChallenge.wagerQuestion}</span>
              </h3>

              <div className="gym-options-list">
                {currentPredictionChallenge.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  let optionClass = 'gym-option-btn';
                  if (isWagerLocked) {
                    if (opt.isCorrect) optionClass += ' correct';
                    else if (isSelected && !opt.isCorrect) optionClass += ' incorrect';
                    else optionClass += ' disabled';
                  } else if (isSelected) {
                    optionClass += ' selected';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isWagerLocked}
                      className={optionClass}
                      onClick={() => handleLockWager(opt.id)}
                    >
                      <div className="gym-option-radio">
                        {isWagerLocked && opt.isCorrect && <CheckCircle2 size={16} className="text-emerald-400" />}
                        {isWagerLocked && isSelected && !opt.isCorrect && <XCircle size={16} className="text-rose-400" />}
                        {!isWagerLocked && <div className={`gym-radio-circle ${isSelected ? 'checked' : ''}`} />}
                      </div>
                      <span className="gym-option-text">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Showdown Canvas Area */}
            {isShowdownActive && (
              <div className="gym-showdown-live-arena">
                <div className="gym-arena-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={15} className="text-amber-400 animate-pulse" />
                    <strong>Live Canvas Showdown Simulation</strong>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Dataset: {currentPredictionChallenge.datasetSize} elements ({currentPredictionChallenge.datasetType})
                  </span>
                </div>

                <GymShowdownCanvas
                  algorithms={activeContenderKeys}
                  dataset={activeShowdownDataset}
                  autoPlay={true}
                  onFinish={handleShowdownFinish}
                />
              </div>
            )}

            {/* Post-Showdown Telemetry & Theoretical Post-Mortem */}
            {showdownResult && (
              <div className="gym-postmortem-container">
                <div className="gym-postmortem-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} className="text-amber-400" />
                    <h4>Empirical Showdown Post-Mortem</h4>
                  </div>
                  {eloDeltaNotification !== null && (
                    <span className={`gym-elo-delta-badge ${eloDeltaNotification > 0 ? 'gain' : 'loss'}`}>
                      {eloDeltaNotification > 0 ? `+${eloDeltaNotification} Elo` : `${eloDeltaNotification} Elo`}
                    </span>
                  )}
                </div>

                <div className="gym-postmortem-grid">
                  <div className="gym-postmortem-card">
                    <span className="gym-pm-label">Why {currentPredictionChallenge.postMortem.theoreticalWinner} Won:</span>
                    <p>{currentPredictionChallenge.postMortem.whyWinnerWon}</p>
                  </div>
                  <div className="gym-postmortem-card">
                    <span className="gym-pm-label">Why Competitors Degraded:</span>
                    <p>{currentPredictionChallenge.postMortem.whyLosersFailed}</p>
                  </div>
                </div>

                <div className="gym-postmortem-footer">
                  <div className="gym-pm-lesson">
                    <strong>💡 Production Lesson:</strong> {currentPredictionChallenge.postMortem.realWorldLesson}
                  </div>
                  <div className="gym-pm-leetcode">
                    <strong>🎯 LeetCode Relevance:</strong> {currentPredictionChallenge.postMortem.leetCodeRelevance}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNextPrediction}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>Next Showdown</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          TRACK 2: SPOT THE BUG (CODE DIAGNOSIS)
          ========================================================================= */}
      {activeTrack === 'bug-hunt' && (
        <section className="gym-track-content">
          <div className="gym-card">
            <div className="gym-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="gym-difficulty-badge">{currentBugChallenge.difficulty}</span>
                <span className="gym-category-pill">{currentBugChallenge.category.toUpperCase()}</span>
              </div>
              <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                Bug Challenge {bugHuntIndex + 1} of {BUG_HUNT_CHALLENGES.length}
              </span>
            </div>

            <h2 className="gym-challenge-title">{currentBugChallenge.title}</h2>
            <p className="gym-challenge-desc">{currentBugChallenge.description}</p>

            {/* Code Block with Highlighted Bug Line */}
            <div className="gym-code-editor-box">
              <div className="gym-code-header">
                <span className="gym-code-lang">{currentBugChallenge.language.toUpperCase()}</span>
                <span className="gym-bug-warning">⚠️ Flawed Implementation Detected</span>
              </div>
              <pre className="gym-code-pre">
                <code>{currentBugChallenge.buggyCode}</code>
              </pre>
            </div>

            {/* Bug Fix Options */}
            <div className="gym-wager-section">
              <h3 className="gym-wager-prompt">
                <ShieldAlert size={17} className="text-rose-400" />
                <span>Select the root cause diagnosis and verified patch:</span>
              </h3>

              <div className="gym-options-list">
                {currentBugChallenge.options.map((opt) => {
                  const isSelected = selectedBugFixId === opt.id;
                  let optionClass = 'gym-option-btn';
                  if (isBugAnswerSubmitted) {
                    if (opt.isCorrect) optionClass += ' correct';
                    else if (isSelected && !opt.isCorrect) optionClass += ' incorrect';
                    else optionClass += ' disabled';
                  } else if (isSelected) {
                    optionClass += ' selected';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isBugAnswerSubmitted}
                      className={optionClass}
                      onClick={() => handleSelectBugFix(opt.id)}
                    >
                      <div className="gym-option-radio">
                        {isBugAnswerSubmitted && opt.isCorrect && <CheckCircle2 size={16} className="text-emerald-400" />}
                        {isBugAnswerSubmitted && isSelected && !opt.isCorrect && <XCircle size={16} className="text-rose-400" />}
                        {!isBugAnswerSubmitted && <div className={`gym-radio-circle ${isSelected ? 'checked' : ''}`} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                        <span className="gym-option-text font-bold">{opt.description}</span>
                        {isBugAnswerSubmitted && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{opt.explanation}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bug Hunt Deep Dive Post-Mortem */}
            {isBugAnswerSubmitted && (
              <div className="gym-postmortem-container">
                <div className="gym-postmortem-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={18} className="text-indigo-400" />
                    <h4>Engineering Deep Dive & Root Cause</h4>
                  </div>
                  {eloDeltaNotification !== null && (
                    <span className={`gym-elo-delta-badge ${eloDeltaNotification > 0 ? 'gain' : 'loss'}`}>
                      {eloDeltaNotification > 0 ? `+${eloDeltaNotification} Elo` : `${eloDeltaNotification} Elo`}
                    </span>
                  )}
                </div>

                <p style={{ margin: '8px 0', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
                  {currentBugChallenge.theoreticalDeepDive}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNextBugHunt}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>Next Bug Challenge</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          TRACK 3: PROCEDURAL INFINITE GENERATOR
          ========================================================================= */}
      {activeTrack === 'procedural' && (
        <section className="gym-track-content">
          <div className="gym-card">
            <div className="gym-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="gym-difficulty-badge" style={{ background: 'rgba(168, 85, 247, 0.2)', borderColor: '#a855f7', color: '#c084fc' }}>
                  PROCEDURAL
                </span>
                <span className="gym-category-pill">{proceduralChallenge.datasetType.toUpperCase()}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={handleGenerateNextProcedural}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
              >
                <Shuffle size={13} />
                <span>Reroll Random Dataset</span>
              </button>
            </div>

            <h2 className="gym-challenge-title">{proceduralChallenge.title}</h2>
            <p className="gym-challenge-desc">{proceduralChallenge.scenarioDescription}</p>

            <div className="gym-contenders-row">
              {proceduralChallenge.contenders.map((contender) => (
                <div key={contender.name} className="gym-contender-card" style={{ borderLeft: `3px solid ${contender.color}` }}>
                  <div className="gym-contender-name">{contender.name}</div>
                  <div className="gym-contender-complexity">
                    <span>⏱️ {contender.timeComplexity}</span>
                    <span>💾 {contender.spaceComplexity}</span>
                  </div>
                  <p className="gym-contender-behavior">{contender.expectedBehavior}</p>
                </div>
              ))}
            </div>

            <div className="gym-wager-section">
              <h3 className="gym-wager-prompt">
                <HelpCircle size={17} className="text-cyan-400" />
                <span>{proceduralChallenge.wagerQuestion}</span>
              </h3>

              <div className="gym-options-list">
                {proceduralChallenge.options.map((opt) => {
                  const isSelected = proceduralOptionId === opt.id;
                  let optionClass = 'gym-option-btn';
                  if (isProceduralLocked) {
                    if (opt.isCorrect) optionClass += ' correct';
                    else if (isSelected && !opt.isCorrect) optionClass += ' incorrect';
                    else optionClass += ' disabled';
                  } else if (isSelected) {
                    optionClass += ' selected';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isProceduralLocked}
                      className={optionClass}
                      onClick={() => {
                        if (isProceduralLocked) return;
                        setProceduralOptionId(opt.id);
                        setIsProceduralLocked(true);
                        setIsProceduralShowdownActive(true);
                        play('click');
                      }}
                    >
                      <div className="gym-option-radio">
                        {isProceduralLocked && opt.isCorrect && <CheckCircle2 size={16} className="text-emerald-400" />}
                        {isProceduralLocked && isSelected && !opt.isCorrect && <XCircle size={16} className="text-rose-400" />}
                        {!isProceduralLocked && <div className={`gym-radio-circle ${isSelected ? 'checked' : ''}`} />}
                      </div>
                      <span className="gym-option-text">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isProceduralShowdownActive && (
              <div className="gym-showdown-live-arena">
                <GymShowdownCanvas
                  algorithms={proceduralChallenge.contenders.map((c) => c.algorithmKey)}
                  dataset={generateDataset(proceduralChallenge.datasetSize, proceduralChallenge.datasetType)}
                  autoPlay={true}
                  onFinish={(winner) => {
                    const isCorrect = proceduralChallenge.options.find((o) => o.id === proceduralOptionId)?.isCorrect ?? false;
                    if (isCorrect) play('winner');
                    else play('searchMiss');
                    const { updatedProfile, eloDelta } = recordChallengeResult(proceduralChallenge.id, isCorrect, 25);
                    setProfile(updatedProfile);
                    setEloDeltaNotification(eloDelta);
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          TRACK 4: DAILY CHALLENGE
          ========================================================================= */}
      {activeTrack === 'daily' && (
        <section className="gym-track-content">
          <div className="gym-card">
            <div className="gym-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="gym-difficulty-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', borderColor: '#f59e0b', color: '#fbbf24' }}>
                  DAILY SHOWDOWN
                </span>
                <span className="gym-category-pill">SEED #{todaySeed}</span>
              </div>
              <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                Double Elo Reward: +50 Elo
              </span>
            </div>

            <h2 className="gym-challenge-title">{dailyChallenge.title}</h2>
            <p className="gym-challenge-desc">{dailyChallenge.scenarioDescription}</p>

            <div className="gym-contenders-row">
              {dailyChallenge.contenders.map((contender) => (
                <div key={contender.name} className="gym-contender-card" style={{ borderLeft: `3px solid ${contender.color}` }}>
                  <div className="gym-contender-name">{contender.name}</div>
                  <div className="gym-contender-complexity">
                    <span>⏱️ {contender.timeComplexity}</span>
                    <span>💾 {contender.spaceComplexity}</span>
                  </div>
                  <p className="gym-contender-behavior">{contender.expectedBehavior}</p>
                </div>
              ))}
            </div>

            <div className="gym-wager-section">
              <h3 className="gym-wager-prompt">
                <HelpCircle size={17} className="text-cyan-400" />
                <span>{dailyChallenge.wagerQuestion}</span>
              </h3>

              <div className="gym-options-list">
                {dailyChallenge.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="gym-option-btn"
                    onClick={() => {
                      play('winner');
                      const { updatedProfile, eloDelta } = recordChallengeResult(`daily-${todaySeed}`, opt.isCorrect, 50);
                      setProfile(updatedProfile);
                      setEloDeltaNotification(eloDelta);
                    }}
                  >
                    <span className="gym-option-text">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
