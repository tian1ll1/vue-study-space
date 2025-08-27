// Learning-specific types for better organization

export interface LearningObjective {
    id: string
    title: string
    description: string
    completed: boolean
}

export interface LearningPath {
    id: string
    name: string
    description: string
    modules: string[] // module IDs in order
    estimatedTotalTime: number
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    prerequisites: string[]
}

export interface QuizQuestion {
    id: string
    question: string
    type: 'multiple-choice' | 'code-completion' | 'true-false' | 'fill-blank'
    options?: string[]
    correctAnswer: string | string[]
    explanation: string
    difficulty: 'easy' | 'medium' | 'hard'
    tags: string[]
}

export interface Quiz {
    id: string
    moduleId: string
    title: string
    description: string
    questions: QuizQuestion[]
    timeLimit?: number // in minutes
    passingScore: number // percentage
}

export interface QuizResult {
    quizId: string
    score: number
    totalQuestions: number
    correctAnswers: number
    timeSpent: number
    answers: Record<string, string | string[]>
    passed: boolean
    completedAt: Date
}

export interface LearningGoal {
    id: string
    title: string
    description: string
    targetDate: Date
    progress: number // 0-100
    milestones: LearningMilestone[]
    createdAt: Date
}

export interface LearningMilestone {
    id: string
    title: string
    description: string
    completed: boolean
    completedAt?: Date
    requiredModules: string[]
}

export interface StudyPlan {
    id: string
    userId: string
    name: string
    description: string
    startDate: Date
    endDate: Date
    dailyTimeGoal: number // minutes per day
    weeklyGoals: string[]
    modules: string[]
    progress: number
    createdAt: Date
    updatedAt: Date
}

export interface LearningRecommendation {
    type: 'next-module' | 'review' | 'practice' | 'challenge'
    title: string
    description: string
    moduleId?: string
    exerciseId?: string
    reason: string
    priority: 'low' | 'medium' | 'high'
    estimatedTime: number
}

export interface LearningStreak {
    currentStreak: number
    longestStreak: number
    lastActivityDate: Date
    streakStartDate: Date
    totalActiveDays: number
}

export interface SkillAssessment {
    skill: string
    level: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert'
    confidence: number // 1-10
    lastAssessed: Date
    evidence: string[] // completed exercises, projects, etc.
}

export interface LearningCertificate {
    id: string
    userId: string
    moduleId: string
    title: string
    description: string
    issuedAt: Date
    validUntil?: Date
    skills: string[]
    verificationCode: string
}