document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("suggestion-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();  // ← これで URL の末尾に「?」が付かなくなる

    const name = document.getElementById("name").value;
    const message = document.getElementById("message").value;

    if (!message.trim()) {
      alert("意見を入力してください！");
      return;
    }

    try {
      const response = await fetch("https://opinion-box.onrender.com/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, message })
      });

      const res = await response.json();

      if (response.ok && res.success) {
        alert("送信しました！");
        form.reset();
      } else {
        alert("送信に失敗しました。\n" + (res.error || "不明なエラー"));
      }

    } catch (error) {
      console.error("エラー:", error);
      alert("サーバーに接続できませんでした");
    }
  });
});
