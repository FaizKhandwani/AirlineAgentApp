module.exports = {
  login:async function (page) {
    await page.type('input[name="userId"]', '14349322');
    await page.type('input[type="Password"]', 'Eyemax@2022@1');
    await page.click('button[aria-label="Login"]');
  },

  postLoginTasks: function () {

  },
  
    setupHomePage: function () {
      console.log('Setting up home page...');
      // Additional logic for the home page
    },
  };
  