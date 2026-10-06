/*
 * IsideHasher
 * Copyright (c) 2021-26 Alessio Saltarin
 * This software is licensed under the ISC license.
 * See LICENSE
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
    const copyHash = document.getElementById("copyhash");
    const copyHashLabel = document.getElementById("copyhashlabel");

    let copyFeedbackTimer = null;

    const setHash = (value) => {
        hashArea.value = value || '';
        if (hashArea.value !== '') {
            copyHash.removeAttribute('disabled');
        } else {
            copyHash.setAttribute('disabled', 'true');
        }
    };

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
        setHash('');
    });

    fileInput.addEventListener('change', function() {
        console.log("Changed file value")
        const selectedFile = this.files[0];
        const selectedFilePath = window.electron.getPathForFile(selectedFile);
        setHash('');
        console.log("File chosen: " + selectedFilePath);
        if (getSelectedAlgo() !== '-') {
            computeHash.removeAttribute('disabled');
        }
        filePathInput.value = selectedFilePath;
    }, false);

    hashAlgorithm.addEventListener('change', () => {
        setHash('');
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
                setHash(window.electron.computeFileHash(filePathInput.value, algo));
                computeHash.setAttribute('disabled', 'true');
            } else {
                setHash(window.electron.computeTextHash(text2Hash.value, algo));
            }
        }
    });

    copyHash.addEventListener('click', async () => {
        if (hashArea.value === '') {
            return;
        }
        try {
            await window.electron.copyToClipboard(hashArea.value);
            copyHashLabel.textContent = 'Copied!';
        } catch (err) {
            console.error('Copy to clipboard failed: ' + err);
            copyHashLabel.textContent = 'Copy failed';
        }
        clearTimeout(copyFeedbackTimer);
        copyFeedbackTimer = setTimeout(() => {
            copyHashLabel.textContent = 'Copy Hash';
        }, 1500);
    });

    const getSelectedAlgo = () => {
        return hashAlgorithm.options[hashAlgorithm.selectedIndex].value;
    }

    const aboutButton = document.getElementById("aboutbutton");
    const aboutModal = document.getElementById("aboutmodal");
    const aboutVersion = document.getElementById("aboutversion");
    const aboutOk = document.getElementById("aboutok");
    const aboutGitHub = document.getElementById("aboutgithub");

    const closeAbout = () => {
        aboutModal.classList.remove('is-active');
    };

    aboutButton.addEventListener('click', async () => {
        try {
            aboutVersion.textContent = await window.electron.getAppVersion();
        } catch (err) {
            console.error('Cannot read app version: ' + err);
        }
        aboutModal.classList.add('is-active');
        aboutOk.focus();
    });

    aboutOk.addEventListener('click', closeAbout);
    aboutModal.querySelector('.modal-background').addEventListener('click', closeAbout);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAbout();
        }
    });

    aboutGitHub.addEventListener('click', (event) => {
        event.preventDefault();
        window.electron.openProjectPage();
    });

})();






