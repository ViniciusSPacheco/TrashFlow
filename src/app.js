const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();
const { Controller, upload } = require("./controller/controller");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "views")));
app.use('/imagens', express.static(path.join(__dirname, 'imagens')));

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

app.get("/", (req, res) => Controller.Inicio(req, res));// funcionando
app.get("/login", (req, res) => Controller.Login(req, res));//funcionando
app.get("/cadastrar", (req, res) => Controller.Cadastro(req, res)); // funcionando
app.get("/cadastroempresa", (req, res) => Controller.Empresa(req, res));//funcionando
app.get('/cadastroempresaform', somenteEmpresa, (req, res) => Controller.EmpresaForm(req, res));//funcionando
app.get("/cadastroideiaform", (req, res) => Controller.IdeiaForm(req, res));//funcionando
app.get("/logout", (req, res) => Controller.Deslogar(req, res));
app.get("/cadastroideia", (req, res) => Controller.Ideia(req, res));
app.get("/sobre", (req, res) => Controller.Sobre(req, res));//funcionando
app.get("/contato", (req, res) => Controller.Contato(req, res));//funcionando
///aqui pra baixo são os posts
app.post("/login", (req, res) => Controller.Logar(req, res)); //funcoonando
app.post("/cadastrar", (req, res) => Controller.Cadastrar(req, res)); // funcionando
app.post("/cadastrarideia", upload.single("img"), (req, res) =>
  Controller.CadastrarIdeia(req, res)
);//funcionando
app.post("/cadastroempresa", somenteEmpresa, (req, res) =>
  Controller.CadastroEmpresa(req, res)
);// funcionando

app.post("/atualizarusuario", (req, res) =>
  Controller.AtualizarUsuario(req, res)
);


app.get('/dataempresa', (req, res) => Controller.GetEmpresas(req, res));// funcionando

app.get('/dataideia', (req, res) => Controller.GetIdeias(req, res));// funcionando
app.listen(3030, (error) => {
  if (!error) {
    console.log("Servidor rodando nesta porta: http://localhost:3030/");
  } else {
    console.log("Erro ao iniciar servidor:", error);
  }
});
