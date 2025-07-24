const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();
const Controller = require("./controller/controller");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "views")));

function somenteEmpresa(req, res, next) {
  const permissao = req.cookies.permissao;
  if (permissao === "empresa") {
    next();
  } else {
    res.status(403).send("Acesso restrito para empresas.");
  }
}

app.get("/", (req, res) => Controller.Inicio(req, res));
app.get("/login", (req, res) => Controller.Login(req, res));
app.get("/cadastroempresa", somenteEmpresa, (req, res) =>
  Controller.Empresa(req, res)
);
app.post("/login", (req, res) => Controller.Logar(req, res));
app.post("/cadastrar", (req, res) => Controller.Cadastrar(req, res));

app.listen(3030, (error) => {
  if (!error) {
    console.log("Servidor rodando nesta porta: http://localhost:3030/");
  } else {
    console.log("Erro ao iniciar servidor:", error);
  }
});
