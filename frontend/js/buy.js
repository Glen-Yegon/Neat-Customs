
document.addEventListener("DOMContentLoaded", function () {
  const itemSection = document.getElementById("item-section");
  const displayName = document.getElementById("display-name");
  const displayPrice = document.getElementById("display-price");
  const inputs = document.querySelectorAll('.size-selection input[type="number"]');

  // 1. Display stored images (from sessionStorage, not localStorage)
  const storedImages = JSON.parse(sessionStorage.getItem("checkoutImages")) || [];

  if (storedImages.length === 0) {
    itemSection.innerHTML = "<p>No items added yet.</p>";
  } else {
    itemSection.innerHTML = "";
    storedImages.forEach((imgUrl) => {
      const imgElement = document.createElement("img");
      imgElement.src = imgUrl;
      imgElement.classList.add("order-image");
      imgElement.style.width = "150px";
      imgElement.style.margin = "10px";
      itemSection.appendChild(imgElement);
    });
  }

  // 2. Retrieve and display item name
  const itemName = localStorage.getItem("nameID") || "Unknown Item";
  displayName.textContent = `Item: ${itemName}`;

  // 3. Calculate single item total price (item + shipping)
  const itemPriceRaw = localStorage.getItem("priceID") || "0";
  const itemPrice = parseFloat(itemPriceRaw.replace(/Kshs\.?|,/g, "").trim()) || 0;

  const shippingFeeText = document.getElementById("shipping-fee")?.textContent || "KSh 0";
  const shippingFee = parseFloat(shippingFeeText.replace(/KSh|,/g, "").trim()) || 0;

  const basePrice = itemPrice + shippingFee;

  // 4. Display base price initially
  displayPrice.textContent = `Price: Kshs. ${basePrice.toFixed(2)}`;

function updateDisplayedPrice() {
  let totalItems = 0;
  inputs.forEach(input => {
    totalItems += parseInt(input.value) || 0;
  });

  if (totalItems <= 1) {
    displayPrice.textContent = `Price: Kshs. ${basePrice.toFixed(2)}`;
  } else {
    const totalCost = basePrice * totalItems;
    displayPrice.textContent = `Price: Kshs. ${totalCost.toFixed(2)}`;
  }
}


  // 6. Listen for changes
  inputs.forEach(input => {
    input.addEventListener("input", updateDisplayedPrice);
  });

  // 7. Run on load just in case
  updateDisplayedPrice();
});

// Place this after the DOMContentLoaded logic
const shippingElement = document.getElementById("shipping-fee");
if (shippingElement) {
  const observer = new MutationObserver(() => {
    // Recalculate and update final price
    const updatedShipping = parseFloat(shippingElement.textContent.replace(/KSh|,/g, '').trim()) || 0;
    const itemPrice = parseFloat(localStorage.getItem("priceID").replace(/Kshs\.?|,/g, "").trim()) || 0;
    const finalTotal = itemPrice + updatedShipping;
    document.getElementById("display-price").textContent = `Price: Kshs. ${finalTotal.toFixed(2)}`;
  });

  observer.observe(shippingElement, { childList: true, characterData: true, subtree: true });
}





  function generateFields(containerId, count, placeholder) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear previous fields
  
    for (let i = 1; i <= count; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = `${placeholder} ${i}`;
      container.appendChild(input);
    }
  }
  

  // Example of valid discount codes and their corresponding discounts
const validDiscountCodes = {
    'DISCOUNT10': 0.1,  // 10% discount
    'DISCOUNT20': 0.2,  // 20% discount
  };
  
  // Get the elements
  const applyDiscountButton = document.getElementById('apply-discount-btn');
  const discountCodeInput = document.getElementById('discount-code');
  const displayName = document.getElementById('display-name');
  const displayPrice = document.getElementById('display-price');
  
  // Retrieve the item name and price from localStorage
  const itemName = localStorage.getItem('nameID');
  const itemPrice = parseFloat(localStorage.getItem('priceID')); // Ensure it's a number
  
  // Display the retrieved name and price
  if (itemName && itemPrice) {
    displayName.textContent = itemName;
    displayPrice.textContent = `Price: Kshs. ${itemPrice.toFixed(2)}`;
  } else {
    displayName.textContent = "Item not found!";
    displayPrice.textContent = "Price not available";
  }
  
  // Function to apply discount
  applyDiscountButton.addEventListener('click', () => {
    const discountCode = discountCodeInput.value.trim(); // Get the discount code entered by the user
    let discountedPrice = itemPrice; // Default discounted price is the original price
  
    // Check if the entered discount code is valid
    if (validDiscountCodes[discountCode]) {
      const discountPercentage = validDiscountCodes[discountCode]; // Get the discount percentage
      discountedPrice = itemPrice * (1 - discountPercentage); // Apply the discount
  
      // Update the price display with the discounted price
      displayPrice.textContent = `Price: Kshs. ${discountedPrice.toFixed(2)}`; // Show the discounted price
    } else {
      alert('Invalid Discount Code!'); // Alert user if discount code is invalid
    }
  });



  // Function to display item details and trigger design selection
  function updateDisplay() {
    const displayName = document.getElementById("display-name");
    const displayPrice = document.getElementById("display-price");
  
    // Retrieve item details from localStorage
    const itemName = localStorage.getItem("nameID");
    const itemPrice = parseFloat(localStorage.getItem("priceID"));
  
    // Display the item name and price
    if (itemName && itemPrice) {
      displayName.textContent = itemName;
      displayPrice.textContent = `Price: Kshs. ${itemPrice.toFixed(2)}`;
  
    } else {
      displayName.textContent = "Item not found!";
      displayPrice.textContent = "Price not available";
    }
  }
  
  // Run updateDisplay when the page loads
  window.onload = updateDisplay;

  // Handle payment method selection using images
  const paymentMethods = document.querySelectorAll('.payment-method');
  
  paymentMethods.forEach(method => {
    method.addEventListener('click', function() {
      // Remove selected class from all payment methods
      paymentMethods.forEach(m => m.classList.remove('selected'));
  
      // Add selected class to the clicked method
      method.classList.add('selected');
    });
  });
  
  
  // Select the radio buttons and address containers
  const sameAsShippingRadio = document.getElementById('same-as-shipping');
  const differentBillingRadio = document.getElementById('different-billing');
  const sameAddressContainer = document.getElementById('same-address-container');
  const differentAddressContainer = document.getElementById('different-address-container');
  
  // Add event listeners to toggle the visibility of address forms
  sameAsShippingRadio.addEventListener('change', function() {
    if (this.checked) {
      sameAddressContainer.style.display = 'block';
      differentAddressContainer.style.display = 'none';
    }
  });
  
  differentBillingRadio.addEventListener('change', function() {
    if (this.checked) {
      sameAddressContainer.style.display = 'none';
      differentAddressContainer.style.display = 'block';
    }
  });
  
  // Initial check for default behavior (Same as shipping address)
  if (sameAsShippingRadio.checked) {
    sameAddressContainer.style.display = 'block';
    differentAddressContainer.style.display = 'none';
  }



  function goBack() {
    history.back();
  }



  /*
document.getElementById('mpesa-btn').addEventListener('click', () => {
  document.getElementById('payment-modal').style.display = 'block';
});

// When the user clicks "Cancel", hide the modal.
document.getElementById('cancel-payment').addEventListener('click', () => {
  document.getElementById('payment-modal').style.display = 'none';
});

document.getElementById('submit-payment').addEventListener('click', async () => {
  const phone = document.getElementById('phoneNo').value.trim();
  const amount = document.getElementById('amount').value.trim();
  
  // Get the displayed price from the element with id "display-price"
  const displayPriceElem = document.getElementById('display-price');
  const displayPriceText = displayPriceElem ? displayPriceElem.innerText.trim() : "";
  
  // Use regex to extract the first valid number from the displayed price text
  const match = displayPriceText.match(/(\d+(?:\.\d+)?)/);
  const numericDisplayPrice = match ? parseFloat(match[0]) : 0;
  
  const numericAmount = parseFloat(amount);
  
  console.log("Entered amount:", numericAmount);
  console.log("Displayed price:", numericDisplayPrice, "Raw text:", displayPriceText);
  
  if (!phone || !amount) {
    alert("Please enter your phone number and ensure the amount is available.");
    return;
  }
  
  // Check if the entered amount matches the displayed price with a tolerance (if needed)
  const tolerance = 0.01;
  if (Math.abs(numericAmount - numericDisplayPrice) > tolerance) {
    alert("The amount entered does not match the displayed price. Please check the amount.");
    return;
  }
  
  try {
    const response = await fetch('https://neatgarms-risi.onrender.com/paynow4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, amount })
    });
    
    const data = await response.json();
    console.log("Payment Initiated:", data);
    
    if (data.ResponseCode === "0") {
      alert("Please check your phone to complete the payment by entering your MPesa PIN.");
    } else {
      alert("Payment initiation failed. Please try again.");
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    alert("An error occurred while submitting the form.");
  }
  
  document.getElementById('payment-modal').style.display = 'none';
});
*/


/*
const cityInput = document.getElementById('delivery-city');
  const nairobiAreasDiv = document.getElementById('nairobi-areas');
  const nairobiSubareaSelect = document.getElementById('nairobi-subarea');
  const shippingFeeDisplay = document.getElementById('shipping-fee');

  const cityFees = {
    Nakuru: 500,
    Kisumu: 800,
    Machakos: 400,
    Naivasha: 450,
    Nyeri: 500,
    Nanyuki: 500,
    Embu: 500,
    Narok: 500,
    Meru: 600,
    Kakamega: 800,
    Kitale: 800,
    Eldoret: 800,
    Kericho: 800,
    Mombasa: 800,
  };

  const nairobiFees = {
    "Lang'ata": 250,
    "Nairobi CBD": 250,
    "Westlands": 320,
    "Kilimani": 280,
    "Kileleshwa": 340,
    "South B": 250,
    "South C": 250,
    "Upper Hill": 250,
    "Karen": 1,
    "Rongai Tuskeys": 760,
    "JKIA": 660,
    "Syokimau": 720,
    "Ruaka (reference)": 700,
  };


  function updateShippingFee(fee) {
    shippingFeeDisplay.textContent = ` ${fee}`;
  }

  cityInput.addEventListener('input', function () {
    const city = cityInput.value.trim().toLowerCase();

    if (city === 'nairobi') {
      nairobiAreasDiv.style.display = 'block';
      updateShippingFee(0);
    } else {
      nairobiAreasDiv.style.display = 'none';
      const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
      const fee = cityFees[formattedCity] || 0;
      updateShippingFee(fee);
    }
  });

  nairobiSubareaSelect.addEventListener('change', function () {
    const selectedArea = nairobiSubareaSelect.value;
    const fee = nairobiFees[selectedArea] || 0;
    updateShippingFee(fee);

  });
  */