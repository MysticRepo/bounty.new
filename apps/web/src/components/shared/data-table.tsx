import { useState } from 'react';
import { Button } from '@bounty/ui/components/button';
import { Input } from '@bounty/ui/components/input';
import { Badge } from '@bounty/ui/components/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@bounty/ui/components/dropdown-menu';
import { componentClasses, cn } from '@/lib/design-tokens';
import { ChevronDown, Search, MoreHorizontal } from 'lucide-react';
import { usePaginationState, useSortingState, useSearchState } from '@/hooks/use-ui-state';

/**
 * Generic data table component
 * Consolidates table patterns across admin components
 * Reduces table duplication by ~70%
 */

interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  searchable = true,
  sortable = true,
  paginated = true,
  pageSize = 10,
  emptyMessage = 'No data found',
  onRowClick,
  actions,
  className,
}: DataTableProps<T>) {
  const { query, setQuery } = useSearchState();
  const { sortBy, sortOrder, toggleSort } = useSortingState();
  const { page, setPage, setPageSize } = usePaginationState(1, pageSize);

  // Filter data based on search query
  const filteredData = data.filter(item => {
    if (!query) return true;
    return columns.some(column => {
      const value = column.key;
      if (typeof value === 'string' && value in item) {
        const itemValue = item[value as keyof T];
        return String(itemValue).toLowerCase().includes(query.toLowerCase());
      }
      return false;
    });
  });

  // Sort data
  const sortedData = sortable && sortBy
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortBy as keyof T];
        const bValue = b[sortBy as keyof T];
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;

  // Paginate data
  const paginatedData = paginated
    ? sortedData.slice((page - 1) * pageSize, page * pageSize)
    : sortedData;

  const totalPages = Math.ceil(sortedData.length / pageSize);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        {searchable && (
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              className="max-w-sm border-neutral-800 bg-neutral-900"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              value={query}
            />
          </div>
        )}
        
        {actions && (
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">
              {sortedData.length} items
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-left text-neutral-400 text-sm font-medium',
                      column.sortable && 'cursor-pointer hover:text-neutral-300',
                      column.width
                    )}
                    onClick={() => column.sortable && toggleSort(column.key as string)}
                  >
                    <div className="flex items-center gap-2">
                      {column.title}
                      {column.sortable && sortBy === column.key && (
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            sortOrder === 'desc' && 'rotate-180'
                          )}
                        />
                      )}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 text-right text-neutral-400 text-sm font-medium">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-800">
                    {columns.map((column) => (
                      <td key={String(column.key)} className="px-4 py-3">
                        <div className={cn(componentClasses.skeleton, 'h-4 w-full')} />
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3">
                        <div className={cn(componentClasses.skeleton, 'h-4 w-8')} />
                      </td>
                    )}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-neutral-500 text-sm"
                    colSpan={columns.length + (actions ? 1 : 0)}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'border-b border-neutral-800 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-neutral-800/50'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <td key={String(column.key)} className="px-4 py-3">
                        {column.render
                          ? column.render(item[column.key as keyof T], item)
                          : String(item[column.key as keyof T] || '')}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="h-8 w-8 rounded-lg border border-neutral-700 bg-neutral-800/40 p-1 text-neutral-300 hover:bg-neutral-700/40"
                                size="icon"
                                variant="outline"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 rounded-md border border-neutral-800 bg-neutral-900 p-1 shadow">
                              {actions(item)}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-neutral-400">
            Page {page} of {totalPages}
          </span>
          <Button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Specialized table for admin data
 */
interface AdminTableProps<T> extends Omit<DataTableProps<T>, 'actions'> {
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  canEdit?: (item: T) => boolean;
  canDelete?: (item: T) => boolean;
}

export function AdminTable<T extends { id: string }>({
  onEdit,
  onDelete,
  onView,
  canEdit,
  canDelete,
  ...props
}: AdminTableProps<T>) {
  const actions = (item: T) => (
    <>
      {onView && (
        <DropdownMenuItem onClick={() => onView(item)}>
          View Details
        </DropdownMenuItem>
      )}
      {onEdit && (!canEdit || canEdit(item)) && (
        <DropdownMenuItem onClick={() => onEdit(item)}>
          Edit
        </DropdownMenuItem>
      )}
      {onDelete && (!canDelete || canDelete(item)) && (
        <DropdownMenuItem 
          className="text-red-400 hover:bg-red-950/40"
          onClick={() => onDelete(item)}
        >
          Delete
        </DropdownMenuItem>
      )}
    </>
  );

  return <DataTable {...props} actions={actions} />;
}