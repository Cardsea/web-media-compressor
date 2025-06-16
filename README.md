# 🌐 Web Media Compressor Suite

A modern web-based media compression suite that runs entirely in your browser! Compress videos and images with professional precision - no downloads or installations required.

## 🔥 **USE THE LIVE VERSION** 

**👉 Visit: https://web-media-compressor.pages.dev/ 👈**

✨ **Ready to use immediately - no setup required!**

## 🌟 Features

### 🎬 Video Compressor
- **Universal Format Support** - Compress any video format
- **Precise Size Control** - Set target size from 1 MB to 1 GB
- **Quality Presets** - Choose from Ultra Fast to Very Slow compression
- **FFmpeg Powered** - Professional-grade video processing

### 🖼️ Image Compressor  
- **Batch Processing** - Compress multiple images at once
- **Multiple Formats** - JPEG, PNG, WebP support with format conversion
- **Quality Control** - Fine-tune compression with real-time preview
- **Smart Resizing** - Automatic dimension optimization for web use

### ✨ Universal Features
- **100% Browser-Based** - No uploads, complete privacy
- **Modern Interface** - Beautiful dark theme with smooth sliders
- **Responsive Design** - Works perfectly on all devices
- **Drag & Drop** - Simply drag files onto the page
- **Real-time Progress** - Watch compression progress live

## 🚀 Quick Start

### 🌐 Use the Live Website (Recommended)
**Just visit: https://web-media-compressor.pages.dev/**

1. **Choose your tool**: Image or Video Compressor
2. **Upload files**: Drag & drop or click to browse
3. **Adjust settings**: Quality, format, size controls
4. **Compress**: Click start and watch the progress
5. **Download**: Get your optimized files instantly!

### 🛠️ Run Locally (Developers)
Want to modify the code? Run it locally:
- Clone the repository
```bash

git clone https://github.com/Cardsea/web-media-compressor.git
cd web-media-compressor
```
- Serve with Python
```bash
python -m http.server 8000
```
> if this does not work try 
> ```bash
> # Serve with Python3
> python3 -m http.server 8000
> ```
- Or with Node.js
```bash
npx http-server
```

Then visit `http://localhost:8000`

## 📁 Files

- `index.html` - Main application interface
- `style.css` - Beautiful dark theme styling
- `script.js` - Video compression logic with FFmpeg.wasm
- `README.md` - This file

## 🌐 Browser Compatibility

- ✅ Chrome 88+ (recommended)
- ✅ Firefox 89+
- ✅ Safari 15+
- ✅ Edge 88+

**Note:** Requires a browser that supports WebAssembly and modern JavaScript features.

## 🔧 How It Works

1. **FFmpeg WebAssembly** loads in your browser (first visit only)
2. **File Processing** happens entirely client-side
3. **Bitrate Calculation** based on target file size
4. **H.264 Compression** with AAC audio encoding
5. **Download** the compressed result

## ⚙️ Compression Settings

### Quality Presets
- **Ultra Fast** - Fastest compression, larger files
- **Fast/Medium** - Balanced speed and quality ⭐ Recommended
- **Slow/Very Slow** - Best quality, smaller files

### Size Control
- Use the **dial** for quick adjustments
- Use the **number input** for precise values
- Range: 1 MB to 1 GB (1000 MB)

## 📈 Performance Tips

- **Smaller files process faster** (under 100MB recommended)
- **Use "Fast" or "Medium"** presets for best speed/quality balance
- **Close other browser tabs** for better performance
- **Use Chrome** for optimal WebAssembly performance

## 🔗 Official Links

- 🌐 **Live Website**: https://web-media-compressor.pages.dev/
- 📦 **Source Code**: https://github.com/Cardsea/web-media-compressor
- 🖥️ **Desktop Version**: https://github.com/Cardsea/desktop-media-compressor

## 🚀 For Developers: Deployment Options

### Cloudflare Pages (Current)
This project is deployed on Cloudflare Pages for optimal performance.

### Other Options
- **Netlify**: Drag folder to [Netlify Drop](https://app.netlify.com/drop)
- **Vercel**: Run `vercel` in project directory
- **GitHub Pages**: Enable Pages in repository settings

## 🛠️ Customization

The app is built with vanilla HTML, CSS, and JavaScript - easy to customize!

- **Colors**: Edit CSS custom properties in `style.css`
- **Branding**: Update header content in `index.html`
- **Features**: Extend functionality in `script.js`

## 🔒 Privacy & Security

- **No data uploads** - everything processes locally
- **No tracking** - no analytics or external scripts (except FFmpeg CDN)
- **Browser-only** - works offline after initial load
- **CORS-friendly** - can be embedded in other sites

## 🐛 Troubleshooting

**FFmpeg fails to load?**
- Ensure you're serving from a web server (not file://)
- Check browser console for errors
- Try clearing browser cache

**Compression is slow?**
- Use faster quality presets
- Try smaller input files
- Close other browser tabs

**Out of memory errors?**
- Reduce target file size
- Use "Ultra Fast" preset
- Try smaller input files

## 💡 Technical Details

- **FFmpeg.wasm 0.12.10** for video processing
- **Modern ES6+** JavaScript with modules
- **CSS Grid & Flexbox** for responsive layout
- **Web APIs**: File API, Blob API, URL API
- **No dependencies** except FFmpeg WebAssembly

## 🎉 Created by Cardsea

Professional media compression tools for the modern web. Part of a complete suite including desktop applications.

### 🔗 Quick Access
- **🌐 Live Website**: https://web-media-compressor.pages.dev/
- **🖼️ Image Compressor**: https://web-media-compressor.pages.dev/img/
- **🎬 Video Compressor**: https://web-media-compressor.pages.dev/vid/

---

**Ready to compress? Visit the live website and start optimizing your media!** ✨ 