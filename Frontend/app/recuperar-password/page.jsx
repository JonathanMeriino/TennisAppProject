'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RecuperarPasswordDirectaPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    setError('');

    // Validación rápida en frontend de que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      // Petición POST hacia tu backend en Django
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/password-reset-directo/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje('¡Contraseña actualizada con éxito! Redirigiendo al login...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.error || 'Ocurrió un error al actualizar la contraseña.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Restablecer Contraseña</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ingresa tu usuario y define tu nueva contraseña.
          </p>
        </div>

        {mensaje && (
          <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-600 border border-green-500/20 text-center font-medium">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-600 border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nombre de Usuario
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu usuario"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Volver al inicio de sesión
          </Link>
        </div>

      </div>
    </div>
  );
}