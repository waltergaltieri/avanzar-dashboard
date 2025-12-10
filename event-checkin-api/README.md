# Event Check-in API

API REST para registrar el ingreso de invitados mediante escaneo de código QR.

## Tecnologías

- Node.js
- Express
- TypeScript
- Supabase
- CORS

## Requisitos Previos

- Node.js 16 o superior
- npm o yarn

## Instalación

```bash
npm install
```

## Configuración

La API está configurada para conectarse a Supabase con las credenciales incluidas en `src/lib/supabaseClient.ts`:

```typescript
const SUPABASE_URL = "https://mbqrbqfvbootqoyyqfvg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

**Nota**: En un entorno de producción, estas credenciales deberían estar en variables de entorno.

### Puerto del Servidor

Por defecto, el servidor se ejecuta en el puerto `3000`. Puedes cambiarlo modificando `src/server.ts`.

## Ejecución

### Modo Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Build para Producción

```bash
npm run build
```

### Ejecutar Producción

```bash
npm start
```

## Estructura del Proyecto

```
event-checkin-api/
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts       # Cliente de Supabase
│   ├── routes/
│   │   └── checkin.ts              # Endpoint de check-in
│   └── server.ts                    # Configuración del servidor Express
├── package.json
└── tsconfig.json
```

## API Endpoints

### POST /api/check-in

Registra el ingreso de un invitado.

**Request Body:**

```json
{
  "codigo_entrada": "550e8400-e29b-41d4-a716-446655440000",
  "escaner": "control_acceso_1"
}
```

**Responses:**

#### Primer ingreso exitoso (200 OK)

```json
{
  "status": "ok",
  "nombre_apellido": "Juan Pérez",
  "fecha_ingreso": "2024-12-09",
  "hora_ingreso": "18:30:00"
}
```

#### Ingreso duplicado (200 OK)

```json
{
  "status": "ya_registrado",
  "nombre_apellido": "Juan Pérez",
  "fecha_ingreso": "2024-12-09",
  "hora_ingreso": "18:30:00"
}
```

#### Código inválido (200 OK)

```json
{
  "status": "error",
  "message": "codigo_invalido"
}
```

#### Errores de validación (400 Bad Request)

```json
{
  "error": "codigo_entrada y escaner son requeridos"
}
```

```json
{
  "error": "codigo_entrada debe ser un UUID válido"
}
```

#### Error del servidor (500 Internal Server Error)

```json
{
  "error": "Error interno del servidor"
}
```

## Testing

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage
```

## Estructura de la Base de Datos

La API utiliza la tabla `avanzar_entradas` en Supabase:

```sql
CREATE TABLE avanzar_entradas (
  nro INTEGER PRIMARY KEY,
  nombre_apellido TEXT,
  ingreso TEXT,
  confirmacion TEXT,
  gastos_pendientes TEXT,
  monto NUMERIC(10,2),
  codigo_entrada UUID UNIQUE,
  escaner TEXT,
  fecha_ingreso DATE,
  hora_ingreso TIME
);
```

### Campos Actualizados por la API

- `escaner`: Se actualiza con el identificador del punto de control
- `fecha_ingreso`: Se actualiza con la fecha actual del servidor
- `hora_ingreso`: Se actualiza con la hora actual del servidor

## Lógica de Check-in

1. **Validación**: Verifica que `codigo_entrada` y `escaner` estén presentes y sean válidos
2. **Búsqueda**: Busca el registro en la base de datos por `codigo_entrada`
3. **Evaluación**:
   - Si no existe → retorna error `codigo_invalido`
   - Si existe y `fecha_ingreso` es NULL → actualiza el registro y retorna `ok`
   - Si existe y `fecha_ingreso` no es NULL → retorna `ya_registrado` sin modificar

## Pruebas con cURL

### Check-in exitoso

```bash
curl -X POST http://localhost:3000/api/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_entrada": "550e8400-e29b-41d4-a716-446655440000",
    "escaner": "control_acceso_1"
  }'
```

### Código inválido

```bash
curl -X POST http://localhost:3000/api/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_entrada": "00000000-0000-0000-0000-000000000000",
    "escaner": "control_acceso_1"
  }'
```

## CORS

La API tiene CORS habilitado para permitir peticiones desde cualquier origen. En producción, deberías configurar orígenes específicos en `src/server.ts`:

```typescript
app.use(cors({
  origin: 'https://tu-dominio.com'
}));
```

## Troubleshooting

### Error de conexión a Supabase

Verifica que:
1. Las credenciales de Supabase sean correctas
2. La tabla `avanzar_entradas` exista
3. Tengas conexión a internet

### Puerto en uso

Si el puerto 3000 está ocupado, cambia el puerto en `src/server.ts`:

```typescript
const PORT = process.env.PORT || 4000;
```

### Errores de TypeScript

Asegúrate de tener todas las dependencias de tipos instaladas:

```bash
npm install --save-dev @types/node @types/express @types/cors
```
