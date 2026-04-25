// Add Image Page Logic
if (document.getElementById('addImageForm')) {
    const addForm = document.getElementById('addImageForm');
    const pwdInput = document.getElementById('addImgPassword');
    const errorMsg = document.getElementById('addImgError');
    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const url = document.getElementById('imgUrl').value.trim();
        const caption = document.getElementById('imgCaption').value.trim();
        const pwd = pwdInput.value.trim();
        if (!url || !caption || !pwd) return;
        if (pwd !== '123') {
            errorMsg.style.display = 'block';
            return;
        }
        errorMsg.style.display = 'none';
        let imgs = JSON.parse(localStorage.getItem('userImages') || '[]');
        imgs.push({ url, caption });
        localStorage.setItem('userImages', JSON.stringify(imgs));
        window.location.href = 'index.html';
    });
}
// Gallery Page Logic
let cardToDelete = null;
if (document.getElementById('images')) {
    function addCard(url, caption, name) {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.innerHTML = `
            <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
            <img src="${url}" alt="${name || 'User Image'}" data-desc="${caption}">
            <div class="caption-overlay">
                <h3>${name || 'User Image'}</h3>
                <p>${caption}</p>
            </div>
        `;
        return card;
    }
    // For user images, name is the caption
    const imgs = JSON.parse(localStorage.getItem('userImages') || '[]');
    const imagesDiv = document.getElementById('images');
    imgs.forEach((img, idx) => {
        const card = addCard(img.url, img.caption, img.caption);
        card.setAttribute('data-user-img', 'true');
        card.setAttribute('data-user-idx', idx);
        imagesDiv.appendChild(card);
    });
    // Modal elements
    const modal = document.getElementById('deleteModal');
    const pwdInput = document.getElementById('deletePassword');
    const confirmBtn = document.getElementById('deleteConfirm');
    const cancelBtn = document.getElementById('deleteCancel');
    const errorMsg = document.getElementById('deleteError');
    // Show modal
    function showModal(card) {
        cardToDelete = card;
        pwdInput.value = '';
        errorMsg.style.display = 'none';
        modal.classList.add('active');
        pwdInput.focus();
    }
    // Hide modal
    function hideModal() {
        modal.classList.remove('active');
        cardToDelete = null;
    }
    // Handle delete logic
    imagesDiv.addEventListener('click', function(e) {
        if (e.target.closest('.delete-btn')) {
            const card = e.target.closest('.gallery-card');
            showModal(card);
            return;
        }
        // View image logic
        const img = e.target.closest('img');
        if (img && !e.target.closest('.delete-btn')) {
            // Get name from h3 in the same card
            let name = 'Image';
            let desc = img.getAttribute('data-desc');
            if (!desc || desc.trim() === '') {
                desc = img.alt || 'No description available.';
            }
            const card = img.closest('.gallery-card');
            if (card) {
                const h3 = card.querySelector('.caption-overlay h3');
                if (h3) name = h3.textContent.trim();
            } else {
                name = img.alt;
            }
            // Debug log
            console.log('Saving to viewImage:', {url: img.src, desc, name});
            localStorage.setItem('viewImage', JSON.stringify({
                url: img.src,
                desc: desc,
                name: name
            }));
            window.location.href = 'view-image.html';
        }
    });
    // Confirm delete
    confirmBtn.addEventListener('click', function() {
        if (pwdInput.value === '123') {
            if (cardToDelete) {
                if (cardToDelete.getAttribute('data-user-img')) {
                    let imgs = JSON.parse(localStorage.getItem('userImages') || '[]');
                    const idx = parseInt(cardToDelete.getAttribute('data-user-idx'));
                    imgs.splice(idx, 1);
                    localStorage.setItem('userImages', JSON.stringify(imgs));
                    cardToDelete.remove();
                    window.location.reload();
                } else {
                    cardToDelete.style.display = 'none';
                }
            }
            hideModal();
        } else {
            errorMsg.style.display = 'block';
        }
    });
    // Cancel delete
    cancelBtn.addEventListener('click', function() {
        hideModal();
    });
    // Close modal on Escape
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hideModal();
    });
}

// Gallery Filter and Sort Functionality
if (document.getElementById('images')) {
    const galleryGrid = document.getElementById('images');
    const resultsCount = document.getElementById('resultsCount');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const filterSidebar = document.querySelector('.filter-sidebar');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    let currentFilters = {
        categories: [],
        colors: [],
        sort: 'default'
    };
    
    // Initialize filter functionality
    function initFilters() {
        // Category filters
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('change', updateFilters);
        });
        
        // Color filters
        const colorFilters = document.querySelectorAll('.color-filter');
        colorFilters.forEach(filter => {
            filter.addEventListener('change', updateFilters);
        });
        
        // Sort filters
        const sortFilters = document.querySelectorAll('.sort-filter');
        sortFilters.forEach(filter => {
            filter.addEventListener('change', updateFilters);
        });
        
        // Clear filters
        clearFiltersBtn.addEventListener('click', clearAllFilters);
        
        // Toggle sidebar (mobile)
        toggleSidebarBtn.addEventListener('click', toggleSidebar);
        
        // View options
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                viewBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const view = this.getAttribute('data-view');
                if (view === 'list') {
                    galleryGrid.classList.add('list-view');
                } else {
                    galleryGrid.classList.remove('list-view');
                }
            });
        });
    }
    
    // Update filters and apply them
    function updateFilters() {
        // Get selected categories
        currentFilters.categories = Array.from(document.querySelectorAll('.category-filter:checked'))
            .map(filter => filter.value);
        
        // Get selected colors
        currentFilters.colors = Array.from(document.querySelectorAll('.color-filter:checked'))
            .map(filter => filter.value);
        
        // Get selected sort
        const selectedSort = document.querySelector('.sort-filter:checked');
        currentFilters.sort = selectedSort ? selectedSort.value : 'default';
        
        applyFilters();
    }
    
    // Apply filters to gallery cards
    function applyFilters() {
        const cards = document.querySelectorAll('.gallery-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const cardCategories = card.getAttribute('data-category')?.split(' ') || [];
            const cardColors = card.getAttribute('data-color')?.split(' ') || [];
            
            let shouldShow = true;
            
            // Apply category filters
            if (currentFilters.categories.length > 0) {
                const hasMatchingCategory = currentFilters.categories.some(cat => 
                    cardCategories.includes(cat)
                );
                if (!hasMatchingCategory) shouldShow = false;
            }
            
            // Apply color filters
            if (currentFilters.colors.length > 0) {
                const hasMatchingColor = currentFilters.colors.some(color => 
                    cardColors.includes(color)
                );
                if (!hasMatchingColor) shouldShow = false;
            }
            
            // Apply visibility
            if (shouldShow) {
                card.classList.remove('filtered-out');
                card.classList.add('filtered-in');
                visibleCount++;
            } else {
                card.classList.add('filtered-out');
                card.classList.remove('filtered-in');
            }
        });
        
        // Update results count
        updateResultsCount(visibleCount);
        
        // Apply sorting
        applySorting();
    }
    
    // Apply sorting to visible cards
    function applySorting() {
        const cards = Array.from(document.querySelectorAll('.gallery-card:not(.filtered-out)'));
        
        cards.sort((a, b) => {
            const aTitle = a.querySelector('.caption-overlay h3').textContent;
            const bTitle = b.querySelector('.caption-overlay h3').textContent;
            
            switch (currentFilters.sort) {
                case 'name':
                    return aTitle.localeCompare(bTitle);
                case 'name-desc':
                    return bTitle.localeCompare(aTitle);
                default:
                    return 0; // Keep original order
            }
        });
        
        // Reorder cards in DOM
        cards.forEach(card => {
            galleryGrid.appendChild(card);
        });
    }
    
    // Update results count display
    function updateResultsCount(count) {
        const totalCards = document.querySelectorAll('.gallery-card').length;
        if (count === totalCards) {
            resultsCount.textContent = `Showing all ${count} images`;
        } else {
            resultsCount.textContent = `Showing ${count} of ${totalCards} images`;
        }
    }
    
    // Clear all filters
    function clearAllFilters() {
        // Uncheck all checkboxes
        document.querySelectorAll('.category-filter, .color-filter').forEach(filter => {
            filter.checked = false;
        });
        
        // Reset sort to default
        const defaultSort = document.querySelector('.sort-filter[value="default"]');
        if (defaultSort) defaultSort.checked = true;
        
        // Reset filters
        currentFilters = {
            categories: [],
            colors: [],
            sort: 'default'
        };
        
        // Apply changes
        applyFilters();
    }
    
    // Toggle sidebar on mobile
    function toggleSidebar() {
        filterSidebar.classList.toggle('active');
    }
    
    // Close sidebar when clicking outside (mobile)
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!filterSidebar.contains(e.target) && !toggleSidebarBtn.contains(e.target)) {
                filterSidebar.classList.remove('active');
            }
        }
    });
    
    // Initialize filters when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFilters);
    } else {
        initFilters();
    }
}

// Add description field to add-image-form if it doesn't exist
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('#add-image-form');
  if (form && !document.getElementById('description')) {
    const descLabel = document.createElement('label');
    descLabel.setAttribute('for', 'description');
    descLabel.textContent = 'Description:';
    const descInput = document.createElement('textarea');
    descInput.id = 'description';
    descInput.name = 'description';
    descInput.rows = 3;
    descInput.required = true;
    form.insertBefore(descLabel, form.lastElementChild);
    form.insertBefore(descInput, form.lastElementChild);
  }
});

function saveImage() {
  const title = document.getElementById('title').value;
  const url = document.getElementById('url').value;
  const description = document.getElementById('description').value;
  const images = JSON.parse(localStorage.getItem('images') || '[]');
  images.push({ title, url, description });
  localStorage.setItem('images', JSON.stringify(images));
}

function showImageDetails(index) {
  const images = JSON.parse(localStorage.getItem('images') || '[]');
  const img = images[index];
  document.getElementById('image-title').textContent = img.title;
  document.getElementById('image-url').src = img.url;
  document.getElementById('image-description').textContent = img.description;
}
