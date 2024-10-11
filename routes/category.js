const express = require('express');
const {
    allCategory
} = require("../controller/CategoryController");
const router = express.Router();

router.use(express.json());

// 카테고리 전체 목록 조회
router.get('/', allCategory);

module.exports = router;