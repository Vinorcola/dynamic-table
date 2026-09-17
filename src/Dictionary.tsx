import type { FC, ReactNode } from "react"

import type { Primitive } from "./index.js"

export interface DictionaryEntry {
    title: string
    prepend?: ReactNode
}

export type DictinaryValueWrapper = FC<{ children: ReactNode }>

export default class Dictionary<Value extends Primitive> extends Map<Value, DictionaryEntry> {
    public readonly unknownMessage: string
    public readonly valueWrapper: DictinaryValueWrapper

    constructor(
        unknownMessage: string,
        entries?: readonly (readonly [Value, DictionaryEntry])[] | null,
        valueWrapper?: DictinaryValueWrapper,
    ) {
        super(entries)
        this.unknownMessage = unknownMessage
        this.valueWrapper = valueWrapper ?? ((props) => props.children)
    }
}
