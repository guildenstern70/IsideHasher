/*
 * Iside Hasher
 * Copyright (c) 2021 Alessio Saltarin
 * This software is licensed under the Creative Commons license.
 * See LICENSE.md
 *
 */


(function() {

    const fileInput = document.getElementById("fileinputcontrol");
    const closeApp = document.getElementById('quitme');
    const fileHash = document.getElementById('computehash');

    fileInput.addEventListener("change", function() {
        console.log("Changed file value")
        const filePathInput = document.getElementById("filepathcontrol");
        const selectedFile = this.files[0];
        console.log("File chosen: " + selectedFile.path);
        filePathInput.value = selectedFile.path;
    }, false);

    closeApp.addEventListener('click', () => {
        console.log("Clicked QUIT");
        window.electron.doThing();
    });

    fileHash.addEventListener('click', () => {
        console.log("Clicked HASH ME");
        window.electron.openDialog();
    })

})();




