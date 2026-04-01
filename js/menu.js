// ============================================
// Menu — Category + Item CRUD for restaurants
// Backed by Supabase menu_items table via CC.dashboard
// ============================================

var _menuItems = [];      // items loaded from DB
var _menuCategories = []; // derived from item.category strings + local additions

function loadMenu() {
  renderMenu();
  updateMenuStats();

  CC.dashboard.getMenu().then(function(items) {
    _menuItems = (items || []).map(function(item) {
      return {
        id: item.id,             // real DB uuid
        dbId: item.id,
        categoryName: item.category || 'Uncategorized',
        name: item.name || '',
        price: parseFloat(item.price) || 0,
        description: item.description || '',
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags] : []),
        modifiers: Array.isArray(item.modifiers) ? item.modifiers : [],
        photo: item.photo_url || '',
        sort_order: item.sort_order || 0,
      };
    });

    // Derive categories from loaded items
    var seenCats = {};
    _menuItems.forEach(function(item) {
      if (!seenCats[item.categoryName]) {
        seenCats[item.categoryName] = true;
        _menuCategories.push({ name: item.categoryName });
      }
    });

    renderMenu();
    updateMenuStats();
  }).catch(function(err) {
    console.error('Failed to load menu:', err);
    toast('Could not load menu items', 'error');
  });
}

function renderMenu() {
  var container = document.getElementById('menu-categories-list');
  var emptyState = document.getElementById('menu-empty');
  if (!container) return;

  if (_menuCategories.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = '';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  var html = '';

  _menuCategories.forEach(function(cat) {
    var items = _menuItems.filter(function(i) { return i.categoryName === cat.name; });

    html += '<div class="card" style="margin-bottom:12px;">';
    html += '<div class="card-header">';
    html += '<h3 style="font-size:15px;">' + escHtml(cat.name) + ' <span style="color:var(--text-dim);font-weight:400;">(' + items.length + ')</span></h3>';
    html += '<div style="display:flex;gap:6px;">';
    html += '<button class="btn btn-outline btn-sm" onclick="editCategory(\'' + escAttr(cat.name) + '\')">Edit</button>';
    html += '<button class="btn btn-danger btn-sm" onclick="deleteCategory(\'' + escAttr(cat.name) + '\')">Delete</button>';
    html += '</div>';
    html += '</div>';

    if (items.length > 0) {
      html += '<div class="table-wrap"><table><thead><tr><th>Item</th><th>Price</th><th>Tags</th><th>Actions</th></tr></thead><tbody>';
      items.forEach(function(item) {
        html += '<tr>';
        html += '<td><strong>' + escHtml(item.name) + '</strong>';
        if (item.description) html += '<br><span style="font-size:12px;color:var(--text-muted);">' + escHtml(item.description) + '</span>';
        html += '</td>';
        html += '<td>$' + Number(item.price).toFixed(2) + '</td>';
        html += '<td>' + (item.tags || []).map(function(t) { return '<span class="tag">' + escHtml(t) + '</span>'; }).join('') + '</td>';
        html += '<td><div style="display:flex;gap:6px;">';
        html += '<button class="btn btn-outline btn-sm" onclick="editMenuItem(\'' + escAttr(item.id) + '\')">Edit</button>';
        html += '<button class="btn btn-danger btn-sm" onclick="deleteMenuItem(\'' + escAttr(item.id) + '\')">Delete</button>';
        html += '</div></td>';
        html += '</tr>';
      });
      html += '</tbody></table></div>';
    } else {
      html += '<p style="color:var(--text-muted);font-size:13px;padding:8px 0;">No items in this category yet.</p>';
    }

    html += '</div>';
  });

  container.innerHTML = html;
}

function escHtml(str) {
  var div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function escAttr(str) {
  return String(str || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

// ── Category CRUD ──
function openCategoryModal(existingName) {
  document.getElementById('cat-form-name').value = existingName || '';
  document.getElementById('cat-form-id').value = existingName || '';
  openModal('modal-category');
}

function saveCategory() {
  var name = document.getElementById('cat-form-name').value.trim();
  if (!name) { toast('Category name is required', 'error'); return; }

  var oldName = document.getElementById('cat-form-id').value;

  if (oldName && oldName !== name) {
    // Rename: update all items with this category in DB
    var toRename = _menuItems.filter(function(i) { return i.categoryName === oldName; });
    var promises = toRename.map(function(item) {
      return CC.dashboard.updateMenuItem(item.id, { category: name });
    });
    Promise.all(promises).then(function() {
      // Update local state
      _menuItems.forEach(function(i) { if (i.categoryName === oldName) i.categoryName = name; });
      var cat = _menuCategories.find(function(c) { return c.name === oldName; });
      if (cat) cat.name = name;
      closeModal('modal-category');
      renderMenu();
      toast('Category renamed');
    }).catch(function() { toast('Failed to rename category', 'error'); });
  } else if (!oldName) {
    // New category (no items yet, just add locally)
    if (!_menuCategories.find(function(c) { return c.name === name; })) {
      _menuCategories.push({ name: name });
    }
    closeModal('modal-category');
    renderMenu();
    toast('Category added');
  } else {
    closeModal('modal-category');
  }
}

function editCategory(name) {
  openCategoryModal(name);
}

function deleteCategory(name) {
  if (!confirm('Delete this category and all its items?')) return;
  var toDelete = _menuItems.filter(function(i) { return i.categoryName === name; });
  var promises = toDelete.map(function(item) {
    return CC.dashboard.deleteMenuItem(item.id);
  });
  Promise.all(promises).then(function() {
    _menuItems = _menuItems.filter(function(i) { return i.categoryName !== name; });
    _menuCategories = _menuCategories.filter(function(c) { return c.name !== name; });
    renderMenu();
    updateMenuStats();
    toast('Category deleted');
  }).catch(function() { toast('Failed to delete category', 'error'); });
}

// ── Menu Item CRUD ──
function openMenuItemModal(id) {
  document.getElementById('mi-form-name').value = '';
  document.getElementById('mi-form-price').value = '';
  document.getElementById('mi-form-desc').value = '';
  document.getElementById('mi-form-tags').value = '';
  document.getElementById('mi-form-modifiers').value = '';
  document.getElementById('mi-form-id').value = '';
  document.getElementById('menu-item-modal-title').textContent = 'Add Menu Item';

  // Populate category dropdown
  var select = document.getElementById('mi-form-category');
  select.innerHTML = '';
  _menuCategories.forEach(function(cat) {
    var opt = document.createElement('option');
    opt.value = cat.name;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });

  if (_menuCategories.length === 0) {
    toast('Please create a category first', 'error');
    return;
  }

  if (id) {
    var item = _menuItems.find(function(i) { return String(i.id) === String(id); });
    if (item) {
      document.getElementById('menu-item-modal-title').textContent = 'Edit Menu Item';
      document.getElementById('mi-form-name').value = item.name;
      document.getElementById('mi-form-price').value = item.price;
      document.getElementById('mi-form-desc').value = item.description || '';
      document.getElementById('mi-form-tags').value = (item.tags || []).join(', ');
      document.getElementById('mi-form-modifiers').value = (item.modifiers || []).map(function(m) {
        return m.name + ' | ' + (parseFloat(m.price) || 0).toFixed(2);
      }).join('\n');
      document.getElementById('mi-form-id').value = item.id;
      select.value = item.categoryName;
    }
  }

  openModal('modal-menu-item');
}

function saveMenuItem() {
  var name = document.getElementById('mi-form-name').value.trim();
  var price = parseFloat(document.getElementById('mi-form-price').value);
  var categoryName = document.getElementById('mi-form-category').value;

  if (!name) { toast('Item name is required', 'error'); return; }
  if (isNaN(price) || price < 0) { toast('Valid price is required', 'error'); return; }

  var desc = document.getElementById('mi-form-desc').value.trim();
  var tagsStr = document.getElementById('mi-form-tags').value.trim();
  var tags = tagsStr ? tagsStr.split(',').map(function(t) { return t.trim(); }).filter(Boolean) : [];
  var modsStr = document.getElementById('mi-form-modifiers').value.trim();
  var modifiers = [];
  if (modsStr) {
    modsStr.split('\n').forEach(function(line) {
      var parts = line.split('|');
      if (parts.length === 2) {
        modifiers.push({ name: parts[0].trim(), price: parseFloat(parts[1].trim()) || 0 });
      }
    });
  }

  var dbPayload = {
    name: name,
    price: price,
    category: categoryName,
    description: desc,
    tags: tags,
    modifiers: modifiers,
    sort_order: _menuItems.filter(function(i) { return i.categoryName === categoryName; }).length
  };

  var id = document.getElementById('mi-form-id').value;

  if (id) {
    // Update existing
    CC.dashboard.updateMenuItem(id, dbPayload).then(function(updated) {
      var item = _menuItems.find(function(i) { return String(i.id) === String(id); });
      if (item) {
        item.name = name;
        item.price = price;
        item.categoryName = categoryName;
        item.description = desc;
        item.tags = tags;
        item.modifiers = modifiers;
      }
      closeModal('modal-menu-item');
      renderMenu();
      updateMenuStats();
      toast('Menu item updated');
    }).catch(function() { toast('Failed to save item', 'error'); });
  } else {
    // Create new
    CC.dashboard.createMenuItem(dbPayload).then(function(created) {
      _menuItems.push({
        id: created.id,
        dbId: created.id,
        categoryName: categoryName,
        name: name,
        price: price,
        description: desc,
        tags: tags,
        modifiers: modifiers,
        photo: '',
        sort_order: dbPayload.sort_order
      });
      closeModal('modal-menu-item');
      renderMenu();
      updateMenuStats();
      toast('Menu item added');
    }).catch(function() { toast('Failed to save item', 'error'); });
  }
}

function editMenuItem(id) {
  openMenuItemModal(id);
}

function deleteMenuItem(id) {
  if (!confirm('Delete this menu item?')) return;
  CC.dashboard.deleteMenuItem(id).then(function() {
    _menuItems = _menuItems.filter(function(i) { return String(i.id) !== String(id); });
    renderMenu();
    updateMenuStats();
    toast('Menu item deleted');
  }).catch(function() { toast('Failed to delete item', 'error'); });
}

function updateMenuStats() {
  var el = document.getElementById('stat-items');
  if (el) el.textContent = _menuItems.length;
}

// Register page load callback
onPageLoad('menu', loadMenu);
