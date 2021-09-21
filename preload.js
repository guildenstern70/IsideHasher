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
        computeHash: (filePath) => {
            console.log("Preload: compute hash of file " + filePath);
            return ipcRenderer.sendSync('compute-hash', filePath);
        },
    }
)
