import { clsx } from 'clsx'

const Table = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('min-w-full divide-y divide-gray-200', className)}>
        {children}
      </table>
    </div>
  )
}

const TableHead = ({ children, className = '' }) => {
  return (
    <thead className={clsx('bg-gray-50', className)}>
      {children}
    </thead>
  )
}

const TableBody = ({ children, className = '' }) => {
  return (
    <tbody className={clsx('bg-white divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  )
}

const TableRow = ({ children, className = '', onClick, clickable = false }) => {
  return (
    <tr
      className={clsx(
        clickable && 'cursor-pointer hover:bg-gray-50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

const TableHeader = ({ children, className = '', align = 'left' }) => {
  return (
    <th
      className={clsx(
        'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </th>
  )
}

const TableCell = ({ children, className = '', align = 'left' }) => {
  return (
    <td
      className={clsx(
        'px-6 py-4 whitespace-nowrap text-sm',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </td>
  )
}

const TableEmpty = ({ message = 'No data available', colSpan = 1 }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-gray-500">
        {message}
      </td>
    </tr>
  )
}

Table.Head = TableHead
Table.Body = TableBody
Table.Row = TableRow
Table.Header = TableHeader
Table.Cell = TableCell
Table.Empty = TableEmpty

export default Table
