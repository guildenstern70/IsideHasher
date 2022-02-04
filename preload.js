/*
 * IsideHasher
 * Copyright (c) 2021 Alessio Saltarin
 * This software is licensed under the Creative Commons license.
 * See LICENSE.md
 *
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    'electron',
    {
            computeFileHash: (filePath, algorithm) => {
                console.log("Preload: compute hash of file " + filePath + " with algo: " + algorithm);
                return ipcRenderer.sendSync('compute-file-hash', filePath, algorithm);
            },
            computeTextHash: (text, algorithm) => {
                console.log("Preload: compute hash of text " + text + " with algo: " + algorithm);
                return ipcRenderer.sendSync('compute-text-hash', text, algorithm);
            },
        }
)
