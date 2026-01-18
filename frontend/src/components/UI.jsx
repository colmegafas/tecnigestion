import React from 'react';
import { Loader2 } from 'lucide-react';

// ============ COLORES ============
export const COLORS = {
  primary: '#3498DB',
  secondary: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  success: '#27AE60',
  purple: '#9B59B6',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  border: '#E0E0E0',
};

// ============ STATUS CONFIG ============
export const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', color: '#F39C12', bg: '#FEF3E2' },
  confirmada: { label: 'Confirmada', color: '#3498DB', bg: '#E8F4FD' },
  en_curso: { label: 'En Curso', color: '#9B59B6', bg: '#F3E8FD' },
  completada: { label: 'Completada', color: '#27AE60', bg: '#E8F8EF' },
  cancelada: { label: 'Cancelada', color: '#E74C3C', bg: '#FDE8E8' },
  borrador: { label: 'Borrador', color: '#95A5A6', bg: '#F0F0F0' },
  enviado: { label: 'Enviado', color: '#3498DB', bg: '#E8F4FD' },
  aceptado: { label: 'Aceptado', color: '#27AE60', bg: '#E8F8EF' },
  rechazado: { label: 'Rechazado', color: '#E74C3C', bg: '#FDE8E8' },
};

// ============ CARD ============
export function Card({ children, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 
        ${onClick ? 'cursor-pointer card-hover active:scale-[0.98]' : ''} 
        ${className}`}
    >
      {children}
    </div>
  );
}

// ============ BADGE ============
export function Badge({ status, onClick, children }) {
  const config = STATUS_CONFIG[status] || { label: status, color: COLORS.textLight, bg: '#F0F0F0' };
  
  return (
    <span
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {children || config.label}
    </span>
  );
}

// ============ INPUT ============
export function Input({ label, icon: Icon, error, textarea, className = '', ...props }) {
  const Component = textarea ? 'textarea' : 'input';
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label}
        </label>
      )}
      <div
        className={`flex ${textarea ? 'items-start' : 'items-center'} bg-white border rounded-xl px-4 py-3 transition-colors
          ${error ? 'border-red-400' : 'border-gray-200 focus-within:border-primary'}`}
      >
        {Icon && <Icon size={20} className={`text-gray-400 ${textarea ? 'mt-1' : ''}`} />}
        <Component
          className={`flex-1 ${Icon ? 'ml-3' : ''} outline-none text-base bg-transparent resize-none`}
          rows={textarea ? 3 : undefined}
          {...props}
        />
      </div>
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
}

// ============ BUTTON ============
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  icon: Icon,
  className = '',
  ...props 
}) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-600',
    secondary: 'bg-secondary text-white hover:bg-green-600',
    outline: 'border-2 border-primary text-primary hover:bg-blue-50',
    danger: 'bg-error text-white hover:bg-red-600',
    ghost: 'text-gray-600 hover:bg-gray-100'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      className={`rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50
        ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 size={20} className="animate-spin" /> : Icon && <Icon size={20} />}
      {children}
    </button>
  );
}

// ============ LOADER ============
export function Loader({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={40} className="animate-spin text-primary mb-4" />
      <p className="text-gray-500">{text}</p>
    </div>
  );
}

// ============ EMPTY STATE ============
export function EmptyState({ icon: Icon, title, message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && <Icon size={64} className="text-gray-300 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {message && <p className="text-gray-500 mb-4">{message}</p>}
      {action && onAction && (
        <Button onClick={onAction} variant="primary">
          {action}
        </Button>
      )}
    </div>
  );
}

// ============ MODAL ============
export function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ============ TOGGLE ============
export function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-gray-700">{label}</span>}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-14 h-8 rounded-full p-1 transition-colors toggle-switch
          ${checked ? 'bg-primary' : 'bg-gray-300'}`}
      >
        <div 
          className={`w-6 h-6 rounded-full bg-white shadow-md toggle-knob
            ${checked ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

// ============ TAB BAR ============
export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
            ${active === tab.value 
              ? 'bg-primary text-white' 
              : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ============ AVATAR ============
export function Avatar({ name, size = 'md', tipo = 'particular' }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-20 h-20 text-2xl'
  };

  const color = tipo === 'empresa' ? COLORS.purple : COLORS.primary;

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      {initials}
    </div>
  );
}

// ============ FAB (Floating Action Button) ============
export function FAB({ onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary text-white 
        flex items-center justify-center shadow-lg z-10 active:scale-95 transition-transform"
    >
      <Icon size={28} />
    </button>
  );
}

// ============ TOAST ============
export function Toast({ message, type = 'info', onClose }) {
  const types = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 left-4 right-4 ${types[type]} text-white px-4 py-3 rounded-xl 
      shadow-lg z-50 animate-slideUp flex items-center justify-between`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">✕</button>
    </div>
  );
}
