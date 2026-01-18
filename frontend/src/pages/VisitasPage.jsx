import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Clock, User, ChevronDown, ChevronUp, AlertTriangle, Wrench, ClipboardList, Phone, MapPin, Play, Check, CheckCircle } from 'lucide-react';
import { visitasService } from '../services/api';
import Layout from '../components/Layout';
import { Card, Loader, EmptyState, FAB, Badge, TabBar, STATUS_CONFIG, COLORS } from '../components/UI';

export default function VisitasPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [visitas, setVisitas] = useState([]);
  const [filter, setFilter] = useState('todas');
  const [expandedId, setExpandedId] = useState(null);
  const [statusModalId, setStatusModalId] = useState(null);

  useEffect(() => {
    loadVisitas();
  }, []);

  const loadVisitas = async () => {
    try {
      const data = await visitasService.listar();
      setVisitas(data);
    } catch (error) {
      console.error('Error loading visitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id, estado) => {
    try {
      await visitasService.cambiarEstado(id, estado);
      setVisitas(prev => prev.map(v => v.id === id ? { ...v, estado } : v));
      setStatusModalId(null);
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const filters = [
    { value: 'todas', label: 'Todas' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'pendientes', label: 'Pendientes' },
    { value: 'completada', label: 'Completadas' },
  ];

  const isToday = (fecha) => {
    const today = new Date().toISOString().split('T')[0];
    return fecha === today;
  };

  const filtered = visitas.filter(v => {
    if (filter === 'todas') return true;
    if (filter === 'hoy') return isToday(v.fecha);
    if (filter === 'pendientes') return ['pendiente', 'confirmada'].includes(v.estado);
    return v.estado === filter;
  });

  const formatDate = (fecha) => {
    if (isToday(fecha)) return 'Hoy';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (fecha === tomorrow.toISOString().split('T')[0]) return 'Mañana';
    return new Date(fecha).toLocaleDateString('es-ES', { 
      weekday: 'short', day: 'numeric', month: 'short' 
    });
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/')}>
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1">
          Visitas ({visitas.length})
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <TabBar tabs={filters} active={filter} onChange={setFilter} />

        {/* List */}
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No hay visitas"
            message={filter !== 'todas' ? 'Prueba con otro filtro' : 'Añade tu primera visita'}
            action={filter === 'todas' && 'Nueva visita'}
            onAction={() => navigate('/visitas/nueva')}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(visita => (
              <Card key={visita.id}>
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold" style={{ color: COLORS.primary }}>
                        {formatDate(visita.fecha)}
                      </span>
                      {visita.hora && (
                        <span className="text-gray-500">{visita.hora}</span>
                      )}
                    </div>
                    {visita.tipo === 'urgencia' && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle size={14} color={COLORS.error} />
                        <span className="text-xs font-medium" style={{ color: COLORS.error }}>
                          Urgente
                        </span>
                      </div>
                    )}
                  </div>
                  <Badge 
                    status={visita.estado} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatusModalId(statusModalId === visita.id ? null : visita.id);
                      setExpandedId(null);
                    }}
                  />
                </div>

                {/* Main info */}
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    setExpandedId(expandedId === visita.id ? null : visita.id);
                    setStatusModalId(null);
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${STATUS_CONFIG[visita.estado]?.color || COLORS.primary}20` }}
                  >
                    <Wrench size={20} color={STATUS_CONFIG[visita.estado]?.color || COLORS.primary} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{visita.titulo}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <User size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-500">{visita.cliente_nombre}</span>
                    </div>
                  </div>
                  {expandedId === visita.id ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>

                {/* Expanded details */}
                {expandedId === visita.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ClipboardList size={16} color={COLORS.primary} />
                        <span className="text-sm font-semibold text-gray-800">
                          Qué hay que hacer:
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50">
                        <p className="text-sm text-gray-700">
                          {visita.descripcion || 'Sin descripción'}
                        </p>
                      </div>
                    </div>

                    {(visita.cliente_telefono || visita.cliente_direccion) && (
                      <div className="p-3 rounded-xl bg-gray-50 space-y-2">
                        {visita.cliente_telefono && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} color={COLORS.primary} />
                            <a 
                              href={`tel:${visita.cliente_telefono}`}
                              className="text-sm text-gray-700"
                            >
                              {visita.cliente_telefono}
                            </a>
                          </div>
                        )}
                        {visita.cliente_direccion && (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} color={COLORS.primary} />
                            <span className="text-sm text-gray-700">
                              {visita.cliente_direccion}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Status change panel */}
                {statusModalId === visita.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                    <p className="text-sm font-semibold text-gray-800 mb-3">
                      Cambiar estado:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { estado: 'pendiente', icon: Clock, label: 'Pendiente' },
                        { estado: 'confirmada', icon: Check, label: 'Confirmada' },
                        { estado: 'en_curso', icon: Play, label: 'En curso' },
                        { estado: 'completada', icon: CheckCircle, label: 'Completada' },
                      ].map(opt => (
                        <button
                          key={opt.estado}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeStatus(visita.id, opt.estado);
                          }}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all
                            ${visita.estado === opt.estado 
                              ? 'border-primary bg-blue-50' 
                              : 'border-gray-200'}`}
                        >
                          <opt.icon size={18} color={STATUS_CONFIG[opt.estado].color} />
                          <span 
                            className="text-sm font-medium"
                            style={{ color: STATUS_CONFIG[opt.estado].color }}
                          >
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <FAB icon={Plus} onClick={() => navigate('/visitas/nueva')} />
    </Layout>
  );
}
