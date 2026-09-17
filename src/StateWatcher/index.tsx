import type { FilterState } from "../useFilterState"
import type { ColumnsMaskState } from "../useMaskableColumns"
import type { PaginationState } from "../usePagination"
import type { SortState } from "../useSortState"

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
