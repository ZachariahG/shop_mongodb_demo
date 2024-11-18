import { Router } from "express";
import { MongoClient, ObjectId } from "mongodb";
import { Product } from "../models/product";
import dotenv from "dotenv";

dotenv.config();
const router = Router();
const client = new MongoClient(process.env.MONGODB_URI!);

const errorResponse = (error: any, res: any) => {
    console.error("FAIL", error);
    res.status(500).json({ message: "Internal Server Error" });
  };

router.get('/products', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<Product>('products');
        const products = await collection.find({}).toArray();
        res.status(200).json(products);
    } catch (error) {
        errorResponse(error, res);
    } finally {
        await client.close();
    }
});

router.get('/products/search', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<Product>('products');

        const query: any = {};

        if (req.query.name) {
            query.name = { $regex: new RegExp(req.query.name as string, 'i') };
        }
        if (req.query["max-price"]) {
            query.price = { $lte: parseInt(req.query["max-price"] as string) };
          }
        if (req.query.includes) {
            query.description = { $regex: new RegExp(req.query.includes as string, 'i') };
        }

        const limit = parseInt(req.query.limit as string) || Infinity;
        const products = await collection.find(query).limit(limit).toArray();

        res.status(200).json(products);

    } catch (error) {
        errorResponse(error, res);
    } finally {
        await client.close();
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<Product>('products');

        const productId = new ObjectId(req.params.id);
        const product = await collection.findOne({ _id: productId });

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        errorResponse(error, res);
    } finally {
        await client.close();
    }
});

router.post('/products', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<Product>('products');
        const newProduct: Product = req.body;
        const result = await collection.insertOne(newProduct);

        res.status(201).json({_id: result.insertedId, ...newProduct})
    } catch (error) {
        res.status(400).json( { message: 'Bad Request'} );
    } finally {
        await client.close();
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<Product>('products');
        const id = req.params.id;
        const updates = req.body;

        const result = await collection.updateOne(
            {_id: new ObjectId(id) },
            { $set: updates }
        )

        if (result.matchedCount === 0) {
            res.status(404).json( { message: 'Product not found' } );
        } else {
            res.status(200).json( { message: 'Product Updated' });
        }
    } catch (error) {
        res.status(404).json( { message: 'Product Not Found'} );
    } finally {
        await client.close();
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<Product>('products');
        const id = req.params.id;
        
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            res.status(404).json( { message: 'Product not found' } );
        } else {
            res.status(204).json( { message: 'Product Deleted' });
        }
    } catch (error) {
        res.status(404).json( { message: 'Product Not Found'} );
    } finally {
        await client.close();
    }
});

export default router;