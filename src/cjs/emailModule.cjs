const fs = require("fs");
const nodemailer = require("nodemailer");
const { fopen, fwrite, log } = require("./autoFileSysModule.cjs");
const { configExist } = require("./configHelper.cjs");
configExist();
const configMail = fopen("config.json").emailSystem;
let transporter;

checkConfigIntegrity();

if (nodemailer.createTransport({ service: configMail.service })) {
  // Se o serviço estiver entre os suportados pelo Nodemailer, use createTransport com o serviço
  transporter = nodemailer.createTransport({
    service: configMail.service || "Gmail",
    auth: {
      user: process.env.email,
      pass: process.env.email_pass,
    },
  });
} else {
  // Caso contrário, crie o transporte manualmente
  transporter = nodemailer.createTransport({
    host: configMail.host,
    port: configMail.port,
    secure: configMail.ssl_tls, // SSL/TLS ativado
    auth: {
      user: process.env.email,
      pass: process.env.email_pass,
    },
  });
}

function sendMail(email, subject, text, callback) {
  try {
    const mailOptions = {
      from: configMail.user, // Remetente
      to: email, // Destinatário
      subject: subject,
      text: text,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        log(`SERVIDOR <sendMail>: Erro ao enviar o e-mail: ${error}`);
        callback(error, null);
      } else {
        log(`SERVIDOR <sendMail>: E-mail enviado: ${info.response}`);
        callback(null, info);
      }
    });
  } catch (error) {
    console.error("SERVIDOR <sendMail>: Erro ao criar email: ", error);
    callback(error, null);
  }
}

function checkConfigIntegrity() {
  // Obter config.json
  const configs = fopen("config.json");
  // Verificar se a chave emailSystem existe antes de acessá-la
  if (!configs.emailSystem) {
    // Cria emailSystem caso não exista
    configs.emailSystem = {};
  }
  const emailConfig = configs.emailSystem;

  // Verificar e atribuir valores padrão, se necessário
  if (
    !emailConfig.service ||
    !emailConfig.host ||
    !emailConfig.port ||
    !emailConfig.ssl_tls ||
    !emailConfig.user
  ) {
    // Verifica cada propriedade individualmente e adiciona valores padrão se faltar
    configs.emailSystem.service = configs.emailSystem.service || "Gmail";
    configs.emailSystem.host = configs.emailSystem.host || "smtp.gmail.com";
    configs.emailSystem.port = configs.emailSystem.port || 25;
    configs.emailSystem.ssl_tls =
      configs.emailSystem.ssl_tls !== undefined
        ? configs.emailSystem.ssl_tls
        : true;
    configs.emailSystem.user = configs.emailSystem.user || "example@gmail.com";

    // Salva novamente as configurações no arquivo config.json
    fwrite("config.json", configs);
  }
}

module.exports = sendMail;
