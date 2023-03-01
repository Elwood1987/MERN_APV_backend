import nodemailer from 'nodemailer';

const emailRegistro = async ( datos ) => {
  try {
    console.log('Inicia el envio de email');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });
    console.log('Creo el transport');
    const { email, nombre, token } = datos;
    console.log('Supero los datos');
    const info = await transporter.sendMail({
      from: "APV administrador de pacientes de veterinaria.",
      to: email,
      subject: 'Comprueba tu cuenta en APV',
      text: 'Comprueba tu cuenta en APV',
      html: `<p>Hola: ${nombre}, comprueba tu cuenta en APV.</p>
          <p>Tu cuenta ya esta lista, solo debes comprobarla en el siguiente 
          <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a></p>
          <p>Si tu no creaste esta cuenta puedes ignorar este mensaje.</p>
      `
    });
    console.log('Mensaje Enviado: %s', info.messageId);
  } catch (error) {
    console.log(error);
  }
    
};

export default emailRegistro;