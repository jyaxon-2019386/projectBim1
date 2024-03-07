import express from "express";
import { deleteUser, deleteYourProfile, editUserInfo, login, register, updateUserRole } from "./user.controller.js";
import { isAdmin, validateJwt } from "../../middlewares/validate-jwt.js";

const api = express.Router()

// api.post('/registerAdmin', registerAdmin)
// api.post('/registerClient', registerClient)
api.post('/register', register)
api.post('/login', login)
api.delete('/deleteYourProfile/:id', [validateJwt], deleteYourProfile)
api.delete('/deleteUser/:id', [validateJwt, isAdmin], deleteUser)
api.put('/updateUserRole/:id', updateUserRole)
api.put('/editUserInfo/:id', [validateJwt, isAdmin], editUserInfo)

export default api