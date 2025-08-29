<template>
  <div class="composition-api-module">
    <div class="module-header">
      <h1>Composition API 学习模块</h1>
      <p class="module-description">
        学习Vue 3的Composition API，包括setup函数基础、与Options API的对比，以及setup函数的参数使用。
      </p>
    </div>

    <div class="example-tabs">
      <button v-for="(example, key) in examples" :key="key" :class="['tab-button', { active: currentExample === key }]"
        @click="selectExample(key)">
        {{ example.title }}
      </button>
    </div>

    <div class="example-content">
      <div class="example-info">
        <h3>{{ examples[currentExample]?.title }}</h3>
        <p>{{ examples[currentExample]?.description }}</p>
      </div>

      <div class="code-section">
        <div class="code-editor-container">
          <h4>代码编辑器</h4>
          <CodeEditor v-model="currentCode" language="vue" :height="'500px'" :readonly="true" />
        </div>

        <div class="code-preview-container">
          <h4>实时预览</h4>
          <CodePreview :code="currentCode" :height="'500px'" />
        </div>
      </div>
    </div>

    <div class="learning-points">
      <h3>关键学习点</h3>
      <div class="points-grid">
        <div class="point-card">
          <h4>setup函数基础</h4>
          <ul>
            <li>setup是Composition API的入口点</li>
            <li>在组件创建之前执行</li>
            <li>必须返回一个对象供模板使用</li>
            <li>可以访问props和context参数</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>组合式函数</h4>
          <ul>
            <li>以use开头的函数命名约定</li>
            <li>封装可复用的响应式逻辑</li>
            <li>返回响应式数据和方法</li>
            <li>支持参数配置和选项</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>script setup语法</h4>
          <ul>
            <li>更简洁的组件定义方式</li>
            <li>顶层绑定自动暴露给模板</li>
            <li>编译时宏: defineProps, defineEmits</li>
            <li>更好的TypeScript类型推断</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>与Options API对比</h4>
          <ul>
            <li>更好的逻辑复用和组织</li>
            <li>更好的TypeScript支持</li>
            <li>更灵活的代码组织方式</li>
            <li>可以与Options API混合使用</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>setup函数参数</h4>
          <ul>
            <li>props: 响应式的props对象</li>
            <li>context.attrs: 非props的属性</li>
            <li>context.slots: 插槽对象</li>
            <li>context.emit: 触发事件的函数</li>
            <li>context.expose: 暴露公共方法</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>最佳实践</h4>
          <ul>
            <li>按功能组织相关逻辑</li>
            <li>提取可复用的组合式函数</li>
            <li>合理使用ref和reactive</li>
            <li>优先使用script setup语法</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="comparison-section">
      <h3>与React Hooks对比</h3>
      <div class="comparison-grid">
        <div class="vue-side">
          <h4>Vue 3 Composition API</h4>
          <pre><code>// Vue 3 setup函数
export default {
  setup() {
    const count = ref(0)
    const increment = () => count.value++
    
    onMounted(() => {
      console.log('mounted')
    })
    
    return { count, increment }
  }
}</code></pre>
        </div>

        <div class="react-side">
          <h4>React Hooks</h4>
          <pre><code>// React函数组件
function MyComponent() {
  const [count, setCount] = useState(0)
  const increment = () => setCount(c => c + 1)
  
  useEffect(() => {
    console.log('mounted')
  }, [])
  
  return { count, increment }
}</code></pre>
        </div>
      </div>

      <div class="comparison-notes">
        <h4>主要差异</h4>
        <ul>
          <li><strong>执行时机</strong>: Vue的setup只执行一次，React的函数组件每次渲染都执行</li>
          <li><strong>响应式</strong>: Vue使用ref/reactive，React使用useState</li>
          <li><strong>副作用</strong>: Vue使用onMounted等生命周期，React使用useEffect</li>
          <li><strong>返回值</strong>: Vue需要显式返回，React直接返回JSX</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import CodePreview from '@/components/CodePreview.vue'

defineOptions({
  name: 'CompositionAPIModule'
})

// 当前选中的示例
const currentExample = ref<'setup-basics' | 'composables' | 'script-setup' | 'options-comparison' | 'react-hooks' | 'setup-context'>('setup-basics')

// 示例代码常量
const composablesCode = `<template>
  <div class="composables-demo">
    <h3>组合式函数示例</h3>
    
    <div class="counter-section">
      <h4>useCounter 组合式函数</h4>
      <p>当前计数: <strong>{{ count }}</strong></p>
      <p>双倍计数: <strong>{{ doubleCount }}</strong></p>
      <p>是否为偶数: <strong>{{ isEven ? '是' : '否' }}</strong></p>
      <div class="button-group">
        <button @click="increment">增加</button>
        <button @click="decrement">减少</button>
        <button @click="reset">重置</button>
      </div>
    </div>

    <div class="toggle-section">
      <h4>useToggle 组合式函数</h4>
      <p>开关状态: <strong>{{ isOn ? '开启' : '关闭' }}</strong></p>
      <button @click="toggle">切换状态</button>
      <button @click="setToggle(true)">强制开启</button>
      <button @click="setToggle(false)">强制关闭</button>
    </div>

    <div class="storage-section">
      <h4>useLocalStorage 组合式函数</h4>
      <input v-model="username" placeholder="输入用户名" />
      <p>存储的用户名: <strong>{{ username }}</strong></p>
      <small>刷新页面后数据仍然保持</small>
    </div>

    <div class="multi-toggle-section">
      <h4>useMultiToggle 组合式函数</h4>
      <p>当前主题: <strong>{{ currentTheme }}</strong></p>
      <div class="button-group">
        <button @click="nextTheme">下一个主题</button>
        <button @click="previousTheme">上一个主题</button>
        <button @click="setTheme('light')">浅色主题</button>
        <button @click="setTheme('dark')">深色主题</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useCounter } from '@/composables/useCounter'
import { useToggle, useMultiToggle } from '@/composables/useToggle'
import { useLocalStorage } from '@/composables/useLocalStorage'

export default {
  name: 'ComposablesDemo',
  setup() {
    // 使用计数器组合式函数
    const { count, doubleCount, isEven, increment, decrement, reset } = useCounter(0)
    
    // 使用切换组合式函数
    const [isOn, toggle, setToggle] = useToggle(false)
    
    // 使用本地存储组合式函数
    const [username, setUsername] = useLocalStorage('demo-username', '')
    
    // 使用多状态切换组合式函数
    const themes = ['light', 'dark', 'auto', 'high-contrast']
    const {
      current: currentTheme,
      next: nextTheme,
      previous: previousTheme,
      setValue: setTheme
    } = useMultiToggle(themes, 0)

    return {
      // 计数器
      count,
      doubleCount,
      isEven,
      increment,
      decrement,
      reset,
      // 切换器
      isOn,
      toggle,
      setToggle,
      // 本地存储
      username,
      setUsername,
      // 多状态切换
      currentTheme,
      nextTheme,
      previousTheme,
      setTheme
    }
  }
}
<\/script>

<style scoped>
.composables-demo {
  padding: 20px;
}

.counter-section,
.toggle-section,
.storage-section,
.multi-toggle-section {
  margin: 20px 0;
  padding: 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.counter-section h4,
.toggle-section h4,
.storage-section h4,
.multi-toggle-section h4 {
  margin-top: 0;
  color: #2c3e50;
}

.button-group {
  margin-top: 10px;
}

button {
  margin: 5px;
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

input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

small {
  color: #7f8c8d;
  font-style: italic;
}
</style>`

const setupBasicsCode = `<template>
  <div class="demo-container">
    <h3>setup函数基础示例</h3>
    
    <div class="counter-demo">
      <h4>计数器示例</h4>
      <p>当前计数: <strong>{{ count }}</strong></p>
      <button @click="increment">增加</button>
      <button @click="decrement">减少</button>
      <button @click="reset">重置</button>
    </div>
    
    <div class="user-demo">
      <h4>用户信息示例</h4>
      <div class="form-group">
        <label>姓名:</label>
        <input v-model="user.name" placeholder="请输入姓名" />
      </div>
      <div class="form-group">
        <label>年龄:</label>
        <input v-model.number="user.age" type="number" placeholder="请输入年龄" />
      </div>
      <div class="user-info">
        <p>用户信息: {{ userInfo }}</p>
        <p>是否成年: {{ isAdult ? '是' : '否' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'

export default {
  name: 'SetupBasicsDemo',
  // setup函数是Composition API的入口点
  setup() {
    // 使用ref创建响应式的基本类型数据
    const count = ref(0)
    
    // 使用reactive创建响应式的对象
    const user = reactive({
      name: '',
      age: 0
    })
    
    // 计算属性
    const userInfo = computed(() => {
      return user.name ? \`\${user.name} (\${user.age}岁)\` : '请输入用户信息'
    })
    
    const isAdult = computed(() => user.age >= 18)
    
    // 方法定义
    function increment() {
      count.value++
    }
    
    function decrement() {
      count.value--
    }
    
    function reset() {
      count.value = 0
      user.name = ''
      user.age = 0
    }
    
    // setup函数必须返回一个对象
    // 返回的属性和方法可以在模板中使用
    return {
      count,
      user,
      userInfo,
      isAdult,
      increment,
      decrement,
      reset
    }
  }
}
<\/script>

<style scoped>
.demo-container {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.counter-demo,
.user-demo {
  margin: 20px 0;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #42b883;
}

.counter-demo h4,
.user-demo h4 {
  margin-top: 0;
  color: #2c3e50;
}

.form-group {
  margin: 10px 0;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #34495e;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.user-info {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

button {
  margin: 5px;
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

const optionsComparisonCode = `<template>
  <div class="comparison-demo">
    <h3>Options API vs Composition API 对比</h3>
    
    <div class="api-comparison">
      <div class="options-api">
        <h4>Options API 写法</h4>
        <pre><code>export default {
  data() {
    return {
      count: 0,
      message: 'Hello Vue!'
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('组件已挂载')
  }
}</code></pre>
      </div>
      
      <div class="composition-api">
        <h4>Composition API 写法</h4>
        <pre><code>import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const message = ref('Hello Vue!')
    
    const doubleCount = computed(() => count.value * 2)
    
    function increment() {
      count.value++
    }
    
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    return {
      count,
      message,
      doubleCount,
      increment
    }
  }
}</code></pre>
      </div>
    </div>
    
    <div class="demo-section">
      <p>当前计数: {{ count }}</p>
      <p>双倍计数: {{ doubleCount }}</p>
      <p>消息: {{ message }}</p>
      <button @click="increment">增加计数</button>
      <input v-model="message" placeholder="修改消息" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'OptionsComparisonDemo',
  setup() {
    const count = ref(0)
    const message = ref('Hello Vue!')

    const doubleCount = computed(() => count.value * 2)

    function increment() {
      count.value++
    }

    onMounted(() => {
      console.log('Composition API 组件已挂载')
    })

    return {
      count,
      message,
      doubleCount,
      increment
    }
  }
}
<\/script>

<style scoped>
.comparison-demo {
  padding: 20px;
}

.api-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.options-api,
.composition-api {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
}

.options-api h4 {
  color: #e74c3c;
}

.composition-api h4 {
  color: #42b883;
}

pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.4;
}

.demo-section {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
}

button {
  margin: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #42b883;
  color: white;
  cursor: pointer;
}

input {
  margin: 5px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>`

const setupContextCode = `<template>
  <div class="context-demo">
    <h3>setup函数参数详解</h3>

    <div class="props-demo">
      <h4>Props 参数</h4>
      <p>父组件传入的title: {{ title }}</p>
      <p>父组件传入的count: {{ count }}</p>
    </div>

    <div class="context-demo-section">
      <h4>Context 参数</h4>
      <button @click="emitCustomEvent">触发自定义事件</button>
      <button @click="logSlots">查看插槽</button>
      <button @click="logAttrs">查看属性</button>
    </div>

    <div class="slots-demo">
      <h4>插槽内容</h4>
      <slot name="header">默认头部内容</slot>
      <slot>默认插槽内容</slot>
      <slot name="footer">默认底部内容</slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SetupContextDemo',
  props: {
    title: {
      type: String,
      default: '默认标题'
    },
    count: {
      type: Number,
      default: 0
    }
  },
  emits: ['custom-event'],
  // setup函数接收两个参数：props 和 context
  setup(props, context) {
    // props: 响应式的props对象
    console.log('Props:', props)
    
    // context: 包含 attrs, slots, emit, expose
    console.log('Context:', context)
    
    // 解构context对象
    const { attrs, slots, emit, expose } = context
    
    // 触发自定义事件
    function emitCustomEvent() {
      emit('custom-event', {
        message: '这是来自子组件的消息',
        timestamp: Date.now()
      })
    }
    
    // 查看插槽
    function logSlots() {
      console.log('Slots:', slots)
      console.log('默认插槽:', slots.default?.())
      console.log('头部插槽:', slots.header?.())
    }
    
    // 查看属性
    function logAttrs() {
      console.log('Attrs:', attrs)
    }
    
    // 暴露给父组件的方法
    function publicMethod() {
      console.log('这是暴露给父组件的方法')
    }
    
    // 使用expose暴露方法
    expose({
      publicMethod
    })
    
    return {
      title: props.title,
      count: props.count,
      emitCustomEvent,
      logSlots,
      logAttrs
    }
  }
}
<\/script>

<style scoped>
.context-demo {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.props-demo,
.context-demo-section,
.slots-demo {
  margin: 15px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #42b883;
}

.props-demo h4,
.context-demo-section h4,
.slots-demo h4 {
  margin-top: 0;
  color: #2c3e50;
}

button {
  margin: 5px;
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

const scriptSetupCode = `<template>
  <div class="script-setup-demo">
    <h3>&lt;script setup&gt; 语法示例</h3>
    
    <div class="basic-setup">
      <h4>基础 script setup 语法</h4>
      <p>计数: <strong>{{ count }}</strong></p>
      <p>用户名: <strong>{{ user.name || '未设置' }}</strong></p>
      <p>计算属性: <strong>{{ computedMessage }}</strong></p>
      
      <div class="form-section">
        <input v-model="user.name" placeholder="输入用户名" />
        <button @click="increment">增加计数</button>
        <button @click="reset">重置</button>
      </div>
    </div>

    <div class="macros-demo">
      <h4>编译时宏演示</h4>
      <p>组件名称: {{ $options.name }}</p>
      <p>Props: title = "{{ title }}"</p>
      <p>Props: initialCount = {{ initialCount }}</p>
      
      <button @click="handleEmit">触发自定义事件</button>
      <button @click="exposeMethod">调用暴露的方法</button>
    </div>

    <div class="comparison-section">
      <h4>语法对比</h4>
      <div class="syntax-comparison">
        <div class="traditional-setup">
          <h5>传统 setup 函数</h5>
          <pre><code>&lt;script&gt;
import { ref, computed } from 'vue'

export default {
  name: 'MyComponent',
  props: {
    title: String,
    initialCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['update'],
  setup(props, { emit, expose }) {
    const count = ref(props.initialCount)
    const user = reactive({ name: '' })
    
    const computedMessage = computed(() => {
      return \`Hello \${user.name}, count: \${count.value}\`
    })
    
    function increment() {
      count.value++
      emit('update', count.value)
    }
    
    function publicMethod() {
      console.log('Public method called')
    }
    
    expose({ publicMethod })
    
    return {
      count,
      user,
      computedMessage,
      increment
    }
  }
}
&lt;/script&gt;</code></pre>
        </div>
        
        <div class="script-setup">
          <h5>&lt;script setup&gt; 语法</h5>
          <pre><code>&lt;script setup&gt;
import { ref, reactive, computed } from 'vue'

// 定义组件名称
defineOptions({ name: 'MyComponent' })

// 定义 Props
const props = defineProps({
  title: String,
  initialCount: {
    type: Number,
    default: 0
  }
})

// 定义 Emits
const emit = defineEmits(['update'])

// 响应式数据 - 自动暴露给模板
const count = ref(props.initialCount)
const user = reactive({ name: '' })

// 计算属性 - 自动暴露给模板
const computedMessage = computed(() => {
  return \`Hello \${user.name}, count: \${count.value}\`
})

// 方法 - 自动暴露给模板
function increment() {
  count.value++
  emit('update', count.value)
}

// 暴露给父组件的方法
function publicMethod() {
  console.log('Public method called')
}

defineExpose({ publicMethod })
&lt;/script&gt;</code></pre>
        </div>
      </div>
    </div>

    <div class="advantages">
      <h4>&lt;script setup&gt; 的优势</h4>
      <ul>
        <li><strong>更简洁的语法</strong>: 无需手动返回响应式数据和方法</li>
        <li><strong>更好的性能</strong>: 编译时优化，减少运行时开销</li>
        <li><strong>更好的 TypeScript 支持</strong>: 类型推断更准确</li>
        <li><strong>自动暴露</strong>: 顶层绑定自动暴露给模板</li>
        <li><strong>编译时宏</strong>: defineProps, defineEmits 等提供编译时类型检查</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// 定义组件选项
defineOptions({ name: 'ScriptSetupDemo' })

// 定义 Props
const props = defineProps({
  title: {
    type: String,
    default: 'Script Setup 演示'
  },
  initialCount: {
    type: Number,
    default: 0
  }
})

// 定义 Emits
const emit = defineEmits(['custom-event'])

// 响应式数据
const count = ref(props.initialCount)
const user = reactive({ name: '' })

// 计算属性
const computedMessage = computed(() => {
  return user.name ? \`Hello \${user.name}, count: \${count.value}\` : \`Count: \${count.value}\`
})

// 方法
function increment() {
  count.value++
}

function reset() {
  count.value = props.initialCount
  user.name = ''
}

function handleEmit() {
  emit('custom-event', {
    message: 'Hello from script setup!',
    count: count.value,
    user: user.name
  })
}

// 暴露给父组件的方法
function exposeMethod() {
  console.log('这是通过 defineExpose 暴露的方法')
  console.log('当前状态:', { count: count.value, user: user.name })
}

// 暴露方法给父组件
defineExpose({
  exposeMethod,
  reset,
  getCurrentState: () => ({ count: count.value, user: user.name })
})
<\/script>

<style scoped>
.script-setup-demo {
  padding: 20px;
}

.basic-setup,
.macros-demo,
.comparison-section,
.advantages {
  margin: 20px 0;
  padding: 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.basic-setup h4,
.macros-demo h4,
.comparison-section h4,
.advantages h4 {
  margin-top: 0;
  color: #2c3e50;
}

.form-section {
  margin-top: 15px;
}

.syntax-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 15px;
}

.traditional-setup,
.script-setup {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.traditional-setup h5 {
  color: #e74c3c;
  margin: 0 0 10px 0;
}

.script-setup h5 {
  color: #42b883;
  margin: 0 0 10px 0;
}

pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
}

.advantages ul {
  margin: 10px 0;
  padding-left: 20px;
}

.advantages li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.advantages strong {
  color: #2c3e50;
}

button {
  margin: 5px;
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

input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

@media (max-width: 768px) {
  .syntax-comparison {
    grid-template-columns: 1fr;
  }
}
</style>`

const reactHooksComparisonCode = `<template>
  <div class="hooks-comparison">
    <h3>Vue Composables vs React Hooks 对比</h3>
    
    <div class="comparison-grid">
      <div class="vue-example">
        <h4>Vue 3 Composables</h4>
        <pre><code>// useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, doubleCount, increment }
}

// 在组件中使用
export default {
  setup() {
    const { count, doubleCount, increment } = useCounter(0)
    
    return { count, doubleCount, increment }
  }
}</code></pre>
      </div>
      
      <div class="react-example">
        <h4>React Custom Hooks</h4>
        <pre><code>// useCounter.js
import { useState, useMemo } from 'react'

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial)
  const doubleCount = useMemo(() => count * 2, [count])
  
  function increment() {
    setCount(c => c + 1)
  }
  
  return { count, doubleCount, increment }
}

// 在组件中使用
function MyComponent() {
  const { count, doubleCount, increment } = useCounter(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={increment}>Increment</button>
    </div>
  )
}</code></pre>
      </div>
    </div>

    <div class="differences">
      <h4>主要差异对比</h4>
      <div class="diff-table">
        <div class="diff-row">
          <div class="diff-aspect">执行时机</div>
          <div class="vue-diff">组合式函数在setup中只执行一次</div>
          <div class="react-diff">自定义Hook在每次渲染时都执行</div>
        </div>
        <div class="diff-row">
          <div class="diff-aspect">响应式</div>
          <div class="vue-diff">使用ref/reactive创建响应式数据</div>
          <div class="react-diff">使用useState管理状态</div>
        </div>
        <div class="diff-row">
          <div class="diff-aspect">计算属性</div>
          <div class="vue-diff">computed自动缓存和依赖追踪</div>
          <div class="react-diff">useMemo需要手动指定依赖</div>
        </div>
        <div class="diff-row">
          <div class="diff-aspect">副作用</div>
          <div class="vue-diff">onMounted, onUnmounted等生命周期</div>
          <div class="react-diff">useEffect处理所有副作用</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HooksComparisonDemo'
}
<\/script>

<style scoped>
.hooks-comparison {
  padding: 20px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.vue-example,
.react-example {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
}

.vue-example h4 {
  color: #42b883;
  margin: 0 0 15px 0;
}

.react-example h4 {
  color: #61dafb;
  margin: 0 0 15px 0;
}

pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
}

.differences {
  margin-top: 30px;
  padding: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.differences h4 {
  color: #2c3e50;
  margin: 0 0 20px 0;
}

.diff-table {
  display: grid;
  gap: 10px;
}

.diff-row {
  display: grid;
  grid-template-columns: 120px 1fr 1fr;
  gap: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  align-items: center;
}

.diff-aspect {
  font-weight: bold;
  color: #2c3e50;
}

.vue-diff {
  padding: 8px 12px;
  background: #e8f5e8;
  border-left: 3px solid #42b883;
  border-radius: 4px;
  font-size: 14px;
}

.react-diff {
  padding: 8px 12px;
  background: #e3f2fd;
  border-left: 3px solid #61dafb;
  border-radius: 4px;
  font-size: 14px;
}
</style>`

// 示例代码
const examples = reactive({
  'setup-basics': {
    title: 'setup函数基础',
    description: '学习setup函数的基本语法和用法',
    code: setupBasicsCode
  },
  'composables': {
    title: '组合式函数',
    description: '创建和使用可复用的组合式函数',
    code: composablesCode
  },
  'script-setup': {
    title: 'script setup语法',
    description: '掌握现代Vue 3的script setup语法',
    code: scriptSetupCode
  },
  'options-comparison': {
    title: 'Options API对比',
    description: '对比Options API和Composition API的写法',
    code: optionsComparisonCode
  },
  'react-hooks': {
    title: 'React Hooks对比',
    description: '对比Vue组合式函数与React自定义Hooks',
    code: reactHooksComparisonCode
  },
  'setup-context': {
    title: 'setup函数参数',
    description: '了解setup函数的props和context参数',
    code: setupContextCode
  }
})

// 当前示例的代码
const currentCode = computed(() => examples[currentExample.value]?.code || '')

// 切换示例
function selectExample(exampleKey: 'setup-basics' | 'composables' | 'script-setup' | 'options-comparison' | 'react-hooks' | 'setup-context') {
  currentExample.value = exampleKey
}
</script>

<style scoped>
.composition-api-module {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.module-header {
  text-align: center;
  margin-bottom: 30px;
}

.module-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.module-description {
  color: #7f8c8d;
  font-size: 16px;
  line-height: 1.6;
}

.example-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 10px;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background: #ecf0f1;
  color: #2c3e50;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: #d5dbdb;
}

.tab-button.active {
  background: #42b883;
  color: white;
}

.example-content {
  margin-bottom: 40px;
}

.example-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.example-info h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.example-info p {
  margin: 0;
  color: #7f8c8d;
}

.code-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.code-editor-container,
.code-preview-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.code-editor-container h4,
.code-preview-container h4 {
  margin: 0;
  padding: 10px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
  color: #2c3e50;
  font-size: 14px;
}

.learning-points {
  margin: 40px 0;
}

.learning-points h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.point-card {
  padding: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.point-card h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.point-card ul {
  margin: 0;
  padding-left: 20px;
}

.point-card li {
  margin-bottom: 8px;
  color: #34495e;
  line-height: 1.5;
}

.comparison-section {
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.comparison-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.vue-side,
.react-side {
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.vue-side h4 {
  color: #42b883;
  margin: 0 0 15px 0;
}

.react-side h4 {
  color: #61dafb;
  margin: 0 0 15px 0;
}

pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
}

.comparison-notes {
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.comparison-notes h4 {
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.comparison-notes ul {
  margin: 0;
  padding-left: 20px;
}

.comparison-notes li {
  margin-bottom: 10px;
  color: #34495e;
  line-height: 1.6;
}

.comparison-notes strong {
  color: #2c3e50;
}

@media (max-width: 768px) {
  .code-section {
    grid-template-columns: 1fr;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
  }

  .example-tabs {
    flex-wrap: wrap;
  }
}
</style>