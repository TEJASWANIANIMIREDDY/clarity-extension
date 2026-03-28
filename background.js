console.log("Background running");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);

  if (request.type === "ASK_AI") {

    // ✅ Structured demo response
    sendResponse({
      data: JSON.stringify({
        meaning: "This text is asking for something to be done quickly.",
        intent: "The sender expects an urgent response.",
        action: [
          "Reply immediately",
          "Attach required documents",
          "Do not delay"
        ]
      })
    });

  }

  return true;
});