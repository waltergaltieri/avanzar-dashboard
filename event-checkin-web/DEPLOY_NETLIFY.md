# 🚀 Guía Rápida - Deploy en Netlify

## ✅ Pre-requisitos (YA COMPLETADOS)
- [x] Build funciona correctamente
- [x] Tests pasan (16/16)
- [x] Variables de entorno configuradas
- [x] Archivos de configuración creados
- [x] Créditos de KazeCode agregados
- [x] Sincronización inteligente implementada

## 📋 Pasos para Deploy (5 minutos)

### 1. **Subir a GitHub** (si no está ya)
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. **Crear cuenta en Netlify**
- Ve a [netlify.com](https://netlify.com)
- Regístrate con GitHub (recomendado)

### 3. **Conectar repositorio**
- Click en "New site from Git"
- Selecciona GitHub
- Busca tu repositorio "Avanzar dashboard"
- Selecciona la carpeta `event-checkin-web`

### 4. **Configurar build settings**
```
Build command: npm run build
Publish directory: event-checkin-web/dist
```

### 5. **Configurar variables de entorno**
En Netlify Dashboard → Site settings → Environment variables:

```
VITE_SUPABASE_URL = [TU_URL_DE_SUPABASE]
VITE_SUPABASE_ANON_KEY = [TU_CLAVE_ANONIMA_DE_SUPABASE]
VITE_APP_ENV = production
VITE_APP_NAME = Avanzar Event Management
```

**Nota:** Reemplaza `[TU_URL_DE_SUPABASE]` y `[TU_CLAVE_ANONIMA_DE_SUPABASE]` con los valores reales de tu proyecto Supabase.

### 6. **Deploy!**
- Click "Deploy site"
- Espera 2-3 minutos
- ¡Tu sitio estará live!

## 🌐 URLs después del deploy

### **Dashboard Admin:**
```
https://tu-sitio.netlify.app/login
Usuario: admin@avanzar.com
Contraseña: admin123
```

### **Invitación de ejemplo:**
```
https://tu-sitio.netlify.app/invitacion/[CODIGO_INVITADO]
```

## 🔧 Configuración automática

El archivo `netlify.toml` ya está configurado para:
- ✅ Redirects para SPA (Single Page Application)
- ✅ Build command automático
- ✅ Publish directory correcto

## 🎯 Funcionalidades que estarán disponibles

### **Dashboard Admin:**
- ✅ Login con credenciales
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de invitados con filtros
- ✅ Sincronización inteligente (sin recargas molestas)
- ✅ Configuración del evento
- ✅ Créditos de KazeCode

### **Invitaciones Públicas:**
- ✅ QR codes únicos por invitado
- ✅ Información personalizada del evento
- ✅ Diseño responsive
- ✅ Enlaces compartibles

### **Base de Datos:**
- ✅ Supabase configurado y funcionando
- ✅ Tabla `avanzar_entradas` lista
- ✅ Campos para check-in preparados

## 🚨 Troubleshooting

### Si el deploy falla:
1. Verificar que las variables de entorno estén configuradas
2. Comprobar que el build command sea correcto
3. Revisar los logs en Netlify Dashboard

### Si no cargan los datos:
1. Verificar conexión a Supabase
2. Comprobar que las URLs sean correctas
3. Revisar CORS en Supabase si es necesario

## 🎉 ¡Listo para producción!

Tu sistema está completamente preparado para:
- ✅ Gestionar eventos profesionalmente
- ✅ Generar invitaciones con QR únicos
- ✅ Hacer check-in con app móvil (próximamente)
- ✅ Monitorear estadísticas en tiempo real

---

**Desarrollado por [KazeCode](https://kazecode.com.ar)** 🚀