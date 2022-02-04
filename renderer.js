/*
 * IsideHasher
 * Copyright (c) 2021 Alessio Saltarin
 * This software is licensed under the Creative Commons license.
 * See LICENSE.md
 *
 */


(function() {

    let hashmode = 'file';

    const fileInput = document.getElementById("fileinputcontrol");
    const closeApp = document.getElementById('quitme');
    const computeHash = document.getElementById('computehash');
    const filePathInput = document.getElementById("filepathcontrol");
    const hashArea = document.getElementById("hashdisplay");
    const hashAlgorithm = document.getElementById("hashalgorithm");
    const textmode = document.getElementById("textmode");
    const filemode = document.getElementById("filemode");
    const selectmode = document.getElementById("hashmode");
    const text2Hash = document.getElementById("text2hash");

    selectmode.addEventListener('change', function() {
        if (selectmode.value === 'text') {
            hashmode = 'text';
            textmode.classList.remove("is-hidden");
            filemode.classList.add("is-hidden");
            computeHash.removeAttribute('disabled');
        } else {
            filemode.classList.remove("is-hidden");
            textmode.classList.add("is-hidden");
        }
        hashArea.value = "";
    });

    fileInput.addEventListener('change', function() {
        console.log("Changed file value")
        const selectedFile = this.files[0];
        hashArea.value = '';
        console.log("File chosen: " + selectedFile.path);
        if (getSelectedAlgo() !== '-') {
            computeHash.removeAttribute('disabled');
        }
        filePathInput.value = selectedFile.path;
    }, false);

    hashAlgorithm.addEventListener('change', () => {
        hashArea.value = '';
        if (fileInput.value !== '') {
            computeHash.removeAttribute('disabled');
        }
    })

    closeApp.addEventListener('click', () => {
        console.log("Clicked QUIT");
        window.close();
    });

    computeHash.addEventListener('click', () => {
        console.log("Clicked HASH ME. Hashmode = " + hashmode);
        const algo = getSelectedAlgo();
        if (algo !== '-') {
            if (hashmode === 'file') {
                hashArea.value = window.electron.computeFileHash(filePathInput.value, algo);
                computeHash.setAttribute('disabled', 'true');
            } else {
                hashArea.value = window.electron.computeTextHash(text2Hash.value, algo);
            }
        }
    });

    const getSelectedAlgo = () => {
        return hashAlgorithm.options[hashAlgorithm.selectedIndex].value;
    }

})();






