import { useCallback, useMemo } from "react"

import type { BaseItem } from "./index.js"
import type { InternalItem, InternalItems } from "./useItems.js"

type ItemSelection<Item extends BaseItem> = Set<Item["id"]>
interface SelectableOptions<Item extends BaseItem> {
    selectedItems: ItemSelection<Item>
    onSelectionChange: (selected: ItemSelection<Item>) => void
}

interface NonSelectableOptions {
    selectedItems: never
    onSelectionChange: never
}

export type SelectionOptions<Item extends BaseItem> = SelectableOptions<Item> | NonSelectableOptions

function inSelectionMode<Item extends BaseItem>(props: SelectableOptions<Item>): props is SelectableOptions<Item> {
    return (
        (props as SelectableOptions<Item>).selectedItems !== undefined &&
        (props as SelectableOptions<Item>).onSelectionChange !== undefined
    )
}

export default function useSelection<Item extends BaseItem>(
    options: SelectionOptions<Item>,
    visibleItems: InternalItems<Item>,
) {
    const isInSelectionMode = inSelectionMode(options)
    const visibleSelected = useMemo(
        () =>
            isInSelectionMode
                ? visibleItems.reduce(
                      (quantity, item) => quantity - (options.selectedItems.has(item.item.id) ? 1 : 0),
                      0,
                  )
                : 0,
        [isInSelectionMode, visibleItems, options.selectedItems],
    )

    return {
        isInSelectionMode,
        totalSelectedQuantity: options.selectedItems.size,
        unvisibleSelectedQuantity: options.selectedItems.size - visibleSelected,
        isItemSelected: useCallback(
            (item: InternalItem<Item>) => isInSelectionMode && options.selectedItems.has(item.item.id),
            [isInSelectionMode, options.selectedItems],
        ),
        onItemSelectionToggle: useCallback(
            (item: InternalItem<Item>) => () => {
                if (!isInSelectionMode) {
                    return
                }
                const selection = new Set(options.selectedItems)
                if (selection.has(item.item.id)) {
                    selection.delete(item.item.id)
                } else {
                    selection.add(item.item.id)
                }

                options.onSelectionChange(selection)
            },
            [isInSelectionMode, options],
        ),
    }
}
