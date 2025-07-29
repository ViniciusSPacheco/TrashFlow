const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();
const { Controller, upload } = require("./controller/controller");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "views")));

function somenteEmpresa(req, res, next) {
  try {
    const cookie = req.cookies.permissao;

    if (!cookie) {
      return res.status(403).send("Permissão não encontrada.");
    }

    const permissao = JSON.parse(cookie);

    if (permissao.tipo === "empresa") {
      return next();
    } else {
      return res.status(403).send("Acesso restrito para empresas.");
    }
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return res.status(403).send("Permissão inválida.");
  }
}

app.get("/", (req, res) => Controller.Inicio(req, res));
app.get("/login", (req, res) => Controller.Login(req, res));
app.get("/cadastroempresa", somenteEmpresa, (req, res) =>
  Controller.Empresa(req, res)
);
app.get("/logout", (req, res) => Controller.Deslogar(req, res));
app.get("/cadastroideia", (req, res) => Controller.Ideia(req, res));
///aqui pra baixo são os posts
app.post("/login", (req, res) => Controller.Logar(req, res));
app.post("/cadastrar", (req, res) => Controller.Cadastrar(req, res));
app.post("/cadastrarideia", upload.single("img"), (req, res) =>
  Controller.CadastrarIdeia(req, res)
);
app.post("/cadastroempresa", somenteEmpresa, (req, res) =>
  Controller.CadastroEmpresa(req, res)
);

app.post("/atualizarusuario", (req, res) =>
  Controller.AtualizarUsuario(req, res)
);

app.listen(3030, (error) => {
  if (!error) {
    console.log("Servidor rodando nesta porta: http://localhost:3030/");
  } else {
    console.log("Erro ao iniciar servidor:", error);
  }
});
