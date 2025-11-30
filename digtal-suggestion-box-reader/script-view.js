const form = document.getElementById("suggestion-form");
const list = document.getElementById("suggestion-list");

// Render 本番URL
const API_URL = "https://opinion-box.onrender.com/api/suggestions";

// 投稿一覧取得
async function loadSuggestions() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("サーバーからの取得に失敗しました");
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

loadSuggestions();
