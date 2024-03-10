document.addEventListener('DOMContentLoaded', function () {

  let isExtensionRunning;
  const messageTextContribute =  chrome.i18n.getMessage('wantToContribute');
  const messageContribute = document.getElementById('wantToContribute');
  messageContribute.style.color = '#FFFFFF';
  messageContribute.innerHTML = messageTextContribute;

  const messageContactUsContribute =  chrome.i18n.getMessage('contactUs');
  const messageContactContributeElement = document.getElementById('contactUs');
  messageContactContributeElement.style.color = '#FFFFFF';
  messageContactContributeElement.innerHTML = messageContactUsContribute;

  function updateButton() {
    const button = document.getElementById('toggleExtensionButton');
    const buttonText = isExtensionRunning ? chrome.i18n.getMessage('stopButtonText') : chrome.i18n.getMessage('startButtonText');
    button.innerText = buttonText;
    button.style.backgroundColor = isExtensionRunning ? '#e74c3c' : '#2ecc71';

    const message = document.getElementById('message');
    message.style.color = isExtensionRunning ?  '#2ecc71': '#e74c3c';
    const messageText = isExtensionRunning ? chrome.i18n.getMessage('runningMessage') : chrome.i18n.getMessage('stoppedMessage');
    message.innerText = messageText;
  }

  function toggleExtensionState() {
    isExtensionRunning = !isExtensionRunning;
    updateButton();

    chrome.storage.local.set({ isExtensionRunning: isExtensionRunning });

    // Send a message to the content script to toggle the extension
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleExtension', isRunning: isExtensionRunning });
    });
  }

  document.getElementById('toggleExtensionButton').addEventListener('click', toggleExtensionState);

  chrome.storage.local.get('isExtensionRunning', function (result) {
    isExtensionRunning = result.isExtensionRunning !== undefined ? result.isExtensionRunning : true;
    updateButton();
  });
});


