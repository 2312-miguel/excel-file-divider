# Excel File Divider

Una herramienta para dividir archivos de Excel en partes más pequeñas.

## Descripción

Esta aplicación permite dividir archivos de Excel grandes en archivos más pequeños, facilitando su manejo y procesamiento.

## Estructura del Proyecto

```
divide-xlsx/
├── src/           # Código fuente
│   └── excelDivider.js
├── data/          # Archivos de Excel
├── config.json    # Configuración del proyecto
└── package.json   # Dependencias y scripts
```

## Requisitos Previos

- Node.js (v12 o superior)
- npm (viene con Node.js)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd divide-xlsx
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## Uso

1. Coloca los archivos de Excel que deseas dividir en la carpeta `data/`
2. Configura los parámetros en `config.json`
3. Ejecuta el script:
   ```bash
   node src/excelDivider.js
   ```

## Configuración

El archivo `config.json` permite personalizar:
- Número de filas por archivo
- Formato de salida
- Otras opciones específicas

## Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Contacto

[Tu Nombre] - [tu@email.com]

## Features

- 📊 Split large Excel files into multiple smaller files
- 🔍 Exclude specific columns from the output
- 🧹 Filter out rows with empty key fields
- ⚙️ Configurable through JSON file or command line arguments
- 📑 Maintains headers in all output files
- 📁 Automatic output directory creation
- ❌ Comprehensive error handling

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/excel-file-divider.git
```

2. Navigate to the project directory:
```bash
cd excel-file-divider
```

3. Install dependencies:
```bash
npm install
```

## Usage

### Using Command Line Arguments

```bash
# Basic usage with config file
npm start

# Using command line arguments
node dividirExcel.js --input "myfile.xlsx" --sheet "Sheet1" --rows 5000 --output "output"

# Using short aliases
node dividirExcel.js -i "myfile.xlsx" -s "Sheet1" -r 5000 -o "output"
```

### Available Command Line Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| --config | -c | Path to config file | config.json |
| --input | -i | Input Excel file | From config |
| --sheet | -s | Sheet name | From config |
| --rows | -r | Rows per file | From config |
| --output | -o | Output directory | From config |
| --help | -h | Show help | - |

### Using Configuration File

Create or modify `config.json`:

```json
{
  "inputFile": "input.xlsx",
  "sheetName": "Sheet1",
  "rowsPerFile": 100000,
  "excludeColumns": [5],
  "itemColumnIndex": 0,
  "outputDir": "output"
}
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| inputFile | String | Name of the Excel file to process |
| sheetName | String | Name of the worksheet to process |
| rowsPerFile | Number | Maximum number of rows per output file |
| excludeColumns | Array | Column indexes to exclude (0-based) |
| itemColumnIndex | Number | Index of column used to filter empty rows |
| outputDir | String | Output directory name |

## Examples

```bash
# Process a specific Excel file with custom settings
node dividirExcel.js -i "sales_data.xlsx" -s "2023" -r 1000 -o "sales_output"

# Use a different config file
node dividirExcel.js -c "custom_config.json"

# Show help
node dividirExcel.js --help
```

## Output Structure

The program will create files in the following format: