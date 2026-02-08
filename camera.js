// ==================== CAMERA ZOOM SYSTEM ====================

// Camera state
const camera = {
    zoom: 1.0,
    minZoom: 0.6,
    maxZoom: 1.5,
    zoomStep: 0.1
};

// ==================== ZOOM FUNCTIONS ====================
function zoomIn() {
    if (camera.zoom < camera.maxZoom) {
        camera.zoom = Math.min(camera.zoom + camera.zoomStep, camera.maxZoom);
        camera.zoom = Math.round(camera.zoom * 10) / 10; // Round to 1 decimal
        updateZoomDisplay();
        console.log(`🔍 Zoom In: ${camera.zoom.toFixed(1)}x`);
    }
}

function zoomOut() {
    if (camera.zoom > camera.minZoom) {
        camera.zoom = Math.max(camera.zoom - camera.zoomStep, camera.minZoom);
        camera.zoom = Math.round(camera.zoom * 10) / 10; // Round to 1 decimal
        updateZoomDisplay();
        console.log(`🔍 Zoom Out: ${camera.zoom.toFixed(1)}x`);
    }
}

function resetZoom() {
    camera.zoom = 1.0;
    updateZoomDisplay();
    console.log('🔍 Zoom Reset: 1.0x');
}

function updateZoomDisplay() {
    const display = document.getElementById('zoomDisplay');
    if (display) {
        display.textContent = `${camera.zoom.toFixed(1)}x`;
    }
}

// ==================== APPLY ZOOM TO CANVAS ====================
function applyCameraTransform(ctx) {
    // Save current state
    ctx.save();
    
    // Center the zoom on the player
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Translate to center, scale, translate back
    ctx.translate(centerX, centerY);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-centerX, -centerY);
    
    // Optionally: Follow player (camera center on player)
    // const offsetX = centerX - game.player.x;
    // const offsetY = centerY - game.player.y;
    // ctx.translate(offsetX, offsetY);
}

function restoreCameraTransform(ctx) {
    ctx.restore();
}

// ==================== ZOOM UI SETUP ====================
function setupZoomUI() {
    // Zoom In button
    const zoomInBtn = document.getElementById('zoomInBtn');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', zoomIn);
        zoomInBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            zoomIn();
        });
    }
    
    // Zoom Out button
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', zoomOut);
        zoomOutBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            zoomOut();
        });
    }
    
    // Reset Zoom button (optional)
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', resetZoom);
        zoomResetBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            resetZoom();
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === '=' || e.key === '+') {
            zoomIn();
        } else if (e.key === '-' || e.key === '_') {
            zoomOut();
        } else if (e.key === '0') {
            resetZoom();
        }
    });
    
    updateZoomDisplay();
    console.log('📷 Camera zoom system initialized');
}

// ==================== HELPER: GET WORLD POSITION FROM SCREEN ====================
// Useful for mouse/touch input with zoom
function screenToWorld(screenX, screenY) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Reverse the zoom transformation
    const worldX = ((screenX - centerX) / camera.zoom) + centerX;
    const worldY = ((screenY - centerY) / camera.zoom) + centerY;
    
    return { x: worldX, y: worldY };
}

// ==================== SMOOTH ZOOM (OPTIONAL) ====================
let targetZoom = 1.0;
let currentZoom = 1.0;
const zoomSmoothness = 0.1;

function smoothZoomIn() {
    targetZoom = Math.min(targetZoom + camera.zoomStep, camera.maxZoom);
}

function smoothZoomOut() {
    targetZoom = Math.max(targetZoom - camera.zoomStep, camera.minZoom);
}

function updateSmoothZoom() {
    if (Math.abs(currentZoom - targetZoom) > 0.01) {
        currentZoom += (targetZoom - currentZoom) * zoomSmoothness;
        camera.zoom = currentZoom;
        updateZoomDisplay();
    }
}

// Call setupZoomUI() after DOM is loaded
// setupZoomUI();
