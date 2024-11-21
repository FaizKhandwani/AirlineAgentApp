module.exports = {
    waitForElement(selector, callback, timeout = 10000) {
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          callback(element);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
  
      setTimeout(() => {
        observer.disconnect();
        console.error(`Timeout waiting for element: ${selector}`);
      }, timeout);
    },
  
    fillInput(selector, value) {
      const input = document.querySelector(selector);
      if (input) {
        input.value = value;
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      } else {
        console.error(`Input field with selector "${selector}" not found.`);
      }
    },
  
    clickButton(selector) {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
      } else {
        console.error(`Button with selector "${selector}" not found.`);
      }
    },
  };
  