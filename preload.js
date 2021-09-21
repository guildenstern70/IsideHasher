/*
 * Iside Hasher
 * Copyright (c) 2021 Alessio Saltarin
 * This software is licensed under the Creative Commons license.
 * See LICENSE.md
 *
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    'electron',
    {
        doThing: () => {
            console.log("Preload: do thing");
            ipcRenderer.send('do-a-thing');
        },
        computeHash: (filePath) => {
            console.log("Preload: compute hash of file " + filePath);
            ipcRenderer.sendSync('compute-hash', filePath);
        },
    }
)



