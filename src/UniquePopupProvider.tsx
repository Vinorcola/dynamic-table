import {
    createContext,
    createRef,
    useCallback,
    useContext,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from "react"

type Callback = () => void

/**
 * A context for saving the currently opened popup's dismiss function.
 */
const PopupContext = createContext<RefObject<Callback | null>>(createRef())

type PopupState =
    | {
          display: true
          show: Callback
          dismiss: Callback
      }
    | {
          display: false
          show: Callback
          dismiss: null
      }

/**
 * A hook that eases popup display.
 *
 * It provides a display boolean and show & dismiss functions. It unsures that only one popup is displayed at a time.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function usePopup(): PopupState {
    const dismiss = useContext(PopupContext)
    const [display, setDisplay] = useState(false)

    return {
        display,
        show: useCallback(() => {
            if (dismiss.current !== null) {
                dismiss.current()
            }

            dismiss.current = () => {
                setDisplay(false)
                dismiss.current = null
            }
            setDisplay(true)
        }, [dismiss]),
        dismiss: dismiss.current,
    } as PopupState
}

interface Props {
    children?: ReactNode
}

export default function UniquePopupProvider(props: Props) {
    return <PopupContext value={useRef(null)}>{props.children}</PopupContext>
}
