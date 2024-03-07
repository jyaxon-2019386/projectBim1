import express from 'express'
import { filterByCategory, viewCatalogue, viewCategories, viewMostSoldProducts, viewProductsByName } from './manageProduct.controller.js'

const api = express.Router()

api.post('/viewProductsByName', viewProductsByName)
api.get('/viewCatalogue', viewCatalogue)
api.get('/viewCategories', viewCategories)
api.post('/filterByCategory', filterByCategory)
api.get('/viewMostSoldProducts', viewMostSoldProducts)

export default api 