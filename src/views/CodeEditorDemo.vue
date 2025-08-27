<template>
  <div class="code-editor-demo">
    <h1>代码编辑器演示</h1>

    <div class="demo-controls">
      <label>
        语言:
        <select v-model="selectedLanguage">
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="vue">Vue</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </label>

      <label>
        主题:
        <select v-model="selectedTheme">
          <option value="vs-dark">深色主题</option>
          <option value="vs-light">浅色主题</option>
        </select>
      </label>

      <label>
        <input type="checkbox" v-model="isReadonly" />
        只读模式
      </label>

      <label>
        <input type="checkbox" v-model="autoRefresh" />
        自动刷新预览
      </label>
    </div>

    <div class="editor-section">
      <h2>代码编辑器</h2>
      <CodeEditor v-model="code" :language="selectedLanguage" :theme="selectedTheme" :readonly="isReadonly"
        height="400px" placeholder="// 在这里编写代码..." @run="handleRunCode" @reset="handleResetCode"
        @change="handleCodeChange" />
    </div>

    <div class="preview-section">
      <h2>代码预览</h2>
      <CodePreview :code="code"
        :language="selectedLanguage === 'html' || selectedLanguage === 'css' ? 'vue' : selectedLanguage"
        :auto-refresh="autoRefresh" @compiled="handleCompiled" @error="handlePreviewError"
        @console="handleConsoleLog" />
    </div>

    <div class="execution-section">
      <h2>代码执行环境</h2>
      <CodeExecutionPanel :code="code" :language="selectedLanguage === 'vue' ? 'vue' : 'javascript'"
        :auto-execute="false" @executed="handleCodeExecuted" @error="handleExecutionError"
        @load-example="handleLoadExample" />
    </div>

    <div class="output-section" v-if="executionOutput">
      <h2>执行结果</h2>
      <pre class="output">{{ executionOutput }}</pre>
    </div>

    <div class="stats-section">
      <h2>代码统计</h2>
      <div class="stats">
        <span>行数: {{ codeStats.lines }}</span>
        <span>字符数: {{ codeStats.characters }}</span>
        <span>单词数: {{ codeStats.words }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import CodePreview from '@/components/CodePreview.vue'
import CodeExecutionPanel from '@/components/CodeExecutionPanel.vue'
import type { ConsoleLog } from '@/types/editor'
import type { ExecutionResult } from '@/utils/codeExecutor'

const selectedLanguage = ref<'javascript' | 'typescript' | 'vue' | 'html' | 'css'>('vue')
const selectedTheme = ref<'vs-dark' | 'vs-light'>('vs-dark')
const isReadonly = ref(false)
const autoRefresh = ref(true)
const executionOutput = ref('')

const code = ref(`<template>
  <div class="demo-component">
    <h1>{{ title }}</h1>
    <p>当前计数: {{ count }}</p>
    <div class="buttons">
      <button @click="decrement" :disabled="count <= 0">-</button>
      <button @click="increment">+</button>
      <button @click="reset">重置</button>
    </div>
    <div class="info">
      <p>双倍值: {{ doubleCount }}</p>
      <p>状态: {{ status }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const title = ref('Vue 3 计数器演示')
const count = ref(0)

const doubleCount = computed(() => count.value * 2)
const status = computed(() => {
  if (count.value === 0) return '初始状态'
  if (count.value > 0) return '正数'
  return '负数'
})

function increment() {
  count.value++
  console.log('计数增加:', count.value)
}

function decrement() {
  if (count.value > 0) {
    count.value--
    console.log('计数减少:', count.value)
  }
}

function reset() {
  count.value = 0
  console.log('计数重置')
}
<\/script>

<style scoped>
.demo-component {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
}

.buttons {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:first-child {
  background: #dc3545;
  color: white;
}

button:nth-child(2) {
  background: #28a745;
  color: white;
}

button:last-child {
  background: #6c757d;
  color: white;
}

button:hover:not(:disabled) {
  opacity: 0.8;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}
<\/style>`)

// 代码统计
const codeStats = computed(() => {
  const currentCode = code.value
  return {
    lines: currentCode.split('\n').length,
    characters: currentCode.length,
    words: currentCode.split(/\s+/).filter(word => word.length > 0).length
  }
})

function handleRunCode(codeToRun: string) {
  console.log('Running code:', codeToRun)

  // 模拟代码执行
  try {
    executionOutput.value = `代码执行成功！
执行时间: ${new Date().toLocaleTimeString()}
代码长度: ${codeToRun.length} 字符
行数: ${codeToRun.split('\n').length} 行

注意: 这是模拟执行结果，实际的代码执行功能将在后续任务中实现。`
  } catch (error) {
    executionOutput.value = `执行错误: ${error}`
  }
}

function handleResetCode() {
  console.log('Code reset')
  executionOutput.value = ''
}

function handleCodeChange(newCode: string) {
  console.log('Code changed, length:', newCode.length)
}

function handleCompiled(component: any) {
  console.log('Component compiled successfully:', component)
  executionOutput.value = `组件编译成功！
编译时间: ${new Date().toLocaleTimeString()}
组件类型: ${typeof component}

预览区域已更新，可以看到实时效果。`
}

function handlePreviewError(error: string) {
  console.error('Preview compilation error:', error)
  executionOutput.value = `预览编译失败:
${error}

请检查代码语法并修复错误。`
}

function handleConsoleLog(log: ConsoleLog) {
  console.log('Console output:', log)
}

function handleCodeExecuted(result: ExecutionResult) {
  console.log('Code executed:', result)
  executionOutput.value = `代码执行完成！
状态: ${result.success ? '成功' : '失败'}
执行时间: ${result.executionTime}ms
输出行数: ${result.output.length}

${result.error ? `错误: ${result.error}` : '执行成功，查看控制台输出了解详情。'}`
}

function handleExecutionError(error: string) {
  console.error('Execution error:', error)
  executionOutput.value = `执行环境错误:
${error}

请检查代码并重试。`
}

function handleLoadExample(exampleCode: string) {
  code.value = exampleCode
  console.log('Loaded example code')
}
</script>

<style scoped>
.code-editor-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.demo-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  flex-wrap: wrap;
}

.demo-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.demo-controls select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.editor-section {
  margin-bottom: 30px;
}

.editor-section h2 {
  margin-bottom: 15px;
  color: #333;
}

.preview-section {
  margin-bottom: 30px;
}

.preview-section h2 {
  margin-bottom: 15px;
  color: #333;
}

.execution-section {
  margin-bottom: 30px;
}

.execution-section h2 {
  margin-bottom: 15px;
  color: #333;
}

.output-section {
  margin-bottom: 30px;
}

.output-section h2 {
  margin-bottom: 15px;
  color: #333;
}

.output {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  max-height: 200px;
  overflow-y: auto;
}

.stats-section h2 {
  margin-bottom: 15px;
  color: #333;
}

.stats {
  display: flex;
  gap: 20px;
  padding: 10px;
  background: #e9ecef;
  border-radius: 4px;
  flex-wrap: wrap;
}

.stats span {
  font-weight: 500;
  color: #495057;
}

@media (max-width: 768px) {
  .demo-controls {
    flex-direction: column;
    gap: 10px;
  }

  .stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>