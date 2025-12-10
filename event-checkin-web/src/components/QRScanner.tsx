import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, X, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import '../styles/scanner.css';

interface QRScannerProps {
  onClose: () => void;
}

interface ScanResult {
  success: boolean;
  message: string;
  invitado?: {
    nombre_apellido: string;
    nro: number;
  };
}

export function QRScanner({ onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  useEffect(() => {
    // Cleanup al desmontar el componente
    return () => {
      stopScanning();
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Usar cámara trasera en móviles
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          aspectRatio: { ideal: 16/9 },
          frameRate: { ideal: 30, min: 15 }
        } 
      });
      
      // Detener el stream inmediatamente, solo queríamos verificar permisos
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      return true;
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraPermission('denied');
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      return false;
    }
  };

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setError('');
      setScanResult(null);
      
      // Verificar permisos de cámara
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      setIsScanning(true);
      
      // Crear el lector de códigos
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // Obtener dispositivos de video
      const videoInputDevices = await codeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No se encontraron cámaras disponibles');
      }

      // Preferir cámara trasera en móviles
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;

      // Iniciar el escaneo
      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        async (result, error) => {
          if (result && !isProcessing) {
            const now = Date.now();
            const qrText = result.getText().trim();
            
            // Evitar múltiples lecturas del mismo código en poco tiempo
            if (now - lastScanTimeRef.current < 2000) {
              return;
            }
            
            // Validar que el código no esté vacío y tenga un formato mínimo
            if (!qrText || qrText.length < 3) {
              console.log('QR Code too short or empty:', qrText);
              return;
            }
            
            console.log('QR Code detected:', qrText);
            lastScanTimeRef.current = now;
            setIsProcessing(true);
            
            // Detener el escaneo
            stopScanning();
            
            // Procesar el código QR
            await processQRCode(qrText);
            setIsProcessing(false);
          }
          
          if (error && !(error.name === 'NotFoundException')) {
            // Solo loggear errores que no sean "no se encontró código"
            if (error.name !== 'ChecksumException' && error.name !== 'FormatException') {
              console.error('Scan error:', error);
            }
          }
        }
      );

    } catch (err) {
      // Log detallado para debugging
      console.error('❌ ERROR INICIANDO ESCÁNER:', {
        error: err,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        hasCamera: !!navigator.mediaDevices,
        permissions: cameraPermission
      });
      
      setError('Error al iniciar el escáner. Verifica los permisos de cámara.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
  };

  const processQRCode = async (qrCode: string) => {
    try {
      // El QR code debería contener el código de entrada
      let codigoEntrada = qrCode.trim();
      
      // Log del código recibido para debugging
      console.log('🔍 PROCESANDO QR:', {
        original: qrCode,
        limpio: codigoEntrada,
        longitud: codigoEntrada.length,
        timestamp: new Date().toISOString()
      });
      
      if (!codigoEntrada || codigoEntrada.length < 3) {
        setScanResult({
          success: false,
          message: 'Código QR inválido o muy corto'
        });
        return;
      }
      
      // Si el QR contiene una URL, extraer solo el código
      if (codigoEntrada.includes('/invitacion/')) {
        const parts = codigoEntrada.split('/invitacion/');
        if (parts.length > 1) {
          codigoEntrada = parts[1].split('?')[0].split('#')[0];
          console.log('📝 CÓDIGO EXTRAÍDO DE URL:', codigoEntrada);
        }
      }

      // Buscar el invitado en la base de datos
      const { data: invitado, error: searchError } = await supabase
        .from('avanzar_entradas')
        .select('*')
        .eq('codigo_entrada', codigoEntrada)
        .single();

      if (searchError || !invitado) {
        // Log para debugging
        console.error('❌ CÓDIGO NO ENCONTRADO:', {
          codigo: codigoEntrada,
          error: searchError,
          timestamp: new Date().toISOString()
        });
        
        setScanResult({
          success: false,
          message: 'Código de entrada no encontrado'
        });
        return;
      }

      // Verificar si ya ingresó
      if (invitado.fecha_ingreso && invitado.hora_ingreso) {
        // Log para debugging
        console.warn('⚠️ INGRESO DUPLICADO:', {
          invitado: invitado.nombre_apellido,
          codigo: codigoEntrada,
          ingresoAnterior: `${invitado.fecha_ingreso} ${invitado.hora_ingreso}`,
          timestamp: new Date().toISOString()
        });
        
        setScanResult({
          success: false,
          message: `${invitado.nombre_apellido} ya registró su ingreso anteriormente`,
          invitado: {
            nombre_apellido: invitado.nombre_apellido,
            nro: invitado.nro
          }
        });
        return;
      }

      // Registrar el ingreso
      const now = new Date();
      const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const hora = now.toTimeString().split(' ')[0]; // HH:MM:SS

      const { error: updateError } = await supabase
        .from('avanzar_entradas')
        .update({
          fecha_ingreso: fecha,
          hora_ingreso: hora,
          escaner: 'QR Scanner Web'
        })
        .eq('codigo_entrada', codigoEntrada);

      if (updateError) {
        console.error('❌ ERROR ACTUALIZANDO BD:', {
          codigo: codigoEntrada,
          invitado: invitado.nombre_apellido,
          error: updateError,
          timestamp: new Date().toISOString()
        });
        throw updateError;
      }

      // Log exitoso para debugging
      console.log('✅ INGRESO REGISTRADO:', {
        invitado: invitado.nombre_apellido,
        codigo: codigoEntrada,
        nro: invitado.nro,
        fecha: fecha,
        hora: hora,
        timestamp: new Date().toISOString()
      });

      setScanResult({
        success: true,
        message: `¡Bienvenido/a ${invitado.nombre_apellido}! Ingreso registrado correctamente`,
        invitado: {
          nombre_apellido: invitado.nombre_apellido,
          nro: invitado.nro
        }
      });

    } catch (err) {
      // Log detallado para debugging
      console.error('❌ ERROR PROCESANDO QR:', {
        codigo: qrCode,
        error: err,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      setScanResult({
        success: false,
        message: 'Error al procesar el código. Intenta nuevamente.'
      });
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError('');
    setIsProcessing(false);
    lastScanTimeRef.current = 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-gray-800 rounded-none md:rounded-xl w-full h-full md:max-w-md md:w-full md:max-h-[90vh] md:h-auto overflow-y-auto scanner-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 scanner-header">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Camera className="w-6 h-6 mr-2" />
            Escanear QR
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Cerrar escáner"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-4 h-full flex flex-col">
          {/* Resultado del escaneo */}
          {scanResult && (
            <div className={`mb-4 p-4 rounded-lg ${
              scanResult.success 
                ? 'bg-green-900 border border-green-700' 
                : 'bg-red-900 border border-red-700'
            }`}>
              <div className="flex items-start">
                {scanResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${
                    scanResult.success ? 'text-green-100' : 'text-red-100'
                  }`}>
                    {scanResult.message}
                  </p>
                  {scanResult.invitado && (
                    <p className="text-sm text-gray-300 mt-1">
                      Invitado #{scanResult.invitado.nro}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={resetScanner}
                className="mt-3 flex items-center text-sm text-gray-300 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Escanear otro código
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 shrink-0" />
                <p className="text-red-100">{error}</p>
              </div>
            </div>
          )}

          {/* Cámara */}
          {!scanResult && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="relative bg-black rounded-lg overflow-hidden flex-1 min-h-[300px] md:aspect-video camera-container scanner-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 mb-4">
                        Presiona "Iniciar Escaneo" para usar la cámara
                      </p>
                    </div>
                  </div>
                )}

                {/* Overlay de escaneo */}
                {isScanning && (
                  <>
                    <div className="absolute inset-0 camera-overlay"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`border-2 w-48 h-48 rounded-lg relative ${isProcessing ? 'border-yellow-500' : 'border-red-500'} scan-frame`}>
                        <div className={`absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 ${isProcessing ? 'border-yellow-500' : 'border-red-500'}`}></div>
                        <div className={`absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 ${isProcessing ? 'border-yellow-500' : 'border-red-500'}`}></div>
                        <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 ${isProcessing ? 'border-yellow-500' : 'border-red-500'}`}></div>
                        <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 ${isProcessing ? 'border-yellow-500' : 'border-red-500'}`}></div>
                        
                        {isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                            <div className="loading-spinner"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Texto de estado */}
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <p className="text-white bg-black bg-opacity-75 px-3 py-2 rounded-lg text-sm">
                        {isProcessing ? '🔄 Procesando código...' : '📱 Apunta al código QR'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Controles */}
              <div className="flex gap-3">
                {!isScanning ? (
                  <button
                    onClick={startScanning}
                    disabled={cameraPermission === 'denied'}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center scanner-button"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Iniciar Escaneo
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Detener Escaneo
                  </button>
                )}
              </div>

              {/* Instrucciones */}
              <div className="text-sm text-gray-400 space-y-2 scanner-instructions">
                <p>• Apunta la cámara hacia el código QR del invitado</p>
                <p>• Mantén el código centrado dentro del marco</p>
                <p>• Asegúrate de tener buena iluminación</p>
                <p>• Mantén el celular estable hasta que procese</p>
                <p>• El escaneo es automático (no presiones nada)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}