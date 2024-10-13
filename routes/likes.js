const express = require('express');
const {
    addLike,
    removeLike
} = require("../controller/LikeController");
const router = express.Router();

router.use(express.json());

router.post('/:id', addLike); // 좋아요 추가
router.delete('/:id', removeLike); // 좋아요 삭제

module.exports = router;