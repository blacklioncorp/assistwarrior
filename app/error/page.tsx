'use client'

import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '2rem',
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '3rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2rem',
        }}>
          ⚠️
        </div>

        <h1 style={{
          color: '#fff',
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
        }}>
          Algo salió mal
        </h1>

        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}>
          Hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo o contacta al soporte si el problema persiste.
        </p>

        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 2rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
          }}
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
