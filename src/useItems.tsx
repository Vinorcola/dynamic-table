import { displayInteger } from "@vinorcola/utils/number"
import { extractSearchableText } from "@vinorcola/utils/text"
import { useMemo, type Key, type ReactNode } from "react"

import type { InternalColumn, InternalColumns } from "./useColumns"
import type { SortableValue } from "./useSortState"
import type { BaseItem, Dictionary, Primitive } from "."

/**
 * A value that is loading (waiting for an async column dictionary to be available).
 */
export interface LoadingInternalValue {
    readonly column: string
    readonly loading: true
    readonly raw: Primitive | null
}
/**
 * A loaded value, ready for filter, sort and display.
 */
export interface LoadedInternalValue {
    readonly column: string
    readonly loading: false
    readonly raw: Primitive | null
    readonly search: string | null
    readonly sort: SortableValue
    readonly display: ReactNode
}
/**
 * A value, either in loading state ou in loaded state.
 */
export type InternalValue = LoadingInternalValue | LoadedInternalValue
/**
 * An internal item.
 */
export interface InternalItem<Item extends BaseItem> {
    readonly key: Key
    readonly item: Item
    readonly target: string | null
    readonly values: InternalValue[]
}
/**
 * A list of items.
 */
export type InternalItems<Item extends BaseItem> = readonly InternalItem<Item>[]

export default function useItems<Item extends BaseItem>(
    items: Item[],
    itemTarget: ((item: Item) => string) | undefined,
    columns: InternalColumns<Item>,
): InternalItems<Item> {
    return useMemo(
        () =>
            items.map(
                (item): InternalItem<Item> => ({
                    key: item.id,
                    item,
                    target: itemTarget === undefined ? null : itemTarget(item),
                    values: columns.map((column) => resolveInternalValue(item, column)),
                }),
            ),
        [items, itemTarget, columns],
    )
}

function resolveInternalValue<Item extends BaseItem>(
    item: Item,
    column: InternalColumn<Item, Primitive>,
): InternalValue {
    const raw = column.resolveValue(item)

    return column.loadingDictionary
        ? {
              column: column.id,
              loading: true,
              raw,
          }
        : {
              column: column.id,
              loading: false,
              raw,
              search: resolveSearchableValue(raw, column.dictionary),
              sort: resolveSortableValue(raw, column.dictionary),
              display: resolveDisplayableValue(raw, column.dictionary),
          }
}

function resolveSearchableValue<Value extends Primitive>(
    value: Value | null,
    dictionary: Dictionary<Value> | undefined,
): string | null {
    if (dictionary !== undefined) {
        // Columns with dictionary are selectable, not searchable.
        return null
    }
    if (value === null) {
        return null
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false"
    }
    if (value instanceof Date) {
        return value.toLocaleString()
    }
    if (typeof value === "number") {
        return `${value}`
    }

    return extractSearchableText(value)
}

function resolveSortableValue<Value extends Primitive>(
    value: Value | null,
    dictionary: Dictionary<Value> | undefined,
): number | string | null {
    if (value === null) {
        return null
    }
    if (dictionary) {
        return (dictionary.get(value)?.title ?? dictionary.unknownMessage).toLocaleLowerCase()
    }
    if (typeof value === "boolean") {
        return value ? 1 : 0
    }
    if (value instanceof Date) {
        return value.getTime()
    }
    if (typeof value === "number") {
        return value
    }

    return value.toLocaleLowerCase()
}

function resolveDisplayableValue<Value extends Primitive>(
    value: Value | null,
    dictionary: Dictionary<Value> | undefined,
): ReactNode {
    if (value === null) {
        return null
    }
    if (dictionary) {
        const dictionaryEntry = dictionary.get(value)
        if (dictionaryEntry === undefined) {
            return dictionary.unknownMessage
        }

        return dictionaryEntry.prepend !== undefined ? (
            <>
                {dictionaryEntry.prepend}
                {dictionaryEntry.title}
            </>
        ) : (
            dictionaryEntry.title
        )
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false"
    }
    if (value instanceof Date) {
        return value.toLocaleDateString()
    }
    if (typeof value === "number") {
        return displayInteger(value)
    }

    return value
}
