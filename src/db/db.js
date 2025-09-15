// Troque mysql por mysql2
const mysql = require("mysql2");

const conec = mysql.createPool({
  host: "localhost", // Altere conforme necessário
  user: "root", // Altere conforme necessário
  password: "Rhaver1907@", // Altere conforme necessário
  database: "trash", // Altere conforme necessário
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testando a conexão
conec.getConnection((err, connection) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
    connection.release();
  }
});

module.exports = conec;
