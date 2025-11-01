import type { BaseItem, Dictionary, ItemKey, Primitive } from "."

export type ValueResolver<Item extends BaseItem, Value extends Primitive> = (item: Item) => Value | null

interface BaseColumneDefinition<Value extends Primitive> {
    readonly title: string
    readonly dictionary?: Dictionary<Value> | Promise<Dictionary<Value>>
}

/**
 * A column that will access an item's attribute.
 */
interface AccessorColumnDefinition<Item extends BaseItem, Value extends Primitive>
    extends BaseColumneDefinition<Value> {
    readonly id: ItemKey<Item>
}

/**
 * A column where the value must be resolved.
 */
interface ResolvedColumnDefinition<Item extends BaseItem, Value extends Primitive>
    extends BaseColumneDefinition<Value> {
    readonly id: string
    readonly resolveValue: (item: Item) => Value | null
}

export type ColumnDefinition<Item extends BaseItem, Value extends Primitive> =
    | AccessorColumnDefinition<Item, Value>
    | ResolvedColumnDefinition<Item, Value>

export function isAccessorColumnDefinition<Item extends BaseItem, Value extends Primitive>(
    definition: ColumnDefinition<Item, Value>,
): definition is AccessorColumnDefinition<Item, Value> {
    return (definition as any).resolveValue === undefined
}
