export enum Stage {
  Intake = 0,
  Verdict = 1,
  Structure = 2,
  DNA = 3,
  Extractables = 4,
  Playbook = 5,
  Assignment = 6,
  Review = 7,
  Library = 8
}

export interface CaseCard {
  name: string;
  platform: string;
  duration: string;
  targetAudience: string;
  learningPoints: string[];
  risks: string[];
}

export interface StructureItem {
  segment: string;
  timestamp: string;
  purpose: string;
  psychology: string;
  visualStrategy: string;
}

export interface ShotItem {
  id: number;
  timeRange: string;
  duration: string;
  visual: string;
  audio: string;
  action: string;
}

export interface EditingRule {
  rule: string;
  howTo: string;
  example: string;
}

export interface ScriptTemplate {
  hook: string;
  setup: string;
  core1: string;
  core2: string;
  twist: string;
  cta: string;
}

export interface HomeworkBrief {
  goal: string;
  constraints: string;
  rubric: {
    criteria: string;
    description: string;
    maxScore: number;
  }[];
}

export interface FeedbackItem {
  problem: string;
  solution: string;
  example: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface SuggestedShot {
  scriptSegment: string;
  visualSuggestion: string;
  shotType: string;
  reasoning: string;
}

// The complete analysis object returned by Gemini
export interface AnalysisResult {
  caseCard: CaseCard;
  verdict: {
    worthLearning: boolean;
    reasons: string[];
    alternative?: string;
  };
  structure: StructureItem[];
  dna: {
    avgShotLength: string;
    pacing: string;
    soundStrategy: string;
  };
  shotList: ShotItem[];
  sop: EditingRule[];
  scriptTemplate: ScriptTemplate;
  homework: HomeworkBrief;
}

export interface ReviewResult {
  score: number;
  feedback: string;
  revisionPlan: FeedbackItem[];
  suggestedShotList?: SuggestedShot[];
}