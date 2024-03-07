'use strict'
import { encrypt, checkPassword, checkUpdate } from '../../utils/validator.js' 
import User from '../users/user.model.js'
import { generateJwt } from '../../utils/jwt.js'
import bcrypt from 'bcrypt'

export const register = async (req, res) => {
    try {
        // Capturar los datos del formulario (body)
        let data = req.body;
        
        // Encriptar la contraseña
        data.password = await encrypt(data.password);
        
        // Asignar el rol por defecto como CLIENT_ROLE si el campo role está vacío o no tiene valor
        if (!data.role) {
            data.role = 'CLIENT_ROLE';
        }
        
        // Guardar la información en la base de datos
        let user = new User(data);
        await user.save(); // Guardar en la base de datos
        
        // Responder al usuario con un mensaje de éxito
        return res.send({ message: `Registered successfully, can be logged in with username ${user.username}` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error registering user', err: err });
    }
};


// Login for user
export const login = async(req, res)=>{
    try{
        let { username, password, email } = req.body
        let user = await User.findOne({ $or: [{ username: username }, { email: email }] });
        if(user && await checkPassword(password, user.password)){
            let loggedUser = {
                uid: user._id,
                email: user.email,
                username: user.username,
                name: user.name,
                role: user.role,
            }
            let token = await generateJwt(loggedUser)
            return res.send(
                {
                    message: `Welcome, ${loggedUser.name} 😊`, 
                    loggedUser,
                    token
                }
            )
        }
        return res.status(404).send({message: 'Invalid credentials'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error to login'})
    }
}

// Modify the role of a user
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Verificar si el ID del usuario es válido
        if (!id) {
            return res.status(400).send({ error: 'Invalid user ID' });
        }

        // Obtener el usuario actual
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Verificar si el nuevo rol es un valor permitido ('ADMIN_ROLE' o 'CLIENT_ROLE')
        if (role !== 'ADMIN_ROLE' && role !== 'CLIENT_ROLE') {
            return res.status(400).send({ error: 'Invalid role value' });
        }

        // Verificar si el usuario intenta cambiar a un rol que ya posee
        if (user.role === role) {
            return res.status(400).send({ message: `You are already ${role}` });
        }

        // Actualizar el rol del usuario
        const updatedUser = await User.findByIdAndUpdate(id, { role: role }, { new: true });
        
        res.send(updatedUser);
    } catch (error) {
        res.status(500).send({ error: 'Error modifying user role' });
    }
};

export const editUserInfo = async (req, res) => {
    try {
        const { id } = req.params;
        let data = req.body;

        if (!id) {
            return res.status(400).send({ error: 'Invalid user ID' });
        }

        // Encriptar la contraseña antes de actualizarla
        if (data.password) {
            data.password = await encrypt(data.password);
        }

        // Verificar qué campos se pueden actualizar
        let update = checkUpdate(data, false);
        if (!update) {
            return res.status(400).send({ message: 'Some data cannot be updated or missing' });
        }

        // Actualizar la información del usuario en la base de datos
        let updatedUser = await User.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found or not updated' });
        }

        // Generar un token JWT para el usuario actualizado
        const token = await generateJwt({ data });

        return res.send({ message: 'User updated successfully!', updatedUser, token });
    
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error editing user information' });
    }
}

// Delete a user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ error: 'Invalid user ID' });
        }

        // Eliminar al usuario de la base de datos
        const deletedUser = await User.findOneAndDelete({ _id: id });

        if (!deletedUser) {
            return res.status(404).send({ message: 'User not found or already deleted' });
        }

        return res.send({ message: 'User deleted successfully', deletedUser });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error deleting user' });
    }
};

export const deleteYourProfile = async (req, res) => {
    try {
      const { password } = req.body;
      const { id } = req.params;
  
      if (!id || !password) {
        return res.status(400).send({ error: 'ID de usuario o contraseña no válidos' });
      }
  
      // Buscar al usuario en la base de datos
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' });
      }
  
      // Verificar la contraseña proporcionada
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).send({ message: 'Contraseña incorrecta' });
      }
  
      // Eliminar al usuario de la base de datos
      const deletedUser = await User.findOneAndDelete({ _id: id });
  
      if (!deletedUser) {
        return res.status(404).send({ message: 'Usuario no encontrado o ya eliminado' });
      }
  
      return res.send({ message: 'Usuario eliminado correctamente', deletedUser });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Error al eliminar el usuario' });
    }
};

