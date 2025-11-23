const form = document.getElementById("suggestion-form");
const list = document.getElementById("suggestion-list");

// 意見一覧を読み込み
async function loadSuggestions() {
  const res = await fetch("/api/suggestions");
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
}

// 投稿送信
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  const res = await fetch("/api/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, message }),
  });

  if (res.ok) {
    document.getElementById("message").value = "";
    loadSuggestions();
  } else {
    alert("送信に失敗しました。");
  }
});

loadSuggestions();
