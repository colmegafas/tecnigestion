import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Save, User, Users, Plus, ChevronDown, Search, Clock, AlertTriangle, Wrench } from 'lucide-react';
import { visitasService, clientesService } from '../services/api';
import { Card, Input, Button, COLORS } from '../components/UI';

const VISIT_TYPES = [
  { value: 'valoracion', label: 'Valoración' },
  { value: 'reparacion', label: 'Reparación' },
  { value: 'instalacion', label: 'Instalación' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'urgencia', label: 'Urgencia' },
];

export default function VisitaFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('cliente');

  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteMode, setClienteMode] = useState(preselectedClientId ? 'existente' : 'existente');
  
  const [form, setForm] = useState({
    cliente_id: preselectedClientId || '',
    titulo: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '09:00',
    tipo: 'reparacion',
    prioridad: 'normal'
  });
  
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    ciudad: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const data = await clientesService.listar();
      setClientes(data);
    } catch (error) {
      console.error('Error loading clientes:', error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const updateNuevoCliente = (field, value) => {
    setNuevoCliente(prev => ({ ...prev, [field]: value }));
    if (errors[`nuevo_${field}`]) setErrors(prev => ({ ...prev, [`nuevo_${field}`]: null }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!form.titulo.trim()) newErrors.titulo = 'El título es obligatorio';
    if (!form.fecha) newErrors.fecha = 'La fecha es obligatoria';
    
    if (clienteMode === 'existente') {
      if (!form.cliente_id) newErrors.cliente_id = 'Selecciona un cliente';
    } else {
      if (!nuevoCliente.nombre.trim()) newErrors.nuevo_nombre = 'El nombre es obligatorio';
      if (!nuevoCliente.telefono.trim()) newErrors.nuevo_telefono = 'El teléfono es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      let clienteId = form.cliente_id;

      // Si es cliente nuevo, crearlo primero
      if (clienteMode === 'nuevo') {
        const newClient = await clientesService.crear({
          nombre: nuevoCliente.nombre,
          apellidos: nuevoCliente.apellidos,
          telefono: nuevoCliente.telefono,
          ciudad: nuevoCliente.ciudad,
          tipo: 'particular'
        });
        clienteId = newClient.id;
      }

      // Crear la visita
      await visitasService.crear({
        cliente_id: parseInt(clienteId),
        titulo: form.titulo,
        descripcion: form.descripcion,
        fecha: form.fecha,
        hora: form.hora,
        tipo: form.tipo,
        prioridad: form.prioridad
      });

      navigate('/visitas');
    } catch (error) {
      console.error('Error saving visita:', error);
      alert('Error al guardar la visita');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <X size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Nueva Visita</h1>
        </div>
        <Button
          variant="primary"
          size="sm"
          loading={saving}
          icon={Save}
          onClick={handleSubmit}
        >
          Guardar
        </Button>
      </div>

      <div className="p-4 pb-8 space-y-4">
        {/* Tipo de visita */}
        <Card>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Tipo de visita
          </label>
          <div className="grid grid-cols-3 gap-2">
            {VISIT_TYPES.map(tipo => (
              <button
                key={tipo.value}
                onClick={() => updateForm('tipo', tipo.value)}
                className={`py-3 px-2 rounded-xl border-2 text-center transition-all
                  ${form.tipo === tipo.value 
                    ? 'border-primary bg-blue-50' 
                    : 'border-gray-200 bg-white'}`}
              >
                <span 
                  className="text-xs font-medium"
                  style={{ color: form.tipo === tipo.value ? COLORS.primary : COLORS.textLight }}
                >
                  {tipo.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Datos de la visita */}
        <Card>
          <Input
            label="Título de la visita *"
            value={form.titulo}
            onChange={(e) => updateForm('titulo', e.target.value)}
            placeholder="Ej: Reparación caldera, Instalación termo..."
            error={errors.titulo}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha *"
              type="date"
              value={form.fecha}
              onChange={(e) => updateForm('fecha', e.target.value)}
              error={errors.fecha}
            />
            <Input
              label="Hora"
              type="time"
              value={form.hora}
              onChange={(e) => updateForm('hora', e.target.value)}
            />
          </div>

          <Input
            label="📋 Qué hay que hacer (descripción)"
            textarea
            value={form.descripcion}
            onChange={(e) => updateForm('descripcion', e.target.value)}
            placeholder="Describe los detalles del trabajo: problema reportado, materiales necesarios, etc."
          />
        </Card>

        {/* Selector de cliente */}
        <Card>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Cliente
          </label>

          {/* Toggle existente/nuevo */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setClienteMode('existente')}
              className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all
                ${clienteMode === 'existente' 
                  ? 'border-primary bg-blue-50' 
                  : 'border-gray-200'}`}
            >
              <Users size={18} color={clienteMode === 'existente' ? COLORS.primary : COLORS.textLight} />
              <span 
                className="text-sm font-medium"
                style={{ color: clienteMode === 'existente' ? COLORS.primary : COLORS.textLight }}
              >
                Existente
              </span>
            </button>
            <button
              onClick={() => setClienteMode('nuevo')}
              className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all
                ${clienteMode === 'nuevo' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200'}`}
            >
              <Plus size={18} color={clienteMode === 'nuevo' ? COLORS.secondary : COLORS.textLight} />
              <span 
                className="text-sm font-medium"
                style={{ color: clienteMode === 'nuevo' ? COLORS.secondary : COLORS.textLight }}
              >
                Nuevo
              </span>
            </button>
          </div>

          {/* Contenido según modo */}
          {clienteMode === 'existente' ? (
            <div>
              <div 
                className={`flex items-center bg-white border rounded-xl px-4 py-3
                  ${errors.cliente_id ? 'border-red-400' : 'border-gray-200'}`}
              >
                <User size={20} className="text-gray-400" />
                <select
                  value={form.cliente_id}
                  onChange={(e) => updateForm('cliente_id', e.target.value)}
                  className="flex-1 ml-3 outline-none appearance-none bg-transparent"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellidos} - {c.telefono}
                    </option>
                  ))}
                </select>
                <ChevronDown size={20} className="text-gray-400" />
              </div>
              {errors.cliente_id && (
                <p className="text-xs mt-1 text-red-500">{errors.cliente_id}</p>
              )}
              {clientes.length === 0 && !loadingClientes && (
                <p className="text-xs mt-2 text-center text-gray-500">
                  No hay clientes. Selecciona "Nuevo" para crear uno.
                </p>
              )}
            </div>
          ) : (
            <div 
              className="p-4 rounded-xl"
              style={{ backgroundColor: `${COLORS.secondary}10`, border: `1px dashed ${COLORS.secondary}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Plus size={16} color={COLORS.secondary} />
                <span className="text-sm font-medium" style={{ color: COLORS.secondary }}>
                  Datos del nuevo cliente
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={nuevoCliente.nombre}
                    onChange={(e) => updateNuevoCliente('nombre', e.target.value)}
                    placeholder="Nombre *"
                    className={`w-full p-3 rounded-lg border outline-none
                      ${errors.nuevo_nombre ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.nuevo_nombre && (
                    <p className="text-xs mt-1 text-red-500">{errors.nuevo_nombre}</p>
                  )}
                </div>
                <input
                  type="text"
                  value={nuevoCliente.apellidos}
                  onChange={(e) => updateNuevoCliente('apellidos', e.target.value)}
                  placeholder="Apellidos"
                  className="w-full p-3 rounded-lg border border-gray-200 outline-none"
                />
                <div>
                  <input
                    type="tel"
                    value={nuevoCliente.telefono}
                    onChange={(e) => updateNuevoCliente('telefono', e.target.value)}
                    placeholder="Teléfono *"
                    className={`w-full p-3 rounded-lg border outline-none
                      ${errors.nuevo_telefono ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.nuevo_telefono && (
                    <p className="text-xs mt-1 text-red-500">{errors.nuevo_telefono}</p>
                  )}
                </div>
                <input
                  type="text"
                  value={nuevoCliente.ciudad}
                  onChange={(e) => updateNuevoCliente('ciudad', e.target.value)}
                  placeholder="Ciudad / Dirección"
                  className="w-full p-3 rounded-lg border border-gray-200 outline-none"
                />
              </div>
              
              <p className="text-xs mt-3 text-center" style={{ color: COLORS.secondary }}>
                ✓ El cliente se guardará automáticamente al crear la visita
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
