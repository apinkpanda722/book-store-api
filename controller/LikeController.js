const jwt = require("jsonwebtoken");
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const dotenv = require("dotenv");
dotenv.config();

const addLike = (req, res) => {
    const book_id = req.params.id;

    let authorization = decodeJwt(req);

    let sql = 'INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?)';
    let values = [authorization.id, book_id];
    conn.query(sql, values,
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

        return res.status(StatusCodes.OK).json(results);
    })
}

const removeLike = (req, res) => {
    const book_id = req.params.id;

    let authorization = decodeJwt(req);

    let sql = 'DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?';
    let values = [authorization.id, book_id];
    conn.query(sql, values,
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
    addLike,
    removeLike
}