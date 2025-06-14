# Excel File Management Tools

A collection of Node.js tools for managing and processing Excel files with various functionalities.

## Features

### 1. Excel File Division
Split large Excel files into smaller parts based on row count.
```bash
npm run divide -- --input="path/to/file.xlsx" --rows=1000
```

### 2. Excel to SQL Conversion
Convert Excel data into SQL statements (INSERT, UPDATE, MERGE) with column mapping.
```bash
npm run excel-to-sql -- --input="path/to/file.xlsx" --config="path/to/config.json"
```

### 3. Excel Data Filtering
Filter Excel data based on custom criteria using a configuration file.
```bash
npm run filter -- --input="path/to/file.xlsx" --config="path/to/filter-config.json"
```

### 4. Name Matching
Match names between different files (contracts, Excel, plans) and generate SQL update statements.
```bash
npm run match-names -- --contracts="path/to/contracts.csv" --excel="path/to/names.xlsx" --plans="path/to/plans.csv"
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd divide-xlsx
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### SQL Configuration
Create a `config/sql-config.json` file with the following structure:
```json
{
  "inputFile": "path/to/input.xlsx",
  "sheetName": "Sheet1",
  "tableName": "your_table",
  "outputFile": "output/statements.sql",
  "sqlType": "insert",
  "columnMapping": {
    "Excel Column": "SQL Column"
  }
}
```

### Filter Configuration
Create a `config/filter-config.json` file with the following structure:
```json
{
  "inputFile": "path/to/input.xlsx",
  "outputFile": "output/filtered.xlsx",
  "filters": [
    {
      "column": "Column Name",
      "operator": "equals",
      "value": "Filter Value"
    }
  ]
}
```

## Usage

### Dividing Excel Files
```bash
npm run divide -- --input="data/large-file.xlsx" --rows=1000
```

### Converting to SQL
```bash
npm run excel-to-sql -- --input="data/data.xlsx" --config="config/sql-config.json"
```

### Filtering Data
```bash
npm run filter -- --input="data/data.xlsx" --config="config/filter-config.json"
```

### Matching Names
```bash
npm run match-names -- --contracts="data/contracts.csv" --excel="data/names.xlsx" --plans="data/plans.csv"
```

## Output

- Divided files will be saved in the `output` directory
- SQL statements will be saved in the specified output file
- Filtered Excel files will be saved in the specified output location
- Name matching results will be saved as SQL update statements

## Dependencies

- xlsx: Excel file processing
- yargs: Command line argument parsing
- fs-extra: Enhanced file system operations

## License

MIT