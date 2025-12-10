import { useState } from 'react';
import { QrCode, Camera, Users, CheckCircle } from 'lucide-react';
import { QRScanner } from './QRScanner';

export function ScannerPage() {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <QrCode className="w-8 h-8 mr-3" />
          Escanear QR
        </h1>
        <p className="text-gray-400 mt-2">
          Registra el ingreso de invitados escaneando sus códigos QR
        </p>
      </div>

      {/* Botón principal */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowScanner(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Camera className="w-6 h-6 mr-3" />
          Iniciar Escáner
        </button>
      </div>

      {/* Información y guía */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Instrucciones */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Cómo usar el escáner
          </h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start">
              <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 shrink-0">
                1
              </div>
              <p>Presiona "Iniciar Escáner" para abrir la cámara</p>
            </div>
            <div className="flex items-start">
              <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 shrink-0">
                2
              </div>
              <p>Permite el acceso a la cámara cuando el navegador lo solicite</p>
            </div>
            <div className="flex items-start">
              <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 shrink-0">
                3
              </div>
              <p>Apunta la cámara hacia el código QR del invitado</p>
            </div>
            <div className="flex items-start">
              <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 shrink-0">
                4
              </div>
              <p>El sistema registrará automáticamente el ingreso</p>
            </div>
          </div>
        </div>

        {/* Características */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Características
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-700 rounded-lg">
              <QrCode className="w-5 h-5 text-green-400 mr-3" />
              <div>
                <p className="text-white font-medium">Escaneo automático</p>
                <p className="text-gray-400 text-sm">Detección instantánea de códigos QR</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-700 rounded-lg">
              <Users className="w-5 h-5 text-blue-400 mr-3" />
              <div>
                <p className="text-white font-medium">Registro en tiempo real</p>
                <p className="text-gray-400 text-sm">Actualización inmediata en la base de datos</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-700 rounded-lg">
              <Camera className="w-5 h-5 text-purple-400 mr-3" />
              <div>
                <p className="text-white font-medium">Optimizado para móviles</p>
                <p className="text-gray-400 text-sm">Funciona desde el navegador del celular</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consejos */}
      <div className="bg-blue-900 border border-blue-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">📱 Optimizado para Celular</h3>
        <div className="bg-blue-800 border border-blue-600 rounded-lg p-4 mb-4">
          <p className="text-blue-100 font-medium mb-2">✅ Este sistema funciona perfectamente desde el navegador de tu celular</p>
          <p className="text-blue-200 text-sm">
            No necesitas descargar ninguna app. Solo abre esta página desde Chrome, Safari o cualquier navegador móvil.
          </p>
        </div>
        
        <h4 className="text-lg font-semibold text-white mb-3">💡 Consejos para un mejor escaneo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
          <div>
            <h5 className="font-medium mb-2">📸 Cámara</h5>
            <p className="text-sm text-blue-200">
              El sistema usará automáticamente la cámara trasera de tu celular para mejor calidad.
            </p>
          </div>
          <div>
            <h5 className="font-medium mb-2">💡 Iluminación</h5>
            <p className="text-sm text-blue-200">
              Asegúrate de tener buena luz. Evita reflejos directos sobre el código QR.
            </p>
          </div>
          <div>
            <h5 className="font-medium mb-2">📏 Distancia</h5>
            <p className="text-sm text-blue-200">
              Mantén el código QR a unos 15-30 cm de la cámara para mejor enfoque.
            </p>
          </div>
          <div>
            <h5 className="font-medium mb-2">🎯 Precisión</h5>
            <p className="text-sm text-blue-200">
              Mantén el dispositivo estable y centra el código dentro del marco rojo.
            </p>
          </div>
        </div>
      </div>

      {/* Modal del escáner */}
      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}