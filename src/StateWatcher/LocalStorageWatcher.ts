import type { SpecificStateWatcher, StateWatcherInterface } from "."

function save<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
}

function load<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
        try {
            const storedValue = localStorage.getItem(key)
            if (storedValue === null) {
                return resolve(null)
            }

            return resolve(JSON.parse(storedValue))
        } catch (error) {
            reject(error)
        }
    })
}

function watch<State>(key: string): SpecificStateWatcher<State> {
    return {
        onChange(filterState) {
            save(key, filterState)
        },
        loadInitial() {
            return load(key)
        },
    }
}

/**
 * Generates a watcher that will save states in browser's LocalStorage.
 */
export default function generateLocalStorageWatcher(namespace: string): StateWatcherInterface {
    return {
        filterState: watch(`${namespace}-filter-state`),
        sortState: watch(`${namespace}-sort-state`),
        columnsMaskState: watch(`${namespace}-columns-mask-state`),
        paginationState: watch(`${namespace}-pagination-state`),
    }
}
