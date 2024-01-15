// preload.js

// Example: Add a custom API to the renderer process
window.myCustomAPI = {
    // Define your custom methods here
    greet: () => {
        console.log('Hello from the renderer process!');
    },
};
