// --- EVENT-DRIVEN PROGRAMMING PROJECT: GearVault ---
// Group 3 | 31-ITE-07

document.addEventListener('DOMContentLoaded', () => {
    // Current Logged-in User State
    let currentUser = JSON.parse(localStorage.getItem('gearVault_currentUser')) || null;

    // DOM Elements - Navigation & Views
    const sidebarNav = document.getElementById('sidebar-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const viewSections = document.querySelectorAll('.view-section');
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    
    // Auth DOM Elements
    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toSignupLink = document.getElementById('to-signup');
    const toLoginLink = document.getElementById('to-login');
    const logoutBtn = document.getElementById('logout-btn');

    // App DOM Elements
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const gearModal = document.getElementById('gear-modal');
    const gearForm = document.getElementById('gear-form');
    const inventoryTableBody = document.getElementById('inventory-table-body');
    const wishlistGrid = document.getElementById('wishlist-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const clearSearchBtn = document.getElementById('clear-search');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const settingsClearBtn = document.getElementById('settings-clear-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const exportBtn = document.getElementById('export-btn');
    const saveAccountBtn = document.getElementById('save-account-btn');
    const moveAllInventoryBtn = document.getElementById('move-all-inventory-btn');

    // Initialize UI Based on Auth State
    function checkAuthState() {
        if (currentUser) {
            sidebarNav.style.display = 'flex';
            loginView.classList.remove('active');
            dashboardView.classList.add('active');
            
            // Set settings inputs
            document.getElementById('settings-name').value = currentUser.name || '';
            document.getElementById('settings-email').value = currentUser.email || '';
            document.getElementById('user-display-name').textContent = currentUser.name || currentUser.email;

            renderAll();
        } else {
            sidebarNav.style.display = 'none';
            viewSections.forEach(sec => sec.classList.remove('active'));
            loginView.classList.add('active');
            loginBox.style.display = 'block';
            signupBox.style.display = 'none';
        }
    }

    // Auth Switch Events
    toSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginBox.style.display = 'none';
        signupBox.style.display = 'block';
    });

    toLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupBox.style.display = 'none';
        loginBox.style.display = 'block';
    });

    // Signup Form Event
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-pass').value;

        let users = JSON.parse(localStorage.getItem('gearVault_users')) || [];
        if (users.some(u => u.email === email)) {
            alert('An account with this email already exists.');
            return;
        }

        const newUser = { name, email, password, items: [], activities: ['Account created successfully.'] };
        users.push(newUser);
        localStorage.setItem('gearVault_users', JSON.stringify(users));

        currentUser = newUser;
        localStorage.setItem('gearVault_currentUser', JSON.stringify(currentUser));
        signupForm.reset();
        checkAuthState();
    });

    // Login Form Event
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifier = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-pass').value;

        let users = JSON.parse(localStorage.getItem('gearVault_users')) || [];
        const user = users.find(u => (u.email === identifier || u.name === identifier) && u.password === password);

        if (!user) {
            alert('Invalid email/username or password.');
            return;
        }

        currentUser = user;
        localStorage.setItem('gearVault_currentUser', JSON.stringify(currentUser));
        loginForm.reset();
        checkAuthState();
    });

    // Logout Event
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentUser = null;
        localStorage.removeItem('gearVault_currentUser');
        checkAuthState();
    });

    // 1. Navigation Event Handling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.id === 'logout-btn') return;
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            viewSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            renderAll();
        });
    });

    // 2. Modal Event Handling
    openModalBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Gear';
        gearForm.reset();
        document.getElementById('gear-id').value = '';
        gearModal.classList.add('open');
    });

    const closeModal = () => gearModal.classList.remove('open');
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    // 3. Form Submit / Validation Event
    gearForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('gear-id').value;
        const name = document.getElementById('gear-name').value.trim();
        const category = document.getElementById('gear-category').value;
        const price = parseFloat(document.getElementById('gear-price').value);
        const condition = document.getElementById('gear-condition').value;
        const statusEl = document.querySelector('input[name="gear-status"]:checked');

        if (!name || !category || isNaN(price) || !condition || !statusEl) {
            alert('Please fill out all required fields correctly.');
            return;
        }

        const status = statusEl.value;

        if (!currentUser.items) currentUser.items = [];
        if (!currentUser.activities) currentUser.activities = [];

        if (id) {
            currentUser.items = currentUser.items.map(item => item.id == id ? { ...item, name, category, price, condition, status } : item);
            currentUser.activities.unshift(`Updated gear item: ${name}`);
        } else {
            const newItem = { id: Date.now(), name, category, price, condition, status };
            currentUser.items.push(newItem);
            currentUser.activities.unshift(`Added ${name} to ${status}`);
        }

        saveAndRefresh();
        closeModal();
    });

    // 4. Search and Filter Events
    searchInput.addEventListener('input', renderAll);
    categoryFilter.addEventListener('change', renderAll);
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        renderAll();
    });

    // 5. Delete & Status Toggle Events (Delegated)
    inventoryTableBody.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this gear item?')) {
                const item = currentUser.items.find(i => i.id == id);
                if (item) {
                    currentUser.activities.unshift(`Deleted ${item.name}`);
                }
                currentUser.items = currentUser.items.filter(item => item.id != id);
                saveAndRefresh();
            }
        } else if (e.target.classList.contains('edit-btn')) {
            const item = currentUser.items.find(i => i.id == id);
            if (item) {
                document.getElementById('modal-title').textContent = 'Edit Gear';
                document.getElementById('gear-id').value = item.id;
                document.getElementById('gear-name').value = item.name;
                document.getElementById('gear-category').value = item.category;
                document.getElementById('gear-price').value = item.price;
                document.getElementById('gear-condition').value = item.condition;
                document.querySelector(`input[name="gear-status"][value="${item.status}"]`).checked = true;
                gearModal.classList.add('open');
            }
        }
    });

    // Wishlist Move to Inventory Event
    wishlistGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('move-btn')) {
            const id = e.target.getAttribute('data-id');
            currentUser.items = currentUser.items.map(i => {
                if (i.id == id) {
                    currentUser.activities.unshift(`Moved ${i.name} to Inventory`);
                    return { ...i, status: 'Owned' };
                }
                return i;
            });
            saveAndRefresh();
        }
    });

    // Move All Wishlist to Inventory
    moveAllInventoryBtn.addEventListener('click', () => {
        if (confirm('Move all wishlist items to inventory?')) {
            currentUser.items = currentUser.items.map(i => {
                if (i.status === 'Wishlist') {
                    return { ...i, status: 'Owned' };
                }
                return i;
            });
            currentUser.activities.unshift('Moved all wishlist items to inventory');
            saveAndRefresh();
        }
    });

    // Clear All Events
    const clearAllData = () => {
        if (confirm('Clear all saved gear records? This cannot be undone.')) {
            currentUser.items = [];
            currentUser.activities.unshift('Cleared all inventory data');
            saveAndRefresh();
        }
    };
    clearAllBtn.addEventListener('click', clearAllData);
    settingsClearBtn.addEventListener('click', clearAllData);

    // Save Account Settings
    saveAccountBtn.addEventListener('click', () => {
        const newName = document.getElementById('settings-name').value.trim();
        const newEmail = document.getElementById('settings-email').value.trim();
        if (!newName || !newEmail) {
            alert('Fields cannot be empty.');
            return;
        }
        currentUser.name = newName;
        currentUser.email = newEmail;
        currentUser.activities.unshift('Updated account profile');
        document.getElementById('user-display-name').textContent = newName;
        saveAndRefresh();
        alert('Account settings updated successfully!');
    });

    // Export Inventory as JSON File
    exportBtn.addEventListener('click', () => {
        if (!currentUser.items || currentUser.items.length === 0) {
            alert('No inventory data to export.');
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUser.items, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "gearvault_inventory.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        currentUser.activities.unshift('Exported inventory data');
        saveAndRefresh();
    });

    // Dark Mode Toggle Event
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    });

    // Core Data & DOM Rendering Engine
    function saveAndRefresh() {
        let users = JSON.parse(localStorage.getItem('gearVault_users')) || [];
        users = users.map(u => u.email === currentUser.email ? currentUser : u);
        localStorage.setItem('gearVault_users', JSON.stringify(users));
        localStorage.setItem('gearVault_currentUser', JSON.stringify(currentUser));
        renderAll();
    }

    function renderAll() {
        if (!currentUser) return;
        const gearItems = currentUser.items || [];
        const activities = currentUser.activities || [];

        const query = (searchInput.value || '').trim().toLowerCase();
        const selectedCat = categoryFilter.value || 'All';

        const filteredItems = gearItems.filter(item => {
            const itemName = (item.name || '').toLowerCase();
            const itemCategory = (item.category || '').toLowerCase();
            const matchesQuery = !query || itemName.includes(query) || itemCategory.includes(query);
            const matchesCat = selectedCat === 'All' || item.category === selectedCat;
            return matchesQuery && matchesCat;
        });

        // 1. Render Inventory Table (Strictly Owned items only)
        const ownedOnlyItems = filteredItems.filter(i => i.status === 'Owned');
        const filteredOwned = ownedOnlyItems;

        inventoryTableBody.innerHTML = '';
        if (filteredOwned.length === 0) {
            inventoryTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No owned gear found.</td></tr>`;
        } else {
            filteredOwned.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>₱${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>${item.condition}</td>
                    <td><span class="badge owned">Owned</span></td>
                    <td>
                        <button class="edit-btn secondary-btn" data-id="${item.id}">Edit</button>
                        <button class="delete-btn danger-btn" data-id="${item.id}" style="margin-top:0;">Delete</button>
                    </td>
                `;
                inventoryTableBody.appendChild(tr);
            });
        }

        // 2. Render Wishlist Grid
        const wishlistItems = filteredItems.filter(i => i.status === 'Wishlist');
        wishlistGrid.innerHTML = '';
        if (wishlistItems.length === 0) {
            wishlistGrid.innerHTML = `<p>No items in wishlist.</p>`;
        } else {
            wishlistItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'stat-card';
                card.innerHTML = `
                    <h4>${item.name}</h4>
                    <p>${item.category}</p>
                    <p>₱${item.price.toLocaleString()}</p>
                    <button class="primary-btn move-btn" data-id="${item.id}" style="margin-top:10px;">Move to Inventory</button>
                `;
                wishlistGrid.appendChild(card);
            });
        }
        document.getElementById('wishlist-count').textContent = wishlistItems.length;

        // 3. Render Gear by Category Widget
        const categoryBreakdownList = document.getElementById('category-breakdown-list');
        const analyticsCategoryList = document.getElementById('analytics-category-list');
        
        const categories = ['CPU', 'GPU', 'Audio', 'Peripherals', 'Monitor'];
        let catHtml = '';
        let hasCategories = false;

        categories.forEach(cat => {
            const count = filteredItems.filter(i => i.category === cat).length;
            if (count > 0) {
                hasCategories = true;
                catHtml += `<p><strong>${cat}:</strong> ${count} item(s)</p>`;
            }
        });

        if (!hasCategories) {
            categoryBreakdownList.innerHTML = 'No data recorded yet.';
            analyticsCategoryList.innerHTML = 'No data.';
        } else {
            categoryBreakdownList.innerHTML = catHtml;
            analyticsCategoryList.innerHTML = catHtml;
        }

        // 4. Render Recent Activity Widget
        const recentActivityList = document.getElementById('recent-activity-list');
        recentActivityList.innerHTML = '';
        if (activities.length === 0) {
            recentActivityList.innerHTML = `<li>No recent activity.</li>`;
        } else {
            activities.slice(0, 5).forEach(act => {
                const li = document.createElement('li');
                li.textContent = act;
                recentActivityList.appendChild(li);
            });
        }

        // 5. Update Statistics & Analytics Numbers
        const totalItems = filteredItems.length;
        const ownedItems = ownedOnlyItems.length;
        const wishlistCount = wishlistItems.length;
        const totalValue = filteredItems.reduce((sum, i) => sum + i.price, 0);
        const ownedBudget = ownedOnlyItems.reduce((sum, i) => sum + i.price, 0);
        const wishlistTotal = wishlistItems.reduce((sum, i) => sum + i.price, 0);

        document.getElementById('stat-total').textContent = totalItems;
        document.getElementById('stat-owned').textContent = ownedItems;
        document.getElementById('stat-wishlist').textContent = wishlistCount;
        document.getElementById('stat-value').textContent = `₱${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

        document.getElementById('summary-owned-budget').textContent = `₱${ownedBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        document.getElementById('summary-wishlist-total').textContent = `₱${wishlistTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

        document.getElementById('analytics-total').textContent = totalItems;
        document.getElementById('analytics-owned').textContent = ownedItems;
        document.getElementById('analytics-wishlist').textContent = wishlistCount;
        document.getElementById('analytics-owned-budget').textContent = `₱${ownedBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        document.getElementById('analytics-wishlist-total').textContent = `₱${wishlistTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        document.getElementById('analytics-total-value').textContent = `₱${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }

    // Run Initial Auth Check on Load
    checkAuthState();
});