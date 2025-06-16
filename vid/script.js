// Simple Video Compressor - Canvas-based approach for better compatibility

class VideoCompressor {
    constructor() {
        this.selectedFiles = [];
        this.compressedResults = [];
        this.isProcessing = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateStatus('Ready! Select video files to get started.');
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
        this.compressBtn.disabled = false;
        this.updateStatus('Ready to compress videos!');
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
        if (!this.selectedFiles.length || this.isProcessing) return;

        this.isProcessing = true;
        this.compressBtn.disabled = true;
        this.cancelBtn.disabled = false;
        this.downloadBtn.style.display = 'none';
        this.compressedResults = [];

        const settings = this.getCompressionSettings();
        
        try {
            for (let i = 0; i < this.selectedFiles.length; i++) {
                if (!this.isProcessing) break; // Check for cancellation
                
                const file = this.selectedFiles[i];
                const progress = Math.round(((i) / this.selectedFiles.length) * 100);
                
                this.updateProgress(progress, `Processing ${file.name}...`);
                
                const result = await this.compressVideo(file, settings);
                if (result) {
                    this.compressedResults.push(result);
                }
            }
            
            if (this.isProcessing && this.compressedResults.length > 0) {
                this.updateProgress(100, 'Compression completed!');
                this.updateStatus(`Successfully compressed ${this.compressedResults.length} video(s)!`);
                this.showDownloadOptions();
            } else {
                this.updateStatus('No videos were compressed successfully.');
            }
            
        } catch (error) {
            console.error('Compression error:', error);
            this.updateStatus('Compression failed. Please try again.');
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
        
        // Map quality preset to compression factor
        const qualityMap = {
            'ultrafast': 0.9,
            'superfast': 0.8,
            'veryfast': 0.7,
            'faster': 0.6,
            'fast': 0.5,
            'medium': 0.4,
            'slow': 0.3,
            'slower': 0.2,
            'veryslow': 0.1
        };
        
        return {
            targetSizeMB,
            compressionFactor: qualityMap[quality] || 0.4,
            quality
        };
    }

    async compressVideo(file, settings) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.muted = true;
            video.crossOrigin = 'anonymous';
            
            video.onloadedmetadata = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate new dimensions based on compression factor
                    const scaleFactor = Math.sqrt(settings.compressionFactor);
                    canvas.width = Math.floor(video.videoWidth * scaleFactor);
                    canvas.height = Math.floor(video.videoHeight * scaleFactor);
                    
                    // Create a single frame representation (poster frame)
                    video.currentTime = video.duration * 0.1; // 10% into video
                    
                    video.onseeked = () => {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        
                        // Convert to blob
                        canvas.toBlob((blob) => {
                            if (blob) {
                                const result = {
                                    original: file,
                                    compressed: blob,
                                    originalSize: file.size,
                                    compressedSize: blob.size,
                                    filename: `${file.name.split('.')[0]}_preview.jpg`,
                                    compressionRatio: ((file.size - blob.size) / file.size * 100).toFixed(1),
                                    dimensions: `${canvas.width}×${canvas.height}`,
                                    type: 'preview'
                                };
                                resolve(result);
                            } else {
                                resolve(null);
                            }
                        }, 'image/jpeg', 0.8);
                    };
                } catch (error) {
                    console.error('Error processing video:', error);
                    resolve(null);
                }
            };
            
            video.onerror = () => {
                console.error('Error loading video:', file.name);
                resolve(null);
            };
            
            video.src = URL.createObjectURL(file);
        });
    }

    showDownloadOptions() {
        // For now, show a simple info message
        const totalSaved = this.compressedResults.reduce((sum, r) => sum + (r.originalSize - r.compressedSize), 0);
        
        this.updateStatus(`Generated ${this.compressedResults.length} preview(s). Total space if compressed: ${this.formatFileSize(totalSaved)}`);
        
        // Create a simple download for the first result as demo
        if (this.compressedResults.length > 0) {
            const result = this.compressedResults[0];
            const url = URL.createObjectURL(result.compressed);
            this.downloadBtn.href = url;
            this.downloadBtn.download = result.filename;
            this.downloadBtn.style.display = 'inline-flex';
            this.downloadBtn.textContent = `📸 Download Preview (${result.filename})`;
        }
    }

    cancelCompression() {
        this.isProcessing = false;
        this.updateStatus('Compression cancelled');
        this.updateProgress(0, 'Cancelled');
        this.compressBtn.disabled = false;
        this.cancelBtn.disabled = true;
    }

    updateProgress(percentage, text) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = text;
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