import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TestCase {
    input: any
    expectedOutput: any
    description: string
}

export interface Hint {
    level: number
    content: string
    codeSnippet?: string
}

export interface CodeExample {
    id: string
    moduleId: string
    title: string
    description: string
    tags: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    vueCode: string
    reactCode?: string
    angularCode?: string
    explanation: string
    keyPoints: string[]
}

export interface Exercise {
    id: string
    moduleId: string
    title: string
    instruction: string
    starterCode: string
    solution: string
    testCases: TestCase[]
    hints: Hint[]
    relatedConcepts: string[]
}

export const useExamplesStore = defineStore('examples', () => {
    // State
    const examples = ref<CodeExample[]>([])
    const exercises = ref<Exercise[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const getExamplesByModule = computed(() => (moduleId: string) => {
        return examples.value.filter(example => example.moduleId === moduleId)
    })

    const getExercisesByModule = computed(() => (moduleId: string) => {
        return exercises.value.filter(exercise => exercise.moduleId === moduleId)
    })

    const getExampleById = computed(() => (id: string) => {
        return examples.value.find(example => example.id === id)
    })

    const getExerciseById = computed(() => (id: string) => {
        return exercises.value.find(exercise => exercise.id === id)
    })

    const getExamplesByDifficulty = computed(() => (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
        return examples.value.filter(example => example.difficulty === difficulty)
    })

    const getExamplesByTag = computed(() => (tag: string) => {
        return examples.value.filter(example => example.tags.includes(tag))
    })

    // Actions
    function addExample(example: CodeExample) {
        const existingIndex = examples.value.findIndex(e => e.id === example.id)
        if (existingIndex >= 0) {
            examples.value[existingIndex] = example
        } else {
            examples.value.push(example)
        }
    }

    function addExercise(exercise: Exercise) {
        const existingIndex = exercises.value.findIndex(e => e.id === exercise.id)
        if (existingIndex >= 0) {
            exercises.value[existingIndex] = exercise
        } else {
            exercises.value.push(exercise)
        }
    }

    function removeExample(id: string) {
        const index = examples.value.findIndex(example => example.id === id)
        if (index >= 0) {
            examples.value.splice(index, 1)
        }
    }

    function removeExercise(id: string) {
        const index = exercises.value.findIndex(exercise => exercise.id === id)
        if (index >= 0) {
            exercises.value.splice(index, 1)
        }
    }

    function updateExample(id: string, updates: Partial<CodeExample>) {
        const example = examples.value.find(e => e.id === id)
        if (example) {
            Object.assign(example, updates)
        }
    }

    function updateExercise(id: string, updates: Partial<Exercise>) {
        const exercise = exercises.value.find(e => e.id === id)
        if (exercise) {
            Object.assign(exercise, updates)
        }
    }

    function loadInitialData() {
        loading.value = true
        error.value = null

        try {
            // Load basic syntax examples
            const basicSyntaxExamples: CodeExample[] = [
                {
                    id: 'basic-interpolation',
                    moduleId: 'basic-syntax',
                    title: '文本插值',
                    description: 'Vue 3中的基本文本插值语法',
                    tags: ['interpolation', 'template'],
                    difficulty: 'beginner',
                    vueCode: `<template>
  <div>
    <h1>{{ message }}</h1>
    <p>{{ user.name }} - {{ user.age }}岁</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue 3!')
const user = ref({
  name: '张三',
  age: 25
})
</script>`,
                    reactCode: `function App() {
  const [message, setMessage] = useState('Hello React!')
  const [user, setUser] = useState({
    name: '张三',
    age: 25
  })

  return (
    <div>
      <h1>{message}</h1>
      <p>{user.name} - {user.age}岁</p>
    </div>
  )
}`,
                    explanation: 'Vue使用双大括号{{}}进行文本插值，React使用单大括号{}',
                    keyPoints: ['双大括号语法', '响应式数据', 'ref函数']
                }
            ]

            const basicSyntaxExercises: Exercise[] = [
                {
                    id: 'interpolation-exercise',
                    moduleId: 'basic-syntax',
                    title: '插值练习',
                    instruction: '创建一个显示用户信息的组件，包含姓名、年龄和邮箱',
                    starterCode: `<template>
  <div>
    <!-- 在这里添加插值表达式 -->
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 定义响应式数据
</script>`,
                    solution: `<template>
  <div>
    <h2>{{ user.name }}</h2>
    <p>年龄: {{ user.age }}</p>
    <p>邮箱: {{ user.email }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const user = ref({
  name: '李四',
  age: 30,
  email: 'lisi@example.com'
})
</script>`,
                    testCases: [
                        {
                            input: { name: '李四', age: 30, email: 'lisi@example.com' },
                            expectedOutput: '应该显示用户的姓名、年龄和邮箱',
                            description: '验证插值表达式正确显示数据'
                        }
                    ],
                    hints: [
                        {
                            level: 1,
                            content: '使用ref()创建响应式数据',
                            codeSnippet: 'const user = ref({ ... })'
                        },
                        {
                            level: 2,
                            content: '在模板中使用{{ }}进行插值',
                            codeSnippet: '{{ user.name }}'
                        }
                    ],
                    relatedConcepts: ['响应式系统', '模板语法', 'Composition API']
                }
            ]

            examples.value.push(...basicSyntaxExamples)
            exercises.value.push(...basicSyntaxExercises)

            loading.value = false
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to load examples'
            loading.value = false
        }
    }

    function clearData() {
        examples.value = []
        exercises.value = []
        error.value = null
    }

    return {
        // State
        examples,
        exercises,
        loading,
        error,

        // Getters
        getExamplesByModule,
        getExercisesByModule,
        getExampleById,
        getExerciseById,
        getExamplesByDifficulty,
        getExamplesByTag,

        // Actions
        addExample,
        addExercise,
        removeExample,
        removeExercise,
        updateExample,
        updateExercise,
        loadInitialData,
        clearData
    }
})