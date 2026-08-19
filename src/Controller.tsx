import cx from "@vinorcola/utils/classNames"

import { CloseIcon, ColumnsIcon, FilterIcon, SortIcon } from "./Icon.js"
import { usePopup } from "./UniquePopupProvider.js"
import type { BaseItem } from "./index.js"
import DynamicTable from "./index.js"
import type { InternalColumns } from "./useColumns.js"
import { isSearchable, isSelectable } from "./useFilterState.js"
import { isMaskable } from "./useMaskableColumns.js"
import { isSortable } from "./useSortState.js"

interface Props<Item extends BaseItem> {
    columns: InternalColumns<Item>
    clearFilterState: () => void
    clearSortState: () => void
}

export default function Controller<Item extends BaseItem>(props: Props<Item>) {
    const columnListPopup = usePopup()
    const hasHiddenColumns = props.columns.some((column) => isMaskable(column) && !column.displayed)
    const hasFilteredColumns = props.columns.some(
        (column) =>
            (isSearchable(column) && column.searchText !== null) ||
            (isSelectable(column) && column.hiddenValues.length > 0),
    )
    const hasHiddenFilteredColumns =
        hasHiddenColumns &&
        hasFilteredColumns &&
        props.columns.some(
            (column) =>
                isMaskable(column) &&
                !column.displayed &&
                ((isSearchable(column) && column.searchText !== null) ||
                    (isSelectable(column) && column.hiddenValues.length > 0)),
        )
    const hasSortedColumns = props.columns.some((column) => isSortable(column) && column.sorted !== null)
    const hasHiddenSortedColumns =
        hasHiddenColumns &&
        hasSortedColumns &&
        props.columns.some(
            (column) => isMaskable(column) && !column.displayed && isSortable(column) && column.sorted !== null,
        )

    return (
        <DynamicTable.ControllerContainer
            filterButton={
                <DynamicTable.Button
                    className={cx(
                        hasHiddenFilteredColumns
                            ? "[--bg-color:var(--color-orange-400)]"
                            : hasFilteredColumns && "[--bg-color:var(--color-lime-400)]",
                    )}
                    disabled={!hasFilteredColumns}
                    hoverChildren={<CloseIcon />}
                    onClick={props.clearFilterState}
                >
                    <FilterIcon />
                </DynamicTable.Button>
            }
            sortButton={
                <DynamicTable.Button
                    className={cx(
                        hasHiddenSortedColumns
                            ? "[--bg-color:var(--color-orange-400)]"
                            : hasSortedColumns && "[--bg-color:var(--color-sky-400)]",
                    )}
                    disabled={!hasSortedColumns}
                    hoverChildren={<CloseIcon />}
                    onClick={props.clearSortState}
                >
                    <SortIcon />
                </DynamicTable.Button>
            }
            columnButton={
                <DynamicTable.Button
                    className={cx(
                        hasHiddenColumns ? "[--bg-color:var(--color-orange-400)]" : "[--bg-default-color:transparent]",
                    )}
                    onClick={columnListPopup.show}
                >
                    <ColumnsIcon />
                </DynamicTable.Button>
            }
            columnPopup={
                columnListPopup.display ? (
                    <DynamicTable.ColumnsPopup columns={props.columns} onDismiss={columnListPopup.dismiss} />
                ) : undefined
            }
        />
    )
}
