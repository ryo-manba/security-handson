const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const router = express.Router();

router.use(
  session({
    secret: "session",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 1000 * 5,
    },
  })
);
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());

let sessionData = {};

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username !== "user1" || password !== "password") {
    res.status(403);
    res.send("ログイン失敗");
    return;
  }
  // セッションにユーザー名を格納
  sessionData = req.session;
  sessionData.username = username;
  const token = crypto.randomUUID();
  res.cookie("csrf_token", token, {
    secure: true
  });
  res.redirect("/csrf_test.html");
})

router.post("/remit", (req, res) => {
  // セッションに保存した情報からログイン済みか確認する
  if (!req.session.username ||
      req.session.username !== sessionData.username) {
      res.status(403);
      res.send("ログインしていません。");
      return;
    }
    if (req.cookies["csrf_token"] !== req.body["csrf_token"]) {
      res.status(400);
      res.send("不正なリクエストです。");
      return;
    }
    const { to, amount } = req.body;
    res.send(`「${to}」へ${amount}円送金しました。`);
})

module.exports = router;
