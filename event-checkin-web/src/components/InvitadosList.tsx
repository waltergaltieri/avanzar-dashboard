import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Mail, 
  ExternalLink, 
  UserCheck, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Copy,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { supabase, type Invitado } from '../lib/supabaseClient';
import { filterInvitados } from '../utils/filterUtils';
import { useSmartRealtimeData, useWindowFocus } from '../hooks/useRealtimeData';

const ITEMS_PER_PAGE = 10;

// Función para determinar el estado del invitado
function getInvitadoStatus(invitado: Invitado): 'asistio' | 'confirmado' | 'pendiente' {
  // Si ya tiene fecha y hora de ingreso, asistió al evento
  if (invitado.fecha_ingreso && invitado.hora_ingreso) {
    return 'asistio';
  }
  // Si confirmó su asistencia - comparación muy permisiva
  const confirmacion = invitado.confirmacion?.toString().trim().toLowerCase();
  
  
  // Aceptar diferentes variaciones de "Ok"
  if (confirmacion === 'ok' || confirmacion === 'confirmado' || confirmacion === 'si' || confirmacion === 'sí') {
    return 'confirmado';
  }
  // Si está pendiente de confirmación
  return 'pendiente';
}

export function InvitadosList() {
  const [filteredInvitados, setFilteredInvitados] = useState<Invitado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmado' | 'pendiente' | 'asistio'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInvitados = useCallback(async (): Promise<Invitado[]> => {
    try {
      const { data, error } = await supabase
        .from('avanzar_entradas')
        .select('*')
        .order('nombre_apellido');

      if (error) throw error;
      
      setLoading(false);
      return data || [];
    } catch (err) {
      setError('Error al cargar los invitados');
      setLoading(false);
      throw err;
    }
  }, []);

  // Usar el hook inteligente que solo actualiza cuando hay cambios reales
  const [invitados, refresh, lastUpdated, hasChanges] = useSmartRealtimeData(
    fetchInvitados,
    [],
    { 
      interval: 30000, // 30 segundos
      enabled: true 
    }
  );

  // Refrescar cuando la ventana vuelve a tener foco
  useWindowFocus(refresh);

  useEffect(() => {
    filterInvitadosData();
  }, [invitados, searchTerm, statusFilter]);

  function filterInvitadosData() {
    let filtered = filterInvitados(invitados, searchTerm);

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invitado => {
        const status = getInvitadoStatus(invitado);
        return status === statusFilter;
      });
    }

    setFilteredInvitados(filtered);
    setCurrentPage(1);
  }

  async function copyInvitationLink(codigoEntrada: string) {
    const url = `${window.location.origin}/invitacion/${codigoEntrada}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(codigoEntrada);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      alert('Error al copiar el enlace');
    }
  }

  // Paginación
  const totalPages = Math.ceil(filteredInvitados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInvitados = filteredInvitados.slice(startIndex, endIndex);

  const stats = {
    total: invitados.length,
    confirmado: invitados.filter(i => getInvitadoStatus(i) === 'confirmado').length,
    pendiente: invitados.filter(i => getInvitadoStatus(i) === 'pendiente').length,
    asistio: invitados.filter(i => getInvitadoStatus(i) === 'asistio').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Invitados</h1>
          <p className="text-gray-400 mt-2">Administra y envía invitaciones a los participantes</p>
          {lastUpdated && (
            <p className="text-gray-500 text-sm mt-1">
              Última actualización: {lastUpdated.toLocaleTimeString()}
              {hasChanges && <span className="text-green-400 ml-2">• Datos actualizados</span>}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={refresh}
          className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          title="Actualizar datos"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Invitados</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-600">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Confirmados</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{stats.confirmado}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-600">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pendiente}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Asistieron</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{stats.asistio}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-600">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              title="Filtrar por estado"
              aria-label="Filtrar invitados por estado"
            >
              <option value="all">Todos los estados</option>
              <option value="confirmado">Confirmados</option>
              <option value="pendiente">Pendientes</option>
              <option value="asistio">Asistieron</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de invitados */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Invitado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentInvitados.map((invitado) => (
                <tr key={invitado.id || invitado.nro} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                        <span className="text-sm font-medium text-white">
                          {invitado.nombre_apellido.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {invitado.nombre_apellido}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300 font-mono">
                      {invitado.codigo_entrada}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const status = getInvitadoStatus(invitado);
                      
                      if (status === 'asistio') {
                        return (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-900/50 text-blue-300 border border-blue-500">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Asistió
                          </span>
                        );
                      }
                      
                      if (status === 'confirmado') {
                        return (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-900/50 text-green-300 border border-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Confirmado
                          </span>
                        );
                      }
                      
                      return (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-900/50 text-yellow-300 border border-yellow-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/invitacion/${invitado.codigo_entrada}`}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Ver invitación"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => copyInvitationLink(invitado.codigo_entrada)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Copiar enlace"
                      >
                        {copiedId === invitado.codigo_entrada ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Enviar por email"
                        aria-label="Enviar invitación por email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredInvitados.length)} de {filteredInvitados.length} invitados
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === page
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Página siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredInvitados.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
          <UserCheck className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No se encontraron invitados</h3>
          <p className="text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay invitados registrados aún'
            }
          </p>
        </div>
      )}
    </div>
  );
}

