# Ejemplos de Configuración MatchNames

Este documento muestra ejemplos de cómo configurar el script para emparejar nombres entre contratos y archivos Excel.

## Configuración Básica

```json
{
  "contractsFile": "data/contratos.xlsx",
  "excelFile": "data/registros.xlsx",
  "plansFile": "data/planes.xlsx",
  "outputFile": "sql_output/matches.sql"
}
```

## Estructura de Archivos

### 1. Archivo de Contratos
```json
{
  "nombre": "Juan Pérez García",
  "id": 123,
  "estado": "ACTIVO"
}
```

### 2. Archivo de Registros Excel
```json
{
  "nombre": "Juan Pérez García",
  "plan": "PLAN FAMILIAR",
  "monto": 1500
}
```

### 3. Archivo de Planes
```json
{
  "nombre": "Juan Pérez García",
  "id": 456,
  "tipo": "FAMILIAR"
}
```

## Ejemplos de Emparejamiento

### 1. Emparejamiento Simple
```json
{
  "contractsFile": "data/contratos.xlsx",
  "excelFile": "data/registros.xlsx",
  "plansFile": "data/planes.xlsx",
  "outputFile": "sql_output/matches.sql"
}
```
Genera:
```sql
UPDATE contratos 
SET nombre_excel = 'Juan Pérez García',
    plan_id = 456
WHERE id = 123;
```

### 2. Emparejamiento con Normalización
El script normaliza automáticamente los nombres para:
- Convertir a minúsculas
- Eliminar acentos
- Eliminar espacios extra
- Eliminar caracteres especiales

Ejemplo:
```
"Juan Pérez García" -> "juan perez garcia"
"JUAN PÉREZ GARCÍA" -> "juan perez garcia"
"Juan  Pérez  García" -> "juan perez garcia"
```

## Uso desde Línea de Comandos

```bash
# Uso básico
node src/matchNames.js

# Especificar archivo de configuración
node src/matchNames.js -c config.json

# Especificar archivo de contratos
node src/matchNames.js --contracts data/contratos.xlsx

# Especificar archivo de registros
node src/matchNames.js --excel data/registros.xlsx

# Especificar archivo de planes
node src/matchNames.js --plans data/planes.xlsx

# Especificar archivo de salida
node src/matchNames.js --output sql_output/matches.sql
```

## Ejemplo Completo

```json
{
  "contractsFile": "data/contratos.xlsx",
  "excelFile": "data/registros.xlsx",
  "plansFile": "data/planes.xlsx",
  "outputFile": "sql_output/matches.sql"
}
```

## Notas Importantes

1. Los nombres se normalizan automáticamente para mejorar la precisión del emparejamiento.
2. Se requiere que los tres archivos (contratos, registros y planes) estén presentes.
3. El script genera sentencias SQL UPDATE para actualizar los registros en la base de datos.
4. Los nombres deben coincidir exactamente después de la normalización.
5. Se recomienda revisar los resultados antes de ejecutar las sentencias SQL generadas.
6. El script maneja automáticamente caracteres especiales y espacios en los nombres.
7. Se pueden procesar grandes volúmenes de datos eficientemente.
8. Los archivos de entrada deben estar en formato Excel (.xlsx o .xls).
9. La salida se genera en formato SQL para fácil integración con bases de datos.
10. Se mantiene un registro de los emparejamientos encontrados y no encontrados. 