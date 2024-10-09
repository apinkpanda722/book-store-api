const express = require("express");
const router = express.Router();
const {
    login,
    join,
    passwordResetRequest,
    passwordReset
} = require("../controller/UserController");

router.use(express.json());

// 회원가입
router.post("/join", join);

// 로그인
router.post("/login", login);

// 패스워드 초기화 요청
router.post("/reset", passwordResetRequest);

// 패스워드 초기화
router.put("/reset", passwordReset);

module.exports = router;