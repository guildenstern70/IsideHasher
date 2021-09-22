/*
 * IsideHasher
 * Copyright (c) 2021 Alessio Saltarin
 * This software is licensed under the Creative Commons license.
 * See LICENSE.md
 *
 */


(function() {

    const fileInput = document.getElementById("fileinputcontrol");
    const closeApp = document.getElementById('quitme');
    const fileHash = document.getElementById('computehash');
    const filePathInput = document.getElementById("filepathcontrol");
    const hashArea = document.getElementById("hashdisplay");
    const hashAlgorithm = document.getElementById("hashalgorithm");

    fileInput.addEventListener('change', function() {
        console.log("Changed file value")
        const selectedFile = this.files[0];
        hashArea.value = '';
        console.log("File chosen: " + selectedFile.path);
        if (getSelectedAlgo() !== '-') {
            fileHash.removeAttribute('disabled');
        }
        filePathInput.value = selectedFile.path;
    }, false);

    hashAlgorithm.addEventListener('change', () => {
        hashArea.value = '';
        if (fileInput.value !== '') {
            fileHash.removeAttribute('disabled');
        }
    })

    closeApp.addEventListener('click', () => {
        console.log("Clicked QUIT");
        window.close();
    });

    fileHash.addEventListener('click', () => {
        console.log("Clicked HASH ME");
        const algo = getSelectedAlgo();
        if (algo !== '-') {
            hashArea.value = window.electron.computeHash(filePathInput.value, algo);
            fileHash.setAttribute('disabled', 'true');
        }
    });

    const getSelectedAlgo = () => {
        return hashAlgorithm.options[hashAlgorithm.selectedIndex].value;
    }

})();






