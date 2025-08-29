import { ref, computed, type Ref } from 'vue'
import type {
  CodeExecutionContext,
  CodeExecutionLog,
  CodeExecutionMetrics,
  ConsoleLog
} from '@/types/editor'

export interface CodeExample {
  id: string
  name: string
  description: string
  code: string
  language: string
  category?: string
}

export interface UseCodeExecutionOptions {
  timeout?: number
  memoryLimit?: number
  enableConsole?: boolean
  enableMetrics?: boolean
}

export function useCodeExecution(options: UseCodeExecutionOptions = {}) {
  const {
    timeout = 5000,
    memoryLimit = 50 * 1024 * 1024, // 50MB
    enableConsole = true,
    enableMetrics = true
  } = options

  // 响应式状态
  const isExecuting = ref(false)
  const executionResult = ref<any>(null)
  const executionError = ref<string | null>(null)
  const executionMetrics = ref<CodeExecutionMetrics>({
    executionTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    outputSize: 0,
    errorCount: 0,
    warningCount: 0
  })
  const consoleLogs = ref<ConsoleLog[]>([])
  const executionHistory = ref<CodeExecutionLog[]>([])

  // 计算属性
  const hasResult = computed(() => executionResult.value !== null)
  const hasError = computed(() => !!executionError.value)
  const canExecute = computed(() => !isExecuting.value)
  const totalExecutions = computed(() => executionHistory.value.length)
  const successfulExecutions = computed(() =>
    executionHistory.value.filter(log => log.level !== 'error').length
  )
  const failedExecutions = computed(() =>
    executionHistory.value.filter(log => log.level === 'error').length
  )

  // 预定义的代码示例
  const defaultExamples: CodeExample[] = [
    {
      id: 'hello-world',
      name: 'Hello World',
      description: '基础的 Hello World 示例',
      code: 'console.log("Hello, Vue 3 Learning!");',
      language: 'javascript',
      category: 'basic'
    },
    {
      id: 'variables',
      name: '变量声明',
      description: '演示不同的变量声明方式',
      code: `// 变量声明示例
const message = "Hello";
let count = 0;
var name = "Vue Developer";

console.log(message, count, name);

// 修改变量
count = 10;
console.log("Updated count:", count);`,
      language: 'javascript',
      category: 'basic'
    },
    {
      id: 'functions',
      name: '函数定义',
      description: '演示函数的定义和调用',
      code: `// 函数定义示例
function greet(name) {
  return \`Hello, \${name}!\`;
}

const add = (a, b) => a + b;

// 函数调用
console.log(greet("Vue"));
console.log("2 + 3 =", add(2, 3));

// 高阶函数
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);`,
      language: 'javascript',
      category: 'basic'
    },
    {
      id: 'objects-arrays',
      name: '对象和数组',
      description: '演示对象和数组的操作',
      code: `// 对象和数组示例
const person = {
  name: "Alice",
  age: 30,
  skills: ["JavaScript", "Vue", "TypeScript"]
};

console.log("Person:", person);
console.log("Name:", person.name);
console.log("Skills:", person.skills);

// 数组操作
const fruits = ["apple", "banana", "orange"];
fruits.push("grape");
console.log("Fruits:", fruits);

// 解构赋值
const { name, age } = person;
const [first, second] = fruits;
console.log(\`\${name} is \${age} years old\`);
console.log(\`First fruit: \${first}, Second: \${second}\`);`,
      language: 'javascript',
      category: 'intermediate'
    },
    {
      id: 'async-await',
      name: '异步编程',
      description: '演示 Promise 和 async/await',
      code: `// 异步编程示例
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchData() {
  console.log("开始获取数据...");
  await delay(1000);
  console.log("数据获取完成!");
  return { id: 1, name: "Sample Data" };
}

// 使用 async/await
async function main() {
  try {
    const data = await fetchData();
    console.log("获取到的数据:", data);
  } catch (error) {
    console.error("错误:", error);
  }
}

main();`,
      language: 'javascript',
      category: 'advanced'
    },
    {
      id: 'vue-reactivity',
      name: 'Vue 响应式',
      description: '模拟 Vue 3 响应式系统',
      code: `// 模拟 Vue 3 响应式系统
function ref(value) {
  return {
    value,
    get() { return this.value; },
    set(newValue) { 
      this.value = newValue;
      console.log(\`响应式更新: \${newValue}\`);
    }
  };
}

function reactive(obj) {
  return new Proxy(obj, {
    set(target, key, value) {
      console.log(\`响应式更新: \${key} = \${value}\`);
      target[key] = value;
      return true;
    }
  });
}

// 使用响应式数据
const count = ref(0);
const state = reactive({ name: "Vue", version: 3 });

console.log("初始值:", count.value);
count.value = 10;

console.log("初始状态:", state);
state.name = "Vue.js";
state.version = 3.4;`,
      language: 'javascript',
      category: 'vue'
    }
  ]

  const examples = ref<CodeExample[]>(defaultExamples)

  // 执行代码
  async function executeCode(code: string, language: string = 'javascript'): Promise<any> {
    if (isExecuting.value) {
      throw new Error('代码正在执行中，请等待完成')
    }

    // 清除之前的结果
    clearResults()
    isExecuting.value = true

    const startTime = performance.now()
    const executionId = Date.now().toString()

    try {
      // 记录执行开始
      addExecutionLog('info', `开始执行代码 (${language})`, executionId)

      let result: any

      switch (language) {
        case 'javascript':
          result = await executeJavaScript(code)
          break
        case 'typescript':
          result = await executeTypeScript(code)
          break
        case 'vue':
          result = await executeVue(code)
          break
        default:
          throw new Error(`不支持的语言: ${language}`)
      }

      const endTime = performance.now()
      const executionTime = Math.round(endTime - startTime)

      // 更新执行指标
      if (enableMetrics) {
        executionMetrics.value = {
          executionTime,
          memoryUsage: estimateMemoryUsage(result),
          cpuUsage: 0, // 简化版本，实际项目中需要更复杂的计算
          outputSize: consoleLogs.value.length,
          errorCount: consoleLogs.value.filter(log => log.level === 'error').length,
          warningCount: consoleLogs.value.filter(log => log.level === 'warn').length
        }
      }

      executionResult.value = result
      addExecutionLog('info', `代码执行成功 (${executionTime}ms)`, executionId)

      return result

    } catch (error) {
      const endTime = performance.now()
      const executionTime = Math.round(endTime - startTime)
      const errorMessage = error instanceof Error ? error.message : String(error)

      executionError.value = errorMessage
      addExecutionLog('error', `代码执行失败: ${errorMessage} (${executionTime}ms)`, executionId)

      if (enableMetrics) {
        executionMetrics.value = {
          ...executionMetrics.value,
          executionTime,
          errorCount: executionMetrics.value.errorCount + 1
        }
      }

      throw error

    } finally {
      isExecuting.value = false
    }
  }

  // 执行 JavaScript 代码
  async function executeJavaScript(code: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`代码执行超时 (${timeout}ms)`))
      }, timeout)

      try {
        // 创建安全的执行环境
        const safeConsole = createSafeConsole()
        const safeGlobals = {
          console: safeConsole,
          setTimeout: (fn: Function, delay: number) => setTimeout(fn, Math.min(delay, 1000)),
          setInterval: (fn: Function, delay: number) => setInterval(fn, Math.max(delay, 100)),
          clearTimeout,
          clearInterval,
          Date,
          Math,
          JSON,
          Array,
          Object,
          String,
          Number,
          Boolean,
          RegExp,
          Promise,
          Map,
          Set,
          WeakMap,
          WeakSet
        }

        // 禁用危险的全局对象
        const restrictedGlobals = ['eval', 'Function', 'XMLHttpRequest', 'fetch', 'import', 'require']

        // 创建安全的执行函数
        const safeFunction = new Function(
          ...Object.keys(safeGlobals),
          `
          "use strict";
          ${restrictedGlobals.map(name => `var ${name} = undefined;`).join('\n')}
          
          try {
            return (function() {
              ${code}
            })();
          } catch (error) {
            throw error;
          }
          `
        )

        const result = safeFunction(...Object.values(safeGlobals))
        clearTimeout(timeoutId)
        resolve(result)

      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }

  // 执行 TypeScript 代码（简化版本）
  async function executeTypeScript(code: string): Promise<any> {
    // 简单的 TypeScript 转换，实际项目中应该使用 TypeScript 编译器
    const jsCode = code
      .replace(/:\s*\w+(\[\])?/g, '') // 移除类型注解
      .replace(/interface\s+\w+\s*{[^}]*}/g, '') // 移除接口定义
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // 移除类型别名
      .replace(/as\s+\w+/g, '') // 移除类型断言

    return executeJavaScript(jsCode)
  }

  // 执行 Vue 代码（简化版本）
  async function executeVue(code: string): Promise<any> {
    // 这里应该实现 Vue 单文件组件的编译和执行
    // 目前只是简单地提取 script 部分执行
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
    if (scriptMatch) {
      return executeJavaScript(scriptMatch[1])
    } else {
      throw new Error('未找到有效的 script 标签')
    }
  }

  // 创建安全的 console 对象
  function createSafeConsole() {
    const safeConsole: any = {}

      ;['log', 'info', 'warn', 'error'].forEach(method => {
        safeConsole[method] = (...args: any[]) => {
          const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ')

          if (enableConsole) {
            const log: ConsoleLog = {
              level: method as 'log' | 'info' | 'warn' | 'error',
              message,
              timestamp: new Date()
            }
            consoleLogs.value.push(log)
          }

          // 调用原始 console 方法
          console[method as keyof Console](...args)
        }
      })

    return safeConsole
  }

  // 估算内存使用
  function estimateMemoryUsage(data: any): number {
    try {
      return JSON.stringify(data).length * 2 // 简化的内存估算
    } catch {
      return 0
    }
  }

  // 添加执行日志
  function addExecutionLog(level: 'log' | 'info' | 'warn' | 'error', message: string, source?: string) {
    const log: CodeExecutionLog = {
      timestamp: new Date(),
      level,
      message,
      source
    }
    executionHistory.value.push(log)

    // 限制历史记录数量
    if (executionHistory.value.length > 100) {
      executionHistory.value = executionHistory.value.slice(-50)
    }
  }

  // 清除结果
  function clearResults() {
    executionResult.value = null
    executionError.value = null
    executionMetrics.value = {
      executionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      outputSize: 0,
      errorCount: 0,
      warningCount: 0
    }
  }

  // 清空控制台
  function clearConsole() {
    consoleLogs.value = []
  }

  // 清空历史记录
  function clearHistory() {
    executionHistory.value = []
  }

  // 重置所有状态
  function reset() {
    clearResults()
    clearConsole()
    clearHistory()
    isExecuting.value = false
  }

  // 添加示例
  function addExample(example: CodeExample) {
    examples.value.push(example)
  }

  // 移除示例
  function removeExample(id: string) {
    const index = examples.value.findIndex(ex => ex.id === id)
    if (index > -1) {
      examples.value.splice(index, 1)
    }
  }

  // 获取示例
  function getExample(id: string): CodeExample | undefined {
    return examples.value.find(ex => ex.id === id)
  }

  // 按类别获取示例
  function getExamplesByCategory(category: string): CodeExample[] {
    return examples.value.filter(ex => ex.category === category)
  }

  // 搜索示例
  function searchExamples(query: string): CodeExample[] {
    const lowerQuery = query.toLowerCase()
    return examples.value.filter(ex =>
      ex.name.toLowerCase().includes(lowerQuery) ||
      ex.description.toLowerCase().includes(lowerQuery) ||
      ex.code.toLowerCase().includes(lowerQuery)
    )
  }

  // 验证代码
  function validateCode(code: string, language: string = 'javascript'): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!code.trim()) {
      errors.push('代码不能为空')
      return { isValid: false, errors }
    }

    if (language === 'javascript' || language === 'typescript') {
      // 检查括号匹配
      const openBrackets = (code.match(/[({[]/g) || []).length
      const closeBrackets = (code.match(/[)}\]]/g) || []).length
      if (openBrackets !== closeBrackets) {
        errors.push('括号不匹配')
      }

      // 基础语法检查
      try {
        new Function(code)
      } catch (error) {
        if (error instanceof SyntaxError) {
          errors.push(`语法错误: ${error.message}`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 格式化代码（简化版本）
  function formatCode(code: string): string {
    // 简单的代码格式化，实际项目中应该使用 Prettier
    let formatted = code
      .replace(/;/g, ';\n')
      .replace(/{/g, '{\n')
      .replace(/}/g, '\n}')
      .replace(/,/g, ',\n')

    // 简单的缩进处理
    const lines = formatted.split('\n')
    let indentLevel = 0
    const indentSize = 2

    const formattedLines = lines.map(line => {
      const trimmed = line.trim()
      if (!trimmed) return ''

      if (trimmed.includes('}')) indentLevel--
      const indented = ' '.repeat(Math.max(0, indentLevel * indentSize)) + trimmed
      if (trimmed.includes('{')) indentLevel++

      return indented
    })

    return formattedLines.join('\n')
  }

  return {
    // 状态
    isExecuting: computed(() => isExecuting.value),
    executionResult: computed(() => executionResult.value),
    executionError: computed(() => executionError.value),
    executionMetrics: computed(() => executionMetrics.value),
    consoleLogs: computed(() => consoleLogs.value),
    executionHistory: computed(() => executionHistory.value),
    examples: computed(() => examples.value),

    // 计算属性
    hasResult,
    hasError,
    canExecute,
    totalExecutions,
    successfulExecutions,
    failedExecutions,

    // 方法
    executeCode,
    clearResults,
    clearConsole,
    clearHistory,
    reset,
    addExample,
    removeExample,
    getExample,
    getExamplesByCategory,
    searchExamples,
    validateCode,
    formatCode
  }
}

// 按语言组织的代码示例
export const codeExamples = {
  javascript: {
    'hello-world': 'console.log("Hello, Vue 3 Learning!");',
    'variables': `let count = 5;
const message = "Hello World";
count = 10;
console.log("Updated count:", count);`,
    'arrays': `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);`,
    'functions': `function greet(name) {
  return \`Hello, \${name}!\`;
}

const result = greet("Vue Developer");
console.log(result);`,
    'async': `async function fetchData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ message: "Data loaded!" });
    }, 1000);
  });
}

async function main() {
  console.log("Loading...");
  const data = await fetchData();
  console.log(data);
}

main();`
  },
  typescript: {
    'hello-world': 'console.log("Hello from TypeScript!");',
    'types': `interface User {
  name: string;
  age: number;
  skills: string[];
}

const user: User = {
  name: "Alice",
  age: 30,
  skills: ["JavaScript", "Vue", "TypeScript"]
};

console.log(\`User: \${user.name}, Age: \${user.age}\`);`,
    'generics': `function identity<T>(arg: T): T {
  return arg;
}

const stringResult = identity<string>("Hello");
const numberResult = identity<number>(42);

console.log("String:", stringResult);
console.log("Number:", numberResult);`,
    'classes': `class Calculator {
  private result: number = 0;
  
  add(value: number): Calculator {
    this.result += value;
    return this;
  }
  
  multiply(value: number): Calculator {
    this.result *= value;
    return this;
  }
  
  getResult(): number {
    return this.result;
  }
}

const calc = new Calculator();
const result = calc.add(5).multiply(3).getResult();
console.log("Result:", result);`
  },
  vue: {
    'reactive': `import { reactive } from 'vue';

const state = reactive({
  count: 0,
  name: "Vue.js",
  version: 3.4
});

state.count++;
state.name = "Vue 3";
console.log("State:", state);`,
    'ref': `import { ref, computed } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);

count.value = 5;
console.log("Count:", count.value);
console.log("Doubled:", doubled.value);`,
    'watch': `import { ref, watch } from 'vue';

const message = ref("Hello");

watch(message, (newValue, oldValue) => {
  console.log(\`Message changed from "\${oldValue}" to "\${newValue}"\`);
});

message.value = "Hello Vue 3!";`
  }
};

