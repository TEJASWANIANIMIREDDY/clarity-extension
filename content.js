console.log("Clarity extension running");

// Detect text selection
document.addEventListener("mouseup", function (e) {
  const selectedText = window.getSelection().toString().trim();

  // Ignore clicks inside popup
  if (e.target.closest("#clarity-popup")) return;

  // Prevent multiple popups
  if (document.getElementById("clarity-popup")) return;

  // Avoid very small/accidental selections
  if (selectedText.length > 5) {
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

  document.body.appendChild(popup);

  // ✅ Smart positioning (prevents overflow)
  const popupWidth = 260;
  const popupHeight = 220;

  let posX = x;
  let posY = y;

  if (x + popupWidth > window.innerWidth) {
    posX = window.innerWidth - popupWidth - 10;
  }

  if (y + popupHeight > window.innerHeight) {
    posY = window.innerHeight - popupHeight - 10;
  }

  popup.style.position = "absolute";
  popup.style.left = posX + "px";
  popup.style.top = posY + "px";

  // Ask button
  document.getElementById("ask-btn").onclick = () => {
    handleAsk(text);
  };

  // Close button
  document.getElementById("close-btn").onclick = () => {
    removePopup();
  };
}

// Handle AI response
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

// ✅ Close popup on scroll
window.addEventListener("scroll", () => {
  removePopup();
});
