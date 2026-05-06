# Plantilla de Email para Orden de Transmisión - Sistema Kompensa

## 📋 Instrucciones Rápidas

Para enviar una orden de transmisión al sistema Kompensa, sigue estos pasos:

1. **Copia la plantilla** que aparece más abajo
2. **Completa todos los campos requeridos** (marcados con *)
3. **Opcionalmente completa los campos adicionales** si aplican
4. **Envía el email** con la etiqueta "Orden_Transmision" en Gmail
5. El sistema procesará automáticamente tu orden

---

## ✅ Campos Requeridos

Los siguientes campos son **obligatorios** y deben estar presentes en tu email:

- **Cliente*** - Nombre del cliente o empresa
- **Campaña*** (o Producto) - Nombre de la campaña publicitaria o producto
- **Emisora*** (o Estación) - Nombre de la emisora de radio donde se transmitirá
- **Cuñas Diarias*** - Número de cuñas que deben transmitirse cada día
- **Total Contratadas*** - Total de cuñas contratadas para todo el período
- **Periodo Inicio*** - Fecha de inicio (formato: DD/MM/YYYY)
- **Periodo Fin*** - Fecha de fin (formato: DD/MM/YYYY)

---

## 📝 Campos Opcionales

Estos campos pueden incluirse si aplican a tu orden:

- **Agencia** - Nombre de la agencia publicitaria (si aplica)
- **Horario** - Horario preferido de transmisión (ej: "08:00 - 20:00")
- **Ciudad** - Ciudad donde se transmite la campaña
- **Email Cliente** - Se toma automáticamente del remitente si no se especifica

---

## ⚠️ Campos que NO debes incluir

Los siguientes campos se obtienen **automáticamente** de la API de detecciones y no es necesario proporcionarlos:

- ❌ **Spot ID** - Se obtiene automáticamente
- ❌ **Spot Name** - Se obtiene automáticamente
- ❌ **Duración** - Se obtiene automáticamente de la API

---

## 📧 Plantilla de Email (Formato Lista Simple)

Copia y pega esta plantilla en tu email, completando los campos:

```
═══════════════════════════════════════════════════════════
ORDEN DE TRANSMISIÓN
═══════════════════════════════════════════════════════════

Cliente:            [Nombre del Cliente]
Campaña:            [Nombre de la Campaña]
Emisora:            [Nombre de la Emisora]
Cuñas Diarias:      [Número de cuñas por día]
Total Contratadas:  [Total de cuñas contratadas]
Periodo Inicio:     [DD/MM/YYYY]
Periodo Fin:        [DD/MM/YYYY]

[Campos Opcionales]
Agencia:            [Nombre de la Agencia]
Horario:            [Ej: 08:00 - 20:00]
Ciudad:             [Ciudad donde se transmite]

═══════════════════════════════════════════════════════════
```

---

## 📧 Plantilla de Email (Formato Tabla - Alternativa)

Si prefieres un formato más estructurado, puedes usar esta versión con tabla:

```
┌─────────────────────┬─────────────────────────────────────────┐
│ Campo               │ Valor                                   │
├─────────────────────┼─────────────────────────────────────────┤
│ Cliente:            │ [Nombre del Cliente]                      │
│ Campaña:            │ [Nombre de la Campaña]                    │
│ Emisora:            │ [Nombre de la Emisora]                   │
│ Cuñas Diarias:      │ [Número]                                 │
│ Total Contratadas:  │ [Número]                                 │
│ Periodo Inicio:     │ [DD/MM/YYYY]                             │
│ Periodo Fin:        │ [DD/MM/YYYY]                             │
│                     │                                         │
│ [Opcionales]        │                                         │
│ Agencia:            │ [Nombre de la Agencia]                   │
│ Horario:            │ [Ej: 08:00 - 20:00]                      │
│ Ciudad:             │ [Ciudad]                                │
└─────────────────────┴─────────────────────────────────────────┘
```

---

## 📄 Ejemplo Completo

Aquí tienes un ejemplo real con datos de muestra:

```
═══════════════════════════════════════════════════════════
ORDEN DE TRANSMISIÓN
═══════════════════════════════════════════════════════════

Cliente:            Mango Bajito
Campaña:            Mango Bajito | Tiendas Mango Bajito | Eso es un mango bajito
Emisora:            Radiorama Stereo
Cuñas Diarias:      6
Total Contratadas:  42
Periodo Inicio:     06/01/2026
Periodo Fin:        13/01/2026

[Campos Opcionales]
Agencia:            Agencia Publicitaria XYZ
Horario:            08:00 - 20:00
Ciudad:             Caracas

═══════════════════════════════════════════════════════════
```

---

## 📌 Notas Importantes

### Formato de Fechas
- Usa el formato **DD/MM/YYYY** o **DD-MM-YYYY**
- Ejemplos válidos: `06/01/2026`, `06-01-2026`, `13/01/2026`

### Números
- Los campos numéricos (Cuñas Diarias, Total Contratadas) deben ser números enteros
- No incluyas decimales ni texto adicional

### Etiqueta de Gmail
- **IMPORTANTE**: El email debe tener la etiqueta **"Orden_Transmision"** en Gmail
- Sin esta etiqueta, el sistema no procesará automáticamente tu orden
- Puedes crear la etiqueta en Gmail si no existe

### Campos Alternativos
El sistema acepta variantes de nombres de campos:
- **Campaña** o **Producto**
- **Emisora** o **Estación**
- **Cuñas Diarias** o **Cuñas por día**
- **Total Contratadas** o **Total cuñas** o **Total**

### Procesamiento Automático
- Una vez enviado el email con el formato correcto, el sistema:
  1. Extraerá automáticamente los datos
  2. Guardará la orden en la base de datos
  3. Guardará los adjuntos (si los hay) en Google Drive
  4. Te confirmará el procesamiento

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si olvido un campo requerido?
El sistema te notificará qué campos faltan y no procesará la orden hasta que estén completos.

### ¿Puedo enviar adjuntos?
Sí, puedes adjuntar archivos al email. El sistema los guardará automáticamente en Google Drive.

### ¿Cómo sé si mi orden fue procesada?
El sistema procesará automáticamente las órdenes que tengan:
- La etiqueta "Orden_Transmision" en Gmail
- Todos los campos requeridos
- Formato correcto

### ¿Puedo usar otro formato de fecha?
El sistema acepta:
- DD/MM/YYYY (ej: 06/01/2026)
- DD-MM-YYYY (ej: 06-01-2026)
- YYYY/MM/DD (ej: 2026/01/06)

### ¿Qué pasa con los campos técnicos (Spot ID, Spot Name, Duración)?
Estos campos se obtienen automáticamente de la API de detecciones cuando el sistema verifica las transmisiones. No es necesario proporcionarlos en el email.

### ¿Puedo enviar múltiples órdenes en un solo email?
No, envía una orden por email para asegurar el procesamiento correcto.

---

## 📞 Soporte

Si tienes dudas o problemas al enviar tu orden, contacta al equipo de Kompensa.

---

**Última actualización**: Enero 2026

