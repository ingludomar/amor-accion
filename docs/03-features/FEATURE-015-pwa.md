# Feature-015: PWA Instalable

## Información General
- **ID**: FEATURE-015
- **Prioridad**: Baja
- **Estado**: 🟢 Pendiente
- **Rama**: `dev-feature-pwa`
- **Fecha estimada**: Por definir

## Descripción
Convertir la app en una Progressive Web App (PWA) para que pueda instalarse como aplicación nativa en celulares Android e iOS, sin pasar por una tienda de apps.

## Contexto
- Los profesores usan el celular para tomar asistencia
- Una app instalable mejora la experiencia y el acceso rápido
- Vercel soporta PWA sin configuración adicional

---

## Especificaciones Técnicas

### Librería
```bash
npm install vite-plugin-pwa -D
```

### Configuración en `vite.config.ts`
```typescript
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Amor Acción - Asistencia',
    short_name: 'Amor Acción',
    theme_color: '#2563EB',
    background_color: '#F9FAFB',
    display: 'standalone',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ]
  }
})
```

### Íconos necesarios
- `/public/icon-192.png` — 192×192 px
- `/public/icon-512.png` — 512×512 px

### Service Worker
- Cache básico para dashboard y listados
- Estrategia: NetworkFirst (datos siempre frescos cuando hay conexión)

### Botón de instalación
- Banner o botón en `/settings`: "Instalar aplicación"
- Usar evento `beforeinstallprompt` del navegador

---

## Archivos a modificar/crear

- `frontend/vite.config.ts` — agregar VitePWA plugin
- `frontend/public/icon-192.png` (nuevo)
- `frontend/public/icon-512.png` (nuevo)
- `frontend/src/pages/Settings.tsx` — botón instalar

---

## Criterios de Aceptación

- [ ] App instalable en Android (Chrome)
- [ ] App instalable en iOS (Safari → "Agregar a inicio")
- [ ] Íconos correctos en pantalla de inicio
- [ ] Funciona offline para vistas ya cargadas
- [ ] Botón de instalación visible en Settings
