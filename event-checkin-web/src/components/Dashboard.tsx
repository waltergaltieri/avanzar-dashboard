import { useState, useCallback } from 'react';
import { 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp,
  Calendar,
  Mail,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useSmartRealtimeData, useWindowFocus } from '../hooks/useRealtimeData';

interface DashboardStats {
  totalInvitados: number;
  confirmados: number;
  pendientes: number;
  asistieron: number;
  porcentajeConfirmacion: number;
}

// Función helper para determinar el estado del invitado (igual que en InvitadosList)
function getInvitadoStatus(invitado: any): 'asistio' | 'confirmado' | 'pendiente' {
  if (invitado.fecha_ingreso && invitado.hora_ingreso) {
    return 'asistio';
  }
  // Comparación muy permisiva para el campo confirmacion
  const confirmacion = invitado.confirmacion?.toString().trim().toLowerCase();
  
  // Aceptar diferentes variaciones de "Ok"
  if (confirmacion === 'ok' || confirmacion === 'confirmado' || confirmacion === 'si' || confirmacion === 'sí') {
    return 'confirmado';
  }
  return 'pendiente';
}

export function Dashboard() {
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (): Promise<DashboardStats> => {
    try {
      const { data, error } = await supabase
        .from('avanzar_entradas')
        .select('confirmacion, fecha_ingreso, hora_ingreso');

      if (error) throw error;

      const total = data?.length || 0;
      const confirmados = data?.filter(item => getInvitadoStatus(item) === 'confirmado').length || 0;
      const pendientes = data?.filter(item => getInvitadoStatus(item) === 'pendiente').length || 0;
      const asistieron = data?.filter(item => getInvitadoStatus(item) === 'asistio').length || 0;
      const porcentaje = total > 0 ? Math.round((confirmados / total) * 100) : 0;

      const newStats = {
        totalInvitados: total,
        confirmados,
        pendientes,
        asistieron,
        porcentajeConfirmacion: porcentaje
      };

      setLoading(false);
      return newStats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
      throw error;
    }
  }, []);

  // Usar el hook inteligente que solo actualiza cuando hay cambios reales
  const [stats, refresh, lastUpdated, hasChanges] = useSmartRealtimeData(
    fetchStats,
    {
      totalInvitados: 0,
      confirmados: 0,
      pendientes: 0,
      asistieron: 0,
      porcentajeConfirmacion: 0
    },
    { 
      interval: 30000, // 30 segundos
      enabled: true 
    }
  );

  // Refrescar cuando la ventana vuelve a tener foco
  useWindowFocus(refresh);

  // Datos reales para gráficos
  const confirmacionData = [
    { name: 'Confirmados', value: stats.confirmados, color: '#16a34a' },
    { name: 'Pendientes', value: stats.pendientes, color: '#eab308' },
    { name: 'Asistieron', value: stats.asistieron, color: '#2563eb' }
  ].filter(item => item.value > 0); // Solo mostrar categorías con datos

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Resumen del evento y estadísticas</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Invitados"
          value={stats.totalInvitados}
          icon={Users}
          color="bg-gray-600"
        />
        <StatCard
          title="Confirmados"
          value={stats.confirmados}
          icon={UserCheck}
          color="bg-green-600"
          subtitle={`${stats.porcentajeConfirmacion}% del total`}
        />
        <StatCard
          title="Pendientes"
          value={stats.pendientes}
          icon={Clock}
          color="bg-yellow-600"
        />
        <StatCard
          title="Asistieron"
          value={stats.asistieron}
          icon={TrendingUp}
          color="bg-blue-600"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de confirmaciones */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Estado de Confirmaciones</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={confirmacionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {confirmacionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {confirmacionData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-300 text-sm">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Horarios de ingreso - Solo disponible después del evento */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Horarios de Ingreso</h3>
          {stats.asistieron > 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-400 text-center">
                Gráfico de horarios disponible<br />
                <span className="text-sm">Datos reales de asistencia</span>
              </p>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Información disponible después del evento</p>
                <p className="text-gray-500 text-sm">
                  Los horarios de ingreso se mostrarán una vez que los invitados comiencen a registrarse
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas de asistencia - Solo disponible después del evento */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Análisis de Asistencia</h3>
          {stats.asistieron > 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-white text-2xl font-bold mb-2">{stats.asistieron}</p>
                <p className="text-gray-400 mb-2">Personas han ingresado</p>
                <p className="text-gray-500 text-sm">
                  {Math.round((stats.asistieron / stats.totalInvitados) * 100)}% de asistencia
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Estadísticas disponibles el día del evento</p>
                <p className="text-gray-500 text-sm">
                  Aquí verás el análisis de asistencia en tiempo real durante el evento
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Información del evento */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Información del Evento</h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-700 rounded-lg">
              <Calendar className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <p className="text-white font-medium">Fecha del Evento</p>
                <p className="text-gray-400 text-sm">10 de Diciembre, 2025 - 19:00 hrs</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-700 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <p className="text-white font-medium">Estado de Confirmaciones</p>
                <p className="text-gray-400 text-sm">
                  {stats.confirmados} confirmados, {stats.pendientes} pendientes
                </p>
              </div>
            </div>
            {stats.asistieron > 0 && (
              <div className="flex items-center p-4 bg-blue-700 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-300 mr-3" />
                <div>
                  <p className="text-white font-medium">Asistencia en Vivo</p>
                  <p className="text-blue-200 text-sm">
                    {stats.asistieron} personas han ingresado al evento
                  </p>
                </div>
              </div>
            )}
            {stats.pendientes > 0 && (
              <div className="flex items-center p-4 bg-yellow-700 rounded-lg">
                <Mail className="w-5 h-5 text-yellow-300 mr-3" />
                <div>
                  <p className="text-white font-medium">Recordatorios Pendientes</p>
                  <p className="text-yellow-200 text-sm">
                    {stats.pendientes} invitados aún no han confirmado
                  </p>
                </div>
              </div>
            )}
            
            {/* Créditos de desarrollo */}
            <div className="flex items-center p-4 bg-gray-900 rounded-lg border border-gray-600">
              <div className="bg-red-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">K</span>
              </div>
              <div>
                <p className="text-white font-medium">Sistema desarrollado por</p>
                <a 
                  href="https://kazecode.com.ar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 text-sm transition-colors font-medium"
                >
                  KazeCode - kazecode.com.ar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}