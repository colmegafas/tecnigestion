import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, User, Download, Timer, Send, Check, XCircle } from 'lucide-react';
import { presupuestosService } from '../services/api';
import Layout from '../components/Layout';
import { Card, Loader, EmptyState, FAB, Badge, Modal, Button, STATUS_CONFIG, COLORS } from '../components/UI';

export default function PresupuestosPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [presupuestos, setPresupuestos] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [pdfModal, setPdfModal] = useState(null);

  useEffect(() => {
    loadPresupuestos();
  }, []);

  const loadPresupuestos = async () => {
    try {
      const data = await presupuestosService.listar();
      setPresupuestos(data);
    } catch (error) {
      console.error('Error loading presupuestos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id, estado) => {
    try {
      await presupuestosService.cambiarEstado(id, estado);
      // Recargar para obtener dias_para_eliminar actualizado
      loadPresupuestos();
      setExpandedId(null);
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const handleDownloadPdf = (pres) => {
    // Simular descarga de PDF
    alert(`📄 PDF descargado: ${pres.numero}.pdf`);
    setPdfModal(null);
  };

  const stats = {
    total: presupuestos.length,
    aceptados: presupuestos.filter(p => p.estado === 'aceptado').length,
    pendientes: presupuestos.filter(p => ['borrador', 'enviado'].includes(p.estado)).length
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/')}>
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1">Presupuestos</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total', value: stats.total, color: COLORS.text },
            { label: 'Aceptados', value: stats.aceptados, color: COLORS.success },
            { label: 'Pendientes', value: stats.pendientes, color: COLORS.warning },
          ].map((stat, i) => (
            <Card key={i} className="text-center py-3">
              <p className="text-xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <Loader />
        ) : presupuestos.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No hay presupuestos"
            message="Crea tu primer presupuesto"
            action="Nuevo presupuesto"
            onAction={() => navigate('/presupuestos/nuevo')}
          />
        ) : (
          <div className="space-y-3">
            {presupuestos.map(pres => (
              <Card key={pres.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold" style={{ color: COLORS.primary }}>
                      {pres.numero}
                    </p>
                    <p className="text-sm text-gray-500">{pres.fecha_emision}</p>
                  </div>
                  <Badge 
                    status={pres.estado}
                    onClick={() => setExpandedId(expandedId === pres.id ? null : pres.id)}
                  />
                </div>

                <p className="font-medium text-gray-800 mb-2">{pres.titulo}</p>

                {/* Aviso eliminación si rechazado */}
                {pres.estado === 'rechazado' && pres.dias_para_eliminar !== null && (
                  <div 
                    className="flex items-center gap-2 mb-2 p-2 rounded-lg"
                    style={{ backgroundColor: `${COLORS.error}10` }}
                  >
                    <Timer size={16} color={COLORS.error} />
                    <span className="text-xs font-medium" style={{ color: COLORS.error }}>
                      Se eliminará en {pres.dias_para_eliminar} días
                    </span>
                  </div>
                )}

                {/* Sin IVA badge */}
                {!pres.aplicar_iva && (
                  <span 
                    className="text-xs px-2 py-1 rounded-full inline-block mb-2"
                    style={{ backgroundColor: `${COLORS.warning}20`, color: COLORS.warning }}
                  >
                    Sin IVA
                  </span>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1">
                    <User size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{pres.cliente_nombre}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">
                    {pres.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>

                {/* Botón PDF */}
                <button
                  onClick={() => setPdfModal(pres)}
                  className="w-full mt-3 py-2 rounded-xl flex items-center justify-center gap-2 border"
                  style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                >
                  <Download size={18} />
                  <span className="font-medium text-sm">Descargar PDF</span>
                </button>

                {/* Status change panel */}
                {expandedId === pres.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                    <p className="text-sm font-semibold text-gray-800 mb-3">
                      Cambiar estado:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { estado: 'borrador', icon: FileText, label: 'Borrador' },
                        { estado: 'enviado', icon: Send, label: 'Enviado' },
                        { estado: 'aceptado', icon: Check, label: 'Aceptado' },
                        { estado: 'rechazado', icon: XCircle, label: 'Rechazado' },
                      ].map(opt => (
                        <button
                          key={opt.estado}
                          onClick={() => handleChangeStatus(pres.id, opt.estado)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all
                            ${pres.estado === opt.estado 
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

      <FAB icon={Plus} onClick={() => navigate('/presupuestos/nuevo')} />

      {/* PDF Modal */}
      <Modal isOpen={!!pdfModal} onClose={() => setPdfModal(null)}>
        {pdfModal && (
          <div className="p-6 text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary}15` }}
            >
              <FileText size={32} color={COLORS.primary} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{pdfModal.numero}</h3>
            <p className="text-sm text-gray-500 mb-4">{pdfModal.titulo}</p>
            
            <div className="p-4 rounded-xl bg-gray-50 text-left mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Cliente:</span>
                <span className="text-sm font-medium text-gray-800">{pdfModal.cliente_nombre}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Fecha:</span>
                <span className="text-sm font-medium text-gray-800">{pdfModal.fecha_emision}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total:</span>
                <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
                  {pdfModal.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              icon={Download}
              className="w-full mb-3"
              onClick={() => handleDownloadPdf(pdfModal)}
            >
              Descargar PDF
            </Button>
            <button
              onClick={() => setPdfModal(null)}
              className="w-full py-2 text-sm text-gray-500"
            >
              Cancelar
            </button>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
