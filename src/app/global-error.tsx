'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
          <h2>Algo salió mal (Global Error)</h2>
          <p>
            Ha ocurrido un error crítico en la aplicación.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Intentar de nuevo
          </button>

          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '20px', padding: '10px', background: '#fee2e2', borderRadius: '5px' }}>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {error.message}
                {error.stack}
              </pre>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
