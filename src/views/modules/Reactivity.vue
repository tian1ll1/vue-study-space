<script setup lang="ts">
import { ref, reactive, computed, watch, watchEffect, nextTick } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import CodePreview from '@/components/CodePreview.vue'

defineOptions({
  name: 'ReactivityModule'
})

// 定义示例类型
type ExampleKey = 'ref-basics' | 'reactive-basics' | 'ref-vs-reactive' | 'computed-basics' | 'computed-vs-methods' | 'watch-basics' | 'watchEffect-basics' | 'watch-vs-watchEffect'

// 当前选中的示例
const currentExample = ref<ExampleKey>('ref-basics')

// ref 基础示例数据
const refCount = ref(0)
const refMessage = ref('Hello Vue 3!')
const refUser = ref({
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
})

// reactive 基础示例数据
const reactiveState = reactive({
  count: 0,
  message: 'Hello Reactive!',
  user: {
    name: 'Bob',
    age: 30,
    email: 'bob@example.com'
  },
  todos: [
    { id: 1, text: '学习 Vue 3', completed: false },
    { id: 2, text: '理解响应式系统', completed: true }
  ]
})

// 响应式变化追踪
const changeLog = ref<string[]>([])

// 添加变化日志
function logChange(type: string, property: string, oldValue: any, newValue: any) {
  const timestamp = new Date().toLocaleTimeString()
  changeLog.value.unshift(`[${timestamp}] ${type}.${property}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`)
  if (changeLog.value.length > 15) {
    changeLog.value = changeLog.value.slice(0, 15)
  }
}

// ref 操作函数
function incrementRefCount() {
  const oldValue = refCount.value
  refCount.value++
  logChange('ref', 'count', oldValue, refCount.value)
}

function updateRefMessage() {
  const oldValue = refMessage.value
  refMessage.value = refMessage.value === 'Hello Vue 3!' ? 'Message Updated!' : 'Hello Vue 3!'
  logChange('ref', 'message', oldValue, refMessage.value)
}

function updateRefUser() {
  const oldValue = { ...refUser.value }
  refUser.value = {
    name: refUser.value.name === 'Alice' ? 'Alice Smith' : 'Alice',
    age: refUser.value.age + 1,
    email: refUser.value.email
  }
  logChange('ref', 'user', oldValue, refUser.value)
}

// reactive 操作函数
function incrementReactiveCount() {
  const oldValue = reactiveState.count
  reactiveState.count++
  logChange('reactive', 'count', oldValue, reactiveState.count)
}

function updateReactiveMessage() {
  const oldValue = reactiveState.message
  reactiveState.message = reactiveState.message === 'Hello Reactive!' ? 'Reactive Updated!' : 'Hello Reactive!'
  logChange('reactive', 'message', oldValue, reactiveState.message)
}

function updateReactiveUser() {
  const oldValue = { ...reactiveState.user }
  reactiveState.user.name = reactiveState.user.name === 'Bob' ? 'Bob Johnson' : 'Bob'
  reactiveState.user.age++
  logChange('reactive', 'user', oldValue, reactiveState.user)
}

function addTodo() {
  const newTodo = {
    id: Date.now(),
    text: `新任务 ${reactiveState.todos.length + 1}`,
    completed: false
  }
  reactiveState.todos.push(newTodo)
  logChange('reactive', 'todos', 'add', newTodo)
}

function toggleTodo(index: number) {
  const todo = reactiveState.todos[index]
  const oldValue = todo.completed
  todo.completed = !todo.completed
  logChange('reactive', `todos[${index}].completed`, oldValue, todo.completed)
}

// 清空日志
function clearLog() {
  changeLog.value = []
}

// computed 示例数据
const computedMessage = ref('Hello Computed!')
const computedPrice = ref(100)
const computedQuantity = ref(2)
const computedTaxRate = ref(10)
const computedFirstName = ref('张')
const computedLastName = ref('三')

// computed 计算属性
const reversedComputedMessage = computed(() => {
  logChange('computed', 'reversedMessage', 'calculating', 'new value')
  return computedMessage.value.split('').reverse().join('')
})

const computedSubtotal = computed(() => computedPrice.value * computedQuantity.value)
const computedTaxAmount = computed(() => computedSubtotal.value * (computedTaxRate.value / 100))
const computedTotal = computed(() => computedSubtotal.value + computedTaxAmount.value)

const computedFullName = computed({
  get() {
    return computedFirstName.value + ' ' + computedLastName.value
  },
  set(newValue: string) {
    const names = newValue.split(' ')
    computedFirstName.value = names[0] || ''
    computedLastName.value = names[1] || ''
    logChange('computed', 'fullName', 'setter called', newValue)
  }
})

// computed 操作函数
function updateComputedMessage() {
  const oldValue = computedMessage.value
  computedMessage.value = computedMessage.value === 'Hello Computed!' ? 'Computed Updated!' : 'Hello Computed!'
  logChange('ref', 'computedMessage', oldValue, computedMessage.value)
}

function updateComputedPrice() {
  const oldValue = computedPrice.value
  computedPrice.value = Math.floor(Math.random() * 200) + 50
  logChange('ref', 'computedPrice', oldValue, computedPrice.value)
}

function updateComputedFullName() {
  const names = ['李 四', '王 五', '赵 六', '张 三']
  const randomName = names[Math.floor(Math.random() * names.length)]
  computedFullName.value = randomName
}

// watch 示例数据
const watchedInput = ref('')
const watchedUser = ref({
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
})
const watchCounter = ref(0)
const watchLogs = ref<string[]>([])

// watchEffect 示例数据
const watchEffectName = ref('张')
const watchEffectSurname = ref('三')
const watchEffectUserId = ref(1)
const watchEffectUserInfo = ref<any>(null)
const watchEffectLoading = ref(false)
const watchEffectLogs = ref<string[]>([])

// watch 监听器设置
watch(watchedInput, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    const log = `输入变化: "${oldValue}" → "${newValue}"`
    watchLogs.value.unshift(log)
    logChange('watch', 'input', oldValue, newValue)
    if (watchLogs.value.length > 10) {
      watchLogs.value = watchLogs.value.slice(0, 10)
    }
  }
})

watch(watchedUser, (newUser) => {
  const log = `用户对象变化: ${JSON.stringify(newUser)}`
  watchLogs.value.unshift(log)
  logChange('watch', 'user', 'object changed', newUser)
  if (watchLogs.value.length > 10) {
    watchLogs.value = watchLogs.value.slice(0, 10)
  }
}, { deep: true })

watch(watchCounter, (newValue) => {
  const log = `计数器: ${newValue} (${new Date().toLocaleTimeString()})`
  watchLogs.value.unshift(log)
  logChange('watch', 'counter', 'changed', newValue)
  if (watchLogs.value.length > 10) {
    watchLogs.value = watchLogs.value.slice(0, 10)
  }
}, { immediate: true })

// watchEffect 设置
const watchEffectFullName = ref('')
watchEffect(() => {
  watchEffectFullName.value = watchEffectName.value + ' ' + watchEffectSurname.value
  const log = `watchEffect 执行: ${watchEffectFullName.value}`
  watchEffectLogs.value.unshift(log)
  logChange('watchEffect', 'fullName', 'calculated', watchEffectFullName.value)
  if (watchEffectLogs.value.length > 10) {
    watchEffectLogs.value = watchEffectLogs.value.slice(0, 10)
  }
})

watchEffect(async () => {
  if (watchEffectUserId.value) {
    watchEffectLoading.value = true
    const log = `开始加载用户 ${watchEffectUserId.value}`
    watchEffectLogs.value.unshift(log)
    logChange('watchEffect', 'userLoad', 'start', watchEffectUserId.value)

    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      watchEffectUserInfo.value = {
        id: watchEffectUserId.value,
        name: `用户${watchEffectUserId.value}`,
        email: `user${watchEffectUserId.value}@example.com`
      }
      const successLog = `用户 ${watchEffectUserId.value} 加载完成`
      watchEffectLogs.value.unshift(successLog)
      logChange('watchEffect', 'userLoad', 'success', watchEffectUserInfo.value)
    } finally {
      watchEffectLoading.value = false
    }

    if (watchEffectLogs.value.length > 10) {
      watchEffectLogs.value = watchEffectLogs.value.slice(0, 10)
    }
  }
})

// watch 操作函数
function updateWatchedInput() {
  const messages = ['Hello Watch!', 'Vue 3 很棒!', 'Watch 监听器', 'Hello Watch!']
  const currentIndex = messages.indexOf(watchedInput.value)
  const nextIndex = (currentIndex + 1) % messages.length
  watchedInput.value = messages[nextIndex]
}

function updateWatchedUser() {
  watchedUser.value = {
    name: watchedUser.value.name === 'Alice' ? 'Alice Smith' : 'Alice',
    age: watchedUser.value.age + 1,
    email: watchedUser.value.email
  }
}

function randomWatchEffectUserId() {
  watchEffectUserId.value = Math.floor(Math.random() * 10) + 1
}

function clearWatchLogs() {
  watchLogs.value = []
  watchEffectLogs.value = []
}

// 示例代码生成函数
function getRefBasicsExample(): string {
  return `<template>
  <div class="demo-container">
    <h3>ref 基础用法</h3>
    
    <!-- 基本类型的 ref -->
    <div class="section">
      <h4>基本类型响应式</h4>
      <p>计数器: {{ count }}</p>
      <button @click="increment">增加</button>
      <button @click="reset">重置</button>
    </div>
    
    <!-- 对象类型的 ref -->
    <div class="section">
      <h4>对象类型响应式</h4>
      <p>用户: {{ user.name }} ({{ user.age }}岁)</p>
      <button @click="updateUser">更新用户</button>
    </div>
  </div>
</template>

<script>
const { ref } = Vue

const componentOptions = {
  setup() {
    const count = ref(0)
    const user = ref({ name: 'Alice', age: 25 })
    
    function increment() { count.value++ }
    function reset() { count.value = 0 }
    function updateUser() {
      user.value = {
        name: user.value.name === 'Alice' ? 'Alice Smith' : 'Alice',
        age: user.value.age + 1
      }
    }
    
    return { count, user, increment, reset, updateUser }
  }
}
<\/script>`
}

function getReactiveBasicsExample(): string {
  return `<template>
  <div class="demo-container">
    <h3>reactive 基础用法</h3>
    
    <div class="section">
      <h4>响应式对象</h4>
      <p>计数: {{ state.count }}</p>
      <p>消息: {{ state.message }}</p>
      <button @click="state.count++">增加计数</button>
      <button @click="updateMessage">更新消息</button>
    </div>
  </div>
</template>

<script>
const { reactive } = Vue

const componentOptions = {
  setup() {
    const state = reactive({
      count: 0,
      message: 'Hello Reactive!'
    })
    
    function updateMessage() {
      state.message = state.message === 'Hello Reactive!' 
        ? 'Message Updated!' 
        : 'Hello Reactive!'
    }
    
    return { state, updateMessage }
  }
}
<\/script>`
}

function getRefVsReactiveExample(): string {
  return `<template>
  <div class="demo-container">
    <h3>ref vs reactive 对比</h3>
    
    <div class="comparison-grid">
      <div class="comparison-section">
        <h4>使用 ref</h4>
        <p>基本类型: {{ refCount }}</p>
        <p>对象: {{ refUser.name }} ({{ refUser.age }}岁)</p>
        <button @click="incrementRef">ref 计数+1</button>
      </div>
      
      <div class="comparison-section">
        <h4>使用 reactive</h4>
        <p>计数: {{ reactiveState.count }}</p>
        <p>用户: {{ reactiveState.user.name }} ({{ reactiveState.user.age }}岁)</p>
        <button @click="incrementReactive">reactive 计数+1</button>
      </div>
    </div>
  </div>
</template>

<script>
const { ref, reactive } = Vue

const componentOptions = {
  setup() {
    const refCount = ref(0)
    const refUser = ref({ name: 'Alice', age: 25 })
    const reactiveState = reactive({ count: 0, user: { name: 'Bob', age: 30 } })
    
    function incrementRef() { refCount.value++ }
    function incrementReactive() { reactiveState.count++ }
    
    return { refCount, refUser, reactiveState, incrementRef, incrementReactive }
  }
}
<\/script>`
}

function getComputedBasicsExample(): string {
  return `<template>
  <div class="demo-container">
    <h3>computed 计算属性基础</h3>
    
    <div class="section">
      <h4>基础计算属性</h4>
      <p>原始数据: {{ message }}</p>
      <p>计算结果: {{ reversedMessage }}</p>
      <p>字符长度: {{ messageLength }}</p>
      <button @click="updateMessage">更新消息</button>
    </div>
  </div>
</template>

<script>
const { ref, computed } = Vue

const componentOptions = {
  setup() {
    const message = ref('Hello Vue 3!')
    
    const reversedMessage = computed(() => {
      return message.value.split('').reverse().join('')
    })
    
    const messageLength = computed(() => message.value.length)
    
    function updateMessage() {
      message.value = message.value === 'Hello Vue 3!' ? 'Vue 3 很棒!' : 'Hello Vue 3!'
    }
    
    return { message, reversedMessage, messageLength, updateMessage }
  }
}
<\/script>`
}

function getComputedVsMethodsExample(): string {
  return `<template>
  <div class="demo-container">
    <h3>computed vs methods 性能对比</h3>
    
    <div class="comparison-grid">
      <div class="comparison-section">
        <h4>computed 计算属性 (有缓存)</h4>
        <p>计算次数: {{ computedCallCount }}</p>
        <p>昂贵计算结果: {{ expensiveComputed }}</p>
        <p>再次访问: {{ expensiveComputed }}</p>
        <button @click="triggerRecompute">触发重新计算</button>
      </div>
      
      <div class="comparison-section">
        <h4>methods 方法 (无缓存)</h4>
        <p>调用次数: {{ methodCallCount }}</p>
        <p>昂贵计算结果: {{ expensiveMethod() }}</p>
        <p>再次调用: {{ expensiveMethod() }}</p>
        <button @click="resetMethodCount">重置计数</button>
      </div>
    </div>
  </div>
</template>

<script>
const { ref, computed } = Vue

const componentOptions = {
  setup() {
    const computedCallCount = ref(0)
    const methodCallCount = ref(0)
    const trigger = ref(0)
    
    const expensiveComputed = computed(() => {
      computedCallCount.value++
      let result = 0
      for (let i = 0; i < 1000000; i++) {
        result += Math.random()
      }
      return result.toFixed(2) + ' (依赖: ' + trigger.value + ')'
    })
    
    function expensiveMethod() {
      methodCallCount.value++
      let result = 0
      for (let i = 0; i < 1000000; i++) {
        result += Math.random()
      }
      return result.toFixed(2)
    }
    
    function triggerRecompute() { trigger.value++ }
    function resetMethodCount() { methodCallCount.value = 0 }
    
    return {
      computedCallCount, methodCallCount, expensiveComputed,
      expensiveMethod, triggerRecompute, resetMethodCount
    }
  }
}
<\/script>`
}

function getWatchBasicsExample(): string {
  return `<template>
  <div class="demo-container">
    <h3>watch 监听器基础</h3>
    
    <div class="section">
      <h4>基础 watch 用法</h4>
      <label>监听的值: <input v-model="watchedValue" /></label>
      <p>当前值: {{ watchedValue }}</p>
      
      <div class="watch-log">
        <h5>watch 日志:</h5>
        <div v-for="(log, index) in watchLogs" :key="index">{{ log }}</div>
      </div>
    </div>
  </div>
</template>

<script>
const { ref, watch } = Vue

const componentOptions = {
  setup() {
    const watchedValue = ref('')
    const watchLogs = ref([])
    
    watch(watchedValue, (newValue, oldValue) => {
      const log = \`值变化: "\${oldValue}" → "\${newValue}"\`
      watchLogs.value.unshift(log)
      if (watchLogs.value.length > 5) watchLogs.value.pop()
    })
    
    return { watchedValue, watchLogs }
  }
}
<\/script>`
}

function getWatchEffectExample(): string {
  return `<template>
  <div class="demo-container">
    <h3>watchEffect 自动依赖追踪</h3>
    
    <div class="section">
      <h4>watchEffect 基础用法</h4>
      <label>名字: <input v-model="firstName" /></label>
      <label>姓氏: <input v-model="lastName" /></label>
      <p>全名: {{ fullName }}</p>
      
      <div class="watch-log">
        <h5>watchEffect 日志:</h5>
        <div v-for="(log, index) in effectLogs" :key="index">{{ log }}</div>
      </div>
    </div>
  </div>
</template>

<script>
const { ref, watchEffect } = Vue

const componentOptions = {
  setup() {
    const firstName = ref('张')
    const lastName = ref('三')
    const fullName = ref('')
    const effectLogs = ref([])
    
    watchEffect(() => {
      fullName.value = firstName.value + ' ' + lastName.value
      const log = \`watchEffect 执行: \${fullName.value}\`
      effectLogs.value.unshift(log)
      if (effectLogs.value.length > 5) effectLogs.value.pop()
    })
    
    return { firstName, lastName, fullName, effectLogs }
  }
}
<\/script>`
}

function getWatchVsWatchEffectExample(): string {
  return `<template>
  <div class="demo-container">
    <h3>watch vs watchEffect 对比</h3>
    
    <div class="comparison-grid">
      <div class="comparison-section">
        <h4>watch - 明确指定依赖</h4>
        <label>搜索关键词: <input v-model="searchTerm" /></label>
        <p>搜索结果: {{ watchSearchResult }}</p>
      </div>
      
      <div class="comparison-section">
        <h4>watchEffect - 自动依赖追踪</h4>
        <label>用户名: <input v-model="username" /></label>
        <label>域名: <input v-model="domain" /></label>
        <p>生成结果: {{ effectResult }}</p>
      </div>
    </div>
  </div>
</template>

<script>
const { ref, watch, watchEffect } = Vue

const componentOptions = {
  setup() {
    const searchTerm = ref('')
    const watchSearchResult = ref('请输入搜索关键词')
    
    watch(searchTerm, (newTerm) => {
      watchSearchResult.value = newTerm ? \`搜索 "\${newTerm}"\` : '请输入搜索关键词'
    }, { immediate: true })
    
    const username = ref('')
    const domain = ref('')
    const effectResult = ref('请填写完整信息')
    
    watchEffect(() => {
      if (username.value && domain.value) {
        effectResult.value = \`\${username.value}@\${domain.value}\`
      } else {
        effectResult.value = '请填写完整信息'
      }
    })
    
    return { searchTerm, watchSearchResult, username, domain, effectResult }
  }
}
<\/script>`
}

// 示例代码对象
const examples = reactive({
  'ref-basics': {
    title: 'ref 基础用法',
    description: '学习 ref 的基本使用方法，理解 .value 的概念',
    get code() { return getRefBasicsExample() }
  },
  'reactive-basics': {
    title: 'reactive 基础用法',
    description: '学习 reactive 的基本使用方法，理解深度响应式',
    get code() { return getReactiveBasicsExample() }
  },
  'ref-vs-reactive': {
    title: 'ref vs reactive 对比',
    description: '对比 ref 和 reactive 的使用场景和差异',
    get code() { return getRefVsReactiveExample() }
  },
  'computed-basics': {
    title: 'computed 计算属性',
    description: '学习 computed 的基本用法和缓存机制',
    get code() { return getComputedBasicsExample() }
  },
  'computed-vs-methods': {
    title: 'computed vs methods',
    description: '对比 computed 和 methods 的性能差异，与 React useMemo 对比',
    get code() { return getComputedVsMethodsExample() }
  },
  'watch-basics': {
    title: 'watch 监听器',
    description: '学习 watch 的基本用法、深度监听和立即执行',
    get code() { return getWatchBasicsExample() }
  },
  'watchEffect-basics': {
    title: 'watchEffect 自动追踪',
    description: '学习 watchEffect 的自动依赖追踪和异步处理',
    get code() { return getWatchEffectExample() }
  },
  'watch-vs-watchEffect': {
    title: 'watch vs watchEffect',
    description: '对比 watch 和 watchEffect 的差异，与 React useEffect 对比',
    get code() { return getWatchVsWatchEffectExample() }
  }
})

// 当前编辑的代码
const currentCode = ref('')

// 初始化代码
nextTick(() => {
  currentCode.value = examples['ref-basics'].code
})

// 切换示例
function selectExample(exampleKey: ExampleKey) {
  currentExample.value = exampleKey
  currentCode.value = examples[exampleKey].code
}

// 处理代码变化
function handleCodeChange(newCode: string) {
  currentCode.value = newCode
}

// 运行代码
function handleRunCode(code: string) {
  console.log('运行代码:', code)
}
</script>

<template>
  <div class="module-container">
    <div class="module-header">
      <h1>Vue 3 响应式系统</h1>
      <p class="module-description">
        学习Vue 3的响应式系统核心概念：ref、reactive、computed、watch 和 watchEffect。理解它们的区别、使用场景和最佳实践。
      </p>
    </div>

    <!-- 示例选择器 -->
    <div class="example-selector">
      <h2>选择学习内容</h2>
      <div class="example-tabs">
        <button v-for="(example, key) in examples" :key="key" :class="{ active: currentExample === key }"
          @click="selectExample(key)" class="example-tab">
          {{ example.title }}
        </button>
      </div>
    </div>

    <!-- 当前示例信息 -->
    <div class="current-example-info">
      <h3>{{ examples[currentExample].title }}</h3>
      <p>{{ examples[currentExample].description }}</p>
    </div>

    <!-- 交互式演示区域 -->
    <div class="interactive-demo">
      <h3>🎯 交互式演示</h3>

      <div class="demo-grid">
        <!-- ref 演示 -->
        <div class="demo-section">
          <h4>ref 响应式演示</h4>
          <div class="demo-content">
            <div class="data-display">
              <p><strong>计数:</strong> {{ refCount }}</p>
              <p><strong>消息:</strong> {{ refMessage }}</p>
              <p><strong>用户:</strong> {{ refUser.name }} ({{ refUser.age }}岁)</p>
            </div>
            <div class="controls">
              <button @click="incrementRefCount">ref 计数 +1</button>
              <button @click="updateRefMessage">更新 ref 消息</button>
              <button @click="updateRefUser">更新 ref 用户</button>
            </div>
          </div>
        </div>

        <!-- reactive 演示 -->
        <div class="demo-section">
          <h4>reactive 响应式演示</h4>
          <div class="demo-content">
            <div class="data-display">
              <p><strong>计数:</strong> {{ reactiveState.count }}</p>
              <p><strong>消息:</strong> {{ reactiveState.message }}</p>
              <p><strong>用户:</strong> {{ reactiveState.user.name }} ({{ reactiveState.user.age }}岁)</p>
            </div>
            <div class="controls">
              <button @click="incrementReactiveCount">reactive 计数 +1</button>
              <button @click="updateReactiveMessage">更新 reactive 消息</button>
              <button @click="updateReactiveUser">更新 reactive 用户</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Todo 列表演示 -->
      <div class="todo-demo">
        <h4>reactive 数组操作演示</h4>
        <div class="todo-content">
          <div class="todo-list">
            <div v-for="(todo, index) in reactiveState.todos" :key="todo.id" class="todo-item">
              <span :class="{ completed: todo.completed }">{{ todo.text }}</span>
              <button @click="toggleTodo(index)" class="toggle-btn">
                {{ todo.completed ? '✓' : '○' }}
              </button>
            </div>
          </div>
          <button @click="addTodo" class="add-btn">添加新任务</button>
        </div>
      </div>
    </div>

    <!-- computed 计算属性演示 -->
    <div class="computed-demo">
      <h3>🧮 computed 计算属性演示</h3>

      <div class="computed-grid">
        <!-- 基础计算属性 -->
        <div class="computed-section">
          <h4>基础计算属性</h4>
          <div class="computed-content">
            <div class="data-display">
              <p><strong>原始消息:</strong> {{ computedMessage }}</p>
              <p><strong>反转消息:</strong> {{ reversedComputedMessage }}</p>
              <p><strong>消息长度:</strong> {{ computedMessage.length }}</p>
            </div>
            <div class="controls">
              <button @click="updateComputedMessage">更新消息</button>
            </div>
          </div>
        </div>

        <!-- 复杂计算属性 -->
        <div class="computed-section">
          <h4>复杂计算属性链</h4>
          <div class="computed-content">
            <div class="data-display">
              <p><strong>价格:</strong> ¥{{ computedPrice }}</p>
              <p><strong>数量:</strong> {{ computedQuantity }}</p>
              <p><strong>税率:</strong> {{ computedTaxRate }}%</p>
              <hr>
              <p><strong>小计:</strong> ¥{{ computedSubtotal.toFixed(2) }}</p>
              <p><strong>税额:</strong> ¥{{ computedTaxAmount.toFixed(2) }}</p>
              <p class="total"><strong>总计:</strong> ¥{{ computedTotal.toFixed(2) }}</p>
            </div>
            <div class="controls">
              <button @click="updateComputedPrice">随机价格</button>
              <button @click="computedQuantity++">数量+1</button>
              <button @click="computedTaxRate = computedTaxRate === 10 ? 15 : 10">切换税率</button>
            </div>
          </div>
        </div>

        <!-- 可写计算属性 -->
        <div class="computed-section">
          <h4>可写计算属性</h4>
          <div class="computed-content">
            <div class="data-display">
              <p><strong>姓:</strong> {{ computedFirstName }}</p>
              <p><strong>名:</strong> {{ computedLastName }}</p>
              <p><strong>全名:</strong> {{ computedFullName }}</p>
            </div>
            <div class="controls">
              <input v-model="computedFullName" placeholder="输入 姓 名" class="name-input" />
              <button @click="updateComputedFullName">随机姓名</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- watch 和 watchEffect 演示 -->
    <div class="watch-demo">
      <h3>👁️ watch 和 watchEffect 演示</h3>

      <div class="watch-grid">
        <!-- watch 基础演示 -->
        <div class="watch-section">
          <h4>watch 监听器</h4>
          <div class="watch-content">
            <div class="data-display">
              <p><strong>监听输入:</strong> {{ watchedInput }}</p>
              <p><strong>用户:</strong> {{ watchedUser.name }} ({{ watchedUser.age }}岁)</p>
              <p><strong>计数器:</strong> {{ watchCounter }}</p>
            </div>
            <div class="controls">
              <input v-model="watchedInput" placeholder="输入内容测试 watch" class="watch-input" />
              <button @click="updateWatchedInput">更新输入</button>
              <button @click="updateWatchedUser">更新用户</button>
              <button @click="watchCounter++">计数器+1</button>
            </div>
          </div>
        </div>

        <!-- watchEffect 演示 -->
        <div class="watch-section">
          <h4>watchEffect 自动追踪</h4>
          <div class="watch-content">
            <div class="data-display">
              <p><strong>姓名:</strong> {{ watchEffectName }} {{ watchEffectSurname }}</p>
              <p><strong>全名:</strong> {{ watchEffectFullName }}</p>
              <p><strong>用户ID:</strong> {{ watchEffectUserId }}</p>
              <div v-if="watchEffectLoading" class="loading">加载中...</div>
              <div v-else-if="watchEffectUserInfo" class="user-info">
                <p><strong>用户信息:</strong> {{ watchEffectUserInfo.name }}</p>
                <p><strong>邮箱:</strong> {{ watchEffectUserInfo.email }}</p>
              </div>
            </div>
            <div class="controls">
              <input v-model="watchEffectName" placeholder="姓" class="name-input" />
              <input v-model="watchEffectSurname" placeholder="名" class="name-input" />
              <button @click="randomWatchEffectUserId">随机用户ID</button>
            </div>
          </div>
        </div>
      </div>

      <!-- watch 日志 -->
      <div class="watch-logs">
        <div class="log-header">
          <h4>📋 watch 监听日志</h4>
          <button @click="clearWatchLogs" class="clear-btn">清空日志</button>
        </div>
        <div class="log-content">
          <div v-if="watchLogs.length === 0" class="empty-log">
            暂无 watch 日志，试试上面的操作！
          </div>
          <div v-for="(log, index) in watchLogs" :key="index" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>

      <!-- watchEffect 日志 -->
      <div class="watch-logs">
        <div class="log-header">
          <h4>🔄 watchEffect 执行日志</h4>
        </div>
        <div class="log-content">
          <div v-if="watchEffectLogs.length === 0" class="empty-log">
            暂无 watchEffect 日志
          </div>
          <div v-for="(log, index) in watchEffectLogs" :key="index" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>
    </div>

    <!-- 响应式变化日志 -->
    <div class="change-log">
      <div class="log-header">
        <h3>📊 响应式变化追踪</h3>
        <button @click="clearLog" class="clear-btn">清空日志</button>
      </div>
      <div class="log-content">
        <div v-if="changeLog.length === 0" class="empty-log">
          暂无变化记录，试试上面的按钮！
        </div>
        <div v-for="(log, index) in changeLog" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>

    <!-- 代码编辑和预览区域 -->
    <div class="editor-preview-container">
      <!-- 代码编辑器 -->
      <div class="editor-section">
        <h4>编辑代码</h4>
        <CodeEditor v-model="currentCode" language="vue" height="500px" @change="handleCodeChange"
          @run="handleRunCode" />
      </div>

      <!-- 代码预览 -->
      <div class="preview-section">
        <h4>实时预览</h4>
        <CodePreview :code="currentCode" language="vue" :auto-refresh="true" />
      </div>
    </div>

    <!-- 学习要点 -->
    <div class="learning-points">
      <h3>学习要点</h3>
      <div class="points-grid">
        <div class="point-card">
          <h4>🔗 ref 特性</h4>
          <ul>
            <li>适用于基本类型和对象</li>
            <li>JavaScript 中需要 <code>.value</code> 访问</li>
            <li>模板中自动解包</li>
            <li>可以重新分配整个值</li>
            <li>提供明确的响应式边界</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>🎯 reactive 特性</h4>
          <ul>
            <li>只适用于对象类型</li>
            <li>深度响应式转换</li>
            <li>直接访问属性，无需 <code>.value</code></li>
            <li>不能重新分配整个对象</li>
            <li>更接近传统对象操作</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>🧮 computed 特性</h4>
          <ul>
            <li>基于响应式依赖的缓存</li>
            <li>自动依赖追踪</li>
            <li>惰性计算，按需执行</li>
            <li>支持 getter 和 setter</li>
            <li>比 methods 更高效</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>👁️ watch 特性</h4>
          <ul>
            <li>明确指定监听的数据源</li>
            <li>提供新值和旧值参数</li>
            <li>支持深度监听和立即执行</li>
            <li>适合特定数据变化处理</li>
            <li>可以监听多个数据源</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>🔄 watchEffect 特性</h4>
          <ul>
            <li>自动追踪函数内的依赖</li>
            <li>默认立即执行</li>
            <li>适合副作用和自动计算</li>
            <li>无法访问旧值</li>
            <li>类似 React useEffect</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>🔄 与 React 对比</h4>
          <ul>
            <li><strong>Vue watch:</strong> 明确数据源</li>
            <li><strong>Vue watchEffect:</strong> 类似 useEffect</li>
            <li><strong>Vue:</strong> 自动依赖追踪</li>
            <li><strong>React:</strong> 手动依赖数组</li>
            <li>Vue 调试更容易</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.module-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.module-header {
  text-align: center;
  margin-bottom: 2rem;
}

.module-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.module-description {
  color: #7f8c8d;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.example-selector {
  margin-bottom: 2rem;
}

.example-selector h2 {
  color: #34495e;
  margin-bottom: 1rem;
}

.example-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.example-tab {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  background: white;
  color: #5a6c7d;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.example-tab:hover {
  border-color: #42b883;
  color: #42b883;
}

.example-tab.active {
  background: #42b883;
  border-color: #42b883;
  color: white;
}

.current-example-info {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #42b883;
}

.current-example-info h3 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.current-example-info p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
}

.interactive-demo {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.interactive-demo h3 {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.demo-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.demo-section h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-display {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e0e6ed;
}

.data-display p {
  margin: 0.5rem 0;
  color: #5a6c7d;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.controls button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #42b883;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 0.9rem;
}

.controls button:hover {
  background: #369870;
}

.todo-demo {
  background: #f0f8ff;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.todo-demo h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.todo-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.todo-list {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e0e6ed;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item span {
  color: #5a6c7d;
}

.todo-item span.completed {
  text-decoration: line-through;
  color: #95a5a6;
}

.toggle-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 50%;
  background: #ecf0f1;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 30px;
  height: 30px;
}

.toggle-btn:hover {
  background: #42b883;
  color: white;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background: #3498db;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
  align-self: flex-start;
}

.add-btn:hover {
  background: #2980b9;
}

.computed-demo {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.computed-demo h3 {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.computed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.computed-section {
  background: #f0f8ff;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.computed-section h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.computed-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.computed-content .data-display {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e0e6ed;
}

.computed-content .data-display hr {
  border: none;
  border-top: 1px solid #e0e6ed;
  margin: 0.5rem 0;
}

.computed-content .data-display .total {
  background: #e8f5e8;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0.5rem 0 0 0;
}

.name-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 150px;
}

.watch-demo {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.watch-demo h3 {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.watch-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.watch-section {
  background: #fff3e0;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.watch-section h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.watch-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.watch-content .data-display {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e0e6ed;
}

.watch-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 200px;
  margin-bottom: 0.5rem;
}

.loading {
  color: #ff9800;
  font-style: italic;
  padding: 0.5rem;
  background: #fff3e0;
  border-radius: 4px;
}

.user-info {
  background: #e8f5e8;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.watch-logs {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #6c757d;
  margin-bottom: 1rem;
}

.watch-logs .log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.watch-logs .log-header h4 {
  color: #2c3e50;
  margin: 0;
}

.watch-logs .log-content {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  max-height: 200px;
  overflow-y: auto;
}

.watch-logs .empty-log {
  color: #95a5a6;
  text-align: center;
  font-style: italic;
}

.watch-logs .log-item {
  padding: 0.25rem 0;
  border-bottom: 1px solid #34495e;
}

.watch-logs .log-item:last-child {
  border-bottom: none;
}

.change-log {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.log-header h3 {
  color: #2c3e50;
  margin: 0;
}

.clear-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #e74c3c;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
}

.clear-btn:hover {
  background: #c0392b;
}

.log-content {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  max-height: 300px;
  overflow-y: auto;
}

.empty-log {
  color: #95a5a6;
  text-align: center;
  font-style: italic;
}

.log-item {
  padding: 0.25rem 0;
  border-bottom: 1px solid #34495e;
}

.log-item:last-child {
  border-bottom: none;
}

.editor-preview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.editor-section,
.preview-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.editor-section h4,
.preview-section h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.learning-points {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.learning-points h3 {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.point-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.point-card h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.point-card ul {
  margin: 0;
  padding-left: 1.2rem;
}

.point-card li {
  color: #5a6c7d;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.point-card code {
  background: #e8f4fd;
  color: #0366d6;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .editor-preview-container {
    grid-template-columns: 1fr;
  }

  .demo-grid {
    grid-template-columns: 1fr;
  }

  .watch-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .module-container {
    padding: 1rem;
  }

  .module-header h1 {
    font-size: 2rem;
  }

  .example-tabs {
    flex-direction: column;
  }

  .example-tab {
    text-align: center;
  }

  .points-grid {
    grid-template-columns: 1fr;
  }

  .log-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .controls {
    justify-content: center;
  }
}
</style>
< /style>