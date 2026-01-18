import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Moon, Shield, HelpCircle, Info, LogOut, ChevronRight, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, Avatar, Toggle, Modal, Button, COLORS } from '../components/UI';

export default function ConfiguracionPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const MenuItem = ({ icon: Icon, label, value, onClick, toggle, toggleValue, onToggle, danger }) => (
    <button
      onClick={toggle ? undefined : onClick}
      className="w-full flex items-center gap-4 p-4 border-b border-gray-100"
    >
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: danger ? `${COLORS.error}15` : `${COLORS.primary}15` }}
      >
        <Icon size={20} color={danger ? COLORS.error : COLORS.primary} />
      </div>
      <div className="flex-1 text-left">
        <p 
          className="font-medium"
          style={{ color: danger ? COLORS.error : COLORS.text }}
        >
          {label}
        </p>
        {value && <p className="text-sm text-gray-500">{value}</p>}
      </div>
      {toggle ? (
        <Toggle checked={toggleValue} onChange={onToggle} />
      ) : (
        <ChevronRight size={20} className="text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => navigate('/')}>
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Configuración</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Perfil */}
        <Card>
          <div className="flex items-center gap-4">
            <Avatar 
              name={`${user?.nombre || 'Usuario'} ${user?.apellidos || ''}`}
              size="lg"
            />
            <div className="flex-1">
              <p className="font-bold text-lg text-gray-800">
                {user?.nombre} {user?.apellidos}
              </p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span 
                className="text-xs mt-1 px-2 py-1 rounded-full inline-block"
                style={{ backgroundColor: `${COLORS.secondary}20`, color: COLORS.secondary }}
              >
                Plan Profesional
              </span>
            </div>
            <button 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${COLORS.primary}15` }}
            >
              <Edit size={18} color={COLORS.primary} />
            </button>
          </div>
        </Card>

        {/* Opciones */}
        <Card className="p-0 overflow-hidden">
          <MenuItem
            icon={Bell}
            label="Notificaciones"
            toggle
            toggleValue={notificaciones}
            onToggle={setNotificaciones}
          />
          <MenuItem
            icon={Moon}
            label="Modo oscuro"
            toggle
            toggleValue={modoOscuro}
            onToggle={setModoOscuro}
          />
          <MenuItem
            icon={Shield}
            label="Privacidad"
            value="Gestionar permisos"
            onClick={() => {}}
          />
          <MenuItem
            icon={HelpCircle}
            label="Ayuda y soporte"
            value="FAQ, contacto"
            onClick={() => {}}
          />
          <MenuItem
            icon={Info}
            label="Acerca de"
            value="Versión 1.0.0"
            onClick={() => {}}
          />
        </Card>

        {/* Datos de facturación */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-3">Datos de facturación</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Empresa</span>
              <span className="text-gray-800">{user?.empresa || 'No configurado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-800">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Teléfono</span>
              <span className="text-gray-800">{user?.telefono || 'No configurado'}</span>
            </div>
          </div>
          <button
            className="w-full mt-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: `${COLORS.primary}15`, color: COLORS.primary }}
          >
            Editar datos
          </button>
        </Card>

        {/* Cerrar sesión */}
        <Card className="p-0 overflow-hidden">
          <MenuItem
            icon={LogOut}
            label="Cerrar sesión"
            danger
            onClick={() => setShowLogoutModal(true)}
          />
        </Card>

        <p className="text-center text-xs text-gray-400 pt-4">
          TecniGestión v1.0.0 · © 2024
        </p>
      </div>

      {/* Modal logout */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div className="p-6 text-center">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${COLORS.error}20` }}
          >
            <LogOut size={32} color={COLORS.error} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">¿Cerrar sesión?</h3>
          <p className="text-sm text-gray-500 mb-6">
            Tendrás que volver a iniciar sesión para acceder a tu cuenta.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
