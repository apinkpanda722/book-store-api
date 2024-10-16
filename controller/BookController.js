const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const allBooks = (req, res) => {
    let { category_id, isNew, limit, currentPage } = req.query;

    let offset = limit * (currentPage - 1);

    let sql = `SELECT *, 
                    (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes FROM books`;
    let values = [];
    if (category_id && isNew) {
        sql += ' WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
        values = [category_id];
    } else if (category_id) {
        sql += ' WHERE category_id = ?';
        values = [category_id];
    } else if (isNew) {
        sql += ' WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
    }

    sql += ' LIMIT ? OFFSET ?';
    values.push(parseInt(limit), offset);

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
    let { user_id } = req.body;

    id = parseInt(id);
    let sql = `SELECT books.*, category.name,
                    (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes,
                    (SELECT EXISTS (SELECT * FROM likes WHERE user_id = ? AND liked_book_id = ?)) AS liked
                    FROM books LEFT JOIN category
                    ON books.category_id = category.id WHERE books.id = ?`;
    let values = [user_id, id, id];
    conn.query(sql, values,
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
