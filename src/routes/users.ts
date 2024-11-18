import { Router } from "express";
import { MongoClient, ObjectId } from "mongodb";
import { User } from "../models/user";
import dotenv from "dotenv";

dotenv.config();
const router = Router();
const client = new MongoClient(process.env.MONGODB_URI!);

const errorResponse = (error: any, res: any) => {
    console.error("FAIL", error);
    res.status(500).json({ message: "Internal Server Error" });
  };

router.get('/users', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<User>('users');
        const users = await collection.find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        errorResponse(error, res);
    } finally {
        await client.close();
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<User>('users');

        const userId = new ObjectId(req.params.id);
        const user = await collection.findOne({ _id: userId });

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        errorResponse(error, res);
    } finally {
        await client.close();
    }
});

router.post('/users', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<User>('users');
        const newUser: User = req.body;
        const result = await collection.insertOne(newUser);

        res.status(201).json({_id: result.insertedId, ...newUser});
    } catch (error) {
        res.status(400).json( { message: 'Bad Request'} );
    } finally {
        await client.close();
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<User>('users');
        const id = req.params.id;
        const updates = req.body;

        const result = await collection.updateOne(
            {_id: new ObjectId(id) },
            { $set: updates }
        )

        if (result.matchedCount === 0) {
            res.status(404).json( { message: 'User not found' } );
        } else {
            res.status(200).json( { message: 'User Updated' });
        }
    } catch (error) {
        res.status(404).json( { message: 'User Not Found'} );
    } finally {
        await client.close();
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<User>('users');
        const id = req.params.id;
        
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            res.status(404).json( { message: 'User not found' } );
        } else {
            res.status(204).json( { message: 'User Deleted' });
        }
    } catch (error) {
        res.status(404).json( { message: 'User Not Found'} );
    } finally {
        await client.close();
    }
});

export default router;