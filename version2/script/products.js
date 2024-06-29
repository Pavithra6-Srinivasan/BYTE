document.addEventListener('DOMContentLoaded', () => {   
    const productsForm = document.getElementById('products-form');

    
if (productsForm) {
    // Fetch product data from the server when the page loads
    productsForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission
    fetch('/products')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Display product data on the page
            displayProducts(data);
        })
        .catch(error => {
            console.error('Error fetching product data:', error);
        });

     fetch('/products2')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Display product data on the page
            displayProducts(data);
        })
        .catch(error => {
            console.error('Error fetching product data:', error);
        });


function displayProducts(products) {
    const productList = document.getElementById('product-list');
    

    // Clear any existing product items
    productList.innerHTML = '';
   

    // Iterate over each product and create HTML elements to display them
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');

      

        const title = document.createElement('h3');
        title.textContent = product.title;

        const pricing = document.createElement('p');
        pricing.textContent = `Pricing: ${product.pricing}`;

        const colour= document.createElement('p');
        colour.textContent = `colour: ${product.colour}`;

        productItem.appendChild(title);
        productItem.appendChild(pricing);
        productItem.appendChild(colour);

        productList.appendChild(productItem);
       
    })}

  })};
});