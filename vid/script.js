// Real Video Compressor using FFmpeg.js
// This actually compresses videos, not just creates previews!

class VideoCompressor {
    constructor() {
        this.selectedFiles = [];
        this.compressedResults = [];
        this.isProcessing = false;
        this.ffmpeg = null;
        
        this.initializeElements();
        this.bindEvents();
        this.initFFmpeg();
        this.updateStatus('Loading FFmpeg... This may take a moment on first load.');
    }

    async initFFmpeg() {
        try {
            // Import FFmpeg dynamically
            const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
            const { fetchFile, toBlobURL } = await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js');
            
            this.ffmpeg = new FFmpeg();
            this.fetchFile = fetchFile;
            
            // Load FFmpeg with logging
            this.ffmpeg.on("log", ({ message }) => {
                console.log(message);
                if (message.includes('frame=')) {
                    // Extract progress from FFmpeg logs
                    const match = message.match(/time=(\d{2}):(\d{2}):(\d{2})/);
                    if (match && this.currentVideoDuration) {
                        const currentTime = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
                        const progress = Math.min(95, (currentTime / this.currentVideoDuration) * 100);
                        this.updateProgress(progress, `Compressing... ${Math.round(progress)}%`);
                    }
                }
            });

            // Load core with CDN URLs for better reliability
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
            await this.ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            this.updateStatus('FFmpeg loaded! Ready to compress videos for real!');
            console.log('FFmpeg loaded successfully');
            
        } catch (error) {
            console.error('FFmpeg loading error:', error);
            this.updateStatus('Error loading FFmpeg. Please refresh the page.');
        }
    }

    initializeElements() {
        // File elements
        this.videoInput = document.getElementById('videoInput');
        this.selectFileBtn = document.getElementById('selectFileBtn');
        this.fileInfo = document.getElementById('fileInfo');
        
        // Settings elements
        this.sizeRange = document.getElementById('sizeRange');
        this.sizeInput = document.getElementById('sizeInput');
        this.sizeDisplay = document.getElementById('sizeDisplay');
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
            this.handleFileSelect(Array.from(e.target.files));
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
            
            const files = Array.from(e.dataTransfer.files).filter(file => 
                file.type.startsWith('video/')
            );
            
            if (files.length > 0) {
                this.handleFileSelect(files);
            }
        });
    }

    handleFileSelect(files) {
        if (!files || files.length === 0) return;

        const videoFiles = files.filter(file => file.type.startsWith('video/'));
        
        if (videoFiles.length === 0) {
            alert('Please select video files!');
            return;
        }

        this.selectedFiles = videoFiles;
        this.updateFileInfo();
        this.compressBtn.disabled = !this.ffmpeg;
        this.updateStatus(this.ffmpeg ? 'Ready to compress videos!' : 'Loading FFmpeg...');
    }

    updateFileInfo() {
        const count = this.selectedFiles.length;
        const totalSize = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);
        
        this.fileInfo.textContent = `Selected: ${count} video${count > 1 ? 's' : ''} (${this.formatFileSize(totalSize)})`;
    }

    updateSizeDisplay(value) {
        const sizeText = value >= 1000 ? '1.00 GB' : `${value} MB`;
        this.sizeDisplay.textContent = sizeText;
    }

    async startCompression() {
        if (!this.selectedFiles.length || this.isProcessing || !this.ffmpeg) return;

        this.isProcessing = true;
        this.compressBtn.disabled = true;
        this.cancelBtn.disabled = false;
        this.downloadBtn.style.display = 'none';
        this.compressedResults = [];

        const settings = this.getCompressionSettings();
        
        try {
            for (let i = 0; i < this.selectedFiles.length; i++) {
                if (!this.isProcessing) break;
                
                const file = this.selectedFiles[i];
                const baseProgress = (i / this.selectedFiles.length) * 100;
                
                this.updateProgress(baseProgress, `Processing ${file.name}...`);
                
                const result = await this.compressVideoWithFFmpeg(file, settings, i);
                if (result) {
                    this.compressedResults.push(result);
                }
            }
            
            if (this.isProcessing && this.compressedResults.length > 0) {
                this.updateProgress(100, 'Real compression completed!');
                this.updateStatus(`Successfully compressed ${this.compressedResults.length} video(s) with FFmpeg!`);
                this.showDownloadOptions();
            } else {
                this.updateStatus('No videos were compressed successfully.');
            }
            
        } catch (error) {
            console.error('FFmpeg compression error:', error);
            this.updateStatus('FFmpeg compression failed. Check console for details.');
            this.updateProgress(0, 'Compression failed');
        } finally {
            this.isProcessing = false;
            this.compressBtn.disabled = false;
            this.cancelBtn.disabled = true;
        }
    }

    getCompressionSettings() {
        const targetSizeMB = parseInt(this.sizeRange.value);
        const quality = this.qualitySelect.value;
        
        return {
            targetSizeMB,
            targetSizeBytes: targetSizeMB * 1024 * 1024,
            preset: quality
        };
    }

    async getVideoDuration(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                resolve(video.duration);
            };
            video.src = URL.createObjectURL(file);
        });
    }

    async compressVideoWithFFmpeg(file, settings, index) {
        try {
            // Get video duration for progress tracking
            this.currentVideoDuration = await this.getVideoDuration(file);
            
            const inputName = `input${index}.${file.name.split('.').pop()}`;
            const outputName = `output${index}_compressed.mp4`;
            
            // Write input file to FFmpeg filesystem
            await this.ffmpeg.writeFile(inputName, await this.fetchFile(file));
            
            // Calculate bitrate to reach target size
            const targetBitrate = Math.max(100, Math.floor((settings.targetSizeBytes * 8) / this.currentVideoDuration / 1000));
            
            // Build FFmpeg command for real compression
            const ffmpegArgs = [
                '-i', inputName,
                '-c:v', 'libx264',           // Use H.264 codec
                '-preset', settings.preset,   // Use quality preset
                '-b:v', `${targetBitrate}k`,  // Set target bitrate
                '-maxrate', `${Math.floor(targetBitrate * 1.2)}k`,
                '-bufsize', `${Math.floor(targetBitrate * 2)}k`,
                '-c:a', 'aac',               // Audio codec
                '-b:a', '128k',              // Audio bitrate
                '-movflags', '+faststart',    // Web optimization
                '-y',                        // Overwrite output
                outputName
            ];
            
            console.log('Running FFmpeg with args:', ffmpegArgs);
            
            // Run FFmpeg compression
            await this.ffmpeg.exec(ffmpegArgs);
            
            // Read the compressed file
            const data = await this.ffmpeg.readFile(outputName);
            const blob = new Blob([data], { type: 'video/mp4' });
            
            // Clean up temporary files
            await this.ffmpeg.deleteFile(inputName);
            await this.ffmpeg.deleteFile(outputName);
            
            const originalSize = file.size;
            const compressedSize = blob.size;
            const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
            
            console.log(`Compression complete: ${this.formatFileSize(originalSize)} → ${this.formatFileSize(compressedSize)} (${compressionRatio}% reduction)`);
            
            return {
                name: file.name.replace(/\.[^/.]+$/, '_compressed.mp4'),
                blob: blob,
                originalSize: originalSize,
                compressedSize: compressedSize,
                compressionRatio: compressionRatio
            };
            
        } catch (error) {
            console.error(`Error compressing ${file.name}:`, error);
            return null;
        }
    }

    showDownloadOptions() {
        this.downloadBtn.style.display = 'block';
        this.downloadBtn.onclick = () => {
            this.downloadCompressedVideos();
        };
    }

    downloadCompressedVideos() {
        this.compressedResults.forEach((result, index) => {
            const url = URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    cancelCompression() {
        this.isProcessing = false;
        this.updateStatus('Compression cancelled');
        this.updateProgress(0, 'Cancelled');
    }

    updateProgress(percentage, text) {
        this.progressFill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
        this.progressText.textContent = text || `${Math.round(percentage)}%`;
    }

    updateStatus(message) {
        this.statusText.textContent = message;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the compressor when page loads
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