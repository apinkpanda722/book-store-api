const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const allBooks = (req, res) => {
    let { category_id, isNew } = req.query;

    let sql = 'SELECT * FROM books ';
    let values = [];
    if (category_id && isNew) {
        sql += 'WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
        values = [category_id, isNew];
    } else if (category_id) {
        sql += 'WHERE category_id = ?';
        values = category_id;
    } else if (isNew) {
        sql += 'WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
        values = isNew;
    }

    // 카테고리별 도서 목록 조회
    conn.query(sql, values,
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            if (results.length)
                return res.status(StatusCodes.OK).json(results);
            else
                return res.status(StatusCodes.NOT_FOUND).end();
        }
    )

}
const bookDetail = (req, res) => {
    let { id } = req.params;

    id = parseInt(id);
    let sql = `SELECT * FROM books LEFT JOIN category
        ON books.category_id = category.id WHERE books.id = ?`;
    conn.query(sql, id,
        (error, results) => {
        if (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
        }

        if (results[0])
            return res.status(StatusCodes.OK).json(results[0]);
        else
            return res.status(StatusCodes.NOT_FOUND).end();
    })

}

module.exports = {
    allBooks,
    bookDetail
}
