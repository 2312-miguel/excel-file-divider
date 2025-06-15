# Ejemplos de Configuración ExcelToSql

Este documento muestra ejemplos de cómo configurar el script para generar diferentes tipos de sentencias SQL desde archivos Excel.

## Configuración Básica

```json
{
  "inputFile": "data/ejemplo.xlsx",
  "sheetName": "Hoja1",
  "tableName": "contracts",
  "outputFile": "sql_output/statements.sql",
  "sqlType": "INSERT",
  "columnMappings": [
    {
      "excelColumn": "Cod",
      "sqlColumn": "nro",
      "type": "string"
    },
    {
      "excelColumn": "Plan",
      "sqlColumn": "plan_nombre",
      "type": "string"
    },
    {
      "excelColumn": "Cliente",
      "sqlColumn": "nombre_cliente",
      "type": "string"
    },
    {
      "excelColumn": "Fecha",
      "sqlColumn": "fecha_facturacion",
      "type": "date"
    },
    {
      "excelColumn": "Monto",
      "sqlColumn": "monto_total",
      "type": "number"
    }
  ]
}
```

## Tipos de Sentencias SQL

### 1. INSERT
```json
{
  "sqlType": "INSERT",
  "columnMappings": [
    {
      "excelColumn": "Cod",
      "sqlColumn": "nro",
      "type": "string"
    }
  ]
}
```
Genera:
```sql
INSERT INTO contracts (nro) VALUES ('123');
```

### 2. UPDATE
```json
{
  "sqlType": "UPDATE",
  "columnMappings": [
    {
      "excelColumn": "Cod",
      "sqlColumn": "nro",
      "type": "string"
    }
  ]
}
```
Genera:
```sql
UPDATE contracts SET nro = '123' WHERE id = 1;
```

### 3. MERGE
```json
{
  "sqlType": "MERGE",
  "columnMappings": [
    {
      "excelColumn": "Cod",
      "sqlColumn": "nro",
      "type": "string"
    }
  ]
}
```
Genera:
```sql
MERGE INTO contracts AS target
USING (SELECT '123' AS id) AS source
ON target.id = source.id
WHEN MATCHED THEN
  UPDATE SET nro = '123'
WHEN NOT MATCHED THEN
  INSERT (nro) VALUES ('123');
```

## Tipos de Datos Soportados

1. **string**: Para texto
   ```json
   {
     "excelColumn": "Nombre",
     "sqlColumn": "nombre",
     "type": "string"
   }
   ```

2. **number**: Para valores numéricos
   ```json
   {
     "excelColumn": "Monto",
     "sqlColumn": "monto",
     "type": "number"
   }
   ```

3. **date**: Para fechas
   ```json
   {
     "excelColumn": "Fecha",
     "sqlColumn": "fecha",
     "type": "date"
   }
   ```

## Filtros

### 1. Filtro Simple
```json
{
  "filters": [
    {
      "column": "Plan",
      "operator": "equals",
      "value": "PLAN FAMILIAR"
    }
  ]
}
```

### 2. Múltiples Filtros
```json
{
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

## Operadores de Filtro Disponibles

1. **equals**: Coincidencia exacta
2. **contains**: Contiene el texto
3. **containsExclude**: Contiene el texto pero excluye otro
4. **startsWith**: Comienza con el texto
5. **endsWith**: Termina con el texto
6. **greaterThan**: Mayor que el valor
7. **lessThan**: Menor que el valor

## Uso desde Línea de Comandos

```bash
# Uso básico
node src/excelToSql.js

# Especificar archivo de configuración
node src/excelToSql.js -c config.json

# Especificar archivo de entrada
node src/excelToSql.js -i data/archivo.xlsx

# Especificar hoja
node src/excelToSql.js -s "Hoja1"

# Especificar tabla
node src/excelToSql.js -t contracts

# Especificar archivo de salida
node src/excelToSql.js -o sql_output/statements.sql

# Especificar tipo de sentencia SQL
node src/excelToSql.js -y INSERT
```

## Ejemplo Completo

```json
{
  "inputFile": "data/ejemplo.xlsx",
  "sheetName": "Hoja1",
  "tableName": "contracts",
  "outputFile": "sql_output/statements.sql",
  "sqlType": "UPDATE",
  
  "columnMappings": [
    {
      "excelColumn": "Cod",
      "sqlColumn": "nro",
      "type": "string"
    },
    {
      "excelColumn": "Plan",
      "sqlColumn": "plan_nombre",
      "type": "string"
    },
    {
      "excelColumn": "Cliente",
      "sqlColumn": "nombre_cliente",
      "type": "string"
    },
    {
      "excelColumn": "Fecha",
      "sqlColumn": "fecha_facturacion",
      "type": "date"
    },
    {
      "excelColumn": "Monto",
      "sqlColumn": "monto_total",
      "type": "number"
    }
  ],

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