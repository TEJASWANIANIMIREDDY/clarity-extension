console.log("Clarity extension running");

// Detect text selection
document.addEventListener("mouseup", function (e) {
  const selectedText = window.getSelection().toString().trim();

  if (e.target.closest("#clarity-popup")) return;

  if (selectedText.length > 0) {
    showPopup(e.pageX, e.pageY, selectedText);
  }
});

// Create popup
function showPopup(x, y, text) {
  removePopup();

  const popup = document.createElement("div");
  popup.id = "clarity-popup";

  popup.innerHTML = `
    <div style="text-align:right;">
      <span id="close-btn" style="cursor:pointer;font-weight:bold;">❌</span>
    </div>
    <textarea id="user-question" placeholder="Ask something..."></textarea>
    <button id="ask-btn">Ask</button>
    <div id="response"></div>
  `;

  popup.style.top = y + "px";
  popup.style.left = x + "px";

  document.body.appendChild(popup);

  document.getElementById("ask-btn").onclick = () => {
    handleAsk(text);
  };

  document.getElementById("close-btn").onclick = () => {
    removePopup();
  };
}

// Handle response
function handleAsk(selectedText) {
  const question = document.getElementById("user-question").value;
  const responseBox = document.getElementById("response");

  const finalQuestion = question.trim() || "Explain this";

  responseBox.innerText = "Loading...";

  chrome.runtime.sendMessage(
    {
      type: "ASK_AI",
      text: `${finalQuestion}: ${selectedText}`
    },
    (response) => {
      if (!response) {
        responseBox.innerText = "No response from background";
        return;
      }

      if (response.error) {
        responseBox.innerText = "Error: " + response.error;
        return;
      }

      // ✅ Parse structured response
      try {
        const parsed = JSON.parse(response.data);

        responseBox.innerHTML = `
          <div><strong>🧠 Meaning:</strong><br>${parsed.meaning}</div>
          <div style="margin-top:6px;"><strong>⚡ Intent:</strong><br>${parsed.intent}</div>
          <div style="margin-top:6px;"><strong>🎯 Action:</strong>
            <ul>
              ${parsed.action.map(a => `<li>${a}</li>`).join("")}
            </ul>
          </div>
        `;
      } catch (e) {
        responseBox.innerText = response.data;
      }
    }
  );
}

// Remove popup
function removePopup() {
  const existing = document.getElementById("clarity-popup");
  if (existing) existing.remove();
}

// Close when clicking outside
document.addEventListener("mousedown", function (e) {
  const popup = document.getElementById("clarity-popup");

  if (popup && !popup.contains(e.target)) {
    popup.remove();
  }
});