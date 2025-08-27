export interface LearningModule {
    path: string
    name: string
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    prerequisites?: string[]
    estimatedTime: number // in minutes
}

declare module 'vue-router' {
    interface RouteMeta {
        title?: string
        description?: string
        difficulty?: 'beginner' | 'intermediate' | 'advanced'
        prerequisites?: string[]
        estimatedTime?: number
        requiresProgress?: boolean
    }
}