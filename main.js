const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');
const pie = require("puppeteer-in-electron");
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    fullscreenable: true,
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.maximize();
  mainWindow.loadFile('index.html');
  autoUpdater.checkForUpdatesAndNotify();
}


// Listen to update events
autoUpdater.on('update-available', () => {
  log.info('Update available.');
  mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  log.info('Update downloaded.');

  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: 'A new version has been downloaded. Restart the application to apply the updates.',
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

autoUpdater.on('error', (error) => {
  log.error(`Error in auto-updater: ${error}`);
});

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
});

autoUpdater.on('update-not-available', () => {
  log.info('Update not available.');
});



(async () => {
  await pie.initialize(app);
  const browser = await pie.connect(app, puppeteer);
app.whenReady().then(() => {
  createMainWindow();
  ipcMain.on('open-url-in-app',async (event, { url, credentials }) => {
    const urlToActionsMap = {
          'ngtestadmin.aos-dev.com': {
            '/Auth/Login': 'login',
            '/AffiliateManagement/Affiliate/View': 'postLoginTasks',
          },
          'www.goindigo.in': {
            '/agent.html': 'login',
          },
        };
    const airlineScripts = require('./airlines.js');
    //mainWindow.loadURL(url);
 
    const page = await pie.getPage(browser, mainWindow);

    page.on('load',async () => {
      const currentURL = new URL(page.url());
      const domain = currentURL.hostname;
      const pathName = currentURL.pathname;
      console.log('Page loaded:', pathName);
      if (urlToActionsMap[domain] && urlToActionsMap[domain][pathName]) {
        const action = urlToActionsMap[domain][pathName];
        const scriptFile = airlineScripts[domain]; // Choose a script file per domain
        const scriptPath = path.join(__dirname, scriptFile);
        if (fs.existsSync(scriptPath)) {
             const scriptModule = require(scriptPath);
             if (typeof scriptModule[action] === 'function') {
                await scriptModule[action](page)
             }
        }
      }
    });
    // page.on('framenavigated', (frame) => {
    //   const newUrl = frame.url();
    //  console.log('url',newUrl)
    // });
    await page.goto(url)

    
    // mainWindow.webContents.on('did-finish-load', async () => {
    //   const currentURL = new URL(mainWindow.webContents.getURL());
    //   const domain = currentURL.hostname;
    //   const pathName = currentURL.pathname;
    //   console.log('Path', pathName);
    //   if (urlToActionsMap[domain] && urlToActionsMap[domain][pathName]) {
    //     const action = urlToActionsMap[domain][pathName];
    //     const scriptFile = airlineScripts[domain]; // Choose a script file per domain
    //     const scriptPath = path.join(__dirname, scriptFile);
    //     if (fs.existsSync(scriptPath)) {
    //          const scriptModule = require(scriptPath);
    //          if (typeof scriptModule[action] === 'function') {
    //             await scriptModule[action](page)
    //          }
    //     }
    //   }
    // })
  })
  // Create a new window when the 'open-url-in-app' message is received
  // ipcMain.on('open-url-in-app', (event, { url, credentials }) => {
  //   const urlToActionsMap = {
  //     'ngtestadmin.aos-dev.com': {
  //       '/Auth/Login': {
  //         prelogin: 'prelogin', // Prelogin function for this page
  //         login: 'login',       // Login function for this page
  //       },
  //       '/AffiliateManagement/Affiliate/View': {
  //         postLoginTasks: 'postLoginTasks', // Post-login tasks for this page
  //       },
  //       '/home': {
  //         setupHomePage: 'setupHomePage',  // Additional page function
  //       },
  //     },
  //     'www.goindigo.in': {
  //       '/agent.html': {
  //         preLogin: 'preLogin', // Prelogin for Indigo
  //         login: 'login',       // Login function
  //       },
  //       '/user/profile': {
  //         postLoginTasks: 'postLoginTasks', // Profile page logic
  //       },
  //     },
  //   };
  //   const airlineScripts = require('./airlines.js');
  //   mainWindow.loadURL(url);
  //   mainWindow.webContents.on('did-finish-load', async () => {
  //     const currentURL = new URL(mainWindow.webContents.getURL());
  //     const domain = currentURL.hostname;
  //     const pathName = currentURL.pathname;
  //     console.log('Path', pathName);
  //     if (urlToActionsMap[domain] && urlToActionsMap[domain][pathName]) {
  //       const actions = urlToActionsMap[domain][pathName];
  //       const scriptFile = airlineScripts[domain]; // Choose a script file per domain
  //       const scriptPath = path.join(__dirname, scriptFile);
    
  //       if (fs.existsSync(scriptPath)) {
  //         const scriptModule = require(scriptPath);
    
  //         // Execute prelogin action if it exists
  //         if (actions.preLogin && typeof scriptModule.preLogin === 'function') {
  //           try {
  //             console.log(`Executing prelogin for ${domain}${pathName}`);
  //             await scriptModule.preLogin(mainWindow);
  //             console.log('Prelogin completed successfully');
  //           } catch (err) {
  //             console.error(`Error executing prelogin for ${domain}${pathName}:`, err);
  //           }
  //         }
  //         for (const actionName of Object.values(actions)) {
  //           if (typeof scriptModule[actionName] === 'function' && actionName !== 'prelogin') {
  //             const actionCode = `
  //             (() => {
  //               const actionFn = ${scriptModule[actionName].toString()};
  //               actionFn();
  //             })();
  //           `;
  //           try {
  //             await mainWindow.webContents.executeJavaScript(actionCode);
  //             console.log(`Action "${actionName}" executed successfully for ${domain}${pathName}`);
  //           } catch (err) {
  //             console.error(`Error executing action "${actionName}":`, err);
  //           }
  //           }
  //         }
  //       } else {
  //         console.error(`Script for domain "${domain}" not found.`);
  //       }
  //     }
  //   });
    
  //   // After loading the URL, inject the credentials and submit the form
  //   // mainWindow.webContents.on('did-finish-load', () => {
  //   // const urlMappings = JSON.parse(fs.readFileSync(path.join(__dirname, 'airlines.json'), 'utf-8'));
  //   // const { email, password } = credentials;
  //   // const scriptFile = urlMappings[url];
  //   // if (scriptFile) {
  //   //   const scriptPath = path.join(__dirname, scriptFile);
  //   //   const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

  //   //   const customizedScript = scriptContent
  //   //   .replace('{{email}}', email)
  //   //   .replace('{{password}}', password);

  //   //   mainWindow.webContents.executeJavaScript(customizedScript)
  //   //   .then(() => {
  //   //     return new Promise(resolve => setTimeout(resolve, 3000));
  //   //   })
  //   //   .then(() => {
  //   //     console.log('Script loaded');
  //   //     mainWindow.webContents.executeJavaScript(`
  //   //     setTimeout(()=>{   
  //   //           const submitDiv = document.querySelector('div[type="submit"]');
  //   //           if (submitDiv) {
  //   //             submitDiv.remove();
  //   //           }
  //   //     },3000)
  //   //       `);
  //   //   })
  //   //   .catch(err => {
  //   //     console.error('Error executing JavaScript:', err);
  //   //   });
  //   // }
  //   // });
    
  // });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
})();