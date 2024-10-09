const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const join = (req, res) => {
    const { email, password } = req.body;

    let sql = 'INSERT INTO users (email, password) VALUES (?,?)';
    let values = [email, password];

    conn.query(sql, values, (error, result) => {
        if (error) {
            console.log(error);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        return res.status(StatusCodes.CREATED).json(result);
    });
};

const login = (req, res) => {
    res.json("로그인");
};

const passwordResetRequest = (req, res) => {
    res.json("비밀번호 초기화 요청");
};

const passwordReset = (req, res) => {
    res.json("비밀번호 초기화");
}

module.exports = {
    join,
    login,
    passwordResetRequest,
    passwordReset
}