# 🚀 Guía de Deploy Automático a Vercel

## Configuración Paso a Paso

### 1. Crear Proyecto en Vercel

1. Ve a https://vercel.com/new
2. Importa tu repositorio de GitHub: `ingludomar/amor-accion`
3. Configura:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 2. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a **Settings** → **Environment Variables** y agrega:

```
VITE_SUPABASE_URL=https://ejfmmyjoyrkffcmhjggu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZm1teWpveXJrZmZjbWhqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzU4MjIsImV4cCI6MjA4NjQxMTgyMn0.Vyete8WKShRqXS1bqbP-85c0mQa2ffcmEb8Kyt1lQZI
```

### 3. Obtener Tokens de Vercel

En tu terminal local:

```bash
npm i -g vercel
vercel login
vercel link
```

Obtén los valores:
- `VERCEL_TOKEN`: https://vercel.com/account/tokens
- `VERCEL_ORG_ID`: En `.vercel/project.json` después de `vercel link`
- `VERCEL_PROJECT_ID`: En `.vercel/project.json` después de `vercel link`

### 4. Configurar Secrets en GitHub

Ve a tu repositorio en GitHub:
1. **Settings** → **Secrets and variables** → **Actions**
2. Agrega los siguientes secrets:

```
VERCEL_TOKEN=tu_token_aqui
VERCEL_ORG_ID=tu_org_id_aqui
VERCEL_PROJECT_ID=tu_project_id_aqui
VITE_SUPABASE_URL=https://ejfmmyjoyrkffcmhjggu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZm1teWpveXJrZmZjbWhqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzU4MjIsImV4cCI6MjA4NjQxMTgyMn0.Vyete8WKShqXS1bqbP-85c0mQa2ffcmEb8Kyt1lQZI
```

### 5. Probar Deploy

Haz un push a la rama `main`:

```bash
git add .
git commit -m "chore: Configurar deploy automático a Vercel"
git push origin main
```

Ve a **Actions** en tu repositorio de GitHub para ver el progreso del deploy.

## 📋 Checklist de Deploy

- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] Secrets configurados en GitHub
- [ ] GitHub Actions workflow activo
- [ ] Primer deploy exitoso
- [ ] URL de producción documentada

## 🔗 URLs Importantes

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Actions:** https://github.com/ingludomar/amor-accion/actions
- **GitHub Secrets:** https://github.com/ingludomar/amor-accion/settings/secrets/actions

## 📝 Notas

- Cada push a `main` activará un deploy automático
- Los deploys de pull requests crearán previews temporales
- Los errores de build se verán en la pestaña Actions de GitHub
