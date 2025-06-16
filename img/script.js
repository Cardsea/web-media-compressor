class ImageCompressor {
    constructor() {
        this.selectedFiles = [];
        this.compressedResults = [];
        this.isProcessing = false;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // File elements
        this.imageInput = document.getElementById('imageInput');
        this.selectFileBtn = document.getElementById('selectFileBtn');
        this.fileInfo = document.getElementById('fileInfo');
        this.imagePreview = document.getElementById('imagePreview');
        
        // Settings elements
        this.qualityRange = document.getElementById('qualityRange');
        this.qualityInput = document.getElementById('qualityInput');
        this.qualityDisplay = document.getElementById('qualityDisplay');
        this.formatSelect = document.getElementById('formatSelect');
        this.resizeToggle = document.getElementById('resizeToggle');
        this.resizeOptions = document.getElementById('resizeOptions');
        this.maxWidth = document.getElementById('maxWidth');
        this.maxHeight = document.getElementById('maxHeight');
        this.compressionMode = document.getElementById('compressionMode');
        
        // Progress elements
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.statusText = document.getElementById('statusText');
        this.compressionStats = document.getElementById('compressionStats');
        
        // Action buttons
        this.compressBtn = document.getElementById('compressBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        // Results
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsContainer = document.getElementById('resultsContainer');
    }

    bindEvents() {
        // File selection
        this.selectFileBtn.addEventListener('click', () => {
            this.imageInput.click();
        });
        
        this.imageInput.addEventListener('change', (e) => {
            this.handleFileSelect(Array.from(e.target.files));
        });

        // Quality controls synchronization
        this.qualityRange.addEventListener('input', (e) => {
            this.updateQualityDisplay(e.target.value);
            this.qualityInput.value = e.target.value;
        });

        this.qualityInput.addEventListener('input', (e) => {
            const value = Math.max(10, Math.min(100, parseInt(e.target.value) || 10));
            e.target.value = value;
            this.qualityRange.value = value;
            this.updateQualityDisplay(value);
        });

        // Resize toggle
        this.resizeToggle.addEventListener('change', (e) => {
            this.resizeOptions.style.display = e.target.checked ? 'flex' : 'none';
        });

        // Action buttons
        this.compressBtn.addEventListener('click', () => {
            this.startCompression();
        });

        this.cancelBtn.addEventListener('click', () => {
            this.cancelCompression();
        });

        this.downloadAllBtn.addEventListener('click', () => {
            this.downloadAllImages();
        });

        this.clearBtn.addEventListener('click', () => {
            this.clearAll();
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
                file.type.startsWith('image/')
            );
            
            if (files.length > 0) {
                this.handleFileSelect(files);
            }
        });
    }

    handleFileSelect(files) {
        if (!files || files.length === 0) return;

        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('Please select image files!');
            return;
        }

        this.selectedFiles = imageFiles;
        this.updateFileInfo();
        this.createPreviews();
        this.compressBtn.disabled = false;
        this.statusText.textContent = 'Ready to compress images!';
    }

    updateFileInfo() {
        const count = this.selectedFiles.length;
        const totalSize = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);
        
        this.fileInfo.textContent = `Selected: ${count} image${count > 1 ? 's' : ''} (${this.formatFileSize(totalSize)})`;
    }

    async createPreviews() {
        this.imagePreview.innerHTML = '';
        
        for (const file of this.selectedFiles.slice(0, 6)) { // Show max 6 previews
            const preview = document.createElement('div');
            preview.className = 'preview-item';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            
            const info = document.createElement('div');
            info.className = 'preview-info';
            info.innerHTML = `
                <div class="preview-name">${file.name}</div>
                <div class="preview-size">${this.formatFileSize(file.size)}</div>
            `;
            
            preview.appendChild(img);
            preview.appendChild(info);
            this.imagePreview.appendChild(preview);
        }
        
        if (this.selectedFiles.length > 6) {
            const more = document.createElement('div');
            more.className = 'preview-more';
            more.textContent = `+${this.selectedFiles.length - 6} more`;
            this.imagePreview.appendChild(more);
        }
    }

    updateQualityDisplay(value) {
        this.qualityDisplay.textContent = `${value}%`;
    }

    async startCompression() {
        if (!this.selectedFiles.length || this.isProcessing) return;

        this.isProcessing = true;
        this.compressBtn.disabled = true;
        this.cancelBtn.disabled = false;
        this.downloadAllBtn.style.display = 'none';
        this.resultsSection.style.display = 'none';
        this.compressedResults = [];

        const settings = this.getCompressionSettings();
        
        try {
            for (let i = 0; i < this.selectedFiles.length; i++) {
                if (!this.isProcessing) break; // Check for cancellation
                
                const file = this.selectedFiles[i];
                const progress = Math.round(((i + 1) / this.selectedFiles.length) * 100);
                
                this.updateProgress(progress, `Compressing ${file.name}...`);
                
                const result = await this.compressImage(file, settings);
                this.compressedResults.push(result);
                
                // Update stats
                this.updateCompressionStats();
            }
            
            if (this.isProcessing) {
                this.updateProgress(100, 'Compression completed!');
                this.statusText.textContent = 'All images compressed successfully!';
                this.downloadAllBtn.style.display = 'inline-flex';
                this.showResults();
            }
            
        } catch (error) {
            console.error('Compression error:', error);
            this.statusText.textContent = 'Compression failed. Please try again.';
            this.updateProgress(0, 'Compression failed');
        } finally {
            this.isProcessing = false;
            this.compressBtn.disabled = false;
            this.cancelBtn.disabled = true;
        }
    }

    getCompressionSettings() {
        return {
            quality: parseInt(this.qualityRange.value) / 100,
            format: this.formatSelect.value,
            resize: this.resizeToggle.checked,
            maxWidth: parseInt(this.maxWidth.value) || 1920,
            maxHeight: parseInt(this.maxHeight.value) || 1080,
            mode: this.compressionMode.value
        };
    }

    async compressImage(file, settings) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate dimensions
                    let { width, height } = this.calculateDimensions(
                        img.width, img.height, settings
                    );
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Set canvas quality based on mode
                    if (settings.mode === 'quality') {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                    } else if (settings.mode === 'speed') {
                        ctx.imageSmoothingEnabled = false;
                    }
                    
                    // Draw image
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Determine output format
                    let outputFormat = 'image/jpeg';
                    let extension = 'jpg';
                    
                    if (settings.format === 'png') {
                        outputFormat = 'image/png';
                        extension = 'png';
                    } else if (settings.format === 'webp') {
                        outputFormat = 'image/webp';
                        extension = 'webp';
                    } else if (settings.format === 'original') {
                        outputFormat = file.type;
                        extension = file.name.split('.').pop();
                    }
                    
                    // Convert to blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const result = {
                                original: file,
                                compressed: blob,
                                originalSize: file.size,
                                compressedSize: blob.size,
                                filename: `${file.name.split('.')[0]}_compressed.${extension}`,
                                compressionRatio: ((file.size - blob.size) / file.size * 100).toFixed(1),
                                dimensions: `${width}×${height}`
                            };
                            resolve(result);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    }, outputFormat, settings.quality);
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    calculateDimensions(originalWidth, originalHeight, settings) {
        if (!settings.resize) {
            return { width: originalWidth, height: originalHeight };
        }
        
        const maxWidth = settings.maxWidth;
        const maxHeight = settings.maxHeight;
        
        let width = originalWidth;
        let height = originalHeight;
        
        // Scale down if necessary
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }
        
        return { width, height };
    }

    updateCompressionStats() {
        const totalOriginal = this.compressedResults.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressed = this.compressedResults.reduce((sum, r) => sum + r.compressedSize, 0);
        const avgCompression = ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1);
        
        this.compressionStats.innerHTML = `
            <div class="stats-summary">
                <span>Total saved: ${this.formatFileSize(totalOriginal - totalCompressed)} (${avgCompression}%)</span>
                <span>Processed: ${this.compressedResults.length}/${this.selectedFiles.length}</span>
            </div>
        `;
    }

    showResults() {
        this.resultsContainer.innerHTML = '';
        
        this.compressedResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div class="result-info">
                    <div class="result-filename">${result.original.name}</div>
                    <div class="result-stats">
                        <span class="size-comparison">
                            ${this.formatFileSize(result.originalSize)} → ${this.formatFileSize(result.compressedSize)}
                        </span>
                        <span class="compression-ratio ${result.compressionRatio > 0 ? 'positive' : 'negative'}">
                            ${result.compressionRatio > 0 ? '-' : '+'}${Math.abs(result.compressionRatio)}%
                        </span>
                        <span class="dimensions">${result.dimensions}</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-download" onclick="window.imageCompressor.downloadSingle(${index})">
                    <i class="fas fa-download"></i> Download
                </button>
            `;
            this.resultsContainer.appendChild(resultItem);
        });
        
        this.resultsSection.style.display = 'block';
    }

    downloadSingle(index) {
        const result = this.compressedResults[index];
        const url = URL.createObjectURL(result.compressed);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    async downloadAllImages() {
        if (this.compressedResults.length === 1) {
            this.downloadSingle(0);
            return;
        }
        
        // For multiple files, download as individual files
        this.compressedResults.forEach((result, index) => {
            setTimeout(() => this.downloadSingle(index), index * 100);
        });
    }

    cancelCompression() {
        this.isProcessing = false;
        this.statusText.textContent = 'Compression cancelled';
        this.updateProgress(0, 'Cancelled');
        this.compressBtn.disabled = false;
        this.cancelBtn.disabled = true;
    }

    clearAll() {
        this.selectedFiles = [];
        this.compressedResults = [];
        this.imageInput.value = '';
        this.fileInfo.textContent = 'No files selected';
        this.imagePreview.innerHTML = '';
        this.resultsSection.style.display = 'none';
        this.compressionStats.innerHTML = '';
        this.compressBtn.disabled = true;
        this.downloadAllBtn.style.display = 'none';
        this.statusText.textContent = 'Select image files to get started';
        this.updateProgress(0, 'Ready to compress');
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
    window.imageCompressor = new ImageCompressor();
});

// Handle page visibility for better performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pausing operations');
    } else {
        console.log('Page visible - resuming operations');
    }
}); 