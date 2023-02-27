import nodemailer from 'nodemailer';

const emailOlvidePassword = async ( datos ) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      });

      const { email, nombre, token } = datos;

      const info = await transporter.sendMail({
        from: "APV administrador de pacientes de veterinaria.",
        to: email,
        subject: 'Restablece tu contraseña en APV',
        text: 'Restablece tu contraseña en APV',
        html: `<p>Hola: ${nombre}, has solicitado restablecer tu contraseña..</p>
            <p>Para restablecer tu contraseña has click  
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">aquí</a></p>
            <p>Si tu no solicitaste restablecer tu contraseña has caso omiso de este mensaje.</p>
        `
      });
      console.log('Mensaje Enviado: %s', info.messageId);
};

export default emailOlvidePassword;