export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin mb-4" style={{ borderColor: 'var(--border-primary)', borderTopColor: 'var(--blue)', borderWidth: '3px' }} />
      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 animate-pulse" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1"><div className="h-5 rounded mb-2 w-2/3" style={{ background: 'var(--bg-tertiary)' }} /><div className="h-3 rounded w-1/2" style={{ background: 'var(--bg-tertiary)' }} /></div>
            <div className="text-right"><div className="h-6 rounded w-20 mb-1" style={{ background: 'var(--bg-tertiary)' }} /><div className="h-4 rounded w-16 ml-auto" style={{ background: 'var(--bg-tertiary)' }} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}