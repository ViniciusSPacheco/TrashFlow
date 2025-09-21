// controller/controller.js
const path = require("path");
const db = require("../db/db");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");

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

class Controlador {
  // ---- views ----
  Inicio(req, res) { res.sendFile(path.resolve(__dirname, "../views/home2.html")); }
  atualizar(req, res) { res.sendFile(path.resolve(__dirname, "../views/atualizar.html")); }
  Contato(req, res) { res.sendFile(path.resolve(__dirname, "../views/contato.html")); }
  Sobre(req, res) { res.sendFile(path.resolve(__dirname, "../views/somos.html")); }
  Login(req, res) { res.sendFile(path.resolve(__dirname, "../views/login.html")); }
  Cadastro(req, res) { res.sendFile(path.resolve(__dirname, "../views/cadastro.html")); }
  Empresa(req, res) { res.sendFile(path.resolve(__dirname, "../views/cadastroempresa.html")); }
  EmpresaForm(req, res) { res.sendFile(path.resolve(__dirname, "../views/cadastroempresaform.html")); }
  Ideia(req, res) { res.sendFile(path.resolve(__dirname, "../views/cadastroideia.html")); }
  IdeiaForm(req, res) { res.sendFile(path.resolve(__dirname, "../views/cadastroideiaform.html")); }
  Info(req, res) { res.sendFile(path.resolve(__dirname, "../views/info.html")); }

  // ---- auth ----
  Logar(req, res) {
    const { email, senha } = req.body;
    const query = "SELECT * FROM usuario WHERE email = ? AND senha = ?";
    db.query(query, [email, senha], (error, results) => {
      if (error) { console.error(error); return res.status(500).json({ error: "Erro ao fazer login" }); }
      if (results.length === 0) return res.status(401).json({ error: "Credenciais inválidas" });

      const { permissao, cod } = results[0];
      const dados = { tipo: permissao, id: cod };
      res.cookie("permissao", JSON.stringify(dados), { httpOnly: false, maxAge: 3600000 });
      return permissao === "empresa" ? res.redirect("/info") : res.redirect("/");
    });
  }
  Deslogar(req, res) {
    res.clearCookie("permissao");
    res.redirect("/");
  }

  // ---- user ----
  ObterUsuario(req, res) {
    try {
      const cookie = req.cookies.permissao;
      if (!cookie) return res.status(403).send("Permissão não encontrada.");
      const { id } = JSON.parse(cookie);

      db.query("SELECT cod, nome, email, permissao FROM usuario WHERE cod = ?", [id], (err, result) => {
        if (err) { console.error(err); return res.status(500).json({ error: "Erro ao buscar usuário" }); }
        if (result.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });

        // devolver também o tipo/permissao para o front
        const row = result[0];
        return res.status(200).json({
          cod: row.cod,
          nome: row.nome,
          email: row.email,
          tipo: row.permissao // aqui o front checa usuario.tipo
        });
      });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  AtualizarUsuario(req, res) {
    try {
      const { nome, email, senha } = req.body;
      const cookie = req.cookies.permissao;
      if (!cookie) return res.status(403).send("Permissão não encontrada.");
      const { id } = JSON.parse(cookie);

      const campos = [];
      const valores = [];
      if (nome) { campos.push("nome = ?"); valores.push(nome); }
      if (email) { campos.push("email = ?"); valores.push(email); }
      if (senha) { campos.push("senha = ?"); valores.push(senha); }

      if (campos.length === 0) return res.status(400).json({ error: "Nenhum campo para atualizar." });

      const query = `UPDATE usuario SET ${campos.join(", ")} WHERE cod = ?`;
      valores.push(id);
      db.query(query, valores, (err) => {
        if (err) { console.error(err); return res.status(500).json({ error: "Erro ao atualizar" }); }
        return res.redirect("/perfil");
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro interno" });
    }
  }

  Cadastrar(req, res) {
    const { nome, email, senha, permissao } = req.body;
    const query = "INSERT INTO usuario (nome, email, senha, permissao) VALUES (?, ?, ?, ?)";
    db.query(query, [nome, email, senha, permissao], (err) => {
      if (err) { console.error(err); return res.status(500).json({ error: "Erro ao cadastrar" }); }
      return res.redirect("/login");
    });
  }

  // ---- ideias ----
  CadastrarIdeia(req, res) {
    const { titulo, descricao, passo } = req.body;
    const cookie = req.cookies.permissao;
    if (!cookie) return res.redirect("/login");
    const { id } = JSON.parse(cookie);

    let imgPath = null;
    if (req.file) imgPath = "/imagens/" + req.file.filename;

    const query = `INSERT INTO ideias (titulo, descricao, passo, img, usuario_cod) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [titulo, descricao, passo, imgPath, id], (err) => {
      if (err) { console.error(err); return res.status(500).json({ error: "Erro ao cadastrar ideia" }); }
      return res.redirect("/");
    });
  }

  GetIdeias(req, res) {
    db.query("SELECT * FROM ideias", (err, results) => {
      if (err) { console.error(err); return res.status(500).json({ error: "Erro ao buscar ideias" }); }
      return res.json(results);
    });
  }

  ObterIdeiasUsuario(req, res) {
    try {
      const cookie = req.cookies.permissao;
      if (!cookie) return res.status(403).send("Permissão não encontrada");
      const { id } = JSON.parse(cookie);

      db.query("SELECT * FROM ideias WHERE usuario_cod = ?", [id], (err, results) => {
        if (err) { console.error(err); return res.status(500).send("Erro ao buscar ideias"); }
        return res.json(results);
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Erro interno");
    }
  }

  // ---- empresas ----
  async CadastroEmpresa(req, res) {
    try {
      const { nome, cnpj, material, endereco, telefone, horario_funcionamento } = req.body;
      const cookie = req.cookies.permissao;
      if (!cookie) return res.redirect("/login");
      const { id } = JSON.parse(cookie);

      const materiaisFormatados = Array.isArray(material) ? material.join(", ") : (material || "");

      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
      await new Promise((r) => setTimeout(r, 1000));
      const response = await axios.get(geocodeUrl, { headers: { "User-Agent": "Trash flow (murilo)" } });
      if (!response.data || response.data.length === 0) return res.status(400).send("Endereço não encontrado.");
      const lat = response.data[0].lat, lon = response.data[0].lon;

      const query = `INSERT INTO empresa (nome, cnpj, material, endereco, telefone, horario_funcionamento, usuario_cod, latitude, longitude)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.query(query, [nome, cnpj, materiaisFormatados, endereco, telefone, horario_funcionamento, id, lat, lon], (err) => {
        if (err) { console.error(err); return res.status(500).send("Erro ao cadastrar empresa"); }
        return res.redirect("/cadastroempresa");
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Erro interno ao cadastrar empresa");
    }
  }

  // nova rota: obter a empresa do usuário logado (para preencher o form)
  ObterEmpresa(req, res) {
    try {
      const cookie = req.cookies.permissao;
      if (!cookie) return res.status(403).send("Permissão não encontrada");
      const { id } = JSON.parse(cookie);

      db.query("SELECT * FROM empresa WHERE usuario_cod = ? LIMIT 1", [id], (err, results) => {
        if (err) { console.error(err); return res.status(500).send("Erro ao buscar empresa"); }
        if (!results || results.length === 0) return res.json({});
        return res.json(results[0]);
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Erro interno");
    }
  }

  // nova rota: atualizar dados da empresa
  AtualizarEmpresa(req, res) {
    try {
      const cookie = req.cookies.permissao;
      if (!cookie) return res.status(403).send("Permissão não encontrada");
      const { id, tipo } = JSON.parse(cookie);
      if (tipo !== "empresa") return res.status(403).send("Apenas empresas podem atualizar");

      const { nome, cnpj, endereco, telefone, horario_funcionamento } = req.body;
      // tentar receber material em diferentes formatos
      const materialRaw = req.body.material || req.body["material[]"] || req.body["material"] || req.body['materiais'];
      const materiaisFormatados = Array.isArray(materialRaw) ? materialRaw.join(", ") : (materialRaw || "");

      const campos = [];
      const valores = [];
      if (nome) { campos.push("nome = ?"); valores.push(nome); }
      if (cnpj) { campos.push("cnpj = ?"); valores.push(cnpj); }
      if (materiaisFormatados !== "") { campos.push("material = ?"); valores.push(materiaisFormatados); }
      if (endereco) { campos.push("endereco = ?"); valores.push(endereco); }
      if (telefone) { campos.push("telefone = ?"); valores.push(telefone); }
      if (horario_funcionamento) { campos.push("horario_funcionamento = ?"); valores.push(horario_funcionamento); }

      if (campos.length === 0) return res.status(400).send("Nenhum campo para atualizar");

      const query = `UPDATE empresa SET ${campos.join(", ")} WHERE usuario_cod = ?`;
      valores.push(id);

      db.query(query, valores, (err) => {
        if (err) { console.error(err); return res.status(500).send("Erro ao atualizar empresa"); }
        return res.redirect("/perfil");
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Erro interno");
    }
  }

  GetEmpresas(req, res) {
    db.query("SELECT * FROM empresa", (err, results) => {
      if (err) { console.error(err); return res.status(500).json({ error: "Erro ao buscar empresas" }); }
      return res.json(results);
    });
  }

  ObterEmpresasUsuario(req, res) {
    try {
      const cookie = req.cookies.permissao;
      if (!cookie) return res.status(403).send("Permissão não encontrada");
      const { id, tipo } = JSON.parse(cookie);
      if (tipo !== "empresa") return res.json([]);
      db.query("SELECT * FROM empresa WHERE usuario_cod = ?", [id], (err, results) => {
        if (err) { console.error(err); return res.status(500).send("Erro ao buscar empresas"); }
        return res.json(results);
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Erro interno");
    }
  }

  // ---- delete ----
  DeletarRegistro(req, res) {
    try {
      const { tipo, id } = req.params;
      const cookie = req.cookies.permissao;
      if (!cookie) return res.status(403).send("Permissão não encontrada.");

      const { tipo: userTipo, id: userId } = JSON.parse(cookie);

      let tabela = '';
      let colunaId = 'cod'; // sempre "cod", tanto para empresa quanto para ideias

      if (tipo === 'ideia') {
        tabela = 'ideias';
      } else if (tipo === 'empresa') {
        if (userTipo !== 'empresa') {
          return res.status(403).send("Somente empresa pode deletar empresa");
        }
        tabela = 'empresa';
      } else {
        return res.status(400).send("Tipo inválido");
      }

      // Primeiro verifica se o registro pertence ao usuário
      db.query(
        `SELECT * FROM ${tabela} WHERE ${colunaId} = ? AND usuario_cod = ?`,
        [id, userId],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Erro no servidor");
          }
          if (!result || result.length === 0) {
            return res.status(403).send("Registro não encontrado ou sem permissão");
          }

          // Se achou, pode deletar
          db.query(`DELETE FROM ${tabela} WHERE ${colunaId} = ?`, [id], (err2) => {
            if (err2) {
              console.error(err2);
              return res.status(500).send("Erro ao deletar registro");
            }
            return res.status(200).json({ success: true });
          });
        }
      );
    } catch (err) {
      console.error(err);
      return res.status(500).send("Erro interno no servidor");
    }
  }

  AtualizarIdeia(req, res) {
    try {
      const { id, titulo, descricao, passo } = req.body;
      const cookie = req.cookies.permissao;
      if (!cookie) return res.status(403).send("Permissão não encontrada.");
      const { id: userId } = JSON.parse(cookie);

      if (!id) return res.status(400).send("ID da ideia é obrigatório.");

      // verifica se a ideia pertence ao usuário logado
      db.query("SELECT * FROM ideias WHERE cod = ? AND usuario_cod = ?", [id, userId], (err, rows) => {
        if (err) { console.error(err); return res.status(500).send("Erro no servidor"); }
        if (!rows || rows.length === 0) return res.status(403).send("Ideia não encontrada ou sem permissão");

        const campos = [];
        const valores = [];

        if (titulo) { campos.push("titulo = ?"); valores.push(titulo); }
        if (descricao) { campos.push("descricao = ?"); valores.push(descricao); }
        if (passo) { campos.push("passo = ?"); valores.push(passo); }

        if (campos.length === 0) return res.status(400).send("Nenhum campo para atualizar.");

        valores.push(id);
        const query = `UPDATE ideias SET ${campos.join(", ")} WHERE cod = ?`;
        db.query(query, valores, (err2) => {
          if (err2) { console.error(err2); return res.status(500).send("Erro ao atualizar ideia"); }


          const wantsJson = req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1);
          if (wantsJson) return res.json({ success: true, message: "Ideia atualizada com sucesso" });
          return res.redirect("/perfil");
        });
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Erro interno no servidor");
    }
  }


}

module.exports = { Controller: new Controlador(), upload };
