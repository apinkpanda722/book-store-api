const decodeJwt = require("../auth");
const jwt = require("jsonwebtoken");
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const mariadb = require("mysql2/promise");

const order = async (req, res) => {
    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'BookShop',
        dateStrings: true
    });

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

    let { items, delivery, totalNum, totalPrice, firstBookTitle } = req.body;

    let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;
    let values = [delivery.address, delivery.receiver, delivery.contact];
    let [results] = await conn.execute(sql, values);

    let delivery_id = results.insertId;

    sql = `INSERT INTO orders (book_title, total_num, total_price, user_id, delivery_id) VALUES (?, ?, ?, ?, ?)`;
    values = [firstBookTitle, totalNum, totalPrice, authorization.id, delivery_id];
    [results] = await conn.execute(sql, values);
    let order_id = results.insertId;

    sql = `SELECT book_id, num FROM cartItems WHERE id IN (?)`;
    // conn.execute나 conn.query와는 상관없이 INSERT문이 아닌 SELECT 문이라 반환형태가 다르다.
    let [orderItems, fields] = await conn.query(sql, [items]);

    sql = `INSERT INTO orderedBook (order_id, book_id, num) 
            VALUES ?`;

    // items.. 배열 : 요소들을 하나씩 꺼내서 (foreach문 돌려서) >
    values = [];
    orderItems.forEach((item) => {
        values.push([order_id, item.book_id, item.num])
    })
    results = await conn.query(sql, [values]);

    let result  = await deleteCartItems(conn, items);

    return res.status(StatusCodes.OK).json(result);
}

const deleteCartItems = async (conn, items) => {
    let sql = `DELETE FROM cartItems WHERE id IN (?)`;
    let result = await conn.query(sql, [items]);
    return result;
}

const getOrders = (req, res) => {
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

    let sql = `SELECT orders.id, created_at, address, receiver, contact,
                        book_title, total_num, total_price
                        FROM orders LEFT JOIN delivery
                        ON orders.delivery_id = delivery.id
                        WHERE orders.user_id = ?`
    conn.query(sql, authorization.id,
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            return res.status(StatusCodes.OK).json(results);
        })
}

const getOrderDetail = (req, res) => {
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

    const orderId = req.params.id;

    let sql = `SELECT book_id, title, author, price, num
                        FROM orderedBook LEFT JOIN books
                        ON orderedBook.book_id = books.id
                        WHERE order_id = ?`
    conn.query(sql, orderId,
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            return res.status(StatusCodes.OK).json(results);
        })
}

module.exports = {
    order,
    getOrders,
    getOrderDetail
}