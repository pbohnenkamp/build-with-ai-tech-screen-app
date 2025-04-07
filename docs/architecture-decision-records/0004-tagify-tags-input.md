# ADR 0004: Tagify for Tags Input Component

## Status
Accepted

## Context
The tech screen application needs a way to:
- Input and manage tagged technologies
- Provide a user-friendly interface for adding/removing tags
- Allow for easy tag management
- Provide a consistent user experience
- Work well with Bootstrap styling

## Decision
We will use [Tagify](https://yaireo.github.io/tagify/) (version 4.17.6) as our tags input component. This will be implemented by including Tagify via CDN in our HTML files:

```html
<!-- Tagify CSS -->
<link href="https://unpkg.com/@yaireo/tagify/dist/tagify.css" rel="stylesheet" type="text/css" />

<!-- Tagify JavaScript -->
<script src="https://unpkg.com/@yaireo/tagify/dist/tagify.min.js"></script>
```

Key implementation decisions:
- Use Tagify's vanilla JavaScript version for simplicity
- Use Tagify's built-in drag-and-drop reordering
- Use Tagify's mix mode for flexible input
- Integrate with Bootstrap's form styling
- Store tags in a consistent format for persistence

Example implementation:
```javascript
const input = document.querySelector('#technologies');
const tagify = const tagify = new Tagify(input, {
    duplicates: false,
    maxTags: 50,
    backspace: "edit",
    placeholder: "Type technology and press enter",
    editTags: 1,
    dropdown: {
        enabled: 0
    }
});
```

## Consequences
### Positive
- Rich feature set out of the box
- Excellent user experience
- Built-in validation support
- Easy integration with existing forms
- Good documentation and examples
- Active maintenance and community
- Lightweight and performant
- Customizable styling
- Built-in accessibility features
- Works well with Bootstrap

### Negative
- Additional dependency to maintain
- May require custom styling to match exact design requirements
- Slight learning curve for advanced customization
- Need to handle CDN availability
- May need to implement custom validation logic
