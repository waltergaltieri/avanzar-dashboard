# Documento de Requisitos

## Introducción

Sistema simple de gestión de entradas para eventos que permite visualizar invitados, generar invitaciones con código QR, y registrar el ingreso mediante escaneo de QR desde una aplicación móvil. El sistema utiliza Supabase como base de datos, React + Vite para el frontend web, y Expo + React Native para la aplicación móvil de control de acceso.

## Glosario

- **Sistema Web**: Aplicación frontend desarrollada con React + Vite + TypeScript que permite visualizar invitados y generar invitaciones
- **Sistema Móvil**: Aplicación desarrollada con Expo + React Native + TypeScript para escanear códigos QR
- **API de Check-in**: Endpoint HTTP que procesa el registro de ingreso de invitados
- **Supabase**: Servicio de base de datos PostgreSQL utilizado para almacenar información de invitados
- **Invitado**: Persona registrada en la tabla avanzar_entradas con un codigo_entrada único
- **Código de Entrada**: UUID único asignado a cada invitado para identificar su invitación
- **QR**: Código QR que contiene la URL de la invitación del invitado
- **Escáner**: Identificador del punto de control que registra el ingreso

## Requisitos

### Requisito 1

**User Story:** Como organizador del evento, quiero ver una lista de todos los invitados registrados, para poder consultar su información y estado de confirmación.

#### Acceptance Criteria

1. WHEN el Sistema Web se carga THEN el Sistema Web SHALL mostrar una tabla con las columnas nro, nombre_apellido, ingreso, confirmacion, codigo_entrada, fecha_ingreso, hora_ingreso
2. WHEN el Sistema Web consulta Supabase THEN el Sistema Web SHALL obtener todos los registros de la tabla avanzar_entradas
3. WHEN el usuario escribe en el campo de búsqueda THEN el Sistema Web SHALL filtrar la lista mostrando solo los invitados cuyo nombre_apellido contenga el texto ingresado
4. WHEN el usuario hace clic en el botón "Ver invitación" de una fila THEN el Sistema Web SHALL navegar a la ruta /invitacion/:codigoEntrada correspondiente

### Requisito 2

**User Story:** Como organizador del evento, quiero generar una página de invitación con código QR para cada invitado, para que puedan presentarla al ingresar al evento.

#### Acceptance Criteria

1. WHEN el Sistema Web recibe una solicitud a /invitacion/:codigoEntrada THEN el Sistema Web SHALL consultar Supabase filtrando por codigo_entrada
2. WHEN el invitado existe en Supabase THEN el Sistema Web SHALL mostrar el nombre_apellido del invitado
3. WHEN se renderiza la página de invitación THEN el Sistema Web SHALL mostrar un bloque de texto con información del evento
4. WHEN se renderiza la página de invitación THEN el Sistema Web SHALL generar un código QR que contenga la URL completa de la página actual
5. WHEN el usuario hace clic en el botón "Copiar link" THEN el Sistema Web SHALL copiar la URL actual al portapapeles usando navigator.clipboard.writeText

### Requisito 3

**User Story:** Como sistema de control de acceso, necesito registrar el ingreso de invitados mediante su código de entrada, para llevar un control de asistencia al evento.

#### Acceptance Criteria

1. WHEN la API de Check-in recibe una solicitud POST a /api/check-in con codigo_entrada y escaner THEN la API de Check-in SHALL buscar el registro en avanzar_entradas donde codigo_entrada coincida
2. IF el codigo_entrada no existe en la base de datos THEN la API de Check-in SHALL devolver un JSON con error "codigo_invalido"
3. WHEN el invitado existe y fecha_ingreso es NULL THEN la API de Check-in SHALL actualizar fecha_ingreso con la fecha actual, hora_ingreso con la hora actual, y escaner con el valor recibido
4. WHEN el registro se actualiza exitosamente THEN la API de Check-in SHALL devolver un JSON con status "ok" y los datos nombre_apellido, fecha_ingreso, hora_ingreso
5. WHEN el invitado existe y fecha_ingreso no es NULL THEN la API de Check-in SHALL devolver un JSON con status "ya_registrado", nombre_apellido, fecha_ingreso y hora_ingreso originales

### Requisito 4

**User Story:** Como controlador de acceso al evento, quiero escanear el código QR de las invitaciones con mi dispositivo móvil, para registrar el ingreso de los invitados de forma rápida.

#### Acceptance Criteria

1. WHEN el Sistema Móvil se inicia THEN el Sistema Móvil SHALL mostrar una vista de cámara usando expo-barcode-scanner
2. WHEN el Sistema Móvil escanea un código QR THEN el Sistema Móvil SHALL extraer el codigo_entrada de la URL escaneada
3. WHEN el Sistema Móvil obtiene un codigo_entrada THEN el Sistema Móvil SHALL enviar una solicitud POST a /api/check-in con codigo_entrada y escaner
4. WHEN la API de Check-in responde con status "ok" THEN el Sistema Móvil SHALL mostrar el nombre del invitado y el mensaje "Ingreso registrado"
5. WHEN la API de Check-in responde con status "ya_registrado" THEN el Sistema Móvil SHALL mostrar el nombre del invitado y el mensaje "Ya ingresó a las HH:MM"
6. WHEN la API de Check-in responde con error THEN el Sistema Móvil SHALL mostrar el mensaje "Código inválido"

### Requisito 5

**User Story:** Como desarrollador, necesito conectar todos los componentes del sistema a Supabase usando las credenciales proporcionadas, para que el sistema funcione con la base de datos real.

#### Acceptance Criteria

1. WHEN el Sistema Web se inicializa THEN el Sistema Web SHALL crear un cliente de Supabase usando SUPABASE_URL y SUPABASE_ANON_KEY
2. WHEN la API de Check-in se inicializa THEN la API de Check-in SHALL crear un cliente de Supabase usando SUPABASE_URL y SUPABASE_ANON_KEY
3. WHEN cualquier componente consulta Supabase THEN el componente SHALL usar la tabla avanzar_entradas
4. WHEN cualquier componente actualiza Supabase THEN el componente SHALL usar la tabla avanzar_entradas

### Requisito 6

**User Story:** Como desarrollador, necesito que el sistema use únicamente las tecnologías especificadas sin agregar complejidad adicional, para mantener el proyecto simple y fácil de implementar.

#### Acceptance Criteria

1. WHEN se implementa el Sistema Web THEN el Sistema Web SHALL usar React, Vite, TypeScript y Tailwind CSS
2. WHEN se implementa el Sistema Móvil THEN el Sistema Móvil SHALL usar Expo, React Native y TypeScript
3. WHEN se implementa la lectura de QR THEN el Sistema Móvil SHALL usar expo-barcode-scanner
4. WHEN se implementa la generación de QR THEN el Sistema Web SHALL usar una librería simple como qrcode.react
5. WHEN se implementa cualquier componente THEN el sistema SHALL NOT incluir autenticación, Next.js, ni librerías complejas de UI
