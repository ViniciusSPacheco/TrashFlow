const path = require("path");
const db = require("../db/db");
const multer = require("multer");
const fs = require("fs");

// Cria a pasta imagens se não existir
const dir = path.resolve(__dirname, "../imagens");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// ...existing code...

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

  async Ideia(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/cadastroideia.html"));
  }

  //// aqui pra baixo é as para da logica

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

  async CadastrarIdeia(req, res) {
    try {
      const { titulo, descricao, passo } = req.body;
      const usuarioCod = req.cookies.permissao[1];
      if (!usuarioCod) {
        return res.redirect("/login");
      }

      // Pega o caminho da imagem salva pelo multer
      let imgPath = null;
      if (req.file) {
        imgPath = "imagens/" + req.file.filename;
      }

      const query =
        "INSERT INTO ideias (titulo, descricao, passo, img, usuario_cod) VALUES (?, ?, ?, ?, ?)";
      const values = [titulo, descricao, passo, imgPath, usuarioCod];

      db.query(query, values, (error, result) => {
        if (error) {
          console.error("Erro ao cadastrar ideia:", error);
          return res.status(500).json({ error: "Erro ao cadastrar ideia" });
        } else {
          console.log("Ideia cadastrada com sucesso:", result);
          res.redirect("/");
        }
      });
    } catch (error) {
      console.error("Erro ao cadastrar ideia:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  async Deslogar(req, res) {
    res.clearCookie("permissao");
    console.log("Usuário deslogado com sucesso.");
    res.redirect("/login");
  }
}

module.exports = { Controller: new controlador(), upload };
