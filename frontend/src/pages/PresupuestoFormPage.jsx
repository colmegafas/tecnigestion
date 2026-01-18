import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Save, User, Plus, ChevronDown, Trash2 } from 'lucide-react';
import { presupuestosService, clientesService } from '../services/api';
import { Card, Input, Button, Toggle, COLORS } from '../components/UI';

export default function PresupuestoFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('cliente');

  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  
  const [form, setForm] = useState({
    cliente_id: preselectedClientId || '',
    titulo: '',
    descripcion: '',
    aplicar_iva: true,
    iva_porcentaje: 21,
    fecha_validez: '',
    notas: '',
    lineas: [{ concepto: 'Mano de obra', descripcion: '', cantidad: 1, precio_unitario: 0 }]
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

  const addLinea = () => {
    setForm(prev => ({
      ...prev,
      lineas: [...prev.lineas, { concepto: '', descripcion: '', cantidad: 1, precio_unitario: 0 }]
    }));
  };

  const removeLinea = (index) => {
    if (form.lineas.length > 1) {
      setForm(prev => ({
        ...prev,
        lineas: prev.lineas.filter((_, i) => i !== index)
      }));
    }
  };

  const updateLinea = (index, field, value) => {
    setForm(prev => {
      const newLineas = [...prev.lineas];
      newLineas[index] = { ...newLineas[index], [field]: value };
      return { ...prev, lineas: newLineas };
    });
  };

  const subtotal = form.lineas.reduce((sum, l) => sum + (l.cantidad * l.precio_unitario), 0);
  const iva = form.aplicar_iva ? subtotal * (form.iva_porcentaje / 100) : 0;
  const total = subtotal + iva;

  const validate = () => {
    const newErrors = {};
    if (!form.titulo.trim()) newErrors.titulo = 'El título es obligatorio';
    if (!form.cliente_id) newErrors.cliente_id = 'Selecciona un cliente';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await presupuestosService.crear({
        cliente_id: parseInt(form.cliente_id),
        titulo: form.titulo,
        descripcion: form.descripcion,
        aplicar_iva: form.aplicar_iva,
        iva_porcentaje: form.iva_porcentaje,
        fecha_validez: form.fecha_validez || null,
        notas: form.notas,
        lineas: form.lineas.map(l => ({
          concepto: l.concepto,
          descripcion: l.descripcion,
          cantidad: parseFloat(l.cantidad) || 0,
          precio_unitario: parseFloat(l.precio_unitario) || 0
        }))
      });
      navigate('/presupuestos');
    } catch (error) {
      console.error('Error saving presupuesto:', error);
      alert('Error al guardar el presupuesto');
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
          <h1 className="text-xl font-bold text-gray-800">Nuevo Presupuesto</h1>
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

      <div className="p-4 pb-32 space-y-4">
        {/* Datos básicos */}
        <Card>
          <Input
            label="Título *"
            value={form.titulo}
            onChange={(e) => updateForm('titulo', e.target.value)}
            placeholder="Ej: Instalación aire acondicionado"
            error={errors.titulo}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Cliente *
            </label>
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
                    {c.nombre} {c.apellidos}
                  </option>
                ))}
              </select>
              <ChevronDown size={20} className="text-gray-400" />
            </div>
            {errors.cliente_id && (
              <p className="text-xs mt-1 text-red-500">{errors.cliente_id}</p>
            )}
          </div>

          <Input
            label="Descripción"
            textarea
            value={form.descripcion}
            onChange={(e) => updateForm('descripcion', e.target.value)}
            placeholder="Descripción del trabajo..."
          />
        </Card>

        {/* Líneas de detalle */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Líneas de detalle</h3>
            <button
              onClick={addLinea}
              className="text-sm font-medium flex items-center gap-1 px-3 py-1 rounded-lg"
              style={{ color: COLORS.primary, backgroundColor: `${COLORS.primary}20` }}
            >
              <Plus size={16} /> Añadir
            </button>
          </div>

          {form.lineas.map((linea, i) => (
            <div key={i} className="mb-4 p-3 bg-gray-50 rounded-xl relative">
              {form.lineas.length > 1 && (
                <button
                  onClick={() => removeLinea(i)}
                  className="absolute top-2 right-2 p-1"
                >
                  <Trash2 size={16} color={COLORS.error} />
                </button>
              )}
              
              <input
                type="text"
                value={linea.concepto}
                onChange={(e) => updateLinea(i, 'concepto', e.target.value)}
                placeholder="Concepto"
                className="w-full mb-2 p-2 rounded-lg border border-gray-200 outline-none"
              />
              
              <div className="flex gap-2">
                <div className="w-20">
                  <label className="text-xs text-gray-500">Cantidad</label>
                  <input
                    type="number"
                    value={linea.cantidad}
                    onChange={(e) => updateLinea(i, 'cantidad', e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-200 outline-none text-center"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Precio €</label>
                  <input
                    type="number"
                    value={linea.precio_unitario}
                    onChange={(e) => updateLinea(i, 'precio_unitario', e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-200 outline-none"
                  />
                </div>
                <div className="w-24 text-right">
                  <label className="text-xs text-gray-500">Total</label>
                  <p className="p-2 font-semibold" style={{ color: COLORS.primary }}>
                    {(linea.cantidad * linea.precio_unitario).toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Card>

        {/* Opción IVA */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Aplicar IVA (21%)</p>
              <p className="text-sm text-gray-500">Incluir impuestos en el presupuesto</p>
            </div>
            <Toggle
              checked={form.aplicar_iva}
              onChange={(checked) => updateForm('aplicar_iva', checked)}
            />
          </div>
        </Card>

        {/* Totales */}
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-800">{subtotal.toFixed(2)} €</span>
          </div>
          {form.aplicar_iva ? (
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">IVA ({form.iva_porcentaje}%)</span>
              <span className="text-gray-800">{iva.toFixed(2)} €</span>
            </div>
          ) : (
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">IVA</span>
              <span style={{ color: COLORS.warning }}>No aplicado</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-blue-200">
            <span className="font-bold text-lg text-gray-800">TOTAL</span>
            <span className="text-2xl font-bold" style={{ color: COLORS.primary }}>
              {total.toFixed(2)} €
            </span>
          </div>
        </Card>

        {/* Notas */}
        <Card>
          <Input
            label="Notas (visible en el presupuesto)"
            textarea
            value={form.notas}
            onChange={(e) => updateForm('notas', e.target.value)}
            placeholder="Condiciones, garantías, etc."
          />
        </Card>
      </div>
    </div>
  );
}
