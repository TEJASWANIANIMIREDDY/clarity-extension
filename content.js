console.log("Clarity extension running");

// ✅ Store selected text globally
let currentSelection = "";

// Detect text selection
document.addEventListener("mouseup", function (e) {
  const selectedText = window.getSelection().toString().trim();

  // Ignore clicks inside popup
  if (e.target.closest("#clarity-popup")) return;

  // Prevent multiple popups
  if (document.getElementById("clarity-popup")) return;

  // Avoid very small selections
  if (selectedText.length > 5) {
    currentSelection = selectedText; // ✅ store selection
    showPopup(e.pageX, e.pageY);
  }
});

// Create popup
function showPopup(x, y) {
  removePopup();

  const popup = document.createElement("div");
  popup.id = "clarity-popup";

  popup.innerHTML = `
    <div style="text-align:right;">
      <span id="close-btn" style="cursor:pointer;font-weight:bold;">❌</span>
    </div>

    <!-- ✅ Selected text preview -->
    <div style="font-size:12px;color:#555;margin-bottom:6px;">
      "${currentSelection.substring(0, 100)}..."
    </div>

    <textarea id="user-question" placeholder="Ask something..."></textarea>
    <button id="ask-btn">Ask</button>
    <div id="response"></div>
  `;

  document.body.appendChild(popup);

  // ✅ Prevent clicks inside popup from affecting outside listeners
  popup.addEventListener("mousedown", (e) => {
    e.stopPropagation();
  });

  // ✅ Smart positioning (no overflow)
  const popupWidth = 260;
  const popupHeight = 240;

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
    handleAsk(currentSelection);
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

  if (!popup) return;

  // ✅ Do NOT close if clicking inside
  if (popup.contains(e.target)) return;

  popup.remove();
});

// ✅ Close popup on scroll
window.addEventListener("scroll", () => {
  removePopup();
});
