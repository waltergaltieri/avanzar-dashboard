# Avanzar Dashboard - Event Management System

Un sistema moderno de gestión de eventos con dashboard administrativo, diseñado para manejar invitaciones, confirmaciones y check-ins de manera eficiente.

## 🚀 Características Principales

### Dashboard Administrativo
- **Panel de control moderno** con métricas en tiempo real
- **Gráficos interactivos** para visualizar estadísticas del evento
- **Tema oscuro elegante** con acentos rojos
- **Diseño responsive** optimizado para desktop y móvil

### Gestión de Invitados
- **Lista completa de invitados** con paginación inteligente
- **Búsqueda avanzada** por nombre o código de entrada
- **Filtros por estado** (confirmados/pendientes)
- **Acciones rápidas**: copiar enlaces, enviar invitaciones
- **Estadísticas en tiempo real** de confirmaciones

### Sistema de Autenticación
- **Login seguro** con credenciales simuladas
- **Sesiones persistentes** con contexto de autenticación
- **Rutas protegidas** para el área administrativa

### Invitaciones Digitales
- **Códigos QR únicos** para cada invitado
- **Diseño elegante** con información del evento
- **Enlaces compartibles** con copia automática
- **Vista pública** sin necesidad de autenticación

### Configuración Avanzada
- **Gestión del evento**: fecha, hora, lugar, descripción
- **Notificaciones automáticas** con recordatorios por email
- **Límites de invitados** y configuraciones de confirmación
- **Preferencias del sistema** y personalización

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Estilos**: Tailwind CSS v4 con tema personalizado
- **Gráficos**: Recharts para visualizaciones interactivas
- **Iconos**: Lucide React
- **Base de datos**: Supabase
- **Testing**: Vitest + Fast-check (Property-Based Testing)
- **Build**: Vite
- **QR Codes**: qrcode.react

## 🎨 Diseño y UX

- **Tema oscuro moderno** con paleta gris/rojo
- **Navegación intuitiva** con sidebar responsive
- **Animaciones suaves** y transiciones elegantes
- **Componentes reutilizables** con diseño consistente
- **Accesibilidad** optimizada con focus states

## 🚦 Inicio Rápido

### 1. Instalación
```bash
npm install
```

### 2. Configuración
La aplicación está configurada para conectarse a Supabase con las credenciales incluidas en `src/lib/supabaseClient.ts`.

**Nota**: En un entorno de producción, estas credenciales deberían estar en variables de entorno.

### 3. Desarrollo
```bash
npm run dev
```

### 4. Testing
```bash
npm test
```

### 5. Build de Producción
```bash
npm run build
```

## 🔐 Credenciales de Acceso

Para acceder al dashboard administrativo:
- **Email**: admin@avanzar.com
- **Contraseña**: admin123

## 📱 Rutas de la Aplicación

- `/login` - Página de autenticación
- `/dashboard` - Panel principal con estadísticas
- `/invitados` - Gestión de invitados
- `/configuracion` - Configuración del sistema
- `/invitacion/:codigo` - Vista pública de invitación

## 🧪 Testing

El proyecto incluye:
- **Tests unitarios** para componentes críticos
- **Property-based testing** con Fast-check
- **Tests de integración** para flujos completos
- **Cobertura completa** de funcionalidades de filtrado

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

## 📊 Funcionalidades del Dashboard

### Métricas en Tiempo Real
- Total de invitados registrados
- Confirmaciones recibidas
- Invitaciones pendientes
- Tasa de confirmación

### Gráficos Interactivos
- **Gráfico circular**: Estado de confirmaciones
- **Gráfico de líneas**: Tendencia de confirmaciones
- **Gráfico de barras**: Registros por horario
- **Panel de acciones**: Próximos eventos y tareas

### Gestión Avanzada
- **Paginación inteligente**: 10 elementos por página
- **Búsqueda en tiempo real**: Por nombre o código
- **Filtros dinámicos**: Por estado de confirmación
- **Acciones masivas**: Copiar enlaces, enviar emails

## 🔧 Configuración Avanzada

### Personalización del Evento
- Información básica (nombre, fecha, hora, lugar)
- Descripción detallada del evento
- Configuración de recordatorios automáticos
- Límites de capacidad y confirmaciones

### Notificaciones
- Recordatorios por email configurables
- Intervalos personalizables (1, 3, 7, 14 días)
- Templates de email personalizados

### Preferencias del Sistema
- Tema oscuro/claro (actualmente solo oscuro)
- Configuración de idioma
- Modo seguro y configuraciones de privacidad

## 🏗️ Estructura del Proyecto

```
event-checkin-web/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx           # Panel principal con gráficos
│   │   ├── InvitadosList.tsx       # Gestión de invitados
│   │   ├── InvitacionPage.tsx      # Vista pública de invitación
│   │   ├── Login.tsx               # Página de autenticación
│   │   ├── Layout.tsx              # Layout principal con navegación
│   │   └── Configuracion.tsx       # Configuración del sistema
│   ├── contexts/
│   │   └── AuthContext.tsx         # Contexto de autenticación
│   ├── lib/
│   │   └── supabaseClient.ts       # Cliente de Supabase
│   ├── utils/
│   │   └── filterUtils.ts          # Utilidades de filtrado
│   ├── App.tsx                     # Configuración de rutas
│   ├── main.tsx                    # Punto de entrada
│   └── style.css                   # Estilos globales
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 📊 Base de Datos

La aplicación utiliza la tabla `avanzar_entradas` en Supabase:

```sql
CREATE TABLE avanzar_entradas (
  id SERIAL PRIMARY KEY,
  nro INTEGER,
  nombre_apellido TEXT,
  ingreso TEXT,
  confirmacion TEXT,
  gastos_pendientes TEXT,
  monto NUMERIC(10,2),
  codigo_entrada UUID UNIQUE,
  confirmado BOOLEAN DEFAULT false,
  escaner TEXT,
  fecha_ingreso DATE,
  hora_ingreso TIME
);
```

### Campos Principales
- `codigo_entrada`: UUID único para cada invitado
- `nombre_apellido`: Nombre completo del invitado
- `confirmado`: Estado de confirmación (boolean)
- `fecha_ingreso`: Fecha de ingreso al evento
- `hora_ingreso`: Hora de ingreso al evento

## 🚀 Próximas Funcionalidades

- [ ] Integración con servicios de email
- [ ] Exportación de datos a Excel/PDF
- [ ] Notificaciones push en tiempo real
- [ ] Múltiples eventos simultáneos
- [ ] Roles y permisos de usuario
- [ ] API REST completa
- [ ] Aplicación móvil nativa

## 🐛 Troubleshooting

### Error al cargar invitados
Verifica que:
1. Las credenciales de Supabase sean correctas
2. La tabla `avanzar_entradas` exista en la base de datos
3. Tengas conexión a internet

### Problemas con los estilos
Si los estilos no se cargan:
1. Verifica que Tailwind CSS esté configurado correctamente
2. Reinicia el servidor de desarrollo
3. Limpia la caché del navegador

### Tests fallando
Si los tests fallan:
1. Ejecuta `npm install` para asegurar dependencias
2. Verifica que Fast-check esté instalado
3. Ejecuta `npm test` con modo verbose para más detalles

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para Avanzar**