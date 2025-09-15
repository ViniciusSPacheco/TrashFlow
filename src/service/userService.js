const db = require("../db/db");

function findUserByEmailAndPassword(email, senha) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM usuario WHERE email = ? AND senha = ?";
    db.query(query, [email, senha], (error, results) => {
      if (error) return reject(error);
      resolve(results[0]);
    });
  });
}

function createUser({ nome, email, senha, permissao }) {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO usuario (nome, email, senha, permissao) VALUES (?, ?, ?, ?)";
    db.query(query, [nome, email, senha, permissao], (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

module.exports = {
  findUserByEmailAndPassword,
  createUser,
};