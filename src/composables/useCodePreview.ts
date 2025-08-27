import { ref, computed, watch, type Ref } from 'vue'
import type { CodePreviewInstance, ConsoleLog } from '@/types/editor'

export interface UseCodePreviewOptions {
  initialCode?: string
  language?: 'vue' | 'javascript' | 'typescript'
  autoRefresh?: boolean
  componentProps?: Record<string, any>
}

export function useCodePreview(options: UseCodePreviewOptions = {}) {
  const previewRef = ref<CodePreviewInstance>()
  const code = ref(options.initialCode || '')
  const language = ref(options.language || 'vue')
  const autoRefresh = ref(options.autoRefresh ?? true)
  const componentProps = ref(options.componentProps || {})

  const isCompiling = ref(false)
  const compilationError = ref<string | null>(null)
  const compiledComponent = ref<any>(null)
  const consoleLogs = ref<ConsoleLog[]>([])
  const showConsole = ref(false)

  // 计算属性
  const hasError = computed(() => !!compilationError.value)
  const hasCode = computed(() => code.value.trim().length > 0)
  const canPreview = computed(() => hasCode.value && !isCompiling.value)
  const errorCount = computed(() => consoleLogs.value.filter(log => log.level === 'error').length)
  const warningCount = computed(() => consoleLogs.value.filter(log => log.level === 'warn').length)

  // 监听代码变化
  watch([code, language], () => {
    if (autoRefresh.value && hasCode.value) {
      refreshPreview()
    }
  })

  // 方法
  function updateCode(newCode: string) {
    code.value = newCode
  }

  function setLanguage(newLanguage: 'vue' | 'javascript' | 'typescript') {
    language.value = newLanguage
  }

  function setAutoRefresh(enabled: boolean) {
    autoRefresh.value = enabled
  }

  function updateComponentProps(props: Record<string, any>) {
    componentProps.value = { ...props }
    if (autoRefresh.value && hasCode.value) {
      refreshPreview()
    }
  }

  function refreshPreview() {
    previewRef.value?.refresh()
  }

  function clearPreview() {
    previewRef.value?.clear()
    compilationError.value = null
    compiledComponent.value = null
    clearConsole()
  }

  function toggleConsole() {
    showConsole.value = !showConsole.value
  }

  function clearConsole() {
    consoleLogs.value = []
  }

  function addConsoleLog(log: ConsoleLog) {
    consoleLogs.value.push(log)

    // 限制日志数量，避免内存泄漏
    if (consoleLogs.value.length > 1000) {
      consoleLogs.value = consoleLogs.value.slice(-500)
    }
  }

  // 事件处理器
  function onCompiled(component: any) {
    compiledComponent.value = component
    compilationError.value = null
    isCompiling.value = false
  }

  function onError(error: string) {
    compilationError.value = error
    compiledComponent.value = null
    isCompiling.value = false
  }

  function onConsole(log: ConsoleLog) {
    addConsoleLog(log)
  }

  // 代码模板
  const templates = {
    vue: {
      basic: `<template>
  <div class="hello">
    <h1>{{ message }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">Click me</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello Vue 3!')
const count = ref(0)

function increment() {
  count.value++
}
</script>

<style scoped>
.hello {
  text-align: center;
  padding: 20px;
}

button {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background: #369870;
}
</style>`,

      reactive: `<template>
  <div class="reactive-demo">
    <h2>响应式系统演示</h2>
    <div class="controls">
      <input v-model="name" placeholder="输入姓名" />
      <input v-model.number="age" type="number" placeholder="输入年龄" />
    </div>
    <div class="output">
      <p>姓名: {{ name }}</p>
      <p>年龄: {{ age }}</p>
      <p>成年人: {{ isAdult ? '是' : '否' }}</p>
      <p>问候语: {{ greeting }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const name = ref('')
const age = ref(0)

const isAdult = computed(() => age.value >= 18)
const greeting = computed(() => {
  if (!name.value) return '请输入姓名'
  return \`你好, \${name.value}!\`
})
</script>

<style scoped>
.reactive-demo {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.controls {
  margin: 20px 0;
}

.controls input {
  display: block;
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.output {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
}

.output p {
  margin: 8px 0;
}
</style>`,

      component: `<template>
  <div class="component-demo">
    <h2>组件通信演示</h2>
    <UserCard 
      :user="user" 
      @update-age="handleUpdateAge"
    />
    <div class="actions">
      <button @click="addAge">增加年龄</button>
      <button @click="resetUser">重置用户</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineComponent } from 'vue'

// 子组件定义
const UserCard = defineComponent({
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  emits: ['update-age'],
  setup(props, { emit }) {
    function updateAge() {
      emit('update-age', props.user.age + 1)
    }
    
    return { updateAge }
  },
  template: \`
    <div class="user-card">
      <h3>{{ user.name }}</h3>
      <p>年龄: {{ user.age }}</p>
      <button @click="updateAge">生日快乐</button>
    </div>
  \`
})

const user = ref({
  name: 'Vue开发者',
  age: 25
})

function handleUpdateAge(newAge: number) {
  user.value.age = newAge
}

function addAge() {
  user.value.age++
}

function resetUser() {
  user.value = {
    name: 'Vue开发者',
    age: 25
  }
}
</script>

<style scoped>
.component-demo {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.user-card {
  background: #f0f8ff;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  border: 1px solid #e0e8f0;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #42b883;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #369870;
}
</style>`
    },

    javascript: {
      basic: `// JavaScript 基础示例
console.log('Hello, JavaScript!')

// 变量和函数
const message = 'Welcome to Vue 3 Learning'
let count = 0

function increment() {
  count++
  console.log('Count:', count)
  
  // 更新页面显示
  const output = document.getElementById('output')
  if (output) {
    output.innerHTML = \`
      <h3>计数器: \${count}</h3>
      <p>消息: \${message}</p>
    \`
  }
}

// 创建按钮
const button = document.createElement('button')
button.textContent = '点击增加'
button.onclick = increment
document.body.appendChild(button)

// 创建输出区域
const output = document.createElement('div')
output.id = 'output'
output.style.cssText = 'margin: 20px 0; padding: 16px; background: #f5f5f5; border-radius: 4px;'
document.body.appendChild(output)

// 初始化显示
increment()`,

      async: `// 异步操作示例
console.log('开始异步操作演示')

// Promise 示例
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchData() {
  console.log('开始获取数据...')
  
  try {
    await delay(1000)
    const data = { id: 1, name: 'Vue 3', version: '3.4.0' }
    console.log('数据获取成功:', data)
    return data
  } catch (error) {
    console.error('数据获取失败:', error)
    throw error
  }
}

// 使用 async/await
async function main() {
  try {
    const result = await fetchData()
    
    // 显示结果
    const output = document.createElement('div')
    output.innerHTML = \`
      <h3>异步操作结果</h3>
      <pre>\${JSON.stringify(result, null, 2)}</pre>
    \`
    output.style.cssText = 'margin: 20px 0; padding: 16px; background: #f0f8ff; border-radius: 4px;'
    document.body.appendChild(output)
    
  } catch (error) {
    console.error('主函数执行失败:', error)
  }
}

// 执行主函数
main()

console.log('异步操作已启动')`
    },

    typescript: {
      basic: `// TypeScript 基础示例
interface User {
  id: number
  name: string
  email: string
  age?: number
}

class UserManager {
  private users: User[] = []
  
  addUser(user: User): void {
    this.users.push(user)
    console.log('用户已添加:', user)
  }
  
  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id)
  }
  
  getAllUsers(): User[] {
    return [...this.users]
  }
  
  updateUser(id: number, updates: Partial<User>): boolean {
    const userIndex = this.users.findIndex(user => user.id === id)
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates }
      console.log('用户已更新:', this.users[userIndex])
      return true
    }
    return false
  }
}

// 使用示例
const userManager = new UserManager()

const user1: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  age: 25
}

const user2: User = {
  id: 2,
  name: 'Bob',
  email: 'bob@example.com'
}

userManager.addUser(user1)
userManager.addUser(user2)

console.log('所有用户:', userManager.getAllUsers())

userManager.updateUser(1, { age: 26 })

const foundUser = userManager.getUserById(1)
console.log('查找到的用户:', foundUser)`,

      generic: `// TypeScript 泛型示例
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class ApiClient {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟不同的响应
      const responses = {
        '/users': { success: true, data: [{ id: 1, name: 'Alice' }] },
        '/posts': { success: true, data: [{ id: 1, title: 'Hello World' }] }
      }
      
      const response = responses[url as keyof typeof responses] || 
        { success: false, error: 'Not found' }
      
      console.log(\`API调用 \${url}:, response)
      return response as ApiResponse<T>
    } catch (error) {
      console.error('API调用失败:', error)
      return { success: false, error: 'Network error' }
    }
  }
}

// 定义数据类型
interface User {
  id: number
  name: string
}

interface Post {
  id: number
  title: string
}

// 使用泛型API客户端
async function main() {
  const client = new ApiClient()
  
  // 获取用户数据
  const usersResponse = await client.get<User[]>('/users')
  if (usersResponse.success && usersResponse.data) {
    console.log('用户数据:', usersResponse.data)
  }
  
  // 获取文章数据
  const postsResponse = await client.get<Post[]>('/posts')
  if (postsResponse.success && postsResponse.data) {
    console.log('文章数据:', postsResponse.data)
  }
}

main()`
    }
  }

  function loadTemplate(templateKey: string) {
    const [lang, template] = templateKey.split('.')
    if (templates[lang as keyof typeof templates] &&
      templates[lang as keyof typeof templates][template as keyof typeof templates[keyof typeof templates]]) {
      code.value = templates[lang as keyof typeof templates][template as keyof typeof templates[keyof typeof templates]]
      language.value = lang as 'vue' | 'javascript' | 'typescript'
    }
  }

  // 获取可用模板
  function getAvailableTemplates() {
    const result: Array<{ key: string; label: string; language: string }> = []

    Object.entries(templates).forEach(([lang, langTemplates]) => {
      Object.keys(langTemplates).forEach(template => {
        result.push({
          key: `${lang}.${template}`,
          label: `${lang.toUpperCase()} - ${template}`,
          language: lang
        })
      })
    })

    return result
  }

  // 代码统计
  const codeStats = computed(() => {
    const currentCode = code.value
    return {
      lines: currentCode.split('\n').length,
      characters: currentCode.length,
      charactersNoSpaces: currentCode.replace(/\s/g, '').length,
      words: currentCode.split(/\s+/).filter(word => word.length > 0).length
    }
  })

  return {
    // Refs
    previewRef,
    code,
    language,
    autoRefresh,
    componentProps,
    isCompiling,
    compilationError,
    compiledComponent,
    consoleLogs,
    showConsole,

    // Computed
    hasError,
    hasCode,
    canPreview,
    errorCount,
    warningCount,
    codeStats,

    // Methods
    updateCode,
    setLanguage,
    setAutoRefresh,
    updateComponentProps,
    refreshPreview,
    clearPreview,
    toggleConsole,
    clearConsole,
    addConsoleLog,
    loadTemplate,
    getAvailableTemplates,

    // Event handlers
    onCompiled,
    onError,
    onConsole,

    // Templates
    templates
  }
}

// 代码验证工具
export function validateCode(code: string, language: 'vue' | 'javascript' | 'typescript'): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  if (!code.trim()) {
    errors.push('代码不能为空')
    return { isValid: false, errors, warnings }
  }

  switch (language) {
    case 'vue':
      return validateVueCode(code)
    case 'javascript':
      return validateJavaScriptCode(code)
    case 'typescript':
      return validateTypeScriptCode(code)
    default:
      errors.push(`不支持的语言: ${language}`)
      return { isValid: false, errors, warnings }
  }
}

function validateVueCode(code: string) {
  const errors: string[] = []
  const warnings: string[] = []

  // 检查基本的Vue SFC结构
  const hasTemplate = /<template[^>]*>[\s\S]*<\/template>/i.test(code)
  const hasScript = /<script[^>]*>[\s\S]*<\/script>/i.test(code)

  if (!hasTemplate && !hasScript) {
    errors.push('Vue组件必须包含 <template> 或 <script> 标签')
  }

  // 检查模板语法
  if (hasTemplate) {
    const templateMatch = code.match(/<template[^>]*>([\s\S]*)<\/template>/i)
    if (templateMatch) {
      const template = templateMatch[1]

      // 检查未闭合的标签
      const openTags = template.match(/<[^/][^>]*>/g) || []
      const closeTags = template.match(/<\/[^>]*>/g) || []

      if (openTags.length !== closeTags.length) {
        warnings.push('模板中可能存在未闭合的标签')
      }
    }
  }

  // 检查脚本语法
  if (hasScript) {
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*)<\/script>/i)
    if (scriptMatch) {
      const script = scriptMatch[1]
      try {
        new Function(script)
      } catch (error) {
        if (error instanceof SyntaxError) {
          errors.push(`脚本语法错误: ${error.message}`)
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function validateJavaScriptCode(code: string) {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    new Function(code)
  } catch (error) {
    if (error instanceof SyntaxError) {
      errors.push(`JavaScript语法错误: ${error.message}`)
    }
  }

  // 检查常见问题
  if (code.includes('var ')) {
    warnings.push('建议使用 let 或 const 替代 var')
  }

  if (code.includes('==') && !code.includes('===')) {
    warnings.push('建议使用严格相等 === 替代 ==')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function validateTypeScriptCode(code: string) {
  const errors: string[] = []
  const warnings: string[] = []

  // 移除TypeScript特有语法后进行基础验证
  const jsCode = code
    .replace(/:\s*\w+(\[\])?/g, '')
    .replace(/interface\s+\w+\s*{[^}]*}/g, '')
    .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
    .replace(/as\s+\w+/g, '')

  try {
    new Function(jsCode)
  } catch (error) {
    if (error instanceof SyntaxError) {
      errors.push(`TypeScript语法错误: ${error.message}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}