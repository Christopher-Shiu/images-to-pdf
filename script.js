document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('convertButton').addEventListener('click', convertToPDF);

let selectedFiles = [];

function handleFileSelect(event) {
    selectedFiles = Array.from(event.target.files);
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = '';

    selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '120px';
            img.style.margin = '5px';
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function convertToPDF() {
    if (selectedFiles.length === 0) {
        alert('Please select images first.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const loadImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    resolve(img);
                };
                img.onerror = function() {
                    reject(new Error('Image load error'));
                };
            };
            reader.readAsDataURL(file);
        });
    };
    const loadImagesPromises = selectedFiles.map(file => loadImage(file));

    // Wait for all images to be loaded
    Promise.all(loadImagesPromises).then(images => {
        images.forEach((img, index) => {
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (img.height * imgWidth) / img.width;
            if (index > 0) pdf.addPage();
            pdf.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);
        });

        // Save the PDF
        pdf.save('converted.pdf');
    }).catch(error => {
        console.error(error);
        alert('An error occurred while processing images.');
    });
}
