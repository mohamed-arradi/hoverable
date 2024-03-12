let hoverTimeout;
let clickTimeout;
let popupElement;
let isExtensionRunning = false;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'toggleExtension') {
    isExtensionRunning = request.isRunning;
    if (!isExtensionRunning) {
      clearTimeout(hoverTimeout);
      clearTimeout(clickTimeout);
      removePopup();
    }
  } else if (request.action === 'startExtension') {
    updateExtensionState();
  } else if(request.action === 'stopExtension') {
    clearTimeout(hoverTimeout);
    clearTimeout(clickTimeout);
    removePopup();
  }
});


// Function to update the extension state based on the stored value
function updateExtensionState() {
  chrome.storage.local.get('isExtensionRunning', function (result) {
    isExtensionRunning = result.isExtensionRunning !== undefined ? result.isExtensionRunning : false;
  });
}

// Read the initial state and set up the interval to check for updates
updateExtensionState();

const checkInterval = setInterval(updateExtensionState, 1000);

function initializeContentScript() {
  document.addEventListener('mouseover', function (event) {
    if (!isExtensionRunning) {
      return;
    }

    const targetDiv = findTargetDiv(event.target);

    if (targetDiv) {
      clearTimeout(hoverTimeout);

      hoverTimeout = setTimeout(function () {
        const hoveredContent = targetDiv.innerText;
        createPopup(hoveredContent, event.pageX, event.pageY);
      }, 1000);
    }
  });

  document.addEventListener('mouseout', function () {
    clearTimeout(hoverTimeout);
  });

  document.addEventListener('mousedown', function (event) {
    const targetDiv = findTargetDiv(event.target);

    if (targetDiv) {
      clearTimeout(clickTimeout);

      clickTimeout = setTimeout(function () {
        const clickedContent = targetDiv.innerText;
        createPopup(clickedContent, event.pageX, event.pageY);
      }, 1000);
    }
  });

  document.addEventListener('mouseup', function () {
    clearTimeout(clickTimeout);
  });
}

function findTargetDiv(element) {
  while (element) {
    if (element.tagName === 'DIV') {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

function createPopup(content, x, y) {
  if (popupElement) {
    return;
  }

  popupElement = document.createElement('div');
  popupElement.id = 'popup-content';
  popupElement.style.position = 'absolute';
  popupElement.style.left = x + 'px';
  popupElement.style.top = y + 'px';
  popupElement.style.zIndex = 9999;
  popupElement.style.backgroundColor = '#fff';
  popupElement.style.border = '1px solid #ccc';
  popupElement.style.padding = '10px';
  popupElement.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
  popupElement.style.maxWidth = '300px';
  popupElement.style.transformOrigin = 'top left';

  const closeButton = document.createElement('div');
  closeButton.innerHTML = '&times;';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '5px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '20px';
  closeButton.style.color = '#666';
  closeButton.addEventListener('click', function () {
    removePopup();
  });
  popupElement.appendChild(closeButton);

  const contentElement = document.createElement('div');
  contentElement.innerHTML = content;
  contentElement.style.color = "#000000";
  contentElement.style.whiteSpace = 'normal';
  contentElement.style.wordWrap = 'break-word';
  contentElement.style.maxWidth = '100%';
  contentElement.style.paddingRight = '20px';
  popupElement.appendChild(contentElement);

  document.body.appendChild(popupElement);
}

function removePopup() {
  if (popupElement && popupElement.parentNode) {
    popupElement.parentNode.removeChild(popupElement);
    popupElement = null;
  }
}

initializeContentScript();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'toggleExtension') {
    isExtensionRunning = request.isRunning;
    // Call the function to initialize or re-initialize the content script
    initializeContentScript();
  }
});
