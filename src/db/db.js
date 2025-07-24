const mysql = require("mysql");

const conec = mysql.createPool({
  host: "localhost", // Altere conforme necessário
  user: "root", // Altere conforme necessário
  password: "root123", // Altere conforme necessário
  database: "trash", // Altere conforme necessário
  connectionLimit: 10,
});

conec.getConnection((err, connection) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
    connection.release();
  }
});

module.exports = conec;
