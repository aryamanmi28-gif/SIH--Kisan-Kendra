export default function Container({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-content px-4 sm:px-6 ${className}`}>{children}</div>
}
