module.exports = {
  async preLogin(window){
  return;
},
  login: async function (page) {
    await page.waitForSelector('input[formcontrolname="EmailID"]')
    await page.type('input[formcontrolname="EmailID"]', 'faiz@infohybrid.com');
    await page.type('input[formcontrolname="Password"]', 'Numan@2911');
    await page.click('button');

  },

  postLoginTasks:async  function (page) {
    console.log('post login running')
    const submitDivSelector = 'div[type="submit"]';
    const submitDiv = await page.$(submitDivSelector);
    if (submitDiv) {
      console.log('Submit div found immediately');
      await page.evaluate((selector) => {
        document.querySelector(selector).remove();
      }, submitDivSelector);
      console.log('Submit div removed');
    }
  },

  setupHomePage: function () {
    console.log('Setting up home page...');
    // Additional logic for the home page
  },
};
