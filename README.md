# Portfolio Website

A minimalist portfolio website built using the design inspiration from [James Akl's website](https://jamesakl.com/). This portfolio features a clean, dark theme with a focus on typography and content.

## Structure

```
├── index.html          # Main portfolio page
├── src/
│   ├── css/
│   │   └── main.css    # Main stylesheet
│   ├── js/
│   │   └── main.js     # JavaScript functionality
│   ├── images/         # Image assets (add as needed)
│   └── components/     # Reusable HTML components (future use)
└── README.md           # This file
```

## Features

- **Responsive Design**: Works well on desktop and mobile devices
- **Dark Theme**: Clean, modern dark color scheme
- **Typography**: Uses Source Code Pro for body text and Roboto Mono for headings
- **Keyboard Navigation**: Arrow keys to navigate between headings
- **Smooth Scrolling**: Anchor links scroll smoothly to sections
- **Project Showcase**: Grid layout for featured projects
- **SEO Optimized**: Proper meta tags and semantic HTML

## Customization

### Personal Information

1. **Update contact details** in `index.html`:
   - Replace "Your Name" with your actual name
   - Update email address
   - Add your LinkedIn, GitHub, and other social profiles

2. **Customize the hero section**:
   - Update the hero title and subtitle
   - Modify the skill tags to match your expertise

3. **Add your projects**:
   - Replace the placeholder project cards with your actual projects
   - Update descriptions, tech stacks, and links

4. **Update experience section**:
   - Add your work experience and education
   - Adjust dates and descriptions

### Styling

The design uses CSS custom properties (variables) for easy theming. Key variables in `src/css/main.css`:

```css
:root {
  --bg-primary: #0d0d0d;      /* Main background */
  --text-primary: #e6e6e6;    /* Primary text */
  --accent-primary: #60a5fa;  /* Links and accents */
  --accent-secondary: #86efac; /* Highlights */
  /* ... more variables */
}
```

### Adding Images

1. Place images in the `src/images/` directory
2. Reference them in HTML: `<img src="src/images/your-image.jpg" alt="Description">`

### Adding More Pages

To add additional pages (blog, about, etc.):

1. Create new HTML files following the same structure as `index.html`
2. Update navigation links in the header
3. Consider creating a shared header/footer component

## Development

### Local Development

Simply open `index.html` in your browser. Since this is a static site, no build process is required.

### Fonts

The site uses Google Fonts:
- Source Code Pro (body text)
- Roboto Mono (headings)

Fonts are loaded via CDN for better performance.

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers

## Deployment

This is a static site that can be deployed to any static hosting service:

- **GitHub Pages**: Push to a GitHub repository and enable Pages
- **Netlify**: Connect your repository for automatic deployments
- **Vercel**: Deploy with zero configuration
- **Traditional hosting**: Upload files via FTP

## Credits

- **Design Inspiration**: [James Akl](https://jamesakl.com/)
- **Fonts**: Google Fonts (Source Code Pro, Roboto Mono)
- **Icons**: Inline SVG (add as needed)

## License

This project is open source. Feel free to use it as a starting point for your own portfolio.