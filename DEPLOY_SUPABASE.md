# 🚀 Despliegue AmorAccion con Supabase + Vercel

Sistema de asistencia 100% gratuito usando Supabase (backend + base de datos) y Vercel (frontend).

---

## 📋 RESUMEN DE PASOS

1. ✅ Crear proyecto en Supabase (5 min)
2. ✅ Ejecutar script SQL en Supabase (5 min)
3. ✅ Crear cuenta admin en Supabase (2 min)
4. ✅ Desplegar frontend en Vercel (5 min)
5. ✅ Configurar variables de entorno (2 min)
6. ✅ ¡Listo para usar! (1 min)

**Tiempo total: ~20 minutos**

---

## PARTE 1: CONFIGURAR SUPABASE

### Paso 1.1: Crear Proyecto en Supabase

1. Ve a: https://supabase.com
2. Click "New Project"
3. Selecciona tu organización
4. **Project name:** `amoraccion`
5. **Database password:** Crea una contraseña segura (guárdala)
6. **Region:** Selecciona la más cercana
7. Click "Create new project"
8. Espera 1-2 minutos a que se cree

### Paso 1.2: Obtener Credenciales

1. En el menú lateral, click **"Project Settings"** (⚙️)
2. Selecciona **"API"**
3. Copia estos valores:
   - **Project URL:** `https://xxxxxx.supabase.co`
   - **anon public:** `eyJ...` (clave larga)

### Paso 1.3: Crear Base de Datos

1. En el menú lateral, click **"SQL Editor"** (icono de terminal)
2. Click **"New query"**
3. Abre el archivo `supabase-schema.sql` de este repositorio
4. Copia TODO el contenido
5. Pégalo en el editor de SQL de Supabase
6. Click **"Run"** (botón verde)
7. Espera a que termine (aparecerá mensaje de éxito)

### Paso 1.4: Crear Usuario Admin

1. En el menú lateral, click **"Authentication"**
2. Click **"Add user"** (botón en la esquina)
3. Selecciona **"Create new user"**
4. **Email:** `admin@colegio.edu`
5. **Password:** `changeme123`
6. Marca **"Auto-confirm email"** ✅
7. Click **"Create user"**
8. Ve a **"Users"** y copia el **UUID** del usuario creado
9. Ve a **"Table Editor"** (icono de tabla)
10. Selecciona la tabla **"profiles"**
11. Busca el usuario con email `admin@colegio.edu`
12. Click en **"Edit"** (lápiz)
13. Cambia **role** a `admin`
14. Click **"Save"**

---

## PARTE 2: DESPLEGAR EN VERCEL

### Paso 2.1: Preparar el Proyecto Local

```bash
# Instalar dependencias de Supabase
cd frontend
npm install
```

### Paso 2.2: Configurar Variables Locales (Opcional - para probar)

Crea archivo `frontend/.env.local`:
```
VITE_SUPABASE_URL=https://tu-url.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

### Paso 2.3: Desplegar en Vercel

1. Ve a: https://vercel.com
2. Login con GitHub
3. Click **"Add New..."** → **"Project"**
4. Importa el repositorio `amor-accion`
5. **Framework Preset:** Selecciona **"Vite"**
6. **Root Directory:** `frontend`
7. **Build Command:** `npm run build`
8. **Output Directory:** `dist`

### Paso 2.4: Agregar Variables de Entorno

Agrega estas variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://ejfmmyjoyrkffcmhjggu.supabase.co` (tu URL) |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` (tu clave anon) |

### Paso 2.5: Deploy

Click **"Deploy"** y espera 2-3 minutos.

---

## PARTE 3: VERIFICAR FUNCIONAMIENTO

### Prueba de Acceso

1. Abre la URL de Vercel (ej: `https://amoraccion.vercel.app`)
2. Deberías ver la pantalla de Login
3. Ingresa con:
   - **Email:** `admin@colegio.edu`
   - **Password:** `changeme123`
4. Si entra al Dashboard, ¡todo funciona!

### Prueba de Estudiantes

1. Ve a "Estudiantes"
2. Click "Nuevo Estudiante"
3. Crea un estudiante de prueba
4. Verifica que se guarde

### Prueba de Asistencia

1. Ve a "Asistencia"
2. Crea una sesión de prueba
3. Toma asistencia
4. Verifica que se guarde

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error "Invalid API key"
- Verifica que las variables de entorno en Vercel sean correctas
- Asegúrate que estén las dos: URL y ANON_KEY

### Error "Table not found"
- El script SQL no se ejecutó correctamente
- Ve a Supabase → SQL Editor y ejecuta el script de nuevo

### Error "Permission denied"
- Ve a Supabase → Authentication → Users
- Verifica que el usuario admin exista
- Ve a Table Editor → profiles
- Verifica que el role sea "admin"

### Error "Cannot connect to database"
- En desarrollo local: verifica archivo `.env.local`
- En producción: verifica variables en Vercel Dashboard

---

## 📊 LIMITACIONES DEL PLAN GRATUITO

### Supabase (Plan Gratis):
- ✅ **Base de datos:** 500MB (suficiente para ~5,000 estudiantes)
- ✅ **Auth:** Ilimitado usuarios
- ✅ **API:** Ilimitado (límite 2GB transferencia)
- ✅ **Tiempo:** Nunca expira

### Vercel (Plan Gratis):
- ✅ **Ancho de banda:** 100GB/mes
- ✅ **Builds:** Ilimitados
- ✅ **Dominio:** SSL gratis
- ✅ **Tiempo:** Siempre activo

**Para su uso (cada 15 días):** ¡Perfectamente suficiente!

---

## 🔐 SEGURIDAD IMPORTANTE

### Cambiar Contraseña Admin
1. Ingresa como admin
2. Ve al menú de usuario (arriba a la derecha)
3. Cambia la contraseña
4. Cierra sesión y vuelve a entrar

### Crear Usuarios para Voluntarios
1. Ingresa como admin
2. Ve a Authentication → Users
3. Crea usuarios para cada voluntario
4. Asigna roles según necesidad

### Backup de Datos (Mensual)
1. Ve a Supabase → Database → Backups
2. Click "Create backup"
3. Descarga el archivo
4. Guárdalo en Google Drive o similar

---

## 💡 CONSEJOS DE USO

1. **Primera vez que entran:** Puede tardar 5-10 segundos en cargar (normal)
2. **Añadir acudientes:** Funciona perfectamente con Supabase
3. **Fotos de estudiantes:** Se pueden subir a Storage de Supabase
4. **Reportes:** Disponibles en la sección de Asistencia

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa los logs en Vercel (Deployments → View logs)
2. Revisa los logs en Supabase (Logs → API)
3. Verifica que todas las tablas existan (Table Editor)

---

**Hecho con 💙 para los voluntarios de ReeAmor**
