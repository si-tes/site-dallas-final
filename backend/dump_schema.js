const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function dumpSchema() {
  try {
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `;
    const tablesResult = await pool.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);

    let schemaSql = '';
    
    for (const table of tables) {
      const columnsQuery = `
        SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `;
      const columnsResult = await pool.query(columnsQuery, [table]);
      const columns = columnsResult.rows;
      
      schemaSql += `CREATE TABLE ${table} (\n`;
      const colDefs = columns.map(col => {
        let def = `  ${col.column_name} ${col.data_type}`;
        if (col.character_maximum_length) def += `(${col.character_maximum_length})`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        return def;
      });
      schemaSql += colDefs.join(',\n');
      schemaSql += `\n);\n\n`;
    }

    const outputPath = path.join(__dirname, '../database/schema.sql');
    fs.writeFileSync(outputPath, schemaSql);
    
    console.log(JSON.stringify({
      tables: tables,
      schema: schemaSql
    }, null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

dumpSchema();
