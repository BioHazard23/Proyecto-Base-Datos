const { Pool } = require('pg');
const pool = new Pool({
  user: 'root',
  host: '168.119.183.3',
  database: 'pd_juanmanuel_arangoarana_vanrossum',
  password: 's7cq453mt2jnicTaQXKT',
  port: 5432,
});
module.exports = pool;
