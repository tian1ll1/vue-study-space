<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'


defineOptions({
  name: 'ComponentsModule'
})

// 当前选中的示例
const currentExample = ref<keyof typeof examples>('props-basics')

// 动态组件示例数据
const dynamicComponentType = ref('UserCard')
const asyncComponentLoaded = ref(false)

// 示例数据
const parentData = reactive({
  user: {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://via.placeholder.com/60',
    role: 'Developer',
    profile: {
      bio: 'Vue.js Developer',
      skills: ['Vue', 'TypeScript', 'Node.js'],
      experience: 3
    }
  },
  message: 'Hello from parent!',
  count: 0,
  items: ['Apple', 'Banana', 'Orange']
})

// 事件处理
const eventLog = ref<string[]>([])

function logEvent(event: string) {
  eventLog.value.unshift(`${new Date().toLocaleTimeString()}: ${event}`)
  if (eventLog.value.length > 10) {
    eventLog.value = eventLog.value.slice(0, 10)
  }
}

function handleUserUpdate(newUser: any) {
  Object.assign(parentData.user, newUser)
  logEvent(`用户信息更新: ${newUser.name}`)
}

function handleCountChange(newCount: number) {
  parentData.count = newCount
  logEvent(`计数器变化: ${newCount}`)
}

function handleItemAdd(item: string) {
  parentData.items.push(item)
  logEvent(`添加项目: ${item}`)
}

function handleItemRemove(index: number) {
  const item = parentData.items[index]
  parentData.items.splice(index, 1)
  logEvent(`删除项目: ${item}`)
}

// 示例代码
const examples = {
  'props-basics': {
    title: 'Props 基础用法',
    description: '学习如何定义和使用 props，包括类型验证和默认值',
    template: `<template>
  <div class="demo-container">
    <h3>Props 基础示例</h3>
    
    <!-- 父组件数据 -->
    <div class="parent-section">
      <h4>父组件数据</h4>
      <div class="data-display">
        <p><strong>用户名:</strong> {{ user.name }}</p>
        <p><strong>邮箱:</strong> {{ user.email }}</p>
        <p><strong>角色:</strong> {{ user.role }}</p>
        <p><strong>消息:</strong> {{ message }}</p>
      </div>
    </div>
    
    <!-- 子组件使用 -->
    <div class="child-section">
      <h4>子组件展示</h4>
      <UserProfile 
        :user="user"
        :message="message"
        :show-email="true"
        theme="light"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// 父组件数据
const user = reactive({
  name: 'Alice Johnson',
  email: 'alice@example.com',
  role: 'Developer'
})

const message = 'Welcome to Vue 3!'
<\/script>`,
    component: `<!-- UserProfile.vue 子组件 -->
<template>
  <div class="user-profile" :class="themeClass">
    <div class="profile-header">
      <h5>{{ user.name }}</h5>
      <span class="role-badge">{{ user.role }}</span>
    </div>
    
    <div class="profile-content">
      <p class="message">{{ message }}</p>
      <p v-if="showEmail" class="email">
        📧 {{ user.email }}
      </p>
    </div>
    
    <div class="props-info">
      <small>Props 接收到的数据类型验证通过 ✓</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props 定义和验证
const props = defineProps({
  user: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value.name === 'string'
    }
  },
  message: {
    type: String,
    default: 'Hello!'
  },
  showEmail: {
    type: Boolean,
    default: false
  },
  theme: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'dark'].includes(value)
  }
})

// 计算属性
const themeClass = computed(() => \`theme-\${props.theme}\`)
<\/script>`
  },

  'events-basics': {
    title: '自定义事件通信',
    description: '学习父子组件间的事件通信机制',
    template: `<template>
  <div class="demo-container">
    <h3>事件通信示例</h3>
    
    <!-- 父组件状态 -->
    <div class="parent-section">
      <h4>父组件状态</h4>
      <div class="status-display">
        <p><strong>计数器:</strong> {{ count }}</p>
        <p><strong>最后操作:</strong> {{ lastAction }}</p>
      </div>
    </div>
    
    <!-- 子组件 -->
    <div class="child-section">
      <h4>子组件操作</h4>
      <Counter 
        :initial-value="count"
        @increment="handleIncrement"
        @decrement="handleDecrement"
        @reset="handleReset"
        @custom-change="handleCustomChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const lastAction = ref('无操作')

function handleIncrement(value) {
  count.value = value
  lastAction.value = '递增'
}

function handleDecrement(value) {
  count.value = value
  lastAction.value = '递减'
}

function handleReset() {
  count.value = 0
  lastAction.value = '重置'
}

function handleCustomChange(data) {
  count.value = data.value
  lastAction.value = \`自定义变更: \${data.reason}\`
}
<\/script>`,
    component: `<!-- Counter.vue 子组件 -->
<template>
  <div class="counter-component">
    <div class="counter-display">
      <span class="count-value">{{ currentValue }}</span>
    </div>
    
    <div class="counter-controls">
      <button @click="increment" class="btn btn-primary">
        +1 递增
      </button>
      <button @click="decrement" class="btn btn-secondary">
        -1 递减
      </button>
      <button @click="reset" class="btn btn-warning">
        重置
      </button>
    </div>
    
    <div class="custom-controls">
      <input 
        v-model.number="customValue" 
        type="number" 
        placeholder="输入数值"
        class="custom-input"
      >
      <button @click="setCustomValue" class="btn btn-info">
        设置自定义值
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialValue: {
    type: Number,
    default: 0
  }
})

// 定义事件
const emit = defineEmits(['increment', 'decrement', 'reset', 'custom-change'])

const currentValue = ref(props.initialValue)
const customValue = ref('')

// 监听 props 变化
watch(() => props.initialValue, (newValue) => {
  currentValue.value = newValue
})

function increment() {
  currentValue.value++
  emit('increment', currentValue.value)
}

function decrement() {
  currentValue.value--
  emit('decrement', currentValue.value)
}

function reset() {
  currentValue.value = 0
  emit('reset')
}

function setCustomValue() {
  if (customValue.value !== '') {
    currentValue.value = customValue.value
    emit('custom-change', {
      value: customValue.value,
      reason: '用户输入'
    })
    customValue.value = ''
  }
}
<\/script>`
  },

  'advanced-props': {
    title: '高级 Props 特性',
    description: '学习 Props 的高级用法，包括对象/数组 props、计算属性等',
    template: `<template>
  <div class="demo-container">
    <h3>高级 Props 示例</h3>
    
    <!-- 复杂数据传递 -->
    <div class="section">
      <h4>复杂数据传递</h4>
      <UserEditor 
        :user="user"
        :config="editorConfig"
        :permissions="permissions"
        @user-update="handleUserUpdate"
        @validation-error="handleValidationError"
      />
    </div>
    
    <!-- 验证结果显示 -->
    <div class="validation-section" v-if="validationErrors.length">
      <h4>验证错误</h4>
      <ul class="error-list">
        <li v-for="error in validationErrors" :key="error" class="error-item">
          {{ error }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const user = reactive({
  id: 1,
  name: 'Alice Johnson',
  email: 'alice@example.com',
  profile: {
    bio: 'Vue.js Developer',
    skills: ['Vue', 'TypeScript', 'Node.js'],
    experience: 3
  }
})

const editorConfig = reactive({
  theme: 'light',
  showValidation: true,
  autoSave: true,
  fields: ['name', 'email', 'bio', 'skills']
})

const permissions = reactive({
  canEdit: true,
  canDelete: false,
  canViewEmail: true
})

const validationErrors = ref([])

function handleUserUpdate(updatedUser) {
  Object.assign(user, updatedUser)
  validationErrors.value = []
}

function handleValidationError(errors) {
  validationErrors.value = errors
}
<\/script>`,
    component: `<!-- UserEditor.vue 子组件 -->
<template>
  <div class="user-editor" :class="themeClass">
    <form @submit.prevent="saveUser" class="editor-form">
      <div class="form-group">
        <label>姓名:</label>
        <input 
          v-model="localUser.name"
          :disabled="!permissions.canEdit"
          @blur="validateField('name')"
          class="form-input"
        >
      </div>
      
      <div class="form-group" v-if="permissions.canViewEmail">
        <label>邮箱:</label>
        <input 
          v-model="localUser.email"
          type="email"
          :disabled="!permissions.canEdit"
          @blur="validateField('email')"
          class="form-input"
        >
      </div>
      
      <div class="form-group" v-if="config.fields.includes('bio')">
        <label>简介:</label>
        <textarea 
          v-model="localUser.profile.bio"
          :disabled="!permissions.canEdit"
          class="form-textarea"
        ></textarea>
      </div>
      
      <div class="form-group" v-if="config.fields.includes('skills')">
        <label>技能:</label>
        <div class="skills-editor">
          <span 
            v-for="(skill, index) in localUser.profile.skills" 
            :key="index"
            class="skill-tag"
          >
            {{ skill }}
            <button 
              v-if="permissions.canEdit"
              @click="removeSkill(index)"
              type="button"
              class="remove-btn"
            >×</button>
          </span>
          <input 
            v-if="permissions.canEdit"
            v-model="newSkill"
            @keyup.enter="addSkill"
            placeholder="添加技能"
            class="skill-input"
          >
        </div>
      </div>
      
      <div class="form-actions" v-if="permissions.canEdit">
        <button type="submit" class="btn btn-primary">保存</button>
        <button type="button" @click="resetForm" class="btn btn-secondary">重置</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value.id === 'number' && typeof value.name === 'string'
    }
  },
  config: {
    type: Object,
    default: () => ({
      theme: 'light',
      showValidation: true,
      autoSave: false,
      fields: ['name', 'email']
    })
  },
  permissions: {
    type: Object,
    default: () => ({
      canEdit: true,
      canDelete: false,
      canViewEmail: true
    })
  }
})

const emit = defineEmits(['user-update', 'validation-error'])

// 本地数据副本
const localUser = reactive({ ...props.user })
const newSkill = ref('')
const errors = ref([])

// 计算属性
const themeClass = computed(() => \`theme-\${props.config.theme}\`)

// 监听原始数据变化
watch(() => props.user, (newUser) => {
  Object.assign(localUser, newUser)
}, { deep: true })

// 验证字段
function validateField(field) {
  const fieldErrors = []
  
  if (field === 'name' && !localUser.name.trim()) {
    fieldErrors.push('姓名不能为空')
  }
  
  if (field === 'email' && !isValidEmail(localUser.email)) {
    fieldErrors.push('邮箱格式不正确')
  }
  
  if (fieldErrors.length > 0) {
    emit('validation-error', fieldErrors)
  }
  
  return fieldErrors.length === 0
}

function isValidEmail(email) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)
}

function addSkill() {
  if (newSkill.value.trim()) {
    localUser.profile.skills.push(newSkill.value.trim())
    newSkill.value = ''
  }
}

function removeSkill(index) {
  localUser.profile.skills.splice(index, 1)
}

function saveUser() {
  if (validateField('name') && validateField('email')) {
    emit('user-update', { ...localUser })
  }
}

function resetForm() {
  Object.assign(localUser, props.user)
}
<\/script>`
  },

  'slots-basics': {
    title: 'Slots 插槽基础',
    description: '学习默认插槽、具名插槽和作用域插槽的使用方法',
    template: `<template>
  <div class="demo-container">
    <h3>Slots 插槽示例</h3>
    
    <!-- 默认插槽示例 -->
    <div class="section">
      <h4>默认插槽</h4>
      <Card>
        <h5>这是插槽内容</h5>
        <p>默认插槽允许父组件向子组件传递任意内容</p>
        <button class="btn btn-primary">插槽中的按钮</button>
      </Card>
    </div>
    
    <!-- 具名插槽示例 -->
    <div class="section">
      <h4>具名插槽</h4>
      <Modal>
        <template #header>
          <h4>🎯 模态框标题</h4>
        </template>
        
        <template #default>
          <p>这是模态框的主要内容区域</p>
          <p>可以包含任意复杂的内容结构</p>
        </template>
        
        <template #footer>
          <button class="btn btn-primary">确认</button>
          <button class="btn btn-secondary">取消</button>
        </template>
      </Modal>
    </div>
    
    <!-- 作用域插槽示例 -->
    <div class="section">
      <h4>作用域插槽</h4>
      <DataList :items="users">
        <template #item="{ item, index }">
          <div class="user-item">
            <span class="user-index">#{{ index + 1 }}</span>
            <strong>{{ item.name }}</strong>
            <span class="user-role">({{ item.role }})</span>
            <span class="user-email">{{ item.email }}</span>
          </div>
        </template>
      </DataList>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const users = reactive([
  { id: 1, name: 'Alice Johnson', role: 'Developer', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', role: 'Designer', email: 'bob@example.com' },
  { id: 3, name: 'Carol Davis', role: 'Manager', email: 'carol@example.com' }
])
<\/script>`,
    component: `<!-- Card.vue - 默认插槽组件 -->
<template>
  <div class="card">
    <div class="card-body">
      <slot>
        <!-- 默认内容，当没有提供插槽内容时显示 -->
        <p>默认卡片内容</p>
      </slot>
    </div>
  </div>
</template>

<!-- Modal.vue - 具名插槽组件 -->
<template>
  <div class="modal-overlay">
    <div class="modal">
      <header class="modal-header">
        <slot name="header">
          <h4>默认标题</h4>
        </slot>
      </header>
      
      <main class="modal-body">
        <slot>
          <p>默认内容</p>
        </slot>
      </main>
      
      <footer class="modal-footer">
        <slot name="footer">
          <button class="btn btn-primary">确定</button>
        </slot>
      </footer>
    </div>
  </div>
</template>

<!-- DataList.vue - 作用域插槽组件 -->
<template>
  <div class="data-list">
    <div 
      v-for="(item, index) in items" 
      :key="item.id"
      class="list-item"
    >
      <slot name="item" :item="item" :index="index">
        <!-- 默认渲染 -->
        <span>{{ item.name || item }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  }
})
<\/script>`
  },

  'dynamic-components': {
    title: '动态组件和异步组件',
    description: '学习如何使用动态组件切换和异步组件加载',
    template: `<template>
  <div class="demo-container">
    <h3>动态组件和异步组件</h3>
    
    <!-- 动态组件切换 -->
    <div class="section">
      <h4>动态组件切换</h4>
      <div class="component-switcher">
        <button 
          v-for="comp in componentTypes" 
          :key="comp"
          @click="currentComponent = comp"
          :class="{ active: currentComponent === comp }"
          class="switch-btn"
        >
          {{ comp }}
        </button>
      </div>
      
      <div class="dynamic-component-container">
        <component 
          :is="currentComponent" 
          :user="sampleUser"
          @action="handleComponentAction"
        />
      </div>
    </div>
    
    <!-- 异步组件加载 -->
    <div class="section">
      <h4>异步组件加载</h4>
      <div class="async-controls">
        <button 
          @click="loadAsyncComponent" 
          :disabled="asyncLoading"
          class="btn btn-primary"
        >
          {{ asyncLoading ? '加载中...' : '加载异步组件' }}
        </button>
        <button 
          @click="unloadAsyncComponent"
          :disabled="!asyncComponentLoaded"
          class="btn btn-secondary"
        >
          卸载组件
        </button>
      </div>
      
      <div class="async-component-container">
        <Suspense v-if="showAsyncComponent">
          <template #default>
            <AsyncUserProfile :user="sampleUser" />
          </template>
          <template #fallback>
            <div class="loading-placeholder">
              <div class="spinner"></div>
              <p>异步组件加载中...</p>
            </div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineAsyncComponent } from 'vue'

const currentComponent = ref('UserCard')
const componentTypes = ['UserCard', 'UserList', 'UserForm']

const asyncLoading = ref(false)
const showAsyncComponent = ref(false)

const sampleUser = reactive({
  id: 1,
  name: 'Alice Johnson',
  email: 'alice@example.com',
  role: 'Developer',
  avatar: 'https://via.placeholder.com/60'
})

// 异步组件定义
const AsyncUserProfile = defineAsyncComponent({
  loader: () => new Promise(resolve => {
    setTimeout(() => {
      resolve({
        template: \`
          <div class="async-user-profile">
            <h5>异步加载的用户资料</h5>
            <p>用户: {{ user.name }}</p>
            <p>邮箱: {{ user.email }}</p>
            <p>角色: {{ user.role }}</p>
            <div class="async-badge">✨ 异步组件已加载</div>
          </div>
        \`,
        props: ['user']
      })
    }, 2000) // 模拟2秒加载时间
  }),
  loadingComponent: {
    template: '<div class="loading">加载中...</div>'
  },
  errorComponent: {
    template: '<div class="error">加载失败</div>'
  },
  delay: 200,
  timeout: 5000
})

function loadAsyncComponent() {
  asyncLoading.value = true
  showAsyncComponent.value = true
  
  setTimeout(() => {
    asyncLoading.value = false
  }, 2000)
}

function unloadAsyncComponent() {
  showAsyncComponent.value = false
  asyncLoading.value = false
}

function handleComponentAction(action) {
  console.log('组件动作:', action)
}
<\/script>`,
    component: `<!-- UserCard.vue - 动态组件示例 -->
<template>
  <div class="user-card">
    <div class="card-header">
      <img :src="user.avatar" :alt="user.name" class="avatar">
      <div class="user-info">
        <h5>{{ user.name }}</h5>
        <span class="role">{{ user.role }}</span>
      </div>
    </div>
    <div class="card-body">
      <p>📧 {{ user.email }}</p>
      <button @click="$emit('action', 'view-profile')" class="btn btn-sm">
        查看资料
      </button>
    </div>
  </div>
</template>

<!-- UserList.vue - 动态组件示例 -->
<template>
  <div class="user-list">
    <div class="list-header">
      <h5>用户列表视图</h5>
    </div>
    <div class="list-item">
      <span class="user-name">{{ user.name }}</span>
      <span class="user-email">{{ user.email }}</span>
      <span class="user-role">{{ user.role }}</span>
      <button @click="$emit('action', 'edit-user')" class="btn btn-sm">
        编辑
      </button>
    </div>
  </div>
</template>

<!-- UserForm.vue - 动态组件示例 -->
<template>
  <div class="user-form">
    <h5>用户表单视图</h5>
    <form @submit.prevent="$emit('action', 'save-user')">
      <div class="form-group">
        <label>姓名:</label>
        <input :value="user.name" class="form-input" readonly>
      </div>
      <div class="form-group">
        <label>邮箱:</label>
        <input :value="user.email" class="form-input" readonly>
      </div>
      <div class="form-group">
        <label>角色:</label>
        <input :value="user.role" class="form-input" readonly>
      </div>
      <button type="submit" class="btn btn-primary">保存</button>
    </form>
  </div>
</template>

<script setup>
// 所有动态组件都接收相同的 props
defineProps(['user'])
defineEmits(['action'])
<\/script>`
  },

  'framework-comparison': {
    title: '框架对比 - Slots vs Children vs Content Projection',
    description: '对比Vue Slots、React Children和Angular Content Projection的异同',
    template: `<template>
  <div class="demo-container">
    <h3>框架对比：内容投影机制</h3>
    
    <!-- Vue Slots 示例 -->
    <div class="framework-section vue-section">
      <h4>🟢 Vue 3 - Slots</h4>
      <div class="code-example">
        <h5>父组件使用:</h5>
        <pre><code>&lt;Card&gt;
  &lt;template #header&gt;
    &lt;h4&gt;卡片标题&lt;/h4&gt;
  &lt;/template&gt;
  
  &lt;p&gt;卡片内容&lt;/p&gt;
  
  &lt;template #footer&gt;
    &lt;button&gt;操作按钮&lt;/button&gt;
  &lt;/template&gt;
&lt;/Card&gt;</code></pre>
        
        <h5>子组件定义:</h5>
        <pre><code>&lt;template&gt;
  &lt;div class="card"&gt;
    &lt;header&gt;
      &lt;slot name="header"&gt;&lt;/slot&gt;
    &lt;/header&gt;
    &lt;main&gt;
      &lt;slot&gt;&lt;/slot&gt;
    &lt;/main&gt;
    &lt;footer&gt;
      &lt;slot name="footer"&gt;&lt;/slot&gt;
    &lt;/footer&gt;
  &lt;/div&gt;
&lt;/template&gt;</code></pre>
      </div>
    </div>
    
    <!-- React Children 示例 -->
    <div class="framework-section react-section">
      <h4>🔵 React - Children & Render Props</h4>
      <div class="code-example">
        <h5>父组件使用:</h5>
        <pre><code>&lt;Card
  header={&lt;h4&gt;卡片标题&lt;/h4&gt;}
  footer={&lt;button&gt;操作按钮&lt;/button&gt;}
&gt;
  &lt;p&gt;卡片内容&lt;/p&gt;
&lt;/Card&gt;

// 或使用 render props
&lt;DataProvider&gt;
  {(data) =&gt; (
    &lt;UserList users={data.users} /&gt;
  )}
&lt;/DataProvider&gt;</code></pre>
        
        <h5>子组件定义:</h5>
        <pre><code>function Card({ header, children, footer }) {
  return (
    &lt;div className="card"&gt;
      &lt;header&gt;{header}&lt;/header&gt;
      &lt;main&gt;{children}&lt;/main&gt;
      &lt;footer&gt;{footer}&lt;/footer&gt;
    &lt;/div&gt;
  )
}</code></pre>
      </div>
    </div>
    
    <!-- Angular Content Projection 示例 -->
    <div class="framework-section angular-section">
      <h4>🔴 Angular - Content Projection</h4>
      <div class="code-example">
        <h5>父组件使用:</h5>
        <pre><code>&lt;app-card&gt;
  &lt;h4 slot="header"&gt;卡片标题&lt;/h4&gt;
  
  &lt;p&gt;卡片内容&lt;/p&gt;
  
  &lt;button slot="footer"&gt;操作按钮&lt;/button&gt;
&lt;/app-card&gt;</code></pre>
        
        <h5>子组件定义:</h5>
        <pre><code>&lt;div class="card"&gt;
  &lt;header&gt;
    &lt;ng-content select="[slot=header]"&gt;&lt;/ng-content&gt;
  &lt;/header&gt;
  &lt;main&gt;
    &lt;ng-content&gt;&lt;/ng-content&gt;
  &lt;/main&gt;
  &lt;footer&gt;
    &lt;ng-content select="[slot=footer]"&gt;&lt;/ng-content&gt;
  &lt;/footer&gt;
&lt;/div&gt;</code></pre>
      </div>
    </div>
  </div>
</template>`,
    component: `<!-- 框架对比总结 -->
<div class="comparison-summary">
  <h4>🔍 关键差异对比</h4>
  
  <table class="comparison-table">
    <thead>
      <tr>
        <th>特性</th>
        <th>Vue 3 Slots</th>
        <th>React Children</th>
        <th>Angular Content Projection</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>语法</td>
        <td>&lt;template #name&gt;</td>
        <td>props.children</td>
        <td>&lt;ng-content select&gt;</td>
      </tr>
      <tr>
        <td>具名内容</td>
        <td>✅ 原生支持</td>
        <td>⚠️ 通过props传递</td>
        <td>✅ 原生支持</td>
      </tr>
      <tr>
        <td>作用域传递</td>
        <td>✅ 作用域插槽</td>
        <td>✅ Render Props</td>
        <td>❌ 不支持</td>
      </tr>
      <tr>
        <td>默认内容</td>
        <td>✅ 支持</td>
        <td>✅ 支持</td>
        <td>✅ 支持</td>
      </tr>
      <tr>
        <td>动态内容</td>
        <td>✅ v-slot动态</td>
        <td>✅ 条件渲染</td>
        <td>✅ *ngIf控制</td>
      </tr>
    </tbody>
  </table>
  
  <div class="best-practices">
    <h5>💡 最佳实践对比</h5>
    <div class="practice-grid">
      <div class="practice-item">
        <h6>Vue 3</h6>
        <ul>
          <li>使用具名插槽组织复杂布局</li>
          <li>作用域插槽实现数据共享</li>
          <li>v-slot简写语法 (#)</li>
          <li>插槽默认内容作为后备</li>
        </ul>
      </div>
      
      <div class="practice-item">
        <h6>React</h6>
        <ul>
          <li>children用于简单内容传递</li>
          <li>render props用于逻辑共享</li>
          <li>Higher-Order Components</li>
          <li>React.cloneElement操作children</li>
        </ul>
      </div>
      
      <div class="practice-item">
        <h6>Angular</h6>
        <ul>
          <li>ng-content用于内容投影</li>
          <li>select属性实现具名投影</li>
          <li>ngProjectAs指定投影位置</li>
          <li>条件投影和多重投影</li>
        </ul>
      </div>
    </div>
  </div>
</div>`
  }
}

// UI 状态
const activeTab = ref('template')
const customValue = ref('')

// 设置自定义值
function setCustomValue() {
  if (customValue.value !== '') {
    handleCountChange(customValueNumber.value)
    logEvent(`设置自定义值: ${customValue.value}`)
    customValue.value = ''
  }
}

// 当前示例的代码
const currentCode = computed(() => {
  const example = examples[currentExample.value as keyof typeof examples]
  return {
    template: example.template,
    component: example.component
  }
})

// 修复 customValue 类型
const customValueNumber = computed(() => Number(customValue.value))
</script>

<template>
  <div class="module-container">
    <div class="module-header">
      <h1>Vue 3 组件系统</h1>
      <p class="module-description">
        学习Vue 3组件系统的核心概念：Props传递、自定义事件、Slots插槽、动态组件和异步组件，以及与其他框架的对比。
      </p>
    </div>

    <!-- 示例选择器 -->
    <div class="example-selector">
      <button v-for="(example, key) in examples" :key="key" @click="currentExample = key"
        :class="{ active: currentExample === key }" class="example-btn">
        {{ example.title }}
      </button>
    </div>

    <!-- 当前示例内容 -->
    <div class="example-content">
      <div class="example-header">
        <h2>{{ examples[currentExample].title }}</h2>
        <p class="example-description">{{ examples[currentExample].description }}</p>
      </div>

      <!-- 实时演示区域 -->
      <div class="demo-section">
        <h3>🎯 实时演示</h3>
        <div class="live-demo">
          <!-- Props 基础示例 -->
          <div v-if="currentExample === 'props-basics'" class="demo-container">
            <div class="parent-section">
              <h4>父组件数据</h4>
              <div class="data-display">
                <div class="data-item">
                  <label>用户名:</label>
                  <input v-model="parentData.user.name" class="data-input">
                </div>
                <div class="data-item">
                  <label>邮箱:</label>
                  <input v-model="parentData.user.email" class="data-input">
                </div>
                <div class="data-item">
                  <label>角色:</label>
                  <select v-model="parentData.user.role" class="data-input">
                    <option>Developer</option>
                    <option>Designer</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div class="data-item">
                  <label>消息:</label>
                  <input v-model="parentData.message" class="data-input">
                </div>
              </div>
            </div>

            <div class="child-section">
              <h4>子组件展示 (接收 Props)</h4>
              <div class="user-profile theme-light">
                <div class="profile-header">
                  <h5>{{ parentData.user.name }}</h5>
                  <span class="role-badge">{{ parentData.user.role }}</span>
                </div>
                <div class="profile-content">
                  <p class="message">{{ parentData.message }}</p>
                  <p class="email">📧 {{ parentData.user.email }}</p>
                </div>
                <div class="props-info">
                  <small>Props 数据实时更新 ✓</small>
                </div>
              </div>
            </div>
          </div>

          <!-- 事件通信示例 -->
          <div v-if="currentExample === 'events-basics'" class="demo-container">
            <div class="parent-section">
              <h4>父组件状态</h4>
              <div class="status-display">
                <p><strong>计数器:</strong> {{ parentData.count }}</p>
                <div class="event-log">
                  <h5>事件日志:</h5>
                  <div class="log-entries">
                    <div v-for="log in eventLog.slice(0, 5)" :key="log" class="log-entry">
                      {{ log }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="child-section">
              <h4>子组件操作 (发送事件)</h4>
              <div class="counter-component">
                <div class="counter-display">
                  <span class="count-value">{{ parentData.count }}</span>
                </div>
                <div class="counter-controls">
                  <button @click="handleCountChange(parentData.count + 1)" class="btn btn-primary">
                    +1 递增
                  </button>
                  <button @click="handleCountChange(parentData.count - 1)" class="btn btn-secondary">
                    -1 递减
                  </button>
                  <button @click="handleCountChange(0)" class="btn btn-warning">
                    重置
                  </button>
                </div>
                <div class="custom-controls">
                  <input v-model.number="customValue" type="number" placeholder="输入数值" class="custom-input">
                  <button @click="setCustomValue" class="btn btn-info">
                    设置自定义值
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 高级 Props 示例 -->
          <div v-if="currentExample === 'advanced-props'" class="demo-container">
            <div class="parent-section">
              <h4>复杂数据管理</h4>
              <div class="data-display">
                <p><strong>用户:</strong> {{ parentData.user.name }} ({{ parentData.user.email }})</p>
                <p><strong>技能:</strong> {{ parentData.user.profile?.skills?.join(', ') || '无' }}</p>
              </div>
            </div>

            <div class="child-section">
              <h4>用户编辑器 (复杂 Props)</h4>
              <div class="user-editor theme-light">
                <div class="form-group">
                  <label>姓名:</label>
                  <input :value="parentData.user.name"
                    @input="handleUserUpdate({ ...parentData.user, name: ($event.target as HTMLInputElement).value })"
                    class="form-input">
                </div>
                <div class="form-group">
                  <label>邮箱:</label>
                  <input :value="parentData.user.email"
                    @input="handleUserUpdate({ ...parentData.user, email: ($event.target as HTMLInputElement).value })"
                    type="email" class="form-input">
                </div>
                <div class="form-group">
                  <label>技能列表:</label>
                  <div class="skills-display">
                    <span v-for="skill in parentData.user.profile?.skills || []" :key="skill" class="skill-tag">
                      {{ skill }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Slots 基础示例 -->
          <div v-if="currentExample === 'slots-basics'" class="demo-container">
            <div class="slots-section">
              <h4>默认插槽演示</h4>
              <div class="card">
                <div class="card-body">
                  <h5>这是插槽内容</h5>
                  <p>默认插槽允许父组件向子组件传递任意内容</p>
                  <button class="btn btn-primary">插槽中的按钮</button>
                </div>
              </div>
            </div>

            <div class="slots-section">
              <h4>具名插槽演示</h4>
              <div class="modal-overlay">
                <div class="modal">
                  <header class="modal-header">
                    <h4>🎯 模态框标题</h4>
                  </header>
                  <main class="modal-body">
                    <p>这是模态框的主要内容区域</p>
                    <p>可以包含任意复杂的内容结构</p>
                  </main>
                  <footer class="modal-footer">
                    <button class="btn btn-primary">确认</button>
                    <button class="btn btn-secondary">取消</button>
                  </footer>
                </div>
              </div>
            </div>

            <div class="slots-section">
              <h4>作用域插槽演示</h4>
              <div class="data-list">
                <div v-for="(user, index) in [
                  { id: 1, name: 'Alice Johnson', role: 'Developer', email: 'alice@example.com' },
                  { id: 2, name: 'Bob Smith', role: 'Designer', email: 'bob@example.com' },
                  { id: 3, name: 'Carol Davis', role: 'Manager', email: 'carol@example.com' }
                ]" :key="user.id" class="list-item">
                  <div class="user-item">
                    <span class="user-index">#{{ index + 1 }}</span>
                    <strong>{{ user.name }}</strong>
                    <span class="user-role">({{ user.role }})</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 动态组件示例 -->
          <div v-if="currentExample === 'dynamic-components'" class="demo-container">
            <div class="dynamic-section">
              <h4>动态组件切换</h4>
              <div class="component-switcher">
                <button v-for="comp in ['UserCard', 'UserList', 'UserForm']" :key="comp"
                  @click="dynamicComponentType = comp" :class="{ active: dynamicComponentType === comp }"
                  class="switch-btn">
                  {{ comp }}
                </button>
              </div>

              <div class="dynamic-component-container">
                <!-- UserCard 视图 -->
                <div v-if="dynamicComponentType === 'UserCard'" class="user-card">
                  <div class="card-header">
                    <img src="https://via.placeholder.com/60" alt="Alice Johnson" class="avatar">
                    <div class="user-info">
                      <h5>Alice Johnson</h5>
                      <span class="role">Developer</span>
                    </div>
                  </div>
                  <div class="card-body">
                    <p>📧 alice@example.com</p>
                    <button class="btn btn-sm">查看资料</button>
                  </div>
                </div>

                <!-- UserList 视图 -->
                <div v-if="dynamicComponentType === 'UserList'" class="user-list">
                  <div class="list-header">
                    <h5>用户列表视图</h5>
                  </div>
                  <div class="list-item">
                    <span class="user-name">Alice Johnson</span>
                    <span class="user-email">alice@example.com</span>
                    <span class="user-role">Developer</span>
                    <button class="btn btn-sm">编辑</button>
                  </div>
                </div>

                <!-- UserForm 视图 -->
                <div v-if="dynamicComponentType === 'UserForm'" class="user-form">
                  <h5>用户表单视图</h5>
                  <form>
                    <div class="form-group">
                      <label>姓名:</label>
                      <input value="Alice Johnson" class="form-input" readonly>
                    </div>
                    <div class="form-group">
                      <label>邮箱:</label>
                      <input value="alice@example.com" class="form-input" readonly>
                    </div>
                    <div class="form-group">
                      <label>角色:</label>
                      <input value="Developer" class="form-input" readonly>
                    </div>
                    <button type="submit" class="btn btn-primary">保存</button>
                  </form>
                </div>
              </div>
            </div>

            <div class="async-section">
              <h4>异步组件加载</h4>
              <div class="async-controls">
                <button @click="asyncComponentLoaded = true" :disabled="asyncComponentLoaded" class="btn btn-primary">
                  加载异步组件
                </button>
                <button @click="asyncComponentLoaded = false" :disabled="!asyncComponentLoaded"
                  class="btn btn-secondary">
                  卸载组件
                </button>
              </div>

              <div class="async-component-container">
                <div v-if="asyncComponentLoaded" class="async-user-profile">
                  <h5>异步加载的用户资料</h5>
                  <p>用户: Alice Johnson</p>
                  <p>邮箱: alice@example.com</p>
                  <p>角色: Developer</p>
                  <div class="async-badge">✨ 异步组件已加载</div>
                </div>
                <div v-else class="loading-placeholder">
                  <p>点击按钮加载异步组件</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 框架对比示例 -->
          <div v-if="currentExample === 'framework-comparison'" class="demo-container">
            <div class="comparison-demo">
              <div class="framework-section vue-section">
                <h4>🟢 Vue 3 - Slots</h4>
                <div class="code-example">
                  <h5>父组件使用:</h5>
                  <pre><code>&lt;Card&gt;
  &lt;template #header&gt;
    &lt;h4&gt;卡片标题&lt;/h4&gt;
  &lt;/template&gt;
  
  &lt;p&gt;卡片内容&lt;/p&gt;
  
  &lt;template #footer&gt;
    &lt;button&gt;操作按钮&lt;/button&gt;
  &lt;/template&gt;
&lt;/Card&gt;</code></pre>
                </div>
              </div>

              <div class="framework-section react-section">
                <h4>🔵 React - Children</h4>
                <div class="code-example">
                  <h5>父组件使用:</h5>
                  <pre><code>&lt;Card
  header={&lt;h4&gt;卡片标题&lt;/h4&gt;}
  footer={&lt;button&gt;操作按钮&lt;/button&gt;}
&gt;
  &lt;p&gt;卡片内容&lt;/p&gt;
&lt;/Card&gt;</code></pre>
                </div>
              </div>

              <div class="framework-section angular-section">
                <h4>🔴 Angular - Content Projection</h4>
                <div class="code-example">
                  <h5>父组件使用:</h5>
                  <pre><code>&lt;app-card&gt;
  &lt;h4 slot="header"&gt;卡片标题&lt;/h4&gt;
  &lt;p&gt;卡片内容&lt;/p&gt;
  &lt;button slot="footer"&gt;操作按钮&lt;/button&gt;
&lt;/app-card&gt;</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 代码示例区域 -->
      <div class="code-section">
        <div class="code-tabs">
          <button :class="{ active: activeTab === 'template' }" @click="activeTab = 'template'" class="tab-btn">
            父组件模板
          </button>
          <button :class="{ active: activeTab === 'component' }" @click="activeTab = 'component'" class="tab-btn">
            子组件代码
          </button>
        </div>

        <div class="code-content">
          <CodeEditor v-if="activeTab === 'template'" :model-value="currentCode.template" language="vue"
            :readonly="true" height="400px" />
          <CodeEditor v-if="activeTab === 'component'" :model-value="currentCode.component" language="vue"
            :readonly="true" height="400px" />
        </div>
      </div>

      <!-- 关键概念说明 -->
      <div class="concepts-section">
        <h3>🔑 关键概念</h3>
        <div class="concept-cards">
          <div v-if="['props-basics', 'events-basics', 'advanced-props'].includes(currentExample)" class="concept-card">
            <h4>Props 验证</h4>
            <ul>
              <li>类型检查 (String, Number, Boolean, Array, Object)</li>
              <li>必需属性 (required: true)</li>
              <li>默认值 (default)</li>
              <li>自定义验证器 (validator)</li>
            </ul>
          </div>

          <div v-if="['props-basics', 'events-basics', 'advanced-props'].includes(currentExample)" class="concept-card">
            <h4>自定义事件</h4>
            <ul>
              <li>使用 defineEmits() 声明事件</li>
              <li>emit() 方法触发事件</li>
              <li>事件参数传递</li>
              <li>事件验证和类型安全</li>
            </ul>
          </div>

          <div v-if="currentExample === 'slots-basics'" class="concept-card">
            <h4>默认插槽</h4>
            <ul>
              <li>&lt;slot&gt; 标签定义插槽位置</li>
              <li>父组件内容会替换插槽</li>
              <li>可以提供默认内容作为后备</li>
              <li>支持任意复杂的内容结构</li>
            </ul>
          </div>

          <div v-if="currentExample === 'slots-basics'" class="concept-card">
            <h4>具名插槽</h4>
            <ul>
              <li>&lt;slot name="名称"&gt; 定义具名插槽</li>
              <li>&lt;template #名称&gt; 指定插槽内容</li>
              <li>支持多个不同位置的内容投影</li>
              <li>v-slot 的简写语法 (#)</li>
            </ul>
          </div>

          <div v-if="currentExample === 'slots-basics'" class="concept-card">
            <h4>作用域插槽</h4>
            <ul>
              <li>子组件向插槽传递数据</li>
              <li>&lt;slot :data="value"&gt; 传递数据</li>
              <li>&lt;template #default="{ data }"&gt; 接收数据</li>
              <li>实现灵活的数据展示模式</li>
            </ul>
          </div>

          <div v-if="currentExample === 'dynamic-components'" class="concept-card">
            <h4>动态组件</h4>
            <ul>
              <li>&lt;component :is="componentName"&gt; 动态切换</li>
              <li>组件名可以是字符串或组件对象</li>
              <li>配合 keep-alive 缓存组件状态</li>
              <li>适用于标签页、向导等场景</li>
            </ul>
          </div>

          <div v-if="currentExample === 'dynamic-components'" class="concept-card">
            <h4>异步组件</h4>
            <ul>
              <li>defineAsyncComponent() 定义异步组件</li>
              <li>支持 Promise 和动态导入</li>
              <li>可配置加载、错误、超时状态</li>
              <li>配合 Suspense 实现更好的用户体验</li>
            </ul>
          </div>

          <div v-if="currentExample === 'framework-comparison'" class="concept-card">
            <h4>Vue vs React</h4>
            <ul>
              <li>Vue: 模板语法 + 插槽系统</li>
              <li>React: JSX + children props</li>
              <li>Vue 插槽更直观，React 更灵活</li>
              <li>作用域插槽 vs Render Props</li>
            </ul>
          </div>

          <div v-if="currentExample === 'framework-comparison'" class="concept-card">
            <h4>Vue vs Angular</h4>
            <ul>
              <li>Vue: &lt;slot&gt; 插槽系统</li>
              <li>Angular: &lt;ng-content&gt; 内容投影</li>
              <li>Vue 支持作用域传递</li>
              <li>Angular 更注重选择器匹配</li>
            </ul>
          </div>

          <div class="concept-card">
            <h4>最佳实践</h4>
            <ul>
              <li v-if="['props-basics', 'events-basics', 'advanced-props'].includes(currentExample)">Props 向下传递，事件向上传递
              </li>
              <li v-if="['props-basics', 'events-basics', 'advanced-props'].includes(currentExample)">避免直接修改 Props</li>
              <li v-if="currentExample === 'slots-basics'">合理使用具名插槽组织复杂布局</li>
              <li v-if="currentExample === 'slots-basics'">作用域插槽实现数据与展示分离</li>
              <li v-if="currentExample === 'dynamic-components'">动态组件配合路由实现页面切换</li>
              <li v-if="currentExample === 'dynamic-components'">异步组件实现代码分割和懒加载</li>
              <li v-if="currentExample === 'framework-comparison'">选择适合项目需求的框架和模式</li>
              <li>保持组件职责单一和可复用性</li>
            </ul>
          </div>
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

/* 示例选择器 */
.example-selector {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.example-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e1e8ed;
  background: white;
  color: #2c3e50;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.example-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.example-btn.active {
  background: #3498db;
  border-color: #3498db;
  color: white;
}

/* 示例内容 */
.example-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.example-header {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.example-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.example-description {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

/* 演示区域 */
.demo-section {
  padding: 2rem;
  border-bottom: 1px solid #e1e8ed;
}

.demo-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.live-demo {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.demo-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.parent-section,
.child-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.parent-section h4,
.child-section h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

/* 数据显示 */
.data-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.data-item label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 80px;
}

.data-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.data-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* 用户资料卡片 */
.user-profile {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.profile-header h5 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.role-badge {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.profile-content .message {
  color: #27ae60;
  font-weight: 500;
  margin: 0.5rem 0;
}

.profile-content .email {
  color: #7f8c8d;
  margin: 0.5rem 0;
}

.props-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
  color: #27ae60;
}

/* 计数器组件 */
.counter-component {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.counter-display {
  margin-bottom: 1.5rem;
}

.count-value {
  font-size: 3rem;
  font-weight: bold;
  color: #3498db;
  display: inline-block;
  min-width: 100px;
}

.counter-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.custom-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.custom-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 120px;
}

/* 按钮样式 */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover {
  background: #e67e22;
}

.btn-info {
  background: #1abc9c;
  color: white;
}

.btn-info:hover {
  background: #16a085;
}

/* 状态显示 */
.status-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-display p {
  margin: 0;
  font-size: 1.1rem;
}

.event-log {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
}

.event-log h5 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.log-entries {
  max-height: 150px;
  overflow-y: auto;
}

.log-entry {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #27ae60;
  padding: 0.25rem 0;
  border-bottom: 1px solid #ecf0f1;
}

.log-entry:last-child {
  border-bottom: none;
}

/* 用户编辑器 */
.user-editor {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.skills-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

/* 代码区域 */
.code-section {
  background: #f8f9fa;
}

.code-tabs {
  display: flex;
  border-bottom: 1px solid #e1e8ed;
}

.tab-btn {
  padding: 1rem 2rem;
  border: none;
  background: transparent;
  color: #7f8c8d;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  color: #2c3e50;
  background: rgba(52, 152, 219, 0.1);
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
  background: white;
}

.code-content {
  background: white;
}

/* 概念说明 */
.concepts-section {
  padding: 2rem;
}

.concepts-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.concept-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.concept-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3498db;
}

.concept-card h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.concept-card ul {
  margin: 0;
  padding-left: 1.5rem;
}

.concept-card li {
  margin-bottom: 0.5rem;
  color: #555;
  line-height: 1.5;
}

/* Slots 相关样式 */
.slots-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.slots-section h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

/* 模态框样式 */
.modal-overlay {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 100%;
}

.modal-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h4 {
  margin: 0;
  color: #2c3e50;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* 数据列表样式 */
.data-list {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.list-item {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.list-item:last-child {
  margin-bottom: 0;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-index {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.user-role {
  color: #7f8c8d;
  font-style: italic;
}

.user-email {
  color: #27ae60;
  font-size: 0.9rem;
}

/* 动态组件样式 */
.dynamic-section,
.async-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.dynamic-section h4,
.async-section h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.component-switcher {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.switch-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e1e8ed;
  background: white;
  color: #2c3e50;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.switch-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.switch-btn.active {
  background: #3498db;
  border-color: #3498db;
  color: white;
}

.dynamic-component-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  min-height: 200px;
}

/* 用户卡片样式 */
.user-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info h5 {
  margin: 0;
  color: #2c3e50;
}

.role {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.card-body p {
  margin: 0.5rem 0;
  color: #7f8c8d;
}

/* 用户列表样式 */
.user-list {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.list-header h5 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.user-list .list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
}

.user-list .user-email {
  color: #7f8c8d;
}

.user-list .user-role {
  color: #27ae60;
  font-style: italic;
}

/* 用户表单样式 */
.user-form {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.user-form h5 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
}

/* 异步组件样式 */
.async-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.async-component-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.async-user-profile {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 300px;
}

.async-user-profile h5 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.async-user-profile p {
  margin: 0.5rem 0;
  color: #7f8c8d;
}

.async-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-top: 1rem;
  display: inline-block;
}

.loading-placeholder {
  text-align: center;
  color: #7f8c8d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e1e8ed;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 框架对比样式 */
.comparison-demo {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.framework-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.vue-section {
  border-left: 4px solid #4fc08d;
}

.react-section {
  border-left: 4px solid #61dafb;
}

.angular-section {
  border-left: 4px solid #dd0031;
}

.framework-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.code-example h5 {
  color: #2c3e50;
  margin: 1rem 0 0.5rem 0;
  font-size: 1rem;
}

.code-example pre {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.code-example code {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #2c3e50;
  line-height: 1.4;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comparison-table th,
.comparison-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
}

.comparison-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.comparison-table tr:last-child td {
  border-bottom: none;
}

.best-practices {
  margin-top: 2rem;
}

.practice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.practice-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.practice-item h6 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.practice-item ul {
  margin: 0;
  padding-left: 1.5rem;
}

.practice-item li {
  margin-bottom: 0.5rem;
  color: #555;
  line-height: 1.4;
}

/* 按钮尺寸变体 */
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .module-container {
    padding: 1rem;
  }

  .demo-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .example-selector {
    flex-direction: column;
    align-items: center;
  }

  .counter-controls,
  .custom-controls {
    flex-direction: column;
  }

  .concept-cards {
    grid-template-columns: 1fr;
  }

  .user-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .component-switcher {
    flex-direction: column;
  }

  .user-list .list-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .async-controls {
    flex-direction: column;
  }

  .practice-grid {
    grid-template-columns: 1fr;
  }
}
</style>