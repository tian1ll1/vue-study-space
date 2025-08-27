import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

export const useProgressStore = defineStore('progress', () => {
    // State
    const completedModules = ref<string[]>([])
    const currentModule = ref<string>('')
    const exerciseProgress = ref<Record<string, ExerciseProgress>>({})
    const startDate = ref<Date>(new Date())
    const lastAccessDate = ref<Date>(new Date())

    // Getters
    const totalProgress = computed(() => {
        const totalModules = 8 // Total number of learning modules
        const moduleProgress = completedModules.value.length / totalModules

        // Also consider exercise completion for more granular progress
        const totalExercises: number = Object.keys(exerciseProgress.value).length
        const completedExercises = Object.values(exerciseProgress.value)
            .filter((exercise: ExerciseProgress) => exercise.completed).length

        const exerciseProgressRatio: number = totalExercises > 0 ? completedExercises / totalExercises : 0

        // Weight modules more heavily than individual exercises
        const weightedProgress = (moduleProgress * 0.7) + (exerciseProgressRatio * 0.3)

        return Math.round(weightedProgress * 100)
    })

    const isModuleCompleted = computed(() => (moduleId: string) => {
        return completedModules.value.includes(moduleId)
    })

    const getExerciseProgress = computed(() => (exerciseId: string) => {
        return exerciseProgress.value[exerciseId] || {
            exerciseId,
            completed: false,
            attempts: 0,
            bestScore: 0,
            timeSpent: 0
        }
    })

    const totalExercisesCompleted = computed(() => {
        return Object.values(exerciseProgress.value).filter(exercise => exercise.completed).length
    })

    const averageScore = computed(() => {
        const completedExercises = Object.values(exerciseProgress.value)
            .filter(exercise => exercise.completed)

        if (completedExercises.length === 0) return 0

        const totalScore = completedExercises.reduce((sum, exercise) => sum + exercise.bestScore, 0)
        return Math.round(totalScore / completedExercises.length)
    })

    const totalTimeSpent = computed(() => {
        return Object.values(exerciseProgress.value).reduce((total, exercise) => total + exercise.timeSpent, 0)
    })

    const progressStats = computed(() => ({
        modulesCompleted: completedModules.value.length,
        exercisesCompleted: totalExercisesCompleted.value,
        averageScore: averageScore.value,
        totalTimeSpent: totalTimeSpent.value,
        progressPercentage: totalProgress.value
    }))

    // Actions
    function completeModule(moduleId: string) {
        if (!completedModules.value.includes(moduleId)) {
            completedModules.value.push(moduleId)
            saveProgress()
        }
    }

    function setCurrentModule(moduleId: string) {
        currentModule.value = moduleId
        lastAccessDate.value = new Date()
        saveProgress()
    }

    function updateExerciseProgress(progress: ExerciseProgress) {
        exerciseProgress.value[progress.exerciseId] = progress
        saveProgress()
    }

    function completeExercise(exerciseId: string, score: number, timeSpent: number) {
        const existing = exerciseProgress.value[exerciseId] || {
            exerciseId,
            completed: false,
            attempts: 0,
            bestScore: 0,
            timeSpent: 0
        }

        exerciseProgress.value[exerciseId] = {
            ...existing,
            completed: true,
            attempts: existing.attempts + 1,
            bestScore: Math.max(existing.bestScore, score),
            timeSpent: existing.timeSpent + timeSpent
        }
        saveProgress()
    }

    function resetProgress() {
        completedModules.value = []
        currentModule.value = ''
        exerciseProgress.value = {}
        startDate.value = new Date()
        lastAccessDate.value = new Date()
        saveProgress()
    }

    function saveProgress() {
        try {
            const progressData: LearningProgress = {
                completedModules: completedModules.value,
                currentModule: currentModule.value,
                exerciseProgress: exerciseProgress.value,
                totalProgress: totalProgress.value,
                startDate: startDate.value,
                lastAccessDate: lastAccessDate.value
            }

            // Validate data before saving
            if (validateProgressData(progressData)) {
                localStorage.setItem('vue3-learning-progress', JSON.stringify(progressData))
            } else {
                console.warn('Invalid progress data, skipping save')
            }
        } catch (error) {
            console.error('Failed to save progress:', error)
            handleSaveError(error)
        }
    }

    function loadProgress() {
        try {
            const saved = localStorage.getItem('vue3-learning-progress')
            if (saved) {
                const progressData: LearningProgress = JSON.parse(saved)

                // Validate loaded data
                if (validateProgressData(progressData)) {
                    completedModules.value = progressData.completedModules || []
                    currentModule.value = progressData.currentModule || ''
                    exerciseProgress.value = progressData.exerciseProgress || {}
                    startDate.value = new Date(progressData.startDate) || new Date()
                    lastAccessDate.value = new Date(progressData.lastAccessDate) || new Date()
                } else {
                    console.warn('Invalid progress data found, initializing fresh progress')
                    initializeFreshProgress()
                }
            } else {
                initializeFreshProgress()
            }
        } catch (error) {
            console.error('Failed to load progress from localStorage:', error)
            initializeFreshProgress()
        }
    }

    function validateProgressData(data: any): data is LearningProgress {
        return (
            data &&
            Array.isArray(data.completedModules) &&
            typeof data.currentModule === 'string' &&
            typeof data.exerciseProgress === 'object' &&
            typeof data.totalProgress === 'number' &&
            data.startDate &&
            data.lastAccessDate
        )
    }

    function initializeFreshProgress() {
        completedModules.value = []
        currentModule.value = ''
        exerciseProgress.value = {}
        startDate.value = new Date()
        lastAccessDate.value = new Date()
    }

    function handleSaveError(error: any) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, attempting cleanup')
            // Try to clean up old data and retry
            cleanupOldProgress()
        }
    }

    function cleanupOldProgress() {
        try {
            // Keep only the most recent exercise progress (last 50 exercises)
            const exercises = Object.entries(exerciseProgress.value)
            if (exercises.length > 50) {
                const sortedExercises = exercises.sort((a, b) => {
                    // Sort by completion time (we'll use attempts as a proxy)
                    return b[1].attempts - a[1].attempts
                })

                const recentExercises = sortedExercises.slice(0, 50)
                exerciseProgress.value = Object.fromEntries(recentExercises)

                console.log(`Cleaned up ${exercises.length - 50} old exercise records`)
                saveProgress() // Retry save after cleanup
            }
        } catch (error) {
            console.error('Failed to cleanup old progress:', error)
        }
    }

    return {
        // State
        completedModules,
        currentModule,
        exerciseProgress,
        startDate,
        lastAccessDate,

        // Getters
        totalProgress,
        isModuleCompleted,
        getExerciseProgress,
        totalExercisesCompleted,
        averageScore,
        totalTimeSpent,
        progressStats,

        // Actions
        completeModule,
        setCurrentModule,
        updateExerciseProgress,
        completeExercise,
        resetProgress,
        saveProgress,
        loadProgress
    }
})