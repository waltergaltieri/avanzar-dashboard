# Escáner QR - Sistema de Check-in

## Descripción
Nueva funcionalidad que permite registrar el ingreso de invitados mediante el escaneo de códigos QR desde el navegador web, optimizada para dispositivos móviles.

## Características Principales

### 🎯 Funcionalidad Core
- **Escaneo automático**: Detección instantánea de códigos QR usando la cámara del dispositivo
- **Registro en tiempo real**: Actualización inmediata en la base de datos al escanear
- **Validación de invitados**: Verificación automática del código de entrada
- **Prevención de duplicados**: Control para evitar registros múltiples del mismo invitado

### 📱 Optimización Móvil
- **Responsive design**: Interfaz adaptada para pantallas pequeñas
- **Cámara trasera**: Preferencia automática por la cámara trasera en móviles
- **Permisos de cámara**: Manejo inteligente de permisos del navegador
- **Experiencia táctil**: Botones y controles optimizados para touch

### 🎨 Interfaz de Usuario
- **Diseño intuitivo**: Interfaz clara con instrucciones paso a paso
- **Feedback visual**: Indicadores de estado y resultados del escaneo
- **Marco de escaneo**: Guía visual animada para posicionar el código QR
- **Mensajes informativos**: Retroalimentación clara sobre el resultado del escaneo

## Componentes Implementados

### 1. QRScanner.tsx
Componente modal principal que maneja:
- Acceso a la cámara del dispositivo
- Procesamiento de códigos QR usando @zxing/library
- Actualización de la base de datos
- Manejo de errores y estados

### 2. ScannerPage.tsx
Página principal del escáner que incluye:
- Botón de inicio del escáner
- Instrucciones de uso
- Información sobre características
- Consejos para mejor escaneo

### 3. Estilos CSS (scanner.css)
Optimizaciones específicas para:
- Experiencia móvil mejorada
- Animaciones del marco de escaneo
- Estados de carga y feedback visual
- Accesibilidad

## Flujo de Funcionamiento

### 1. Acceso al Escáner
- Navegación desde el menú lateral: "Escanear QR"
- Acceso rápido desde el Dashboard (cuando hay invitados confirmados)

### 2. Proceso de Escaneo
1. **Iniciar**: Usuario presiona "Iniciar Escáner"
2. **Permisos**: El navegador solicita acceso a la cámara
3. **Escaneo**: La cámara se activa con marco de guía visual
4. **Detección**: Reconocimiento automático del código QR
5. **Procesamiento**: Validación del código en la base de datos
6. **Registro**: Actualización de fecha/hora de ingreso
7. **Confirmación**: Mensaje de éxito con nombre del invitado

### 3. Validaciones
- **Código válido**: Verificación en tabla `avanzar_entradas`
- **No duplicado**: Control de ingresos previos
- **Datos completos**: Actualización de `fecha_ingreso`, `hora_ingreso` y `escaner`

## Integración con Base de Datos

### Campos Actualizados
```sql
UPDATE avanzar_entradas SET
  fecha_ingreso = 'YYYY-MM-DD',
  hora_ingreso = 'HH:MM:SS',
  escaner = 'QR Scanner Web'
WHERE codigo_entrada = '[codigo_escaneado]'
```

### Estados del Invitado
- **Pendiente**: Sin fecha/hora de ingreso
- **Confirmado**: Con confirmación pero sin ingreso
- **Asistió**: Con fecha y hora de ingreso registradas

## Tecnologías Utilizadas

### Librerías Principales
- **@zxing/library**: Procesamiento de códigos QR/barras
- **React**: Framework de interfaz de usuario
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos y responsive design

### APIs del Navegador
- **MediaDevices API**: Acceso a la cámara
- **getUserMedia**: Stream de video en tiempo real
- **Supabase**: Base de datos y actualizaciones en tiempo real

## Compatibilidad

### Navegadores Soportados
- ✅ Chrome (Android/iOS)
- ✅ Safari (iOS)
- ✅ Firefox (Android)
- ✅ Edge (Windows Mobile)

### Requisitos del Dispositivo
- Cámara funcional (trasera preferida)
- Conexión a internet
- Permisos de cámara habilitados
- JavaScript habilitado

## Consejos de Uso

### Para Mejor Rendimiento
1. **Iluminación**: Usar en lugares bien iluminados
2. **Distancia**: Mantener 15-30 cm del código QR
3. **Estabilidad**: Evitar movimientos bruscos
4. **Calidad**: Asegurar códigos QR nítidos y sin daños

### Solución de Problemas
- **Sin cámara**: Verificar permisos del navegador
- **No escanea**: Mejorar iluminación y estabilidad
- **Error de red**: Verificar conexión a internet
- **Código inválido**: Confirmar que el QR corresponde al evento

## Seguridad y Privacidad

### Medidas Implementadas
- **Acceso local**: La cámara solo se usa localmente
- **Sin almacenamiento**: No se guardan imágenes o videos
- **Validación**: Verificación de códigos contra base de datos autorizada
- **Permisos**: Solicitud explícita de acceso a cámara

## Futuras Mejoras

### Posibles Extensiones
- [ ] Modo offline con sincronización posterior
- [ ] Estadísticas de escaneo en tiempo real
- [ ] Soporte para múltiples formatos de código
- [ ] Integración con notificaciones push
- [ ] Exportación de reportes de asistencia

---

**Desarrollado por KazeCode** - [kazecode.com.ar](https://kazecode.com.ar)