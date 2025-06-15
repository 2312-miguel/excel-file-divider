# Ejemplos de Configuración ExcelFilter

Este documento muestra ejemplos de cómo configurar el script para filtrar archivos Excel basado en criterios específicos.

## Configuración Básica

```json
{
  "inputFile": "data/ejemplo.xlsx",
  "sheetName": "Hoja1",
  "outputFile": "filtered_output/filtrado.xlsx",
  "filters": [
    {
      "column": "Plan",
      "operator": "equals",
      "value": "PLAN FAMILIAR"
    }
  ]
}
```

## Tipos de Filtros

### 1. Filtro de Igualdad
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
Filtra filas donde la columna "Plan" sea exactamente igual a "PLAN FAMILIAR".

### 2. Filtro de Contenido
```json
{
  "filters": [
    {
      "column": "Plan",
      "operator": "contains",
      "value": "PLAN"
    }
  ]
}
```
Filtra filas donde la columna "Plan" contenga la palabra "PLAN".

### 3. Filtro de Contenido con Exclusión
```json
{
  "filters": [
    {
      "column": "Plan",
      "operator": "containsExclude",
      "value": "PLAN",
      "exclude": "BASICO"
    }
  ]
}
```
Filtra filas donde la columna "Plan" contenga "PLAN" pero no contenga "BASICO".

### 4. Filtro de Inicio
```json
{
  "filters": [
    {
      "column": "Cliente",
      "operator": "startsWith",
      "value": "Juan"
    }
  ]
}
```
Filtra filas donde la columna "Cliente" comience con "Juan".

### 5. Filtro de Fin
```json
{
  "filters": [
    {
      "column": "Cliente",
      "operator": "endsWith",
      "value": "Pérez"
    }
  ]
}
```
Filtra filas donde la columna "Cliente" termine con "Pérez".

### 6. Filtro Numérico Mayor Que
```json
{
  "filters": [
    {
      "column": "Monto",
      "operator": "greaterThan",
      "value": 1000
    }
  ]
}
```
Filtra filas donde la columna "Monto" sea mayor que 1000.

### 7. Filtro Numérico Menor Que
```json
{
  "filters": [
    {
      "column": "Monto",
      "operator": "lessThan",
      "value": 5000
    }
  ]
}
```
Filtra filas donde la columna "Monto" sea menor que 5000.

## Múltiples Filtros

### 1. Filtros AND (todos deben cumplirse)
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
    },
    {
      "column": "Estado",
      "operator": "equals",
      "value": "ACTIVO"
    }
  ]
}
```
Filtra filas que cumplan TODOS los criterios:
- Plan contiene "PLAN"
- Monto es mayor que 1000
- Estado es "ACTIVO"

## Uso desde Línea de Comandos

```bash
# Uso básico
node src/excelFilter.js

# Especificar archivo de configuración
node src/excelFilter.js -c config.json

# Especificar archivo de entrada
node src/excelFilter.js -i data/archivo.xlsx

# Especificar hoja
node src/excelFilter.js -s "Hoja1"

# Especificar archivo de salida
node src/excelFilter.js -o filtered_output/filtrado.xlsx
```

## Ejemplo Completo

```json
{
  "inputFile": "data/ejemplo.xlsx",
  "sheetName": "Hoja1",
  "outputFile": "filtered_output/filtrado.xlsx",
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
    },
    {
      "column": "Estado",
      "operator": "equals",
      "value": "ACTIVO"
    },
    {
      "column": "Cliente",
      "operator": "startsWith",
      "value": "Juan"
    }
  ]
}
```

## Notas Importantes

1. Los filtros se aplican en el orden especificado en el array.
2. Todos los filtros deben cumplirse para que una fila sea incluida (operación AND).
3. Los valores de texto son insensibles a mayúsculas/minúsculas.
4. Los valores numéricos se convierten automáticamente para comparaciones.
5. Las fechas deben estar en formato válido para ser comparadas correctamente.
6. Los valores nulos o vacíos son manejados según el tipo de operador. 