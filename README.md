# Sistema Productivo Kompensa - Automatización de Certificación de Transmisiones

Sistema completo de verificación y certificación de transmisiones publicitarias en n8n con Supabase como backend.

## Arquitectura

- **n8n**: Orquestador de flujos
- **Supabase**: Backend (base de datos)
- **Google Sheets**: Vista humana temporal
- **Google Drive**: Almacenamiento de PDFs y plantillas
- **Gmail**: Entrada de órdenes y salida de certificados
- **API de Detecciones**: Fuente de datos de transmisiones

## Estructura del Proyecto

```
Kompensa/
├── supabase-migrations.sql          # Migraciones SQL para Supabase
├── flujo-a-ingesta-ordenes.json     # Flujo n8n: Ingesta de órdenes por correo
├── flujo-b-ejecucion-automatica.json # Flujo n8n: Ejecución automática diaria/semanal
└── README.md                        # Esta documentación
```

## Instalación y Configuración

### 1. Configurar Supabase

1. Crear un nuevo proyecto en [Supabase](https://supabase.com)
2. Ir a **SQL Editor**
3. Ejecutar el contenido completo de `supabase-migrations.sql`
4. Verificar que se crearon las 3 tablas:
   - `ordenes_transmision`
   - `resumen_campaña`
   - `certificados_emitidos`

5. Obtener las credenciales:
   - **URL del proyecto**: `https://[tu-proyecto].supabase.co`
   - **Service Role Key**: En Settings → API → service_role key (secreto)

### 2. Configurar Credenciales en n8n

#### 2.1 Credenciales de Supabase

1. En n8n, ir a **Credentials** → **Add Credential**
2. Seleccionar **Supabase**
3. Configurar:
   - **Host**: URL de tu proyecto Supabase (sin `https://`)
   - **Service Role Secret**: Service Role Key obtenida anteriormente

#### 2.2 Credenciales de Google

Necesitarás configurar OAuth2 para:
- **Google Drive** (para plantillas y PDFs)
- **Google Sheets** (para vista humana)
- **Google Docs** (para actualizar plantillas)
- **Gmail** (para recibir órdenes y enviar certificados)

1. Para cada servicio, crear credenciales OAuth2 en n8n
2. Usar la misma cuenta de Google Workspace para todos

#### 2.3 Credenciales del API de Detecciones

1. El API está en: `https://monitoreodigital.net/nueva_app_flask/api/v1/detections`
2. Obtener la API Key del proveedor
3. Configurar como variable de entorno en n8n (ver sección 3)

### 3. Variables de Entorno en n8n

Configurar las siguientes variables de entorno en n8n:

```bash
# API de Detecciones
# Nota: La URL está hardcodeada en el flujo, solo necesitas la API Key
API_DETECCIONES_KEY=tu-api-key-aqui

# Modo de ejecución: 'diario' (pruebas) o 'semanal' (producción)
MODO_EJECUCION=diario
```

**Nota**: En producción, cambiar `MODO_EJECUCION` a `semanal`.

### 4. Importar Flujos en n8n

#### 4.1 Flujo A: Ingesta de Órdenes

1. En n8n, ir a **Workflows** → **Import from File**
2. Seleccionar `flujo-a-ingesta-ordenes.json`
3. Configurar las credenciales en cada nodo:
   - **Gmail Trigger**: Usar credenciales de Gmail configuradas
   - **Supabase: Insert Orden**: Usar credenciales de Supabase
   - **Google Drive: Guardar Adjunto**: Usar credenciales de Google Drive

4. **Importante**: Configurar el label de Gmail:
   - Crear un label en Gmail llamado `Orden_Transmision`
   - Aplicar este label a los correos que contengan órdenes

#### 4.2 Flujo B: Ejecución Automática

1. Importar `flujo-b-ejecucion-automatica.json`
2. Configurar credenciales en todos los nodos
3. Ajustar IDs de Google Drive/Docs según tu configuración:
   - **Plantilla de Certificado**: Actualizar `fileId` en nodo "Google Drive: Copy Template"
   - **Carpeta de Certificados**: Actualizar `folderId` en nodos de Drive
   - **Google Sheets Log**: Actualizar `documentId` en nodo "Google Sheets: Append/Update"

### 5. Configurar Triggers

#### 5.1 Flujo A: Gmail Trigger

El trigger está configurado para ejecutarse cada minuto y buscar correos con el label `Orden_Transmision`.

**Formato esperado del correo**:

```
Cliente: [Nombre del Cliente]
Campaña: [Nombre de la Campaña]
Emisora: [Nombre de la Emisora]
Cuñas diarias: [Número]
Total cuñas: [Número]
Periodo: [DD/MM/YYYY - DD/MM/YYYY]
```

**Campos opcionales**:
- Spot ID
- Spot Name
- Agencia
- Duración (segundos)
- Horario
- Ciudad

#### 5.2 Flujo B: Cron Trigger

El trigger está configurado para ejecutarse diariamente a las 8:00 AM.

**Para cambiar a modo semanal**:
1. Editar el nodo "Cron Trigger - Diario"
2. Cambiar la expresión cron a: `0 8 * * 0` (domingos a las 8 AM)
3. O mantener diario y el sistema generará certificados solo los domingos

**Expresiones cron útiles**:
- Diario a las 8 AM: `0 8 * * *`
- Domingos a las 8 AM: `0 8 * * 0`
- Lunes a las 8 AM: `0 8 * * 1`

### 6. Configurar Google Drive

#### 6.1 Carpetas Necesarias

Crear las siguientes carpetas en Google Drive:

1. **Carpeta de Órdenes**: Para respaldar adjuntos de correos
   - ID de carpeta: Actualizar en nodo "Google Drive: Guardar Adjunto" (Flujo A)

2. **Carpeta de Certificados**: Para almacenar PDFs generados
   - ID de carpeta: Actualizar en nodos de Drive (Flujo B)

#### 6.2 Plantilla de Certificado

1. Crear un documento de Google Docs con la plantilla del certificado
2. Usar variables de reemplazo:
   - `{{Cliente}}`
   - `{{Producto}}`
   - `{{Emisora}}`
   - `{{Periodo_Inicio}}`
   - `{{Periodo_Fin}}`
   - `{{Transmitidas}}`
   - `{{Contratadas}}`
   - `{{Faltantes}}`
   - `{{Excedentes}}`
   - `{{Estado}}`
   - `{{Porcentaje_Cumplimiento}}`
   - `{{FechaEmision_Certificado}}`

3. Obtener el ID del documento y actualizar en el nodo "Google Drive: Copy Template"

### 7. Configurar Google Sheets (Vista Humana)

1. Crear una hoja de cálculo en Google Sheets
2. Crear columnas:
   - Fecha
   - Cliente
   - Campaña
   - Transmitidas_Semana
   - Faltantes
   - Estado
   - Link_PDF

3. Obtener el ID del documento y actualizar en el nodo "Google Sheets: Append/Update"

## Reglas de Negocio Implementadas

1. **Día sin transmisión**: Se registra 0 (no se cuenta como negativo)
2. **Transmisión mayor a contratado**: Válido, estado = "en_compensacion"
3. **Cumplimiento global**: Se evalúa el acumulado, no el día puntual
4. **Faltantes**: `max(0, contratadas - transmitidas_acum)`
5. **Excedentes**: `max(0, transmitidas_acum - contratadas)`

## Estados de Campaña

- **cumple**: Transmitidas >= Contratadas (sin excedentes)
- **atrasado**: Transmitidas < Contratadas
- **en_compensacion**: Transmitidas > Contratadas

## Modos de Operación

### Modo Diario (Pruebas)
- Ejecuta todos los días
- Calcula métricas del día actual
- No genera certificados (solo actualiza resumen)

### Modo Semanal (Producción)
- Ejecuta los domingos
- Calcula métricas de la semana (lunes a domingo)
- Genera certificado PDF al finalizar la semana
- Envía certificado por correo

## Estructura de Base de Datos

### Tabla: `ordenes_transmision`
Almacena las órdenes de transmisión recibidas por correo.

### Tabla: `resumen_campaña`
Resumen diario de transmisiones por campaña. Se actualiza cada ejecución.

### Tabla: `certificados_emitidos`
Registro de certificados PDF generados semanalmente. Incluye URL del PDF y fecha de envío.

## Filtrado de Detecciones

El sistema **NO** filtra en el API, sino localmente en n8n según:
- `spot_name` o `spot_id` (coincidencia parcial o exacta)
- `channel_name` o `emisora` (coincidencia parcial)
- Rango de fechas del período de la orden

## Troubleshooting

### Error: "Faltan campos requeridos en la orden"
- Verificar que el correo tenga el formato correcto
- Revisar el parsing en el nodo "Code: Parsear Orden"
- Ajustar regex según formato real de los correos

### Error: "API de Detecciones no responde"
- Verificar variables de entorno `API_DETECCIONES_URL` y `API_DETECCIONES_KEY`
- Verificar conectividad desde n8n
- Revisar logs del nodo "HTTP Request: API Detecciones"

### Certificados no se generan
- Verificar que `MODO_EJECUCION=semanal`
- Verificar que sea domingo (o ajustar condición en nodo IF)
- Verificar permisos en Google Drive y Docs

### Datos no se guardan en Supabase
- Verificar credenciales de Supabase
- Verificar que las migraciones se ejecutaron correctamente
- Revisar logs del nodo Supabase

## Próximos Pasos

1. Probar Flujo A con un correo de prueba
2. Probar Flujo B con datos de prueba del API
3. Validar que los certificados se generan correctamente
4. Activar en producción cambiando `MODO_EJECUCION` a `semanal`

## Soporte

Para problemas o preguntas, contactar al equipo de desarrollo.

