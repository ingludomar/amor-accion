# 🚀 Guía de Despliegue AmorAccion

## 📋 PASOS RÁPIDOS

### 1. Preparar Proyecto
```bash
git init
git add .
git commit -m "Primer commit AmorAccion"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/amoraccion.git
git push -u origin main
```

### 2. Backend en Railway
- Ve a https://railway.app
- New Project → Deploy from GitHub repo
- Selecciona tu repo
- Variables → Agrega:
  - SECRET_KEY=tu-clave-larga-y-segura
  - CORS_ORIGINS=["https://amoraccion.vercel.app"]
- New → Database → PostgreSQL
- Settings → Start Command:
  ```
  cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

### 3. Frontend en Vercel
- Ve a https://vercel.com
- Add New Project → Importar repo
- Root Directory: frontend
- Framework: Vite
- Variable: VITE_API_URL=https://tu-app.up.railway.app
- Deploy

### 4. Ejecutar Seed
En Railway → Run Command:
```bash
cd backend && python seed_initial.py
```

### 5. URLs
- Frontend: https://amoraccion.vercel.app
- Backend: https://tu-app.up.railway.app

## 🔐 Credenciales
- Email: admin@colegio.edu
- Password: changeme123

## ⚠️ Importante
- Usen la app cada 15 días: Perfecto
- Primera carga: Esperar 30-60 segundos (cold start)
- Backup mensual recomendado
