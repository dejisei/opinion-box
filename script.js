const form = document.getElementById("suggestion-form");
const list = document.getElementById("suggestion-list");

// Render の本番URL
const API_URL = "https://opinion-box.onrender.com/api/suggestions";

// ================================
// 投稿一覧を読み込み
// ================================
async function loadSuggestions() {
  try {
    const res = await fetch(API_URL); // 絶対URLに変更
    if (!res.ok) {
      throw new Error("サーバーからの取得に失敗しました");
    }
    const suggestions = await res.json();

    list.innerHTML = suggestions
      .map(
        (s) => `
        <li>
          <strong>${s.name}</strong>（${new Date(s.timestamp).toLocaleString("ja-JP")}）<br />
          ${s.message}
        </li>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    list.innerHTML = "<li>データを取得できませんでした。</li>";
  }
}

// ================================
// 投稿送信
// ================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    });

    if (res.ok) {
      document.getElementById("message").value = "";
      loadSuggestions(); // 投稿後にリストを再読み込み
    } else {
      const errorData = await res.json().catch(() => ({ error: "サーバーエラー" }));
      alert("送信に失敗しました: " + (errorData.error || ""));
    }
  } catch (err) {
    console.error(err);
    alert("送信に失敗しました。サーバーに接続できませんでした。");
  }
});

// 初期表示で投稿一覧を読み込む
loadSuggestions();
