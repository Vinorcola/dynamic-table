import { useCallback, useMemo } from "react"

import type { SpecificStateWatcher } from "./StateWatcher/index.js"
import type { BaseItem } from "./index.js"
import type { InternalItems } from "./useItems.js"
import useWatchedState from "./useWatchedState.js"

/**
 * A complete pagination state.
 */
export interface PaginationState {
    currentPage: number
    itemsPerPage: number
}

/**
 * Apply pagination.
 *
 * Return pagination state & pagination control as well as items to display on the current page.
 */
export default function usePagination<Item extends BaseItem>(
    items: InternalItems<Item>,
    initialState: PaginationState | undefined,
    watcher: SpecificStateWatcher<PaginationState> | undefined,
) {
    const [pagination, setPagination] = useWatchedState({ currentPage: 1, itemsPerPage: 12 }, initialState, watcher)

    const totalPages = useMemo(() => Math.ceil(items.length / pagination.itemsPerPage), [items, pagination])
    const currentPage = useMemo(
        () => Math.max(1, Math.min(totalPages, pagination.currentPage)),
        [totalPages, pagination],
    )

    return {
        items: useMemo(
            () => items.slice((currentPage - 1) * pagination.itemsPerPage, currentPage * pagination.itemsPerPage),
            [items, pagination, currentPage],
        ),
        itemsPerPage: pagination.itemsPerPage,
        onItemsPerPageChange: useCallback((itemsPerPage: number) => {
            setPagination((pagination) => ({
                ...pagination,
                itemsPerPage,
            }))
        }, []),
        totalPages,
        currentPage,
        onCurrentPageChange: useCallback((page: number) => {
            setPagination((pagination) => ({
                ...pagination,
                currentPage: page,
            }))
        }, []),
    }
}
