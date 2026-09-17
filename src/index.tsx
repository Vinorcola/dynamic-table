import { useMemo, type Key as ReactKey } from "react"

import type { ColumnDefinition } from "./ColumnDefinition.js"
import Controller from "./Controller.js"
import {
    BodyContainer,
    Button,
    Cell,
    ClickableCell,
    ColumnsPopup,
    ControllerContainer,
    FooterContainer,
    Header,
    HeaderActions,
    HeaderContainer,
    HeaderLine,
    HeaderStatus,
    ItemsPerPageSelector,
    Line,
    Loader,
    PageButton,
    PageSelector,
    Popup,
    SearchFilterPopup,
    SelectionCell,
    SelectionFilterPopup,
    SelectionHeader,
    Table,
    TableContainer,
} from "./DefaultTheme.js"
import generateLocalStorageWatcher from "./StateWatcher/LocalStorageWatcher.js"
import NoopWatcher from "./StateWatcher/NoopWatcher.js"
import type { StateWatcherInterface } from "./StateWatcher/index.js"
import UniquePopupProvider from "./UniquePopupProvider.js"
import useColumns from "./useColumns.js"
import useFilterState, { type FilterState } from "./useFilterState.js"
import useItems from "./useItems.js"
import type { ColumnsMaskState } from "./useMaskableColumns.js"
import useMaskableColumns from "./useMaskableColumns.js"
import usePagination, { type PaginationState } from "./usePagination.js"
import useSelection, { type SelectionOptions } from "./useSelection.js"
import useSortState, { type SortState } from "./useSortState.js"

export type Primitive = boolean | Date | number | string
export type BaseItem = Record<string, any> & { readonly id: ReactKey }
export type ItemKey<Item extends BaseItem> = Extract<keyof Item, string>
export type { ColumnDefinition, ValueResolver } from "./ColumnDefinition.js"
export { default as Dictionary, DictionaryEntry } from "./Dictionary.js"
export type { StateWatcherInterface } from "./StateWatcher/index.js"
export { default as LocalStorageWatcher } from "./StateWatcher/LocalStorageWatcher.js"
export type { FilterState } from "./useFilterState.js"
export type { SortDirection, SortState } from "./useSortState.js"
export type { ColumnsMaskState } from "./useMaskableColumns.js"
export type { PaginationState } from "./usePagination.js"

interface BaseProps<Item extends BaseItem> {
    namespace?: string // If provided, will be used by the LocalStorage watcher (unless you provider a specific watcher).
    items: Item[]
    columns: ColumnDefinition<Item, Primitive>[]
    itemTarget?: (item: Item) => string
    initialFilterState?: FilterState
    initialSortState?: SortState
    initialColumnsMaskState?: ColumnsMaskState
    initialPaginationState?: PaginationState
    watcher?: StateWatcherInterface
}

type Props<Item extends BaseItem> = BaseProps<Item> & SelectionOptions<Item>

export default function DynamicTable<Item extends BaseItem>(props: Props<Item>) {
    const columns = useColumns(props.columns)
    const items = useItems(props.items, props.itemTarget, columns, props.canSelectItem)

    const watcher = useMemo(
        () =>
            props.watcher ??
            (props.namespace === undefined ? NoopWatcher : generateLocalStorageWatcher(props.namespace)),
        [props.namespace, props.watcher],
    )

    const {
        columns: filteredColumns,
        items: filteredItems,
        clearFilterState,
    } = useFilterState(columns, items, props.initialFilterState, watcher.filterState)
    const {
        columns: sortedColumns,
        items: sortedItems,
        clearSortState,
    } = useSortState(filteredColumns, filteredItems, props.initialSortState, watcher.sortState)
    const {
        allColumns,
        columns: displayedColumns,
        items: displayedItems,
    } = useMaskableColumns(sortedColumns, sortedItems, props.initialColumnsMaskState, watcher.columnsMaskState)

    const {
        items: paginatedItems,
        itemsPerPage,
        onItemsPerPageChange,
        totalPages,
        currentPage,
        onCurrentPageChange,
    } = usePagination(displayedItems, props.initialPaginationState, watcher.paginationState)

    const {
        isInSelectionMode,
        totalSelectedQuantity,
        unvisibleSelectedQuantity,
        isItemSelected,
        onItemSelectionToggle,
    } = useSelection(props, paginatedItems)

    return (
        <UniquePopupProvider>
            <DynamicTable.TableContainer>
                <Controller columns={allColumns} clearFilterState={clearFilterState} clearSortState={clearSortState} />
                <DynamicTable.Table>
                    <DynamicTable.HeaderContainer>
                        <DynamicTable.HeaderLine>
                            {isInSelectionMode && (
                                <DynamicTable.SelectionHeader
                                    totalSelected={totalSelectedQuantity}
                                    unvisibleSelected={unvisibleSelectedQuantity}
                                />
                            )}
                            {displayedColumns.map((column) => (
                                <DynamicTable.Header key={column.id} column={column}>
                                    {column.title}
                                </DynamicTable.Header>
                            ))}
                        </DynamicTable.HeaderLine>
                    </DynamicTable.HeaderContainer>
                    <DynamicTable.BodyContainer>
                        {paginatedItems.map((item) => (
                            <DynamicTable.Line key={item.key}>
                                {isInSelectionMode &&
                                    (item.isSelectable ? (
                                        <DynamicTable.SelectionCell
                                            selected={isItemSelected(item)}
                                            onToggle={onItemSelectionToggle(item)}
                                        />
                                    ) : (
                                        <DynamicTable.Cell />
                                    ))}
                                {item.target !== null
                                    ? item.values.map((value) => (
                                          <DynamicTable.ClickableCell key={value.column} target={item.target as string}>
                                              {value.loading ? <DynamicTable.Loader /> : value.display}
                                          </DynamicTable.ClickableCell>
                                      ))
                                    : item.values.map((value) => (
                                          <DynamicTable.Cell key={value.column}>
                                              {value.loading ? <DynamicTable.Loader /> : value.display}
                                          </DynamicTable.Cell>
                                      ))}
                            </DynamicTable.Line>
                        ))}
                    </DynamicTable.BodyContainer>
                    <DynamicTable.FooterContainer
                        totalColums={displayedColumns.length}
                        pageSelector={
                            <DynamicTable.PageSelector
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onCurrentPageChange={onCurrentPageChange}
                            />
                        }
                        itemsPerPageSelector={
                            <DynamicTable.ItemsPerPageSelector
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={onItemsPerPageChange}
                            />
                        }
                    />
                </DynamicTable.Table>
            </DynamicTable.TableContainer>
        </UniquePopupProvider>
    )
}

DynamicTable.TableContainer = TableContainer
DynamicTable.ControllerContainer = ControllerContainer
DynamicTable.ColumnsPopup = ColumnsPopup
DynamicTable.Table = Table
DynamicTable.HeaderContainer = HeaderContainer
DynamicTable.HeaderLine = HeaderLine
DynamicTable.SelectionHeader = SelectionHeader
DynamicTable.Header = Header
DynamicTable.HeaderActions = HeaderActions
DynamicTable.HeaderStatus = HeaderStatus
DynamicTable.SearchFilterPopup = SearchFilterPopup
DynamicTable.SelectionFilterPopup = SelectionFilterPopup
DynamicTable.BodyContainer = BodyContainer
DynamicTable.Line = Line
DynamicTable.SelectionCell = SelectionCell
DynamicTable.Cell = Cell
DynamicTable.ClickableCell = ClickableCell
DynamicTable.FooterContainer = FooterContainer
DynamicTable.ItemsPerPageSelector = ItemsPerPageSelector
DynamicTable.PageSelector = PageSelector
DynamicTable.PageButton = PageButton
DynamicTable.Button = Button
DynamicTable.Popup = Popup
DynamicTable.Loader = Loader
