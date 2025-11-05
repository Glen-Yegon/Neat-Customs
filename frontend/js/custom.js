

document.addEventListener("DOMContentLoaded", function() {
  // Load selected images from localStorage
  let selectedImages = JSON.parse(localStorage.getItem("selectedImages")) || [];
  
  if (selectedImages.length === 0) {
      alert("No images found! Make sure to load the images first.");
      return;
  }

// Initialize canvases using Fabric.js
window.canvases = [
  new fabric.Canvas('canvas-0'),
  new fabric.Canvas('canvas-1'),
  new fabric.Canvas('canvas-2'),
  new fabric.Canvas('canvas-3')
];

// Now attach guides
attachOverlayGuides();


// Attach the canvases array to the window so it's globally available
window.canvases = canvases;

  
// Function to Clear All Canvases but Keep Background Image
function clearAllCanvases() {
  const confirmClear = confirm(    "Are you sure you want to clear your current design?\n\nThis will remove all added elements but keep the background image.\n\nThis action cannot be undone.");
  
  if (!confirmClear) {
    console.log("Canvas clearing canceled by user.");
    return;
  }

  console.log("Clearing all canvases...");

  canvases.forEach((canvas, index) => {
    // Get the background image before clearing
    let bgImage = canvas.backgroundImage || null;

    // Clear all objects on the canvas
    canvas.clear();

    // Restore the background image if it exists
    if (bgImage) {
      canvas.setBackgroundImage(bgImage, canvas.renderAll.bind(canvas));
    }

    // Remove saved data from localStorage
    localStorage.removeItem(`canvas-${index}`);

    console.log(`Canvas-${index} cleared, background image restored!`);
  });

  console.log("All canvases successfully cleared while keeping backgrounds!");
  alert("Canvas cleared successfully!");
}

// Attach Click Event to the Button
document.getElementById("clearCanvasBtn").addEventListener("click", clearAllCanvases);










document.getElementById("downloadImageBtn").addEventListener("click", function () {
  // Always start clean — remove old images
  sessionStorage.removeItem("checkoutImages");

  let newImages = [];

  canvases.forEach((canvas) => {
    const imgUrl = canvas.toDataURL("image/png"); // Convert canvas to image URL
    newImages.push(imgUrl);
  });

  // Store fresh images in sessionStorage (auto-clears when tab closes)
  sessionStorage.setItem("checkoutImages", JSON.stringify(newImages));

  // Redirect to checkout page
  window.location.href = "buy3.html";
});


let activeCanvas = null;
let isButtonAdded = false; // Prevent multiple button additions

// Function to show the save modal
function showSaveModal() {
  console.log("Showing save modal...");
  document.getElementById('saveModal').style.display = 'flex';

  document.getElementById('canvasPreview').innerHTML = ''; // Clear previous previews
  const designId = 'design_' + Date.now();
  const designData = {};

  canvases.forEach((canvas, index) => {
    try {
      const imgUrl = canvas.toDataURL('png');
      const imgElement = document.createElement('img');
      imgElement.src = imgUrl;
      document.getElementById('canvasPreview').appendChild(imgElement);
      designData[`canvas${index + 1}`] = canvas.toJSON();
    } catch (error) {
      console.error(`Error processing canvas ${index}:`, error);
    }
  });

  // Save design to localStorage
  try {
    localStorage.setItem(designId, JSON.stringify(designData));
    localStorage.setItem('lastSavedDesignId', designId);
  } catch (error) {
    console.error("Error saving design to localStorage:", error);
  }
}

// Event listener for save button
document.getElementById('saveButton').addEventListener('click', showSaveModal);

// Event listener to close the modal
document.getElementById('closeModalBtn').addEventListener('click', function () {
  document.getElementById('saveModal').style.display = 'none';
});

// Detect when a canvas becomes active
canvases.forEach((canvas, index) => {
  if (index === 2 && !isButtonAdded) { // Only for Canvas 3
    isButtonAdded = true;

    const canvasWidth = canvases[2].width; // Get Canvas 3 width

    // Create a large sage green button
    let button = new fabric.Rect({
      left: canvasWidth / 2 - -55, // Centered horizontally
      top: 130, // Positioned at the top
      fill: '#5d39ff', // Sage green background
      width: 330,
      height: 80,
      rx: 5, // Rounded corners
      ry: 5,
      stroke: 'black',
      strokeWidth: 1,
      selectable: false, // Prevent dragging
      hoverCursor: 'pointer'
    });

    // Add text on the button
    let buttonText = new fabric.Text('Proceed To Checkout ?', {
      left: canvasWidth / 2 - -80, // Adjusted for centering
      top: 150,
      fontSize: 30, // Bigger text
      fill: 'black',
      fontWeight: 'normal',
      selectable: false
    });

    // Group button and text together
    let buttonGroup = new fabric.Group([button, buttonText], {
      selectable: false,
      evented: true // Allow click events
    });

    // Add button to Canvas 3
    canvases[2].add(buttonGroup);
    canvases[2].renderAll();

    // Make the button open the modal on click
    canvases[2].on('mouse:down', function (event) {
      if (event.target === buttonGroup) {
        showSaveModal();
      }
    });
  }
});




// Event listener for save button
document.getElementById('saveButton').addEventListener('click', showSaveModal);

// Event listener to close the modal
document.getElementById('closeModalBtn').addEventListener('click', function () {
  document.getElementById('saveModal').style.display = 'none';
});
// Event listener for save button
document.getElementById('saveButton').addEventListener('click', showSaveModal);

// Event listener to close the modal
document.getElementById('closeModalBtn').addEventListener('click', function () {
  document.getElementById('saveModal').style.display = 'none';
});




// Function to resize the image to fit the canvas while maintaining its aspect ratio
function resizeImageToCanvas(canvas, image) {
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  // Calculate the scale factor to maintain the aspect ratio
  const scaleFactor = Math.min(canvasWidth / image.width, canvasHeight / image.height);

  // Apply the scale factor to the image
  image.scale(scaleFactor);

  // Center the image on the canvas
  image.set({
    left: (canvasWidth - image.getScaledWidth()) / 2,
    top: (canvasHeight - image.getScaledHeight()) / 2
  });

  canvas.renderAll();
}

// Set the initial canvas size
const initialWidth = 750;
const initialHeight = 650;

// Set initial canvas size
canvases.forEach((canvas) => {
  canvas.setWidth(initialWidth);
  canvas.setHeight(initialHeight);

  // Assuming you have an image object added to the canvas, resize the image to fit the canvas
  const image = canvas.getObjects().find((obj) => obj.type === 'image'); // Get the image object from the canvas
  if (image) {
    resizeImageToCanvas(canvas, image);
  }
});



  let currentSlide = 0;


  






     // Function to load and display the graphic on the current canvas
     window.selectGraphic = function(imageUrl) {
      // Get the current canvas based on the currentSlide index
      const canvas = canvases[currentSlide];

      // Load and add the image to the current canvas
      fabric.Image.fromURL(imageUrl, function(img) {
// Set a fixed scale (e.g., 0.2 to make it 20% of its original size)
const scale = 0.3; // Adjust this value as needed

// Scale the image to a fixed size
img.scale(scale);

          // Add the image to the canvas as an editable object
          img.set({
              left: canvas.width / 2 - img.width * scale / 2,
              top: canvas.height / 2 - img.height * scale / 2,
              hasBorders: true,  // Enable resizing and interaction
              hasControls: true, // Enable editing controls
              lockScalingFlip: true, // Prevent flipping while resizing
              
          });

          // Add the image to the canvas
          canvas.add(img);
          canvas.setActiveObject(img);  // Make it the active object for editing
          canvas.renderAll();




      // Set selected image for further interaction
      selectedImage = img;

    // Show the options menu for editing
    showOptionsMenu(img);
  }, {
    crossOrigin: 'anonymous' // To handle cross-origin issues if the image is hosted
  });

  };


// Loop through all canvases
canvases.forEach((canvas) => {
  // When an object is selected
  canvas.on("selection:created", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "image") {
      selectedImage = activeObject;
      showOptionsMenu(activeObject, canvas);
    }
  });

  // When the selected object is updated (moved, resized, etc.)
  canvas.on("selection:updated", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "image") {
      selectedImage = activeObject;
      showOptionsMenu(activeObject, canvas);
    }
  });

  // When the selection is cleared (no object selected)
  canvas.on("selection:cleared", function () {
    hideOptionsMenu();
  });
});


// Function to show the options menu below the selected image
function showOptionsMenu(img, canvas) {
  // Only show menu if the object is selected
  const menuTemplate = document.getElementById("graphicOptionsMenuTemplate");
  const menu = menuTemplate.cloneNode(true); // Clone the menu template
  menu.style.display = "flex"; // Make it visible
  menu.style.position = "absolute"; // Absolutely position within the canvas wrapper
  menu.classList.add("graphicOptionsMenu"); // Add a class for styling
  // Append the menu to the canvas wrapper
  // ✅ Fix: Get the actual canvas wrapper
  const wrapper = canvas.getElement().parentNode; // Get wrapper of the canvas
  if (!wrapper) {
    console.error("Error: Canvas wrapper not found!");
    return;
  }

  // Append the menu to the canvas wrapper
  wrapper.appendChild(menu);


  // This function updates the menu's position based on the image's bounding rectangle,
  // and ensures that the menu does not touch the canvas edges by applying a margin.
  function updateMenuPosition() {
    // Get the bounding rectangle of the image relative to the canvas
    const objectRect = img.getBoundingRect();

    // Compute the centered left position below the image and a small gap (2px) from the bottom
    let left = objectRect.left + (objectRect.width / 20) - (menu.offsetWidth / 1);
    let top = objectRect.top + objectRect.height + 20; // 2px gap

    // Define a margin (in pixels) so that the menu does not touch the edges
    const margin = 5;
    const canvasWidth = canvas.wrapperEl.clientWidth;
    const canvasHeight = canvas.wrapperEl.clientHeight;

    // Clamp the left value so that the menu stays within the canvas wrapper
    if (left < margin) {
      left = margin;
    }
    if (left + menu.offsetWidth > canvasWidth - margin) {
      left = canvasWidth - menu.offsetWidth - margin;
    }
    
    // Clamp the top value as well
    if (top < margin) {
      top = margin;
    }
    if (top + menu.offsetHeight > canvasHeight - margin) {
      top = canvasHeight - menu.offsetHeight - margin;
    }

    // Apply the computed position to the menu
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }


  // Set the initial position of the menu
  updateMenuPosition();

  // Update the menu's position when the image moves, scales, or rotates.
  img.on('moving', updateMenuPosition);
  img.on('scaling', updateMenuPosition);
  img.on('rotating', updateMenuPosition);





// Add event listeners for the menu buttons
const duplicateBtn = menu.querySelector("#duplicateBtn");
const deleteBtn = menu.querySelector("#deleteBtn");
const outlineBtn = menu.querySelector("#outlineBtn");
const outlineColor = menu.querySelector("#outlineColor");
const graphicFillColor = menu.querySelector("#graphicFillColor");
const cornerRadiusInput = menu.querySelector("#cornerRadius");


duplicateBtn.addEventListener("click", function () {
  duplicateImage(img, canvas);
});

deleteBtn.addEventListener("click", function () {
  deleteImage(img, canvas);
});

outlineBtn.addEventListener("click", function () {
  addOutlineToImage(img);
});

outlineColor.addEventListener("input", function (event) {
  changeOutlineColor(img, event.target.value);
});

// Add an event listener that updates the fill color when changed
graphicFillColor.addEventListener("input", function (event) {
  changeFillColor(img, event.target.value);
});


cornerRadiusInput.addEventListener("input", function (event) {
  const radius = parseInt(event.target.value, 10);
  const activeObj = canvas.getActiveObject();

  if (activeObj) {
    // save radius value on the object
    activeObj.cornerRadiusValue = radius;

    // update live
    updateCornerRadius(activeObj, radius, canvas);
  }
});

// 🔥 Live update on slider/input
cornerRadiusInput.addEventListener("input", function (event) {
  const radius = parseInt(event.target.value, 10);

  const activeObj = canvas.getActiveObject();
  if (activeObj) {
    updateCornerRadius(activeObj, radius, canvas);
  }
});

};

// Ensure stroke exists before applying changes
function ensureStroke(img, color = "transparent") {
  if (!img.stroke || img.stroke === "" || img.stroke === "transparent") {
    img.set({
      stroke: color,
      strokeWidth: 3
    });
  }
  img.setCoords();
  canvases[currentSlide].renderAll();
}


// Store corner radius per object
function updateCornerRadius(img, radius, canvas) {
  if (!img) return;

  // Save radius on the object itself so it persists
  img.cornerRadiusValue = radius;

  // Scale the radius relative to the image size (shortest side)
  const maxRadius = Math.min(img.width, img.height) / 2;
  const scaledRadius = (radius / 100) * maxRadius;

  const clipRect = new fabric.Rect({
    originX: 'center',
    originY: 'center',
    left: 0,
    top: 0,
    width: img.width,
    height: img.height,
    rx: scaledRadius,
    ry: scaledRadius
  });

  img.clipPath = clipRect;
  canvas.renderAll();
}



// Function to hide the options menu
function hideOptionsMenu() {
  const menus = document.querySelectorAll(".graphicOptionsMenu");
  menus.forEach(menu => {
    menu.style.display = "none"; // Hide the menu
  });
  selectedImage = null; // Deselect the image
}

// Function to duplicate the selected image
function duplicateImage(img, canvas) {
  const clonedImg = fabric.util.object.clone(img);
  canvas.add(clonedImg);
  clonedImg.set({
    left: img.left + 20, // Offset the clone slightly
    top: img.top + 20,
  });
  canvas.renderAll();
}

// Function to delete the selected image
function deleteImage(img, canvas) {
  canvas.remove(img);
  canvas.renderAll();
  hideOptionsMenu(); // Hide the menu after deletion
}


document.addEventListener('keydown', function(e) {
  // Check if Backspace is pressed and focus is not in an input or textarea
  if ((e.key === 'Backspace' || e.keyCode === 8) && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
    e.preventDefault(); // Prevent the default back navigation

    // Get the active canvas using currentSlide
    const activeCanvas = canvases[currentSlide];
    const activeObject = activeCanvas.getActiveObject();

    // Check if an object is selected and if it's an image
    if (activeObject && activeObject.type === 'image') {
      deleteImage(activeObject, activeCanvas);
    }
  }
});


// Function to change the outline color
function changeOutlineColor(img, color) {
  ensureStroke(img, color); // if no stroke, apply with chosen color
  img.set({
    stroke: color // Change the stroke color to the selected one
  });
  img.setCoords();
  canvases[currentSlide].renderAll();
}

function changeFillColor(img, color) {
  // Remove any existing BlendColor filter
  if (img.filters) {
    img.filters = img.filters.filter(filter => filter.type !== 'BlendColor');
  } else {
    img.filters = [];
  }

  // Create and add a new BlendColor filter in 'tint' mode
  var blendFilter = new fabric.Image.filters.BlendColor({
    color: color,
    mode: 'tint',
    alpha: 1
  });
  img.filters.push(blendFilter);

  // Apply filters synchronously and re-render the canvas
  img.applyFilters();
  img.setCoords();
  canvases[currentSlide].renderAll();
}











// Function to set the image as the background of the canvas
function loadImageToCanvas(canvas, imageUrl) {
  fabric.Image.fromURL(imageUrl, function (img) {
    // Scale the image to fit the canvas
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    img.scale(scale);

    
    // Set the image as the background
    canvas.setBackgroundImage(
      img,
      canvas.renderAll.bind(canvas),
      {
        scaleX: scale,
        scaleY: scale,
        originX: 'left',
        originY: 'top'
      }
    );

    
  });
}





  // Load images from selectedImages array into the canvases
  selectedImages.forEach((imageUrl, index) => {
      if (imageUrl) {
          loadImageToCanvas(canvases[index], imageUrl);
      }
  });

    // Show the canvas based on the current slide index
    function showCanvas(slideIndex) {
      canvases.forEach((canvas, index) => {
          canvas.wrapperEl.style.display = (index === slideIndex) ? 'block' : 'none';
      });
  }







  // Navigation button handlers
  document.getElementById("nextBtn").addEventListener("click", function() {
    // Reference the current canvas using currentSlide index
    const currentCanvas = canvases[currentSlide];
    if (currentCanvas.getActiveObject()) {
        currentCanvas.discardActiveObject();
        currentCanvas.requestRenderAll();
    }
      currentSlide = (currentSlide + 1) % 4;
      showCanvas(currentSlide);
  });

  document.getElementById("prevBtn").addEventListener("click", function() {
    // Reference the current canvas using currentSlide index
    const currentCanvas = canvases[currentSlide];
    if (currentCanvas.getActiveObject()) {
        currentCanvas.discardActiveObject();
        currentCanvas.requestRenderAll();
    }

      currentSlide = (currentSlide - 1 + 4) % 4;
      showCanvas(currentSlide);
  });

  // Initially show the first slide
  showCanvas(currentSlide);

          
// Handle "Add Text" functionality
const textFormContainer = document.getElementById("textFormContainer");
const textInput = document.getElementById("textInput");
const addTextButton = document.getElementById("addTextButton");

// Menu for text editing
const textMenu = document.getElementById("textMenu");
const manualCloseBtn = document.querySelector(".manual-close-btn");
const deleteButton = document.getElementById("deleteText");
const fontSizeInput = document.getElementById("fontSizeInput");
const fontWeightInput = document.getElementById("fontWeightInput");
const colorPicker = document.getElementById("colorPicker"); // Color picker input
const duplicateButton = document.getElementById("duplicateText"); // Duplicate button

document.getElementById("addText").addEventListener("click", function () {
  textFormContainer.style.display = "block";
  textInput.focus(); // Focus on the input field automatically
});

addTextButton.addEventListener("click", function () {
  addTextToCanvas();
});

textInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent form submission
    addTextToCanvas();
  }
});

manualCloseBtn.addEventListener("click", closeTextMenuManually);
function closeTextMenuManually() {
  textMenu.style.display = "none";
}



// Function to add text to the canvas
function addTextToCanvas() {
  const textValue = textInput.value.trim();
  if (textValue) {
    const canvas = canvases[currentSlide];

    // Create a new text object and add it to the canvas
    const text = new fabric.Textbox(textValue, {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontSize: 50,
      fill: "black",
      originX: "center",
      originY: "center",
      editable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);

    // Center the text on the canvas
    text.center();
    text.setCoords();

    textInput.value = "";
    textFormContainer.style.display = "none";

  }
}

// Close form when clicking outside it
document.addEventListener("click", function (e) {
  if (!textFormContainer.contains(e.target) && e.target.id !== "addText") {
    textFormContainer.style.display = "none";
  }
});

// Show or hide the text editing menu based on object selection
canvases.forEach((canvas) => {
  canvas.on("selection:created", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "textbox") {
      showTextMenu(activeObject, canvas);
    }
  });

  canvas.on("selection:updated", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "textbox") {
      showTextMenu(activeObject, canvas);
    }
  });

  canvas.on("selection:cleared", function () {
    hideTextMenu();
  });
});


// Show the text menu near the selected object
function showTextMenu(activeObject, canvas) {
  textMenu.style.display = "block";

  // REMOVE OR COMMENT OUT THIS SECTION:
  // const canvasRect = canvas.wrapperEl.getBoundingClientRect();
  // const objectRect = activeObject.getBoundingRect();
  // textMenu.style.left = `${canvasRect.left + objectRect.left + objectRect.width / 2 - textMenu.offsetWidth / 2}px`;
  // textMenu.style.top = `${canvasRect.top + objectRect.top - 40 - textMenu.offsetHeight}px`;

  // Populate menu options with the object's current properties
  fontSizeInput.value = activeObject.fontSize || 24;
  fontWeightInput.value = activeObject.fontWeight || "normal";
  colorPicker.value = activeObject.fill || "#000000";

  // Attach a one-time listener to hide the menu as soon as the object starts moving.
  const handleMoving = function(e) {
    if (e.target === activeObject) {
      hideTextMenu();
      canvas.off('object:moving', handleMoving);
    }
  };
  canvas.on('object:moving', handleMoving);

  // Attach a one-time listener to show the menu again when the object stops moving.
  const handleModified = function(e) {
    if (e.target === activeObject) {
      showTextMenu(activeObject, canvas);
      canvas.off('object:modified', handleModified);
    }
  };
  canvas.on('object:modified', handleModified);
}


// Hide the text menu
function hideTextMenu() {
  textMenu.style.display = "none";
}






// Create separate undo/redo stacks for each canvas
const undoStacks = [[], [], [], []];
const redoStacks = [[], [], [], []];

// Flag to disable state saving when restoring
let isRestoring = false;

function saveState() {
  // If we're currently restoring (undo/redo), skip saving state
  if (isRestoring) return;
  const currentCanvas = canvases[currentSlide];
  undoStacks[currentSlide].push(currentCanvas.toJSON());
  // Clear redo stack on new actions
  redoStacks[currentSlide] = [];
}

// Attach saveState only to user-driven events
canvases.forEach((canvas, index) => {
  canvas.on('object:added', saveState);
  canvas.on('object:modified', saveState);
  canvas.on('object:removed', saveState);
});

// Undo function
function undo() {
  const currentCanvas = canvases[currentSlide];
  if (undoStacks[currentSlide].length > 0) {
    // Push current state to redo stack
    redoStacks[currentSlide].push(currentCanvas.toJSON());
    const prevState = undoStacks[currentSlide].pop();
    // Disable saving during restore
    isRestoring = true;
    currentCanvas.loadFromJSON(prevState, () => {
      currentCanvas.renderAll();
      isRestoring = false;
    });
  }
}

// Redo function
function redo() {
  const currentCanvas = canvases[currentSlide];
  if (redoStacks[currentSlide].length > 0) {
    // Push current state back to undo stack
    undoStacks[currentSlide].push(currentCanvas.toJSON());
    const nextState = redoStacks[currentSlide].pop();
    // Disable saving during restore
    isRestoring = true;
    currentCanvas.loadFromJSON(nextState, () => {
      currentCanvas.renderAll();
      isRestoring = false;
    });
  }
}

// Attach undo/redo functions to buttons
document.getElementById("undoButton").addEventListener("click", undo);
document.getElementById("redoButton").addEventListener("click", redo);







// Update font size when the user changes it in the menu
fontSizeInput.addEventListener("input", function () {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "textbox") {
    activeObject.set("fontSize", parseInt(fontSizeInput.value, 10) || 24);
    canvas.renderAll();
    
  }
});

// Update font weight when the user changes it in the menu
fontWeightInput.addEventListener("input", function () {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "textbox") {
    activeObject.set("fontWeight", fontWeightInput.value || "normal");
    canvas.renderAll();

  }
});

// Update text color when the user picks a color
colorPicker.addEventListener("input", function () {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "textbox") {
    activeObject.set("fill", colorPicker.value);
    canvas.renderAll();
 
  }
});

// Update text outline color when the user picks a color
outlineColorPicker.addEventListener("input", function () {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "textbox") {
    activeObject.set("stroke", outlineColorPicker.value);
    // Ensure stroke width is set so the outline is visible (default to 2 if not already set)
    if (!activeObject.strokeWidth || activeObject.strokeWidth === 0) {
      activeObject.set("strokeWidth", 2);
    }
    canvas.renderAll();


  }
});


function updateTextShadow() {
  const canvas = canvases[currentSlide];
  if (!canvas) return;
  const activeObject = canvas.getActiveObject();
  if (activeObject && (activeObject.type === "textbox" || activeObject.type === "i-text" || activeObject.type === "text")) {
    const offsetX = parseInt(document.getElementById("shadowXInput").value, 10) || 0;
    const offsetY = parseInt(document.getElementById("shadowYInput").value, 10) || 0;
    const blur = parseInt(document.getElementById("shadowBlurInput").value, 10) || 0;
    const color = document.getElementById("shadowColorPicker").value;
    
    // Create a new Fabric Shadow object with updated properties
    const shadow = new fabric.Shadow({
      offsetX: offsetX,
      offsetY: offsetY,
      blur: blur,
      color: color
    });
    
    activeObject.set("shadow", shadow);
    canvas.renderAll();

  }
}

// Attach 'input' event listeners to update in real time
document.getElementById("shadowXInput").addEventListener("input", updateTextShadow);
document.getElementById("shadowYInput").addEventListener("input", updateTextShadow);
document.getElementById("shadowBlurInput").addEventListener("input", updateTextShadow);
document.getElementById("shadowColorPicker").addEventListener("input", updateTextShadow);


function updateTextDecoration() {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();
  if (activeObject && (activeObject.type === "textbox" || activeObject.type === "i-text" || activeObject.type === "text")) {
    activeObject.set({
      underline: document.getElementById("underlineInput").checked,
      linethrough: document.getElementById("linethroughInput").checked,
      overline: document.getElementById("overlineInput").checked
    });
    canvas.renderAll();
  }
}

// Attach event listeners to update in real time
document.getElementById("underlineInput").addEventListener("change", updateTextDecoration);
document.getElementById("linethroughInput").addEventListener("change", updateTextDecoration);
document.getElementById("overlineInput").addEventListener("change", updateTextDecoration);




// Update Text Align
document.getElementById("textAlignInput").addEventListener("change", function () {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.isType("textbox")) {
    activeObject.set({
      textAlign: this.value
    });
    canvas.renderAll();
  }
});

// Update Letter Spacing
document.getElementById("letterSpacingInput").addEventListener("input", function () {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.isType("textbox")) {
    activeObject.set({
      charSpacing: parseInt(this.value) * 10 // fabric.js uses charSpacing in 1/10 px units
    });
    canvas.renderAll();
  }
});

// Update Line Height
document.getElementById("lineHeightInput").addEventListener("input", function () {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.isType("textbox")) {
    activeObject.set({
      lineHeight: parseFloat(this.value)
    });
    canvas.renderAll();
  }
});



// Duplicate the selected text object
duplicateButton.addEventListener("click", function () {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "textbox") {
    const clone = fabric.util.object.clone(activeObject);
    clone.set({
      left: activeObject.left + 20, // Offset the clone slightly
      top: activeObject.top + 20,
    });
    canvas.add(clone);
    canvas.setActiveObject(clone);
    canvas.renderAll();
  }
});

// Delete selected text object with the Delete Button
deleteButton.addEventListener("click", function () {
  deleteSelectedText();
});

// Delete with Backspace key
document.addEventListener("keydown", function (e) {
  if (e.key === "Backspace" || e.key === "Delete") {
    // Prevent default only when an object is selected and editable
    const canvas = canvases[currentSlide];
    const activeObject = canvas.getActiveObject();

    if (activeObject && activeObject.type === "textbox" && !activeObject.isEditing) {
      e.preventDefault(); // Prevent browser from navigating back
      deleteSelectedText();
    }
  }
});

// Shared delete function
function deleteSelectedText() {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "textbox") {
    canvas.remove(activeObject);
    canvas.renderAll();
    hideTextMenu();
  }
}

document.getElementById("fontStyleInput").addEventListener("change", function () {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "textbox") {
    activeObject.set("fontStyle", this.value);
    canvas.renderAll();
  }
});
document.getElementById("listFormatInput").addEventListener("change", function () {
  const format = this.value;
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();

  if (activeObject && activeObject.type === "textbox") {
    const lines = activeObject.text.split("\n");

    let formattedLines = [];

    if (format === "bullet") {
      formattedLines = lines.map(line => line.startsWith("• ") ? line : `• ${line}`);
    } else if (format === "numbered") {
      formattedLines = lines.map((line, i) => /^\d+\./.test(line) ? line : `${i + 1}. ${line}`);
    } else {
      // Remove bullets or numbers
      formattedLines = lines.map(line => line.replace(/^•\s+|\d+\.\s+/, ""));
    }

    activeObject.set("text", formattedLines.join("\n"));
    canvas.renderAll();
  }
});

//superscript and subscript



const fontFamilyInput = document.getElementById("fontFamilyInput");

// Change font family when a new option is selected
fontFamilyInput.addEventListener("change", function () {
  const canvas = canvases[currentSlide];
  const activeObject = canvas.getActiveObject();

  if (activeObject && activeObject.type === "textbox") {
    activeObject.set("fontFamily", fontFamilyInput.value);
    canvas.renderAll();
  }
});




// Update the dropdown to match the active text object's font family when highlighted
canvases[currentSlide].on("selection:created", function () {
  const activeObject = canvases[currentSlide].getActiveObject();
  if (activeObject && activeObject.type === "textbox") {
    fontFamilyInput.value = activeObject.fontFamily || "Arial";
  }
});

canvases[currentSlide].on("selection:updated", function () {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "textbox") {
    fontFamilyInput.value = activeObject.fontFamily || "Arial";
  }
});

});





  // Function to open a specific menu
  function openGraphicsMenu(menuId) {
    // Hide all menus
    const menus = document.querySelectorAll('.hidden-menu');
    menus.forEach(menu => (menu.style.display = 'none'));
  
    // Show the selected menu
    document.getElementById(menuId).style.display = 'block';
  
    // Hide the main graphic menu
    document.getElementById('graphicMenu').style.display = 'none';
  }


  document.addEventListener("DOMContentLoaded", () => {
    const addGraphicIcon = document.getElementById("addGraphic");
    const graphicMenu = document.getElementById("graphicMenu");
    const closeGraphicMenus = document.getElementById("closeGraphicMenus");
  
    // Function to open the menu
    function openGraphicMenu() {
      graphicMenu.style.left = "0"; // Slide the menu in
    }
  
    // Function to close the menu
    function closeMenu() {
      graphicMenu.style.left = "-300px"; // Slide the menu out
    }
  
    // Event listeners
    addGraphicIcon.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent the click from reaching the document
      openGraphicMenu();
    });
  
    closeGraphicMenus.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event bubbling
      closeMenu();
    });
  
    // Close menu when clicking outside of it
    document.addEventListener("click", (e) => {
      if (!graphicMenu.contains(e.target) && e.target !== addGraphicIcon) {
        closeMenu(); // Corrected function call
      }
    });
  });
  



// Trigger the file input click event when the upload icon is clicked
function triggerImageUpload() {
  document.getElementById('imageUpload').click();
}

// Handle the image upload and load it onto the canvas
function handleImageUpload(event) {
  const file = event.target.files[0]; // Get the uploaded file

  if (file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      // Call the selectGraphic function to load the image onto the canvas
      selectGraphic(e.target.result); // e.target.result gives the base64 URL of the uploaded image
    };
    
    // Read the uploaded file as a data URL (base64)
    reader.readAsDataURL(file);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const graphicMenu = document.getElementById("graphicMenu");

  // Function to close the current submenu and return to the main menu
  function closeGraphicsMenu() {
    // Hide all submenus
    const menus = document.querySelectorAll(".hidden-menu");
    menus.forEach(menu => (menu.style.display = "none"));

    // Show the main graphic menu
    graphicMenu.style.display = "block";
  }

  // Function to close everything when clicking outside
  document.addEventListener("click", (e) => {
    if (!graphicMenu.contains(e.target)) {
      closeGraphicsMenu();
    }
  });
});
  




      


// Function to get active canvas and object
function getActiveObject() {
  for (const canvas of canvases) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) return { activeCanvas: canvas, activeObject };
  }
  return { activeCanvas: null, activeObject: null };
}

/*
document.getElementById("removeBg").addEventListener("click", async () => {
  const activeCanvas = canvases.find(canvas => canvas.getActiveObject());
  if (!activeCanvas) {
      alert("Please select an image first!");
      return;
  }

  const activeObject = activeCanvas.getActiveObject();

  if (!activeObject || activeObject.type !== "image") {
      alert("Selected object is not an image!");
      return;
  }

  // Convert the image to Base64
  const imageBase64 = activeObject.toDataURL("image/png").split(",")[1];

  // Send the image to the backend
  try {
      const response = await fetch("http://127.0.0.1:5000/remove-bg", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ image: imageBase64 })
      });

      const data = await response.json();

      if (data.processedImage) {
          // Create a new fabric image from the processed Base64
          fabric.Image.fromURL("data:image/png;base64," + data.processedImage, (img) => {
              img.set({
                  left: activeObject.left,
                  top: activeObject.top,
                  scaleX: activeObject.scaleX,
                  scaleY: activeObject.scaleY
              });

              // Remove the old image and add the new one
              activeCanvas.remove(activeObject);
              activeCanvas.add(img);
              activeCanvas.renderAll();
          });
      } else {
          alert("Background removal failed!");
      }
  } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the image.");
  }
});
*/


//layering of objects from the main menu
let currentSlide = 0; // Default to the first canvas

const layerOptions = document.getElementById("layerOptions");
const layerControlBtn = document.getElementById("layerControlBtn");

// Toggle layer options visibility on button click
layerControlBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent it from closing immediately
  layerOptions.classList.toggle("visible");
});

// Close the menu when clicking anywhere else on the screen
document.addEventListener("click", function (e) {
  if (!layerControlBtn.contains(e.target) && !layerOptions.contains(e.target)) {
    layerOptions.classList.remove("visible");
  }
});

// Manual method to hide menu (can be called when changing slides etc.)
function hideLayerMenu() {
  layerOptions.classList.remove("visible");
}

// Show a quick toast message
function showToast(message) {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "#333";
  toast.style.color = "#fff";
  toast.style.padding = "10px 15px";
  toast.style.borderRadius = "8px";
  toast.style.zIndex = 9999;
  toast.style.fontFamily = "Poppins, sans-serif";
  toast.style.fontSize = "14px";
  toast.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1500);
}

// Flash the object with red stroke briefly
function flashObject(obj, canvas) {
  obj.set({
    stroke: 'red',
    strokeWidth: 2
  });
  canvas.renderAll();

  setTimeout(() => {
    obj.set({ stroke: null, strokeWidth: 0 });
    canvas.renderAll();
  }, 500);
}

// Bring to front
function bringToFront() {
  const canvas = canvases[currentSlide];
  const obj = canvas.getActiveObject();
  if (obj) {
    canvas.bringToFront(obj);
    canvas.renderAll();
    flashObject(obj, canvas);
    showToast("Brought to Front");
  }
}

// Send to back
function sendToBack() {
  const canvas = canvases[currentSlide];
  const obj = canvas.getActiveObject();
  if (obj) {
    canvas.sendToBack(obj);
    canvas.renderAll();
    flashObject(obj, canvas);
    showToast("Sent to Back");
  }
}

// Send to middle
function sendToMiddle() {
  const canvas = canvases[currentSlide];
  const obj = canvas.getActiveObject();
  if (obj) {
    const objects = canvas.getObjects();
    const midIndex = Math.floor(objects.length / 2);
    canvas.remove(obj);
    canvas.insertAt(obj, midIndex);
    canvas.renderAll();
    flashObject(obj, canvas);
    showToast("Sent to Middle");
  }
}






const overlay = document.querySelector('.guides-overlay');

function updateOverlayPosition() {
  const canvasEl = canvases[currentSlide].upperCanvasEl;
  const rect = canvasEl.getBoundingClientRect();
  overlay.style.width = rect.width + "px";
  overlay.style.height = rect.height + "px";
  overlay.style.top = rect.top + window.scrollY + "px";
  overlay.style.left = rect.left + window.scrollX + "px";
}

function clearGuides() {
  overlay.innerHTML = '';
}

function drawGuideLine(x, y, orientation, label = null) {
  const line = document.createElement('div');
  line.classList.add('guide-line', orientation);
  if (orientation === 'vertical') {
    line.style.left = x + 'px';
    line.style.top = 0;
  } else {
    line.style.top = y + 'px';
    line.style.left = 0;
  }
  overlay.appendChild(line);

  if (label) {
    const lbl = document.createElement('div');
    lbl.classList.add('guide-label');
    lbl.textContent = label;

    if (orientation === 'vertical') {
      lbl.style.left = x + 'px';
      lbl.style.top = y + 'px';
    } else {
      lbl.style.left = x + 'px';
      lbl.style.top = y + 'px';
    }

    overlay.appendChild(lbl);
  }
}

function attachOverlayGuides() {
  canvases.forEach((canvas, index) => {
    canvas.on('object:moving', (e) => {
      if (index !== currentSlide) return; // only for active canvas

      clearGuides();
      updateOverlayPosition();

      const obj = e.target;
      const rect = obj.getBoundingRect();

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      // Vertical guides (left, center, right)
      if (Math.abs(rect.left) < 5) {
        drawGuideLine(rect.left, rect.top, 'vertical', 'Left: 0px');
      }
      if (Math.abs(rect.left + rect.width / 2 - canvasWidth / 2) < 5) {
        drawGuideLine(canvasWidth / 2, rect.top, 'vertical', 'Center X');
      }
      if (Math.abs(rect.left + rect.width - canvasWidth) < 5) {
        drawGuideLine(rect.left + rect.width, rect.top, 'vertical', 'Right');
      }

      // Horizontal guides (top, center, bottom)
      if (Math.abs(rect.top) < 5) {
        drawGuideLine(rect.left, rect.top, 'horizontal', 'Top: 0px');
      }
      if (Math.abs(rect.top + rect.height / 2 - canvasHeight / 2) < 5) {
        drawGuideLine(rect.left, canvasHeight / 2, 'horizontal', 'Center Y');
      }
      if (Math.abs(rect.top + rect.height - canvasHeight) < 5) {
        drawGuideLine(rect.left, rect.top + rect.height, 'horizontal', 'Bottom');
      }

      // TODO: You can add comparisons to other objects here for Canva-like spacing
    });

    canvas.on('object:modified', () => {
      clearGuides();
    });

    canvas.on('selection:cleared', () => {
      clearGuides();
    });
  });
}

// Call it after creating your canvases
attachOverlayGuides();

