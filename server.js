const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("."));

// Firebase 接続設定
if (process.env.FIREBASE_PROJECT_ID) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
} else {
  const serviceAccount = require("./firebase-key.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const collection = db.collection("suggestions");

// 投稿一覧取得
app.get("/api/suggestions", async (req, res) => {
  try {
    const snapshot = await collection.orderBy("timestamp", "desc").get();
    const suggestions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データ取得中にエラーが発生しました。" });
  }
});

// 投稿追加
app.post("/api/suggestions", async (req, res) => {
  const { name, message } = req.body;
  if (!message) return res.status(400).json({ error: "メッセージを入力してください。" });

  const suggestion = {
    name: name || "匿名",
    message,
    timestamp: new Date().toISOString(),
    status: "new"
  };

  try {
    const docRef = await collection.add(suggestion);
    res.json({ success: true, id: docRef.id, suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データ保存に失敗しました。" });
  }
});

// 既読にする
app.patch("/api/suggestions/:id/read", async (req, res) => {
  const id = req.params.id;

  try {
    await collection.doc(id).update({ status: "read" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "既読更新に失敗しました。" });
  }
});

// 未読に戻す
app.patch("/api/suggestions/:id/unread", async (req, res) => {
  const id = req.params.id;

  try {
    await collection.doc(id).update({ status: "new" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "未読変更に失敗しました。" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
