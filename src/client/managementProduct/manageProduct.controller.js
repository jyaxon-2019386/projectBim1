'use strict'

import Product from '../../administrator/products/product.model.js'
import Category from '../../administrator/categories/category.model.js'

export const viewProductsByName  = async(req, res) => {
    try {
        const { order } = req.body; 

        let sortCriteria = {};
        if (order === 'A-Z') {
            sortCriteria.name = 1; // Ordenar en orden ascendente por el campo 'name'
        } else if (order === 'Z-A') {
            sortCriteria.name = -1; // Ordenar en orden descendente por el campo 'name'
        }
        const products = await Product.find().sort(sortCriteria);

        return res.send(products); 
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error filtering products by order', error: err });
    }
}

// View the categories exists
export const viewCategories = async (req, res) =>{
    try {
        let categories = await Category.find({})
        return res.send({ categories })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting categories' })
    }
}

// View the catalogue complete
export const viewCatalogue = async (req, res) => {
    try {
        let products = await Product.find({}).populate({path: 'category', select: 'name -_id'})
        return res.send({ products })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting products' })
    }
}

// Filter by business category
export const filterByCategory = async (req, res) => {
    try {
        const { category } = req.body; // Obtener la categoría 
        const products = await Product.find({ category: category }).populate({path: 'category', select: '-_id'});
        return res.send(products);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error filtering catalogue by category', error: err });
    }
}
export const viewMostSoldProducts = async (req, res) => {
    try {
        const mostSoldProducts = await Product.find({ stock: { $gte: 10 } })
            .populate({ path: 'category', select: 'name -_id' })
            .sort({ stock: -1 })
            .limit(100);

        return res.send({ mostSoldProducts });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error getting most sold products', error: err });
    }
}
