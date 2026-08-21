# PhotoFramer

Add beautiful Fujifilm-style film borders to your photos with automatic EXIF data integration.

## What is PhotoFramer?

PhotoFramer is a client-side web application that transforms your photos by adding elegant film-inspired borders populated with camera metadata. Perfect for photographers who want to add a retro film aesthetic to their digital images without losing quality. Everything happens in your browser—no uploads, no server processing, just instant results.

## Features

- **Film-style borders** – Choose from multiple border presets inspired by Fujifilm's iconic aesthetic
- **EXIF metadata integration** – Automatically extracts and displays camera settings: focal length, aperture, shutter speed, ISO, film name, and lens model
- **Per-photo editing** – Each image keeps its own border size, aspect ratio, typography, text, and orientation settings
- **Customizable designs** – Adjust border size (0-400%), aspect ratio, fonts, and text content
- **Image transforms** – Rotate 90 degrees, flip horizontally or vertically, and invert colors
- **Wide format support** – Works with JPG, PNG, HEIC, WEBP, TIFF, and RAW image formats
- **Live preview** – See changes in real-time as you adjust settings
- **Flexible export** – Save one framed image as PNG or package multiple framed images into a ZIP file
- **Drag-and-drop upload** – Simply drag photos onto the app to get started
- **Privacy-first** – All processing happens locally in your browser; photos never leave your device

## Why Use PhotoFramer?

Perfect for:
- **Film photographers** – Add borders that match your film aesthetic
- **Digital photographers** – Give your digital photos a vintage film look
- **Portfolio curation** – Create a consistent visual style across your photo collection
- **Social media** – Pre-frame images for consistent Instagram or portfolio aesthetics
- **Print preparation** – Add borders before printing for a professional film-like presentation

## Getting Started

### Prerequisites

- Node.js 16+ and npm (or yarn)
- A modern web browser (Chrome/Edge recommended; Firefox-based browsers and Safari use their download settings)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/photoframer.git
   cd photoframer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the displayed URL (typically `http://localhost:5173`)

### Quick Start Workflow

1. **Upload** – Click "Upload photos" or drag images onto the canvas. Up to 50 photos can be loaded.
2. **Preview** – See your photo with default Fujifilm-style borders and extracted EXIF data
3. **Customize**:
   - Select a border preset (Full frame, Thin border, Bottom bar, Border only)
   - Adjust border size from 0% to 400% with the slider (or use Reset to return to 100%)
   - Choose an aspect ratio from presets or enter a custom ratio
   - Edit metadata, fonts, and text sizes as desired
   - Rotate, flip, or invert the current image
   - Switch between thumbnails to edit each photo independently
4. **Save** – Click "Save as" for one PNG or "Save ZIP as" for all loaded photos

### Saving to a Custom Folder

In Chrome or Edge on `localhost`, the Save buttons open the native file picker so you can choose a filename and folder. Firefox-based browsers such as Zen and Safari do not expose the same file-picker API; enable **Ask where to save files before downloading** in the browser's download settings to choose the destination for the fallback download.

### Usage Examples

**Basic film border on a landscape photo:**
```
1. Upload your JPEG
2. Select "Full frame" preset
3. Set aspect ratio to "16:9"
4. Save as PNG
```

**Custom border styling:**
```
1. Upload your PNG
2. Select "Thin border" for minimal frame
3. Click "Reset" on border size to return to default
4. Customize aspect ratio to "4:3" for a classic look
5. Edit the film name and lens information
6. Adjust typography and image orientation as needed
7. Save the result
```

**Working with RAW files:**
```
1. Upload a CR2 (Canon) or NEF (Nikon) raw file
2. EXIF data will be automatically extracted
3. Customize the border and export as PNG
```

## Building for Production

```bash
npm run build      # Create optimized production build
npm run preview    # Preview the production build locally
```

The optimized build will be created in the `dist/` folder, ready to deploy.

## Project Structure

```
src/
├── components/                      # React components
│   ├── AspectRatioSelector.jsx      # Aspect ratio preset selector
│   ├── AspectRatioSelector.module.css
│   ├── DownloadButton.jsx           # Image export functionality
│   ├── DownloadButton.module.css
│   ├── FramePreview.jsx             # Canvas rendering preview
│   ├── FramePreview.module.css
│   ├── MetadataPanel.jsx            # Settings and metadata editing
│   ├── MetadataPanel.module.css
│   ├── UploadZone.jsx               # File upload interface
│   └── UploadZone.module.css
├── utils/                           # Utility functions
│   ├── borderSettings.js            # Border configuration and helpers
│   ├── exifParser.js                # EXIF data extraction
│   ├── frameRenderer.js             # Canvas rendering engine
│   └── textStyles.js                # Typography configurations
├── App.jsx                          # Main application component
├── App.module.css
├── index.css                        # Global styles
└── main.jsx                         # Application entry point

public/                              # Static assets
index.html                           # HTML template
vite.config.js                       # Vite configuration
package.json                         # Project dependencies
```

## Development

### Available Scripts

- `npm run dev` – Start development server with hot module reloading
- `npm run build` – Create optimized production build
- `npm run preview` – Preview production build locally without building
- `npm run lint` – Run code quality checks with oxlint

### Code Quality

The project uses **oxlint** for fast, zero-config linting:

```bash
npm run lint
```

## Technology Stack

- **React 19** – UI framework for interactive components
- **Vite** – Fast build tool and development server
- **exifr** – Client-side EXIF metadata parsing
- **Canvas API** – Image rendering and border composition
- **CSS Modules** – Scoped, modular styling

## Supported Image Formats

| Format | Support | Notes |
|--------|---------|-------|
| JPEG   | ✅ Full | Excellent EXIF support |
| PNG    | ✅ Full | Limited EXIF data |
| WEBP   | ✅ Full | Modern format |
| HEIC   | ✅ Good | Browser dependent |
| TIFF   | ✅ Good | Full EXIF support |
| RAW    | ⚠️ Limited | Format dependent (CR2, NEF, ARW, RAF, DNG, etc.) |

## Browser Compatibility

- **Chrome/Edge** 90+
- **Firefox** 88+
- **Safari** 15+

Note: RAW format support depends on browser capabilities. Consider converting to JPEG or PNG for maximum compatibility.

## Performance & Privacy

- **Client-side only** – All processing happens in your browser; photos are never uploaded
- **No server required** – Can be deployed as a static site
- **Fast performance** – Optimized with Vite for instant feedback
- **Large image handling** – Works best with images up to 50MB

## Customization Guide

### Border Presets

| Preset | Description | Best For |
|--------|-------------|----------|
| Full frame | Classic film border with all metadata | Artistic prints |
| Thin border | Minimal frame | Minimalist aesthetic |
| Bottom bar only | Film info at bottom | Social media posts |
| Border only | No text | Clean, minimal look |

### Aspect Ratio Selector

Choose from common presets:
- **1:1** – Square (Instagram)
- **4:3** – Classic film
- **3:2** – 35mm film standard
- **16:9** – Widescreen
- **9:16** – Portrait/phone
- **Custom** – Enter any ratio as `W:H` format (e.g., `4:3`, `16:9`) or decimal (e.g., `1.5`)

### Typography Options

Control fonts and sizes for:
- **Film label** – Your film name or title
- **Lens information** – Camera and lens details
- **Exposure data** – Shutter speed, aperture, ISO, focal length

## Troubleshooting

**Image won't load:**
- Check file format compatibility
- Try converting RAW to JPEG first
- Ensure file size is under 50MB

**EXIF data not showing:**
- Image may not contain EXIF metadata
- Try a different photo from your camera
- JPEG files from cameras have the most complete EXIF data

**Border looks stretched:**
- Adjust the aspect ratio setting
- Try the "Auto" preset to maintain original proportions

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure code passes linting (`npm run lint`) before submitting.

## Support & Resources

- **Issues** – [Report bugs or request features](https://github.com/yourusername/photoframer/issues)
- **Documentation** – See files in this repository for additional details
- **Examples** – Check the [examples](./examples/) folder for sample workflows

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Fujifilm's iconic film simulation aesthetic
- Built with [React](https://react.dev), [Vite](https://vitejs.dev), and [exifr](https://github.com/MikeKovarik/exifr)
- Special thanks to the open source community
