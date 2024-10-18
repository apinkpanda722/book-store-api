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

    let { items, delivery, totalNum, totalPrice, userId, firstBookTitle } = req.body;

    let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;
    let values = [delivery.address, delivery.receiver, delivery.contact];
    let [results] = await conn.execute(sql, values);

    let delivery_id = results.insertId;

    sql = `INSERT INTO orders (book_title, total_num, total_price, user_id, delivery_id) VALUES (?, ?, ?, ?, ?)`;
    values = [firstBookTitle, totalNum, totalPrice, userId, delivery_id];
    [results] = await conn.execute(sql, values);
    let order_id = results.insertId;

    sql = `INSERT INTO orderedBook (order_id, book_id, num) 
            VALUES ?`;
    values = [];
    items.forEach((item) => {
        values.push([order_id, item.book_id, item.num])
    })
    results = await conn.query(sql, [values]);

    return res.status(StatusCodes.OK).json(results[0]);
}

const getOrders = (req, res) => {
    res.json("주문 목록 조회");
}

const getOrderDetail = (req, res) => {
    res.json("주문 상세 상품 조회");
}

module.exports = {
    order,
    getOrders,
    getOrderDetail
}