import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {

    const { email, nombre } = req.body;

    const existeUsuario = await Veterinario.findOne({ email });

    if (existeUsuario) {
        const error = new Error('El usuario ya se encuentra registrado');
        return res.status(400).json({msg: error.message});
    }
    try {
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

        // Enviar email 
        emailRegistro({ 
            email,
            nombre,
            token : veterinarioGuardado.token,
        });

        res.json(veterinarioGuardado);

    } catch (error) {
        console.log(error);
    }
    res.json({msg: "Registrando usuario"})
};

const perfil = (req, res) => {

    const {veterinario} = req;

    res.json(veterinario)
};

const confirmar = async (req, res) => {
    const { token } = req.params;

    const usuarioConfirmar = await Veterinario.findOne({token});

    if (!usuarioConfirmar ) {
        const error = new Error ('Token invalido');
        return res.status(404).json({msg: error.message});
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado= true;

        await usuarioConfirmar.save();

        res.json({ msg: 'Usuario confirmado correctamente' });
    } catch (error) {
        console.log(error);
    }
    console.log(usuarioConfirmar);   
}

const autenticar = async (req, res) => {
    const { email, password } = req.body;

    const usuario = await Veterinario.findOne({email});
    if (!usuario ) {
        const error = new Error ('El usuario no existe');
        return res.status(404).json({msg: error.message});
    }

    if (!usuario.confirmado) {
        const error = new Error ('Tu cuenta no ha sido confirmada');
        return res.status(403).json({msg: error.message});
    }

    if (await usuario.comprobarPassword(password)) {
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            telefono: usuario.telefono,
            token: generarJWT(usuario.id),

        });

    } else {
        const error = new Error ('El password es incorrecto');
        return res.status(403).json({msg: error.message});
    }
}

// The function allows you to reset the password
const olvidePassword = async (req, res) => {
    const { email } = req.body;

    const existeVeterinario = await Veterinario.findOne({email})

    if(!existeVeterinario) {
        const error = new Error('Usuario no existe');
        return res.status(400).json({msg: error.message});
    }

    try {
        existeVeterinario.token = generarId()
        await existeVeterinario.save();

        //Send mail to reset the password
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token,
        });
        
        res.json({msg: 'Hemos enviado un correo electrónico con las instrucciones'});
    } catch (error) {
        console.log(error);
    }
}

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const tokenValido = await Veterinario.findOne({token});
    if(tokenValido) {
        res.json({msg: 'Token valido y el usuario existe'});
    } else {
        const error = new Error('El token no es valido');
        return res.status(404).json({msg: error.message});
    }
}
const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const veterinario = await Veterinario.findOne({token});

    if(!veterinario){
        const error = new Error('Hubo un error');
        return res.status(404).json({msg: error.message});
    }

    try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        res.json({msg: 'Password modificado correctamente'})
    } catch (error) {
        console.log(error);
    }
}

const actualizarPerfil = async(req, res) => {
    console.log(req.params);
    const veterinario = await Veterinario.findById(req.params.id);
    if (!veterinario) {
        const error = new Error('Ocurrio un error al obtener el veterinario');
        return res.status(400).json({ msg:error.message });
    }

    const { email } = req.body;
    if (veterinario.email != req.body.email) {
        const existeEmail = await Veterinario.findOne({ email });
        if (existeEmail) {
            const error = new Error('El email ya esta siendo usado por otro usuario');
            return res.status(400).json({ msg:error.message });
        }
    }

    try {
        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;
        const veterinarioActualizado = await veterinario.save();
        res.json(veterinarioActualizado);
    } catch (error) {
        console.log(error);
    }
}

const actualizarPassword = async (req, res) => {
    const { id } = req.veterinario;
    const { pwd_actual, pwd_nuevo } = req.body;
    const veterinario = await Veterinario.findById(id);
    if (!veterinario) {
        const error = new Error('Ocurrio un error al obtener el veterinario');
        return res.status(400).json({ msg:error.message });
    }
    if ( await veterinario.comprobarPassword(pwd_actual) ) {
        veterinario.password = pwd_nuevo;
        await veterinario.save();
        res.json({msg: 'Password modificado correctamente'});
    } else {
        const error = new Error('El password actual no es correcto!');
        return res.status(400).json({msg: error.message})
    }
}

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword,
}