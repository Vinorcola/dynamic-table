import type { ReactNode } from "react"

import type { Primitive } from "./index.ts"

export interface DictionaryEntry {
    title: string
    prepend?: ReactNode
}

export default class Dictionary<Value extends Primitive> extends Map<Value, DictionaryEntry> {
    public readonly unknownMessage: string

    constructor(unknownMessage: string, entries?: readonly (readonly [Value, DictionaryEntry])[] | null) {
        super(entries)
        this.unknownMessage = unknownMessage
    }
}
