# Flujo B — Monitoreo y certificación

Orquesta el **monitoreo diario** de campañas activas y el **cierre con PDF + email** cuando termina el periodo de la orden.

## Archivos en el repo

| Archivo | Uso |
|---------|-----|
| `flujo-b-ejecucion-automatica.json` | **Fuente de verdad** — importar en n8n |
| `flujo-b-live-patched.json` | Copia sincronizada (misma lógica) |
| `scripts/sync-flujo-b.mjs` | Regenera ambos JSON desde el parche + credenciales base |

```bash
node scripts/sync-flujo-b.mjs
```

## Ciclo de vida

1. **Cron diario** (8:00) o **Manual Trigger**
2. Lee órdenes `estado = activa` en Supabase
3. Por cada campaña: API detecciones (**periodo_inicio → hoy**) → métricas acumuladas → `resumen_campaña`
4. Si `fecha_hoy > periodo_fin` **y** hay métricas → certificado final (día **siguiente** al cierre; si vence el 25, el cron del 26 a las 8:00):
   - Google Docs → PDF → Drive
   - `certificados_emitidos`
   - Email a `email_cliente` (campo obligatorio en `/ordenes/nueva`)
   - **`estado = finalizada`** en la orden

## Credenciales n8n

El JSON usa la credencial **Kompensa** (Supabase prod `xtjnwkojcyudewqbbrkm`). IDs en `scripts/n8n-kompensa-credentials.mjs`.

Tras importar, verifica que n8n resuelva todas las credenciales Google/Gmail como **Kompensa**.

## Importar en n8n

1. Abre el workflow **Kompensa - Flujo B: Ejecución Automática**
2. Menú ⋯ → **Import from File** → `flujo-b-ejecucion-automatica.json`
3. Reasigna credenciales (Supabase, Google, Gmail) si n8n lo pide
4. Activa el workflow y el **Cron Trigger - Diario**

## Prueba manual (cierre)

1. Crear orden en el panel con `periodo_fin` = **ayer** (el certificado se emite al día siguiente del fin de campaña)
2. En **Code: Calcular Fechas**, simular `FECHA_EJECUCION_PRUEBA` = hoy (día posterior a `periodo_fin`)
3. Ejecutar **Manual Trigger - Ejecutar Flujo B**
3. Verificar:
   - Fila en `certificados_emitidos`
   - PDF en Drive
   - Email recibido
   - Orden con `estado = finalizada`

## Fecha de prueba

En el nodo **Code: Calcular Fechas**, `FECHA_EJECUCION_PRUEBA`:

- `null` → fecha real (producción)
- `'2026-06-25'` → simular un día dentro de la campaña (las órdenes Mavesa empiezan `2026-06-01`)

**Importante:** si `hoy < periodo_inicio`, el `end_date` de la API debe ser `periodo_inicio` (no `hoy`). Si `end_date` queda antes que `start_date`, la API responde `total_records: 0`.

## Métricas de campaña

El monitoreo diario consulta la API desde **`periodo_inicio`** hasta el **fin de evaluación**:

- En curso: hasta **ayer** si hoy es el último día de campaña (el cron a las 8:00 no incluye cuñas del día en curso).
- Tras el fin: hasta **`periodo_fin`** completo (desde el día siguiente al cierre).

**Cierre (PDF, email, finalizar orden):** solo cuando `fecha_hoy > periodo_fin` (p. ej. vence 25/06 → certificado el 26/06 a las 8:00).

Calcula:

- `transmitidas_acumuladas` — total desde el inicio de la campaña
- `total_contratadas_periodo` — `min(cuñas_diarias × días transcurridos, total_contratadas)`; en cierre, el total contratado
- `faltantes` — meta acumulada a la fecha menos transmitidas

La ventana semanal en **Code: Calcular Fechas** se usa solo para nombrar la carpeta en Google Drive.

Lógica fuente: `scripts/flujo-b-calcular-metricas.js` (aplicada con `scripts/patch-flujo-b-campana-completa.mjs`).

### Desplegar en n8n prod

El workflow live **Kompensa - Certificados** (`GatzQWNdzkAL2Gp3`) usa nodos con sufijo `1`. Tras cambiar la lógica en el repo:

```bash
node scripts/build-n8n-deploy-ops.mjs
```

Actualiza manualmente en n8n (o vía API) estos nodos:

| Nodo | Cambio |
|------|--------|
| **HTTP Request: API Detecciones - Página** | `end_date` alineado con fin de evaluación (excluye último día en curso; post-cierre usa `periodo_fin`) |
| **Code: Calcular Métricas1** | `cierre` = `fecha_hoy > periodo_fin`; pegar `scripts/flujo-b-calcular-metricas-prod.js` |
| **IF: Generar Certificado1** | Usa `m.cierre` del nodo de métricas (no `fecha_hoy >= periodo_fin`) |
| **Gmail: Send Email1** | Asunto: "Periodo" en lugar de "Semana" |
| **Google Docs: Update Document1** | Reemplazo `{{NumeroCertificado}}` desde `orden.numero_certificado` |
| **Supabase: Insert Certificado1** | Campo `numero_certificado` = snapshot del número al emitir |

### N.º de certificado (`{{NumeroCertificado}}`)

El panel guarda el valor en `ordenes_transmision.numero_certificado`. Al emitir, n8n copia ese valor a `certificados_emitidos.numero_certificado` (histórico). El `codigo_certificado` interno lo sigue generando el trigger de BD si no se envía.

En n8n prod, nodo **Google Docs: Update Document1** → **Add action** → **Replace all**:

| Campo | Valor |
|-------|--------|
| **text** | `{{NumeroCertificado}}` |
| **replaceText** | `={{ $('Code: Calcular Métricas1').first().json.orden.numero_certificado \|\| '—' }}` |

En **Supabase: Insert Certificado1** → añadir campo:

| fieldId | fieldValue |
|---------|------------|
| `numero_certificado` | `={{ $('Code: Calcular Métricas1').first().json.orden.numero_certificado \|\| null }}` |

No mapees `codigo_certificado` en n8n: el trigger `generar_codigo_certificado()` crea `cert-{id}-{fecha}` cuando queda null.

## Dependencias

- Supabase: `ordenes_transmision`, `resumen_campaña`, `certificados_emitidos`
- API detecciones: key en nodo **Set: API Key**
- Panel web: órdenes creadas en `/ordenes/nueva` (no ingesta por correo)
