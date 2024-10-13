const express = require("express");
const router = express.Router();
const {
    login,
    join,
    passwordResetRequest,
    passwordReset
} = require("../controller/UserController");

router.use(express.json());

router.post("/join", join); // 회원가입
router.post("/login", login); // 로그인
router.post("/reset", passwordResetRequest); // 패스워드 초기화 요청
router.put("/reset", passwordReset); // 패스워드 초기화

module.exports = router;