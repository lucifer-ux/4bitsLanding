# Globe.gl - Emit Arcs on Click Example

This is a complete implementation of the "Emit Arcs on Click" example from the globe.gl library.

## Features

- Interactive 3D globe visualization
- Click anywhere on the globe to emit colorful arcs to random destinations
- Real-time arc counter
- Clear arcs functionality
- Pause/Resume animation controls
- Responsive design that adapts to window size

## How to Use

1. Open `index.html` in a web browser
2. Click anywhere on the globe to create arcs
3. Use the controls at the bottom left:
   - **Clear Arcs**: Remove all existing arcs
   - **Pause/Resume Animation**: Control the globe rotation

## Dependencies

The example uses CDN links for the following libraries:
- Three.js (3D graphics)
- D3.js (data visualization)
- Globe.gl (3D globe visualization)

## Technical Details

- **Arc Generation**: Each click creates an arc from the clicked point to a random destination
- **Colors**: Arcs use random colors from a predefined palette
- **Animation**: Arcs animate with a dash effect and the globe rotates automatically
- **Performance**: Optimized for smooth 60fps animation

## Integration

This example can be integrated into larger projects by:
1. Copying the HTML structure
2. Adapting the JavaScript code to your framework (React, Vue, etc.)
3. Customizing the styling and interactions as needed

## Browser Compatibility

Works in all modern browsers that support WebGL and ES6 features.
