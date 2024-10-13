const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const addToCart = (req, res) => {
    let { book_id, num, user_id } = req.body;

    let sql = `INSERT INTO cartItems (book_id, num, user_id) VALUES (?, ?, ?)`;
    let values = [book_id, num, user_id];
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
    let { user_id, selected } = req.body;

    let sql = `SELECT cartItems.id, book_id, title, summary, num, price
                    FROM cartItems LEFT JOIN books
                    ON cartItems.book_id = books.id
                    WHERE user_id = ?`;

    let values = [user_id];

    if (selected) {
        sql += ` AND cartItems.id IN (?)`;
        values.push(selected);
    }

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
    let { id } = req.params;

    let sql = `DELETE FROM cartItems WHERE id = ?`;
    conn.query(sql, id,
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            return res.status(StatusCodes.OK).json(results);
        })
}


module.exports = {
    addToCart,
    getCartItems,
    removeCartItem
}