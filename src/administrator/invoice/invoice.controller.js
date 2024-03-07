'use strict'

import PDFDocument from 'pdfkit';
import fs from 'fs';

import Invoice from '../invoice/invoice.model.js'
import User from  '../users/user.model.js'
import Product from '../products/product.model.js'
import Sale from '../sales/sale.model.js'
import Cart from '../invoice/carrito.model.js'
import jwt from 'jsonwebtoken';

// Create a new invoice
export const saveCart = async (req, res) => {
    try {
        const { user, products, totalAmount, price } = req.body;

        // Validar si el usuario existe
        const userExists = await User.findById(user);
        if (!userExists) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Validar si los productos existen
        for (const productId of products) {
            const productExists = await Product.findById(productId);
            if (!productExists) {
                return res.status(404).send({ message: 'Product not found' });
            }
        }

        // Crear el carrito de compras
        const cart = new Cart({
            user: user,
            products: products,
            totalAmount: totalAmount
        });
        await cart.save();

        // Crear la factura basada en el carrito de compras
        const invoice = new Invoice({
            user: user,
            products: products,
            totalAmount: totalAmount,
            price: price
        });
        await invoice.save();

        return res.status(201).send({ message: 'Cart saved and invoice created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error saving cart and creating invoice', error });
    }
};

// Función para editar una factura
export const editInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const {  updatedInvoiceData } = req.body;

        if (!updatedInvoiceData || !updatedInvoiceData.products) {
            return res.status(400).send({ message: 'Invalid updated invoice data' });
        }

        // Validar si la factura existe
        const invoiceExists = await Invoice.findById(id);
        if (!invoiceExists) {
            return res.status(404).send({ message: 'Invoice not found' });
        }

        // Validar si los productos existen
        for (const item of updatedInvoiceData.products) {
            const productExists = await Product.findById(item.product);
            if (!productExists) {
                return res.status(404).send({ message: 'Product not found' });
            }

            // Validar si hay suficiente stock para el producto en la factura
            if (product.stock < item.quantity) {
                return res.status(400).send({ message: `Insufficient stock for product ${product.name}` });
            }
        }

        // Actualizar la factura con los nuevos datos
        invoiceExists.products = updatedInvoiceData.products;
        invoiceExists.totalAmount = calculateTotalAmount(updatedInvoiceData.products); // Función para calcular el total
        await invoiceExists.save();

        return res.status(200).send({ message: 'Invoice updated successfully', invoice: invoiceExists });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating invoice', error });
    }
};


export const getUserInvoices = async (req, res) => {
    try {
        const id = req.params.id;

        // Validar si el ID del usuario es válido
        if (!id) {
            return res.status(400).send({ message: 'Invalid user ID' });
        }

        // Buscar las facturas del usuario
        const userInvoices = await Invoice.find({ user: id })
            .populate({ path: 'user', select: 'name' })
            .populate({ path: 'products', select: 'name' });

        // Verificar si se encontraron facturas para el usuario
        if (!userInvoices || userInvoices.length === 0) {
            return res.status(404).send({ message: 'No invoices found for this user' });
        }

        return res.status(200).send({ invoices: userInvoices });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error fetching user invoices', error });
    }
};

export const getTopSellingProducts = async () => {
    try {
        const topSellingProducts = await Sale.aggregate([
            { $unwind: "$products" },
            { $group: { _id: "$products.product", totalSales: { $sum: "$products.quantity" } } },
            { $sort: { totalSales: -1 } },
            { $limit: 5 }
        ]);

        return topSellingProducts;
    } catch (error) {
        console.error(error);
        throw new Error('Error al obtener los productos más vendidos');
    }
};

export const exportInvoiceToPDF = async (req, res) => {
    try {
        const { userId } = req.body;
        const { invoiceId}  = req.body;

        const userInvoice = await Invoice.findOne({ user: userId, _id: invoiceId })
            .populate('user')
            .populate({
                path: 'products',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            });

        if (!userInvoice) {
            return res.status(404).send({ message: 'Invoice not found for this user' });
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        const pdfFilePath = `invoices/invoice_${userInvoice.user.name}.pdf`;
        doc.pipe(fs.createWriteStream(pdfFilePath));

        // Establecer el formato y diseño de la factura
        doc.fontSize(12);
        doc.font('Helvetica-Bold');
        doc.text('Invoice', { align: 'center' });
        doc.moveDown();

        // Cuerpo del documento
        doc.font('Helvetica-Bold');
        doc.text('Username: ', { continued: true });
        doc.font('Helvetica');
        doc.text(`${userInvoice.user.username}`);

        doc.font('Helvetica-Bold');
        doc.text('Name and surname: ', { continued: true });
        doc.font('Helvetica');
        doc.text(`${userInvoice.user.name} ${userInvoice.user.surname}`);

        doc.font('Helvetica-Bold');
        doc.text('Phone: ', { continued: true });
        doc.font('Helvetica');
        doc.text(`${userInvoice.user.phone}`);

        doc.font('Helvetica-Bold');
        doc.text('Email: ', { continued: true });
        doc.font('Helvetica');
        doc.text(`${userInvoice.user.email}`);

        doc.font('Helvetica-Bold');
        doc.text('Date: ', { continued: true });
        doc.font('Helvetica');
        doc.text(`${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}`);
        doc.moveDown();

        doc.font('Helvetica-Bold');
        doc.text('Products:');
        doc.moveDown();
    
        // Listar los productos de la factura con sus categorías
        userInvoice.products.forEach((product, index) => {
            doc.text(`${index + 1}. ${product.name} | Price: $${product.price} | Category: ${product.category.name}`);
            doc.moveDown();
        });
    
        // Mostrar el total de la factura
        doc.font('Helvetica-Bold');
        doc.text(`Total Amount: $${userInvoice.totalAmount}`);

        // Mensaje de pie de página
        doc.fontSize(8);
        doc.text('Thank you for your purchase.', { align: 'center' });

        // Finalizar y cerrar el documento PDF
        doc.end();

        return res.status(200).send({ message: 'Invoice exported to PDF successfully', pdfFilePath });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error exporting invoice to PDF', error });
    }
};

export const getPurchaseHistory = async (req, res) => {
    try {
        // Obtener el token del encabezado de autorización
        const token = req.headers.authorization;
        
        if (!token) {
            return res.status(401).send({ message: 'Unauthorized' });
        }

        // Decodificar el token y obtener el ID del usuario
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decodedToken.uid;

        // Obtener el historial de compras del usuario basado en las facturas asociadas
        const invoices = await Invoice.find({ user: userId });
        
        return res.status(200).send({ purchaseHistory: invoices });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error retrieving purchase history', error });
    }
};





