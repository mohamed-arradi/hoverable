let hoveredContent = '';
let mouseCoordinates = { x: 0, y: 0 };
let isExtensionRunning = false;
let isContentScriptInjected = false;

function stopExtension() {
  clearExistingPopups();
  resetState();
}

function clearExistingPopups() {
  chrome.runtime.sendMessage({ action: 'stopExtension' }, function(response) {
  });
}

function resetState() {
  hoveredContent = '';
  mouseCoordinates = { x: 0, y: 0 };
  // Add any other state variables you need to reset
}

function updateMouseCoordinates(event) {
  chrome.runtime.sendMessage({
    action: 'updateMouseCoordinates',
    coordinates: { x: event.pageX, y: event.pageY }
  });
}

function handleToggleExtension(request) {
  isExtensionRunning = request.isRunning;
  chrome.storage.local.set({ isExtensionRunning: isExtensionRunning });

  if (!isExtensionRunning) {
    stopExtension();
  }
}

function handleStartExtension() {
  // Send the messages only if the content script is injected
  if (isContentScriptInjected) {
    chrome.runtime.sendMessage({ action: 'startExtension' });
  } else {
    console.warn("Content script is not injected yet. Waiting or handling accordingly.");
  }
}

function initializeExtension() {
  chrome.storage.local.get('isExtensionRunning', function (result) {
    isExtensionRunning = result.isExtensionRunning !== undefined ? result.isExtensionRunning : true;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage({ action: 'toggleExtension', isRunning: isExtensionRunning }, function(response) {
      });
    });
  });
}

function handleTabCreated() {
 chrome.runtime.sendMessage({ action: 'startExtension' }, function(response) {
});
}

// Event Listeners
chrome.runtime.onInstalled.addListener(initializeExtension);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    handleTabCreated();
  }
});

chrome.tabs.onCreated.addListener(handleTabCreated);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case 'hoverDetected':
      hoveredContent = request.content;
      break;
    case 'getHoveredContent':
      sendResponse({ content: hoveredContent });
      break;
    case 'updateMouseCoordinates':
      mouseCoordinates = request.coordinates;
      break;
    case 'getMouseCoordinates':
      sendResponse(mouseCoordinates);
      break;
    case 'toggleExtension':
      handleToggleExtension(request);
      break;
    case 'startExtension':
      handleStartExtension();
      break;
    case 'checkContentScript':
      sendResponse({ isContentScriptInjected: true });
      initializeExtension()
      break;
    // Additional cases can be added as needed
  }
});

// Content script injection detection
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'checkContentScript') {
    isContentScriptInjected = true;
  }
});
