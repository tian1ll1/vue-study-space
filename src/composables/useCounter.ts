import { ref, computed } from 'vue'

/**
 * 计数器组合式函数
 * 演示基础的状态管理和方法封装
 */
export function useCounter(initialValue = 0) {
    // 响应式状态
    const count = ref(initialValue)

    // 计算属性
    const doubleCount = computed(() => count.value * 2)
    const isEven = computed(() => count.value % 2 === 0)

    // 方法
    function increment() {
        count.value++
    }

    function decrement() {
        count.value--
    }

    function reset() {
        count.value = initialValue
    }

    function setCount(value: number) {
        count.value = value
    }

    // 返回状态和方法
    return {
        // 状态
        count,
        doubleCount,
        isEven,
        // 方法
        increment,
        decrement,
        reset,
        setCount
    }
}