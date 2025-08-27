import { computed, ref, watch } from 'vue'
import { useProgressStore } from '@/stores/progress'
import type {
    LearningAnalytics,
    LearningSession,
    LearningStreak,
    SkillAssessment
} from '@/types'

export function useProgress() {
    const progressStore = useProgressStore()

    // Local state for current session
    const currentSession = ref<LearningSession | null>(null)
    const sessionStartTime = ref<Date | null>(null)

    // Computed properties for progress analytics
    const progressPercentage = computed(() => progressStore.totalProgress)

    const completedModulesCount = computed(() => progressStore.completedModules.length)

    const totalExercisesCompleted = computed(() => {
        return Object.values(progressStore.exerciseProgress).filter(
            exercise => exercise.completed
        ).length
    })

    const averageScore = computed(() => {
        const completedExercises = Object.values(progressStore.exerciseProgress)
            .filter(exercise => exercise.completed)

        if (completedExercises.length === 0) return 0

        const totalScore = completedExercises.reduce(
            (sum, exercise) => sum + exercise.bestScore, 0
        )
        return Math.round(totalScore / completedExercises.length)
    })

    const totalTimeSpent = computed(() => {
        return Object.values(progressStore.exerciseProgress).reduce(
            (total, exercise) => total + exercise.timeSpent, 0
        )
    })

    const learningStreak = computed((): LearningStreak => {
        const sessions = getLearningSessionsFromStorage()
        const today = new Date()
        const oneDayMs = 24 * 60 * 60 * 1000

        let currentStreak = 0
        let longestStreak = 0
        let tempStreak = 0
        let lastActivityDate = progressStore.lastAccessDate
        let streakStartDate = progressStore.startDate

        // Calculate streaks based on daily activity
        const dailyActivity = new Map<string, boolean>()

        sessions.forEach(session => {
            const dateKey = session.startTime.toDateString()
            dailyActivity.set(dateKey, true)
        })

        // Calculate current streak (working backwards from today)
        let checkDate = new Date(today)
        while (checkDate >= progressStore.startDate) {
            const dateKey = checkDate.toDateString()
            if (dailyActivity.has(dateKey)) {
                currentStreak++
                if (currentStreak === 1) {
                    streakStartDate = new Date(checkDate)
                }
            } else {
                break
            }
            checkDate = new Date(checkDate.getTime() - oneDayMs)
        }

        // Calculate longest streak
        const sortedDates = Array.from(dailyActivity.keys())
            .map(date => new Date(date))
            .sort((a, b) => a.getTime() - b.getTime())

        for (let i = 0; i < sortedDates.length; i++) {
            tempStreak = 1
            for (let j = i + 1; j < sortedDates.length; j++) {
                const daysDiff = Math.floor(
                    (sortedDates[j].getTime() - sortedDates[j - 1].getTime()) / oneDayMs
                )
                if (daysDiff === 1) {
                    tempStreak++
                } else {
                    break
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak)
        }

        return {
            currentStreak,
            longestStreak,
            lastActivityDate,
            streakStartDate,
            totalActiveDays: dailyActivity.size
        }
    })

    // Progress tracking functions
    function startLearningSession(moduleId: string) {
        const session: LearningSession = {
            id: `session-${Date.now()}`,
            moduleId,
            startTime: new Date(),
            duration: 0,
            exercisesCompleted: 0,
            errorsEncountered: 0,
            hintsUsed: 0
        }

        currentSession.value = session
        sessionStartTime.value = new Date()
        progressStore.setCurrentModule(moduleId)

        // Save session to localStorage
        saveLearningSession(session)
    }

    function endLearningSession() {
        if (currentSession.value && sessionStartTime.value) {
            const endTime = new Date()
            const duration = Math.floor(
                (endTime.getTime() - sessionStartTime.value.getTime()) / 1000
            )

            currentSession.value.endTime = endTime
            currentSession.value.duration = duration

            // Update session in storage
            updateLearningSession(currentSession.value)

            currentSession.value = null
            sessionStartTime.value = null
        }
    }

    function completeExercise(
        exerciseId: string,
        score: number,
        timeSpent: number,
        hintsUsed: number = 0
    ) {
        progressStore.completeExercise(exerciseId, score, timeSpent)

        // Update current session if active
        if (currentSession.value) {
            currentSession.value.exercisesCompleted++
            currentSession.value.hintsUsed += hintsUsed
            updateLearningSession(currentSession.value)
        }
    }

    function completeModule(moduleId: string) {
        progressStore.completeModule(moduleId)

        // End current session if it's for this module
        if (currentSession.value?.moduleId === moduleId) {
            endLearningSession()
        }
    }

    function recordError() {
        if (currentSession.value) {
            currentSession.value.errorsEncountered++
            updateLearningSession(currentSession.value)
        }
    }

    function recordHintUsed() {
        if (currentSession.value) {
            currentSession.value.hintsUsed++
            updateLearningSession(currentSession.value)
        }
    }

    // Analytics functions
    function getLearningAnalytics(): LearningAnalytics {
        const sessions = getLearningSessionsFromStorage()
        const totalTimeInMinutes = Math.round(totalTimeSpent.value / 60)

        // Calculate learning velocity (exercises per hour)
        const learningVelocity = totalTimeInMinutes > 0
            ? Math.round((totalExercisesCompleted.value / totalTimeInMinutes) * 60)
            : 0

        // Analyze strong and weak areas based on exercise performance
        const modulePerformance = new Map<string, { total: number, correct: number }>()

        Object.values(progressStore.exerciseProgress).forEach(exercise => {
            if (exercise.completed) {
                const moduleId = getModuleIdFromExerciseId(exercise.exerciseId)
                const current = modulePerformance.get(moduleId) || { total: 0, correct: 0 }
                current.total++
                if (exercise.bestScore >= 80) current.correct++
                modulePerformance.set(moduleId, current)
            }
        })

        const strongAreas: string[] = []
        const improvementAreas: string[] = []

        modulePerformance.forEach((performance, moduleId) => {
            const successRate = performance.correct / performance.total
            if (successRate >= 0.8) {
                strongAreas.push(moduleId)
            } else if (successRate < 0.6) {
                improvementAreas.push(moduleId)
            }
        })

        return {
            totalTimeSpent: totalTimeInMinutes,
            modulesCompleted: completedModulesCount.value,
            exercisesCompleted: totalExercisesCompleted.value,
            averageScore: averageScore.value,
            strongAreas,
            improvementAreas,
            learningVelocity,
            sessions
        }
    }

    function getSkillAssessment(): SkillAssessment[] {
        const analytics = getLearningAnalytics()
        const assessments: SkillAssessment[] = []

        // Vue.js skill assessment based on completed modules and performance
        const vueModules = ['basic-syntax', 'components', 'reactivity', 'composition-api']
        const completedVueModules = vueModules.filter(module =>
            progressStore.completedModules.includes(module)
        )

        let vueLevel: SkillAssessment['level'] = 'novice'
        let vueConfidence = 1

        if (completedVueModules.length >= 4 && analytics.averageScore >= 90) {
            vueLevel = 'advanced'
            vueConfidence = 9
        } else if (completedVueModules.length >= 3 && analytics.averageScore >= 80) {
            vueLevel = 'intermediate'
            vueConfidence = 7
        } else if (completedVueModules.length >= 2 && analytics.averageScore >= 70) {
            vueLevel = 'beginner'
            vueConfidence = 5
        } else if (completedVueModules.length >= 1) {
            vueLevel = 'beginner'
            vueConfidence = 3
        }

        assessments.push({
            skill: 'Vue.js',
            level: vueLevel,
            confidence: vueConfidence,
            lastAssessed: new Date(),
            evidence: completedVueModules
        })

        return assessments
    }

    // Local storage helpers with enhanced error handling
    function saveLearningSession(session: LearningSession) {
        try {
            const sessions = getLearningSessionsFromStorage()
            sessions.push(session)

            // Validate session data before saving
            if (validateLearningSession(session)) {
                localStorage.setItem('vue3-learning-sessions', JSON.stringify(sessions))
            } else {
                console.warn('Invalid session data, skipping save:', session)
            }
        } catch (error) {
            console.error('Failed to save learning session:', error)
            // Fallback: try to save without the problematic session
            handleStorageError('save-session', error)
        }
    }

    function updateLearningSession(session: LearningSession) {
        try {
            const sessions = getLearningSessionsFromStorage()
            const index = sessions.findIndex(s => s.id === session.id)
            if (index >= 0) {
                if (validateLearningSession(session)) {
                    sessions[index] = session
                    localStorage.setItem('vue3-learning-sessions', JSON.stringify(sessions))
                } else {
                    console.warn('Invalid session data, skipping update:', session)
                }
            }
        } catch (error) {
            console.error('Failed to update learning session:', error)
            handleStorageError('update-session', error)
        }
    }

    function getLearningSessionsFromStorage(): LearningSession[] {
        try {
            const stored = localStorage.getItem('vue3-learning-sessions')
            if (stored) {
                const sessions = JSON.parse(stored)
                return sessions
                    .map((session: any) => ({
                        ...session,
                        startTime: new Date(session.startTime),
                        endTime: session.endTime ? new Date(session.endTime) : undefined
                    }))
                    .filter(validateLearningSession) // Filter out invalid sessions
            }
        } catch (error) {
            console.error('Failed to load learning sessions:', error)
            handleStorageError('load-sessions', error)
        }
        return []
    }

    // Data validation helpers
    function validateLearningSession(session: any): session is LearningSession {
        return (
            session &&
            typeof session.id === 'string' &&
            typeof session.moduleId === 'string' &&
            session.startTime instanceof Date &&
            typeof session.duration === 'number' &&
            typeof session.exercisesCompleted === 'number' &&
            typeof session.errorsEncountered === 'number' &&
            typeof session.hintsUsed === 'number'
        )
    }

    // Storage error handling
    function handleStorageError(operation: string, error: any) {
        console.error(`Storage operation failed: ${operation}`, error)

        // Check if localStorage is available and has space
        if (typeof Storage === 'undefined') {
            console.warn('localStorage is not supported in this browser')
            return
        }

        try {
            // Test localStorage availability
            const testKey = 'vue3-learning-test'
            localStorage.setItem(testKey, 'test')
            localStorage.removeItem(testKey)
        } catch (e) {
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded, attempting cleanup')
                cleanupOldSessions()
            }
        }
    }

    // Cleanup old sessions to free up storage space
    function cleanupOldSessions() {
        try {
            const sessions = getLearningSessionsFromStorage()
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const recentSessions = sessions.filter(session =>
                session.startTime > thirtyDaysAgo
            )

            localStorage.setItem('vue3-learning-sessions', JSON.stringify(recentSessions))
            console.log(`Cleaned up ${sessions.length - recentSessions.length} old sessions`)
        } catch (error) {
            console.error('Failed to cleanup old sessions:', error)
        }
    }

    function getModuleIdFromExerciseId(exerciseId: string): string {
        // Extract module ID from exercise ID (assuming format: moduleId-exerciseId)
        const parts = exerciseId.split('-')
        return parts.length > 1 ? parts.slice(0, -1).join('-') : 'unknown'
    }

    // Additional progress calculation functions
    function getModuleProgress(moduleId: string): {
        completed: boolean
        exercisesCompleted: number
        totalExercises: number
        averageScore: number
        timeSpent: number
    } {
        const moduleExercises = Object.values(progressStore.exerciseProgress)
            .filter(exercise => getModuleIdFromExerciseId(exercise.exerciseId) === moduleId)

        const completedExercises = moduleExercises.filter(exercise => exercise.completed)
        const totalScore = completedExercises.reduce((sum, exercise) => sum + exercise.bestScore, 0)
        const totalTime = moduleExercises.reduce((sum, exercise) => sum + exercise.timeSpent, 0)

        return {
            completed: progressStore.isModuleCompleted(moduleId),
            exercisesCompleted: completedExercises.length,
            totalExercises: moduleExercises.length,
            averageScore: completedExercises.length > 0 ? Math.round(totalScore / completedExercises.length) : 0,
            timeSpent: totalTime
        }
    }

    function getDailyProgress(days: number = 7): Array<{
        date: Date
        exercisesCompleted: number
        timeSpent: number
        modulesCompleted: number
    }> {
        const sessions = getLearningSessionsFromStorage()
        const result: Array<{
            date: Date
            exercisesCompleted: number
            timeSpent: number
            modulesCompleted: number
        }> = []

        const today = new Date()

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)

            const nextDay = new Date(date)
            nextDay.setDate(nextDay.getDate() + 1)

            const daySessions = sessions.filter(session =>
                session.startTime >= date && session.startTime < nextDay
            )

            const exercisesCompleted = daySessions.reduce((sum, session) => sum + session.exercisesCompleted, 0)
            const timeSpent = daySessions.reduce((sum, session) => sum + session.duration, 0)

            // Count modules completed on this day (simplified - in real app would track completion timestamps)
            const modulesCompleted = new Set(daySessions.map(session => session.moduleId)).size

            result.push({
                date: new Date(date),
                exercisesCompleted,
                timeSpent,
                modulesCompleted
            })
        }

        return result
    }

    function getWeeklyStats(): {
        thisWeek: { exercises: number, time: number, modules: number }
        lastWeek: { exercises: number, time: number, modules: number }
        improvement: { exercises: number, time: number, modules: number }
    } {
        const thisWeekData = getDailyProgress(7)
        const lastWeekData = getDailyProgress(14).slice(0, 7)

        const thisWeek = {
            exercises: thisWeekData.reduce((sum, day) => sum + day.exercisesCompleted, 0),
            time: thisWeekData.reduce((sum, day) => sum + day.timeSpent, 0),
            modules: thisWeekData.reduce((sum, day) => sum + day.modulesCompleted, 0)
        }

        const lastWeek = {
            exercises: lastWeekData.reduce((sum, day) => sum + day.exercisesCompleted, 0),
            time: lastWeekData.reduce((sum, day) => sum + day.timeSpent, 0),
            modules: lastWeekData.reduce((sum, day) => sum + day.modulesCompleted, 0)
        }

        const improvement = {
            exercises: thisWeek.exercises - lastWeek.exercises,
            time: thisWeek.time - lastWeek.time,
            modules: thisWeek.modules - lastWeek.modules
        }

        return { thisWeek, lastWeek, improvement }
    }

    function exportProgressData(): string {
        const progressData = {
            progress: {
                completedModules: progressStore.completedModules,
                currentModule: progressStore.currentModule,
                exerciseProgress: progressStore.exerciseProgress,
                totalProgress: progressStore.totalProgress,
                startDate: progressStore.startDate,
                lastAccessDate: progressStore.lastAccessDate
            },
            sessions: getLearningSessionsFromStorage(),
            analytics: getLearningAnalytics(),
            exportDate: new Date()
        }

        return JSON.stringify(progressData, null, 2)
    }

    function importProgressData(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData)

            if (data.progress && data.sessions) {
                // Validate and import progress data
                progressStore.completedModules = data.progress.completedModules || []
                progressStore.currentModule = data.progress.currentModule || ''
                progressStore.exerciseProgress = data.progress.exerciseProgress || {}
                progressStore.startDate = new Date(data.progress.startDate) || new Date()
                progressStore.lastAccessDate = new Date(data.progress.lastAccessDate) || new Date()

                // Import sessions
                localStorage.setItem('vue3-learning-sessions', JSON.stringify(data.sessions))

                // Save the imported progress
                progressStore.saveProgress()

                return true
            }
        } catch (error) {
            console.error('Failed to import progress data:', error)
        }
        return false
    }

    // Initialize progress on first use
    function initializeProgress() {
        progressStore.loadProgress()
    }

    // Auto-save progress when data changes
    watch(
        () => [
            progressStore.completedModules,
            progressStore.currentModule,
            progressStore.exerciseProgress
        ],
        () => {
            progressStore.saveProgress()
        },
        { deep: true }
    )

    return {
        // State
        currentSession: computed(() => currentSession.value),

        // Computed analytics
        progressPercentage,
        completedModulesCount,
        totalExercisesCompleted,
        averageScore,
        totalTimeSpent,
        learningStreak,

        // Actions
        startLearningSession,
        endLearningSession,
        completeExercise,
        completeModule,
        recordError,
        recordHintUsed,

        // Analytics
        getLearningAnalytics,
        getSkillAssessment,
        getModuleProgress,
        getDailyProgress,
        getWeeklyStats,

        // Data management
        exportProgressData,
        importProgressData,

        // Utilities
        initializeProgress,

        // Store access
        isModuleCompleted: progressStore.isModuleCompleted,
        getExerciseProgress: progressStore.getExerciseProgress,
        resetProgress: progressStore.resetProgress
    }
}