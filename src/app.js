const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const nodemailer = require('nodemailer');
const app = express();
const { Controller, upload } = require("./controller/controller");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "views")));
app.use('/imagens', express.static(path.join(__dirname, 'imagens')));

app.post('/enviar-contato', async (req, res) => {
  const { name, email, subject, message } = req.body;

  console.log(`
=============================
📩 NOVA MENSAGEM DE CONTATO
Nome: ${name}
Email: ${email}
Assunto: ${subject}
Mensagem: ${message}
=============================
`);

  try {
    // Configuração do transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "ofcsmurilo@gmail.com", // ⚠️ substitua
        pass: "pxiwkqrzcahveixn"

      }
    });

    // Monta o e-mail
    await transporter.sendMail({
      from: `"TrashFlow Contato" <ofcsmurilo@gmail.com>`,
      to: "ofcsmurilo@gmail.com",
      subject: `Nova mensagem de contato: ${subject}`,
      text: `
De: ${name} (${email})
Assunto: ${subject}

Mensagem:
${message}
            `
    });

    console.log("✅ Email enviado com sucesso!");
    res.status(200).json({ message: "Mensagem enviada com sucesso!" });
  } catch (erro) {
    console.error("❌ Erro ao enviar email:", erro);
    res.status(500).json({ error: "Erro ao enviar email." });
  }
});

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
app.get("/info", (req, res) => Controller.Info(req, res));// funcionando
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
  Controller.CadastrarIdeiaCache(req, res)
);//funcionando
app.post("/cadastroempresa", somenteEmpresa, (req, res) =>
  Controller.CadastroEmpresa(req, res)
);// funcionando

app.post("/atualizarusuario", (req, res) =>
  Controller.AtualizarUsuario(req, res)
);

app.get('/perfil', (req, res) => {
  Controller.atualizar(req, res)
})
app.get("/obterusuario", (req, res) => Controller.ObterUsuario(req, res));

app.get('/dataempresa', (req, res) => Controller.GetEmpresas(req, res));// funcionando

app.get('/dataideia', (req, res) => Controller.GetIdeias(req, res));// funcionando
// DELETE de registros
app.get('/obterideias', (req, res) => Controller.ObterIdeiasUsuario(req, res));
app.get('/obterempresas', (req, res) => Controller.ObterEmpresasUsuario(req, res));
app.delete('/deletar/:tipo/:id', (req, res) => Controller.DeletarRegistro(req, res));
app.get("/obterempresa", (req, res) => Controller.ObterEmpresa(req, res));

// Rota para atualizar empresa (form)
app.post("/atualizarempresa", somenteEmpresa, (req, res) => Controller.AtualizarEmpresa(req, res));
app.post("/atualizarideia", (req, res) => Controller.AtualizarIdeia(req, res));
app.all("/admin", (req, res) => Controller.Admin(req, res));
app.get("/adm", (req, res) => Controller.Ademir(req, res));
app.listen(3030, (error) => {
  if (!error) {
    console.log("Servidor rodando nesta porta: http://localhost:3030/");
  } else {
    console.log("Erro ao iniciar servidor:", error);
  }
});
