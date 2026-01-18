import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, Plus, Phone, MapPin, ChevronRight, Users } from 'lucide-react';
import { clientesService } from '../services/api';
import Layout from '../components/Layout';
import { Card, Loader, EmptyState, FAB, Avatar, COLORS } from '../components/UI';

export default function ClientesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');

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
      setLoading(false);
    }
  };

  const filtered = clientes.filter(c => 
    `${c.nombre} ${c.apellidos}`.toLowerCase().includes(search.toLowerCase()) ||
    c.telefono?.includes(search)
  );

  return (
    <Layout>
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/')}>
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1">
          Clientes ({clientes.length})
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 ml-3 outline-none"
            placeholder="Buscar por nombre o teléfono..."
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={18} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? 'Sin resultados' : 'No hay clientes'}
            message={search ? 'Prueba con otra búsqueda' : 'Añade tu primer cliente'}
            action={!search && 'Añadir cliente'}
            onAction={() => navigate('/clientes/nuevo')}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(cliente => (
              <Card 
                key={cliente.id} 
                onClick={() => navigate(`/clientes/${cliente.id}`)}
              >
                <div className="flex items-center gap-3">
                  <Avatar 
                    name={`${cliente.nombre} ${cliente.apellidos || ''}`}
                    tipo={cliente.tipo}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {cliente.nombre} {cliente.apellidos}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-500">{cliente.telefono}</span>
                    </div>
                    {cliente.ciudad && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-500">{cliente.ciudad}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: cliente.tipo === 'empresa' ? `${COLORS.purple}20` : `${COLORS.primary}20`,
                        color: cliente.tipo === 'empresa' ? COLORS.purple : COLORS.primary
                      }}
                    >
                      {cliente.tipo === 'empresa' ? 'Empresa' : 'Particular'}
                    </span>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <FAB icon={Plus} onClick={() => navigate('/clientes/nuevo')} />
    </Layout>
  );
}
