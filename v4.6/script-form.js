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
            
            // Check if this parameter needs conditional text
            // Has non-default options with empty titles (for free text entry)
            const hasConditionalText = paramOption.options && Array.isArray(paramOption.options) && 
                paramOption.options.some(opt => {
                    if (typeof opt === 'string') return false;
                    const title = opt.title;
                    const isDefault = opt.default === true;
                    return title === "" && !isDefault;
                });
            
            // Build options column content
            let optionsHtml = '';
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
            } else {
                optionsHtml = `<span class="no-options">No options available</span>`;
            }
            
            // Build summary checkbox
            const defaultChecked = paramOption.summaryDefault ? 'checked' : '';
            const summaryHtml = `<input type="checkbox" id="${paramKey}-summary-modal" data-param="${paramKey}" ${defaultChecked} />`;
            
            paramRows += `
                <tr data-param="${paramKey}" ${hasConditionalText ? 'class="has-conditional-text"' : ''}>
                    <td class="param-label" ${hasConditionalText ? 'style="border-bottom: none; padding-bottom: 0.25rem;"' : ''}>${paramOption.title || paramKey}</td>
                    <td class="param-options" ${hasConditionalText ? 'style="border-bottom: none; padding-bottom: 0.25rem;"' : ''}>${optionsHtml}</td>
                    <td class="param-summary" ${hasConditionalText ? 'style="border-bottom: none; padding-bottom: 0.25rem;"' : ''}>${summaryHtml}</td>
                </tr>
            `;
            
            // Add conditional text row if needed
            if (hasConditionalText && !isCustom) {
                const largeClass = paramOption.large ? 'large' : '';
                paramRows += `
                    <tr id="${paramKey}-conditional-row" class="conditional-text-row" style="display: none;">
                        <td style="border-top: none; padding-top: 0;"></td>
                        <td colspan="2" style="border-top: none; padding-top: 0;">
                            <textarea id="${paramKey}-conditional-textarea" class="modal-textarea ${largeClass}" data-param="${paramKey}" placeholder="Enter custom text..."></textarea>
                        </td>
                    </tr>
                `;
            }
        });
        
        // Create modal
        const $modal = $(`
            <div id="${modalId}" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Summary - Template Options</h2>
                        <button class="close-button" data-modal="${modalId}">&times;</button>
                    </div>
                    <div class="modal-body">
                        <table class="template-options-table">
                            <thead>
                                <tr>
                                    <th style="width: 200px;">Parameter</th>
                                    <th>Options</th>
                                    <th style="width: 100px; text-align: center;">Summary</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${paramRows}
                            </tbody>
                        </table>
                        <div style="text-align: center; margin-top: 0.75rem;">
                            <button type="button" class="update-summary-button">Done</button>
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
                    
                    // Determine if conditional textarea should be shown
                    // Logic: title is "" (empty) AND NOT default: true
                    const shouldShowConditional = selectedOption && 
                                                   selectedOption.title === "" && 
                                                   selectedOption.default !== true;
                    
                    // Handle conditional text (show/hide textarea based on selection)
                    const $conditionalRow = $(`#${paramKey}-conditional-row`);
                    const $conditionalTextarea = $(`#${paramKey}-conditional-textarea`);
                    
                    if ($conditionalRow.length && shouldShowConditional) {
                        // Show conditional textarea
                        $conditionalRow.show();
                        $conditionalTextarea.val("");
                        if (window.metrics) {
                            window.metrics[paramKey] = "";
                        }
                        $conditionalTextarea.focus();
                    } else if ($conditionalRow.length) {
                        // Hide conditional textarea
                        $conditionalRow.hide();
                        $conditionalTextarea.val("");
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
            
            // Conditional textarea input handler
            const $conditionalTextarea = $(`#${paramKey}-conditional-textarea`);
            if ($conditionalTextarea.length) {
                $conditionalTextarea.on('input', function() {
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
        
        // Update Summary button (the "Done" button in the modal)
        $(`.update-summary-button`).on('click', function() {
            // Collect dropdown and textarea values
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
            
            // Check if this parameter needs conditional text
            // Has non-default options with empty titles (for free text entry)
            const hasConditionalText = paramOption.options && Array.isArray(paramOption.options) && 
                paramOption.options.some(opt => {
                    if (typeof opt === 'string') return false;
                    const title = opt.title;
                    const isDefault = opt.default === true;
                    return title === "" && !isDefault;
                });
            
            // Build options column content
            let optionsHtml = '';
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
            } else {
                optionsHtml = `<span class="no-options">No options available</span>`;
            }
            
            // Build summary checkbox (only if enableSummary is true)
            let summaryHtml = '';
            if (hasSummary) {
                const defaultChecked = paramOption.summaryDefault ? 'checked' : '';
                summaryHtml = `<input type="checkbox" id="${paramKey}-summary-modal" data-param="${paramKey}" ${defaultChecked} />`;
            }
            
            paramRows += `
                <tr data-param="${paramKey}" ${hasConditionalText ? 'class="has-conditional-text"' : ''}>
                    <td class="param-label" ${hasConditionalText ? 'style="border-bottom: none; padding-bottom: 0.25rem;"' : ''}>${paramOption.title || paramKey}</td>
                    <td class="param-options" ${hasConditionalText ? 'style="border-bottom: none; padding-bottom: 0.25rem;"' : ''}>${optionsHtml}</td>
                    ${hasSummary ? `<td class="param-summary" ${hasConditionalText ? 'style="border-bottom: none; padding-bottom: 0.25rem;"' : ''}>${summaryHtml}</td>` : `<td ${hasConditionalText ? 'style="border-bottom: none; padding-bottom: 0.25rem;"' : ''}></td>`}
                </tr>
            `;
            
            // Add conditional text row if needed
            if (hasConditionalText && !isCustom) {
                const largeClass = paramOption.large ? 'large' : '';
                paramRows += `
                    <tr id="${paramKey}-conditional-row" class="conditional-text-row" style="display: none;">
                        <td style="border-top: none; padding-top: 0;"></td>
                        <td colspan="${hasSummary ? 2 : 1}" style="border-top: none; padding-top: 0;">
                            <textarea id="${paramKey}-conditional-textarea" class="modal-textarea ${largeClass}" data-param="${paramKey}" placeholder="Enter custom text..."></textarea>
                        </td>
                        ${hasSummary ? '<td style="border-top: none; padding-top: 0;"></td>' : ''}
                    </tr>
                `;
            }
        });
        
        // Create modal
        const $modal = $(`
            <div id="${modalId}" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${section.title} - Template Options</h2>
                        <button class="close-button" data-modal="${modalId}">&times;</button>
                    </div>
                    <div class="modal-body">
                        <table class="template-options-table">
                            <thead>
                                <tr>
                                    <th style="width: 200px;">Parameter</th>
                                    <th>Options</th>
                                    <th style="width: 100px; text-align: center;">Summary</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${paramRows}
                            </tbody>
                        </table>
                        <div style="text-align: center; margin-top: 0.75rem;">
                            <button type="button" class="generate-section-button" data-section="${sectionKey}">Generate Text</button>
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
                    
                    // Track the selected option object for summary text lookup
                    if (window.selectedOptions && selectedOption) {
                        window.selectedOptions[paramKey] = selectedOption;
                    }
                    
                    // Determine if conditional textarea should be shown
                    // Logic: title is "" (empty) AND NOT default: true
                    const shouldShowConditional = selectedOption && 
                                                   selectedOption.title === "" && 
                                                   selectedOption.default !== true;
                    
                    // Handle conditional text (show/hide textarea based on selection)
                    const $conditionalRow = $(`#${paramKey}-conditional-row`);
                    const $conditionalTextarea = $(`#${paramKey}-conditional-textarea`);
                    
                    if ($conditionalRow.length && shouldShowConditional) {
                        // Show conditional textarea
                        $conditionalRow.show();
                        $conditionalTextarea.val("");
                        if (window.metrics) {
                            window.metrics[paramKey] = "";
                        }
                        $conditionalTextarea.focus();
                    } else if ($conditionalRow.length) {
                        // Hide conditional textarea
                        $conditionalRow.hide();
                        $conditionalTextarea.val("");
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
            
            // Conditional textarea input handler
            const $conditionalTextarea = $(`#${paramKey}-conditional-textarea`);
            if ($conditionalTextarea.length) {
                $conditionalTextarea.on('input', function() {
                    const value = $(this).val();
                    
                    // Update metrics with custom text
                    if (window.metrics) {
                        window.metrics[paramKey] = value;
                    }
                    
                    // Update summary
                    updateSummaryNow();
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
                const $conditionalTextarea = $(`#${paramKey}-conditional-textarea`);
                
                // Check conditional textarea first (highest priority)
                if ($conditionalTextarea.length && $conditionalTextarea.is(':visible')) {
                    if (window.metrics) {
                        window.metrics[paramKey] = $conditionalTextarea.val() || "";
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
    }
    
    // Expose buildForm globally
    window.buildForm = buildForm;
    
    // Trigger initialization
    if (typeof window.initializeReportForm === 'function') {
        window.initializeReportForm();
    }
    
});