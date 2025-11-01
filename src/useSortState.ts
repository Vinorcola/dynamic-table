import { dropElement, replaceElement } from "@vinorcola/utils/list"
import { useCallback, useMemo, useState } from "react"

import type { InternalColumn, InternalColumns } from "./useColumns"
import type { InternalItems, InternalItem } from "./useItems"
import type { BaseItem, Primitive } from "."

/**
 * A sort direction.
 */
export type SortDirection = "asc" | "desc"
/**
 * A sortable value.
 */
export type SortableValue = string | number | null
/**
 * A complete sort state.
 */
export type SortState = { columnId: string; direction: SortDirection }[]

/**
 * Mark a column as sortable.
 */
export type InternalSortableColumn<Item extends BaseItem, Value extends Primitive> = InternalColumn<Item, Value> & {
    readonly sorted: {
        readonly order: number
        readonly totalSortedColumns: number
        readonly direction: SortDirection
    } | null
    readonly onSortToggle: () => void
}

export function isSortable<Item extends BaseItem, Value extends Primitive>(
    column: InternalColumn<Item, Value>,
): column is InternalSortableColumn<Item, Value> {
    return (column as any).sorted !== undefined && (column as any).onSortToggle !== undefined
}

/**
 * Sorts items.
 *
 * This hook will add sort state & sort control on each given columns, returning decorated columns. It will also apply
 * those sorts on the items list, returning a sorted list.
 */
export default function useSortState<Item extends BaseItem>(
    columns: InternalColumns<Item>,
    items: InternalItems<Item>,
    initialSortState: SortState = [],
) {
    const [sortState, setSortState] = useState<SortState>(initialSortState)

    return {
        columns: useMemo(
            () =>
                columns.map((column): InternalSortableColumn<Item, Primitive> => {
                    const columnSortStateIndex = sortState.findIndex(
                        (columnSortState) => columnSortState.columnId === column.id,
                    )

                    return columnSortStateIndex === -1
                        ? {
                              ...column,
                              sorted: null,
                              onSortToggle: () => {
                                  setSortState([...sortState, { columnId: column.id, direction: "asc" }])
                              },
                          }
                        : {
                              ...column,
                              sorted: {
                                  order: columnSortStateIndex + 1,
                                  totalSortedColumns: sortState.length,
                                  direction: sortState[columnSortStateIndex].direction,
                              },
                              onSortToggle: () => {
                                  setSortState(
                                      sortState[columnSortStateIndex].direction === "asc"
                                          ? replaceElement(sortState, columnSortStateIndex, {
                                                columnId: column.id,
                                                direction: "desc",
                                            })
                                          : dropElement(sortState, columnSortStateIndex),
                                  )
                              },
                          }
                }),
            [columns, sortState],
        ),
        items: useMemo(
            () =>
                [...items].sort((a, b) => {
                    for (const columnSortState of sortState) {
                        const aValue = extractSortValue(a, columnSortState.columnId)
                        const bValue = extractSortValue(b, columnSortState.columnId)
                        if (aValue === bValue) {
                            // If a & b are equal, continue the loop to sort according to the next column.
                            continue
                        }

                        // Always display null values (or loading values) last, no mater the sort order.
                        if (aValue === null) {
                            return 1
                        }
                        if (bValue === null) {
                            return -1
                        }

                        if (typeof aValue === "string") {
                            return (
                                (columnSortState.direction === "asc" ? 1 : -1) * aValue.localeCompare(bValue as string)
                            )
                        }

                        return columnSortState.direction === "asc"
                            ? aValue - (bValue as number)
                            : (bValue as number) - aValue
                    }

                    // Lines are equals.
                    return 0
                }),
            [items, sortState],
        ),
        clearSortState: useCallback(() => {
            setSortState([])
        }, []),
    }
}

function extractSortValue<Item extends BaseItem>(line: InternalItem<Item>, column: string): SortableValue {
    const value = line.values.find((value) => value.column === column) ?? null

    return value === null ? null : value.loading ? null : value.sort
}
