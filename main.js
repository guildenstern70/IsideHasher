/*
 * Iside Hasher
 * Copyright (c) 2021 Alessio Saltarin
 * This software is licensed under the Creative Commons license.
 * See LICENSE.md
 *
 */

// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')

function createWindow () {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        nativeWindowOpen: true,
        contextIsolation: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

function openDialog()
{
    console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

    console.log("App ready.");
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });

    app.on('window-all-closed', function () {
        console.log("Main: window-all-closed");
        app.quit();
    });

})

ipcMain.on('do-a-thing', (event, arg) => {
    console.log('Main: quit');
    app.quit();
});

ipcMain.on('compute-hash', (event, arg) => {
    console.log('Main: computing hash for ' + arg);
});


