"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const client = new mongodb_1.MongoClient(process.env.MONGODB_URI);
const errorResponse = (error, res) => {
    console.error("FAIL", error);
    res.status(500).json({ message: "Internal Server Error" });
};
router.get('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('products');
        const products = yield collection.find({}).toArray();
        res.status(200).json(products);
    }
    catch (error) {
        errorResponse(error, res);
    }
    finally {
        yield client.close();
    }
}));
router.get('/products/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('products');
        const query = {};
        if (req.query.name) {
            query.name = { $regex: new RegExp(req.query.name, 'i') };
        }
        if (req.query["max-price"]) {
            query.price = { $lte: parseInt(req.query["max-price"]) };
        }
        if (req.query.includes) {
            query.description = { $regex: new RegExp(req.query.includes, 'i') };
        }
        const limit = parseInt(req.query.limit) || Infinity;
        const products = yield collection.find(query).limit(limit).toArray();
        res.status(200).json(products);
    }
    catch (error) {
        errorResponse(error, res);
    }
    finally {
        yield client.close();
    }
}));
router.get('/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('products');
        const productId = new mongodb_1.ObjectId(req.params.id);
        const product = yield collection.findOne({ _id: productId });
        if (product) {
            res.status(200).json(product);
        }
        else {
            res.status(404).json({ message: "Product not found" });
        }
    }
    catch (error) {
        errorResponse(error, res);
    }
    finally {
        yield client.close();
    }
}));
router.post('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('products');
        const newProduct = req.body;
        const result = yield collection.insertOne(newProduct);
        res.status(201).json(Object.assign({ _id: result.insertedId }, newProduct));
    }
    catch (error) {
        res.status(400).json({ message: 'Bad Request' });
    }
    finally {
        yield client.close();
    }
}));
router.put('/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('products');
        const id = req.params.id;
        const updates = req.body;
        const result = yield collection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updates });
        if (result.matchedCount === 0) {
            res.status(404).json({ message: 'Product not found' });
        }
        else {
            res.status(200).json({ message: 'Product Updated' });
        }
    }
    catch (error) {
        res.status(404).json({ message: 'Product Not Found' });
    }
    finally {
        yield client.close();
    }
}));
router.delete('/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('products');
        const id = req.params.id;
        const result = yield collection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        if (result.deletedCount === 0) {
            res.status(404).json({ message: 'Product not found' });
        }
        else {
            res.status(204).json({ message: 'Product Deleted' });
        }
    }
    catch (error) {
        res.status(404).json({ message: 'Product Not Found' });
    }
    finally {
        yield client.close();
    }
}));
exports.default = router;
