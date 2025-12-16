import { drop } from "@vinorcola/utils/object"
import { extractSearchableText } from "@vinorcola/utils/text"
import { useCallback, useMemo, useState } from "react"

import type { BaseItem, Primitive } from "./index.js"
import type { InternalColumn, InternalColumns } from "./useColumns.js"
import type { InternalItems, LoadedInternalValue } from "./useItems.js"

/**
 * A filter type.
 */
export type FilterType = "search" | "selection"
/**
 * A filter state based on text search.
 */
export interface SearchState {
    readonly searchText: string
}
/**
 * A filter state based on value selection.
 */
export interface SelectionState<Value extends Primitive> {
    readonly hiddenValues: Value[]
}
// TODO: DateIntervalState
/**
 * A filter state for a column, either based on text search or value selection.
 */
export type ColumnFilterState<Value extends Primitive> = SearchState | SelectionState<Value>
/**
 * A complete filter state.
 */
export interface FilterState {
    [columnId: string]: ColumnFilterState<Primitive>
}

/**
 * Mark a column as filterable by text search.
 */
export type InternalSearchableColumn<Item extends BaseItem, Value extends Primitive> = InternalColumn<Item, Value> & {
    readonly searchText: string | null
    readonly onSearchTextChange: (searchText: string | null) => void
}
/**
 * Mark a column as filterable by value selection.
 */
export type InternalSelectableColumn<Item extends BaseItem, Value extends Primitive> = InternalColumn<Item, Value> & {
    readonly hiddenValues: Value[]
    readonly onSelectionChange: (hiddenValues: Value[]) => void
}
/**
 * Mark a column as filterable, either by text search or value selection.
 */
export type InternalFilterableColumn<Item extends BaseItem, Value extends Primitive> =
    | InternalSearchableColumn<Item, Value>
    | InternalSelectableColumn<Item, Value>

export function isFilterable<Item extends BaseItem, Value extends Primitive>(
    column: InternalColumn<Item, Value>,
): column is InternalFilterableColumn<Item, Value> {
    return (
        ((column as any).searchText !== undefined && (column as any).onSearchTextChange !== undefined) ||
        ((column as any).hiddenValues !== undefined && (column as any).onSelectionChange !== undefined)
    )
}

export function isSearchable<Item extends BaseItem, Value extends Primitive>(
    column: InternalColumn<Item, Value>,
): column is InternalSearchableColumn<Item, Value> {
    return (column as any).searchText !== undefined && (column as any).onSearchTextChange !== undefined
}

export function isSelectable<Item extends BaseItem, Value extends Primitive>(
    column: InternalColumn<Item, Value>,
): column is InternalSelectableColumn<Item, Value> {
    return (column as any).hiddenValues !== undefined && (column as any).onSelectionChange !== undefined
}

/**
 * Filters items.
 *
 * This hook will add filter state & filter control on each given columns, returning decorated columns. It will also
 * apply those filters on the items list, returning a filtered list.
 */
export default function useFilterState<Item extends BaseItem>(
    columns: InternalColumns<Item>,
    items: InternalItems<Item>,
    initialFilterState: FilterState = {},
) {
    const [filterState, setFilterState] = useState<FilterState>(initialFilterState)

    return {
        columns: useMemo(
            () =>
                columns.map((column): InternalFilterableColumn<Item, Primitive> => {
                    if (column.dictionary === undefined) {
                        return {
                            ...column,
                            searchText: (filterState[column.id] as SearchState | undefined)?.searchText ?? null,
                            onSearchTextChange: (searchText) => {
                                setFilterState(
                                    (filterState): FilterState =>
                                        searchText === null || extractSearchableText(searchText) === ""
                                            ? drop(filterState, column.id)
                                            : {
                                                  ...filterState,
                                                  [column.id]: { searchText },
                                              },
                                )
                            },
                        }
                    } else {
                        return {
                            ...column,
                            hiddenValues:
                                (filterState[column.id] as SelectionState<Primitive> | undefined)?.hiddenValues ?? [],
                            onSelectionChange: (hiddenValues) => {
                                setFilterState(
                                    (filterState): FilterState =>
                                        hiddenValues.length === 0
                                            ? drop(filterState, column.id)
                                            : { ...filterState, [column.id]: { hiddenValues } },
                                )
                            },
                        }
                    }
                }),
            [columns, filterState],
        ),
        items: useMemo(
            () =>
                items.filter((items) =>
                    items.values.every((value) => {
                        if (value.loading) {
                            // Keep loading values.
                            return true
                        }

                        const columnFilterState: ColumnFilterState<Primitive> | null = filterState[value.column] ?? null
                        if (columnFilterState === null) {
                            // There is no filter on this column.
                            return true
                        }

                        return isSearchedState(columnFilterState)
                            ? matchSearch(value, columnFilterState)
                            : matchSelection(value, columnFilterState)
                    }),
                ),
            [items, filterState],
        ),
        clearFilterState: useCallback(() => {
            setFilterState({})
        }, []),
    }
}

function isSearchedState<Value extends Primitive>(state: ColumnFilterState<Value>): state is SearchState {
    return (state as any).searchText !== undefined
}

function matchSearch(value: LoadedInternalValue, filterState: SearchState): boolean {
    if (value.search === null) {
        // Filter out empty values.
        return false
    }

    return value.search.includes(filterState.searchText)
}

function matchSelection(value: LoadedInternalValue, filterState: SelectionState<Primitive>): boolean {
    if (value.raw === null) {
        // Filter out empty values.
        return false
    }

    return !filterState.hiddenValues.includes(value.raw)
}
