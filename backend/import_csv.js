
const fs = require('fs');
const { Client } = require('pg');
const copyFrom = require('pg-copy-streams').from;
const path = require('path');

const client = new Client({
  user: 'root',
  host: '168.119.183.3',
  database: 'pd_juanmanuel_arangoarana_vanrossum',
  password: 's7cq453mt2jnicTaQXKT',
  port: 5432,
});

async function importCSV(filename, table) {
  const filePath = path.join(__dirname, filename);
  const stream = fs.createReadStream(filePath);
  return new Promise((resolve, reject) => {
    client.query(copyFrom(`COPY ${table} FROM STDIN WITH CSV HEADER`), (err, pgStream) => {
      if (err) return reject(err);
      pgStream.on('error', reject);
      pgStream.on('finish', resolve);
      stream.pipe(pgStream);
    });
  });
}

(async () => {
  try {
    await client.connect();
    console.log('Connected to DB');
    await importCSV('csv/customers.csv','customers');
    console.log('Customers imported');
    await importCSV('csv/invoices.csv','invoices');
    console.log('Invoices imported');
    await importCSV('csv/transactions.csv','transactions');
    console.log('Transactions imported');
    await client.end();
    console.log('Done');
  } catch (err) {
    console.error('Error:', err);
    await client.end();
  }
})();
