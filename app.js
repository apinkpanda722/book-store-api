const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000']

const corsOptions = {
    origin: whitelist,
    credentials: true,
    optionsSuccessStatus: 200,
}

app.use(cors(corsOptions));

const dotenv = require('dotenv');
dotenv.config();

app.listen(process.env.PORT);

const userRouter = require('./routes/users');
const bookRouter = require('./routes/books');
const categoryRouter = require('./routes/category');
const likeRouter = require('./routes/likes');
const cartRouter = require('./routes/carts');
const orderRouter = require('./routes/orders');


app.use("/users", userRouter);
app.use("/books", bookRouter);
app.use("/category", categoryRouter);
app.use("/likes", likeRouter);
app.use("/carts", cartRouter);
app.use("/orders", orderRouter);
