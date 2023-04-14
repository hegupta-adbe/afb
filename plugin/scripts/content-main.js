(async () => {
    const src = chrome.runtime.getURL('scripts/form-plugin.js');
    import(src)
      .then((module) => {
        module.default();
      })
      .catch((err) => {
        console.log(err.message);
      });
  })();