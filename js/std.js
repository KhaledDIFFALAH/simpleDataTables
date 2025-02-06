class SimpleDataTables {
    constructor(selector, options = {}) {
        this.table = document.querySelector(selector);
        if (!this.table) {
            console.error(`${this.translations.tableNotFound}: ${selector}`);
            return;
        }

        // Default settings
        this.settings = {
            pagination: true,
            maxRowsPerPage: 10,
            dataSorting: true,
            dataSortingBy: null,
            dataSortingDirection: 'asc',
            excludedColumns: [],
            enableFilters: false,
            columnFilters: {},
            searchbar: true,
            prevBtn: "❮",
            nextBtn: "❯",
            dotsBtn: "•••",
            language: 'en', // Default language
            tableScrollable: true,
            tableMaxHeight: null,
            ...options,
        };

        this.tbody = this.table.querySelector('tbody');
        this.data = Array.from(this.tbody.querySelectorAll('tr'));
        this.currentPage = 1;

        this.filteredData = [...this.data]; // Data after search/filter

        // Load translations dynamically
        this.loadTranslations(this.settings.language)
            .then((translations) => {
                this.translations = translations;
                this.init();
            })
            .catch((error) => {
                console.error("Failed to load translations:", error);
                this.loadDefaultTranslations();
            });
        
        this.columnVisibility = {}; // Track visibility of each column
        this.initializeColumnVisibility();
    }

    async loadTranslations(language) {
        try {
            var module = await import(`../i18n/${language}.js`);
            return module.default;
        } catch (error) {
            console.warn(`Language file for '${language}' not found, falling back to default.`);
            throw error;
        }
    }

    async loadDefaultTranslations() {
        try {
            var response = await import(`../i18n/default.js`);
            this.translations = response.default;
            this.init();
        } catch (error) {
            console.error("Failed to load default language file:", error);
            this.translations = {}; // Use an empty object as a last resort
            this.init();
        }
    }

    initializeColumnVisibility() {
        var headers = Array.from(this.table.querySelectorAll('thead th'));
        headers.forEach((header, index) => {
            this.columnVisibility[index] = true; // All columns are visible by default
        });
    }

    applyTableScroll() {
        var tableWidth = this.table.offsetWidth;
        var tablParentWidth = this.table.parentNode.offsetWidth;
        if (this.settings.tableScrollable) {
            this.table.style.overflowX = "auto";
            this.table.style.display = (tableWidth > tablParentWidth) ? "block" : "table";
            if (this.settings.tableMaxHeight) {
                this.table.style.overflowY = "auto";
                this.table.style.maxHeight = `${this.settings.tableMaxHeight}px`; // Apply max height
            } else {
                this.table.style.overflowY = "visible"; // Default behavior if maxHeight isn't set
            }
        } else {
            // Reset styles if scroll is disabled
            this.table.style.overflowX = "visible";
            this.table.style.overflowY = "visible";
            this.table.style.maxHeight = "";
        }
    }

    init() {
        this.createHeaderControls();
        if (this.settings.enableFilters) this.createColumnFilters();
        if (this.settings.dataSorting) this.enableSorting();
        
        this.createFooterControls();

        this.applyTableScroll();
        this.renderTable();
    }

    createHeaderControls() {
        var sdtHeader = document.createElement('div');
        sdtHeader.id = "sdtHeader";
        sdtHeader.className = 'd-flex justify-content-between align-items-center mb-3';

        var sdtHeaderLeft = document.createElement('div');
        sdtHeaderLeft.id = "sdtHeaderLeft";
        sdtHeaderLeft.className = 'd-flex align-items-center gap-2';

        var sdtHeaderRight = document.createElement('div');
        sdtHeaderRight.id = "sdtHeaderRight";
        sdtHeaderRight.className = 'd-flex align-items-center gap-2';

        sdtHeader.appendChild(sdtHeaderLeft);
        sdtHeader.appendChild(sdtHeaderRight);

        // Left controls: Rows per page selector with "Show" and "entries"
        var leftControls = document.createElement('div');
        leftControls.className = 'd-flex align-items-center gap-2';

        // var showText = document.createElement('span');
        // showText.textContent = this.translations.Show;
        // leftControls.appendChild(showText);

        var rowsSelector = document.createElement('select');
        rowsSelector.className = 'form-select sdt-max-entries-per-page';
        [10, 20, 50, 100].forEach(count => {
            var option = document.createElement('option');
            option.value = count;
            option.textContent = count;
            if (count === this.settings.maxRowsPerPage) {
                option.selected = true;
            }
            rowsSelector.appendChild(option);
        });
        rowsSelector.addEventListener('change', (e) => {
            this.settings.maxRowsPerPage = parseInt(e.target.value, 10);
            this.currentPage = 1;
            this.renderTable();
        });
        leftControls.appendChild(rowsSelector);

        var entriesText = document.createElement('span');
        entriesText.textContent = this.translations.entriesPerPage;
        leftControls.appendChild(entriesText);

        sdtHeaderLeft.appendChild(leftControls);

        // Right controls: "Search:" and Search bar
        if (this.settings.searchbar) {
            var rightControls = document.createElement('div');
            rightControls.className = 'd-flex align-items-center gap-2';

            var searchLabel = document.createElement('span');
            searchLabel.textContent = this.translations.searchBarLabel;
            rightControls.appendChild(searchLabel);

            var searchInput = document.createElement('input');
            searchInput.type = 'search';
            // searchInput.placeholder = this.translations.searchBarPlaceholder;
            searchInput.className = 'form-control w-auto';

            this.searchInput = searchInput; // Store for use in filters

            searchInput.addEventListener('input', () => {
                this.applyFilters(); // Use combined filtering logic
            });

            rightControls.appendChild(searchInput);

            sdtHeaderRight.appendChild(rightControls);
        }

        // Add column management button
        var columnManagerButton = document.createElement('button');
        columnManagerButton.innerHTML = "<i class='sdti sdti-gear'></i>";
        columnManagerButton.className = 'btn btn-sm btn-primary sdt-header-btn';
        columnManagerButton.addEventListener('click', () => this.showColumnManager());
        sdtHeaderRight.appendChild(columnManagerButton);

        this.table.parentNode.insertBefore(sdtHeader, this.table);
    }

    showColumnManager() {
        // Create modal container
        var modalId = "columnManagerModal";
    
        // Remove any existing modal with the same ID to avoid duplicates
        var existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();
    
        // Only get headers from the first row of thead
        var headers = Array.from(this.table.querySelectorAll('thead tr:first-child th'));
    
        // Bootstrap Modal HTML
        var modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-light py-2">
                            <h5 class="modal-title" id="${modalId}Label">Manage Columns</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="${modalId}Form" class="column-manager-form">
                                <div class="row g-2">
                                ${headers
                                    .map(
                                        (header, index) => `
                                        <div class="col-12 col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" 
                                                   id="column-${index}" 
                                                   value="${index}" 
                                                   ${this.columnVisibility[index] ? "checked" : ""}>
                                            <label class="form-check-label" for="column-${index}">
                                                ${header.textContent.trim()} (${index})
                                            </label>
                                        </div>
                                        </div>
                                    `
                                    )
                                    .join("")}
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer justify-content-between gap-2 p-2">
                            <button type="button" class="btn btn-success" id="${modalId}ShowAllBtn">Show All Columns</button>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary" id="${modalId}SaveBtn">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        // Append modal to the body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    
        // Initialize the modal
        var modalElement = document.getElementById(modalId);
        var modal = new bootstrap.Modal(modalElement);
    
        // Add event listener to the save button
        var saveBtn = document.getElementById(`${modalId}SaveBtn`);
        saveBtn.addEventListener("click", () => {
            var checkboxes = modalElement.querySelectorAll(".form-check-input");
            checkboxes.forEach((checkbox) => {
                var columnIndex = parseInt(checkbox.value, 10);
                this.toggleColumnVisibility(columnIndex, checkbox.checked);
            });
            modal.hide(); // Close the modal after saving changes
            this.applyTableScroll();
        });
    
        // Add event listener to the "Show All Columns" button
        var showAllBtn = document.getElementById(`${modalId}ShowAllBtn`);
        showAllBtn.addEventListener('click', () => { 
            var checkboxes = modalElement.querySelectorAll(".form-check-input");
            checkboxes.forEach((checkbox) => {
                checkbox.checked = true; // Check all checkboxes
                var columnIndex = parseInt(checkbox.value, 10);
                this.toggleColumnVisibility(columnIndex, true); // Ensure all columns are shown
            });
            modal.hide();
            this.showAllColumns();
            this.applyTableScroll();
        });

        // Show the modal
        modal.show();
    }
    
    toggleColumnVisibility(index, isVisible) {
        this.columnVisibility[index] = isVisible;
    
        var rows = this.table.querySelectorAll('tr');
        rows.forEach(row => {
            var cell = row.children[index];
            if (cell) {
                cell.style.display = isVisible ? '' : 'none';
            }
        });
    }
    
    showAllColumns() {
        Object.keys(this.columnVisibility).forEach(index => {
            this.columnVisibility[index] = true;
            this.toggleColumnVisibility(index, true);
        });
    }    

    createColumnFilters() {
        var headerRow = this.table.querySelector('thead tr');
        var filterRow = document.createElement('tr');
    
        Array.from(headerRow.children).forEach((th, index) => {
            var filterCell = document.createElement('th');
            var columnFilter = this.settings.columnFilters[index];
    
            if (columnFilter) {
                if (columnFilter.type === 'select') {
                    var select = document.createElement('select');
                    select.className = 'form-select sdt-filter-input';
                    select.innerHTML = `<option value="">${this.translations.All}</option>`;
                    columnFilter.options.forEach(option => {
                        select.innerHTML += `<option value="${option}">${option}</option>`;
                    });
                    select.addEventListener('change', () => {
                        this.applyFilters();
                    });
                    filterCell.appendChild(select);
                } else if (columnFilter.type === 'text') {
                    var input = document.createElement('input');
                    input.type = 'search';
                    input.className = 'form-control w-auto sdt-filter-input';
                    input.placeholder = (columnFilter.placeholder) ? columnFilter.placeholder : this.translations.filterInputPlaceholder;
                    input.addEventListener('input', () => {
                        this.applyFilters();
                    });
                    filterCell.appendChild(input);
                }
            } else {
                // Add a placeholder to maintain column alignment
                var placeholder = document.createElement('span');
                placeholder.textContent = ''; // Empty content
                filterCell.appendChild(placeholder);
            }
    
            filterRow.appendChild(filterCell);
        });
    
        this.table.querySelector('thead').appendChild(filterRow);
    }
    
    createFooterControls() {
        var container = document.createElement('div');
        container.className = 'd-flex justify-content-between align-items-center mt-3';

        // Entries info
        this.entriesInfo = document.createElement('div');
        this.entriesInfo.className = 'sdt-entries';
        container.appendChild(this.entriesInfo);

        // Pagination container
        this.paginationContainer = document.createElement('div');
        this.paginationContainer.className = 'sdt-pagination';
        container.appendChild(this.paginationContainer);

        this.table.parentNode.appendChild(container);
    }

    renderFooterInfo(start, end, total) {
        this.entriesInfo.textContent = `${this.translations.footerShowing} ${start} ${this.translations.footerTo} ${end} ${this.translations.footerOf} ${total} ${this.translations.footerEntries}`;
    }

    enableSorting() {
        if (this.settings.dataSortingBy != null) {
            var columnIndex = this.settings.dataSortingBy;
            var sortDirection = this.settings.dataSortingDirection;
        
            // Sort the filtered data
            this.filteredData.sort((a, b) => {
                var aValue = a.children[columnIndex].textContent.trim();
                var bValue = b.children[columnIndex].textContent.trim();
        
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            });
        
            var th = this.table.querySelector(`thead tr:nth-child(1) th:nth-child(${columnIndex + 1})`);
            if (th) {
                th.dataset.sort = this.settings.dataSortingDirection;
            }
        }
        var headers = this.table.querySelectorAll('thead tr:nth-child(1) th');
        headers.forEach((th, index) => {
            if (this.settings.excludedColumns.includes(index)) {
                return;
            }
            th.className = 'sdt-sortable';
            th.addEventListener('click', () => {
                var direction = th.dataset.sort === 'asc' ? 'desc' : 'asc';
                headers.forEach(th => th.removeAttribute('data-sort'));
                th.dataset.sort = direction;
                this.sortData(index, direction);
            });
        });
    }

    sortData(columnIndex, direction) {
        this.filteredData.sort((a, b) => {
            var aValue = a.children[columnIndex].textContent.trim();
            var bValue = b.children[columnIndex].textContent.trim();

            return direction === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });

        this.currentPage = 1;
        this.renderTable();
    }

    applyFilters() {
        var filterRow = this.table.querySelector('thead tr:last-child');
        var filters = Array.from(filterRow.children);

        var query = this.searchInput ? this.searchInput.value.toLowerCase() : "";

        this.filteredData = this.data.filter(row => {
            var rowText = row.textContent.toLowerCase();

            // Combine search and filter logic
            var matchesSearch = query === "" || rowText.includes(query);

            var matchesFilters = filters.every((filter, index) => {
                var input = filter.querySelector('input');
                var select = filter.querySelector('select');

                if (input) {
                    var filterValue = input.value.toLowerCase();
                    return filterValue === "" || row.children[index].textContent.toLowerCase().includes(filterValue);
                }

                if (select) {
                    var selectedValue = select.value;
                    return selectedValue === "" || row.children[index].textContent === selectedValue;
                }

                return true;
            });

            return matchesSearch && matchesFilters;
        });

        this.currentPage = 1;
        this.renderTable();
    }

    renderPagination(totalPages) {
        if (!this.settings.pagination) return;

        this.paginationContainer.innerHTML = '';

        var createButton = (content, action, isDisabled = false, isDots = false) => {
            var button = document.createElement('button');
            button.innerHTML = content;
            button.className = isDots ? 'btn btn-sm sdt-pagination-btn sdt-pagination-dots' : 'btn btn-sm sdt-pagination-btn';
            if (isDisabled) button.disabled = true;

            if (!isDots && !isDisabled) {
                button.addEventListener('click', action);
            }

            this.paginationContainer.appendChild(button);
            return button;
        };

        // Create First/Prev Buttons
        // createButton('First', () => {
        //     this.currentPage = 1;
        //     this.renderTable();
        // }, this.currentPage === 1);

        createButton(this.settings.prevBtn, () => {
            this.currentPage = Math.max(1, this.currentPage - 1);
            this.renderTable();
        }, this.currentPage === 1);

        // Pagination logic
        if (totalPages > 5) {
            if (this.currentPage <= 5) {
                // Show first 5 pages and last page with dots in between
                for (let i = 1; i <= 5; i++) {
                    var button = createButton(i, () => {
                        this.currentPage = i;
                        this.renderTable();
                    });
                    if (i === this.currentPage) {
                        button.classList.add('active');
                    }
                }
                createButton(this.settings.dotsBtn, null, true, true); // Dots
                createButton(totalPages, () => {
                    this.currentPage = totalPages;
                    this.renderTable();
                });
            } else if (this.currentPage > 5 && this.currentPage <= totalPages - 5) {
                // Show first page, dots, 5 pages around current page, dots, and last page
                createButton(1, () => {
                    this.currentPage = 1;
                    this.renderTable();
                });
                createButton(this.settings.dotsBtn, null, true, true); // Dots

                var startPage = this.currentPage - 2;
                var endPage = this.currentPage + 3;

                for (let i = startPage; i <= endPage; i++) {
                    var button = createButton(i, () => {
                        this.currentPage = i;
                        this.renderTable();
                    });
                    if (i === this.currentPage) {
                        button.classList.add('active');
                    }
                }

                createButton(this.settings.dotsBtn, null, true, true); // Dots
                createButton(totalPages, () => {
                    this.currentPage = totalPages;
                    this.renderTable();
                });
            } else {
                // Show first page, dots, and remaining pages till last
                createButton(1, () => {
                    this.currentPage = 1;
                    this.renderTable();
                });
                createButton('...', null, true, true); // Dots

                var startPage = totalPages - 5;
                for (let i = startPage; i <= totalPages; i++) {
                    var button = createButton(i, () => {
                        this.currentPage = i;
                        this.renderTable();
                    });
                    if (i === this.currentPage) {
                        button.classList.add('active');
                    }
                }
            }
        }
        else {
            // Show all pages if totalPages <= 5
            for (let i = 1; i <= totalPages; i++) {
                var button = createButton(i, () => {
                    this.currentPage = i;
                    this.renderTable();
                });
                if (i === this.currentPage) {
                    button.classList.add('active');
                }
            }
        }

        // Create Next/Last Buttons
        createButton(this.settings.nextBtn, () => {
            this.currentPage = Math.min(totalPages, this.currentPage + 1);
            this.renderTable();
        }, this.currentPage === totalPages);

        // createButton('Last', () => {
        //     this.currentPage = totalPages;
        //     this.renderTable();
        // }, this.currentPage === totalPages);
    }

    renderTable() {
        var data = this.filteredData || this.data;

        // Clear the table body
        this.tbody.innerHTML = '';

        if (data.length === 0) {
            // Handle no matching data case
            var noDataRow = document.createElement('tr');
            var noDataCell = document.createElement('td');
            noDataCell.colSpan = this.table.querySelector('thead tr').children.length;
            noDataCell.className = 'text-center';
            noDataCell.textContent = this.translations.noMatchingRecords;
            noDataRow.appendChild(noDataCell);
            this.tbody.appendChild(noDataRow);

            // Update footer info
            this.renderFooterInfo(0, 0, 0);

            // Clear pagination
            if (this.settings.pagination) this.paginationContainer.innerHTML = '';
            return;
        }

        var start = (this.currentPage - 1) * this.settings.maxRowsPerPage;
        var end = start + this.settings.maxRowsPerPage;

        var rowsToDisplay = this.settings.pagination
            ? data.slice(start, end)
            : data;

        // Append matching rows to the tbody
        rowsToDisplay.forEach(row => this.tbody.appendChild(row));

        var totalPages = Math.ceil(data.length / this.settings.maxRowsPerPage);
        this.renderFooterInfo(start + 1, Math.min(end, data.length), data.length);

        // Update pagination
        if (this.settings.pagination) this.renderPagination(totalPages);
    }

}
