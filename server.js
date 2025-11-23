const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// 🔑 Firebase接続設定
// Render環境では環境変数を使って安全に接続する
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // ローカル開発用（firebase-key.json を配置）
  const serviceAccount = require("./firebase-key.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const collection = db.collection("suggestions");

// ✅ 投稿一覧取得
app.get("/api/suggestions", async (req, res) => {
  try {
    const snapshot = await collection.orderBy("timestamp", "desc").get();
    const suggestions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データ取得中にエラーが発生しました。" });
  }
});

// ✉️ 投稿追加
app.post("/api/suggestions", async (req, res) => {
  const { name, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "メッセージを入力してください。" });
  }

  const suggestion = {
    name: name || "匿名",
    message,
    timestamp: new Date().toISOString(),
  };

  try {
    const docRef = await collection.add(suggestion);
    res.json({ success: true, id: docRef.id, suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データ保存に失敗しました。" });
  }
});

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
