// Simple test runner for progress tracking functionality
import {
    verifyProgressTracking,
    logVerificationResults,
    verifyRequirement1_4,
    verifyRequirement7_4
} from './progressVerification'

export function runAllProgressTests() {
    console.log('🚀 Starting Progress Tracking Tests...\n')

    // Run general verification
    const generalResults = verifyProgressTracking()
    logVerificationResults(generalResults)

    console.log('\n' + '='.repeat(50) + '\n')

    // Run specific requirement tests
    console.log('🎯 Testing Specific Requirements...\n')

    const req1_4 = verifyRequirement1_4()
    const req7_4 = verifyRequirement7_4()

    const requirementResults = [req1_4, req7_4]
    logVerificationResults(requirementResults)

    console.log('\n' + '='.repeat(50) + '\n')

    // Overall summary
    const totalTests = generalResults.length + requirementResults.length
    const totalPassed = generalResults.filter(r => r.status === 'pass').length +
        requirementResults.filter(r => r.status === 'pass').length

    console.log('🏁 Final Test Summary:')
    console.log(`   Total Tests: ${totalTests}`)
    console.log(`   Passed: ${totalPassed}`)
    console.log(`   Failed: ${totalTests - totalPassed}`)
    console.log(`   Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%`)

    return {
        totalTests,
        totalPassed,
        totalFailed: totalTests - totalPassed,
        successRate: Math.round((totalPassed / totalTests) * 100),
        generalResults,
        requirementResults
    }
}

// Export for use in browser console or components
if (typeof window !== 'undefined') {
    (window as any).runProgressTests = runAllProgressTests
}