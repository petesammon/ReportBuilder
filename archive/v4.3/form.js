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
        
        // Build sections with textareas
        window.options.forEach(section => {
            if (section.enableSectionPreview && section.sectionPreviewKey) {
                const sectionKey = section.sectionPreviewKey;
                
                const $sectionRow = $(`
                    <div class="form-row" data-section="${sectionKey}">
                        <div class="form-left">
                            <h3>${section.title}</h3>
                            <button type="button" class="template-button" data-section="${sectionKey}">+</button>
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
                            <button type="button" class="template-button" data-section="Summary">+</button>
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
            
            // Build dropdown if options exist
            let optionsHtml = '';
            if (paramOption.options && Array.isArray(paramOption.options)) {
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
                <tr data-param="${paramKey}">
                    <td class="param-label">${paramOption.title || paramKey}</td>
                    <td class="param-options">${optionsHtml}</td>
                    <td class="param-summary">${summaryHtml}</td>
                </tr>
            `;
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
            
            const $select = $(`#${paramKey}-select`);
            const $checkbox = $(`#${paramKey}-summary-modal`);
            
            let isProgrammaticChange = false;
            
            // Dropdown change handler
            if ($select.length) {
                $select.on('change', function() {
                    const selectedValue = $(this).val();
                    
                    if (window.metrics) {
                        window.metrics[paramKey] = selectedValue || "";
                    }
                    
                    // Auto-check/uncheck logic
                    if (paramOption.enableSummary && $checkbox.length) {
                        let shouldCheck = false;
                        
                        let selectedOption = null;
                        let selectedLabel = null;
                        
                        if (paramOption.options) {
                            selectedOption = paramOption.options.find(opt => {
                                const title = typeof opt === 'string' ? opt : opt.title;
                                return title === selectedValue;
                            });
                            
                            if (selectedOption && typeof selectedOption !== 'string') {
                                selectedLabel = selectedOption.label;
                            }
                        }
                        
                        // Check default option
                        if (selectedOption && selectedOption.default === true) {
                            shouldCheck = paramOption.summaryDefault === true;
                        }
                        // Check threshold
                        else if (paramOption.summaryThreshold && Array.isArray(paramOption.summaryThreshold) && selectedLabel) {
                            shouldCheck = paramOption.summaryThreshold.includes(selectedLabel);
                        }
                        // Check summaryOnChange
                        else if (paramOption.summaryOnChange === true && selectedValue !== "" && !(selectedOption && selectedOption.default === true)) {
                            shouldCheck = true;
                        }
                        
                        isProgrammaticChange = true;
                        $checkbox.prop('checked', shouldCheck);
                        isProgrammaticChange = false;
                        
                        if (shouldCheck) {
                            handleSummaryExclude(paramKey, paramOption);
                        }
                    }
                    
                    updateSummaryNow();
                });
            }
            
            // Checkbox change handler
            if ($checkbox.length) {
                $checkbox.on('change', function() {
                    if (!isProgrammaticChange) {
                        if (window.summaryCheckboxManuallyEdited) {
                            window.summaryCheckboxManuallyEdited[paramKey] = true;
                        }
                    }
                    
                    if ($(this).is(':checked')) {
                        handleSummaryExclude(paramKey, paramOption);
                    }
                    
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
        $(`.template-button[data-section="Summary"]`).on('click', function() {
            // Sync dropdown values when opening
            Object.entries(section.params).forEach(([paramKey]) => {
                const $select = $(`#${paramKey}-select`);
                if ($select.length && window.metrics && window.metrics[paramKey]) {
                    $select.val(window.metrics[paramKey]);
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
        
        // Done button
        $(`.update-summary-button`).on('click', function() {
            // Collect dropdown values
            Object.entries(section.params).forEach(([paramKey]) => {
                const $select = $(`#${paramKey}-select`);
                if ($select.length && window.metrics) {
                    window.metrics[paramKey] = $select.val() || "";
                }
            });
            
            // Update summary
            if (typeof window.updateSummary === 'function') {
                window.updateSummary();
            }
            
            $(`#${modalId}`).removeClass('active');
        });
    }
    
    // Create modal for a section
    function createSectionModal(section) {
        const sectionKey = section.sectionPreviewKey;
        const modalId = `${sectionKey}-modal`;
        
        // Build parameter rows
        let paramRows = '';
        Object.entries(section.params).forEach(([paramKey, paramOption]) => {
            const hasSummary = paramOption.enableSummary === true;
            
            // Build dropdown
            let optionsHtml = '';
            if (paramOption.options && Array.isArray(paramOption.options)) {
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
            let summaryHtml = '';
            if (hasSummary) {
                const defaultChecked = paramOption.summaryDefault ? 'checked' : '';
                summaryHtml = `<input type="checkbox" id="${paramKey}-summary-modal" data-param="${paramKey}" ${defaultChecked} />`;
            }
            
            paramRows += `
                <tr data-param="${paramKey}">
                    <td class="param-label">${paramOption.title || paramKey}</td>
                    <td class="param-options">${optionsHtml}</td>
                    <td class="param-summary">${summaryHtml}</td>
                </tr>
            `;
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
                            <button type="button" class="generate-section-button" data-section="${sectionKey}">Done</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        $('body').append($modal);
        
        // Setup event handlers for each parameter
        Object.entries(section.params).forEach(([paramKey, paramOption]) => {
            const $select = $(`#${paramKey}-select`);
            const $checkbox = $(`#${paramKey}-summary-modal`);
            
            // Flag to track programmatic checkbox changes
            let isProgrammaticChange = false;
            
            // Dropdown change handler
            if ($select.length) {
                $select.on('change', function() {
                    const selectedValue = $(this).val();
                    
                    // Update metrics
                    if (window.metrics) {
                        window.metrics[paramKey] = selectedValue || "";
                    }
                    
                    // Handle auto-check/uncheck for summary checkboxes
                    if (paramOption.enableSummary && $checkbox.length) {
                        let shouldCheck = false;
                        
                        // Find the selected option object
                        let selectedOption = null;
                        let selectedLabel = null;
                        
                        if (paramOption.options) {
                            selectedOption = paramOption.options.find(opt => {
                                const title = typeof opt === 'string' ? opt : opt.title;
                                return title === selectedValue;
                            });
                            
                            if (selectedOption && typeof selectedOption !== 'string') {
                                selectedLabel = selectedOption.label;
                            }
                        }
                        
                        // If this is the default option, uncheck (unless summaryDefault is true)
                        if (selectedOption && selectedOption.default === true) {
                            shouldCheck = paramOption.summaryDefault === true;
                        }
                        // If summaryThreshold exists, check only labels against threshold
                        else if (paramOption.summaryThreshold && Array.isArray(paramOption.summaryThreshold) && selectedLabel) {
                            shouldCheck = paramOption.summaryThreshold.includes(selectedLabel);
                        }
                        // If no threshold but summaryOnChange is true, check for any non-default selection
                        else if (paramOption.summaryOnChange === true && selectedValue !== "" && !(selectedOption && selectedOption.default === true)) {
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
            
            // Checkbox change handler
            if ($checkbox.length) {
                $checkbox.on('change', function() {
                    // Only mark as manually edited if this wasn't a programmatic change
                    if (!isProgrammaticChange) {
                        if (window.summaryCheckboxManuallyEdited) {
                            window.summaryCheckboxManuallyEdited[paramKey] = true;
                        }
                    }
                    
                    // Handle exclude if checked
                    if ($(this).is(':checked')) {
                        handleSummaryExclude(paramKey, paramOption);
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
        $(`.template-button[data-section="${sectionKey}"]`).on('click', function() {
            // Sync dropdown values when opening
            Object.entries(section.params).forEach(([paramKey]) => {
                const $select = $(`#${paramKey}-select`);
                if ($select.length && window.metrics && window.metrics[paramKey]) {
                    $select.val(window.metrics[paramKey]);
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
            // Collect dropdown values
            Object.entries(section.params).forEach(([paramKey]) => {
                const $select = $(`#${paramKey}-select`);
                if ($select.length && window.metrics) {
                    window.metrics[paramKey] = $select.val() || "";
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