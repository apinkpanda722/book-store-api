const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const addToCart = (req, res) => {
    let { book_id, num } = req.body;

    let authorization = decodeJwt(req);

    let sql = `INSERT INTO cartItems (book_id, num, user_id) VALUES (?, ?, ?)`;
    let values = [book_id, num, authorization.id];
    conn.query(sql, values,
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            return res.status(StatusCodes.OK).json(results);
        })
}

const getCartItems = (req, res) => {
    let { selected } = req.body;

    let authorization = decodeJwt(req);

    let sql = `SELECT cartItems.id, book_id, title, summary, num, price
                    FROM cartItems LEFT JOIN books
                    ON cartItems.book_id = books.id
                    WHERE user_id = ? AND cartItems.id IN (?)`;

    let values = [authorization.id, selected];
    conn.query(sql, values,
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            return res.status(StatusCodes.OK).json(results);
        })
}

const removeCartItem = (req, res) => {
    let cartItemId = req.params.id;

    let sql = `DELETE FROM cartItems WHERE id = ?`;
    conn.query(sql, cartItemId,
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            return res.status(StatusCodes.OK).json(results);
        })
}

function decodeJwt (req) {
    let token = req.headers["authorization"];
    let decodedJwt = jwt.verify(token, process.env.PRIVATE_KEY);
    return decodedJwt;
}


module.exports = {
    addToCart,
    getCartItems,
    removeCartItem
}