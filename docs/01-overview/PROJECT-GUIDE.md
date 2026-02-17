# Amor Acción - Sistema de Asistencia

Sistema de gestión de asistencia estudiantil para organizaciones sin fines de lucro. Desarrollado con ❤️ para facilitar el trabajo de voluntarios.

## 🚀 Tecnología

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Despliegue:** Vercel (gratuito)

## 🎯 Funcionalidades

✅ **Completadas:**
- Autenticación y gestión de usuarios
- Gestión de múltiples sedes/campus
- Registro completo de estudiantes con acudientes
- Gestión de años escolares
- Subida de logos y fotos (Supabase Storage)
- Diseño responsive y elegante

📝 **Pendientes:**
- Sistema de toma de asistencia diaria
- Reportes y estadísticas
- Gestión de clases/grupos

## 🛠️ Instalación Local

### 1. Clonar y entrar al proyecto
```bash
git clone <tu-repositorio>
cd AttendanceSystem/frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

### 4. Ejecutar
```bash
npm run dev
```

Abrir: http://localhost:5173

### Docker (alternativa)
```bash
docker-compose up -d
```

## 📊 Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar `supabase-schema.sql` en SQL Editor
3. Ejecutar `supabase-storage-setup.sql` para storage
4. Crear usuario admin: `admin@colegio.edu` / `changeme123`

## 🚀 Despliegue en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Deploy automático en cada push

## 📁 Estructura

```
AttendanceSystem/
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la app
│   │   ├── lib/            # APIs y utilidades
│   │   │   ├── supabaseClient.ts
│   │   │   ├── supabaseApi.ts
│   │   │   ├── storageApi.ts
│   │   │   └── LEGACY/     # Código antiguo (no usar)
│   │   └── store/          # Estado global
│   ├── .env                # Variables de entorno
│   └── package.json
├── supabase-schema.sql     # Esquema de BD
├── supabase-storage-setup.sql  # Config Storage
├── docker-compose.yml      # Docker local
└── README.md
```

## 🔑 Acceso

- **Email:** admin@amoraccion.com
- **Password:** A1morA2ccion

## 📄 Licencia

MIT - Libre uso para proyectos sociales

## 💝 Créditos

Desarrollado para Amor Acción y organizaciones similares que trabajan con niños en situación vulnerable.
