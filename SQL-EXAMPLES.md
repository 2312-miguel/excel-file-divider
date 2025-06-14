# Ejemplos de Configuración SQL

Este documento muestra ejemplos de cómo configurar el script para generar diferentes tipos de sentencias SQL.

## Configuración Básica

```json
{
  "inputFile": "data/ejemplo.xlsm",
  "sheetName": "Hoja1",
  "tableName": "contracts",
  "outputDir": "sql_output",
  "sqlType": "UPDATE",
  "columnMapping": {
    "Cod": "nro",
    "Plan": "plan_nombre",
    "Cliente": "nombre_cliente",
    "Fecha": "fecha_facturacion",
    "Monto": "monto_total",
    "Estado": "estado_contrato"
  }
}
```

## Ejemplos de Condiciones WHERE

### 1. UPDATE sin WHERE
```json
{
  "sqlType": "UPDATE",
  "columnMapping": {
    "Cod": "nro"
  }
}
```
Genera:
```sql
UPDATE contracts
SET `nro` = '123';
```

### 2. UPDATE con WHERE Simple
```json
{
  "sqlType": "UPDATE",
  "whereColumn": "ID",  // Opcional: si se especifica, se agrega la condición WHERE
  "columnMapping": {
    "Cod": "nro"
  }
}
```
Genera:
```sql
UPDATE contracts
SET `nro` = '123'
WHERE `ID` = 123;  // 123 es el valor de la columna ID en el Excel
```

### 3. UPDATE con JOIN sin WHERE
```json
{
  "sqlType": "UPDATE",
  "tableRelations": {
    "contactos": {
      "joinType": "INNER",
      "joinCondition": {
        "excelColumns": ["Nombre", "Apellido"],
        "sqlColumns": ["nombre", "apellido1", "apellido2"],
        "concatenation": {
          "excel": {
            "separator": " ",
            "columns": ["Nombre", "Apellido"]
          },
          "sql": {
            "separator": " ",
            "columns": ["nombre", "apellido1", "apellido2"]
          }
        }
      }
    }
  },
  "columnMapping": {
    "Cod": "nro"
  }
}
```
Genera:
```sql
UPDATE contracts t
INNER JOIN contactos c ON CONCAT(`nombre`, `apellido1`, `apellido2`) = 'Juan Pérez García'
SET `nro` = '123';
```

### 4. UPDATE con JOIN y WHERE
```json
{
  "sqlType": "UPDATE",
  "whereColumn": "ID",  // Opcional: agrega WHERE a la tabla principal
  "tableRelations": {
    "contactos": {
      "joinType": "INNER",
      "joinCondition": {
        "excelColumns": ["Nombre", "Apellido"],
        "sqlColumns": ["nombre", "apellido1", "apellido2"],
        "concatenation": {
          "excel": {
            "separator": " ",
            "columns": ["Nombre", "Apellido"]
          },
          "sql": {
            "separator": " ",
            "columns": ["nombre", "apellido1", "apellido2"]
          }
        }
      }
    }
  },
  "columnMapping": {
    "Cod": "nro"
  }
}
```
Genera:
```sql
UPDATE contracts t
INNER JOIN contactos c ON CONCAT(`nombre`, `apellido1`, `apellido2`) = 'Juan Pérez García'
SET `nro` = '123'
WHERE t.`ID` = 123;
```

## Notas Importantes sobre WHERE

1. El WHERE es completamente opcional. Si no se especifica `whereColumn`, se generará un UPDATE sin WHERE.
2. Si se especifica `whereColumn`, debe existir en el archivo Excel.
3. Los filtros se aplican a las filas que se procesan, independientemente del WHERE.
4. En caso de JOIN, el WHERE se aplica a la tabla principal.
5. Se puede combinar WHERE con filtros para mayor control sobre los registros actualizados.

## Ejemplo de UPDATE Simple

```sql
UPDATE contracts
SET `nro` = '123',
    `plan_nombre` = 'PLAN FAMILIAR',
    `nombre_cliente` = 'Juan Pérez',
    `fecha_facturacion` = '2024-03-20',
    `monto_total` = 1500,
    `estado_contrato` = 'ACTIVO'
WHERE `ID` = 123;
```

## Ejemplo de UPDATE con JOIN

```sql
UPDATE contracts t
INNER JOIN contactos c ON CONCAT(`nombre`, `apellido1`, `apellido2`) = 'Juan Pérez García'
SET `nro` = '123',
    `plan_nombre` = 'PLAN FAMILIAR',
    `nombre_cliente` = 'Juan Pérez',
    `fecha_facturacion` = '2024-03-20',
    `monto_total` = 1500,
    `estado_contrato` = 'ACTIVO'
WHERE t.`ID` = 123;
```

## Operadores de Filtro Disponibles

1. **equals**: Coincidencia exacta
   ```json
   {
     "column": "Plan",
     "operator": "equals",
     "value": "PLAN FAMILIAR"
   }
   ```

2. **contains**: Contiene el texto
   ```json
   {
     "column": "Plan",
     "operator": "contains",
     "value": "PLAN"
   }
   ```

3. **containsExclude**: Contiene el texto pero excluye otro
   ```json
   {
     "column": "Plan",
     "operator": "containsExclude",
     "value": "PLAN FAM",
     "exclude": "mb"
   }
   ```

4. **startsWith**: Comienza con el texto
   ```json
   {
     "column": "Cliente",
     "operator": "startsWith",
     "value": "Juan"
   }
   ```

5. **endsWith**: Termina con el texto
   ```json
   {
     "column": "Cliente",
     "operator": "endsWith",
     "value": "Pérez"
   }
   ```

6. **greaterThan**: Mayor que el valor
   ```json
   {
     "column": "Monto",
     "operator": "greaterThan",
     "value": 1000
   }
   ```

7. **lessThan**: Menor que el valor
   ```json
   {
     "column": "Monto",
     "operator": "lessThan",
     "value": 5000
   }
   ```

## Tipos de JOIN Disponibles

1. **INNER JOIN**: Solo registros que coinciden en ambas tablas
   ```json
   {
     "joinType": "INNER"
   }
   ```

2. **LEFT JOIN**: Todos los registros de la tabla principal y los que coinciden
   ```json
   {
     "joinType": "LEFT"
   }
   ```

3. **RIGHT JOIN**: Todos los registros de la tabla secundaria y los que coinciden
   ```json
   {
     "joinType": "RIGHT"
   }
   ```

## Ejemplo Completo con Relaciones

```json
{
  "inputFile": "data/ejemplo.xlsm",
  "sheetName": "Hoja1",
  "tableName": "contracts",
  "outputDir": "sql_output",
  "sqlType": "UPDATE",
  "whereColumn": "ID",
  
  "tableRelations": {
    "contactos": {
      "joinType": "INNER",
      "joinCondition": {
        "excelColumns": ["Nombre", "Apellido"],
        "sqlColumns": ["nombre", "apellido1", "apellido2"],
        "concatenation": {
          "excel": {
            "separator": " ",
            "columns": ["Nombre", "Apellido"]
          },
          "sql": {
            "separator": " ",
            "columns": ["nombre", "apellido1", "apellido2"]
          }
        }
      }
    }
  },

  "columnMapping": {
    "Cod": "nro",
    "Plan": "plan_nombre",
    "Cliente": "nombre_cliente",
    "Fecha": "fecha_facturacion",
    "Monto": "monto_total",
    "Estado": "estado_contrato"
  },

  "filters": [
    {
      "column": "Plan",
      "operator": "contains",
      "value": "PLAN"
    },
    {
      "column": "Monto",
      "operator": "greaterThan",
      "value": 1000
    }
  ]
}
```

## Uso desde Línea de Comandos

```bash
# Uso básico
node src/excelToSql.js

# Especificar archivo de configuración
node src/excelToSql.js -c config.json

# Especificar archivo de entrada
node src/excelToSql.js -i data/archivo.xlsm

# Especificar hoja
node src/excelToSql.js -s "Hoja1"

# Especificar tabla
node src/excelToSql.js -t contracts

# Especificar directorio de salida
node src/excelToSql.js -o sql_output

# Especificar tipo de sentencia SQL
node src/excelToSql.js -y UPDATE
``` 