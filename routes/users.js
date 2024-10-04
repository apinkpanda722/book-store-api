const express = require("express");
const router = express.Router();
const conn = require("../mariadb");

router.use(express.json());

router.post("/join", (req, res) => {
    const { email, password } = req.body;

    let sql = 'INSERT INTO users (email, password) VALUES (?,?)';
    let values = [email, password];

    conn.query(sql, values, (error, result) => {
        if (error) {
            console.log(error);
            return res.status(400).end(result);
        }

        res.status(201).json();
    })

    res.json("회원 가입");
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