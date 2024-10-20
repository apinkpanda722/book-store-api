const decodeJwt = require("../auth");
const jwt = require("jsonwebtoken");
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

    let authorization = decodeJwt(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            "message" : "로그인 세션이 만료되었습니다. 다시 로그인하세요."
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            "message": "잘못된 토큰입니다."
        });
    }

    let book_id = req.params.id;
    book_id = parseInt(book_id);
    let values = [book_id];
    let sql = `SELECT books.*, category.name,
                        (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes`;

    if (authorization instanceof ReferenceError) {
        sql += ` FROM books LEFT JOIN category
                    ON books.category_id = category.id WHERE books.id = ?`;
    } else {
        sql += `, (SELECT EXISTS (SELECT * FROM likes WHERE user_id = ? AND liked_book_id = ?)) AS liked 
                    FROM books LEFT JOIN category
                    ON books.category_id = category.id WHERE books.id = ?`;
        values = [authorization.id, book_id, book_id];
    }

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
    // } else if (authorization instanceof ReferenceError) {
    //     book_id = req.params.id;
    //
    //     book_id = parseInt(book_id);
    //     sql = `SELECT books.*, category.name,
    //                 (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes
    //                 FROM books LEFT JOIN category
    //                 ON books.category_id = category.id WHERE books.id = ?`;
    //     values = [book_id];
    //     conn.query(sql, values,
    //         (error, results) => {
    //             if (error) {
    //                 console.log(error);
    //                 return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    //             }
    //
    //             if (results[0])
    //                 return res.status(StatusCodes.OK).json(results[0]);
    //             else
    //                 return res.status(StatusCodes.NOT_FOUND).end();
    //         })
    // } else {
    //     book_id = req.params.id;
    //
    //     book_id = parseInt(book_id);
    //     sql = `SELECT books.*, category.name,
    //                 (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes,
    //                 (SELECT EXISTS (SELECT * FROM likes WHERE user_id = ? AND liked_book_id = ?)) AS liked
    //                 FROM books LEFT JOIN category
    //                 ON books.category_id = category.id WHERE books.id = ?`;
    //     values = [authorization.id, book_id, book_id];
    //     conn.query(sql, values,
    //         (error, results) => {
    //             if (error) {
    //                 console.log(error);
    //                 return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    //             }
    //
    //             if (results[0])
    //                 return res.status(StatusCodes.OK).json(results[0]);
    //             else
    //                 return res.status(StatusCodes.NOT_FOUND).end();
    //         })
    // }

}

module.exports = {
    allBooks,
    bookDetail
}
