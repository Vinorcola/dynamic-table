import type { FilterState } from "../useFilterState.js"
import type { ColumnsMaskState } from "../useMaskableColumns.js"
import type { PaginationState } from "../usePagination.js"
import type { SortState } from "../useSortState.js"

export interface StateWatcherInterface {
    filterState?: SpecificStateWatcher<FilterState>
    sortState?: SpecificStateWatcher<SortState>
    columnsMaskState?: SpecificStateWatcher<ColumnsMaskState>
    paginationState?: SpecificStateWatcher<PaginationState>
}

export interface SpecificStateWatcher<State> {
    onChange?(state: State): void
    loadInitial?(): Promise<State | null>
}
