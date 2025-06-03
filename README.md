# Excel File Divider

A powerful tool to split large Excel files into smaller, manageable parts while maintaining data integrity and structure.

## Description

This application allows you to divide large Excel files into smaller files, making them easier to handle and process. It maintains data integrity and the original file structure.

## Project Structure

```
divide-xlsx/
├── src/           # Source code
│   └── excelDivider.js
├── data/          # Input Excel files
├── output/        # Divided Excel files output
├── config.json    # Project configuration
└── package.json   # Dependencies and scripts
```

## Prerequisites

- Node.js (v12 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/2312-miguel/excel-file-divider.git
   cd excel-file-divider
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Using Command Line

```bash
# Basic usage
node src/excelDivider.js --input "data/file.xlsx" --sheet "Sheet1" --rows 5000 --output "output"

# Using short parameter names
node src/excelDivider.js -i "data/file.xlsx" -s "Sheet1" -r 5000 -o "output"
```

### Available Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| --input | -i | Input Excel file path | From config.json |
| --sheet | -s | Sheet name to process | From config.json |
| --rows | -r | Rows per output file | From config.json |
| --output | -o | Output directory | From config.json |
| --help | -h | Show help | - |

### Using Configuration File

Modify the `config.json` file:

```json
{
  "inputFile": "data/file.xlsx",
  "sheetName": "Sheet1",
  "rowsPerFile": 5000,
  "outputDir": "output"
}
```

## Examples

```bash
# Process a specific Excel file
node src/excelDivider.js -i "data/INVENTORY.xlsx" -s "Sheet1" -r 5000 -o "output"

# Use custom configuration
node src/excelDivider.js --config "custom_config.json"

# Show help
node src/excelDivider.js --help
```

## Output Structure

The program creates files with the following structure:

```
output/
├── Sheet1_part_001.xlsx  # First chunk of data with headers
├── Sheet1_part_002.xlsx  # Second chunk with headers
└── ...                   # Additional files as needed
```

Each output file contains:
- Original headers from the source file
- A subset of rows based on the specified row limit
- Same formatting and column structure as the source
- Sequential numbering in the filename

### File Naming Convention

Output files follow this pattern:
```
[SheetName]_part_[SequentialNumber].xlsx
```
Example: `Sheet1_part_001.xlsx`, `Sheet1_part_002.xlsx`, etc.

## Features

- 📊 Split large Excel files into multiple smaller files
- 📑 Maintain headers in all output files
- 📁 Automatic output directory creation
- ❌ Comprehensive error handling
- 🔍 Sheet-by-sheet processing
- ⚙️ Configurable via JSON file or command line arguments
- 📈 Preserves data formatting and structure
- 🚀 Fast and memory-efficient processing

## Contributing

Contributions are welcome. Please:
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please:
1. Check the existing issues in the repository
2. Create a new issue with a detailed description
3. Include sample files and steps to reproduce (if applicable)

## Contacto

[Miguel] - [miguelangels.dev@gmail.com]

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
node excelDivider.js --input "myfile.xlsx" --sheet "Sheet1" --rows 5000 --output "output"

# Using short aliases
node excelDivider.js -i "myfile.xlsx" -s "Sheet1" -r 5000 -o "output"
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
node excelDivider.js -i "sales_data.xlsx" -s "2023" -r 1000 -o "sales_output"

# Use a different config file
node excelDivider.js -c "custom_config.json"

# Show help
node excelDivider.js --help
```

## Output Structure

The program will create files in the following format:

output/
├── Sheet1_part_001.xlsx # First chunk of data with headers
├── Sheet1_part_002.xlsx # Second chunk with headers
└── ... # Additional files as needed