const express = require("express");
const router = express.Router();
const conn = require("../mariadb");
const { StatusCodes } = require('http-status-codes');

router.use(express.json());

router.post("/join", (req, res) => {
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
});

router.post("/login", (req, res) => {
    res.json("로그인");
});

router.post("/reset", (req, res) => {
    res.json("비밀번호 초기화 요청");
});

router.put("/reset", (req, res) => {
    res.json("비밀번호 초기화");
});

module.exports = router;