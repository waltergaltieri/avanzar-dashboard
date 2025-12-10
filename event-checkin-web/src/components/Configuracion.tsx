import { useState } from 'react';
import { 
  Save, 
  Calendar, 
  MapPin, 
  Bell, 
  Users, 
  Shield,
  Palette,
  Globe
} from 'lucide-react';

interface EventConfig {
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  descripcion: string;
  emailReminder: boolean;
  reminderDays: number;
  maxInvitados: number;
  requiereConfirmacion: boolean;
}

export function Configuracion() {
  const [config, setConfig] = useState<EventConfig>({
    nombre: 'Evento Avanzar 2025',
    fecha: '2025-01-15',
    hora: '19:00',
    lugar: 'Centro de Convenciones',
    descripcion: 'Evento especial de la empresa Avanzar',
    emailReminder: true,
    reminderDays: 3,
    maxInvitados: 500,
    requiereConfirmacion: true
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (field: keyof EventConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Configuración</h1>
        <p className="text-gray-400 mt-2">Administra la configuración del evento y la aplicación</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuración del Evento */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center mb-6">
              <Calendar className="w-6 h-6 text-red-500 mr-3" />
              <h2 className="text-xl font-semibold text-white">Información del Evento</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Evento
                </label>
                <input
                  type="text"
                  value={config.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ingresa el nombre del evento"
                  aria-label="Nombre del evento"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={config.fecha}
                    onChange={(e) => handleChange('fecha', e.target.value)}
                    aria-label="Fecha del evento"
                    title="Selecciona la fecha del evento"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={config.hora}
                    onChange={(e) => handleChange('hora', e.target.value)}
                    aria-label="Hora del evento"
                    title="Selecciona la hora del evento"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lugar
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={config.lugar}
                    onChange={(e) => handleChange('lugar', e.target.value)}
                    placeholder="Ingresa la ubicación del evento"
                    aria-label="Lugar del evento"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={config.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  rows={3}
                  placeholder="Describe los detalles del evento"
                  aria-label="Descripción del evento"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Configuración de Notificaciones */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center mb-6">
              <Bell className="w-6 h-6 text-red-500 mr-3" />
              <h2 className="text-xl font-semibold text-white">Notificaciones</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Recordatorios por Email</h3>
                  <p className="text-gray-400 text-sm">Enviar recordatorios automáticos a los invitados</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.emailReminder}
                    onChange={(e) => handleChange('emailReminder', e.target.checked)}
                    aria-label="Activar recordatorios por email"
                    title="Habilitar o deshabilitar recordatorios automáticos por email"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {config.emailReminder && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Días antes del evento
                  </label>
                  <select
                    value={config.reminderDays}
                    onChange={(e) => handleChange('reminderDays', parseInt(e.target.value))}
                    aria-label="Días antes del evento para recordatorio"
                    title="Selecciona cuántos días antes enviar el recordatorio"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value={1}>1 día antes</option>
                    <option value={3}>3 días antes</option>
                    <option value={7}>1 semana antes</option>
                    <option value={14}>2 semanas antes</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Configuración de Invitados */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-red-500 mr-3" />
              <h2 className="text-xl font-semibold text-white">Gestión de Invitados</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Máximo de Invitados
                </label>
                <input
                  type="number"
                  value={config.maxInvitados}
                  onChange={(e) => handleChange('maxInvitados', parseInt(e.target.value))}
                  min="1"
                  placeholder="Ej: 500"
                  aria-label="Máximo número de invitados"
                  title="Ingresa el número máximo de invitados permitidos"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Requiere Confirmación</h3>
                  <p className="text-gray-400 text-sm">Los invitados deben confirmar su asistencia</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.requiereConfirmacion}
                    onChange={(e) => handleChange('requiereConfirmacion', e.target.checked)}
                    aria-label="Requerir confirmación de asistencia"
                    title="Los invitados deben confirmar su asistencia"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Acciones rápidas */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold rounded-lg transition-colors"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>

              {saved && (
                <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-center">
                  ✓ Configuración guardada
                </div>
              )}
            </div>
          </div>

          {/* Información del sistema */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sistema</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Versión:</span>
                <span className="text-white">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Base de datos:</span>
                <span className="text-green-400">Conectada</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Última actualización:</span>
                <span className="text-white">Hoy</span>
              </div>
            </div>
          </div>

          {/* Configuraciones adicionales */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Preferencias</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Palette className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-white text-sm">Tema Oscuro</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    aria-label="Tema oscuro activado"
                    title="El tema oscuro está siempre activado"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-red-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-white text-sm">Idioma</span>
                </div>
                <select 
                  aria-label="Seleccionar idioma"
                  title="Cambiar idioma de la aplicación"
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option>Español</option>
                  <option>English</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-white text-sm">Modo Seguro</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={true}
                    aria-label="Modo seguro activado"
                    title="El modo seguro está activado para mayor protección"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-red-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}