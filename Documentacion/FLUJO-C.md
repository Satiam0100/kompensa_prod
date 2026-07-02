# Flujo C — Monitoreo semanal

Reporte de la **semana anterior** (lunes–domingo) para órdenes **activas**. Persiste en `monitoreo_semanal` y **no escribe** en `resumen_campaña` (monitoreo diario del Flujo B).

## Archivos

| Archivo | Uso |
|---------|-----|
| `flujo-c-monitoreo-semanal.json` | Importar en n8n |
| `scripts/build-flujo-c.mjs` | Regenera el JSON desde los `.js` |
| `scripts/flujo-c-calcular-fechas.js` | Ventana semana anterior |
| `scripts/flujo-c-ventana-efectiva.js` | Semana parcial × periodo orden |
| `scripts/flujo-c-filtrar-detecciones.js` | Filtro local API |
| `scripts/meta-campana.js` | Meta por tramos / L–V (compartido B y C) |
| `scripts/flujo-c-calcular-metricas.js` | Métricas semana + acumulado |
| `supabase-migrations-tramos-cuotas.sql` | Columna `tramos_cuotas` en órdenes |

```bash
node scripts/build-flujo-c.mjs
```

## Cron

- **Lunes 8:00** (`0 8 * * 1`)
- Reporta la semana **anterior**: si hoy es lunes 2/jun, evalúa lun 26/may – dom 1/jun

Prueba: en **Code: Calcular Fechas Semanal**, `FECHA_EJECUCION_PRUEBA = '2026-06-02'` (un lunes).

## Reglas

1. Solo órdenes `estado = activa`
2. **Semana parcial:** `eval_inicio = max(semana_inicio, periodo_inicio)`, `eval_fin = min(semana_fin, periodo_fin)`
3. Sin solapamiento → skip (no insert, no envío)
4. **Contratadas semana:** suma de cuotas por día según `tramos_cuotas` (o legacy `cuñas_diarias` × todos los días). Meta acumulada con tope `total_contratadas`. Si la cuota semanal es 0 porque la campaña ya cumplió el total, el estado muestra «Cuota cumplida» en lugar de 0% ambiguo.
5. **WhatsApp** → `telefono_cliente` (obligatorio en panel)
6. **Email** → `email_cliente` si no está vacío

## Supabase

Ejecutar en SQL Editor (si no está en migraciones base):

```bash
# Contenido de supabase-migrations-monitoreo-semanal.sql
```

## Importar en n8n

1. **Import from File** → `flujo-c-monitoreo-semanal.json`
2. Credenciales **Kompensa** (Supabase, Gmail)
3. Nodo **HTTP Request: WhatsApp** → configurar URL y auth de tu proveedor (Twilio, Meta, etc.)
4. Activar **Cron Trigger - Lunes 8:00**

## Verificación

Tras ejecución manual:

- Fila en `monitoreo_semanal` por campaña/semana
- `enviado_whatsapp_at` / `enviado_email_at` si correspondió envío
- **Sin** filas nuevas atípicas en `resumen_campaña`

## Relación con otros flujos

| Flujo | Tabla | Frecuencia |
|-------|--------|------------|
| B | `resumen_campaña` | Diario |
| C | `monitoreo_semanal` | Semanal (lun 8:00) |
| B cierre | `certificados_emitidos` | Al fin de campaña |
