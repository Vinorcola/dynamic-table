import type { ReactNode } from "react"

interface Props {
    separator?: string // Default to ", "
    items: ReactNode[]
}

export default function ValueList(props: Props) {
    const separator = props.separator ?? ", "

    return props.items.reduce((nodes: ReactNode[], item) => {
        if (nodes.length > 0) {
            nodes.push(separator)
        }
        nodes.push(item)

        return nodes
    }, [])
}
