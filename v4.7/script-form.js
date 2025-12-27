// form.js - Clean rebuild of form builder with auto-summary

jQuery(document).ready(function () {
    
    // Global auto-resize function for textareas
    window.autoResizeTextarea = function($textarea) {
        if ($textarea && $textarea.length) {
            $textarea.css('height', 'auto');
            const scrollHeight = $textarea[0].scrollHeight;
            $textarea.css('height', scrollHeight + 'px');
        }
    };
    
    // Build the form layout
    function buildForm() {
        const $formContainer = $("#options-content");
        $formContainer.empty();
        
        // IMPORTANT: Remove all previously created modals
        // Modals are appended to body, not to #options-content, so they persist across rebuilds
        $('.modal:not(#import-modal)').remove();
        
        // Build sections with textareas
        window.options.forEach(section => {
            if (section.enableSectionPreview && section.sectionPreviewKey) {
                const sectionKey = section.sectionPreviewKey;
                
                const $sectionRow = $(`
                    <div class="form-row" data-section="${sectionKey}">
                        <div class="form-left">
                            <h3>${section.title}</h3>
                            <button type="button" class="exclude-button" data-section="${sectionKey}">−</button>
                            <button type="button" class="template-button" data-section="${sectionKey}">✎</button>
                        </div>
                        <div class="form-right">
                            <textarea id="${sectionKey}-textarea" class="section-textarea"></textarea>
                        </div>
                    </div>
                `);
                
                $formContainer.append($sectionRow);
                createSectionModal(section);
                
                const $textarea = $sectionRow.find('.section-textarea');
                
                $textarea.on('input', function() {
                    window.autoResizeTextarea($(this));
                    if (window.sectionPreviewManuallyEdited) {
                        window.sectionPreviewManuallyEdited[sectionKey] = true;
                    }
                    if (window.metrics) {
                        window.metrics[sectionKey] = $(this).val();
                    }
                });
                
                // Exclude button handler
                const $excludeButton = $sectionRow.find('.exclude-button');
                const $editButton = $sectionRow.find('.template-button');
                $excludeButton.on('click', function() {
                    // Initialize excludedSections if needed
                    if (!window.excludedSections) {
                        window.excludedSections = {};
                    }
                    
                    // Toggle excluded state
                    const isExcluded = window.excludedSections[sectionKey] || false;
                    window.excludedSections[sectionKey] = !isExcluded;
                    
                    // Update UI
                    if (window.excludedSections[sectionKey]) {
                        // Exclude: grey out, disable, collapse, hide edit button
                        $textarea.addClass('excluded').prop('disabled', true);
                        $textarea.css('height', '32px'); // Match button height
                        $editButton.hide();
                        $excludeButton.text('+').attr('title', 'Include section in report');
                    } else {
                        // Include: restore normal state, expand, show edit button
                        $textarea.removeClass('excluded').prop('disabled', false);
                        $textarea.css('height', ''); // Clear inline height
                        window.autoResizeTextarea($textarea); // Restore auto-sized height
                        $editButton.show();
                        $excludeButton.text('−').attr('title', 'Exclude section from report');
                    }
                    
                    // Update summary to reflect exclusion/inclusion
                    if (typeof window.updateSummary === 'function') {
                        window.updateSummary();
                    }
                });
                
                // Set initial button title
                $excludeButton.attr('title', 'Exclude section from report');
                
                window.autoResizeTextarea($textarea);
            }
        });
        
        // Add Summary section
        window.options.forEach(section => {
            if (section.title === "Summary" && !section.enableSectionPreview) {
                const $summaryRow = $(`
                    <div class="form-row summary-row">
                        <div class="form-left">
                            <h3>Summary</h3>
                            <button type="button" class="exclude-button" data-section="Summary">−</button>
                            <button type="button" class="template-button" data-section="Summary">✎</button>
                        </div>
                        <div class="form-right">
                            <textarea id="Summary-textarea" class="section-textarea summary-textarea" style="min-height: 8rem;"></textarea>
                        </div>
                    </div>
                `);
                
                $formContainer.append($summaryRow);
                
                // Create modal for Summary section params
                createSummaryModal(section);
                
                const $summaryTextarea = $summaryRow.find('#Summary-textarea');
                
                $summaryTextarea.on('input', function() {
                    window.autoResizeTextarea($(this));
                    if (window.summaryManuallyEdited !== undefined) {
                        window.summaryManuallyEdited = true;
                    }
                    if (window.metrics) {
                        window.metrics.Summary = $(this).val();
                    }
                });
                
                // Exclude button handler for Summary
                const $summaryExcludeButton = $summaryRow.find('.exclude-button');
                const $summaryEditButton = $summaryRow.find('.template-button');
                $summaryExcludeButton.on('click', function() {
                    // Initialize excludedSections if needed
                    if (!window.excludedSections) {
                        window.excludedSections = {};
                    }
                    
                    // Toggle excluded state
                    const isExcluded = window.excludedSections['Summary'] || false;
                    window.excludedSections['Summary'] = !isExcluded;
                    
                    // Update UI
                    if (window.excludedSections['Summary']) {
                        // Exclude: grey out, disable, collapse, hide edit button
                        $summaryTextarea.addClass('excluded').prop('disabled', true);
                        $summaryTextarea.css('height', '32px'); // Match button height
                        $summaryEditButton.hide();
                        $summaryExcludeButton.text('+').attr('title', 'Include section in report');
                    } else {
                        // Include: restore normal state, expand, show edit button
                        $summaryTextarea.removeClass('excluded').prop('disabled', false);
                        $summaryTextarea.css('height', ''); // Clear inline height
                        window.autoResizeTextarea($summaryTextarea); // Restore auto-sized height
                        $summaryEditButton.show();
                        $summaryExcludeButton.text('−').attr('title', 'Exclude section from report');
                    }
                });
                
                // Set initial button title
                $summaryExcludeButton.attr('title', 'Exclude section from report');
                
                window.autoResizeTextarea($summaryTextarea);
            }
        });
        
        if (typeof window.populateSectionTextareas === 'function') {
            window.populateSectionTextareas();
        }
    }
    
    // Create modal for Summary section (special handling)
    function createSummaryModal(section) {
        const modalId = 'Summary-modal';
        
        
        // Build parameter rows - only show params with enableSummary
        let paramRows = '';
        Object.entries(section.params).forEach(([paramKey, paramOption]) => {
            // Skip the Summary param itself (it's the textarea, not a checkbox option)
            if (paramKey === 'Summary') return;
            
            const hasSummary = paramOption.enableSummary === true;
            if (!hasSummary) return;
            
            // Skip params that should always be included (no user control needed)
            if (paramOption.summaryAlwaysInclude === true) return;
            
            const isCustom = paramOption.custom === true;
            const hasCustomText = paramOption.customText !== false; // Show by default unless explicitly disabled
            
            // Build options column content
            let optionsHtml = '';
            let hasEditButton = false;
            if (isCustom) {
                // Custom field - show textarea
                const largeClass = paramOption.large ? 'large' : '';
                const currentValue = window.metrics && window.metrics[paramKey] ? window.metrics[paramKey] : '';
                optionsHtml = `<textarea id="${paramKey}-textarea" class="modal-textarea ${largeClass}" data-param="${paramKey}">${currentValue}</textarea>`;
            } else if (paramOption.options && Array.isArray(paramOption.options)) {
                // Regular dropdown
                optionsHtml = `
                    <select id="${paramKey}-select" data-param="${paramKey}">
                        <option value="">Select...</option>
                        ${paramOption.options.map(opt => {
                            const isString = typeof opt === 'string';
                            const label = isString ? opt : (opt.label || opt.title);
                            const title = isString ? opt : opt.title;
                            const isDefault = !isString && opt.default === true;
                            return `<option value="${title}" ${isDefault ? 'selected' : ''}>${label}</option>`;
                        }).join('')}
                    </select>
                `;
                
                // Show edit button if customText is enabled
                hasEditButton = hasCustomText;
            } else {
                optionsHtml = `<span class="no-options">No options available</span>`;
            }
            
            // Build edit button column HTML
            const editButtonHtml = hasEditButton ? 
                `<button type="button" class="modal-edit-button" data-param="${paramKey}" title="Edit custom text">✎</button>` : 
                '';
            
            // Build summary checkbox
            const defaultChecked = paramOption.summaryDefault ? 'checked' : '';
            const summaryHtml = `<input type="checkbox" id="${paramKey}-summary-modal" data-param="${paramKey}" ${defaultChecked} />`;
            
            paramRows += `
                <tr data-param="${paramKey}">
                    <td class="param-label">${paramOption.title || paramKey}</td>
                    <td class="param-edit">${editButtonHtml}</td>
                    <td class="param-options">${optionsHtml}</td>
                    <td class="param-summary">${summaryHtml}</td>
                </tr>
            `;
            
            // Add custom text row if customText is enabled
            if (hasCustomText && !isCustom) {
                const largeClass = paramOption.large ? 'large' : '';
                paramRows += `
                    <tr id="${paramKey}-custom-row" class="custom-text-row" style="display: none;">
                        <td style="border-top: none; padding-top: 0;"></td>
                        <td style="border-top: none; padding-top: 0;"></td>
                        <td style="border-top: none; padding-top: 0;">
                            <textarea id="${paramKey}-custom-textarea" class="modal-textarea ${largeClass}" data-param="${paramKey}" placeholder="Edit custom text..."></textarea>
                        </td>
                        <td style="border-top: none; padding-top: 0;"></td>
                    </tr>
                `;
            }
        });
        
        // Create modal
        const $modal = $(`
            <div id="${modalId}" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Summary</h2>
                        <button class="close-button" data-modal="${modalId}">&times;</button>
                    </div>
                    <div class="modal-body">
                        <table class="template-options-table">
                            <thead>
                                <tr>
                                    <th style="width: 200px;">Parameter</th>
                                    <th style="width: 40px;"></th>
                                    <th>Options</th>
                                    <th style="width: 100px; text-align: center;">Summary</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${paramRows}
                            </tbody>
                        </table>
                        <div style="text-align: center; margin-top: 0.75rem; display: flex; justify-content: center; gap: 0.5rem; align-items: center;">
                            <button type="button" class="modal-back-button" data-section="Summary">← Back</button>
                            <button type="button" class="generate-section-button" data-section="Summary">Done</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        $('body').append($modal);
        
        // Setup event handlers for each summary parameter
        Object.entries(section.params).forEach(([paramKey, paramOption]) => {
            if (paramKey === 'Summary' || !paramOption.enableSummary) return;
            
            const $textarea = $(`#${paramKey}-textarea`);
            const $select = $(`#${paramKey}-select`);
            const $checkbox = $(`#${paramKey}-summary-modal`);
            
            // Track whether checkbox state was set programmatically
            let isProgrammaticChange = false;
            
            // Textarea input handler
            if ($textarea.length) {
                $textarea.on('input', function() {
                    const value = $(this).val();
                    
                    // Update metrics
                    if (window.metrics) {
                        window.metrics[paramKey] = value;
                    }
                    
                    // Handle auto-check/uncheck for summary checkboxes
                    if (paramOption.enableSummary && $checkbox.length) {
                        let shouldCheck = false;
                        
                        // If the value is not empty, check the checkbox
                        if (value && value.trim() !== "") {
                            shouldCheck = true;
                        }
                        
                        // Apply the checkbox state (programmatically)
                        isProgrammaticChange = true;
                        $checkbox.prop('checked', shouldCheck);
                        isProgrammaticChange = false;
                        
                        // Handle summaryExclude if now checked
                        if (shouldCheck) {
                            handleSummaryExclude(paramKey, paramOption);
                        }
                    }
                    
                    // Update summary
                    updateSummaryNow();
                });
            }
            
            // Dropdown change handler
            if ($select.length) {
                $select.on('change', function() {
                    const selectedValue = $(this).val();
                    const selectedIndex = this.selectedIndex;
                    
                    // Find the selected option object using selectedIndex
                    // Note: selectedIndex includes the "Select..." option, so subtract 1
                    let selectedOption = null;
                    let selectedLabel = null;
                    
                    if (paramOption.options && selectedIndex > 0) {
                        const optionIndex = selectedIndex - 1; // Account for "Select..." option
                        if (optionIndex < paramOption.options.length) {
                            const opt = paramOption.options[optionIndex];
                            selectedOption = typeof opt === 'string' ? null : opt;
                            if (selectedOption) {
                                selectedLabel = selectedOption.label;
                            }
                        }
                    }
                    
                    // Update metrics
                    if (window.metrics) {
                        window.metrics[paramKey] = selectedValue || "";
                    }
                    
                    // Track the selected option object for summary text lookup
                    if (window.selectedOptions && selectedOption) {
                        window.selectedOptions[paramKey] = selectedOption;
                    }
                    
                    // Update custom textarea if it exists and is visible
                    const $customTextarea = $(`#${paramKey}-custom-textarea`);
                    if ($customTextarea.length && $customTextarea.is(':visible')) {
                        $customTextarea.val(selectedValue);
                    }
                    
                    // Handle auto-check/uncheck for summary checkboxes
                    if (paramOption.enableSummary && $checkbox.length) {
                        let shouldCheck = false;
                        
                        // If this is the default option, check based on summaryDefault
                        if (selectedOption && selectedOption.default === true) {
                            shouldCheck = paramOption.summaryDefault === true;
                        }
                        // If summaryThreshold exists, check only labels against threshold
                        else if (paramOption.summaryThreshold && Array.isArray(paramOption.summaryThreshold) && selectedLabel) {
                            shouldCheck = paramOption.summaryThreshold.includes(selectedLabel);
                        }
                        // If summaryNotThreshold exists, check all labels EXCEPT those in the list
                        else if (paramOption.summaryNotThreshold && Array.isArray(paramOption.summaryNotThreshold) && selectedLabel) {
                            shouldCheck = !paramOption.summaryNotThreshold.includes(selectedLabel);
                        }
                        // If summaryOnChange is true, check for any non-default selection
                        else if (paramOption.summaryOnChange === true && selectedOption && selectedOption.default !== true) {
                            shouldCheck = true;
                        }
                        // If none of the above, but summaryDefault is true, keep it checked
                        else if (paramOption.summaryDefault === true && selectedValue !== "") {
                            shouldCheck = true;
                        }
                        
                        // Apply the checkbox state (programmatically)
                        isProgrammaticChange = true;
                        $checkbox.prop('checked', shouldCheck);
                        isProgrammaticChange = false;
                        
                        // Handle summaryExclude if now checked
                        if (shouldCheck) {
                            handleSummaryExclude(paramKey, paramOption);
                        }
                    }
                    
                    // Update summary
                    updateSummaryNow();
                });
            }
            
            // Custom textarea input handler
            const $customTextarea = $(`#${paramKey}-custom-textarea`);
            if ($customTextarea.length) {
                $customTextarea.on('input', function() {
                    const value = $(this).val();
                    
                    // Update metrics with custom text
                    if (window.metrics) {
                        window.metrics[paramKey] = value;
                    }
                    
                    // Handle auto-check for summary checkbox
                    if (paramOption.enableSummary && $checkbox.length) {
                        let shouldCheck = false;
                        if (value && value.trim() !== "") {
                            shouldCheck = true;
                        }
                        isProgrammaticChange = true;
                        $checkbox.prop('checked', shouldCheck);
                        isProgrammaticChange = false;
                    }
                    
                    // Update summary
                    updateSummaryNow();
                });
            }
            
            // Modal edit button handler - shows custom text textarea
            const $editButton = $(`.modal-edit-button[data-param="${paramKey}"]`);
            if ($editButton.length && $select.length && $customTextarea.length) {
                $editButton.on('click', function() {
                    const $customRow = $(`#${paramKey}-custom-row`);
                    if ($customRow.length) {
                        // Toggle visibility
                        if ($customRow.is(':visible')) {
                            $customRow.hide();
                            // Remove grey styling from dropdown
                            $select.css({
                                'opacity': '',
                                'background-color': ''
                            });
                        } else {
                            // Show custom textarea with current dropdown value
                            const currentValue = $select.val();
                            $customTextarea.val(currentValue);
                            $customRow.show();
                            $customTextarea.focus();
                            // Grey out dropdown slightly
                            $select.css({
                                'opacity': '0.6',
                                'background-color': '#f0f0f0'
                            });
                        }
                    }
                });
            }
        });
        
        // Helper function to handle summaryExclude
        function handleSummaryExclude(paramKey, paramOption) {
            if (paramOption.summaryExclude && Array.isArray(paramOption.summaryExclude)) {
                paramOption.summaryExclude.forEach(excludeKey => {
                    const $excludeCheckbox = $(`#${excludeKey}-summary-modal`);
                    if ($excludeCheckbox.length && $excludeCheckbox.is(':checked')) {
                        $excludeCheckbox.prop('checked', false);
                        if (window.summaryCheckboxManuallyEdited) {
                            window.summaryCheckboxManuallyEdited[excludeKey] = true;
                        }
                    }
                });
            }
        }
        
        // Helper to update summary immediately
        function updateSummaryNow() {
            if (typeof window.updateSummary === 'function') {
                window.updateSummary();
            }
        }

            // Template button click
            $(`.template-button[data-section="Summary"]`).on('click', function() {
                // Sync dropdown and textarea values when opening
                Object.entries(section.params).forEach(([paramKey, paramOption]) => {
                    const $select = $(`#${paramKey}-select`);
                    const $textarea = $(`#${paramKey}-textarea`);
                    
                    if ($select.length && window.metrics && window.metrics[paramKey]) {
                        $select.val(window.metrics[paramKey]);
                    }
                    
                    if ($textarea.length && window.metrics && window.metrics[paramKey]) {
                        $textarea.val(window.metrics[paramKey]);
                    }
                });
                $(`#${modalId}`).addClass('active');
            });
        
        // Close button
        $(`.close-button[data-modal="${modalId}"]`).on('click', function() {
            $(`#${modalId}`).removeClass('active');
        });
        
        // Click outside to close
        $(`#${modalId}`).on('click', function(e) {
            if (e.target.id === modalId) {
                $(this).removeClass('active');
            }
        });
        
        // Summary modal Back button - go back to last section
        $(`.modal-back-button[data-section="Summary"]`).on('click', function() {
            // Collect dropdown and textarea values before closing
            Object.entries(section.params).forEach(([paramKey]) => {
                const $select = $(`#${paramKey}-select`);
                const $textarea = $(`#${paramKey}-textarea`);
                
                if ($select.length && window.metrics) {
                    window.metrics[paramKey] = $select.val() || "";
                }
                
                if ($textarea.length && window.metrics) {
                    window.metrics[paramKey] = $textarea.val() || "";
                }
            });
            
            // Update summary
            if (typeof window.updateSummary === 'function') {
                window.updateSummary();
            }
            
            // Close Summary modal
            $(`#${modalId}`).removeClass('active');
            
            // Find and open the last section modal
            const allSections = window.options.filter(s => s.enableSectionPreview && s.sectionPreviewKey);
            if (allSections.length > 0) {
                const lastSection = allSections[allSections.length - 1];
                const lastModalId = `${lastSection.sectionPreviewKey}-modal`;
                $(`#${lastModalId}`).addClass('active');
            }
        });
        
        // Summary modal Done button
        $(`.generate-section-button[data-section="Summary"]`).on('click', function() {
            // Collect dropdown and textarea values before closing
            Object.entries(section.params).forEach(([paramKey]) => {
                const $select = $(`#${paramKey}-select`);
                const $textarea = $(`#${paramKey}-textarea`);
                
                if ($select.length && window.metrics) {
                    window.metrics[paramKey] = $select.val() || "";
                }
                
                if ($textarea.length && window.metrics) {
                    window.metrics[paramKey] = $textarea.val() || "";
                }
            });
            
            // Update summary
            if (typeof window.updateSummary === 'function') {
                window.updateSummary();
            }
            
            $(`#${modalId}`).removeClass('active');
        });
    }
    
    // Create modal for regular section templates
    function createSectionModal(section) {
        const sectionKey = section.sectionPreviewKey;
        const modalId = `${sectionKey}-modal`;
        
        
        // Build parameter rows
        let paramRows = '';
        Object.entries(section.params).forEach(([paramKey, paramOption]) => {
            const isCustom = paramOption.custom === true;
            const hasSummary = paramOption.enableSummary === true;
            const hasCustomText = paramOption.customText !== false; // Show by default unless explicitly disabled
            
            // Build options column content
            let optionsHtml = '';
            let hasEditButton = false;
            if (isCustom) {
                // Custom field - show textarea
                const largeClass = paramOption.large ? 'large' : '';
                const currentValue = window.metrics && window.metrics[paramKey] ? window.metrics[paramKey] : '';
                optionsHtml = `<textarea id="${paramKey}-textarea" class="modal-textarea ${largeClass}" data-param="${paramKey}">${currentValue}</textarea>`;
            } else if (paramOption.options && Array.isArray(paramOption.options)) {
                // Regular dropdown
                optionsHtml = `
                    <select id="${paramKey}-select" data-param="${paramKey}">
                        <option value="">Select...</option>
                        ${paramOption.options.map(opt => {
                            const isString = typeof opt === 'string';
                            const label = isString ? opt : (opt.label || opt.title);
                            const title = isString ? opt : opt.title;
                            const isDefault = !isString && opt.default === true;
                            return `<option value="${title}" ${isDefault ? 'selected' : ''}>${label}</option>`;
                        }).join('')}
                    </select>
                `;
                
                // Show edit button if customText is enabled
                hasEditButton = hasCustomText;
            } else {
                optionsHtml = `<span class="no-options">No options available</span>`;
            }
            
            // Build edit button column HTML
            const editButtonHtml = hasEditButton ? 
                `<button type="button" class="modal-edit-button" data-param="${paramKey}" title="Edit custom text">✎</button>` : 
                '';
            
            // Build summary checkbox (only if enableSummary is true)
            let summaryHtml = '';
            if (hasSummary) {
                const defaultChecked = paramOption.summaryDefault ? 'checked' : '';
                summaryHtml = `<input type="checkbox" id="${paramKey}-summary-modal" data-param="${paramKey}" ${defaultChecked} />`;
            }
            
            paramRows += `
                <tr data-param="${paramKey}">
                    <td class="param-label">${paramOption.title || paramKey}</td>
                    <td class="param-edit">${editButtonHtml}</td>
                    <td class="param-options">${optionsHtml}</td>
                    ${hasSummary ? `<td class="param-summary">${summaryHtml}</td>` : `<td></td>`}
                </tr>
            `;
            
            // Add custom text row if customText is enabled
            if (hasCustomText && !isCustom) {
                const largeClass = paramOption.large ? 'large' : '';
                paramRows += `
                    <tr id="${paramKey}-custom-row" class="custom-text-row" style="display: none;">
                        <td style="border-top: none; padding-top: 0;"></td>
                        <td style="border-top: none; padding-top: 0;"></td>
                        <td style="border-top: none; padding-top: 0;">
                            <textarea id="${paramKey}-custom-textarea" class="modal-textarea ${largeClass}" data-param="${paramKey}" placeholder="Edit custom text..."></textarea>
                        </td>
                        <td style="border-top: none; padding-top: 0;"></td>
                    </tr>
                `;
            }
        });
        
        // Create modal
        const $modal = $(`
            <div id="${modalId}" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${section.title}</h2>
                        <button class="close-button" data-modal="${modalId}">&times;</button>
                    </div>
                    <div class="modal-body">
                        <table class="template-options-table">
                            <thead>
                                <tr>
                                    <th style="width: 200px;">Parameter</th>
                                    <th style="width: 40px;"></th>
                                    <th>Options</th>
                                    <th style="width: 100px; text-align: center;">Summary</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${paramRows}
                            </tbody>
                        </table>
                        <div style="text-align: center; margin-top: 0.75rem; display: flex; justify-content: center; gap: 0.5rem; align-items: center;">
                            <button type="button" class="modal-back-button" data-section="${sectionKey}">← Back</button>
                            <button type="button" class="modal-exclude-button" data-section="${sectionKey}" title="Exclude section from report">−</button>
                            <button type="button" class="generate-section-button" data-section="${sectionKey}">Done</button>
                            <button type="button" class="modal-next-button" data-section="${sectionKey}">Next →</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        $('body').append($modal);
        
        // Setup event handlers for each parameter
        Object.entries(section.params).forEach(([paramKey, paramOption]) => {
            const $textarea = $(`#${paramKey}-textarea`);
            const $select = $(`#${paramKey}-select`);
            const $checkbox = $(`#${paramKey}-summary-modal`);
            
            // Track whether checkbox state was set programmatically
            let isProgrammaticChange = false;
            
            // Textarea input handler
            if ($textarea.length) {
                $textarea.on('input', function() {
                    const value = $(this).val();
                    
                    // Update metrics
                    if (window.metrics) {
                        window.metrics[paramKey] = value;
                    }
                    
                    // Handle auto-check/uncheck for summary checkboxes
                    if (paramOption.enableSummary && $checkbox.length) {
                        let shouldCheck = false;
                        
                        // If the value is not empty, check the checkbox
                        if (value && value.trim() !== "") {
                            shouldCheck = true;
                        }
                        
                        // Apply the checkbox state (programmatically)
                        isProgrammaticChange = true;
                        $checkbox.prop('checked', shouldCheck);
                        isProgrammaticChange = false;
                        
                        // Handle summaryExclude if now checked
                        if (shouldCheck) {
                            handleSummaryExclude(paramKey, paramOption);
                        }
                    }
                    
                    // Update summary
                    updateSummaryNow();
                });
            }
            
            // Dropdown change handler
            if ($select.length) {
                $select.on('change', function() {
                    const selectedValue = $(this).val();
                    const selectedIndex = this.selectedIndex;
                    
                    // Find the selected option object using selectedIndex
                    // Note: selectedIndex includes the "Select..." option, so subtract 1
                    let selectedOption = null;
                    let selectedLabel = null;
                    
                    if (paramOption.options && selectedIndex > 0) {
                        const optionIndex = selectedIndex - 1; // Account for "Select..." option
                        if (optionIndex < paramOption.options.length) {
                            const opt = paramOption.options[optionIndex];
                            selectedOption = typeof opt === 'string' ? null : opt;
                            if (selectedOption) {
                                selectedLabel = selectedOption.label;
                            }
                        }
                    }
                    
                    // Update metrics
                    if (window.metrics) {
                        window.metrics[paramKey] = selectedValue || "";
                    }
                    
                    // Mark that this modal session had changes
                    if (window.modalChangedInSession && window.modalInitialState && section.sectionPreviewKey) {
                        const initialValue = window.modalInitialState[section.sectionPreviewKey][paramKey];
                        if (initialValue !== selectedValue) {
                            window.modalChangedInSession[section.sectionPreviewKey] = true;
                        }
                    }
                    
                    // Track the selected option object for summary text lookup
                    if (window.selectedOptions && selectedOption) {
                        window.selectedOptions[paramKey] = selectedOption;
                    }
                    
                    // Update custom textarea if it exists and is visible
                    const $customTextarea = $(`#${paramKey}-custom-textarea`);
                    if ($customTextarea.length && $customTextarea.is(':visible')) {
                        $customTextarea.val(selectedValue);
                    }
                    
                    // Handle auto-check/uncheck for summary checkboxes
                    if (paramOption.enableSummary && $checkbox.length) {
                        let shouldCheck = false;
                        
                        // If this is the default option, check based on summaryDefault
                        if (selectedOption && selectedOption.default === true) {
                            shouldCheck = paramOption.summaryDefault === true;
                        }
                        // If summaryThreshold exists, check only labels against threshold
                        else if (paramOption.summaryThreshold && Array.isArray(paramOption.summaryThreshold) && selectedLabel) {
                            shouldCheck = paramOption.summaryThreshold.includes(selectedLabel);
                        }
                        // If summaryNotThreshold exists, check all labels EXCEPT those in the list
                        else if (paramOption.summaryNotThreshold && Array.isArray(paramOption.summaryNotThreshold) && selectedLabel) {
                            shouldCheck = !paramOption.summaryNotThreshold.includes(selectedLabel);
                        }
                        // If summaryOnChange is true, check for any non-default selection
                        else if (paramOption.summaryOnChange === true && selectedOption && selectedOption.default !== true) {
                            shouldCheck = true;
                        }
                        // If none of the above, but summaryDefault is true, keep it checked
                        else if (paramOption.summaryDefault === true && selectedValue !== "") {
                            shouldCheck = true;
                        }
                        
                        // Apply the checkbox state (programmatically)
                        isProgrammaticChange = true;
                        $checkbox.prop('checked', shouldCheck);
                        isProgrammaticChange = false;
                        
                        // Handle summaryExclude if now checked
                        if (shouldCheck) {
                            handleSummaryExclude(paramKey, paramOption);
                        }
                    }
                    
                    // Update summary
                    updateSummaryNow();
                });
            }
            
            // Custom textarea input handler
            const $customTextarea = $(`#${paramKey}-custom-textarea`);
            if ($customTextarea.length) {
                $customTextarea.on('input', function() {
                    const value = $(this).val();
                    
                    // Update metrics with custom text
                    if (window.metrics) {
                        window.metrics[paramKey] = value;
                    }
                    
                    // Update summary
                    updateSummaryNow();
                });
            }
            
            // Modal edit button handler - shows custom text textarea
            const $editButton = $(`.modal-edit-button[data-param="${paramKey}"]`);
            if ($editButton.length && $select.length && $customTextarea.length) {
                $editButton.on('click', function() {
                    const $customRow = $(`#${paramKey}-custom-row`);
                    if ($customRow.length) {
                        // Toggle visibility
                        if ($customRow.is(':visible')) {
                            $customRow.hide();
                            // Remove grey styling from dropdown
                            $select.css({
                                'opacity': '',
                                'background-color': ''
                            });
                        } else {
                            // Show custom textarea with current dropdown value
                            const currentValue = $select.val();
                            $customTextarea.val(currentValue);
                            $customRow.show();
                            $customTextarea.focus();
                            // Grey out dropdown slightly
                            $select.css({
                                'opacity': '0.6',
                                'background-color': '#f0f0f0'
                            });
                        }
                    }
                });
            }

            // Helper function to handle summaryExclude
            function handleSummaryExclude(paramKey, paramOption) {
                if (paramOption.summaryExclude && Array.isArray(paramOption.summaryExclude)) {
                    paramOption.summaryExclude.forEach(excludeKey => {
                        const $excludeCheckbox = $(`#${excludeKey}-summary-modal`);
                        if ($excludeCheckbox.length && $excludeCheckbox.is(':checked')) {
                            $excludeCheckbox.prop('checked', false);
                            if (window.summaryCheckboxManuallyEdited) {
                                window.summaryCheckboxManuallyEdited[excludeKey] = true;
                            }
                        }
                    });
                }
            }
            
            // Helper to update summary immediately
            function updateSummaryNow() {
                if (typeof window.updateSummary === 'function') {
                    window.updateSummary();
                }
            }
        });
        
        // Template button click
        $(`.template-button[data-section="${sectionKey}"]`).on('click', function() {
                // Sync dropdown and textarea values when opening
                Object.entries(section.params).forEach(([paramKey, paramOption]) => {
                    const $select = $(`#${paramKey}-select`);
                    const $textarea = $(`#${paramKey}-textarea`);
                    
                    if ($select.length && window.metrics && window.metrics[paramKey]) {
                        $select.val(window.metrics[paramKey]);
                    }
                    
                    if ($textarea.length && window.metrics && window.metrics[paramKey]) {
                        $textarea.val(window.metrics[paramKey]);
                    }
                });
                
                // Sync exclude button state and modal appearance
                const $modal = $(`#${modalId}`);
                const $modalBody = $modal.find('.modal-body');
                const $modalExcludeButton = $(`.modal-exclude-button[data-section="${sectionKey}"]`);
                
                if (window.excludedSections && window.excludedSections[sectionKey]) {
                    $modalBody.addClass('excluded-modal');
                    $modalExcludeButton.text('+').attr('title', 'Include section in report');
                } else {
                    $modalBody.removeClass('excluded-modal');
                    $modalExcludeButton.text('−').attr('title', 'Exclude section from report');
                }
                
                // Track initial state when modal opens
                if (!window.modalInitialState) {
                    window.modalInitialState = {};
                }
                if (!window.modalChangedInSession) {
                    window.modalChangedInSession = {};
                }
                
                // Store initial state for this section
                window.modalInitialState[sectionKey] = {};
                window.modalChangedInSession[sectionKey] = false;
                
                Object.entries(section.params).forEach(([paramKey]) => {
                    window.modalInitialState[sectionKey][paramKey] = window.metrics ? window.metrics[paramKey] : '';
                });
                
                $(`#${modalId}`).addClass('active');
            });
        
        // Close button
        $(`.close-button[data-modal="${modalId}"]`).on('click', function() {
            $(`#${modalId}`).removeClass('active');
        });
        
        // Click outside to close
        $(`#${modalId}`).on('click', function(e) {
            if (e.target.id === modalId) {
                $(this).removeClass('active');
            }
        });
        
        // Generate Text button
        $(`.generate-section-button[data-section="${sectionKey}"]`).on('click', function() {
            // Collect dropdown and textarea values
            Object.entries(section.params).forEach(([paramKey]) => {
                const $select = $(`#${paramKey}-select`);
                const $textarea = $(`#${paramKey}-textarea`);
                const $customTextarea = $(`#${paramKey}-custom-textarea`);
                
                // Check custom textarea first (highest priority)
                if ($customTextarea.length && $customTextarea.is(':visible')) {
                    if (window.metrics) {
                        window.metrics[paramKey] = $customTextarea.val() || "";
                    }
                }
                // Then check regular dropdowns
                else if ($select.length && window.metrics) {
                    window.metrics[paramKey] = $select.val() || "";
                }
                // Finally check custom textareas
                else if ($textarea.length && window.metrics) {
                    window.metrics[paramKey] = $textarea.val() || "";
                }
            });
            
            // Check if we should warn about overwriting manual edits
            const hasManualEdits = window.sectionPreviewManuallyEdited && window.sectionPreviewManuallyEdited[sectionKey];
            const hasModalChanges = window.modalChangedInSession && window.modalChangedInSession[sectionKey];
            
            if (hasManualEdits && hasModalChanges) {
                const confirmOverwrite = confirm(
                    "You have manual edits in this section. Updating from the modal will overwrite them.\n\n" +
                    "Click OK to overwrite your manual edits, or Cancel to keep them."
                );
                
                if (!confirmOverwrite) {
                    // User chose to keep manual edits - close modal without updating
                    $(`#${modalId}`).removeClass('active');
                    return;
                }
            }
            
            // Update section preview
            if (window.sectionPreviewManuallyEdited) {
                window.sectionPreviewManuallyEdited[sectionKey] = false;
            }
            if (typeof window.updateSectionPreview === 'function') {
                window.updateSectionPreview(sectionKey);
            }
            
            // Update summary
            if (typeof window.updateSummary === 'function') {
                window.updateSummary();
            }
            
            $(`#${modalId}`).removeClass('active');
        });
        
        // Modal Exclude button handler
        $(`.modal-exclude-button[data-section="${sectionKey}"]`).on('click', function() {
            // Initialize excludedSections if needed
            if (!window.excludedSections) {
                window.excludedSections = {};
            }
            
            // Toggle excluded state
            const isExcluded = window.excludedSections[sectionKey] || false;
            window.excludedSections[sectionKey] = !isExcluded;
            
            const $modal = $(`#${modalId}`);
            const $modalBody = $modal.find('.modal-body');
            const $excludeButton = $(this);
            const $formTextarea = $(`#${sectionKey}-textarea`);
            const $formExcludeButton = $(`.exclude-button[data-section="${sectionKey}"]`);
            const $formEditButton = $(`.template-button[data-section="${sectionKey}"]`);
            
            if (window.excludedSections[sectionKey]) {
                // Exclude: grey out modal, update button, sync with form
                $modalBody.addClass('excluded-modal');
                $excludeButton.text('+').attr('title', 'Include section in report');
                
                // Sync with form buttons and textarea
                $formTextarea.addClass('excluded').prop('disabled', true).css('height', '32px');
                $formEditButton.hide();
                $formExcludeButton.text('+').attr('title', 'Include section in report');
            } else {
                // Include: restore modal, update button, sync with form
                $modalBody.removeClass('excluded-modal');
                $excludeButton.text('−').attr('title', 'Exclude section from report');
                
                // Sync with form buttons and textarea
                $formTextarea.removeClass('excluded').prop('disabled', false).css('height', '');
                if (typeof window.autoResizeTextarea === 'function') {
                    window.autoResizeTextarea($formTextarea);
                }
                $formEditButton.show();
                $formExcludeButton.text('−').attr('title', 'Exclude section from report');
            }
            
            // Update summary
            if (typeof window.updateSummary === 'function') {
                window.updateSummary();
            }
        });
        
        // Modal Back button handler
        $(`.modal-back-button[data-section="${sectionKey}"]`).on('click', function() {
            // Close current modal
            $(`#${modalId}`).removeClass('active');
            
            // Find and open previous section modal
            const allSections = window.options.filter(s => s.enableSectionPreview && s.sectionPreviewKey);
            const currentIndex = allSections.findIndex(s => s.sectionPreviewKey === sectionKey);
            
            if (currentIndex > 0) {
                // Open previous section's modal
                const prevSection = allSections[currentIndex - 1];
                const prevModalId = `${prevSection.sectionPreviewKey}-modal`;
                $(`#${prevModalId}`).addClass('active');
            }
        });
        
        // Modal Next button handler
        $(`.modal-next-button[data-section="${sectionKey}"]`).on('click', function() {
            // First, update the current section (same as Done button)
            Object.entries(section.params).forEach(([paramKey]) => {
                const $select = $(`#${paramKey}-select`);
                const $textarea = $(`#${paramKey}-textarea`);
                const $customTextarea = $(`#${paramKey}-custom-textarea`);
                
                if ($customTextarea.length && $customTextarea.is(':visible')) {
                    if (window.metrics) {
                        window.metrics[paramKey] = $customTextarea.val() || "";
                    }
                }
                else if ($select.length && window.metrics) {
                    window.metrics[paramKey] = $select.val() || "";
                }
                else if ($textarea.length && window.metrics) {
                    window.metrics[paramKey] = $textarea.val() || "";
                }
            });
            
            // Check if we should warn about overwriting manual edits
            const hasManualEdits = window.sectionPreviewManuallyEdited && window.sectionPreviewManuallyEdited[sectionKey];
            const hasModalChanges = window.modalChangedInSession && window.modalChangedInSession[sectionKey];
            
            if (hasManualEdits && hasModalChanges) {
                const confirmOverwrite = confirm(
                    "You have manual edits in this section. Updating from the modal will overwrite them.\n\n" +
                    "Click OK to overwrite your manual edits, or Cancel to keep them and move to next section."
                );
                
                if (!confirmOverwrite) {
                    // User chose to keep manual edits - just move to next without updating
                    $(`#${modalId}`).removeClass('active');
                    
                    // Find and open next section modal or Summary modal
                    const allSections = window.options.filter(s => s.enableSectionPreview && s.sectionPreviewKey);
                    const currentIndex = allSections.findIndex(s => s.sectionPreviewKey === sectionKey);
                    
                    if (currentIndex >= 0 && currentIndex < allSections.length - 1) {
                        const nextSection = allSections[currentIndex + 1];
                        const nextModalId = `${nextSection.sectionPreviewKey}-modal`;
                        $(`#${nextModalId}`).addClass('active');
                    } else if (currentIndex === allSections.length - 1) {
                        // This is the last section - open Summary modal
                        $('#Summary-modal').addClass('active');
                    }
                    return;
                }
            }
            
            if (window.sectionPreviewManuallyEdited) {
                window.sectionPreviewManuallyEdited[sectionKey] = false;
            }
            if (typeof window.updateSectionPreview === 'function') {
                window.updateSectionPreview(sectionKey);
            }
            if (typeof window.updateSummary === 'function') {
                window.updateSummary();
            }
            
            // Close current modal
            $(`#${modalId}`).removeClass('active');
            
            // Find and open next section modal or Summary modal
            const allSections = window.options.filter(s => s.enableSectionPreview && s.sectionPreviewKey);
            const currentIndex = allSections.findIndex(s => s.sectionPreviewKey === sectionKey);
            
            if (currentIndex >= 0 && currentIndex < allSections.length - 1) {
                // Open next section's modal immediately
                const nextSection = allSections[currentIndex + 1];
                const nextModalId = `${nextSection.sectionPreviewKey}-modal`;
                $(`#${nextModalId}`).addClass('active');
            } else if (currentIndex === allSections.length - 1) {
                // This is the last section - open Summary modal
                $('#Summary-modal').addClass('active');
            }
        });
    }
    
    // Expose buildForm globally
    window.buildForm = buildForm;
    
    // Trigger initialization
    if (typeof window.initializeReportForm === 'function') {
        window.initializeReportForm();
    }
    
});