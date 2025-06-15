# Ejemplos de Configuración ExcelDivider

Este documento muestra ejemplos de cómo configurar el script para dividir archivos Excel grandes en partes más pequeñas.

## Configuración Básica

```json
{
  "inputFile": "data/grande.xlsx",
  "sheetName": "Hoja1",
  "rowsPerFile": 1000,
  "outputDir": "output",
  "excludeColumns": [0, 2, 5]
}
```

## Tipos de División

### 1. División por Número de Filas
```json
{
  "inputFile": "data/grande.xlsx",
  "sheetName": "Hoja1",
  "rowsPerFile": 1000,
  "outputDir": "output"
}
```
Divide el archivo en partes de 1000 filas cada una.

### 2. División con Exclusión de Columnas
```json
{
  "inputFile": "data/grande.xlsx",
  "sheetName": "Hoja1",
  "rowsPerFile": 1000,
  "outputDir": "output",
  "excludeColumns": [0, 2, 5]
}
```
Divide el archivo en partes de 1000 filas, excluyendo las columnas 0, 2 y 5.

### 3. División con Nombres Personalizados
```json
{
  "inputFile": "data/grande.xlsx",
  "sheetName": "Hoja1",
  "rowsPerFile": 1000,
  "outputDir": "output",
  "filePrefix": "parte_",
  "fileSuffix": "_2024"
}
```
Genera archivos con nombres como: `parte_001_2024.xlsx`, `parte_002_2024.xlsx`, etc.

## Estructura de Archivos de Salida

### 1. Nombres de Archivo por Defecto
```
output/
  ├── Hoja1_part_001.xlsx
  ├── Hoja1_part_002.xlsx
  └── Hoja1_part_003.xlsx
```

### 2. Nombres de Archivo Personalizados
```
output/
  ├── parte_001_2024.xlsx
  ├── parte_002_2024.xlsx
  └── parte_003_2024.xlsx
```

## Uso desde Línea de Comandos

```bash
# Uso básico
node src/excelDivider.js

# Especificar archivo de configuración
node src/excelDivider.js -c config.json

# Especificar archivo de entrada
node src/excelDivider.js -i data/grande.xlsx

# Especificar hoja
node src/excelDivider.js -s "Hoja1"

# Especificar filas por archivo
node src/excelDivider.js -r 1000

# Especificar directorio de salida
node src/excelDivider.js -o output
```

## Ejemplo Completo

```json
{
  "inputFile": "data/grande.xlsx",
  "sheetName": "Hoja1",
  "rowsPerFile": 1000,
  "outputDir": "output",
  "excludeColumns": [0, 2, 5],
  "filePrefix": "parte_",
  "fileSuffix": "_2024",
  "maintainHeaders": true,
  "skipEmptyRows": true
}
```

## Opciones Adicionales

### 1. Mantener Encabezados
```json
{
  "maintainHeaders": true
}
```
Cada archivo dividido incluirá los encabezados de las columnas.

### 2. Omitir Filas Vacías
```json
{
  "skipEmptyRows": true
}
```
Las filas que estén completamente vacías serán omitidas.

### 3. Formato de Fecha Personalizado
```json
{
  "dateFormat": "YYYY-MM-DD"
}
```
Especifica el formato de fecha para las columnas de tipo fecha.

## Notas Importantes

1. El script mantiene la estructura y formato del archivo original.
2. Los encabezados se copian a cada archivo dividido.
3. Se pueden excluir columnas específicas usando `excludeColumns`.
4. Los nombres de archivo se generan automáticamente con numeración secuencial.
5. Se puede personalizar el prefijo y sufijo de los nombres de archivo.
6. El script maneja automáticamente archivos grandes de manera eficiente.
7. Se mantiene la integridad de los datos durante la división.
8. Se pueden procesar múltiples hojas en un solo archivo.
9. Los archivos de salida mantienen el formato Excel original.
10. Se genera un registro de progreso durante el proceso de división.

## Consideraciones de Rendimiento

1. Para archivos muy grandes, se recomienda usar `rowsPerFile` entre 1000 y 5000.
2. La exclusión de columnas puede mejorar significativamente el rendimiento.
3. El proceso es más rápido cuando se omite el formato de celdas.
4. Se recomienda tener suficiente espacio en disco para los archivos divididos.
5. El uso de `skipEmptyRows` puede reducir el tamaño de los archivos de salida. 