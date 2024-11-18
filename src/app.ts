import express from 'express';
import productRouter from './routes/products';
import userRouter from './routes/users';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});