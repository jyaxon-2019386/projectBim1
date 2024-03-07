import express from 'express'
import { editInvoice, exportInvoiceToPDF, getPurchaseHistory, getTopSellingProducts, getUserInvoices, saveCart  } from './invoice.controller.js'
import { isAdmin, validateJwt } from '../../middlewares/validate-jwt.js'

const api = express.Router()

api.put('/editInvoice/:id', editInvoice)
api.get('/getUserInvoices/:id', getUserInvoices)
api.post('/saveCart', saveCart)
api.get('/getTopSellingProducts', getTopSellingProducts)
api.get('/getPurchaseHistory', [validateJwt], getPurchaseHistory)
api.get('/exportInvoiceToPDF', exportInvoiceToPDF)

export default api