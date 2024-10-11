const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const formatSelect = document.getElementById('formatSelect');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeImage = document.getElementById('themeImage');
const sizes = [16, 32, 48, 64, 128, 256, 512];
let generatedIcons = {};

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#e9ecef';
});
dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '#ffffff';
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#ffffff';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImage(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImage(file);
    }
});

function handleImage(file) {
    const img = new Image();
    img.onload = () => generateAllIcons(img);
    img.src = URL.createObjectURL(file);
}

function generateAllIcons(img) {
    preview.innerHTML = '';
    generatedIcons = {};
    sizes.forEach(size => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        
        if (formatSelect.value === 'svg') {
            const svgString = canvasToSVG(canvas);
            generatedIcons[size] = new Blob([svgString], {type: 'image/svg+xml'});
            const previewItem = createPreviewItem(canvas, size);
            preview.appendChild(previewItem);
        } else {
            canvas.toBlob(blob => {
                generatedIcons[size] = blob;
                const previewItem = createPreviewItem(canvas, size);
                preview.appendChild(previewItem);
            }, formatSelect.value === 'ico' ? 'image/x-icon' : 'image/png');
        }
    });
    downloadAllBtn.style.display = 'block';
}

function createPreviewItem(canvas, size) {
    const div = document.createElement('div');
    div.className = 'preview-item';
    div.appendChild(canvas);
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = `Download ${size}x${size} ${formatSelect.value.toUpperCase()}`;
    downloadBtn.className = 'download-btn';
    downloadBtn.onclick = () => downloadIcon(size);
    div.appendChild(downloadBtn);
    return div;
}

function downloadIcon(size) {
    const blob = generatedIcons[size];
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icon-${size}.${formatSelect.value}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadAllIcons() {
    const zip = new JSZip();
    const folder = zip.folder("icons");
    for (let size of sizes) {
        folder.file(`icon-${size}.${formatSelect.value}`, generatedIcons[size]);
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `icons-${formatSelect.value}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    });
}

function canvasToSVG(canvas) {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
        <image width="${canvas.width}" height="${canvas.height}" href="${canvas.toDataURL('image/png')}"/>
    </svg>`;
    return svgString;
}

formatSelect.addEventListener('change', () => {
    if (Object.keys(generatedIcons).length > 0) {
        const img = new Image();
        img.onload = () => generateAllIcons(img);
        img.src = URL.createObjectURL(generatedIcons[sizes[0]]);
    }
});

downloadAllBtn.addEventListener('click', downloadAllIcons);

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    themeIcon.src = newTheme === 'dark' 
        ? 'media/day-mode.png' 
        : 'media/moon.png';
}

themeToggle.addEventListener('click', toggleTheme);
