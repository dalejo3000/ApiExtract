document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const cheapestBtn = document.getElementById('cheapestBtn');
    const expensiveBtn = document.getElementById('expensiveBtn');
    const bestRatedBtn = document.getElementById('bestRatedBtn');
    const topSellersBtn = document.getElementById('topSellersBtn');
    const averagePriceElement = document.getElementById('averagePrice');
    const resultsTable = document.getElementById('resultsTable');
    const loadingElement = document.getElementById('loading');
    const BASE_URL = 'https://fakestoreapi.com/products';
    
    // Variables globales
    let allProducts = [];
    let currentDisplayedProducts = [];

    // Función para mostrar productos en la tabla
    function displayProducts(productsToDisplay) {
        resultsTable.innerHTML = '';
        currentDisplayedProducts = productsToDisplay;
        
        if (productsToDisplay.length === 0) {
            resultsTable.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron productos</td></tr>';
            updateAveragePrice([]);
            return;
        }
        
        productsToDisplay.forEach(product => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => showProductDetails(product));
            
            row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.image || 'https://via.placeholder.com/50'}" 
                     alt="${product.title}" 
                     class="img-thumbnail" 
                     style="width: 50px; height: 50px; object-fit: contain;"
                     loading="lazy"></td>
                <td>${product.title}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td><span class="category-badge ${product.category.replace(/\s+/g, '-')}">${product.category}</span></td>
                <td>${product.rating ? `${product.rating.rate} ★ (${product.rating.count})` : 'N/A'}</td>
            `;
            resultsTable.appendChild(row);
        });
        
        updateAveragePrice(productsToDisplay);
    }

    // Función para mostrar detalles completos del producto
    function showProductDetails(product) {
        const modalTitle = document.getElementById('productModalTitle');
        const modalBody = document.getElementById('productModalBody');
        
        modalTitle.textContent = product.title;
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <img src="${product.image || 'https://via.placeholder.com/400'}" 
                         alt="${product.title}" 
                         class="img-fluid rounded mb-3 modal-img"
                         loading="lazy">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3 class="text-primary">$${product.price.toFixed(2)}</h3>
                        ${product.rating ? `
                        <div class="rating-badge bg-success text-white p-2 rounded">
                            ${product.rating.rate} ★ (${product.rating.count} opiniones)
                        </div>` : ''}
                    </div>
                    <span class="category-badge ${product.category.replace(/\s+/g, '-')}">${product.category}</span>
                </div>
                <div class="col-md-6">
                    <h5>Descripción:</h5>
                    <p>${product.description || 'Descripción no disponible'}</p>
                    

                </div>
            </div>
        `;
        
        // Mostrar el modal
        const productModal = new bootstrap.Modal(document.getElementById('productModal'));
        productModal.show();
    }

    // Función para actualizar el precio promedio
    function updateAveragePrice(products) {
        if (products.length === 0) {
            averagePriceElement.textContent = '$0.00';
            return;
        }
        
        const total = products.reduce((sum, product) => sum + product.price, 0);
        const average = total / products.length;
        averagePriceElement.textContent = `$${average.toFixed(2)}`;
    }

    // Función para buscar productos
    function searchProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        
        loadingElement.classList.remove('d-none');
        resultsTable.innerHTML = '';
        
        setTimeout(() => {
            const filteredProducts = allProducts.filter(product => 
                product.title.toLowerCase().includes(searchTerm) || 
                product.category.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
            
            displayProducts(filteredProducts);
            loadingElement.classList.add('d-none');
        }, 300);
    }

    // Función para mostrar los productos más baratos
    function showCheapest() {
        if (allProducts.length === 0) return;
        
        loadingElement.classList.remove('d-none');
        setTimeout(() => {
            const sorted = [...allProducts].sort((a, b) => a.price - b.price);
            const cheapest = sorted.slice(0, 5);
            displayProducts(cheapest);
            loadingElement.classList.add('d-none');
        }, 300);
    }

    // Función para mostrar los productos más caros
    function showExpensive() {
        if (allProducts.length === 0) return;
        
        loadingElement.classList.remove('d-none');
        setTimeout(() => {
            const sorted = [...allProducts].sort((a, b) => b.price - a.price);
            const expensive = sorted.slice(0, 5);
            displayProducts(expensive);
            loadingElement.classList.add('d-none');
        }, 300);
    }

    // Función para mostrar los productos mejor calificados
    function showBestRated() {
        if (allProducts.length === 0) return;
        
        loadingElement.classList.remove('d-none');
        setTimeout(() => {
            const sorted = [...allProducts].sort((a, b) => b.rating.rate - a.rating.rate);
            const bestRated = sorted.slice(0, 5);
            displayProducts(bestRated);
            loadingElement.classList.add('d-none');
        }, 300);
    }

    // Función para mostrar los productos más vendidos
    function showTopSellers() {
        if (allProducts.length === 0) return;
        
        loadingElement.classList.remove('d-none');
        setTimeout(() => {
            const sorted = [...allProducts].sort((a, b) => b.rating.count - a.rating.count);
            const topSellers = sorted.slice(0, 5);
            displayProducts(topSellers);
            loadingElement.classList.add('d-none');
        }, 300);
    }

    // Función para obtener un producto por ID
    async function getProductById(id) {
        try {
            loadingElement.classList.remove('d-none');
            const response = await fetch(`${BASE_URL}/${id}`);
            const product = await response.json();
            
            // Mostrar solo el producto específico
            displayProducts([product]);
            
            // También mostrar detalles en el modal
            showProductDetails(product);
        } catch (error) {
            console.error('Error al obtener el producto:', error);
            resultsTable.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar el producto</td></tr>';
        } finally {
            loadingElement.classList.add('d-none');
        }
    }

    // Función para cargar todos los productos
    async function fetchAllProducts() {
        try {
            loadingElement.classList.remove('d-none');
            const response = await fetch(BASE_URL);
            allProducts = await response.json();
            displayProducts(allProducts);
            
            // Ejemplo: Podrías cargar un producto específico por ID
            // getProductById(5);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            resultsTable.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar productos</td></tr>';
        } finally {
            loadingElement.classList.add('d-none');
        }
    }

    // Event Listeners
    searchBtn.addEventListener('click', searchProducts);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });
    cheapestBtn.addEventListener('click', showCheapest);
    expensiveBtn.addEventListener('click', showExpensive);
    
    // Si añades estos botones en tu HTML:
    // bestRatedBtn.addEventListener('click', showBestRated);
    // topSellersBtn.addEventListener('click', showTopSellers);

    // Mostrar todos los productos al cargar la página
    fetchAllProducts();
});