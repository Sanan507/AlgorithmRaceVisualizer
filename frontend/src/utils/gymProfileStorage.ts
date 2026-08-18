/**
 * gymProfileStorage.ts
 * Manages developer Elo rating, daily streak, and completed challenge records in localStorage.
 */

import { GymUserProfile, EloTier } from '../models/gymTypes';

const STORAGE_KEY = 'algorace_gym_profile_v1';

export function getEloTier(elo: number): EloTier {
  if (elo >= 2000) return 'Grandmaster';
  if (elo >= 1600) return 'System Architect';
  if (elo >= 1200) return 'Practitioner';
  return 'Apprentice';
}

const DEFAULT_PROFILE: GymUserProfile = {
  elo: 1200,
  tier: 'Practitioner',
  streak: 0,
  highestStreak: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  completedChallengeIds: [],
};

export function loadGymProfile(): GymUserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      tier: getEloTier(parsed.elo || 1200),
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveGymProfile(profile: GymUserProfile): void {
  try {
    const updated = {
      ...profile,
      tier: getEloTier(profile.elo),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist AlgoGym profile:', err);
  }
}

export function recordChallengeResult(
  challengeId: string,
  isCorrect: boolean,
  eloGain = 25
): { updatedProfile: GymUserProfile; eloDelta: number } {
  const current = loadGymProfile();
  
  const eloDelta = isCorrect
    ? eloGain + (current.streak > 0 ? Math.min(20, current.streak * 5) : 0)
    : -15;

  const nextElo = Math.max(800, current.elo + eloDelta);
  const nextStreak = isCorrect ? current.streak + 1 : 0;
  const nextHighestStreak = Math.max(current.highestStreak, nextStreak);
  
  const updatedIds = current.completedChallengeIds.includes(challengeId)
    ? current.completedChallengeIds
    : [...current.completedChallengeIds, challengeId];

  const updatedProfile: GymUserProfile = {
    ...current,
    elo: nextElo,
    tier: getEloTier(nextElo),
    streak: nextStreak,
    highestStreak: nextHighestStreak,
    totalAnswered: current.totalAnswered + 1,
    totalCorrect: current.totalCorrect + (isCorrect ? 1 : 0),
    completedChallengeIds: updatedIds,
  };

  saveGymProfile(updatedProfile);
  return { updatedProfile, eloDelta };
}
