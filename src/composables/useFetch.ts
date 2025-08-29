import { ref, type Ref } from 'vue'

interface UseFetchReturn<T> {
    data: Ref<T | null>
    error: Ref<Error | null>
    loading: Ref<boolean>
    execute: () => Promise<void>
}

/**
 * 数据获取组合式函数
 * 演示异步操作和错误处理
 */
export function useFetch<T = any>(url: string): UseFetchReturn<T> {
    const data = ref(null) as Ref<T | null>
    const error = ref(null) as Ref<Error | null>
    const loading = ref(false)

    async function execute() {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            data.value = result
        } catch (err) {
            error.value = err instanceof Error ? err : new Error('Unknown error')
        } finally {
            loading.value = false
        }
    }

    return {
        data,
        error,
        loading,
        execute
    }
}

/**
 * 带缓存的数据获取组合式函数
 * 演示更复杂的状态管理
 */
export function useFetchWithCache<T = any>(
    url: string,
    cacheTime = 5 * 60 * 1000 // 5分钟缓存
): UseFetchReturn<T> & { refresh: () => Promise<void> } {
    const cache = new Map<string, { data: T; timestamp: number }>()

    const data = ref(null) as Ref<T | null>
    const error = ref(null) as Ref<Error | null>
    const loading = ref(false)

    async function execute() {
        // 检查缓存
        const cached = cache.get(url)
        if (cached && Date.now() - cached.timestamp < cacheTime) {
            data.value = cached.data
            return
        }

        loading.value = true
        error.value = null

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            data.value = result

            // 更新缓存
            cache.set(url, { data: result, timestamp: Date.now() })
        } catch (err) {
            error.value = err instanceof Error ? err : new Error('Unknown error')
        } finally {
            loading.value = false
        }
    }

    async function refresh() {
        cache.delete(url)
        await execute()
    }

    return {
        data,
        error,
        loading,
        execute,
        refresh
    }
}