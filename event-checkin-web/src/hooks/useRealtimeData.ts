import { useEffect, useRef, useCallback, useState } from 'react';

interface UseRealtimeDataOptions {
  interval?: number; // Intervalo en milisegundos para refrescar datos
  enabled?: boolean; // Si está habilitado el refresh automático
}

/**
 * Hook para manejar la sincronización automática de datos con detección de cambios
 * Solo ejecuta la función de fetch cuando realmente hay cambios en los datos
 * @param fetchFunction - Función que obtiene los datos y retorna los datos actuales
 * @param options - Opciones de configuración
 */
export function useRealtimeData<T>(
  fetchFunction: () => Promise<T> | T,
  options: UseRealtimeDataOptions = {}
) {
  const { interval = 30000, enabled = true } = options; // 30 segundos por defecto
  const intervalRef = useRef<number | null>(null);
  const lastDataRef = useRef<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const checkForUpdates = useCallback(async () => {
    try {
      // Crear una función temporal que no actualice el estado, solo compare
      const tempData = await fetchFunction();
      const newDataString = JSON.stringify(tempData);
      
      // Solo ejecutar la función original si los datos realmente cambiaron
      if (lastDataRef.current !== newDataString) {
        lastDataRef.current = newDataString;
        setLastUpdated(new Date());
        // Ejecutar la función original para actualizar el estado
        await fetchFunction();
        return true; // Indica que hubo cambios
      }
      return false; // No hubo cambios
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (!enabled) return;

    // Ejecutar inmediatamente
    checkForUpdates();

    // Configurar intervalo para verificar actualizaciones
    intervalRef.current = setInterval(() => {
      checkForUpdates();
    }, interval);

    // Limpiar intervalo al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkForUpdates, interval, enabled]);

  // Función para forzar actualización manual
  const refresh = useCallback(async () => {
    await fetchFunction();
    setLastUpdated(new Date());
  }, [fetchFunction]);

  return { refresh, lastUpdated };
}

/**
 * Hook para detectar cuando la ventana vuelve a tener foco
 * Útil para refrescar datos cuando el usuario vuelve a la aplicación
 */
export function useWindowFocus(callback: () => void) {
  useEffect(() => {
    const handleFocus = () => {
      callback();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [callback]);
}

/**
 * Hook para manejar datos con sincronización inteligente
 * Solo actualiza el estado cuando los datos realmente cambian
 * Evita recargas innecesarias de la UI
 */
export function useSmartRealtimeData<T>(
  fetchFunction: () => Promise<T>,
  initialState: T,
  options: UseRealtimeDataOptions = {}
): [T, () => void, Date | null, boolean] {
  const { interval = 30000, enabled = true } = options;
  const [data, setData] = useState<T>(initialState);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastDataRef = useRef<string | null>(null);
  const isInitialLoad = useRef(true);

  const checkAndUpdateData = useCallback(async () => {
    try {
      const newData = await fetchFunction();
      const newDataString = JSON.stringify(newData);
      
      // En la primera carga, siempre actualizar
      if (isInitialLoad.current) {
        lastDataRef.current = newDataString;
        setData(newData);
        setLastUpdated(new Date());
        isInitialLoad.current = false;
        return;
      }
      
      // Solo actualizar si los datos realmente cambiaron
      if (lastDataRef.current !== newDataString) {
        console.log('✅ Datos actualizados - cambios detectados');
        lastDataRef.current = newDataString;
        setData(newData);
        setLastUpdated(new Date());
        setHasChanges(true);
        
        // Resetear el indicador de cambios después de un tiempo
        setTimeout(() => setHasChanges(false), 3000);
      } else {
        console.log('⏸️ Sin cambios en los datos - no se actualiza la UI');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (!enabled) return;

    // Ejecutar inmediatamente
    checkAndUpdateData();

    // Configurar intervalo para verificar actualizaciones
    intervalRef.current = setInterval(() => {
      checkAndUpdateData();
    }, interval);

    // Limpiar intervalo al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkAndUpdateData, interval, enabled]);

  const refresh = useCallback(async () => {
    console.log('Refresh manual ejecutado');
    await checkAndUpdateData();
  }, [checkAndUpdateData]);

  return [data, refresh, lastUpdated, hasChanges];
}