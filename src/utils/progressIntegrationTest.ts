// Integration test for progress tracking functionality
import { useProgress } from '@/composables/useProgress'
import { useProgressStore } from '@/stores/progress'

export interface TestResult {
    success: boolean
    message: string
    details?: any
}

export function runProgressIntegrationTest(): TestResult[] {
    const results: TestResult[] = []

    try {
        const progress = useProgress()
        const store = useProgressStore()

        // Test 1: Initialize progress
        progress.initializeProgress()
        results.push({
            success: true,
            message: 'Progress initialization successful'
        })

        // Test 2: Start learning session
        progress.startLearningSession('basic-syntax')
        const hasSession = !!progress.currentSession.value
        results.push({
            success: hasSession,
            message: hasSession ? 'Learning session started successfully' : 'Failed to start learning session',
            details: progress.currentSession.value
        })

        // Test 3: Complete exercises
        progress.completeExercise('basic-syntax-ex1', 85, 120)
        progress.completeExercise('basic-syntax-ex2', 92, 95)

        const exerciseCount = progress.totalExercisesCompleted.value
        results.push({
            success: exerciseCount >= 2,
            message: `Completed ${exerciseCount} exercises`,
            details: { exerciseCount }
        })

        // Test 4: Complete module
        progress.completeModule('basic-syntax')
        const moduleCompleted = store.isModuleCompleted('basic-syntax')
        results.push({
            success: moduleCompleted,
            message: moduleCompleted ? 'Module completed successfully' : 'Failed to complete module',
            details: { moduleCompleted }
        })

        // Test 5: Check progress calculations
        const progressPercentage = progress.progressPercentage.value
        const averageScore = progress.averageScore.value

        results.push({
            success: progressPercentage > 0 && averageScore > 0,
            message: `Progress: ${progressPercentage}%, Average Score: ${averageScore}%`,
            details: { progressPercentage, averageScore }
        })

        // Test 6: Analytics
        const analytics = progress.getLearningAnalytics()
        results.push({
            success: analytics.exercisesCompleted > 0,
            message: `Analytics generated: ${analytics.exercisesCompleted} exercises, ${analytics.modulesCompleted} modules`,
            details: analytics
        })

        // Test 7: Local storage persistence
        store.saveProgress()
        const savedData = localStorage.getItem('vue3-learning-progress')
        results.push({
            success: !!savedData,
            message: savedData ? 'Progress saved to localStorage' : 'Failed to save progress',
            details: { dataLength: savedData?.length || 0 }
        })

        // Test 8: Export/Import
        const exportedData = progress.exportProgressData()
        const importSuccess = progress.importProgressData(exportedData)
        results.push({
            success: importSuccess,
            message: importSuccess ? 'Export/Import successful' : 'Export/Import failed',
            details: { exportSize: exportedData.length }
        })

        // End session
        progress.endLearningSession()

    } catch (error) {
        results.push({
            success: false,
            message: `Integration test failed: ${error}`,
            details: error
        })
    }

    return results
}

export function logTestResults(results: TestResult[]) {
    console.log('🧪 Progress Tracking Integration Test Results')
    console.log('============================================')

    let passCount = 0
    let failCount = 0

    results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌'
        console.log(`${status} Test ${index + 1}: ${result.message}`)

        if (result.details) {
            console.log(`   Details:`, result.details)
        }

        if (result.success) {
            passCount++
        } else {
            failCount++
        }
    })

    console.log('\n📊 Summary:')
    console.log(`   Passed: ${passCount}`)
    console.log(`   Failed: ${failCount}`)
    console.log(`   Total: ${results.length}`)
    console.log(`   Success Rate: ${Math.round((passCount / results.length) * 100)}%`)

    return { passCount, failCount, total: results.length }
}