const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'Password1.',
    server: 'localhost',
    database: 'BasvuruTakip',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log('MSSQL bağlantısı başarılı');
        return pool;
    } catch (err) {
        console.error('MSSQL bağlantı hatası:',err.message);
    }
}

module.exports = connectToDatabase;