# Documento de Diseño - Sistema de Gestión de Entradas

## Overview

Sistema de gestión de entradas para eventos compuesto por tres componentes principales:

1. **Aplicación Web (React + Vite)**: Interfaz para visualizar invitados y generar invitaciones con QR
2. **API de Check-in (Node + Express)**: Endpoint para registrar ingresos
3. **Aplicación Móvil (Expo)**: Scanner de QR para control de acceso

Todos los componentes se conectan a una base de datos Supabase compartida sin autenticación, priorizando simplicidad y rapidez de implementación.

## Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (React + Vite) │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         v              v
┌─────────────┐  ┌──────────────┐
│  Supabase   │  │  API Check-in│
│  (Direct)   │  │ (Node/Express)│
└─────────────┘  └──────┬───────┘
         ^               │
         │               │
         └───────┬───────┘
                 │
                 v
         ┌──────────────┐
         │  Supabase    │
         │  PostgreSQL  │
         └──────────────┘
                 ^
                 │
         ┌───────┴──────┐
         │  Expo App    │
         │ (via API)    │
         └──────────────┘
```

### Flujo de Datos

1. **Consulta de invitados**: Web → Supabase (lectura directa)
2. **Generación de invitación**: Web → Supabase (lectura) → Renderiza QR
3. **Escaneo y check-in**: Móvil → API → Supabase (actualización)

## Components and Interfaces

### 1. Supabase Client

**Archivo**: `src/lib/supabaseClient.ts` (web) y `lib/supabaseClient.ts` (móvil)

```typescript
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface Invitado {
  nro: number;
  nombre_apellido: string;
  ingreso: string;
  confirmacion: string;
  gastos_pendientes: string;
  monto: number;
  codigo_entrada: string; // UUID
  escaner: string | null;
  fecha_ingreso: string | null; // date
  hora_ingreso: string | null; // time
}
```

### 2. Web - Lista de Invitados

**Componente**: `InvitadosList.tsx`

```typescript
interface InvitadosListProps {}

interface InvitadosListState {
  invitados: Invitado[];
  searchTerm: string;
  loading: boolean;
}
```

**Funciones**:
- `fetchInvitados()`: Obtiene todos los registros de `avanzar_entradas`
- `filterInvitados(searchTerm: string)`: Filtra por nombre_apellido
- `handleVerInvitacion(codigoEntrada: string)`: Navega a `/invitacion/:codigoEntrada`

### 3. Web - Página de Invitación

**Componente**: `InvitacionPage.tsx`

```typescript
interface InvitacionPageProps {
  codigoEntrada: string; // from URL params
}

interface InvitacionData {
  nombre_apellido: string;
  codigo_entrada: string;
}
```

**Funciones**:
- `fetchInvitado(codigoEntrada: string)`: Obtiene datos del invitado
- `generateQRUrl()`: Retorna `window.location.href`
- `copyToClipboard()`: Copia URL al portapapeles

### 4. API de Check-in

**Endpoint**: `POST /api/check-in`

```typescript
interface CheckInRequest {
  codigo_entrada: string; // UUID
  escaner: string;
}

interface CheckInResponseOk {
  status: "ok";
  nombre_apellido: string;
  fecha_ingreso: string;
  hora_ingreso: string;
}

interface CheckInResponseYaRegistrado {
  status: "ya_registrado";
  nombre_apellido: string;
  fecha_ingreso: string;
  hora_ingreso: string;
}

interface CheckInResponseError {
  status: "error";
  message: "codigo_invalido";
}

type CheckInResponse = CheckInResponseOk | CheckInResponseYaRegistrado | CheckInResponseError;
```

**Lógica**:
1. Validar que `codigo_entrada` y `escaner` estén presentes
2. Buscar registro en Supabase
3. Si no existe → error
4. Si existe y `fecha_ingreso` es NULL → actualizar y retornar "ok"
5. Si existe y `fecha_ingreso` no es NULL → retornar "ya_registrado"

### 5. Móvil - Scanner QR

**Componente**: `ScannerScreen.tsx`

```typescript
interface ScannerState {
  hasPermission: boolean;
  scanned: boolean;
  result: CheckInResponse | null;
}
```

**Funciones**:
- `requestCameraPermission()`: Solicita permisos de cámara
- `handleBarCodeScanned(data: string)`: Extrae codigo_entrada de URL
- `performCheckIn(codigoEntrada: string)`: Llama a API
- `displayResult(response: CheckInResponse)`: Muestra resultado en pantalla

## Data Models

### Tabla: avanzar_entradas

```sql
CREATE TABLE avanzar_entradas (
  nro INTEGER PRIMARY KEY,
  nombre_apellido TEXT,
  ingreso TEXT,
  confirmacion TEXT,
  gastos_pendientes TEXT,
  monto NUMERIC(10,2),
  codigo_entrada UUID,
  escaner TEXT,
  fecha_ingreso DATE,
  hora_ingreso TIME
);
```

**Índices recomendados**:
- `codigo_entrada` (para búsquedas rápidas en check-in)

**Constraints**:
- `codigo_entrada` debe ser único (ya implementado como UUID)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Filtrado de búsqueda es inclusivo

*Para cualquier* lista de invitados y término de búsqueda, todos los resultados filtrados deben tener un nombre_apellido que contenga el término de búsqueda (case-insensitive).

**Validates: Requirements 1.3**

### Property 2: QR contiene URL completa

*Para cualquier* URL de invitación generada, el código QR debe contener exactamente esa URL cuando se decodifica.

**Validates: Requirements 2.4**

### Property 3: Código inválido retorna error

*Para cualquier* codigo_entrada que no exista en la base de datos, la API de Check-in debe retornar un JSON con status "error" y message "codigo_invalido".

**Validates: Requirements 3.2**

### Property 4: Primer check-in actualiza registro

*Para cualquier* invitado con fecha_ingreso NULL, al hacer check-in, el registro debe actualizarse con fecha_ingreso, hora_ingreso y escaner, y la respuesta debe tener status "ok".

**Validates: Requirements 3.3, 3.4**

### Property 5: Check-in duplicado preserva datos originales

*Para cualquier* invitado con fecha_ingreso no NULL, al hacer check-in, el registro no debe modificarse y la respuesta debe tener status "ya_registrado" con los datos originales de fecha_ingreso y hora_ingreso.

**Validates: Requirements 3.5**

### Property 6: Extracción de UUID desde URL

*Para cualquier* URL válida con formato `/invitacion/:codigoEntrada`, la función de extracción debe retornar el UUID correcto del parámetro codigoEntrada.

**Validates: Requirements 4.2**

## Error Handling

### Web Application

1. **Supabase Connection Errors**:
   - Mostrar mensaje genérico: "Error al cargar datos. Intenta nuevamente."
   - Implementar retry automático (1 intento)

2. **Invitado No Encontrado**:
   - Ruta `/invitacion/:codigoEntrada` con código inválido
   - Mostrar: "Invitación no encontrada"

3. **Clipboard API No Disponible**:
   - Fallback: mostrar mensaje "Copia manualmente la URL"

### API de Check-in

1. **Request Validation**:
   - Campos faltantes → 400 Bad Request
   - Formato UUID inválido → 400 Bad Request

2. **Database Errors**:
   - Connection timeout → 503 Service Unavailable
   - Query errors → 500 Internal Server Error

3. **Business Logic**:
   - Código no encontrado → 200 OK con `{status: "error", message: "codigo_invalido"}`

### Mobile Application

1. **Camera Permissions**:
   - Permiso denegado → Mostrar mensaje y botón para abrir configuración

2. **QR Scan Errors**:
   - URL con formato incorrecto → Mostrar "QR inválido"
   - No se puede extraer UUID → Mostrar "QR inválido"

3. **API Errors**:
   - Network timeout → "Error de conexión. Intenta nuevamente."
   - API no disponible → "Servicio no disponible"
   - Response inválido → "Error inesperado"

## Testing Strategy

### Unit Testing

Usaremos **Vitest** para el proyecto web y la API, y **Jest** para el proyecto Expo.

**Casos de prueba unitarios**:

1. **Web - Filtrado de invitados**:
   - Búsqueda con término que coincide
   - Búsqueda sin coincidencias
   - Búsqueda con string vacío (debe mostrar todos)

2. **Web - Generación de QR**:
   - Verificar que el componente QR recibe la URL correcta

3. **API - Validación de request**:
   - Request sin codigo_entrada
   - Request sin escaner
   - Request con UUID inválido

4. **API - Lógica de check-in**:
   - Check-in exitoso (primer ingreso)
   - Check-in duplicado
   - Código inválido

5. **Móvil - Extracción de UUID**:
   - URL válida
   - URL sin UUID
   - URL con formato incorrecto

### Property-Based Testing

Usaremos **fast-check** para JavaScript/TypeScript.

**Configuración**: Cada test debe ejecutar un mínimo de 100 iteraciones.

**Propiedades a testear**:

1. **Property 1: Filtrado de búsqueda**
   - Generar: lista aleatoria de invitados, término de búsqueda aleatorio
   - Verificar: todos los resultados contienen el término

2. **Property 2: QR round-trip**
   - Generar: URLs aleatorias de invitación
   - Verificar: generar QR → decodificar → obtener misma URL

3. **Property 3: Código inválido**
   - Generar: UUIDs aleatorios que no existen en DB
   - Verificar: API retorna error "codigo_invalido"

4. **Property 4: Primer check-in**
   - Generar: invitados aleatorios sin fecha_ingreso
   - Verificar: después del check-in, tienen fecha_ingreso y status "ok"

5. **Property 5: Check-in duplicado**
   - Generar: invitados aleatorios con fecha_ingreso
   - Verificar: check-in no modifica datos y retorna "ya_registrado"

6. **Property 6: Extracción de UUID**
   - Generar: UUIDs aleatorios en URLs
   - Verificar: función extrae el UUID correcto

**Formato de tags en tests**:
```typescript
// Feature: event-checkin, Property 1: Filtrado de búsqueda es inclusivo
```

### Integration Testing

Dado el enfoque simple del sistema, los tests de integración serán mínimos:

1. **Web → Supabase**: Verificar que se pueden obtener invitados reales
2. **API → Supabase**: Verificar que se puede actualizar un registro real
3. **Móvil → API**: Verificar que la app puede comunicarse con el endpoint

## Implementation Notes

### Estructura de Proyectos

**Web (event-checkin-web)**:
```
event-checkin-web/
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts
│   ├── components/
│   │   ├── InvitadosList.tsx
│   │   └── InvitacionPage.tsx
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

**API (event-checkin-api)**:
```
event-checkin-api/
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts
│   ├── routes/
│   │   └── checkin.ts
│   └── server.ts
├── package.json
└── tsconfig.json
```

**Móvil (event-checkin-mobile)**:
```
event-checkin-mobile/
├── lib/
│   └── supabaseClient.ts
├── components/
│   └── ScannerScreen.tsx
├── App.tsx
├── package.json
└── app.json
```

### Dependencias Clave

**Web**:
- `@supabase/supabase-js`
- `react-router-dom`
- `qrcode.react`
- `tailwindcss`

**API**:
- `express`
- `@supabase/supabase-js`
- `cors`

**Móvil**:
- `expo-barcode-scanner`
- `@supabase/supabase-js` (opcional, solo si se consulta directamente)

### Configuración de Supabase

Las credenciales se usarán como constantes en el código:

```typescript
const SUPABASE_URL = "https://mbqrbqfvbootqoyyqfvg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icXJicWZ2Ym9vdHFveXlxZnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTc1NjUsImV4cCI6MjA4MDg3MzU2NX0.BzFQgthCxxKbo0cjFdOx-MHUGWp4nGL3RnkWDEsMK6s";
```

**Nota**: En producción, estas deberían ser variables de entorno, pero para simplicidad se dejan hardcodeadas.

### Estilos y UX

**Web**:
- Diseño limpio y centrado
- Paleta de colores simple (blanco, gris, azul para acciones)
- Responsive básico con Tailwind
- Foco en legibilidad del QR (tamaño grande, contraste alto)

**Móvil**:
- Vista de cámara a pantalla completa
- Overlay con instrucciones
- Feedback visual inmediato después del escaneo
- Botón para volver a escanear

### Performance Considerations

1. **Web - Lista de invitados**: 
   - Si hay más de 1000 invitados, considerar paginación
   - Por ahora, cargar todos y filtrar en cliente

2. **API - Rate limiting**: 
   - No implementado inicialmente
   - Agregar si se detecta abuso

3. **Móvil - Escaneo continuo**:
   - Prevenir múltiples escaneos del mismo QR en corto tiempo
   - Cooldown de 2 segundos después de cada escaneo exitoso
