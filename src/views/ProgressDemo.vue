<template>
  <div class="progress-demo">
    <h2>Progress Tracking Demo</h2>
    
    <div class="demo-section">
      <h3>Current Progress</h3>
      <div class="progress-stats">
        <div class="stat">
          <label>Overall Progress:</label>
          <span>{{ progressPercentage }}%</span>
        </div>
        <div class="stat">
          <label>Modules Completed:</label>
          <span>{{ completedModulesCount }}</span>
        </div>
        <div class="stat">
          <label>Exercises Completed:</label>
          <span>{{ totalExercisesCompleted }}</span>
        </div>
        <div class="stat">
          <label>Average Score:</label>
          <span>{{ averageScore }}%</span>
        </div>
        <div class="stat">
          <label>Total Time:</label>
          <span>{{ Math.round(totalTimeSpent / 60) }} minutes</span>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>Learning Session</h3>
      <div class="session-controls">
        <button 
          @click="startSession" 
          :disabled="!!currentSession"
          class="btn btn-primary"
        >
          Start Session
        </button>
        <button 
          @click="endSession" 
          :disabled="!currentSession"
          class="btn btn-secondary"
        >
          End Session
        </button>
      </div>
      
      <div v-if="currentSession" class="current-session">
        <p><strong>Active Session:</strong> {{ currentSession.moduleId }}</p>
        <p><strong>Duration:</strong> {{ sessionDuration }} seconds</p>
      </div>
    </div>

    <div class="demo-section">
      <h3>Exercise Simulation</h3>
      <div class="exercise-controls">
        <button @click="completeRandomExercise" class="btn btn-success">
          Complete Random Exercise
        </button>
        <button @click="completeRandomModule" class="btn btn-info">
          Complete Random Module
        </button>
      </div>
    </div>

    <div class="demo-section">
      <h3>Analytics</h3>
      <button @click="showAnalytics" class="btn btn-outline">
        Show Learning Analytics
      </button>
      
      <div v-if="analytics" class="analytics-display">
        <pre>{{ JSON.stringify(analytics, null, 2) }}</pre>
      </div>
    </div>

    <div class="demo-section">
      <h3>Data Management</h3>
      <div class="data-controls">
        <button @click="exportData" class="btn btn-outline">
          Export Progress
        </button>
        <button @click="resetAllProgress" class="btn btn-danger">
          Reset Progress
        </button>
        <button @click="runIntegrationTest" class="btn btn-info">
          Run Integration Test
        </button>
        <button @click="runVerificationTest" class="btn btn-success">
          Run Verification Test
        </button>
        <button @click="runTask3_3Test" class="btn btn-warning">
          Test Task 3.3 Requirements
        </button>
      </div>
      
      <div v-if="exportedData" class="export-display">
        <h4>Exported Data (first 500 chars):</h4>
        <pre>{{ exportedData.substring(0, 500) }}...</pre>
      </div>
      
      <div v-if="testResults.length > 0" class="test-results">
        <h4>Integration Test Results:</h4>
        <div v-for="(result, index) in testResults" :key="index" class="test-result">
          <span :class="['test-status', result.success ? 'success' : 'failure']">
            {{ result.success ? '✅' : '❌' }}
          </span>
          <span class="test-message">{{ result.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProgress } from '@/composables/useProgress'
import { runProgressIntegrationTest, logTestResults, type TestResult } from '@/utils/progressIntegrationTest'
import { runAllProgressTests } from '@/utils/runProgressTests'
import { testTask3_3Requirements, logRequirementTestResults } from '@/utils/progressRequirementTest'
import type { LearningAnalytics } from '@/types'

const progress = useProgress()

// Reactive state
const analytics = ref<LearningAnalytics | null>(null)
const exportedData = ref<string>('')
const sessionTimer = ref<number | null>(null)
const sessionDuration = ref(0)
const testResults = ref<TestResult[]>([])

// Computed properties from progress composable
const {
  currentSession,
  progressPercentage,
  completedModulesCount,
  totalExercisesCompleted,
  averageScore,
  totalTimeSpent
} = progress

// Demo functions
function startSession() {
  const modules = ['basic-syntax', 'components', 'reactivity', 'composition-api']
  const randomModule = modules[Math.floor(Math.random() * modules.length)]
  
  progress.startLearningSession(randomModule)
  
  // Start timer for demo
  sessionDuration.value = 0
  sessionTimer.value = window.setInterval(() => {
    sessionDuration.value++
  }, 1000)
}

function endSession() {
  progress.endLearningSession()
  
  if (sessionTimer.value) {
    clearInterval(sessionTimer.value)
    sessionTimer.value = null
  }
  sessionDuration.value = 0
}

function completeRandomExercise() {
  const modules = ['basic-syntax', 'components', 'reactivity', 'composition-api']
  const randomModule = modules[Math.floor(Math.random() * modules.length)]
  const exerciseNum = Math.floor(Math.random() * 3) + 1
  const exerciseId = `${randomModule}-exercise-${exerciseNum}`
  
  const score = Math.floor(Math.random() * 40) + 60 // 60-100
  const timeSpent = Math.floor(Math.random() * 180) + 30 // 30-210 seconds
  
  progress.completeExercise(exerciseId, score, timeSpent)
  
  console.log(`Completed exercise: ${exerciseId} (Score: ${score}, Time: ${timeSpent}s)`)
}

function completeRandomModule() {
  const modules = ['basic-syntax', 'components', 'reactivity', 'composition-api']
  const availableModules = modules.filter(module => 
    !progress.isModuleCompleted(module)
  )
  
  if (availableModules.length > 0) {
    const randomModule = availableModules[Math.floor(Math.random() * availableModules.length)]
    progress.completeModule(randomModule)
    console.log(`Completed module: ${randomModule}`)
  } else {
    console.log('All modules already completed!')
  }
}

function showAnalytics() {
  analytics.value = progress.getLearningAnalytics()
}

function exportData() {
  exportedData.value = progress.exportProgressData()
}

function resetAllProgress() {
  if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
    progress.resetProgress()
    analytics.value = null
    exportedData.value = ''
    testResults.value = []
  }
}

function runIntegrationTest() {
  console.log('Running progress tracking integration test...')
  testResults.value = runProgressIntegrationTest()
  logTestResults(testResults.value)
}

function runVerificationTest() {
  console.log('Running comprehensive progress verification...')
  const results = runAllProgressTests()
  
  // Convert verification results to TestResult format for display
  const allResults = [...results.generalResults, ...results.requirementResults]
  testResults.value = allResults.map(result => ({
    success: result.status === 'pass',
    message: `${result.feature}: ${result.message}`,
    details: result.details
  }))
}

function runTask3_3Test() {
  console.log('Running Task 3.3 specific requirement tests...')
  const results = testTask3_3Requirements()
  const summary = logRequirementTestResults(results)
  
  // Convert to TestResult format for display
  testResults.value = results.map(result => ({
    success: result.status === 'pass',
    message: `${result.requirement}: ${result.message}`,
    details: result.evidence
  }))
  
  // Add summary as final result
  testResults.value.push({
    success: summary.allPassed,
    message: `Task 3.3 Overall: ${summary.allPassed ? 'COMPLETED' : 'NEEDS WORK'} (${summary.passCount}/${summary.total} passed)`,
    details: summary
  })
}

// Initialize progress on mount
onMounted(() => {
  progress.initializeProgress()
})

// Cleanup timer on unmount
onUnmounted(() => {
  if (sessionTimer.value) {
    clearInterval(sessionTimer.value)
  }
})
</script>

<style scoped>
.progress-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.demo-section h3 {
  margin-top: 0;
  color: #2c3e50;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.stat label {
  font-weight: 600;
}

.session-controls,
.exercise-controls,
.data-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #1e7e34;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #117a8b;
}

.btn-outline {
  background: transparent;
  border: 1px solid #007bff;
  color: #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.current-session {
  padding: 15px;
  background: #e7f3ff;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.analytics-display,
.export-display {
  margin-top: 15px;
}

.analytics-display pre,
.export-display pre {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

.test-results {
  margin-top: 15px;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  margin: 4px 0;
  background: #f8f9fa;
  border-radius: 4px;
}

.test-status.success {
  color: #28a745;
}

.test-status.failure {
  color: #dc3545;
}

.test-message {
  flex: 1;
}
</style>