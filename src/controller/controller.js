const path = require("path");
const db = require("../db/db");

class controlador {
  async Inicio(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/home.html"));
  }

  async Login(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/login.html"));
  }

  async Empresa(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/cadastroempresa.html"));
  }

  async Logar(req, res) {
    const { email, senha } = req.body;
    const query = "SELECT * FROM usuario WHERE email = ? AND senha = ?";
    db.query(query, [email, senha], (error, results) => {
      if (error) {
        console.error("Erro ao fazer login:", error);
        return res.status(500).json({ error: "Erro ao fazer login" });
      }

      if (results.length > 0) {
        const permissao = results[0].permissao;
        const id = results[0].cod;
        const dados = [permissao, id];

        res.cookie("permissao", dados, {
          httpOnly: false,
          maxAge: 3600000,
        });

        console.log("Login bem-sucedido com permissão:", dados[0]);

        if (permissao === "empresa") {
          return res.redirect("/cadastroempresa");
        } else {
          return res.redirect("/");
        }
      } else {
        console.log("Credenciais inválidas");
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
    });
  }

  async Cadastrar(req, res) {
    try {
      const { nome, email, senha, permissao } = req.body;
      const query =
        "INSERT INTO usuario (nome, email, senha, permissao) VALUES (?, ?, ?, ?)";
      const values = [nome, email, senha, permissao];

      db.query(query, values, (error, result) => {
        if (error) {
          console.error("Erro ao cadastrar:", error);
          return res.status(500).json({ error: "Erro ao cadastrar usuário" });
        } else {
          console.log("Cadastro realizado com sucesso:", result);
          res.redirect("/login");
        }
      });
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
}

module.exports = new controlador();
