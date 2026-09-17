import { displayInteger } from "@vinorcola/utils/number"
import { extractSearchableText } from "@vinorcola/utils/text"
import { useMemo, type Key, type ReactNode } from "react"

import ValueList from "./ValueList.js"
import type { BaseItem, Dictionary, Primitive } from "./index.js"
import type { InternalColumn, InternalColumns } from "./useColumns.js"
import type { SortableValue } from "./useSortState.js"

/**
 * A value that is loading (waiting for an async column dictionary to be available).
 */
export interface LoadingInternalValue<Value extends Primitive | Primitive[] = Primitive | Primitive[]> {
    readonly column: string
    readonly loading: true
    readonly raw: Value | null
}
/**
 * A loaded value, ready for filter, sort and display.
 */
export interface LoadedInternalValue<Value extends Primitive | Primitive[] = Primitive | Primitive[]> {
    readonly column: string
    readonly loading: false
    readonly raw: Value | null
    readonly search: string | null
    readonly sort: SortableValue
    readonly display: ReactNode
}
/**
 * A value, either in loading state ou in loaded state.
 */
export type InternalValue<Value extends Primitive | Primitive[] = Primitive | Primitive[]> =
    LoadingInternalValue<Value> | LoadedInternalValue<Value>
/**
 * An internal item.
 */
export interface InternalItem<Item extends BaseItem> {
    readonly key: Key
    readonly item: Item
    readonly isSelectable: boolean
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
    canSelectItem?: (item: Item) => boolean,
): InternalItems<Item> {
    return useMemo(
        () =>
            items.map((item): InternalItem<Item> => ({
                key: item.id,
                item,
                isSelectable: canSelectItem === undefined ? true : canSelectItem(item),
                target: itemTarget === undefined ? null : itemTarget(item),
                values: columns.map((column) => resolveInternalValue(item, column)),
            })),
        [items, itemTarget, columns, canSelectItem],
    )
}

function resolveInternalValue<Item extends BaseItem>(
    item: Item,
    column: InternalColumn<Item, Primitive>,
): InternalValue {
    const value = column.resolveValue(item)
    if (column.loadingDictionary) {
        return {
            column: column.id,
            loading: true,
            raw: value,
        }
    }

    let display: ReactNode
    if (value === null || value === undefined || value === "") {
        if (column.decorateNoValue !== undefined) {
            display = column.decorateNoValue()
        } else {
            display = null
        }
    } else if (column.decorateValue !== undefined) {
        display = column.decorateValue(value, display, item)
    } else {
        display = resolveDisplayableValue(value, column.dictionary)
    }

    return {
        column: column.id,
        loading: false,
        raw: value,
        search: resolveSearchableValue(value, column.dictionary),
        sort: resolveSortableValue(value, column.dictionary),
        display,
    }
}

const ARBITRARY_SEARCH_SEPARATOR = "#|!$#" // To avoid searching text across several values, we separate each value by
//                                         // this arbitrary (unlikely searched by users) text.
function resolveSearchableValue<Value extends Primitive>(
    value: Value | Value[] | null,
    dictionary: Dictionary<Value> | undefined,
): string | null {
    return Array.isArray(value)
        ? value.map((value) => resolveSearchableSingleValue(value, dictionary)).join(ARBITRARY_SEARCH_SEPARATOR)
        : resolveSearchableSingleValue(value, dictionary)
}

function resolveSearchableSingleValue<Value extends Primitive>(
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
    value: Value | Value[] | null,
    dictionary: Dictionary<Value> | undefined,
): number | string | null {
    return Array.isArray(value)
        ? value.length === 0
            ? null
            : resolveSortableSingleValue(value[0], dictionary) // Sort using first value (until we find a better way!)
        : resolveSortableSingleValue(value, dictionary)
}

function resolveSortableSingleValue<Value extends Primitive>(
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
    value: Value | Value[],
    dictionary: Dictionary<Value> | undefined,
): ReactNode {
    return Array.isArray(value) ? (
        <ValueList items={value.map((value, index) => resolveDisplayableSingleValue(value, dictionary, index))} />
    ) : (
        resolveDisplayableSingleValue(value, dictionary)
    )
}

function resolveDisplayableSingleValue<Value extends Primitive>(
    value: Value,
    dictionary: Dictionary<Value> | undefined,
    nodeKey?: Key,
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
            <dictionary.valueWrapper key={nodeKey}>
                {dictionaryEntry.prepend}
                {dictionaryEntry.title}
            </dictionary.valueWrapper>
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
