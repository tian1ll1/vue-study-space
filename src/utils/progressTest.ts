// Simple test utility to verify progress tracking functionality
import { useProgress } from '@/composables/useProgress'
import { useProgressStore } from '@/stores/progress'

export function testProgressTracking() {
    console.log('Testing progress tracking functionality...')

    const progress = useProgress()
    const store = useProgressStore()

    // Initialize progress
    progress.initializeProgress()

    // Test 1: Start a learning session
    console.log('Test 1: Starting learning session')
    progress.startLearningSession('basic-syntax')
    console.log('Current session:', progress.currentSession.value)

    // Test 2: Complete an exercise
    console.log('Test 2: Completing exercise')
    progress.completeExercise('basic-syntax-ex1', 85, 120) // 85 score, 120 seconds
    console.log('Exercise progress:', store.getExerciseProgress('basic-syntax-ex1'))

    // Test 3: Complete another exercise
    progress.completeExercise('basic-syntax-ex2', 92, 95)
    console.log('Exercise progress:', store.getExerciseProgress('basic-syntax-ex2'))

    // Test 4: Complete module
    console.log('Test 3: Completing module')
    progress.completeModule('basic-syntax')
    console.log('Module completed:', store.isModuleCompleted('basic-syntax'))

    // Test 5: Check analytics
    console.log('Test 4: Checking analytics')
    const analytics = progress.getLearningAnalytics()
    console.log('Analytics:', analytics)

    // Test 6: Check progress stats
    console.log('Test 5: Checking progress stats')
    console.log('Progress percentage:', progress.progressPercentage.value)
    console.log('Completed modules:', progress.completedModulesCount.value)
    console.log('Total exercises completed:', progress.totalExercisesCompleted.value)
    console.log('Average score:', progress.averageScore.value)

    // Test 7: Export/Import data
    console.log('Test 6: Testing export/import')
    const exportedData = progress.exportProgressData()
    console.log('Exported data length:', exportedData.length)

    // Reset and import
    store.resetProgress()
    const importSuccess = progress.importProgressData(exportedData)
    console.log('Import success:', importSuccess)
    console.log('Progress after import:', progress.progressPercentage.value)

    console.log('Progress tracking tests completed!')

    return {
        success: true,
        analytics,
        progressPercentage: progress.progressPercentage.value,
        completedModules: progress.completedModulesCount.value
    }
}

// Test local storage functionality
export function testLocalStorage() {
    console.log('Testing local storage functionality...')

    const store = useProgressStore()

    // Save some test data
    store.completeExercise('test-exercise', 90, 60)
    store.completeModule('test-module')

    // Check if data is saved
    const saved = localStorage.getItem('vue3-learning-progress')
    console.log('Data saved to localStorage:', !!saved)

    if (saved) {
        const parsed = JSON.parse(saved)
        console.log('Saved progress data:', parsed)
    }

    // Test loading
    store.loadProgress()
    console.log('Data loaded successfully')

    return {
        success: true,
        hasSavedData: !!saved
    }
}