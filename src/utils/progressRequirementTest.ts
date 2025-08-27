// Test specifically for task 3.3 requirements
import { useProgress } from '@/composables/useProgress'
import { useProgressStore } from '@/stores/progress'

export interface RequirementTestResult {
    requirement: string
    description: string
    status: 'pass' | 'fail'
    message: string
    evidence: any
}

export function testTask3_3Requirements(): RequirementTestResult[] {
    const results: RequirementTestResult[] = []

    // Test Requirement: 创建useProgress组合式函数
    results.push(testUseProgressComposable())

    // Test Requirement: 实现本地存储的进度保存和恢复
    results.push(testLocalStoragePersistence())

    // Test Requirement: 添加进度计算和统计逻辑
    results.push(testProgressCalculationLogic())

    return results
}

function testUseProgressComposable(): RequirementTestResult {
    try {
        const progress = useProgress()

        // Check if all required functions exist
        const requiredFunctions = [
            'startLearningSession',
            'endLearningSession',
            'completeExercise',
            'completeModule',
            'getLearningAnalytics',
            'exportProgressData',
            'importProgressData',
            'initializeProgress'
        ]

        const requiredComputedProperties = [
            'progressPercentage',
            'completedModulesCount',
            'totalExercisesCompleted',
            'averageScore',
            'totalTimeSpent',
            'learningStreak'
        ]

        const missingFunctions = requiredFunctions.filter(fn =>
            typeof (progress as any)[fn] !== 'function'
        )

        const missingProperties = requiredComputedProperties.filter(prop =>
            (progress as any)[prop] === undefined
        )

        const allPresent = missingFunctions.length === 0 && missingProperties.length === 0

        return {
            requirement: '创建useProgress组合式函数',
            description: 'useProgress composable should provide all required functions and computed properties',
            status: allPresent ? 'pass' : 'fail',
            message: allPresent
                ? 'useProgress composable created with all required functionality'
                : `Missing: functions [${missingFunctions.join(', ')}], properties [${missingProperties.join(', ')}]`,
            evidence: {
                requiredFunctions,
                requiredComputedProperties,
                missingFunctions,
                missingProperties,
                availableFunctions: Object.keys(progress).filter(key => typeof (progress as any)[key] === 'function'),
                availableProperties: Object.keys(progress).filter(key => typeof (progress as any)[key] !== 'function')
            }
        }
    } catch (error) {
        return {
            requirement: '创建useProgress组合式函数',
            description: 'useProgress composable should provide all required functions and computed properties',
            status: 'fail',
            message: `Error testing useProgress composable: ${error}`,
            evidence: { error }
        }
    }
}

function testLocalStoragePersistence(): RequirementTestResult {
    try {
        const progress = useProgress()
        const store = useProgressStore()

        // Clear any existing data
        localStorage.removeItem('vue3-learning-progress')
        localStorage.removeItem('vue3-learning-sessions')

        // Initialize fresh progress
        store.resetProgress()

        // Add some test data
        progress.completeExercise('test-exercise-1', 85, 120)
        progress.completeExercise('test-exercise-2', 92, 95)
        progress.completeModule('test-module')

        // Start and end a session to test session storage
        progress.startLearningSession('test-session-module')
        progress.endLearningSession()

        // Check if data was saved to localStorage
        const savedProgress = localStorage.getItem('vue3-learning-progress')
        const savedSessions = localStorage.getItem('vue3-learning-sessions')

        const hasProgressData = !!savedProgress
        const hasSessionData = !!savedSessions

        // Test data restoration
        store.resetProgress() // Clear in-memory data
        store.loadProgress() // Load from localStorage

        const restoredExerciseCount = progress.totalExercisesCompleted.value
        const restoredModuleCount = progress.completedModulesCount.value

        const dataRestored = restoredExerciseCount > 0 && restoredModuleCount > 0

        const allTestsPassed = hasProgressData && hasSessionData && dataRestored

        return {
            requirement: '实现本地存储的进度保存和恢复',
            description: 'Progress data should be saved to and restored from localStorage',
            status: allTestsPassed ? 'pass' : 'fail',
            message: allTestsPassed
                ? 'Local storage save and restore functionality works correctly'
                : 'Local storage functionality has issues',
            evidence: {
                hasProgressData,
                hasSessionData,
                dataRestored,
                savedProgressSize: savedProgress?.length || 0,
                savedSessionsSize: savedSessions?.length || 0,
                restoredExerciseCount,
                restoredModuleCount
            }
        }
    } catch (error) {
        return {
            requirement: '实现本地存储的进度保存和恢复',
            description: 'Progress data should be saved to and restored from localStorage',
            status: 'fail',
            message: `Error testing local storage: ${error}`,
            evidence: { error }
        }
    }
}

function testProgressCalculationLogic(): RequirementTestResult {
    try {
        const progress = useProgress()
        const store = useProgressStore()

        // Reset for clean test
        store.resetProgress()

        // Test basic progress calculation
        const initialProgress = progress.progressPercentage.value
        const initialExercises = progress.totalExercisesCompleted.value
        const initialAverage = progress.averageScore.value

        // Complete some exercises with different scores
        progress.completeExercise('calc-test-1', 80, 60)
        progress.completeExercise('calc-test-2', 90, 75)
        progress.completeExercise('calc-test-3', 85, 90)

        const afterExercisesProgress = progress.progressPercentage.value
        const afterExercisesCount = progress.totalExercisesCompleted.value
        const afterExercisesAverage = progress.averageScore.value

        // Complete a module
        progress.completeModule('calc-test-module')
        const afterModuleProgress = progress.progressPercentage.value
        const afterModuleCount = progress.completedModulesCount.value

        // Test analytics generation
        const analytics = progress.getLearningAnalytics()

        // Test learning streak calculation
        const streak = progress.learningStreak.value

        // Test module progress calculation
        const moduleProgress = progress.getModuleProgress('calc-test-module')

        // Test daily progress calculation
        const dailyProgress = progress.getDailyProgress(7)

        // Test weekly stats
        const weeklyStats = progress.getWeeklyStats()

        // Verify calculations are working
        const progressIncreased = afterExercisesProgress > initialProgress
        const exerciseCountCorrect = afterExercisesCount === 3
        const averageCalculatedCorrectly = afterExercisesAverage === 85 // (80+90+85)/3 = 85
        const moduleCountCorrect = afterModuleCount === 1
        const analyticsGenerated = analytics && typeof analytics.averageScore === 'number'
        const streakCalculated = streak && typeof streak.currentStreak === 'number'
        const moduleProgressCalculated = moduleProgress && typeof moduleProgress.averageScore === 'number'
        const dailyProgressGenerated = Array.isArray(dailyProgress) && dailyProgress.length === 7
        const weeklyStatsGenerated = weeklyStats && typeof weeklyStats.thisWeek.exercises === 'number'

        const allCalculationsWork = progressIncreased &&
            exerciseCountCorrect &&
            averageCalculatedCorrectly &&
            moduleCountCorrect &&
            analyticsGenerated &&
            streakCalculated &&
            moduleProgressCalculated &&
            dailyProgressGenerated &&
            weeklyStatsGenerated

        return {
            requirement: '添加进度计算和统计逻辑',
            description: 'Progress calculation and statistics logic should work correctly',
            status: allCalculationsWork ? 'pass' : 'fail',
            message: allCalculationsWork
                ? 'All progress calculation and statistics logic works correctly'
                : 'Some progress calculations are not working properly',
            evidence: {
                progressIncreased,
                exerciseCountCorrect,
                averageCalculatedCorrectly,
                moduleCountCorrect,
                analyticsGenerated,
                streakCalculated,
                moduleProgressCalculated,
                dailyProgressGenerated,
                weeklyStatsGenerated,
                calculations: {
                    initialProgress,
                    afterExercisesProgress,
                    afterModuleProgress,
                    exerciseCount: afterExercisesCount,
                    averageScore: afterExercisesAverage,
                    moduleCount: afterModuleCount
                },
                analytics,
                streak,
                moduleProgress,
                dailyProgressLength: dailyProgress.length,
                weeklyStats
            }
        }
    } catch (error) {
        return {
            requirement: '添加进度计算和统计逻辑',
            description: 'Progress calculation and statistics logic should work correctly',
            status: 'fail',
            message: `Error testing progress calculations: ${error}`,
            evidence: { error }
        }
    }
}

export function logRequirementTestResults(results: RequirementTestResult[]) {
    console.log('📋 Task 3.3 Requirement Test Results')
    console.log('====================================')

    let passCount = 0
    let failCount = 0

    results.forEach((result, index) => {
        const status = result.status === 'pass' ? '✅' : '❌'
        console.log(`${status} ${result.requirement}`)
        console.log(`   Description: ${result.description}`)
        console.log(`   Result: ${result.message}`)

        if (result.evidence && Object.keys(result.evidence).length > 0) {
            console.log(`   Evidence:`, result.evidence)
        }
        console.log('')

        if (result.status === 'pass') {
            passCount++
        } else {
            failCount++
        }
    })

    console.log('📊 Task 3.3 Summary:')
    console.log(`   Requirements Passed: ${passCount}`)
    console.log(`   Requirements Failed: ${failCount}`)
    console.log(`   Total Requirements: ${results.length}`)
    console.log(`   Success Rate: ${Math.round((passCount / results.length) * 100)}%`)

    const allPassed = failCount === 0
    console.log(`\n🎯 Task 3.3 Status: ${allPassed ? 'COMPLETED ✅' : 'NEEDS WORK ❌'}`)

    return { passCount, failCount, total: results.length, allPassed }
}

// Export for browser console use
if (typeof window !== 'undefined') {
    (window as any).testTask3_3 = () => {
        const results = testTask3_3Requirements()
        return logRequirementTestResults(results)
    }
}