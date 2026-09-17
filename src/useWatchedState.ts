import type { Dispatch, SetStateAction } from "react"
import { useCallback, useEffect, useState } from "react"

import type { SpecificStateWatcher } from "./StateWatcher"

export default function useWatchedState<State>(
    defaultState: State,
    initial: State | undefined,
    watcher: SpecificStateWatcher<State> | undefined,
) {
    const [state, setState] = useState<State>(initial ?? defaultState)

    useEffect(() => {
        if (initial !== undefined) {
            return
        }

        watcher?.loadInitial?.().then((initialState) => {
            if (initialState === null) {
                return
            }

            setState(initialState)
        })
    }, []) // eslint-disable-line react-hooks-configurable/exhaustive-deps

    return [
        state,
        useCallback<Dispatch<SetStateAction<State>>>((updater) => {
            setState((state) => {
                const newState = typeof updater === "function" ? (updater as (state: State) => State)(state) : updater
                watcher?.onChange?.(newState)

                return newState
            })
        }, []), // eslint-disable-line react-hooks-configurable/exhaustive-deps
    ] as const
}
