interface Props {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      {icon && (
        <div style={{ color: 'var(--color-muted)', opacity: 0.5, marginBottom: 4 }}>{icon}</div>
      )}
      <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: 'var(--color-text)' }}>
        {title}
      </p>
      {description && (
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted)', maxWidth: 320, lineHeight: 1.55 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}
