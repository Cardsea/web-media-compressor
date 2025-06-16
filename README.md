# Video Compressor - Web Edition

A modern web-based video compression tool that runs entirely in your browser! No server required - all processing happens client-side using FFmpeg WebAssembly.

## 🌟 Features

- 🎬 **Universal Format Support** - Compress any video format
- 🎯 **Precise Size Control** - Set target size from 1 MB to 1 GB with an intuitive dial
- ⚡ **Quality Presets** - Choose from Ultra Fast to Very Slow compression
- 📊 **Real-time Progress** - Watch compression progress in real-time
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔒 **Privacy First** - All processing happens in your browser
- 🖱️ **Drag & Drop** - Simply drag videos onto the page
- ❌ **Cancellable** - Stop compression anytime

## 🚀 Quick Start

### Option 1: Direct Usage
1. Open `index.html` in any modern web browser
2. Wait for FFmpeg to load (first time only)
3. Select or drag a video file
4. Adjust target size and quality
5. Click "Start Compression"
6. Download your compressed video!

### Option 2: Web Server (Recommended)
For best performance, serve the files from a web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
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

## 🚀 Deployment

### GitHub Pages
1. Upload files to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Your app will be available at `https://username.github.io/repository-name`

### Netlify
1. Drag the `web-version` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Get instant deployment with custom URL

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the web-version directory
3. Follow deployment prompts

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

A web companion to the desktop Video Compressor application!

---

**Enjoy compressing videos right in your browser!** 🎬✨ 