chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: '',
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === '' ? '*' : '';

  // Set the action badge to the next state
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });
  if (nextState === '*') {
    await updateStatus(tab.id);
    await injectToolbar(tab.id);
  } else if (nextState === '') {
    await unregisterAllDynamicContentScripts();
  }
});
let updateStatus = async (tabId) => {
  await chrome.scripting.insertCSS({
    files: ['styles/style.css', 'form/form.css'],
    target: { tabId },
  });
};
let injectToolbar = async (tabId) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['scripts/content-main.js'],
    });
  } catch (error) {
    console.log(error);
  }
};

let unregisterAllDynamicContentScripts = async () => {
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts();
    if (scripts?.length > 0) {
      const scriptIds = scripts.map((script) => script.id);
      return chrome.scripting.unregisterContentScripts(scriptIds);
    }
  } catch (error) {
    console.log(error);
  }
};
