/*
 * Iside Hasher
 * Copyright (c) 2021 Alessio Saltarin
 * This software is licensed under the Creative Commons license.
 * See LICENSE.md
 *
 */

const handleFiles = () => {
    console.log("Changed file value")
    const filePathInput = document.getElementById("filepathcontrol");
    const selectedFile = this.files[0];
    console.log("File chosen: " + selectedFile.path);
    filePathInput.value = selectedFile.path;
}

const quit = (e) => {
    console.log("Quit me");
    window.close();  // When all windows are closed, the app quits
}

(function() {

    const fileInput = document.getElementById("fileinputcontrol");
    const closeApp = document.getElementById('quitme');

    fileInput.addEventListener("change", handleFiles, false);
    closeApp.addEventListener('click', quit);

})();




