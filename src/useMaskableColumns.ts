import { useMemo, useState } from "react"

import type { InternalColumn } from "./useColumns"
import type { InternalItems } from "./useItems"
import type { BaseItem, Primitive } from "."

/**
 * A complete columns mask state.
 */
export type ColumnsMaskState = string[]

/**
 * Mark a column as maskable.
 */
export type InternalMaskableColumn<Item extends BaseItem, Value extends Primitive> = InternalColumn<Item, Value> & {
    readonly displayed: boolean
    readonly onDisplayToggle: () => void
}

export function isMaskable<Item extends BaseItem, Value extends Primitive>(
    column: InternalColumn<Item, Value>,
): column is InternalMaskableColumn<Item, Value> {
    return (column as any).displayed !== undefined && (column as any).onDisplayToggle !== undefined
}

/**
 * Masks columns.
 *
 * This hook will add mask state & mask control on each given columns, returning decorated columns. It will also alter
 * the items list to remove masked columns' values.
 *
 * Note that the returned `columns` contains only the displayed columns, while `allColumns` contains all the columns
 * (for control purpose).
 */
export default function useMaskableColumns<Item extends BaseItem>(
    columns: InternalColumn<Item, Primitive>[],
    items: InternalItems<Item>,
    initialHiddenColumns: ColumnsMaskState = [],
) {
    const [hidden, setHidden] = useState<ColumnsMaskState>(initialHiddenColumns)

    const allColumns = useMemo(
        () =>
            columns.map((column): InternalMaskableColumn<Item, Primitive> => {
                const displayed = !hidden.includes(column.id)

                return {
                    ...column,
                    displayed,
                    onDisplayToggle: () => {
                        setHidden((hidden) =>
                            displayed ? [...hidden, column.id] : hidden.filter((id) => id !== column.id),
                        )
                    },
                }
            }),
        [columns, hidden],
    )

    return {
        allColumns,
        columns: useMemo(() => allColumns.filter((column) => column.displayed), [allColumns]),
        items: useMemo(
            () =>
                items.map((item) => ({
                    ...item,
                    values: item.values.filter(
                        (value) => allColumns.find((column) => column.id === value.column)!.displayed,
                    ),
                })),
            [items, allColumns],
        ),
    }
}
