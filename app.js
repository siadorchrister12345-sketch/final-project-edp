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

    // Projects & Tasks DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const projectForm = document.getElementById('project-form');
    const projectNameInput = document.getElementById('project-name-input');

    // Build & Audio Tools DOM Elements
    const psuCapacityInput = document.getElementById('psu-capacity-input');
    const savePsuBtn = document.getElementById('save-psu-btn');
    const enclosureForm = document.getElementById('enclosure-form');
    const enclosureResult = document.getElementById('enclosure-result');

    // Initialize UI Based on Auth State
    function checkAuthState() {
        if (currentUser) {
            if (!currentUser.psuCapacity) currentUser.psuCapacity = 650;
            sidebarNav.style.display = 'flex';
            loginView.classList.remove('active');
            dashboardView.classList.add('active');

            document.getElementById('settings-name').value = currentUser.name || '';
            document.getElementById('settings-email').value = currentUser.email || '';
            document.getElementById('user-display-name').textContent = currentUser.name || currentUser.email;
            psuCapacityInput.value = currentUser.psuCapacity;

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

        const newUser = {
            name,
            email,
            password,
            psuCapacity: 650,
            items: [],
            tasks: [{ id: 1, text: 'Clean the computer dust filters', completed: false }],
            projects: [
                { id: 1, name: '4L Custom Speaker Enclosure', status: 'Ongoing' }
            ],
            activities: ['Account created successfully. System initialized.']
        };

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

    // Navigation Event Handling
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

    // Modal Event Handling
    openModalBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Gear';
        gearForm.reset();
        document.getElementById('gear-id').value = '';
        gearModal.classList.add('open');
    });

    const closeModal = () => gearModal.classList.remove('open');
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    // Form Submit / Validation Event
    gearForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('gear-id').value;
        const name = document.getElementById('gear-name').value.trim();
        const category = document.getElementById('gear-category').value;
        const price = parseFloat(document.getElementById('gear-price').value);
        const condition = document.getElementById('gear-condition').value;
        const wattage = parseFloat(document.getElementById('gear-wattage').value) || 0;
        const platform = document.getElementById('gear-platform').value;
        const description = document.getElementById('gear-desc').value.trim();
        const statusEl = document.querySelector('input[name="gear-status"]:checked');

        if (!name || !category || isNaN(price) || !condition || !statusEl) {
            alert('Please fill out all required fields correctly.');
            return;
        }

        const status = statusEl.value;

        if (!currentUser.items) currentUser.items = [];
        if (!currentUser.activities) currentUser.activities = [];

        if (id) {
            currentUser.items = currentUser.items.map(item =>
                item.id == id ? { ...item, name, category, price, condition, wattage, platform, description, status } : item
            );
            currentUser.activities.unshift(`Updated gear item: ${name}`);
        } else {
            const newItem = { id: Date.now(), name, category, price, condition, wattage, platform, description, status };
            currentUser.items.push(newItem);
            currentUser.activities.unshift(`Added ${name} to ${status}`);
        }

        saveAndRefresh();
        closeModal();
    });

    // Search and Filter Events
    searchInput.addEventListener('input', renderAll);
    categoryFilter.addEventListener('change', renderAll);
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        renderAll();
    });

    // Delete & Edit Events (Delegated)
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
                document.getElementById('gear-wattage').value = item.wattage || '';
                document.getElementById('gear-platform').value = item.platform || '';
                document.getElementById('gear-desc').value = item.description || '';
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

    // Task Queue Event Handlers
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return;
        if (!currentUser.tasks) currentUser.tasks = [];
        currentUser.tasks.push({ id: Date.now(), text, completed: false });
        currentUser.activities.unshift(`Added task: ${text}`);
        taskInput.value = '';
        saveAndRefresh();
    });

    taskList.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (e.target.classList.contains('toggle-task')) {
            currentUser.tasks = currentUser.tasks.map(t => t.id == id ? { ...t, completed: !t.completed } : t);
            saveAndRefresh();
        } else if (e.target.classList.contains('delete-task')) {
            currentUser.tasks = currentUser.tasks.filter(t => t.id != id);
            saveAndRefresh();
        }
    });

    // Ongoing & Completed Projects Event Handlers
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = projectNameInput.value.trim();
        if (!name) return;
        if (!currentUser.projects) currentUser.projects = [];
        currentUser.projects.push({ id: Date.now(), name, status: 'Ongoing' });
        currentUser.activities.unshift(`Started new project: ${name}`);
        projectNameInput.value = '';
        saveAndRefresh();
    });

    document.getElementById('projects-view').addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (e.target.classList.contains('complete-proj')) {
            currentUser.projects = currentUser.projects.map(p => p.id == id ? { ...p, status: 'Completed' } : p);
            currentUser.activities.unshift(`Completed project build ID: ${id}`);
            saveAndRefresh();
        } else if (e.target.classList.contains('delete-proj')) {
            currentUser.projects = currentUser.projects.filter(p => p.id != id);
            saveAndRefresh();
        }
    });

    // PSU Capacity Update Handler
    savePsuBtn.addEventListener('click', () => {
        const cap = parseFloat(psuCapacityInput.value);
        if (isNaN(cap) || cap <= 0) {
            alert('Please enter a valid PSU wattage.');
            return;
        }
        currentUser.psuCapacity = cap;
        currentUser.activities.unshift(`Updated PSU rating to ${cap}W`);
        saveAndRefresh();
    });

    // DIY Audio Enclosure Volume Estimator Handler
    enclosureForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const l = parseFloat(document.getElementById('enc-length').value);
        const w = parseFloat(document.getElementById('enc-width').value);
        const h = parseFloat(document.getElementById('enc-height').value);

        if (isNaN(l) || isNaN(w) || isNaN(h) || l <= 0 || w <= 0 || h <= 0) {
            alert('Enter valid positive numbers for dimensions.');
            return;
        }

        // Convert cm^3 to liters (1000 cm^3 = 1 L)
        const volumeLiters = (l * w * h) / 1000;
        enclosureResult.innerHTML = `
            <p><strong>Internal Volume:</strong> ${volumeLiters.toFixed(2)} L (${(l * w * h).toFixed(0)} cm³)</p>
            <p style="color:#7f8c8d; font-size:0.82rem;">Subtract driver displacement, bracing, and port volume for net tuning volume.</p>
        `;
        currentUser.activities.unshift(`Calculated enclosure volume: ${volumeLiters.toFixed(2)} L`);
        saveAndRefresh();
    });

    // Clear All Events
    const clearAllData = () => {
        if (confirm('Clear all saved gear records? This cannot be undone.')) {
            currentUser.items = [];
            currentUser.tasks = [];
            currentUser.projects = [];
            currentUser.activities.unshift('Cleared all inventory & project data');
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
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUser, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "gearvault_full_backup.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        currentUser.activities.unshift('Exported account data backup');
        saveAndRefresh();
    });

    // Dark Mode Toggle Event
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    });

    // Helper: Evaluate PSU Wattage & Compatibility Rules
    function evaluateBuildTools(gearItems) {
        const psuCap = currentUser.psuCapacity || 650;
        const ownedItems = gearItems.filter(i => i.status === 'Owned');
        const totalDraw = ownedItems.reduce((sum, item) => sum + (Number(item.wattage) || 0), 0);
        const headroom = psuCap - totalDraw;
        const ratio = psuCap > 0 ? (totalDraw / psuCap) * 100 : 0;

        // Update PSU UI
        document.getElementById('psu-total-draw').textContent = `${totalDraw}W`;
        document.getElementById('psu-headroom').textContent = `${headroom}W`;
        document.getElementById('dash-psu-summary').textContent = `${totalDraw}W / ${psuCap}W`;

        const badge = document.getElementById('psu-status-badge');
        const fill = document.getElementById('psu-progress-fill');
        fill.style.width = `${Math.min(ratio, 100)}%`;

        if (totalDraw > psuCap) {
            badge.textContent = 'Overloaded';
            badge.className = 'status-pill danger';
            fill.style.background = 'var(--danger-color)';
        } else if (ratio > 75) {
            badge.textContent = 'Tight Headroom';
            badge.className = 'status-pill warn';
            fill.style.background = 'var(--warn-color)';
        } else {
            badge.textContent = 'Safe';
            badge.className = 'status-pill safe';
            fill.style.background = 'var(--success-color)';
        }

        // Compatibility checks across logged items
        const compatList = document.getElementById('compat-results-list');
        const checks = [];

        const cpus = gearItems.filter(i => i.category === 'CPU' && i.platform);
        const mobos = gearItems.filter(i => i.category === 'Motherboard' && i.platform);
        const rams = gearItems.filter(i => i.category === 'RAM' && i.platform);

        if (cpus.length === 0 && mobos.length === 0 && rams.length === 0) {
            checks.push('Add CPU, Motherboard, or RAM with platform tags to run compatibility checks.');
        } else {
            if (cpus.length > 0 && mobos.length > 0) {
                const cpuPlatforms = new Set(cpus.map(c => c.platform));
                const moboPlatforms = new Set(mobos.map(m => m.platform));
                const overlap = [...cpuPlatforms].some(p => moboPlatforms.has(p));
                if (overlap) {
                    checks.push('✅ CPU and Motherboard platform tags match.');
                } else {
                    checks.push('⚠️ Platform mismatch detected between logged CPU and Motherboard.');
                }
            }

            if (rams.length > 0) {
                const ramTypes = new Set(rams.map(r => r.platform));
                if (ramTypes.size > 1) {
                    checks.push('⚠️ Mixed RAM generation tags detected (e.g., DDR4 and DDR5).');
                } else {
                    checks.push(`✅ RAM generation consistent (${[...ramTypes][0]}).`);
                }
            }

            if (totalDraw > psuCap) {
                checks.push(`⚠️ Owned PC draw (${totalDraw}W) exceeds PSU capacity (${psuCap}W).`);
            } else {
                checks.push(`✅ PSU capacity (${psuCap}W) covers logged owned wattage (${totalDraw}W).`);
            }
        }

        compatList.innerHTML = checks.map(msg => `<li>${msg}</li>`).join('');
        document.getElementById('dash-compat-summary').textContent =
            checks.some(c => c.startsWith('⚠️')) ? 'Warning Found' : 'All Clear';
    }

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
        const tasks = currentUser.tasks || [];
        const projects = currentUser.projects || [];

        const query = searchInput.value.toLowerCase();
        const selectedCat = categoryFilter.value;

        // 1. Render Inventory Table (Strictly Owned items only)
        const ownedOnlyItems = gearItems.filter(i => i.status === 'Owned');
        const filteredOwned = ownedOnlyItems.filter(item => {
            const matchesQuery = item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
            const matchesCat = selectedCat === 'All' || item.category === selectedCat;
            return matchesQuery && matchesCat;
        });

        inventoryTableBody.innerHTML = '';
        if (filteredOwned.length === 0) {
            inventoryTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No owned gear found.</td></tr>`;
        } else {
            filteredOwned.forEach(item => {
                const specText = [item.platform, item.wattage ? `${item.wattage}W` : ''].filter(Boolean).join(' • ') || '-';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>₱${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>${item.condition}</td>
                    <td>${specText}</td>
                    <td>${item.description || '<em>No description provided</em>'}</td>
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
        const wishlistItems = gearItems.filter(i => i.status === 'Wishlist');
        wishlistGrid.innerHTML = '';
        if (wishlistItems.length === 0) {
            wishlistGrid.innerHTML = `<p>No items in wishlist.</p>`;
        } else {
            wishlistItems.forEach(item => {
                const specText = [item.platform, item.wattage ? `${item.wattage}W` : ''].filter(Boolean).join(' • ');
                const card = document.createElement('div');
                card.className = 'stat-card';
                card.innerHTML = `
                    <h4>${item.name}</h4>
                    <p style="color:var(--accent-color); font-weight:600;">${item.category}</p>
                    <p>₱${item.price.toLocaleString()}</p>
                    ${specText ? `<p style="font-size:0.8rem; color:#7f8c8d;">${specText}</p>` : ''}
                    <p style="font-size:0.85rem; color:#7f8c8d; margin:8px 0;">"${item.description || 'No reason specified'}"</p>
                    <button class="primary-btn move-btn" data-id="${item.id}" style="margin-top:5px;">Move to Inventory</button>
                `;
                wishlistGrid.appendChild(card);
            });
        }
        document.getElementById('wishlist-count').textContent = wishlistItems.length;

        // 3. Render Tasks for Today
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            taskList.innerHTML = `<li>No tasks for today.</li>`;
        } else {
            tasks.forEach(t => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span style="${t.completed ? 'text-decoration: line-through; color: #7f8c8d;' : ''}">
                        <input type="checkbox" class="toggle-task" data-id="${t.id}" ${t.completed ? 'checked' : ''} style="margin-right:8px;">
                        ${t.text}
                    </span>
                    <button class="delete-task danger-btn" data-id="${t.id}" style="padding:2px 6px; font-size:0.8rem; margin:0;">&times;</button>
                `;
                taskList.appendChild(li);
            });
        }

        // 4. Render Ongoing and Completed Projects
        const ongoingDiv = document.getElementById('ongoing-projects-list');
        const completedDiv = document.getElementById('completed-projects-list');

        const ongoingProj = projects.filter(p => p.status === 'Ongoing');
        const completedProj = projects.filter(p => p.status === 'Completed');

        ongoingDiv.innerHTML = ongoingProj.length === 0 ? '<p>No ongoing builds.</p>' : ongoingProj.map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-color);">
                <span>🛠️ ${p.name}</span>
                <div>
                    <button class="complete-proj primary-btn" data-id="${p.id}" style="padding:4px 8px; font-size:0.8rem;">Mark Done</button>
                    <button class="delete-proj danger-btn" data-id="${p.id}" style="padding:4px 8px; font-size:0.8rem; margin:0;">Delete</button>
                </div>
            </div>
        `).join('');

        completedDiv.innerHTML = completedProj.length === 0 ? '<p>No completed projects yet.</p>' : completedProj.map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-color);">
                <span style="color:var(--success-color);">✅ ${p.name}</span>
                <button class="delete-proj danger-btn" data-id="${p.id}" style="padding:4px 8px; font-size:0.8rem; margin:0;">Delete</button>
            </div>
        `).join('');

        // 5. Render Gear by Category Widget
        const categoryBreakdownList = document.getElementById('category-breakdown-list');
        const analyticsCategoryList = document.getElementById('analytics-category-list');

        const categories = ['CPU', 'GPU', 'Motherboard', 'RAM', 'PSU', 'Audio', 'Peripherals', 'Monitor'];
        let catHtml = '';
        let hasCategories = false;

        categories.forEach(cat => {
            const count = gearItems.filter(i => i.category === cat).length;
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

        // 6. Render Recent Activity Widget
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

        // 7. Evaluate Build & Audio Tools
        evaluateBuildTools(gearItems);

        // 8. Update Statistics & Analytics Numbers
        const totalItems = gearItems.length;
        const ownedItems = ownedOnlyItems.length;
        const wishlistCount = wishlistItems.length;
        const totalValue = gearItems.reduce((sum, i) => sum + i.price, 0);
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