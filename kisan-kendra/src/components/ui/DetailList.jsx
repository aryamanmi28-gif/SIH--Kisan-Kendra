/** Label/value pairs used on every confirmation and record screen. */
export default function DetailList({ items, columns = 2, className = '' }) {
  const gridClass = columns === 1 ? 'sm:grid-cols-1' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-4 ${gridClass} ${className}`}>
      {items
        .filter((item) => item && item.value !== undefined && item.value !== null && item.value !== '')
        .map((item) => (
          <div key={item.label} className={item.wide ? 'sm:col-span-2' : undefined}>
            <dt className="text-sm text-muted">{item.label}</dt>
            <dd className={`mt-0.5 font-semibold text-ink ${item.emphasis ? 'text-lg' : 'text-[15px]'}`}>
              {item.value}
            </dd>
          </div>
        ))}
    </dl>
  )
}
