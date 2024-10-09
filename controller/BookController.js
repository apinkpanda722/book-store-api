const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const router = require("../routes/books");

const allBooks = (req, res) => {
    let sql = 'SELECT * FROM books';
    conn.query(sql, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
        }

        return res.status(StatusCodes.OK).json(results);
    })
}

const bookDetail = (req, res) => {
    let { id } = req.params;
    id = parseInt(id);

    let sql = 'SELECT * FROM books WHERE id = ?';
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

const booksByCategory = (req, res) => {
    res.json("카테고리별 도서 목록 조회");
}

module.exports = {
    allBooks,
    bookDetail,
    booksByCategory
}
