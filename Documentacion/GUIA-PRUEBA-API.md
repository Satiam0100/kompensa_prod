# Guía: Probar API de Detecciones

Este flujo de prueba te permite verificar qué devuelve el API de detecciones y entender su estructura antes de modificar los flujos principales.

## Pasos para Probar

### 1. Importar el Flujo

1. En n8n, ir a **Workflows** → **Import from File**
2. Seleccionar `flujo-prueba-api-detecciones.json`
3. El flujo se importará con el nombre "Kompensa - Prueba API Detecciones"

### 2. Configurar Variables de Entorno

Antes de ejecutar, asegúrate de tener configurada la variable de entorno:

```bash
API_DETECCIONES_KEY=tu_clave_real_aqui
```

**Nota**: Si no tienes la clave configurada, el flujo usará `clave_demo_123` como fallback (puede que no funcione).

### 3. Ajustar Parámetros (Opcional)

El flujo está configurado para:
- **start_date**: 7 días atrás desde hoy
- **end_date**: Hoy
- **page**: 1
- **limit**: 100

Puedes modificar estos valores en el nodo **"Set: Parámetros API"** si necesitas probar con otras fechas.

### 4. Ejecutar el Flujo

1. Hacer clic en el botón **"Execute Workflow"** (o presionar el botón de play)
2. El flujo se ejecutará y mostrará los resultados

### 5. Analizar los Resultados

El nodo **"Code: Analizar Respuesta"** te mostrará:

#### Información General
- `status`: Estado de la respuesta (success/error)
- `client`: Nombre del cliente asociado a la API key
- `paginacion`: Información sobre paginación
  - `pagina_actual`
  - `por_pagina`
  - `total_registros`
  - `total_paginas`
  - `periodo`: { start, end }

#### Estructura de Datos
- `estructura_deteccion`: Campos y tipos de datos de cada detección
- `ejemplo_deteccion`: Primera detección completa para inspección
- `total_detecciones_recibidas`: Cantidad de detecciones en esta página

#### Agrupaciones
- `por_canal`: Conteo por nombre de canal
- `por_spot`: Conteo por nombre de spot
- `por_ciudad`: Conteo por ciudad
- `por_fecha`: Conteo por fecha (extraído de datetime_utc)

#### Resumen
- `mensaje`: Mensaje descriptivo
- `total_registros`: Total de registros disponibles
- `registros_en_pagina`: Registros en la página actual
- `tiene_mas_paginas`: Boolean indicando si hay más páginas
- `campos_por_deteccion`: Cantidad de campos en cada detección

#### Respuesta Completa
- `respuesta_completa`: La respuesta JSON completa del API para inspección detallada

## Qué Buscar en los Resultados

### 1. Verificar Estructura de Campos

Revisa `estructura_deteccion.campos` para ver todos los campos disponibles. Según la documentación deberías ver:
- `datetime_utc`
- `channel_id`
- `channel_name`
- `city`
- `spot_name`
- `spot_id`
- `duration_seg`

### 2. Verificar Formato de Fechas

Revisa `ejemplo_deteccion.datetime_utc` para ver el formato exacto:
- ¿Es `2025-11-01T14:30:00`?
- ¿Incluye timezone?
- ¿Necesitamos parsearlo de alguna forma especial?

### 3. Verificar Valores de Filtrado

Revisa las agrupaciones para entender:
- **Por canal**: ¿Qué valores tiene `channel_name`? ¿Coinciden con las emisoras en las órdenes?
- **Por spot**: ¿Qué valores tiene `spot_name`? ¿Coinciden con los spots en las órdenes?
- **Por ciudad**: ¿Hay ciudades que necesitemos filtrar?

### 4. Verificar Paginación

Revisa `paginacion`:
- ¿Cuántos registros totales hay?
- ¿Cuántas páginas?
- ¿Necesitamos hacer múltiples requests para obtener todos los datos?

## Próximos Pasos Después de la Prueba

Una vez que tengas los resultados:

1. **Anotar la estructura real** de los datos
2. **Comparar con lo esperado** en los flujos principales
3. **Ajustar los flujos** según sea necesario:
   - Actualizar nombres de campos en el código de filtrado
   - Ajustar parsing de fechas
   - Modificar lógica de agrupación
   - Ajustar manejo de paginación

## Ejemplo de Uso

1. Ejecutar el flujo
2. Revisar el output del nodo "Set: Resultado Final"
3. Copiar `ejemplo_deteccion` para ver la estructura exacta
4. Verificar `agrupaciones` para entender los valores posibles
5. Usar esta información para actualizar `flujo-b-ejecucion-automatica.json`

## Troubleshooting

### Error 401 Unauthorized
- Verificar que `API_DETECCIONES_KEY` esté configurada correctamente
- Verificar que la clave sea válida y el cliente esté activo

### Error 400 Bad Request
- Verificar formato de fechas (debe ser YYYY-MM-DD)
- Verificar que todos los parámetros requeridos estén presentes

### No hay datos en la respuesta
- Verificar que el rango de fechas tenga datos
- Intentar con un rango más amplio
- Verificar que el cliente tenga detecciones en ese período

### La respuesta tiene estructura diferente
- Anotar la estructura real
- Actualizar el código de análisis en el nodo "Code: Analizar Respuesta"
- Ajustar los flujos principales según la estructura real

