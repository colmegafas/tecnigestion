import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Building, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Card, COLORS } from '../components/UI';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registro } = useAuth();
  
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    empresa: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.email.trim()) newErrors.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email no válido';
    if (!form.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!form.password) newErrors.password = 'La contraseña es obligatoria';
    else if (form.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await registro({
        nombre: form.nombre,
        apellidos: form.apellidos,
        email: form.email,
        telefono: form.telefono,
        empresa: form.empresa,
        password: form.password
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => step === 1 ? navigate('/login') : setStep(1)}>
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Crear cuenta</h1>
      </div>

      {/* Progress indicator */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white`}
            style={{ backgroundColor: COLORS.primary }}
          >
            1
          </div>
          <div 
            className="w-12 h-1 rounded"
            style={{ backgroundColor: step >= 2 ? COLORS.primary : COLORS.border }}
          />
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold`}
            style={{ 
              backgroundColor: step >= 2 ? COLORS.primary : COLORS.border,
              color: step >= 2 ? 'white' : COLORS.textLight
            }}
          >
            2
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mb-6">
          {step === 1 ? 'Datos personales' : 'Seguridad'}
        </p>
      </div>

      {/* Form */}
      <div className="p-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {step === 1 ? (
          <Card>
            <Input
              label="Nombre *"
              icon={User}
              value={form.nombre}
              onChange={(e) => updateForm('nombre', e.target.value)}
              placeholder="Tu nombre"
              error={errors.nombre}
            />
            <Input
              label="Apellidos"
              icon={User}
              value={form.apellidos}
              onChange={(e) => updateForm('apellidos', e.target.value)}
              placeholder="Tus apellidos"
            />
            <Input
              label="Email *"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              placeholder="tu@email.com"
              error={errors.email}
            />
            <Input
              label="Teléfono *"
              icon={Phone}
              type="tel"
              value={form.telefono}
              onChange={(e) => updateForm('telefono', e.target.value)}
              placeholder="612 345 678"
              error={errors.telefono}
            />
            <Input
              label="Nombre de empresa (opcional)"
              icon={Building}
              value={form.empresa}
              onChange={(e) => updateForm('empresa', e.target.value)}
              placeholder="Tu empresa o autónomo"
            />
          </Card>
        ) : (
          <Card>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Contraseña *
              </label>
              <div 
                className={`flex items-center bg-white border rounded-xl px-4 py-3
                  ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
              >
                <Lock size={20} className="text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  className="flex-1 ml-3 outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-400" />
                  ) : (
                    <Eye size={20} className="text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1 text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Confirmar contraseña *
              </label>
              <div 
                className={`flex items-center bg-white border rounded-xl px-4 py-3
                  ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'}`}
              >
                <Lock size={20} className="text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => updateForm('confirmPassword', e.target.value)}
                  className="flex-1 ml-3 outline-none"
                  placeholder="Repite la contraseña"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs mt-1 text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <div 
              className="p-4 rounded-xl mb-4"
              style={{ backgroundColor: `${COLORS.primary}10` }}
            >
              <p className="text-sm text-gray-700">
                🔒 Tu información está protegida y nunca será compartida con terceros.
              </p>
            </div>
          </Card>
        )}

        <Button
          variant="primary"
          size="lg"
          loading={loading}
          icon={ChevronRight}
          className="w-full mt-4"
          onClick={step === 1 ? handleNext : handleSubmit}
        >
          {step === 1 ? 'Continuar' : 'Crear mi cuenta'}
        </Button>

        {step === 1 && (
          <p className="text-center text-xs mt-6 text-gray-500 px-4">
            Al registrarte aceptas nuestros{' '}
            <span className="text-primary">Términos y condiciones</span> y{' '}
            <span className="text-primary">Política de privacidad</span>
          </p>
        )}
      </div>
    </div>
  );
}
