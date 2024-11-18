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
router.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('users');
        const users = yield collection.find({}).toArray();
        res.status(200).json(users);
    }
    catch (error) {
        errorResponse(error, res);
    }
    finally {
        yield client.close();
    }
}));
router.get('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('users');
        const userId = new mongodb_1.ObjectId(req.params.id);
        const user = yield collection.findOne({ _id: userId });
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        errorResponse(error, res);
    }
    finally {
        yield client.close();
    }
}));
router.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('users');
        const newUser = req.body;
        const result = yield collection.insertOne(newUser);
        res.status(201).json(Object.assign({ _id: result.insertedId }, newUser));
    }
    catch (error) {
        res.status(400).json({ message: 'Bad Request' });
    }
    finally {
        yield client.close();
    }
}));
router.put('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('users');
        const id = req.params.id;
        const updates = req.body;
        const result = yield collection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updates });
        if (result.matchedCount === 0) {
            res.status(404).json({ message: 'User not found' });
        }
        else {
            res.status(200).json({ message: 'User Updated' });
        }
    }
    catch (error) {
        res.status(404).json({ message: 'User Not Found' });
    }
    finally {
        yield client.close();
    }
}));
router.delete('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('users');
        const id = req.params.id;
        const result = yield collection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        if (result.deletedCount === 0) {
            res.status(404).json({ message: 'User not found' });
        }
        else {
            res.status(204).json({ message: 'User Deleted' });
        }
    }
    catch (error) {
        res.status(404).json({ message: 'User Not Found' });
    }
    finally {
        yield client.close();
    }
}));
exports.default = router;
