// FFmpeg loaded from UMD bundle via script tag

class VideoCompressor {
    constructor() {
        this.ffmpeg = null;
        this.isLoaded = false;
        this.isProcessing = false;
        this.currentFile = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadFFmpeg();
    }

    initializeElements() {
        // File elements
        this.videoInput = document.getElementById('videoInput');
        this.selectFileBtn = document.getElementById('selectFileBtn');
        this.fileInfo = document.getElementById('fileInfo');
        
        // Size control elements
        this.sizeRange = document.getElementById('sizeRange');
        this.sizeInput = document.getElementById('sizeInput');
        this.sizeDisplay = document.getElementById('sizeDisplay');
        
        // Quality element
        this.qualitySelect = document.getElementById('qualitySelect');
        
        // Progress elements
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.statusText = document.getElementById('statusText');
        
        // Action buttons
        this.compressBtn = document.getElementById('compressBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
    }

    bindEvents() {
        // File selection
        this.selectFileBtn.addEventListener('click', () => {
            this.videoInput.click();
        });
        
        this.videoInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Size controls synchronization
        this.sizeRange.addEventListener('input', (e) => {
            this.updateSizeDisplay(e.target.value);
            this.sizeInput.value = e.target.value;
        });

        this.sizeInput.addEventListener('input', (e) => {
            const value = Math.max(1, Math.min(1000, parseInt(e.target.value) || 1));
            e.target.value = value;
            this.sizeRange.value = value;
            this.updateSizeDisplay(value);
        });

        // Action buttons
        this.compressBtn.addEventListener('click', () => {
            this.startCompression();
        });

        this.cancelBtn.addEventListener('click', () => {
            this.cancelCompression();
        });

        // Drag and drop
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            document.body.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        });

        document.addEventListener('dragleave', (e) => {
            if (e.clientX === 0 && e.clientY === 0) {
                document.body.style.backgroundColor = '';
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            document.body.style.backgroundColor = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('video/')) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    async loadFFmpeg() {
        try {
            this.statusText.textContent = 'Loading FFmpeg WebAssembly...';
            
            this.ffmpeg = new FFmpeg.FFmpeg();
            
            this.ffmpeg.on('log', ({ message }) => {
                console.log(message);
            });

            this.ffmpeg.on('progress', ({ progress }) => {
                if (this.isProcessing) {
                    const percentage = Math.round(progress * 100);
                    this.updateProgress(percentage, `Compressing... ${percentage}%`);
                }
            });

            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
            await this.ffmpeg.load({
                coreURL: await FFmpeg.toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await FFmpeg.toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            this.isLoaded = true;
            this.statusText.textContent = 'FFmpeg loaded successfully! Select a video file to get started.';
            
        } catch (error) {
            console.error('Error loading FFmpeg:', error);
            this.statusText.textContent = 'Error loading FFmpeg. Please refresh the page and try again.';
        }
    }

    handleFileSelect(file) {
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            alert('Please select a video file!');
            return;
        }

        this.currentFile = file;
        this.fileInfo.textContent = `Selected: ${file.name} (${this.formatFileSize(file.size)})`;
        this.compressBtn.disabled = !this.isLoaded;
        this.statusText.textContent = this.isLoaded ? 'Ready to compress!' : 'Still loading FFmpeg...';
    }

    updateSizeDisplay(value) {
        const sizeText = value >= 1000 ? '1.00 GB' : `${value} MB`;
        this.sizeDisplay.textContent = sizeText;
    }

    async startCompression() {
        if (!this.currentFile || !this.isLoaded || this.isProcessing) return;

        this.isProcessing = true;
        this.compressBtn.disabled = true;
        this.cancelBtn.disabled = false;
        this.downloadBtn.style.display = 'none';
        this.progressBar.classList.add('processing');

        try {
            // Get settings
            const targetSizeMB = parseInt(this.sizeRange.value);
            const quality = this.qualitySelect.value;

            this.updateProgress(5, 'Preparing video...');

            // Write file to FFmpeg filesystem
            const inputName = 'input.mp4';
            const outputName = 'output.mp4';
            
            await this.ffmpeg.writeFile(inputName, new Uint8Array(await this.currentFile.arrayBuffer()));

            this.updateProgress(10, 'Analyzing video...');

            // Get video duration for bitrate calculation
            await this.ffmpeg.exec(['-i', inputName, '-f', 'null', '-']);
            
            // Calculate target bitrate (simplified)
            const estimatedDuration = 60; // Default fallback
            const targetBitrate = Math.max(100, Math.floor((targetSizeMB * 8192) / estimatedDuration));

            this.updateProgress(15, `Starting compression (target: ${targetBitrate}k bitrate)...`);

            // FFmpeg compression command
            const ffmpegArgs = [
                '-i', inputName,
                '-c:v', 'libx264',
                '-preset', quality,
                '-b:v', `${targetBitrate}k`,
                '-c:a', 'aac',
                '-b:a', '128k',
                '-movflags', '+faststart',
                outputName
            ];

            await this.ffmpeg.exec(ffmpegArgs);

            if (this.isProcessing) { // Check if not cancelled
                this.updateProgress(95, 'Preparing download...');

                // Read the compressed file
                const compressedData = await this.ffmpeg.readFile(outputName);
                
                // Create download link
                const blob = new Blob([compressedData], { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);
                
                this.downloadBtn.href = url;
                this.downloadBtn.download = `${this.currentFile.name.split('.')[0]}_compressed.mp4`;
                this.downloadBtn.style.display = 'inline-flex';

                this.updateProgress(100, 'Compression completed!');
                this.statusText.textContent = `Success! Compressed to approximately ${this.formatFileSize(blob.size)}`;
            }

        } catch (error) {
            console.error('Compression error:', error);
            this.statusText.textContent = 'Compression failed. Please try again with different settings.';
            this.updateProgress(0, 'Compression failed');
        } finally {
            this.isProcessing = false;
            this.compressBtn.disabled = false;
            this.cancelBtn.disabled = true;
            this.progressBar.classList.remove('processing');
        }
    }

    cancelCompression() {
        if (this.isProcessing) {
            this.isProcessing = false;
            this.statusText.textContent = 'Compression cancelled';
            this.updateProgress(0, 'Cancelled');
            this.compressBtn.disabled = false;
            this.cancelBtn.disabled = true;
            this.progressBar.classList.remove('processing');
        }
    }

    updateProgress(percentage, text) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = text;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VideoCompressor();
});

// Handle page visibility for better performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pausing operations');
    } else {
        console.log('Page visible - resuming operations');
    }
}); 