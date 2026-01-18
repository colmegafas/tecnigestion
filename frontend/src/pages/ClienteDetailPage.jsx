import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, FileText, Calendar, TrendingUp } from 'lucide-react';
import { clientesService, presupuestosService } from '../services/api';
import { Card, Button, Loader, Avatar, Badge, Modal, COLORS } from '../components/UI';

export default function ClienteDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState(null);
  const [presupuestos, setPresupuestos] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [clienteData, presupuestosData] = await Promise.all([
        clientesService.obtener(id),
        presupuestosService.porCliente(id)
      ]);
      setCliente(clienteData);
      setPresupuestos(presupuestosData);
    } catch (error) {
      console.error('Error loading data:', error);
      navigate('/clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await clientesService.eliminar(id);
      navigate('/clientes');
    } catch (error) {
      console.error('Error deleting cliente:', error);
      alert('Error al eliminar el cliente');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Loader />
      </div>
    );
  }

  if (!cliente) return null;

  const totalPresupuestado = presupuestos.reduce((sum, p) => sum + p.total, 0);
  const totalAceptado = presupuestos
    .filter(p => p.estado === 'aceptado')
    .reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/clientes')}>
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Cliente</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/clientes/${id}/editar`)}
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${COLORS.primary}20` }}
          >
            <Edit size={20} color={COLORS.primary} />
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${COLORS.error}20` }}
          >
            <Trash2 size={20} color={COLORS.error} />
          </button>
        </div>
      </div>

      <div className="p-4 pb-8 space-y-4">
        {/* Avatar y nombre */}
        <Card className="text-center py-6">
          <div className="flex justify-center mb-4">
            <Avatar 
              name={`${cliente.nombre} ${cliente.apellidos || ''}`}
              size="lg"
              tipo={cliente.tipo}
            />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {cliente.nombre} {cliente.apellidos}
          </h2>
          <span 
            className="inline-block mt-2 text-sm px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: cliente.tipo === 'empresa' ? `${COLORS.purple}20` : `${COLORS.primary}20`,
              color: cliente.tipo === 'empresa' ? COLORS.purple : COLORS.primary
            }}
          >
            {cliente.tipo === 'empresa' ? '🏢 Empresa' : '👤 Particular'}
          </span>
        </Card>

        {/* Datos de contacto */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Contacto</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Phone size={20} color={COLORS.primary} />
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <a href={`tel:${cliente.telefono}`} className="font-medium text-gray-800">
                  {cliente.telefono}
                </a>
              </div>
            </div>
            {cliente.email && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <Mail size={20} color={COLORS.primary} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a href={`mailto:${cliente.email}`} className="font-medium text-gray-800">
                    {cliente.email}
                  </a>
                </div>
              </div>
            )}
            {(cliente.direccion || cliente.ciudad) && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <MapPin size={20} color={COLORS.primary} />
                <div>
                  <p className="text-xs text-gray-500">Dirección</p>
                  <p className="font-medium text-gray-800">
                    {[cliente.direccion, cliente.ciudad, cliente.provincia]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Presupuestos del cliente */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              Presupuestos ({presupuestos.length})
            </h3>
            <FileText size={20} color={COLORS.primary} />
          </div>
          
          {presupuestos.length === 0 ? (
            <div className="text-center py-6">
              <FileText size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">Sin presupuestos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {presupuestos.map(pres => (
                <div 
                  key={pres.id}
                  onClick={() => navigate(`/presupuestos/${pres.id}`)}
                  className="p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: COLORS.primary }}>
                        {pres.numero}
                      </p>
                      <p className="text-xs text-gray-500">{pres.fecha_emision}</p>
                    </div>
                    <Badge status={pres.estado} />
                  </div>
                  <p className="text-sm text-gray-800 mb-2">{pres.titulo}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      {pres.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                    {!pres.aplicar_iva && (
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${COLORS.warning}20`, color: COLORS.warning }}
                      >
                        Sin IVA
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Resumen de facturación */}
        {presupuestos.length > 0 && (
          <Card className="bg-green-50 border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={20} color={COLORS.success} />
              <span className="font-semibold" style={{ color: COLORS.success }}>
                Resumen
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total presupuestado</p>
                <p className="text-lg font-bold" style={{ color: COLORS.success }}>
                  {totalPresupuestado.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Aceptados</p>
                <p className="text-lg font-bold" style={{ color: COLORS.success }}>
                  {totalAceptado.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Acciones rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="primary"
            icon={Calendar}
            onClick={() => navigate(`/visitas/nueva?cliente=${id}`)}
          >
            Nueva visita
          </Button>
          <Button
            variant="secondary"
            icon={FileText}
            onClick={() => navigate(`/presupuestos/nuevo?cliente=${id}`)}
          >
            Presupuesto
          </Button>
        </div>
      </div>

      {/* Modal eliminar */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6 text-center">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${COLORS.error}20` }}
          >
            <Trash2 size={32} color={COLORS.error} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar cliente?</h3>
          <p className="text-sm text-gray-500 mb-6">
            Esta acción no se puede deshacer. Se eliminarán también sus visitas y presupuestos.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={deleting}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
