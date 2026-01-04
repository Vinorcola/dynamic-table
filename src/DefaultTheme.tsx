import cx from "@vinorcola/utils/classNames"
import { useEffect, useMemo, type ReactNode } from "react"

import {
    AscSortIcon,
    CheckedIcon,
    CloseIcon,
    ColumnsIcon,
    DescSortIcon,
    FilterIcon,
    HideIcon,
    NextIcon,
    PreviousIcon,
    SearchIcon,
    SortIcon,
    UncheckedIcon,
} from "./Icon.js"
import { usePopup } from "./UniquePopupProvider.js"
import type { BaseItem, Dictionary, Primitive } from "./index.js"
import DynamicTable from "./index.js"
import type { InternalColumn, InternalColumns } from "./useColumns.js"
import { isSearchable, isSelectable, type FilterType } from "./useFilterState.js"
import { isMaskable } from "./useMaskableColumns.js"
import { isSortable, type InternalSortableColumn } from "./useSortState.js"

export interface Props {
    children?: ReactNode
}

export function TableContainer(props: Props) {
    return <div>{props.children}</div>
}

export interface ControllerProps<Item extends BaseItem> {
    columns: InternalColumns<Item>
    clearFilterState: () => void
    clearSortState: () => void
}

export function Controller<Item extends BaseItem>(props: ControllerProps<Item>) {
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
        <div className="relative">
            <ul className="flex justify-end">
                <li>
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
                </li>
                <li>
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
                </li>
                <li>
                    <DynamicTable.Button
                        className={cx(
                            hasHiddenColumns
                                ? "[--bg-color:var(--color-orange-400)]"
                                : "[--bg-default-color:transparent]",
                        )}
                        onClick={columnListPopup.show}
                    >
                        <ColumnsIcon />
                    </DynamicTable.Button>
                </li>
            </ul>

            {columnListPopup.display && (
                <DynamicTable.ColumnsPopup columns={props.columns} onDismiss={columnListPopup.dismiss} />
            )}
        </div>
    )
}

export interface ColumnsPopupProps<Item extends BaseItem> {
    columns: InternalColumns<Item>
    onDismiss: () => void
}

export function ColumnsPopup<Item extends BaseItem>(props: ColumnsPopupProps<Item>) {
    return (
        <DynamicTable.Popup className="right-2" onDismiss={props.onDismiss}>
            <main>
                <ul className="min-w-40">
                    {props.columns.map((column) => {
                        const maskable = isMaskable(column)
                        const displayed = !maskable || column.displayed
                        const sorted = isSortable(column) && column.sorted !== null
                        const searched = isSearchable(column) && column.searchText !== null
                        const selected = isSelectable(column) && column.hiddenValues.length > 0

                        return (
                            <li
                                key={column.id}
                                className={cx(
                                    "flex items-center gap-1 pl-2 pr-6 py-0.5",
                                    maskable && "cursor-pointer",
                                    searched || selected
                                        ? displayed
                                            ? "bg-lime-200 hover:bg-lime-300"
                                            : "bg-orange-200 hover:bg-orange-300"
                                        : sorted
                                          ? displayed
                                              ? "bg-sky-200 hover:bg-sky-300"
                                              : "bg-orange-200 hover:bg-orange-300"
                                          : "hover:bg-stone-500/40",
                                )}
                                onClick={maskable ? () => column.onDisplayToggle() : undefined}
                            >
                                {displayed ? <CheckedIcon /> : <UncheckedIcon />}
                                {column.title}
                                {(sorted || searched || selected) && (
                                    <span className="absolute right-1">
                                        {sorted &&
                                            (column.sorted.direction === "asc" ? <AscSortIcon /> : <DescSortIcon />)}
                                        {searched && (
                                            <span className="text-xs">
                                                <SearchIcon />
                                            </span>
                                        )}
                                        {selected && (
                                            <span className="text-xs">
                                                <FilterIcon />
                                            </span>
                                        )}
                                    </span>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </main>
        </DynamicTable.Popup>
    )
}

export function Table(props: Props) {
    return <table className="table table-pin-rows">{props.children}</table>
}

export function HeaderContainer(props: Props) {
    return <thead>{props.children}</thead>
}

export function HeaderLine(props: Props) {
    return <tr className="bg-table-header">{props.children}</tr>
}

export interface SelectionHeaderProps extends Props {
    totalSelected: number
    unvisibleSelected: number
}

export function SelectionHeader(props: SelectionHeaderProps) {
    return (
        <th className="relative">
            {props.totalSelected}
            <span className="text-sm text-stone-500 italic">
                ({props.unvisibleSelected} caché{props.unvisibleSelected > 1 ? "s" : ""})
            </span>
        </th>
    )
}

export interface HeaderProps<Item extends BaseItem, Value extends Primitive> extends Props {
    column: InternalColumn<Item, Value>
}

export function Header<Item extends BaseItem, Value extends Primitive>(props: HeaderProps<Item, Value>) {
    const filterPopup = usePopup()
    const column = props.column
    const sortable = isSortable(column)
    const searchable = isSearchable(column)
    const selectable = isSelectable(column)
    const maskable = isMaskable(column)

    return (
        <th
            className={cx(
                "relative pr-8 hover:[&_.column-actions]:inline",
                sortable && "hover:bg-stone-500/20 cursor-pointer",
            )}
            onClick={sortable ? () => column.onSortToggle() : undefined}
        >
            {props.children}
            <span className="absolute top-0 bottom-0 right-0 px-1 flex items-center gap-1.5">
                <DynamicTable.HeaderActions
                    filterType={searchable ? "search" : selectable ? "selection" : undefined}
                    onFilterPopupToggle={searchable || selectable ? filterPopup.show : undefined}
                    onDisplayToggle={maskable ? column.onDisplayToggle : undefined}
                />
                <DynamicTable.HeaderStatus
                    filterType={
                        searchable && column.searchText !== null
                            ? "search"
                            : selectable && column.hiddenValues.length > 0
                              ? "selection"
                              : undefined
                    }
                    sortState={sortable && column.sorted !== null ? column.sorted : undefined}
                />
            </span>
            {filterPopup.display &&
                (searchable ? (
                    <DynamicTable.SearchFilterPopup
                        searchText={column.searchText ?? ""}
                        onSearchTextChange={column.onSearchTextChange}
                        onDismiss={filterPopup.dismiss}
                    />
                ) : (
                    selectable && (
                        <DynamicTable.SelectionFilterPopup
                            dictionary={column.dictionary instanceof Map ? column.dictionary : null}
                            hiddenValues={column.hiddenValues ?? []}
                            onHiddenValuesChange={column.onSelectionChange}
                            onDismiss={filterPopup.dismiss}
                        />
                    )
                ))}
        </th>
    )
}

export interface HeaderActionsProps {
    filterType?: FilterType
    onFilterPopupToggle?: () => void
    onDisplayToggle?: () => void
}

export function HeaderActions(props: HeaderActionsProps) {
    return (
        <span className="column-actions hidden">
            {props.filterType !== undefined && props.onFilterPopupToggle !== undefined && (
                <DynamicTable.Button
                    className="[--text-color:color-mix(in_oklab,var(--color-base-content,black)_60%,transparent)] [--bg-default-color:color-mix(in_oklab,color-mix(in_oklab,var(--color-table-header),var(--color-stone-500)_20%)_40%,transparent)]"
                    onClick={props.onFilterPopupToggle}
                >
                    {props.filterType === "search" ? <SearchIcon /> : <FilterIcon />}
                </DynamicTable.Button>
            )}
            {props.onDisplayToggle !== undefined && (
                <DynamicTable.Button
                    className="[--text-color:color-mix(in_oklab,var(--color-base-content,black)_60%,transparent)] [--bg-default-color:color-mix(in_oklab,color-mix(in_oklab,var(--color-table-header),var(--color-stone-500)_20%)_40%,transparent)]"
                    onClick={props.onDisplayToggle}
                >
                    <HideIcon />
                </DynamicTable.Button>
            )}
        </span>
    )
}

export interface HeaderStatusProps {
    filterType?: FilterType
    sortState?: NonNullable<InternalSortableColumn<BaseItem, Primitive>["sorted"]>
}

export function HeaderStatus(props: HeaderStatusProps) {
    if (props.filterType === undefined && props.sortState === undefined) {
        return null
    }

    return (
        <span className="h-full pb-1 flex flex-col items-end justify-between">
            <span className="text-sm">
                {props.sortState !== undefined && props.sortState.totalSortedColumns > 1 && props.sortState.order}
                {props.sortState !== undefined &&
                    (props.sortState.direction === "asc" ? <AscSortIcon /> : <DescSortIcon />)}
            </span>
            <span className="shrink text-xs">
                {props.filterType !== undefined && (props.filterType === "search" ? <SearchIcon /> : <FilterIcon />)}
            </span>
        </span>
    )
}

export interface SearchFilterPopupProps {
    searchText: string
    onSearchTextChange: (searchText: string) => void
    onDismiss: () => void
}

export function SearchFilterPopup(props: SearchFilterPopupProps) {
    return (
        <DynamicTable.Popup className="right-2" onDismiss={props.onDismiss}>
            <main>
                <input
                    type="search"
                    name="search"
                    autoFocus
                    value={props.searchText}
                    onChange={(event) => {
                        props.onSearchTextChange(event.currentTarget.value)
                    }}
                />
            </main>
        </DynamicTable.Popup>
    )
}

export interface SelectionFilterPopupProps<Value extends Primitive> {
    dictionary: Dictionary<Value> | null
    hiddenValues: Value[]
    onHiddenValuesChange: (hiddenValues: Value[]) => void
    onDismiss: () => void
}

export function SelectionFilterPopup<Value extends Primitive>(props: SelectionFilterPopupProps<Value>) {
    return (
        <DynamicTable.Popup className="right-2" onDismiss={props.onDismiss}>
            <main>
                {props.dictionary === null ? (
                    <DynamicTable.Loader />
                ) : (
                    <ul className="min-w-40">
                        {Array.from(props.dictionary, ([value, entry]) => {
                            const hidden = props.hiddenValues.includes(value)

                            return (
                                <li
                                    key={`${value}`}
                                    className="flex items-center gap-1 px-2 py-0.5 cursor-pointer hover:bg-stone-500/40"
                                    onClick={() => {
                                        props.onHiddenValuesChange(
                                            hidden
                                                ? props.hiddenValues.filter((val) => val !== value)
                                                : [...props.hiddenValues, value],
                                        )
                                    }}
                                >
                                    {hidden ? <UncheckedIcon /> : <CheckedIcon />}
                                    {entry.prepend}
                                    {entry.title}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </main>
        </DynamicTable.Popup>
    )
}

export function BodyContainer(props: Props) {
    return <tbody>{props.children}</tbody>
}

export function Line(props: Props) {
    return (
        <tr className="even:[&>*]:bg-table-line-even odd:[&>*]:bg-table-line-odd hover:bg-table-line-hover">
            {props.children}
        </tr>
    )
}

interface SelectionCellProps extends Props {
    selected: boolean
    onToggle: () => void
}

export function SelectionCell(props: SelectionCellProps) {
    return (
        <td
            onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                props.onToggle()
            }}
        >
            {props.selected ? <CheckedIcon /> : <UncheckedIcon />}
        </td>
    )
}

export function Cell(props: Props) {
    return <td>{props.children}</td>
}

export interface ClickableProps extends Props {
    target: string
}

export function ClickableCell(props: ClickableProps) {
    return (
        <td className="!p-0">
            <a href={props.target} className="block size-full px-4 py-2">
                {props.children}
            </a>
        </td>
    )
}

export interface FooterContainerProps {
    totalColums: number
    pageSelector: ReactNode
    itemsPerPageSelector: ReactNode
}

export function FooterContainer(props: FooterContainerProps) {
    return (
        <tfoot>
            <tr>
                <td className="relative py-0! px-16 h-9 text-center" colSpan={props.totalColums}>
                    {props.pageSelector}
                    {props.itemsPerPageSelector}
                </td>
            </tr>
        </tfoot>
    )
}

export interface ItemsPerPageSelectorProps extends Props {
    itemsPerPage: number
    onItemsPerPageChange: (itemsPerPage: number) => void
}

const ITEM_PER_PAGE_CHOICES = [12, 24, 50, 100, 250, 500]
export function ItemsPerPageSelector(props: ItemsPerPageSelectorProps) {
    return (
        <select
            className="absolute top-0 right-0 h-full w-14 bg-white outline-none"
            name="items-per-page"
            value={props.itemsPerPage}
            onChange={(event) => {
                props.onItemsPerPageChange(Number.parseInt(event.target.value, 10))
            }}
        >
            {ITEM_PER_PAGE_CHOICES.map((choice) => (
                <option key={choice} value={choice}>
                    {choice}
                </option>
            ))}
        </select>
    )
}

export interface PageSelectorProps extends Props {
    totalPages: number
    currentPage: number
    onCurrentPageChange: (page: number) => void
}

const DISPLAYED_PAGES = 5
export function PageSelector(props: PageSelectorProps) {
    const visiblePages = useMemo(() => {
        const interval = Math.floor(DISPLAYED_PAGES / 2)
        const min = Math.max(1, Math.min(props.currentPage - interval, props.totalPages - 2 * interval))
        const max = Math.min(props.totalPages, min + 2 * interval)

        const pages: number[] = []
        for (let page = min; page <= max; ++page) {
            pages.push(page)
        }

        return pages
    }, [props.totalPages, props.currentPage])

    if (props.totalPages <= 1) {
        return null
    }

    return (
        <ul className="inline-flex flex-wrap justify-center">
            <DynamicTable.PageButton
                enabled={props.currentPage > 1}
                onClick={() => {
                    props.onCurrentPageChange(1)
                }}
            >
                1
            </DynamicTable.PageButton>
            <DynamicTable.PageButton
                enabled={props.currentPage > 1}
                onClick={() => {
                    props.onCurrentPageChange(Math.max(1, props.currentPage - 1))
                }}
            >
                <PreviousIcon />
            </DynamicTable.PageButton>
            {visiblePages.map((page) => (
                <DynamicTable.PageButton
                    key={page}
                    enabled={page !== props.currentPage}
                    active={page === props.currentPage}
                    onClick={() => {
                        props.onCurrentPageChange(page)
                    }}
                >
                    {page}
                </DynamicTable.PageButton>
            ))}
            <DynamicTable.PageButton
                enabled={props.currentPage < props.totalPages}
                onClick={() => {
                    props.onCurrentPageChange(Math.min(props.totalPages, props.currentPage + 1))
                }}
            >
                <NextIcon />
            </DynamicTable.PageButton>
            <DynamicTable.PageButton
                enabled={props.currentPage < props.totalPages}
                onClick={() => {
                    props.onCurrentPageChange(props.totalPages)
                }}
            >
                {props.totalPages}
            </DynamicTable.PageButton>
        </ul>
    )
}

export interface PageButtonProps extends Props {
    enabled: boolean
    active?: boolean
    onClick: () => void
}

export function PageButton(props: PageButtonProps) {
    return (
        <li
            className={cx(
                props.active ? "bg-stone-600 text-white" : "bg-white",
                (!props.active && props.enabled) || "text-stone-300",
            )}
        >
            <button
                type="button"
                className={cx(
                    "flex items-center justify-center h-full min-w-10 p-2 border-none oultine-none",
                    props.active || !props.enabled || "cursor-pointer hover:bg-stone-500/40",
                )}
                disabled={!props.enabled}
                onClick={() => {
                    if (props.enabled) {
                        props.onClick()
                    }
                }}
            >
                {props.children}
            </button>
        </li>
    )
}

export interface ButtonProps extends Props {
    className?: string
    disabled?: boolean
    onClick: () => void
    hoverChildren?: ReactNode
}

/**
 * A customizable button.
 *
 * The button text color is defined using the `--text-color` css property. It uses by default `--color-base-content`
 * css property or fallback to black if `--color-base-content` is not defined. You can override this value by giving an
 * appropriate className, for example:
 * `<DynamicTable.Button className="[--text-color:var(--color-stone-400)]">...</DynamicTable.Button>`
 *
 * The button background color is defined using the `--bg-color` css property. It uses by default `--color-stone-400`
 * css property. You can override this value by giving an appropriate className, for example:
 * `<DynamicTable.Button className="[--bg-color:var(--color-orange-400)]">...</DynamicTable.Button>`
 * Note that the color defined by `--bg-color` will be used when the button is hovered. A less saturated color will be
 * used for non-hovered button (by default, --bg-color mix with 50% transparent). You can also override the default
 * background color (when button is non-hovered) by defining a custom `--bg-default-color`, for example:
 * `<DynamicTable.Button className="[--bg-default-color:transparent]">...</DynamicTable.Button>`
 */
export function Button(props: ButtonProps) {
    return (
        <button
            type="button"
            className={cx(
                props.className?.includes("[--text-color:") || "[--text-color:var(--color-base-content,black)]",
                props.className?.includes("[--bg-color:") || "[--bg-color:var(--color-stone-400)]",
                props.className?.includes("[--bg-default-color:") ||
                    "[--bg-default-color:color-mix(in_oklab,var(--bg-color)_50%,transparent)]",
                "inline-flex items-center justify-center size-6 rounded-full [&_.hover-content]:hidden hover:[&_.default-content]:hidden hover:[&_.hover-content]:inline-flex",
                props.disabled
                    ? "text-(--text-color)/50"
                    : "text-(--text-color) bg-(--bg-default-color) hover:bg-(--bg-color) cursor-pointer",
                props.className,
            )}
            disabled={props.disabled}
            onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                props.onClick()
            }}
        >
            {props.hoverChildren && !props.disabled ? (
                <>
                    <span className="inline-flex default-content">{props.children}</span>
                    <span className="inline-flex hover-content">{props.hoverChildren}</span>
                </>
            ) : (
                props.children
            )}
        </button>
    )
}

export interface PopupProps extends Props {
    className?: string
    onDismiss: () => void
}

export function Popup(props: PopupProps) {
    useEffect(() => {
        window.addEventListener("click", props.onDismiss)

        return () => {
            window.removeEventListener("click", props.onDismiss)
        }
    }, [props.onDismiss])

    return (
        <div
            className={cx(
                "absolute max-w-xs max-h-[60vh] border border-stone-400 rounded bg-base-100 overflow-auto z-50",
                props.className,
            )}
            onClick={(event) => {
                event.stopPropagation()
            }}
        >
            {props.children}
        </div>
    )
}

export function Loader() {
    return <span>Loading&hellip;</span>
}
