const mysql = require('mysql2/promise');


//DEMO code....do not do this at home folks!
var pool = mysql.createPool({
    connectionLimit : 5,
    host: 'mysql2',
    port: '3306',
    user: 'root',
    password: 'TestDB@home2',
    database: 'test'
});

/**
 * Returns pre-rendered page with daya to client
 */
const getMySqlData =  (request, response) => {
  getMySqlDataProm(request, response).then(result=>{
    response.render('mySqlData', {
      title: 'Camp Data!' ,
      countryList: result
    })
  });
}

/**
 * Get data from DB
 */
const getMySqlDataProm = async () => {
  try {
    const [rows,fields] = await pool.query("SELECT * FROM test ORDER BY id ASC");
    return rows
  } catch (e) {
     console.log('caught exception!', e);
  }
}

/**
 *  Close connection pool to the DB
 */
const closePool = () => {
  pool.end();
}

module.exports = { getMySqlData,
                   getMySqlDataProm,
                   closePool
                 }
