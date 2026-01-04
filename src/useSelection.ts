import { useCallback, useMemo } from "react"

import type { BaseItem } from "./index.js"
import type { InternalItem, InternalItems } from "./useItems.js"

type ItemSelection<Item extends BaseItem> = Set<Item["id"]>
interface SelectableOptions<Item extends BaseItem> {
    selectedItems: ItemSelection<Item>
    onSelectionChange: (selected: ItemSelection<Item>) => void
    canSelectItem?: (item: Item) => boolean
}

interface NonSelectableOptions {
    selectedItems?: never
    onSelectionChange?: never
    canSelectItem?: never
}

export type SelectionOptions<Item extends BaseItem> = SelectableOptions<Item> | NonSelectableOptions

function inSelectionMode<Item extends BaseItem>(props: SelectionOptions<Item>): props is SelectableOptions<Item> {
    return (
        (props as SelectableOptions<Item>).selectedItems !== undefined &&
        (props as SelectableOptions<Item>).onSelectionChange !== undefined
    )
}

const EMPTY_SELECTION = new Set()
const DEFAULT_SELECTION_CHANGE_HANDLER = () => {}

export default function useSelection<Item extends BaseItem>(
    options: SelectionOptions<Item>,
    visibleItems: InternalItems<Item>,
) {
    const isInSelectionMode = inSelectionMode(options)
    const selectedItems = isInSelectionMode ? options.selectedItems : (EMPTY_SELECTION as ItemSelection<Item>)
    const onSelectionChange = options.onSelectionChange ?? DEFAULT_SELECTION_CHANGE_HANDLER
    const unvisibleSelectedQuantity = useMemo(
        () =>
            selectedItems.size > 0
                ? visibleItems.reduce(
                      (quantity, item) => quantity - (selectedItems.has(item.item.id) ? 1 : 0),
                      selectedItems.size,
                  )
                : 0,
        [visibleItems, selectedItems],
    )

    return {
        isInSelectionMode,
        totalSelectedQuantity: selectedItems.size,
        unvisibleSelectedQuantity,
        isItemSelected: useCallback(
            (item: InternalItem<Item>) => isInSelectionMode && options.selectedItems.has(item.item.id),
            [isInSelectionMode, options.selectedItems],
        ),
        onItemSelectionToggle: useCallback(
            (item: InternalItem<Item>) => () => {
                if (!isInSelectionMode || !item.isSelectable) {
                    return
                }
                const selection = new Set(selectedItems)
                if (selection.has(item.item.id)) {
                    selection.delete(item.item.id)
                } else {
                    selection.add(item.item.id)
                }

                onSelectionChange(selection)
            },
            [isInSelectionMode, selectedItems, onSelectionChange],
        ),
    }
}
