/*
 * Iside Hasher
 * Copyright (c) 2021 Alessio Saltarin
 * This software is licensed under the Creative Commons license.
 * See LICENSE.md
 *
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('myAPI', {
    quitMe: () => ipcRenderer.invoke('close-me')
})

