const path = require("path");
const db = require("../db/db");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");

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
    res.sendFile(path.resolve(__dirname, "../views/home2.html"));
  }
  async Contato(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/contato.html"));
  }
  async Sobre(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/somos.html"));
  }
  async Login(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/login.html"));
  }

  async Cadastro(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/cadastro.html"));
  }

  async Empresa(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/cadastroempresa.html"));
  }

  async EmpresaForm(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/cadastroempresaform.html"));
  }

  async Ideia(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/cadastroideia.html"));
  }

  async IdeiaForm(req, res) {
    res.sendFile(path.resolve(__dirname, "../views/cadastroideiaform.html"));
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
        const permissao = results[0].permissao; // ex: "empresa"
        const id = results[0].cod; // ex: 2

        // Salva objeto JSON no cookie
        const dados = { tipo: permissao, id: id };

        res.cookie("permissao", JSON.stringify(dados), {
          httpOnly: false,
          maxAge: 3600000,
        });

        console.log("Login bem-sucedido com permissão:", dados.tipo);

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

  async AtualizarUsuario(req, res) {
    try {
      const { nome, email, senha } = req.body;
      const cookie = req.cookies.permissao;

      if (!cookie) {
        return res.status(403).send("Permissão não encontrada.");
      }

      const permissao = JSON.parse(cookie);
      const usuarioId = permissao.id;

      // Cria arrays para armazenar os campos e valores que realmente vieram preenchidos
      const campos = [];
      const valores = [];

      if (nome) {
        campos.push("nome = ?");
        valores.push(nome);
      }

      if (email) {
        campos.push("email = ?");
        valores.push(email);
      }

      if (senha) {
        campos.push("senha = ?");
        valores.push(senha);
      }

      // Se nenhum campo for preenchido, retorna erro
      if (campos.length === 0) {
        return res
          .status(400)
          .json({ error: "Nenhum campo foi fornecido para atualização." });
      }

      // Monta a query final
      const query = `UPDATE usuario SET ${campos.join(", ")} WHERE cod = ?`;
      valores.push(usuarioId); // adiciona o ID ao final para o WHERE

      db.query(query, valores, (error, result) => {
        if (error) {
          console.error("Erro ao atualizar usuário:", error);
          return res.status(500).json({ error: "Erro ao atualizar usuário" });
        }

        console.log("Usuário atualizado com sucesso:", result);
        res.redirect("/");
      });
    } catch (error) {
      console.error("Erro no servidor ao atualizar usuário:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
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

      const cookie = req.cookies.permissao;
      if (!cookie) {
        return res.redirect("/login");
      }

      const { id: usuarioCod } = JSON.parse(cookie);
      if (!usuarioCod) {
        return res.redirect("/login");
      }

      let imgPath = null;
      if (req.file) {
        imgPath = "/imagens/" + req.file.filename;
      }

      const query = `
      INSERT INTO ideias (titulo, descricao, passo, img, usuario_cod)
      VALUES (?, ?, ?, ?, ?)
    `;
      const values = [titulo, descricao, passo, imgPath, usuarioCod];

      db.query(query, values, (error, result) => {
        if (error) {
          console.error("Erro ao cadastrar ideia:", error);
          return res.status(500).json({ error: "Erro ao cadastrar ideia" });
        }

        console.log("Ideia cadastrada com sucesso:", result);
        res.redirect("/");
      });
    } catch (error) {
      console.error("Erro ao cadastrar ideia:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  async CadastroEmpresa(req, res) {
    try {
      const {
        nome,
        cnpj,
        material,
        endereco,
        telefone,
        horario_funcionamento,
      } = req.body;

      const cookie = req.cookies.permissao;
      if (!cookie) return res.redirect("/login");

      const { id: usuarioCod } = JSON.parse(cookie);
      if (!usuarioCod) return res.redirect("/login");

      // Converter array de materiais para string separada por vírgula
      const materiaisFormatados = Array.isArray(material)
        ? material.join(", ")
        : material;

      // Geocodificação via Nominatim
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await axios.get(geocodeUrl, {
        headers: {
          "User-Agent": "Trash flow (ofcsmurilo@email.com)",
        },
      });

      const geoData = response.data;
      if (!geoData || geoData.length === 0) {
        console.error("Endereço não encontrado:", endereco);
        return res.status(400).send("Endereço não encontrado.");
      }

      const latitude = geoData[0].lat;
      const longitude = geoData[0].lon;

      const query = `
      INSERT INTO empresa (
        nome, cnpj, material, endereco, telefone,
        horario_funcionamento, usuario_cod, latitude, longitude
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const values = [
        nome,
        cnpj,
        materiaisFormatados,
        endereco,
        telefone,
        horario_funcionamento,
        usuarioCod,
        latitude,
        longitude,
      ];

      db.query(query, values, (error, result) => {
        if (error) {
          console.error("Erro ao cadastrar empresa:", error);
          return res.status(500).send("Erro ao cadastrar empresa");
        }
        return res.redirect("/");
      });
    } catch (error) {
      console.error("Erro interno ao cadastrar empresa:", error);
      return res.status(500).send("Erro interno no servidor");
    }
  }
  async Deslogar(req, res) {
    res.clearCookie("permissao");
    console.log("Usuário deslogado com sucesso.");
    res.redirect("/login");
  }


  async GetEmpresas(req, res) {
    const query = "SELECT * FROM empresa";
    db.query(query, (error, results) => {
      if (error) {
        console.error("Erro ao buscar empresas:", error);
        return res.status(500).json({ error: "Erro ao buscar empresas" });
      }
      return res.json(results);
    });

  }

  async GetIdeias(req, res) {
    const query = "SELECT * FROM ideias";
    db.query(query, (error, results) => {
      if (error) {
        console.error("Erro ao buscar ideias:", error);
        return res.status(500).json({ error: "Erro ao buscar ideias" });
      }
      return res.json(results);
    });
  }
}

module.exports = { Controller: new controlador(), upload };
