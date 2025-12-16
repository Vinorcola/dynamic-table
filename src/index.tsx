import type { Key as ReactKey } from "react"

import type { ColumnDefinition } from "./ColumnDefinition.js"
import {
    BodyContainer,
    Button,
    Cell,
    ClickableCell,
    ColumnsPopup,
    Controller,
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
    SelectionFilterPopup,
    Table,
    TableContainer,
} from "./DefaultTheme.js"
import UniquePopupProvider from "./UniquePopupProvider.js"
import useColumns from "./useColumns.js"
import useFilterState, { type FilterState } from "./useFilterState.js"
import useItems from "./useItems.js"
import type { ColumnsMaskState } from "./useMaskableColumns.js"
import useMaskableColumns from "./useMaskableColumns.js"
import usePagination, { type PaginationState } from "./usePagination.js"
import useSortState, { type SortState } from "./useSortState.js"

export type Primitive = boolean | Date | number | string
export type BaseItem = Record<string, any> & { readonly id: ReactKey }
export type ItemKey<Item extends BaseItem> = Extract<keyof Item, string>
export type { ColumnDefinition, ValueResolver } from "./ColumnDefinition"
export { default as Dictionary } from "./Dictionary"
export type { FilterState } from "./useFilterState"
export type { SortDirection, SortState } from "./useSortState"
export type { ColumnsMaskState } from "./useMaskableColumns"
export type { PaginationState } from "./usePagination"

interface Props<Item extends BaseItem> {
    items: Item[]
    columns: ColumnDefinition<Item, Primitive>[]
    itemTarget?: (item: Item) => string
    initialFilterState?: FilterState
    initialSortState?: SortState
    initialColumnsMaskState?: ColumnsMaskState
    initialPaginationState?: PaginationState
}

export default function DynamicTable<Item extends BaseItem>(props: Props<Item>) {
    const columns = useColumns(props.columns)
    const items = useItems(props.items, props.itemTarget, columns)

    const {
        columns: filteredColumns,
        items: filteredItems,
        clearFilterState,
    } = useFilterState(columns, items, props.initialFilterState)
    const {
        columns: sortedColumns,
        items: sortedItems,
        clearSortState,
    } = useSortState(filteredColumns, filteredItems, props.initialSortState)
    const {
        allColumns,
        columns: displayedColumns,
        items: displayedItems,
    } = useMaskableColumns(sortedColumns, sortedItems, props.initialColumnsMaskState)

    const {
        items: paginatedItems,
        itemsPerPage,
        onItemsPerPageChange,
        totalPages,
        currentPage,
        onCurrentPageChange,
    } = usePagination(displayedItems, props.initialPaginationState)

    return (
        <UniquePopupProvider>
            <DynamicTable.TableContainer>
                <DynamicTable.Controller
                    columns={allColumns}
                    clearFilterState={clearFilterState}
                    clearSortState={clearSortState}
                />
                <DynamicTable.Table>
                    <DynamicTable.HeaderContainer>
                        <DynamicTable.HeaderLine>
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
DynamicTable.Controller = Controller
DynamicTable.ColumnsPopup = ColumnsPopup
DynamicTable.Table = Table
DynamicTable.HeaderContainer = HeaderContainer
DynamicTable.HeaderLine = HeaderLine
DynamicTable.Header = Header
DynamicTable.HeaderActions = HeaderActions
DynamicTable.HeaderStatus = HeaderStatus
DynamicTable.SearchFilterPopup = SearchFilterPopup
DynamicTable.SelectionFilterPopup = SelectionFilterPopup
DynamicTable.BodyContainer = BodyContainer
DynamicTable.Line = Line
DynamicTable.Cell = Cell
DynamicTable.ClickableCell = ClickableCell
DynamicTable.FooterContainer = FooterContainer
DynamicTable.ItemsPerPageSelector = ItemsPerPageSelector
DynamicTable.PageSelector = PageSelector
DynamicTable.PageButton = PageButton
DynamicTable.Button = Button
DynamicTable.Popup = Popup
DynamicTable.Loader = Loader
