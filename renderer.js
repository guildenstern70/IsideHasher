// Main JavaScripts


(function() {

    const fileInput = document.getElementById("fileinputcontrol");
    fileInput.addEventListener("change", handleFiles, false);

    function handleFiles() {
        const filePathInput = document.getElementById("filepathcontrol");
        const selectedFile = this.files[0];
        console.log("File chosen: " + selectedFile.path);
        filePathInput.value = selectedFile.path;
    }

})();

