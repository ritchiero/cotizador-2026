'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Algo salió mal</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>Ha ocurrido un error inesperado.</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
