import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Save, User, Phone, Mail, MapPin, Building } from 'lucide-react';
import { clientesService } from '../services/api';
import { Card, Input, Button, COLORS } from '../components/UI';

export default function ClienteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    telefono_secundario: '',
    email: '',
    direccion: '',
    ciudad: '',
    codigo_postal: '',
    provincia: '',
    tipo: 'particular',
    nif_cif: '',
    notas: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      loadCliente();
    }
  }, [id]);

  const loadCliente = async () => {
    setLoading(true);
    try {
      const cliente = await clientesService.obtener(id);
      setForm(cliente);
    } catch (error) {
      console.error('Error loading cliente:', error);
      navigate('/clientes');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      if (isEditing) {
        await clientesService.actualizar(id, form);
      } else {
        await clientesService.crear(form);
      }
      navigate('/clientes');
    } catch (error) {
      console.error('Error saving cliente:', error);
      alert('Error al guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <X size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
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
        {/* Tipo de cliente */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-800">
            Tipo de cliente
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'particular', label: 'Particular', icon: User },
              { value: 'empresa', label: 'Empresa', icon: Building },
            ].map(tipo => (
              <button
                key={tipo.value}
                onClick={() => updateForm('tipo', tipo.value)}
                className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all
                  ${form.tipo === tipo.value 
                    ? 'border-primary bg-blue-50' 
                    : 'border-gray-200 bg-white'}`}
              >
                <tipo.icon 
                  size={20} 
                  color={form.tipo === tipo.value ? COLORS.primary : COLORS.textLight} 
                />
                <span 
                  className="font-medium"
                  style={{ color: form.tipo === tipo.value ? COLORS.primary : COLORS.textLight }}
                >
                  {tipo.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Datos personales */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Datos personales</h3>
          <Input
            label="Nombre *"
            icon={User}
            value={form.nombre}
            onChange={(e) => updateForm('nombre', e.target.value)}
            placeholder="Nombre"
            error={errors.nombre}
          />
          <Input
            label={form.tipo === 'empresa' ? 'Razón social' : 'Apellidos'}
            icon={User}
            value={form.apellidos}
            onChange={(e) => updateForm('apellidos', e.target.value)}
            placeholder={form.tipo === 'empresa' ? 'Razón social' : 'Apellidos'}
          />
          {form.tipo === 'empresa' && (
            <Input
              label="NIF/CIF"
              icon={Building}
              value={form.nif_cif}
              onChange={(e) => updateForm('nif_cif', e.target.value)}
              placeholder="B12345678"
            />
          )}
        </Card>

        {/* Contacto */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Contacto</h3>
          <Input
            label="Teléfono principal *"
            icon={Phone}
            type="tel"
            value={form.telefono}
            onChange={(e) => updateForm('telefono', e.target.value)}
            placeholder="612 345 678"
            error={errors.telefono}
          />
          <Input
            label="Teléfono secundario"
            icon={Phone}
            type="tel"
            value={form.telefono_secundario}
            onChange={(e) => updateForm('telefono_secundario', e.target.value)}
            placeholder="Otro teléfono"
          />
          <Input
            label="Email"
            icon={Mail}
            type="email"
            value={form.email}
            onChange={(e) => updateForm('email', e.target.value)}
            placeholder="email@ejemplo.com"
          />
        </Card>

        {/* Dirección */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Dirección</h3>
          <Input
            label="Dirección"
            icon={MapPin}
            value={form.direccion}
            onChange={(e) => updateForm('direccion', e.target.value)}
            placeholder="Calle, número, piso..."
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ciudad"
              value={form.ciudad}
              onChange={(e) => updateForm('ciudad', e.target.value)}
              placeholder="Ciudad"
            />
            <Input
              label="C.P."
              value={form.codigo_postal}
              onChange={(e) => updateForm('codigo_postal', e.target.value)}
              placeholder="28001"
            />
          </div>
          <Input
            label="Provincia"
            value={form.provincia}
            onChange={(e) => updateForm('provincia', e.target.value)}
            placeholder="Provincia"
          />
        </Card>

        {/* Notas */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Notas internas</h3>
          <Input
            textarea
            value={form.notas}
            onChange={(e) => updateForm('notas', e.target.value)}
            placeholder="Notas privadas sobre este cliente..."
          />
        </Card>
      </div>
    </div>
  );
}
