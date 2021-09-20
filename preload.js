/*
 * Iside Hasher
 * Copyright (c) 2021 Alessio Saltarin
 * This software is licensed under the Creative Commons license.
 * See LICENSE.md
 *
 */

const { contextBridge, ipcRenderer } = require('electron')
const { dialog } = require('electron')

contextBridge.exposeInMainWorld(
    'electron',
    {
        doThing: () => ipcRenderer.send('do-a-thing'),
        openDialog: () => {
            console.log("Preload: open dialog");
            dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
        }
    }
)



