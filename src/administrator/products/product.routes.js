import express from 'express'
import { save, test, get, update, deleteP, search, getOfStock, viewCatalogue } from './product.controller.js'

const api = express.Router()

api.get('/test', test)
api.post('/save', save)
api.get('/get', get)
api.get('/getOfStock', getOfStock)
api.get('/viewCatalogue', viewCatalogue)
api.put('/update/:id', update)
api.delete('/delete/:id', deleteP)
api.post('/search', search)


export default api