# Configuración de API Key para Flujo B

## Problema Común: El flujo se queda en "HTTP Request: API Detecciones"

Si el flujo se detiene en el nodo HTTP Request, es muy probable que la API key no esté configurada correctamente.

## Solución Rápida

### Paso 1: Obtener tu API Key
Obtén tu API key del proveedor del API de detecciones (monitoreodigital.net).

### Paso 2: Configurar en el Flujo

1. Abre el flujo "Kompensa - Flujo B: Ejecución Automática" en n8n
2. Busca el nodo **"Set: API Key"**
3. Edita el campo `api_key`
4. Reemplaza `TU_API_KEY_AQUI` con tu API key real

**Ejemplo:**
```
Antes: TU_API_KEY_AQUI
Después: tu_clave_real_aqui_123456
```

### Paso 3: Verificar

1. Ejecuta el flujo manualmente
2. El nodo HTTP Request debería completarse exitosamente
3. Revisa el output del nodo para ver la respuesta del API

## Alternativa: Usar Variable de Entorno

Si prefieres usar variables de entorno (más seguro):

1. En n8n, ve a **Settings** → **Environment Variables**
2. Crea una variable: `API_DETECCIONES_KEY` con tu API key
3. En el nodo "Set: API Key", cambia el valor a:
   ```
   ={{ $env.API_DETECCIONES_KEY }}
   ```

## Troubleshooting

### El request sigue fallando

1. **Verifica la API key**: Asegúrate de que sea correcta y esté activa
2. **Verifica las fechas**: El rango de fechas debe tener datos en el API
3. **Revisa los logs**: En el nodo HTTP Request, haz clic en "View Execution Data" para ver el error exacto
4. **Prueba el API directamente**: Usa el flujo de prueba (`flujo-prueba-api-detecciones.json`) para verificar que la API key funciona

### Error 401 Unauthorized
- La API key es incorrecta o está inactiva
- Contacta al proveedor del API para verificar tu clave

### Error 400 Bad Request
- Verifica el formato de las fechas (debe ser YYYY-MM-DD)
- Verifica que todos los parámetros requeridos estén presentes

### Timeout
- El API puede estar lento
- El timeout está configurado a 30 segundos
- Si necesitas más tiempo, edita el nodo HTTP Request y aumenta el timeout en las opciones

## Nota Importante

⚠️ **NUNCA** compartas tu API key públicamente o la subas a repositorios públicos.

