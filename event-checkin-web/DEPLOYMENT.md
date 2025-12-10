# Guía de Deployment - Avanzar Event Management

## 🚀 Opciones de Hosting Recomendadas

### 1. **Netlify** (Recomendado - Gratis)
```bash
# 1. Crear cuenta en netlify.com
# 2. Conectar repositorio de GitHub
# 3. Configurar variables de entorno:
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_key_de_supabase

# 4. Deploy automático configurado con netlify.toml
```

### 2. **Vercel** (Excelente opción - Gratis)
```bash
# 1. Crear cuenta en vercel.com
# 2. Importar proyecto desde GitHub
# 3. Configurar variables de entorno en dashboard
# 4. Deploy automático con vercel.json
```

### 3. **GitHub Pages** (Gratis pero limitado)
```bash
# Agregar al package.json:
"homepage": "https://tu-usuario.github.io/tu-repo",
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Instalar gh-pages:
npm install --save-dev gh-pages

# Deploy:
npm run deploy
```

## 🔧 Preparación para Producción

### 1. **Variables de Entorno**
Configura las variables de entorno en tu plataforma de hosting:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=production
```

### 2. **Actualizar supabaseClient.ts**
```typescript
// Reemplazar valores hardcodeados por variables de entorno
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### 3. **Build de Producción**
```bash
npm run build
```

## 📊 Base de Datos (Supabase)

### Configuración RLS (Row Level Security)
```sql
-- Habilitar RLS en la tabla
ALTER TABLE avanzar_entradas ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública de invitaciones
CREATE POLICY "Invitaciones públicas" ON avanzar_entradas
FOR SELECT USING (true);

-- Política para administradores (requiere autenticación)
CREATE POLICY "Admin access" ON avanzar_entradas
FOR ALL USING (auth.role() = 'authenticated');
```

## 🔐 Seguridad

### 1. **Autenticación Real** (Opcional)
Para reemplazar el sistema mock:
```typescript
// Implementar con Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

### 2. **Variables de Entorno Seguras**
- ✅ Nunca commitear archivos .env
- ✅ Usar variables de entorno en hosting
- ✅ Rotar keys periódicamente

## 📱 Funcionalidades Post-Deploy

### 1. **Dominio Personalizado**
- Configurar DNS en tu hosting
- Certificado SSL automático
- Redirecciones HTTPS

### 2. **Monitoreo**
- Analytics con Google Analytics
- Error tracking con Sentry
- Performance monitoring

### 3. **SEO y Meta Tags**
```html
<!-- En index.html -->
<meta name="description" content="Sistema de gestión de eventos Avanzar">
<meta property="og:title" content="Avanzar Event Management">
<meta property="og:description" content="Gestión profesional de eventos">
```

## 🚀 Deploy Rápido (5 minutos)

### Opción 1: Netlify
1. Fork el repositorio en GitHub
2. Conectar en netlify.com
3. Configurar variables de entorno
4. ¡Deploy automático!

### Opción 2: Vercel
1. Importar proyecto en vercel.com
2. Configurar variables de entorno
3. Deploy con un click

## ✅ Checklist Pre-Deploy

- [ ] Variables de entorno configuradas
- [ ] Build de producción exitoso (`npm run build`)
- [ ] Tests pasando (`npm test`)
- [ ] Base de datos Supabase configurada
- [ ] Dominio/hosting seleccionado
- [ ] Credenciales de admin definidas
- [ ] Backup de datos importante

## 🐛 Troubleshooting

### Error: "Failed to load resource"
- Verificar URLs de Supabase
- Comprobar CORS en Supabase
- Revisar variables de entorno

### Error: "Authentication failed"
- Verificar credenciales en AuthContext
- Comprobar configuración de Supabase Auth

### Estilos no cargan
- Verificar build de Tailwind
- Comprobar rutas de assets
- Limpiar caché del navegador

## 📞 Soporte

Si necesitas ayuda:
1. Revisar logs del hosting
2. Comprobar Network tab en DevTools
3. Verificar configuración de Supabase
4. Contactar soporte del hosting elegido

---

**¡Tu sistema está listo para producción! 🎉**