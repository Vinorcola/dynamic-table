import { replaceElement } from "@vinorcola/utils/list"
import { useEffect, useRef, useState } from "react"

import { isAccessorColumnDefinition } from "./ColumnDefinition.js"
import type { BaseItem, ColumnDefinition, Dictionary, Primitive, ValueResolver } from "./index.js"

/**
 * A column that is loading a dictionary.
 */
export interface LoadingInternalColumn<Item extends BaseItem, Value extends Primitive> {
    readonly id: string
    readonly title: string
    readonly loadingDictionary: true
    readonly dictionary: Promise<Dictionary<Value>>
    readonly resolveValue: ValueResolver<Item, Value>
}
/**
 * A column fully loaded and usable.
 */
export interface LoadedInternalColumn<Item extends BaseItem, Value extends Primitive> {
    readonly id: string
    readonly title: string
    readonly loadingDictionary: false
    readonly dictionary?: Dictionary<Value>
    readonly resolveValue: ValueResolver<Item, Value>
}
/**
 * A column, either in loading state or in loaded state.
 */
export type InternalColumn<Item extends BaseItem, Value extends Primitive> =
    | LoadingInternalColumn<Item, Value>
    | LoadedInternalColumn<Item, Value>
/**
 * A list of columns.
 */
export type InternalColumns<Item extends BaseItem> = readonly InternalColumn<Item, Primitive>[]

/**
 * Transform a list of column definitions into a list of internal columns.
 *
 * Handles the optional loading state of some columns that may be an async dictionary and update the list of internal
 * columns when each dictionary is resolved.
 */
export default function useColumns<Item extends BaseItem>(
    definitions: ColumnDefinition<Item, Primitive>[],
): InternalColumn<Item, Primitive>[] {
    // This is used for canceling promises (resolved promises' callback won't be executed if the version changed).
    const definitionVersion = useRef(0)
    const [columns, setColumns] = useState<InternalColumn<Item, Primitive>[]>(() =>
        resolveInitialColumnState(definitions),
    )

    useEffect(() => {
        definitionVersion.current++
        const currentVersion = definitionVersion.current
        setColumns(resolveInitialColumnState(definitions))

        definitions.forEach((definition, index) => {
            if (definition.dictionary instanceof Promise) {
                // Once dictionary is loaded (and the columns definitions hasn't changed), update the internal column's
                // data.
                definition.dictionary.then((dictionary) => {
                    if (definitionVersion.current === currentVersion) {
                        setColumns((columns) =>
                            replaceElement(columns, index, {
                                id: definition.id,
                                title: definition.title,
                                loadingDictionary: false,
                                dictionary,
                                resolveValue: isAccessorColumnDefinition(definition)
                                    ? (item: Item) => item[definition.id]
                                    : definition.resolveValue,
                            }),
                        )
                    }
                })
            }
        })
    }, [definitions])

    return columns
}

function resolveInitialColumnState<Item extends BaseItem>(definitions: ColumnDefinition<Item, Primitive>[]) {
    return definitions.map(
        (definition): InternalColumn<Item, Primitive> =>
            definition.dictionary instanceof Promise
                ? {
                      id: definition.id,
                      title: definition.title,
                      loadingDictionary: true,
                      dictionary: definition.dictionary,
                      resolveValue: isAccessorColumnDefinition(definition)
                          ? (item: Item) => item[definition.id]
                          : definition.resolveValue,
                  }
                : {
                      id: definition.id,
                      title: definition.title,
                      loadingDictionary: false,
                      dictionary: definition.dictionary,
                      resolveValue: isAccessorColumnDefinition(definition)
                          ? (item: Item) => item[definition.id]
                          : definition.resolveValue,
                  },
    )
}
