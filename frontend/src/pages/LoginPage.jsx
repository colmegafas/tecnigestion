import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input, Button, COLORS } from '../components/UI';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-gray-50">
      {/* Logo */}
      <div className="text-center mb-10">
        <div 
          className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center text-5xl"
          style={{ backgroundColor: COLORS.primary }}
        >
          🔧
        </div>
        <h1 className="text-3xl font-bold text-gray-800">TecniGestión</h1>
        <p className="text-gray-500">Gestión profesional para técnicos</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <Input
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
        />

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Contraseña
          </label>
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
            <Lock size={20} className="text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 ml-3 outline-none"
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} className="text-gray-400" />
              ) : (
                <Eye size={20} className="text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <button type="button" className="text-sm text-primary w-full text-right">
          ¿Olvidaste tu contraseña?
        </button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={LogIn}
          className="w-full"
        >
          Iniciar Sesión
        </Button>
      </form>

      {/* Register link */}
      <div className="text-center pt-6 mt-6 border-t border-gray-200">
        <p className="text-gray-500 mb-3">¿No tienes cuenta?</p>
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={() => navigate('/registro')}
        >
          Crear cuenta gratis
        </Button>
      </div>
    </div>
  );
}
