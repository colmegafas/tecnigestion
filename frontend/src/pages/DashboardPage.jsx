import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Calendar, Clock, Users, FileText, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import Layout from '../components/Layout';
import { Card, Loader, COLORS } from '../components/UI';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    visitas_hoy: 0,
    visitas_pendientes: 0,
    total_clientes: 0,
    presupuestos_pendientes: 0,
    facturacion_mes: 0
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await dashboardService.obtener();
      setData(result);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: 'Visitas Hoy', 
      value: data.visitas_hoy, 
      icon: Calendar, 
      color: COLORS.primary, 
      path: '/visitas' 
    },
    { 
      label: 'Pendientes', 
      value: data.visitas_pendientes, 
      icon: Clock, 
      color: COLORS.warning, 
      path: '/visitas?filter=pendientes' 
    },
    { 
      label: 'Clientes', 
      value: data.total_clientes, 
      icon: Users, 
      color: COLORS.secondary, 
      path: '/clientes' 
    },
    { 
      label: 'Presupuestos', 
      value: data.presupuestos_pendientes, 
      icon: FileText, 
      color: COLORS.purple, 
      path: '/presupuestos' 
    },
  ];

  const quickActions = [
    { icon: Users, label: 'Nuevo cliente', path: '/clientes/nuevo' },
    { icon: Calendar, label: 'Nueva visita', path: '/visitas/nueva' },
    { icon: FileText, label: 'Presupuesto', path: '/presupuestos/nuevo' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500">{getGreeting()},</p>
            <h1 className="text-2xl font-bold text-gray-800">
              {user?.nombre || 'Usuario'} 👋
            </h1>
          </div>
          <button 
            onClick={() => navigate('/configuracion')}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${COLORS.primary}15` }}
          >
            <Settings size={24} color={COLORS.primary} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <Card key={i} onClick={() => navigate(stat.path)}>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon size={24} color={stat.color} />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Revenue Card */}
        <Card className="bg-green-50 border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={24} color={COLORS.success} />
            <span className="font-semibold" style={{ color: COLORS.success }}>
              Facturación del mes
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ color: COLORS.success }}>
            {data.facturacion_mes.toLocaleString('es-ES', { 
              style: 'currency', 
              currency: 'EUR' 
            })}
          </p>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Acciones rápidas</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, i) => (
              <Card 
                key={i} 
                onClick={() => navigate(action.path)} 
                className="text-center py-5"
              >
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${COLORS.primary}20` }}
                >
                  <action.icon size={24} color={COLORS.primary} />
                </div>
                <p className="text-xs font-medium text-gray-700">{action.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
