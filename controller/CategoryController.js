const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const allCategory = (req, res) => {

    // 카테고리 전체 목록 리스트
    let sql = 'SELECT * FROM category';
    conn.query(sql, (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            return res.status(StatusCodes.OK).json(results);

        }
    )
}


module.exports = {
    allCategory
}
