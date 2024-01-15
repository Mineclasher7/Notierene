const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    let mainWindow = new BrowserWindow({
        width,
        height,
    });

    mainWindow.maximize();

    mainWindow.webContents.openDevTools();

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'build', 'index.html'),
            protocol: 'file:',
            slashes: true,
            hash: '/login', // Add the hash to navigate to the /login route
        })
    );

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);
