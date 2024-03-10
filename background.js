let hoveredContent = '';
let mouseCoordinates = { x: 0, y: 0 };

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'hoverDetected') {
    hoveredContent = request.content;
  } else if (request.action === 'getHoveredContent') {
    sendResponse({ content: hoveredContent });
  } else if (request.action === 'updateMouseCoordinates') {
    mouseCoordinates = request.coordinates;
  } else if (request.action === 'getMouseCoordinates') {
    sendResponse(mouseCoordinates);
  }
});

document.addEventListener('mousemove', function (event) {
  console.log("rtoto")
    chrome.runtime.sendMessage({
      action: 'updateMouseCoordinates',
      coordinates: { x: event.pageX, y: event.pageY }
    });
  });
  
// Start the extension automatically when the browser starts
chrome.runtime.onStartup.addListener(function () {
  chrome.runtime.sendMessage({ action: 'startExtension' });
});

chrome.tabs.onCreated.addListener(function (tab) {
  chrome.runtime.sendMessage({ action: 'startExtension' });
});