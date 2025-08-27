// Core Learning Progress Types
export interface ExerciseProgress {
    exerciseId: string
    completed: boolean
    attempts: number
    bestScore: number
    timeSpent: number
}

export interface LearningProgress {
    userId?: string
    completedModules: string[]
    currentModule: string
    exerciseProgress: Record<string, ExerciseProgress>
    totalProgress: number
    startDate: Date
    lastAccessDate: Date
}

// Code Example Types
export interface TestCase {
    input: any
    expectedOutput: any
    description: string
}

export interface Hint {
    level: number
    content: string
    codeSnippet?: string
}

export interface CodeExample {
    id: string
    moduleId: string
    title: string
    description: string
    tags: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    vueCode: string
    reactCode?: string
    angularCode?: string
    explanation: string
    keyPoints: string[]
}

export interface Exercise {
    id: string
    moduleId: string
    title: string
    instruction: string
    starterCode: string
    solution: string
    testCases: TestCase[]
    hints: Hint[]
    relatedConcepts: string[]
}

// Framework Comparison Types
export interface FrameworkExample {
    framework: 'vue' | 'react' | 'angular'
    code: string
    explanation: string
    keyDifferences: string[]
}

export interface ComparisonData {
    concept: string
    description: string
    examples: FrameworkExample[]
}

// Learning Module Types
export interface LearningModule {
    id: string
    path: string
    name: string
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    prerequisites: string[]
    estimatedTime: number // in minutes
    topics: string[]
    examples: CodeExample[]
    exercises: Exercise[]
    comparisons?: ComparisonData[]
}

// User Interface Types
export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto'
    language: 'zh' | 'en'
    codeTheme: 'vs-dark' | 'vs-light'
    fontSize: number
    showComparisons: boolean
    autoSave: boolean
}

export interface UserProfile {
    id?: string
    name?: string
    email?: string
    experience: {
        vue: 'none' | 'beginner' | 'intermediate' | 'advanced'
        react: 'none' | 'beginner' | 'intermediate' | 'advanced'
        angular: 'none' | 'beginner' | 'intermediate' | 'advanced'
    }
    preferences: UserPreferences
    createdAt: Date
    lastLoginAt: Date
}

// Code Editor Types
export interface CodeEditorConfig {
    language: 'javascript' | 'typescript' | 'vue' | 'html' | 'css'
    theme: 'vs-dark' | 'vs-light'
    fontSize: number
    tabSize: number
    wordWrap: boolean
    minimap: boolean
    lineNumbers: boolean
    readOnly: boolean
}

export interface CodeExecutionResult {
    success: boolean
    output?: string
    error?: string
    warnings?: string[]
    executionTime: number
}

// Learning Analytics Types
export interface LearningSession {
    id: string
    moduleId: string
    startTime: Date
    endTime?: Date
    duration: number // in seconds
    exercisesCompleted: number
    errorsEncountered: number
    hintsUsed: number
}

export interface LearningAnalytics {
    totalTimeSpent: number // in minutes
    modulesCompleted: number
    exercisesCompleted: number
    averageScore: number
    strongAreas: string[]
    improvementAreas: string[]
    learningVelocity: number // exercises per hour
    sessions: LearningSession[]
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
}

// Error Types
export interface AppError {
    code: string
    message: string
    details?: any
    timestamp: Date
}

export interface ValidationError {
    field: string
    message: string
    value?: any
}

// Component Props Types
export interface CodeEditorProps {
    modelValue: string
    language: CodeEditorConfig['language']
    theme?: CodeEditorConfig['theme']
    readonly?: boolean
    height?: string
    config?: Partial<CodeEditorConfig>
}

export interface CodePreviewProps {
    code: string
    language: 'vue' | 'javascript' | 'typescript'
    autoRun?: boolean
    showConsole?: boolean
}

export interface ProgressTrackerProps {
    moduleId: string
    showDetails?: boolean
    compact?: boolean
}

export interface ComparisonPanelProps {
    frameworks: ('vue' | 'react' | 'angular')[]
    examples: FrameworkExample[]
    activeFramework?: 'vue' | 'react' | 'angular'
}

// Event Types
export interface CodeChangeEvent {
    code: string
    language: string
    timestamp: Date
}

export interface ExerciseCompleteEvent {
    exerciseId: string
    score: number
    timeSpent: number
    hintsUsed: number
    attempts: number
}

export interface ModuleCompleteEvent {
    moduleId: string
    completionTime: Date
    totalTimeSpent: number
    exercisesCompleted: number
    averageScore: number
}

// Utility Types
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Re-export all type modules
export * from './router'
export * from './learning'
export * from './editor'