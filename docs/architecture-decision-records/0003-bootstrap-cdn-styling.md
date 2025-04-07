# ADR 0003: Bootstrap CDN for Styling

## Status
Accepted

## Context
The tech screen application needs:
- A consistent, professional look and feel
- Responsive design that works well on different devices
- Quick implementation of common UI components
- Minimal setup and maintenance overhead
- No build process required for CSS

## Decision
We will use Bootstrap 5 via CDN link in the HTML header. This will be implemented by adding the following links to the `<head>` section of our HTML files:

```html
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap Icons -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">

<!-- Bootstrap JavaScript Bundle (includes Popper) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
```

Key implementation decisions:
- Use Bootstrap 5.3.3 (latest stable version)
- Include Bootstrap Icons for consistent iconography
- Load JavaScript bundle at the end of the body for performance
- Use Bootstrap's built-in components and utilities
- Follow Bootstrap's responsive design patterns
- Use Bootstrap's form components for consistent input styling

## Consequences
### Positive
- Quick implementation of professional UI
- Consistent styling across all pages
- Built-in responsive design
- Large selection of pre-built components
- Extensive documentation and community support
- No build process required
- CDN provides fast loading and caching
- Easy to update by changing version number
- Includes accessibility features
- Cross-browser compatibility

### Negative
- Limited customization without additional CSS
- Slightly larger initial page load
- Dependency on external CDN availability
- May include unused CSS components
- Less control over the CSS bundle size
