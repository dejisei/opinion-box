const list = document.getElementById("suggestion-list");

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
    <li data-id="${s.id}" class="${s.status === 'new' ? 'unread' : ''}">
      <strong>${s.name}</strong>
      （${new Date(s.timestamp).toLocaleString("ja-JP")}）<br />
      ${s.message}<br /><br />

      <button class="mark-read">既読にする</button>
      <button class="mark-unread">未読に戻す</button>
      <button class="delete-btn">削除</button>
    </li>`
  )
  .join("");


    addClickEvents();
  } catch (err) {
    console.error(err);
    list.innerHTML = "<li>データを取得できませんでした。</li>";
  }
}

// クリックしたら既読/未読に更新
function addClickEvents() {
  document.querySelectorAll(".mark-read").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest("li").dataset.id;
      await updateStatus(id, "read");
      e.target.closest("li").classList.remove("unread");
    });
  });

  document.querySelectorAll(".mark-unread").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest("li").dataset.id;
      await updateStatus(id, "unread");
      e.target.closest("li").classList.add("unread");
    });
  });
}

// API へ PATCH（サーバーの仕様に完全準拠）
async function updateStatus(id, status) {
  const endpoint = status === "read"
    ? `${API_URL}/${id}/read`
    : `${API_URL}/${id}/unread`;

  try {
    const res = await fetch(endpoint, {
      method: "PATCH",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error("ステータス更新失敗：" + text);
    }
  } catch (err) {
    console.error(err);
  }
}




loadSuggestions();
