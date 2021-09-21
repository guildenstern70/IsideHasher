/*
 * Iside Hasher
 * Copyright (c) 2021 Alessio Saltarin
 * This software is licensed under the Creative Commons license.
 * See LICENSE.md
 *
 */

const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const CHUNK_SIZE = 100 * 1024; // 100kb

function createWindow () {

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        nativeWindowOpen: true,
        contextIsolation: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile('index.html')

}


function readFileInChunks(ipcEvent, filePath) {

    const buffer = Buffer.alloc(CHUNK_SIZE);
    const hasher = crypto.createHash('md5');
    let data;
    let bytesReadSoFar = 0;
    fs.open(filePath, 'r', function(err, fd) {
        if (err) throw err;
        function readNextChunk() {
            fs.read(fd, buffer, 0, CHUNK_SIZE,
                null, function(err, nread) {
                if (err) throw err;

                if (nread === 0) {
                    fs.close(fd, function(err) {
                        if (err) throw err;
                    });
                    const hashvalue = hasher.digest('hex');
                    console.log(hashvalue);
                    ipcEvent.returnValue = hashvalue;
                    return;
                }

                if (nread < CHUNK_SIZE)
                    data = buffer.slice(0, nread);
                else
                    data = buffer;

                bytesReadSoFar += data.length;
                hasher.update(data);
                readNextChunk();

            });
        }
        readNextChunk();
    });
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

ipcMain.on('compute-hash', (ipcEvent, arg) => {
    console.log('Main: computing hash for ' + arg);
    readFileInChunks(ipcEvent, arg);
});


