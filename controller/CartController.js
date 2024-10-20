const decodeJwt = require("../auth");
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const addToCart = (req, res) => {
    let { book_id, num } = req.body;

    let authorization = decodeJwt(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            "message" : "로그인 세션이 만료되었습니다. 다시 로그인하세요."
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            "message" : "잘못된 토큰입니다."
        });
    }

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

    let authorization = decodeJwt(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            "message" : "로그인 세션이 만료되었습니다. 다시 로그인하세요."
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            "message" : "잘못된 토큰입니다."
        });
    }

    let sql = `SELECT cartItems.id, book_id, title, summary, num, price
                    FROM cartItems LEFT JOIN books
                    ON cartItems.book_id = books.id
                    WHERE user_id = ?`;
    let values = [authorization.id, selected];

    if (selected) { // 주문서 작성시 '선택한 장바구니 목록 조회'
        sql += ` AND cartItems.id IN (?)`;
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

module.exports = {
    addToCart,
    getCartItems,
    removeCartItem
}