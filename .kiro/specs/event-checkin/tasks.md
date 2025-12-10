# Plan de Implementación - Sistema de Gestión de Entradas

- [x] 1. Configurar proyecto web (React + Vite + TypeScript)





  - Crear proyecto con `npm create vite@latest event-checkin-web -- --template react-ts`
  - Instalar dependencias: `@supabase/supabase-js`, `react-router-dom`, `qrcode.react`, `tailwindcss`
  - Configurar Tailwind CSS
  - Crear cliente de Supabase en `src/lib/supabaseClient.ts` con las credenciales proporcionadas
  - _Requirements: 5.1, 6.1_

- [x] 1.1 Escribir test unitario para inicialización de Supabase


  - Verificar que el cliente se crea con SUPABASE_URL y SUPABASE_ANON_KEY correctos
  - _Requirements: 5.1_

- [ ] 2. Implementar componente de lista de invitados





  - Crear `InvitadosList.tsx` con tabla que muestre columnas: nro, nombre_apellido, ingreso, confirmacion, codigo_entrada, fecha_ingreso, hora_ingreso
  - Implementar función `fetchInvitados()` que consulte la tabla `avanzar_entradas` de Supabase
  - Agregar input de búsqueda con estado local
  - Implementar función `filterInvitados()` que filtre por nombre_apellido
  - Agregar botón "Ver invitación" en cada fila que navegue a `/invitacion/:codigoEntrada`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2.1 Escribir property test para filtrado de búsqueda


  - **Feature: event-checkin, Property 1: Filtrado de búsqueda es inclusivo**
  - **Validates: Requirements 1.3**
  - Generar listas aleatorias de invitados y términos de búsqueda
  - Verificar que todos los resultados contienen el término (case-insensitive)
  - Configurar 100 iteraciones mínimo

- [x] 2.2 Escribir tests unitarios para lista de invitados

  - Test: búsqueda con término que coincide
  - Test: búsqueda sin coincidencias retorna array vacío
  - Test: búsqueda con string vacío muestra todos los invitados
  - _Requirements: 1.3_

- [x] 3. Implementar página de invitación con QR





  - Configurar React Router con rutas: `/` (lista) y `/invitacion/:codigoEntrada`
  - Crear `InvitacionPage.tsx` que obtenga `codigoEntrada` de los parámetros de URL
  - Implementar función `fetchInvitado()` que consulte Supabase filtrando por `codigo_entrada`
  - Mostrar `nombre_apellido` del invitado
  - Agregar bloque de texto hardcodeado con información del evento
  - Generar código QR usando `qrcode.react` con `window.location.href` como contenido
  - Implementar botón "Copiar link" que use `navigator.clipboard.writeText(window.location.href)`
  - Aplicar estilos con Tailwind: diseño centrado, QR grande, tipografía clara
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.1 Escribir property test para QR round-trip


  - **Feature: event-checkin, Property 2: QR contiene URL completa**
  - **Validates: Requirements 2.4**
  - Generar URLs aleatorias de invitación
  - Verificar que generar QR → decodificar → retorna la misma URL
  - Configurar 100 iteraciones mínimo



- [x] 3.2 Escribir tests unitarios para página de invitación





  - Test: renderiza nombre del invitado cuando existe
  - Test: muestra información del evento
  - Test: botón copiar llama a clipboard API con URL correcta
  - _Requirements: 2.2, 2.3, 2.5_

- [x] 4. Checkpoint - Verificar que el frontend web funciona





  - Ejecutar `npm run dev` y verificar que la lista de invitados carga
  - Probar búsqueda de invitados
  - Navegar a una página de invitación y verificar que el QR se genera
  - Probar botón de copiar link
  - Asegurarse de que todos los tests pasan

- [x] 5. Configurar proyecto API (Node + Express + TypeScript)





  - Crear directorio `event-checkin-api`
  - Inicializar proyecto: `npm init -y`
  - Instalar dependencias: `express`, `@supabase/supabase-js`, `cors`, `typescript`, `@types/node`, `@types/express`, `ts-node`
  - Configurar TypeScript con `tsconfig.json`
  - Crear cliente de Supabase en `src/lib/supabaseClient.ts` con las credenciales proporcionadas
  - Crear servidor Express básico en `src/server.ts` con CORS habilitado
  - _Requirements: 5.2_

- [x] 5.1 Escribir test unitario para inicialización de Supabase en API


  - Verificar que el cliente se crea con SUPABASE_URL y SUPABASE_ANON_KEY correctos
  - _Requirements: 5.2_

- [x] 6. Implementar endpoint POST /api/check-in





  - Crear archivo `src/routes/checkin.ts`
  - Validar que el request contiene `codigo_entrada` y `escaner`
  - Implementar lógica: buscar registro en `avanzar_entradas` donde `codigo_entrada` coincida
  - Si no existe: retornar `{status: "error", message: "codigo_invalido"}`
  - Si existe y `fecha_ingreso` es NULL: actualizar con fecha actual, hora actual, y `escaner`, retornar `{status: "ok", nombre_apellido, fecha_ingreso, hora_ingreso}`
  - Si existe y `fecha_ingreso` no es NULL: retornar `{status: "ya_registrado", nombre_apellido, fecha_ingreso, hora_ingreso}`
  - Registrar la ruta en `server.ts`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6.1 Escribir property test para código inválido


  - **Feature: event-checkin, Property 3: Código inválido retorna error**
  - **Validates: Requirements 3.2**
  - Generar UUIDs aleatorios que no existen en DB
  - Verificar que API retorna `{status: "error", message: "codigo_invalido"}`
  - Configurar 100 iteraciones mínimo

- [x] 6.2 Escribir property test para primer check-in


  - **Feature: event-checkin, Property 4: Primer check-in actualiza registro**
  - **Validates: Requirements 3.3, 3.4**
  - Generar invitados aleatorios sin fecha_ingreso
  - Verificar que después del check-in tienen fecha_ingreso y status "ok"
  - Configurar 100 iteraciones mínimo

- [x] 6.3 Escribir property test para check-in duplicado


  - **Feature: event-checkin, Property 5: Check-in duplicado preserva datos originales**
  - **Validates: Requirements 3.5**
  - Generar invitados aleatorios con fecha_ingreso
  - Verificar que check-in no modifica datos y retorna "ya_registrado"
  - Configurar 100 iteraciones mínimo

- [x] 6.4 Escribir tests unitarios para endpoint check-in


  - Test: request sin codigo_entrada retorna 400
  - Test: request sin escaner retorna 400
  - Test: UUID con formato inválido retorna 400
  - Test: check-in exitoso retorna status "ok" con datos correctos
  - Test: check-in duplicado retorna status "ya_registrado"
  - Test: código no encontrado retorna error "codigo_invalido"
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7. Checkpoint - Verificar que la API funciona





  - Ejecutar `npm run dev` para iniciar el servidor
  - Probar endpoint con Postman o curl con diferentes casos
  - Verificar que se conecta correctamente a Supabase
  - Asegurarse de que todos los tests pasan

- [x] 8. Configurar proyecto móvil (Expo + React Native + TypeScript)





  - Crear proyecto: `npx create-expo-app event-checkin-mobile --template`
  - Instalar dependencias: `expo-barcode-scanner`
  - Configurar permisos de cámara en `app.json`
  - Crear constante con URL del backend (placeholder para que el usuario la reemplace)
  - _Requirements: 6.2, 6.3_

- [x] 9. Implementar pantalla de scanner QR





  - Crear `ScannerScreen.tsx` como componente principal
  - Solicitar permisos de cámara usando `expo-barcode-scanner`
  - Mostrar vista de cámara a pantalla completa cuando hay permisos
  - Implementar handler `handleBarCodeScanned` que se active al escanear QR
  - Extraer `codigo_entrada` de la URL escaneada (formato: `https://dominio.com/invitacion/:codigoEntrada`)
  - Hacer POST a `/api/check-in` con `codigo_entrada` y `escaner: "control_acceso_1"`
  - Mostrar resultado en pantalla según respuesta:
    - status "ok": mostrar nombre + "Ingreso registrado"
    - status "ya_registrado": mostrar nombre + "Ya ingresó a las HH:MM"
    - error: mostrar "Código inválido"
  - Agregar botón para volver a escanear
  - Implementar cooldown de 2 segundos entre escaneos
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 9.1 Escribir property test para extracción de UUID


  - **Feature: event-checkin, Property 6: Extracción de UUID desde URL**
  - **Validates: Requirements 4.2**
  - Generar UUIDs aleatorios en URLs con formato `/invitacion/:codigoEntrada`
  - Verificar que la función extrae el UUID correcto
  - Configurar 100 iteraciones mínimo

- [x] 9.2 Escribir tests unitarios para scanner


  - Test: extracción de UUID desde URL válida
  - Test: URL sin UUID retorna null o error
  - Test: URL con formato incorrecto retorna null o error
  - _Requirements: 4.2_

- [x] 10. Checkpoint final - Verificar integración completa





  - Ejecutar app móvil: `npx expo start`
  - Escanear un QR generado desde la web
  - Verificar que el check-in se registra correctamente en Supabase
  - Verificar que la web muestra la fecha/hora de ingreso actualizada
  - Intentar escanear el mismo QR nuevamente y verificar mensaje "ya_registrado"
  - Asegurarse de que todos los tests pasan

- [x] 11. Crear documentación de instalación y ejecución





  - Crear README.md en cada proyecto (web, api, mobile) con:
    - Comandos de instalación (`npm install`)
    - Comandos para ejecutar (`npm run dev` o `npx expo start`)
    - Configuración necesaria (URL del backend en la app móvil)
    - Estructura de la base de datos
  - _Requirements: todos_
