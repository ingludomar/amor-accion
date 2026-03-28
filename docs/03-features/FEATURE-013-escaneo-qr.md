# Feature-013: Escaneo QR en Asistencia

## Información General
- **ID**: FEATURE-013
- **Prioridad**: Media
- **Estado**: 🟡 Pendiente
- **Rama**: `dev-feature-qr-asistencia`
- **Fecha estimada**: Por definir

## Descripción
Tomar asistencia escaneando el carnet QR del estudiante con la cámara del celular, como alternativa al listado manual.

## Contexto
- El carnet del estudiante ya incluye un QR con su `student_code`
- Los profesores usan el celular para tomar asistencia → el escaneo sería natural
- Complementa (no reemplaza) el listado manual actual

---

## Especificaciones Técnicas

### Flujo
1. En la vista "Tomar asistencia", botón "Escanear QR"
2. Se abre la cámara del dispositivo
3. Al detectar un QR: decodifica → obtiene `student_code`
4. Busca el estudiante en la sesión activa
5. Lo marca como Presente automáticamente
6. Muestra feedback: nombre del estudiante + confirmación visual
7. Continúa escaneando (modo continuo)

### Librería sugerida
```bash
npm install html5-qrcode
# o
npm install @zxing/browser
```

### Componente nuevo
```
components/QRScanner.tsx
```

### Consideraciones
- Requiere permiso de cámara en el navegador
- Funcionar en móvil (prioridad) y desktop con cámara
- Manejar error si QR no corresponde a ningún estudiante del grupo

---

## Archivos a modificar/crear

- `frontend/src/components/QRScanner.tsx` (nuevo)
- `frontend/src/pages/Attendance.tsx` — integrar botón y scanner

---

## Criterios de Aceptación

- [ ] Botón "Escanear QR" visible en vista de tomar asistencia
- [ ] Cámara se abre correctamente en móvil y desktop
- [ ] Escaneo correcto → estudiante marcado presente
- [ ] QR inválido → mensaje de error amigable
- [ ] Funciona en Chrome móvil (Android e iOS)
