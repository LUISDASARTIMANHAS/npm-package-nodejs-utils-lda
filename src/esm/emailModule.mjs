import fs from "fs";
import { createTransport } from "nodemailer";
import { log, logError } from "./logger/index.mjs";
import { checkConfigValue, configExist, getConfig } from "./configHelper.mjs";
configExist();
let transporter;

checkConfigValue("emailSystem.service", "Gmail");
checkConfigValue("emailSystem.host", "smtp.gmail.com");
checkConfigValue("emailSystem.ssl_port", 465);
checkConfigValue("emailSystem.tls_port: ", 587);
checkConfigValue("emailSystem.user: ", "example@gmail.com");
checkConfigValue("emailSystem.ssl_tls: ", true);

const configMail = getConfig().emailSystem;
let dinamicPort = configMail.ssl_port;
const useTLS = configMail.ssl_tls;

if (useTLS) {
  dinamicPort = configMail.tls_port;
}

if (createTransport({ service: configMail.service })) {
  // Se o serviço estiver entre os suportados pelo Nodemailer, use createTransport com o serviço
  transporter = createTransport({
    service: configMail.service || "Gmail",
    auth: {
      user: process.env.email,
      pass: process.env.email_pass,
    },
  });
} else {
  // Caso contrário, crie o transporte manualmente
  transporter = createTransport({
    host: configMail.host,
    port: dinamicPort,
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
        logError(`<sendMail>: Erro ao enviar o e-mail: ${error}`);
        callback(error, null);
      } else {
        log(`<sendMail>: E-mail enviado: ${info.response}`);
        callback(null, info);
      }
    });
  } catch (error) {
    logError("SERVIDOR <sendMail>: Erro ao criar email: ", error);
    callback(error, null);
  }
}

export default sendMail;
