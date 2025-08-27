// Progress tracking verification utility
import { useProgress } from '@/composables/useProgress'
import { useProgressStore } from '@/stores/progress'

export interface VerificationResult {
    feature: string
    status: 'pass' | 'fail'
    message: string
    details?: any
}

export function verifyProgressTracking(): VerificationResult[] {
    const results: VerificationResult[] = []

    try {
        const progress = useProgress()
        const store = useProgressStore()

        // Test 1: Verify useProgress composable exists and has required methods
        const requiredMethods = [
            'startLearningSession',
            'endLearningSession',
            'completeExercise',
            'completeModule',
            'getLearningAnalytics',
            'exportProgressData',
            'importProgressData',
            'initializeProgress'
        ]

        const missingMethods = requiredMethods.filter(method =>
            typeof (progress as any)[method] !== 'function'
        )

        results.push({
            feature: 'useProgress Composable',
            status: missingMethods.length === 0 ? 'pass' : 'fail',
            message: missingMethods.length === 0
                ? 'All required methods are available'
                : `Missing methods: ${missingMethods.join(', ')}`,
            details: { requiredMethods, missingMethods }
        })

        // Test 2: Verify local storage functionality
        const testKey = 'vue3-learning-progress-test'
        const testData = { test: 'data', timestamp: Date.now() }

        try {
            localStorage.setItem(testKey, JSON.stringify(testData))
            const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}')
            localStorage.removeItem(testKey)

            results.push({
                feature: 'Local Storage',
                status: retrieved.test === testData.test ? 'pass' : 'fail',
                message: retrieved.test === testData.test
                    ? 'Local storage read/write works correctly'
                    : 'Local storage functionality failed'
            })
        } catch (error) {
            results.push({
                feature: 'Local Storage',
                status: 'fail',
                message: `Local storage error: ${error}`,
                details: error
            })
        }

        // Test 3: Verify progress calculation logic
        // Initialize fresh progress for testing
        store.resetProgress()

        // Complete some exercises
        progress.completeExercise('test-ex-1', 85, 120)
        progress.completeExercise('test-ex-2', 92, 95)

        const exerciseCount = progress.totalExercisesCompleted.value
        const avgScore = progress.averageScore.value

        results.push({
            feature: 'Progress Calculation',
            status: exerciseCount === 2 && avgScore > 0 ? 'pass' : 'fail',
            message: `Exercises: ${exerciseCount}, Average Score: ${avgScore}%`,
            details: { exerciseCount, avgScore }
        })

        // Test 4: Verify module completion tracking
        progress.completeModule('test-module')
        const moduleCompleted = store.isModuleCompleted('test-module')

        results.push({
            feature: 'Module Completion',
            status: moduleCompleted ? 'pass' : 'fail',
            message: moduleCompleted
                ? 'Module completion tracking works'
                : 'Module completion tracking failed'
        })

        // Test 5: Verify analytics generation
        const analytics = progress.getLearningAnalytics()
        const hasAnalytics = analytics &&
            typeof analytics.exercisesCompleted === 'number' &&
            typeof analytics.averageScore === 'number'

        results.push({
            feature: 'Learning Analytics',
            status: hasAnalytics ? 'pass' : 'fail',
            message: hasAnalytics
                ? 'Analytics generation works correctly'
                : 'Analytics generation failed',
            details: analytics
        })

        // Test 6: Verify export/import functionality
        const exportData = progress.exportProgressData()
        const hasExportData = exportData && exportData.length > 0

        let importSuccess = false
        if (hasExportData) {
            importSuccess = progress.importProgressData(exportData)
        }

        results.push({
            feature: 'Data Export/Import',
            status: hasExportData && importSuccess ? 'pass' : 'fail',
            message: hasExportData && importSuccess
                ? 'Export/Import functionality works'
                : 'Export/Import functionality failed',
            details: { exportSize: exportData?.length || 0, importSuccess }
        })

        // Test 7: Verify learning session tracking
        progress.startLearningSession('test-session-module')
        const hasActiveSession = !!progress.currentSession.value

        if (hasActiveSession) {
            progress.endLearningSession()
        }

        results.push({
            feature: 'Learning Sessions',
            status: hasActiveSession ? 'pass' : 'fail',
            message: hasActiveSession
                ? 'Learning session tracking works'
                : 'Learning session tracking failed'
        })

        // Test 8: Verify progress persistence
        store.saveProgress()
        const savedData = localStorage.getItem('vue3-learning-progress')

        results.push({
            feature: 'Progress Persistence',
            status: !!savedData ? 'pass' : 'fail',
            message: savedData
                ? 'Progress persistence works'
                : 'Progress persistence failed',
            details: { dataSize: savedData?.length || 0 }
        })

    } catch (error) {
        results.push({
            feature: 'Overall Verification',
            status: 'fail',
            message: `Verification failed with error: ${error}`,
            details: error
        })
    }

    return results
}

export function logVerificationResults(results: VerificationResult[]) {
    console.log('🔍 Progress Tracking Verification Results')
    console.log('=========================================')

    let passCount = 0
    let failCount = 0

    results.forEach((result, index) => {
        const status = result.status === 'pass' ? '✅' : '❌'
        console.log(`${status} ${result.feature}: ${result.message}`)

        if (result.details) {
            console.log(`   Details:`, result.details)
        }

        if (result.status === 'pass') {
            passCount++
        } else {
            failCount++
        }
    })

    console.log('\n📊 Verification Summary:')
    console.log(`   Passed: ${passCount}`)
    console.log(`   Failed: ${failCount}`)
    console.log(`   Total: ${results.length}`)
    console.log(`   Success Rate: ${Math.round((passCount / results.length) * 100)}%`)

    return { passCount, failCount, total: results.length }
}

// Requirement verification functions
export function verifyRequirement1_4(): VerificationResult {
    // Requirement 1.4: WHEN 用户完成基础练习 THEN 系统 SHALL 标记该模块为已完成状态
    const progress = useProgress()
    const store = useProgressStore()

    try {
        // Reset progress for clean test
        store.resetProgress()

        // Complete some exercises in basic-syntax module
        progress.completeExercise('basic-syntax-ex1', 85, 120)
        progress.completeExercise('basic-syntax-ex2', 90, 100)

        // Complete the module
        progress.completeModule('basic-syntax')

        // Verify module is marked as completed
        const isCompleted = store.isModuleCompleted('basic-syntax')

        return {
            feature: 'Requirement 1.4 - Module Completion Marking',
            status: isCompleted ? 'pass' : 'fail',
            message: isCompleted
                ? 'Module is correctly marked as completed after exercises'
                : 'Module completion marking failed',
            details: {
                moduleId: 'basic-syntax',
                isCompleted,
                completedModules: store.completedModules
            }
        }
    } catch (error) {
        return {
            feature: 'Requirement 1.4 - Module Completion Marking',
            status: 'fail',
            message: `Error verifying requirement 1.4: ${error}`,
            details: error
        }
    }
}

export function verifyRequirement7_4(): VerificationResult {
    // Requirement 7.4: WHEN 用户完成项目 THEN 系统 SHALL 生成学习进度报告和下一步学习建议
    const progress = useProgress()

    try {
        // Complete some modules and exercises to have data for report
        progress.completeExercise('project-ex1', 88, 300)
        progress.completeExercise('project-ex2', 92, 250)
        progress.completeModule('project')

        // Generate learning analytics (progress report)
        const analytics = progress.getLearningAnalytics()

        // Check if analytics contains required information
        const hasRequiredFields = analytics &&
            typeof analytics.exercisesCompleted === 'number' &&
            typeof analytics.modulesCompleted === 'number' &&
            typeof analytics.averageScore === 'number' &&
            typeof analytics.totalTimeSpent === 'number' &&
            Array.isArray(analytics.strongAreas) &&
            Array.isArray(analytics.improvementAreas)

        return {
            feature: 'Requirement 7.4 - Progress Report Generation',
            status: hasRequiredFields ? 'pass' : 'fail',
            message: hasRequiredFields
                ? 'Learning progress report generated successfully'
                : 'Progress report generation failed or incomplete',
            details: analytics
        }
    } catch (error) {
        return {
            feature: 'Requirement 7.4 - Progress Report Generation',
            status: 'fail',
            message: `Error verifying requirement 7.4: ${error}`,
            details: error
        }
    }
}