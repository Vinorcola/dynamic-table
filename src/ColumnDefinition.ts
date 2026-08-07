import type { ReactNode } from "react"

import type { BaseItem, Dictionary, ItemKey, Primitive } from "./index.js"

export type ValueDecorator<Item extends BaseItem, Value extends Primitive> = (
    value: Value,
    defaultDisplay: ReactNode,
    item: Item,
) => ReactNode
export type ValueResolver<Item extends BaseItem, Value extends Primitive> = (item: Item) => Value | null

interface BaseColumneDefinition<Item extends BaseItem, Value extends Primitive> {
    readonly title: string
    readonly dictionary?: Dictionary<Value> | Promise<Dictionary<Value>>
    readonly decorateValue?: ValueDecorator<Item, Value>
    readonly decorateNoValue?: () => ReactNode
}

/**
 * A column that will access an item's attribute.
 */
interface AccessorColumnDefinition<Item extends BaseItem, Value extends Primitive>
    extends BaseColumneDefinition<Item, Value> {
    readonly id: ItemKey<Item>
}

/**
 * A column where the value must be resolved.
 */
interface ResolvedColumnDefinition<Item extends BaseItem, Value extends Primitive>
    extends BaseColumneDefinition<Item, Value> {
    readonly id: string
    readonly resolveValue: ValueResolver<Item, Value>
}

export type ColumnDefinition<Item extends BaseItem, Value extends Primitive> =
    | AccessorColumnDefinition<Item, Value>
    | ResolvedColumnDefinition<Item, Value>

export function isAccessorColumnDefinition<Item extends BaseItem, Value extends Primitive>(
    definition: ColumnDefinition<Item, Value>,
): definition is AccessorColumnDefinition<Item, Value> {
    return (definition as any).resolveValue === undefined
}
