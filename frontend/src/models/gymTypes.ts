/**
 * gymTypes.ts
 * Type definitions for the AlgoGym & Interactive Challenge Arena.
 */

export type GymTrackType = 'race-prediction' | 'bug-hunt' | 'procedural' | 'daily';

export type EloTier = 'Apprentice' | 'Practitioner' | 'System Architect' | 'Grandmaster';

export interface GymUserProfile {
  elo: number;
  tier: EloTier;
  streak: number;
  highestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  lastDailyDate?: string;
  completedChallengeIds: string[];
}

export interface ShowdownContender {
  name: string;
  algorithmKey: string;
  timeComplexity: string;
  spaceComplexity: string;
  color: string;
  expectedBehavior: string;
}

export interface RacePredictionChallenge {
  id: string;
  title: string;
  category: 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees';
  difficulty: 'Beginner' | 'Intermediate' | 'Hard' | 'Adversarial';
  scenarioDescription: string;
  datasetType: string;
  datasetSize: number;
  datasetPreview?: number[];
  target?: number;
  contenders: ShowdownContender[];
  correctWinner: string;
  efficiencyTrapAlgorithm?: string;
  wagerQuestion: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  postMortem: {
    theoreticalWinner: string;
    whyWinnerWon: string;
    whyLosersFailed: string;
    realWorldLesson: string;
    leetCodeRelevance: string;
  };
}

export interface BugHuntChallenge {
  id: string;
  title: string;
  category: 'sorting' | 'searching' | 'dp' | 'trees';
  difficulty: 'Intermediate' | 'Hard';
  description: string;
  language: 'typescript' | 'java' | 'python' | 'cpp';
  buggyCode: string;
  highlightLines: number[];
  options: {
    id: string;
    description: string;
    codeFix: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  buggyDataset: number[];
  buggyTarget?: number;
  expectedBugSymptom: string;
  theoreticalDeepDive: string;
}
