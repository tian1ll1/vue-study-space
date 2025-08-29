import { ref, watch, type Ref } from 'vue'

/**
 * 本地存储组合式函数
 * 演示副作用处理和数据持久化
 */
export function useLocalStorage<T>(
    key: string,
    defaultValue: T,
    options: {
        serializer?: {
            read: (value: string) => T
            write: (value: T) => string
        }
    } = {}
): [Ref<T>, (value: T) => void] {
    const {
        serializer = {
            read: (v: string) => {
                try {
                    return JSON.parse(v)
                } catch {
                    return v as T
                }
            },
            write: (v: T) => JSON.stringify(v)
        }
    } = options

    // 从本地存储读取初始值
    function read() {
        try {
            const item = localStorage.getItem(key)
            if (item === null) {
                return defaultValue
            }
            return serializer.read(item)
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error)
            return defaultValue
        }
    }

    // 写入本地存储
    function write(value: T) {
        try {
            localStorage.setItem(key, serializer.write(value))
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error)
        }
    }

    // 创建响应式引用
    const storedValue = ref(read()) as Ref<T>

    // 监听值的变化并同步到本地存储
    watch(
        storedValue,
        (newValue) => {
            write(newValue)
        },
        { deep: true }
    )

    // 设置值的函数
    function setValue(value: T) {
        storedValue.value = value
    }

    return [storedValue, setValue]
}