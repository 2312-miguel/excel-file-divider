# Excel File Management Tools

A comprehensive suite of Node.js tools designed for efficient Excel file processing and data management. This project provides a set of powerful utilities for handling Excel files in various ways, from basic operations like splitting large files to advanced data transformations and SQL generation.

## Key Features

### 1. Excel File Division
Split large Excel files into smaller, manageable parts while maintaining data integrity and formatting.
- Configurable row count per file
- Preserves headers in all output files
- Maintains original formatting and styles
- Memory-efficient processing for large files
```bash
npm run divide -- --input="path/to/file.xlsx" --rows=1000
```

### 2. Excel to SQL Conversion
Transform Excel data into various SQL statement types with flexible column mapping and data type handling.
- Supports INSERT, UPDATE, and MERGE operations
- Custom column mapping
- Data type conversion
- Batch processing capabilities
```bash
npm run excel-to-sql -- --input="path/to/file.xlsx" --config="path/to/config.json"
```

### 3. Excel Data Filtering
Advanced filtering capabilities with custom criteria and complex conditions.
- Multiple filter conditions
- Various operators (equals, contains, greater than, etc.)
- Custom output formatting
- Filter chain support
```bash
npm run filter -- --input="path/to/file.xlsx" --config="path/to/filter-config.json"
```

### 4. Name Matching
Intelligent name matching between different data sources with SQL update generation.
- Fuzzy name matching
- Multiple file format support
- Custom matching rules
- SQL update statement generation
```bash
npm run match-names -- --contracts="path/to/contracts.csv" --excel="path/to/names.xlsx" --plans="path/to/plans.csv"
```

## Technologies Used

### Core Technologies
- **Node.js**: Runtime environment for server-side JavaScript
- **JavaScript (ES6+)**: Modern JavaScript features and syntax
- **npm**: Package management and script running

### Key Dependencies
- **xlsx**: Excel file processing and manipulation
- **yargs**: Command-line argument parsing
- **fs-extra**: Enhanced file system operations
- **stream**: Node.js streaming for efficient data processing
- **path**: File path manipulation utilities

### Development Tools
- **ESLint**: Code linting and style enforcement
- **Jest**: Unit testing framework
- **Git**: Version control system

### Performance & Optimization
- **Stream Processing**: Memory-efficient file handling
- **Async/Await**: Modern asynchronous programming
- **Buffer Management**: Efficient memory usage
- **Error Handling**: Comprehensive error management

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

### File Division
- Creates multiple Excel files in the `output` directory
- Each file contains the specified number of rows
- Maintains original formatting and headers

### SQL Conversion
- Generates SQL statements in the specified output file
- Supports multiple SQL statement types
- Includes proper data type conversion

### Data Filtering
- Creates filtered Excel files in the specified location
- Maintains original data structure
- Applies all specified filter conditions

### Name Matching
- Generates SQL update statements
- Creates a log of matched and unmatched records
- Supports custom output formatting

## Performance Considerations

- Memory-efficient processing using streams
- Batch processing for large files
- Optimized data structures for matching
- Efficient file I/O operations

## Error Handling

- Comprehensive error checking
- Detailed error messages
- Graceful failure handling
- Data validation at each step

## Dependencies

- xlsx: Excel file processing
- yargs: Command line argument parsing
- fs-extra: Enhanced file system operations
- stream: Node.js streaming
- path: File path utilities

## License

MIT