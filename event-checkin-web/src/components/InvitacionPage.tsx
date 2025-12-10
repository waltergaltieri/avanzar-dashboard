import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

import { supabase, type Invitado } from '../lib/supabaseClient';

export function InvitacionPage() {
  const { codigoEntrada } = useParams<{ codigoEntrada: string }>();
  const [invitado, setInvitado] = useState<Invitado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchInvitado();
  }, [codigoEntrada]);

  async function fetchInvitado() {
    if (!codigoEntrada) {
      setError('Código de entrada no válido');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('avanzar_entradas')
        .select('*')
        .eq('codigo_entrada', codigoEntrada)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Invitación no encontrada');
      } else {
        setInvitado(data);
      }
    } catch (err) {
      setError('Invitación no encontrada');
    } finally {
      setLoading(false);
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <p className="text-gray-300">Cargando invitación...</p>
        </div>
      </div>
    );
  }

  if (error || !invitado) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center max-w-md w-full">
          <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invitación no encontrada</h1>
          <p className="text-gray-400">{error || 'El código de invitación no es válido'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold text-white">A</span>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          ¡Hola {invitado.nombre_apellido}!
        </h1>
        
        <div className="mb-6">
          <p className="text-lg text-gray-300 mb-4">
            Te esperamos en nuestro evento especial
          </p>
          <div className="bg-linear-to-r from-red-600 to-red-700 text-white p-3 rounded-lg mb-4">
            <p className="text-sm font-medium">
              🎉 ¡Estás cordialmente invitado!
            </p>
          </div>
        </div>

        <div className="mb-6 text-left bg-gray-700 border border-gray-600 p-5 rounded-lg">
          <h2 className="font-semibold text-white mb-4 flex items-center text-lg">
            <span className="bg-red-600 w-3 h-3 rounded-full mr-3"></span>
            Información del Evento
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="text-red-400 text-lg mr-3">📅</span>
              <div>
                <p className="text-white font-medium">Fecha</p>
                <p className="text-gray-300">10 de Diciembre, 2025</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-red-400 text-lg mr-3">🕒</span>
              <div>
                <p className="text-white font-medium">Hora</p>
                <p className="text-gray-300">19:00 hrs</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-red-400 text-lg mr-3">📍</span>
              <div>
                <p className="text-white font-medium">Ubicación</p>
                <p className="text-gray-300">San José 243</p>
                <p className="text-gray-300">Buenos Aires, Capital Federal</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-yellow-900/30 border border-yellow-600/50 p-4 rounded-lg">
          <p className="text-yellow-200 text-sm font-medium mb-2">
            📱 Importante para el ingreso
          </p>
          <p className="text-yellow-100 text-sm">
            Debes mostrar este código QR en la entrada del evento para poder ingresar. 
            Te recomendamos guardar esta página o tomar una captura de pantalla.
          </p>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-600">
            <QRCodeSVG 
              value={window.location.href} 
              size={256}
              level="H"
            />
          </div>
        </div>

        <div className="bg-green-900/30 border border-green-600/50 p-4 rounded-lg">
          <p className="text-green-200 text-sm font-medium mb-2">
            ✅ Tu invitación está confirmada
          </p>
          <p className="text-green-100 text-sm">
            ¡Nos vemos el 10 de diciembre a las 19:00 hrs!
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-500 text-xs mb-2">
            Avanzar Dashboard • Gestión de Eventos
          </p>
          <p className="text-gray-600 text-xs">
            Desarrollado por{' '}
            <a 
              href="https://kazecode.com.ar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              KazeCode
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
