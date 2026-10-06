/*
 * IsideHasher
 * Copyright (c) 2021-26 Alessio Saltarin
 * This software is licensed under the ISC license.
 * See LICENSE
 *
 */

const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld(
    'electron',
    {
            getPathForFile: (file) => {
                // File.path was removed in Electron 32: use webUtils instead
                return webUtils.getPathForFile(file);
            },
            computeFileHash: (filePath, algorithm) => {
                console.log("Preload: compute hash of file " + filePath + " with algo: " + algorithm);
                return ipcRenderer.sendSync('compute-file-hash', filePath, algorithm);
            },
            computeTextHash: (text, algorithm) => {
                console.log("Preload: compute hash of text " + text + " with algo: " + algorithm);
                return ipcRenderer.sendSync('compute-text-hash', text, algorithm);
            },
            copyToClipboard: (text) => {
                return ipcRenderer.invoke('copy-to-clipboard', text);
            },
            getAppVersion: () => {
                return ipcRenderer.invoke('get-app-version');
            },
            openProjectPage: () => {
                return ipcRenderer.invoke('open-project-page');
            },
        }
)
