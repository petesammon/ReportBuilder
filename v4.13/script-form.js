// form.js - Clean rebuild of form builder with auto-summary
// REFACTORED VERSION - Shared utilities eliminate duplication

jQuery(document).ready(function () {
    
    // Initialize default state without creating modals (for lazy loading)
    // This populates window.selectedOptions and window.summaryCheckboxStates
    // so that updateSummary() can generate summary text even before modals exist
    function initializeDefaultState() {
        // Initialize or preserve existing state
        if (!window.selectedOptions) {
            window.selectedOptions = {};
        }
        if (!window.summaryCheckboxStates) {
            window.summaryCheckboxStates = {};
        }
        
        // Iterate through all sections and parameters
        window.options.forEach(section => {
            if (!section.params) return;
            
            Object.entries(section.params).forEach(([paramKey, paramOption]) => {
                // Initialize dropdown/option defaults
                if (paramOption.options && Array.isArray(paramOption.options)) {
                    // Find the default option
                    const defaultOption = paramOption.options.find(opt => 
                        typeof opt !== 'string' && opt.default === true
                    );
                    
                    if (defaultOption) {
                        // Store the full option object (includes summarytext, etc.)
                        window.selectedOptions[paramKey] = defaultOption;
                        
                        // Store the title in metrics (for display/templates)
                        // Only set default if value doesn't already exist (preserve user selections)
                        if (window.metrics && window.metrics[paramKey] === undefined) {
                            window.metrics[paramKey] = defaultOption.title;
                        }
                    }
                }
                // Initialize customtext options with empty string
                else if (paramOption.options === "customtext") {
                    if (window.metrics && window.metrics[paramKey] === undefined) {
                        window.metrics[paramKey] = "";
                    }
                    // Store a pseudo-option for summary text
                    if (paramOption.summarytext) {
                        window.selectedOptions[paramKey] = {
                            title: "",
                            summarytext: paramOption.summarytext
                        };
                    }
                }
                
                // Initialize summary checkbox states
                if (paramOption.enableSummary === true) {
                    // Only initialize if not already set (preserve user changes)
                    if (window.summaryCheckboxStates[paramKey] === undefined) {
                        // Use summaryDefault from config, default to false
                        window.summaryCheckboxStates[paramKey] = paramOption.summaryDefault === true;
                    }
                }
            });
        });
    }
    
    // Build the form layout
    function buildForm() {
        const $formContainer = $("#options-content");
        $formContainer.empty();
        
        // IMPORTANT: Remove all previously created modals
        // Modals are appended to body, not to #options-content, so they persist across rebuilds
        $('.modal:not(#import-modal)').remove();
        
        // Reset hidden sections for new template (prevents state from previous template persisting)
        window.hiddenSections = {};
        
        // Build sections with textareas
        window.options.forEach(section => {
            if (section.sectionPreviewKey) {
                const sectionKey = section.sectionPreviewKey;
                
                // Initialize excluded sections if defaultExcluded is set
                if (section.defaultExcluded && !window.excludedSections) {
                    window.excludedSections = {};
                }
                if (section.defaultExcluded && window.excludedSections[sectionKey] === undefined) {
                    window.excludedSections[sectionKey] = true;
                }
                
                // Set hidden state if defaultHidden is true
                const isDefaultHidden = section.defaultHidden === true;
                if (isDefaultHidden) {
                    window.hiddenSections[sectionKey] = true;
                }
                const hiddenStyle = isDefaultHidden && window.hiddenSections[sectionKey] ? 'style="display: none;"' : '';
                
                // Use different button for triggered sections (defaultHidden)
                const buttonText = isDefaultHidden ? '×' : '−';
                const buttonClass = isDefaultHidden ? 'exclude-button reset-trigger-button' : 'exclude-button';
                
                const $sectionRow = $(`
                    <div class="form-row" data-section="${sectionKey}" ${hiddenStyle}>
                        <div class="form-left">
                            <h3>${section.sectionTitle}</h3>
                            <button type="button" class="${buttonClass}" data-section="${sectionKey}" data-is-triggered="${isDefaultHidden}">${buttonText}</button>
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
                const $excludeButton = $sectionRow.find('.exclude-button');
                const $editButton = $sectionRow.find('.template-button');
                
                // Apply excluded state immediately if defaultExcluded is true
                if (section.defaultExcluded && window.excludedSections && window.excludedSections[sectionKey]) {
                    $textarea.addClass('excluded').prop('disabled', true);
                    $textarea.css('height', '32px'); // Match button height
                    $editButton.hide();
                    $excludeButton.text('+').attr('title', 'Include section in report');
                }
                
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
                $excludeButton.on('click', function() {
                    const isTriggered = $(this).data('is-triggered');
                    
                    if (isTriggered) {
                        // This is a triggered section - reset the trigger
                        
                        // Hide the section
                        if (window.hiddenSections) {
                            window.hiddenSections[sectionKey] = true;
                        }
                        $sectionRow.hide();
                        
                        // Exclude it from the report
                        if (!window.excludedSections) {
                            window.excludedSections = {};
                        }
                        window.excludedSections[sectionKey] = true;
                        
                        // Find and reset the dropdown that triggers this section
                        window.options.forEach(section => {
                            if (!section.params) return;
                            
                            Object.entries(section.params).forEach(([paramKey, paramOption]) => {
                                if (!paramOption.options || !Array.isArray(paramOption.options)) return;
                                
                                // Check if any option triggers this section
                                paramOption.options.forEach(opt => {
                                    if (typeof opt !== 'string' && opt.triggerSection === sectionKey) {
                                        // Found the parameter that can trigger this section
                                        // Reset to default option
                                        const defaultOption = paramOption.options.find(o => 
                                            typeof o !== 'string' && o.default === true
                                        );
                                        
                                        if (defaultOption) {
                                            // Update the dropdown in both Summary and Section modals
                                            $(`#${paramKey}-select`).val(defaultOption.title).trigger('change');
                                            
                                            // Update section preview for the section containing this parameter
                                            if (section.sectionPreviewKey && typeof window.updateSectionPreview === 'function') {
                                                window.updateSectionPreview(section.sectionPreviewKey);
                                            }
                                        }
                                    }
                                });
                            });
                        });
                        
                        // Update summary
                        if (typeof window.updateSummary === 'function') {
                            window.updateSummary();
                        }
                        
                    } else {
                        // Regular section - toggle exclude state
                        
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
                    }
                });
                
                // Set initial button title
                $excludeButton.attr('title', 'Exclude section from report');
                
                window.autoResizeTextarea($textarea);
            }
        });
        
        // Add Summary section
        window.options.forEach(section => {
            if (section.summary === true) {
                const sectionKey = "Summary"; // Use "Summary" as the key for backwards compatibility
                const $summaryRow = $(`
                    <div class="form-row summary-row">
                        <div class="form-left">
                            <h3>${section.sectionTitle}</h3>
                            <button type="button" class="exclude-button" data-section="${sectionKey}">−</button>
                            <button type="button" class="template-button" data-section="${sectionKey}">✎</button>
                        </div>
                        <div class="form-right">
                            <textarea id="${sectionKey}-textarea" class="section-textarea summary-textarea" data-min-height="128" style="min-height: 8rem;"></textarea>
                        </div>
                    </div>
                `);
                
                $formContainer.append($summaryRow);
                
                // Create modal for Summary section params
                createSummaryModal(section);
                
                const $summaryTextarea = $summaryRow.find(`#${sectionKey}-textarea`);
                
                $summaryTextarea.on('input', function() {
                    const minHeight = parseInt($(this).data('min-height')) || 128;
                    window.autoResizeTextarea($(this), minHeight);
                    if (window.summaryManuallyEdited !== undefined) {
                        window.summaryManuallyEdited = true;
                    }
                    if (window.metrics) {
                        window.metrics[sectionKey] = $(this).val();
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
                    const isExcluded = window.excludedSections[sectionKey] || false;
                    window.excludedSections[sectionKey] = !isExcluded;
                    
                    // Update UI
                    if (window.excludedSections[sectionKey]) {
                        // Exclude: grey out, disable, collapse, hide edit button
                        $summaryTextarea.addClass('excluded').prop('disabled', true);
                        $summaryTextarea.css('height', '32px'); // Match button height
                        $summaryEditButton.hide();
                        $summaryExcludeButton.text('+').attr('title', 'Include section in report');
                    } else {
                        // Include: restore normal state, expand, show edit button
                        $summaryTextarea.removeClass('excluded').prop('disabled', false);
                        $summaryTextarea.css('height', ''); // Clear inline height
                        const minHeight = parseInt($summaryTextarea.data('min-height')) || 128;
                        window.autoResizeTextarea($summaryTextarea, minHeight); // Restore auto-sized height
                        $summaryEditButton.show();
                        $summaryExcludeButton.text('−').attr('title', 'Exclude section from report');
                    }
                });
                
                // Set initial button title
                $summaryExcludeButton.attr('title', 'Exclude section from report');
                
                // Apply initial auto-resize
                const minHeight = parseInt($summaryTextarea.data('min-height')) || 128;
                window.autoResizeTextarea($summaryTextarea, minHeight);
            }
        });
        
        // Initialize default state (virtual checkboxes and selected options)
        // This MUST happen before populateSectionTextareas() so that updateSummary()
        // has access to default values even though modals haven't been created yet
        initializeDefaultState();
        
        if (typeof window.populateSectionTextareas === 'function') {
            window.populateSectionTextareas();
        }
    }
    
    // ============================================================================
    // SHARED MODAL UTILITIES
    // These functions eliminate duplication between createSummaryModal and createSectionModal
    // ============================================================================
    
    // Build dropdown HTML for a parameter
    function buildDropdownHtml(paramKey, paramOption) {
        if (!paramOption.options || !Array.isArray(paramOption.options)) {
            return `<span class="no-options">No options available</span>`;
        }
        
        return `
            <select id="${paramKey}-select" data-param="${paramKey}">
                ${paramOption.options.map(opt => {
                    const isString = typeof opt === 'string';
                    const label = isString ? opt : (opt.label || opt.title);
                    const title = isString ? opt : opt.title;
                    const isDefault = !isString && opt.default === true;
                    return `<option value="${title}" ${isDefault ? 'selected' : ''}>${label}</option>`;
                }).join('')}
            </select>
        `;
    }
    
    // Build checkbox HTML for a parameter
    function buildCheckboxHtml(paramKey, paramOption) {
        // Use virtual state if available, otherwise use summaryDefault
        let defaultChecked = '';
        if (window.summaryCheckboxStates && window.summaryCheckboxStates[paramKey] !== undefined) {
            defaultChecked = window.summaryCheckboxStates[paramKey] ? 'checked' : '';
        } else {
            defaultChecked = paramOption.summaryDefault ? 'checked' : '';
        }
        return `<input type="checkbox" id="${paramKey}-summary-modal" data-param="${paramKey}" ${defaultChecked} />`;
    }
    
    // Build textarea HTML for a parameter (used for custom: true or options: "customtext")
    function buildTextareaHtml(paramKey, paramOption) {
        const textareaSize = paramOption.textareaSize || 1;
        const minHeight = textareaSize > 1 ? (1.5 + (textareaSize - 1) * 1.3) * 16 : 32; // Convert rem to px (assuming 16px base)
        const heightStyle = `style="min-height: ${minHeight}px;"`;
        const currentValue = window.metrics && window.metrics[paramKey] ? window.metrics[paramKey] : '';
        
        // Add placeholder for customtext options
        const isCustomText = paramOption.options === "customtext";
        const placeholderAttr = isCustomText ? ' placeholder="Enter custom text..."' : '';
        
        return `<textarea id="${paramKey}-textarea" class="modal-textarea" data-param="${paramKey}" data-min-height="${minHeight}" ${heightStyle}${placeholderAttr}>${currentValue}</textarea>`;
    }
    
    // Build custom textarea row HTML
    function buildCustomTextareaRow(paramKey, paramOption) {
        const textareaSize = paramOption.textareaSize || 1;
        const minHeight = textareaSize > 1 ? (1.5 + (textareaSize - 1) * 1.3) * 16 : 32; // Convert rem to px
        const heightStyle = `style="min-height: ${minHeight}px;"`;
        return `
            <tr id="${paramKey}-custom-row" class="custom-text-row" style="display: none;">
                <td style="border-top: none; padding-top: 0;"></td>
                <td style="border-top: none; padding-top: 0;"></td>
                <td style="border-top: none; padding-top: 0;">
                    <textarea id="${paramKey}-custom-textarea" class="modal-textarea" data-param="${paramKey}" data-min-height="${minHeight}" placeholder="Edit custom text..." ${heightStyle}></textarea>
                </td>
                <td style="border-top: none; padding-top: 0;"></td>
            </tr>
        `;
    }
    
    // Build edit button HTML
    function buildEditButtonHtml(paramKey, showButton) {
        return showButton ? 
            `<button type="button" class="modal-edit-button" data-param="${paramKey}" title="Edit custom text">✎</button>` : 
            '';
    }
    
    // Determine if a checkbox should be checked based on dropdown selection
    function determineCheckboxState(selectedOption, selectedLabel, paramOption, selectedValue) {
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
        
        return shouldCheck;
    }
    
    // Update checkbox state in both DOM and virtual state
    function updateCheckboxState($checkbox, shouldCheck, paramKey) {
        if ($checkbox && $checkbox.length) {
            $checkbox.prop('checked', shouldCheck);
            
            // Sync virtual state for lazy loading
            if (window.summaryCheckboxStates) {
                window.summaryCheckboxStates[paramKey] = shouldCheck;
            }
        }
    }
    
    // Handle summary exclude logic
    function handleSummaryExclude(paramKey, paramOption) {
        if (paramOption.summaryExclude && Array.isArray(paramOption.summaryExclude)) {
            paramOption.summaryExclude.forEach(excludeKey => {
                const $excludeCheckbox = $(`#${excludeKey}-summary-modal`);
                if ($excludeCheckbox.length && $excludeCheckbox.is(':checked')) {
                    $excludeCheckbox.prop('checked', false);
                    
                    // Sync virtual state
                    if (window.summaryCheckboxStates) {
                        window.summaryCheckboxStates[excludeKey] = false;
                    }
                    
                    if (window.summaryCheckboxManuallyEdited) {
                        window.summaryCheckboxManuallyEdited[excludeKey] = true;
                    }
                }
            });
        }
    }
    
    // Handle summary restore logic - re-check excluded items if appropriate
    function handleSummaryRestore(paramKey, paramOption) {
        if (paramOption.summaryExclude && Array.isArray(paramOption.summaryExclude)) {
            paramOption.summaryExclude.forEach(excludeKey => {
                // Check if any OTHER parameters that also exclude this key are currently checked
                let otherExcludersChecked = false;
                
                // Iterate through all sections and parameters
                window.options.forEach(section => {
                    if (!section.params) return;
                    
                    Object.entries(section.params).forEach(([otherParamKey, otherParamOption]) => {
                        // Skip the parameter we're unchecking
                        if (otherParamKey === paramKey) return;
                        
                        // Check if this parameter also excludes the same key
                        if (otherParamOption.summaryExclude && 
                            Array.isArray(otherParamOption.summaryExclude) && 
                            otherParamOption.summaryExclude.includes(excludeKey)) {
                            
                            // Check if this parameter's checkbox is checked
                            const $otherCheckbox = $(`#${otherParamKey}-summary-modal`);
                            if ($otherCheckbox.length && $otherCheckbox.is(':checked')) {
                                otherExcludersChecked = true;
                            }
                        }
                    });
                });
                
                // If no other excluders are checked, re-check the excluded item
                if (!otherExcludersChecked) {
                    const $excludeCheckbox = $(`#${excludeKey}-summary-modal`);
                    if ($excludeCheckbox.length && !$excludeCheckbox.is(':checked')) {
                        $excludeCheckbox.prop('checked', true);
                        
                        // Sync virtual state
                        if (window.summaryCheckboxStates) {
                            window.summaryCheckboxStates[excludeKey] = true;
                        }
                    }
                }
            });
        }
    }
    
    // Helper to update summary
    function updateSummaryNow() {
        if (typeof window.updateSummary === 'function') {
            window.updateSummary();
        }
    }
    
    // Handle textarea input event
    function handleTextareaInput(value, paramKey, paramOption, $checkbox, sectionKey, $textarea) {
        // Update metrics
        if (window.metrics) {
            window.metrics[paramKey] = value;
        }
        
        // Update selectedOptions for custom params (custom: true) or customtext
        // This ensures summary uses the custom text
        if ((paramOption.custom || paramOption.options === "customtext") && window.selectedOptions) {
            const summaryText = paramOption.summarytext || value;
            window.selectedOptions[paramKey] = {
                title: value,
                summarytext: summaryText
            };
        }
        
        // Handle auto-check/uncheck for summary checkboxes
        if (paramOption.enableSummary && $checkbox && $checkbox.length) {
            const shouldCheck = value && value.trim() !== "";
            updateCheckboxState($checkbox, shouldCheck, paramKey);
            
            if (shouldCheck) {
                handleSummaryExclude(paramKey, paramOption);
            } else {
                // If now unchecked, handle restoration of excluded items
                handleSummaryRestore(paramKey, paramOption);
            }
        }
        
        // Auto-resize textarea with min-height support
        if ($textarea && $textarea.length && typeof window.autoResizeTextarea === 'function') {
            const minHeight = parseInt($textarea.data('min-height')) || 32;
            window.autoResizeTextarea($textarea, minHeight);
        }
        
        // Update section preview
        if (sectionKey && typeof window.updateSectionPreview === 'function') {
            window.updateSectionPreview(sectionKey);
        }
        
        updateSummaryNow();
    }
    
    // Handle custom textarea input event
    function handleCustomTextareaInput(value, paramKey, paramOption, $checkbox, sectionKey, $customTextarea) {
        // Update metrics with custom text
        if (window.metrics) {
            window.metrics[paramKey] = value;
        }
        
        // Update selectedOptions with custom text for summary generation
        // Create a pseudo-option object with the custom text as summarytext
        if (window.selectedOptions) {
            window.selectedOptions[paramKey] = {
                title: value,
                summarytext: value
            };
        }
        
        // Handle auto-check for summary checkbox
        if (paramOption.enableSummary && $checkbox && $checkbox.length) {
            const shouldCheck = value && value.trim() !== "";
            updateCheckboxState($checkbox, shouldCheck, paramKey);
            
            if (shouldCheck) {
                handleSummaryExclude(paramKey, paramOption);
            }
        }
        
        // Auto-resize textarea with min-height support
        if ($customTextarea && $customTextarea.length && typeof window.autoResizeTextarea === 'function') {
            const minHeight = parseInt($customTextarea.data('min-height')) || 32;
            window.autoResizeTextarea($customTextarea, minHeight);
        }
        
        // Update section preview
        if (sectionKey && typeof window.updateSectionPreview === 'function') {
            window.updateSectionPreview(sectionKey);
        }
        
        updateSummaryNow();
    }
    
    // Handle dropdown change event
    function handleDropdownChange(selectedValue, selectedIndex, paramKey, paramOption, $checkbox, $customTextarea, sectionKey) {
        // Find the selected option object using selectedIndex
        let selectedOption = null;
        let selectedLabel = null;
        
        if (paramOption.options && selectedIndex >= 0 && selectedIndex < paramOption.options.length) {
            const opt = paramOption.options[selectedIndex];
            selectedOption = typeof opt === 'string' ? null : opt;
            if (selectedOption) {
                selectedLabel = selectedOption.label;
            }
        }
        
        // Update metrics
        if (window.metrics) {
            window.metrics[paramKey] = selectedValue || "";
        }
        
        // Mark that this modal session had changes
        if (window.modalChangedInSession && window.modalInitialState && sectionKey && window.modalInitialState[sectionKey]) {
            const initialValue = window.modalInitialState[sectionKey][paramKey];
            if (initialValue !== selectedValue) {
                window.modalChangedInSession[sectionKey] = true;
            }
        }
        
        // Track the selected option object for summary text lookup
        if (window.selectedOptions && selectedOption) {
            window.selectedOptions[paramKey] = selectedOption;
        }
        
        // Handle triggerSection - show/hide sections based on selection
        const currentTriggerSection = selectedOption && selectedOption.triggerSection ? selectedOption.triggerSection : null;
        
        // Check if ANY option in this parameter has a triggerSection
        let paramTriggersSections = [];
        if (paramOption.options && Array.isArray(paramOption.options)) {
            paramOption.options.forEach(opt => {
                if (typeof opt !== 'string' && opt.triggerSection) {
                    paramTriggersSections.push(opt.triggerSection);
                }
            });
        }
        
        // Hide any sections that were triggered by this parameter but are not currently selected
        paramTriggersSections.forEach(triggeredSectionKey => {
            if (triggeredSectionKey !== currentTriggerSection) {
                if (window.hiddenSections) {
                    window.hiddenSections[triggeredSectionKey] = true;
                    $(`.form-row[data-section="${triggeredSectionKey}"]`).hide();
                    
                    if (window.excludedSections) {
                        window.excludedSections[triggeredSectionKey] = true;
                    }
                }
            }
        });
        
        // Now show the currently selected trigger section (if any)
        if (currentTriggerSection) {
            if (window.hiddenSections && window.hiddenSections[currentTriggerSection]) {
                window.hiddenSections[currentTriggerSection] = false;
                $(`.form-row[data-section="${currentTriggerSection}"]`).show();
                
                if (window.excludedSections && window.excludedSections[currentTriggerSection]) {
                    window.excludedSections[currentTriggerSection] = false;
                    $(`.form-row[data-section="${currentTriggerSection}"]`).removeClass('excluded-section');
                    const $button = $(`.exclude-button[data-section="${currentTriggerSection}"]`);
                    if ($button.hasClass('reset-trigger-button')) {
                        $button.text('×');
                    } else {
                        $button.text('−');
                    }
                }
                
                if (typeof window.updateSectionPreview === 'function') {
                    window.updateSectionPreview(currentTriggerSection);
                }
            }
        }
        
        // Update custom textarea if it exists and is visible
        if ($customTextarea && $customTextarea.length && $customTextarea.is(':visible')) {
            $customTextarea.val(selectedValue);
        }
        
        // Handle auto-check/uncheck for summary checkboxes
        if (paramOption.enableSummary && $checkbox && $checkbox.length) {
            const shouldCheck = determineCheckboxState(selectedOption, selectedLabel, paramOption, selectedValue);
            updateCheckboxState($checkbox, shouldCheck, paramKey);
            
            if (shouldCheck) {
                handleSummaryExclude(paramKey, paramOption);
            } else {
                // If now unchecked, handle restoration of excluded items
                handleSummaryRestore(paramKey, paramOption);
            }
        }
        
        // Update section preview
        if (sectionKey && typeof window.updateSectionPreview === 'function') {
            window.updateSectionPreview(sectionKey);
        }
        
        updateSummaryNow();
    }
    
    // Toggle custom textarea visibility
    function toggleCustomTextarea($modal, paramKey, $select, $customTextarea, paramOption, $checkbox, sectionKey) {
        const $customRow = $modal.find(`#${paramKey}-custom-row`);
        if ($customRow.length) {
            if ($customRow.is(':visible')) {
                // Closing custom textarea - reset to default dropdown value
                $customRow.hide();
                $select.css({
                    'opacity': '',
                    'background-color': ''
                });
                
                // Find the default option
                let defaultOption = null;
                let defaultValue = '';
                if (paramOption.options && Array.isArray(paramOption.options)) {
                    defaultOption = paramOption.options.find(opt => 
                        typeof opt !== 'string' && opt.default === true
                    );
                    if (defaultOption) {
                        defaultValue = defaultOption.title;
                    }
                }
                
                // Reset dropdown to default value
                if (defaultValue) {
                    $select.val(defaultValue);
                }
                
                // Update metrics with default value
                if (window.metrics) {
                    window.metrics[paramKey] = defaultValue;
                }
                
                // Restore selectedOptions to the default option
                if (window.selectedOptions && defaultOption) {
                    window.selectedOptions[paramKey] = defaultOption;
                }
                
                // Re-evaluate checkbox state for the default option
                // This ensures checkbox is checked/unchecked appropriately
                if (paramOption.enableSummary && $checkbox && $checkbox.length && defaultOption) {
                    const shouldCheck = determineCheckboxState(
                        defaultOption, 
                        defaultOption.label, 
                        paramOption, 
                        defaultValue
                    );
                    updateCheckboxState($checkbox, shouldCheck, paramKey);
                    
                    // If now checked, handle exclusions
                    if (shouldCheck) {
                        handleSummaryExclude(paramKey, paramOption);
                    } else {
                        // If now unchecked, handle restoration of excluded items
                        handleSummaryRestore(paramKey, paramOption);
                    }
                }
                
                // Update section preview
                if (sectionKey && typeof window.updateSectionPreview === 'function') {
                    window.updateSectionPreview(sectionKey);
                }
                
                // Update summary
                updateSummaryNow();
            } else {
                // Opening custom textarea - copy dropdown value
                const currentValue = $select.val();
                $customTextarea.val(currentValue);
                $customRow.show();
                $customTextarea.focus();
                $customTextarea.select();
                $select.css({
                    'opacity': '0.6',
                    'background-color': '#f0f0f0'
                });
            }
        }
    }
    
    // Attach event handlers for a single parameter
    function attachParameterEventHandlers($modal, paramKey, paramOption, sectionKey) {
        const $textarea = $modal.find(`#${paramKey}-textarea`);
        const $select = $modal.find(`#${paramKey}-select`);
        const $checkbox = $modal.find(`#${paramKey}-summary-modal`);
        const $customTextarea = $modal.find(`#${paramKey}-custom-textarea`);
        const isCustomText = paramOption.options === "customtext";
        
        // Textarea input handler (for custom: true or options: "customtext")
        if ($textarea.length) {
            $textarea.on('input', function() {
                handleTextareaInput($(this).val(), paramKey, paramOption, $checkbox, sectionKey, $(this));
            });
            
            // Apply initial auto-resize with min-height
            // The overflow detection in autoResizeTextarea ensures proper expansion
            if (typeof window.autoResizeTextarea === 'function') {
                const minHeight = parseInt($textarea.data('min-height')) || 32;
                window.autoResizeTextarea($textarea, minHeight);
            }
        }
        
        // Dropdown change handler
        if ($select.length) {
            $select.on('change', function() {
                handleDropdownChange(
                    $(this).val(),
                    this.selectedIndex,
                    paramKey,
                    paramOption,
                    $checkbox,
                    $customTextarea,
                    sectionKey
                );
            });
        }
        
        // Custom textarea input handler (for dropdown + custom text)
        if ($customTextarea.length) {
            $customTextarea.on('input', function() {
                handleCustomTextareaInput($(this).val(), paramKey, paramOption, $checkbox, sectionKey, $(this));
            });
        }
        
        // Edit button handler
        const $editButton = $modal.find(`.modal-edit-button[data-param="${paramKey}"]`);
        if ($editButton.length) {
            // For customtext options, edit button clears the content
            if (isCustomText && $textarea.length) {
                $editButton.on('click', function() {
                    // Clear the textarea content
                    $textarea.val('');
                    
                    // Update metrics to empty string
                    if (window.metrics) {
                        window.metrics[paramKey] = '';
                    }
                    
                    // Update selectedOptions to reset summarytext
                    if (window.selectedOptions) {
                        window.selectedOptions[paramKey] = {
                            title: '',
                            summarytext: paramOption.summarytext || ''
                        };
                    }
                    
                    // Uncheck summary checkbox if present
                    if ($checkbox && $checkbox.length) {
                        updateCheckboxState($checkbox, false, paramKey);
                        
                        // Handle restoration of excluded items
                        handleSummaryRestore(paramKey, paramOption);
                    }
                    
                    // Update section preview
                    if (sectionKey && typeof window.updateSectionPreview === 'function') {
                        window.updateSectionPreview(sectionKey);
                    }
                    
                    // Update summary
                    updateSummaryNow();
                    
                    // Reset textarea height to minimum
                    if (typeof window.autoResizeTextarea === 'function') {
                        const minHeight = parseInt($textarea.data('min-height')) || 32;
                        window.autoResizeTextarea($textarea, minHeight);
                    }
                });
            }
            // For regular dropdowns with custom text, toggle custom textarea row
            else if ($select.length && $customTextarea.length) {
                $editButton.on('click', function() {
                    toggleCustomTextarea($modal, paramKey, $select, $customTextarea, paramOption, $checkbox, sectionKey);
                });
            }
        }
    }
    
    // ============================================================================
    // END OF SHARED UTILITIES
    // ============================================================================
    
    // Create modal for Summary section (REFACTORED - uses shared utilities)
    function createSummaryModal(section) {
        const sectionKey = "Summary"; // Use "Summary" as the key for backwards compatibility
        const modalId = `${sectionKey}-modal`;
        
        // Build parameter rows using shared utilities
        let paramRows = '';
        Object.entries(section.params).forEach(([paramKey, paramOption]) => {
            if (paramKey === 'Summary') return;
            if (!paramOption.enableSummary) return;
            if (paramOption.summaryAlwaysInclude === true) return;
            
            const isCustom = paramOption.custom === true;
            const hasCustomText = paramOption.customText !== false;
            
            // Build options column using shared utilities
            let optionsHtml = '';
            let hasEditButton = false;
            if (isCustom) {
                optionsHtml = buildTextareaHtml(paramKey, paramOption);
            } else if (paramOption.options && Array.isArray(paramOption.options)) {
                optionsHtml = buildDropdownHtml(paramKey, paramOption);
                hasEditButton = hasCustomText;
            } else {
                optionsHtml = `<span class="no-options">No options available</span>`;
            }
            
            const editButtonHtml = buildEditButtonHtml(paramKey, hasEditButton);
            const summaryHtml = buildCheckboxHtml(paramKey, paramOption);
            
            paramRows += `
                <tr data-param="${paramKey}">
                    <td class="param-label">${paramOption.title || paramKey}</td>
                    <td class="param-edit">${editButtonHtml}</td>
                    <td class="param-options">${optionsHtml}</td>
                    <td class="param-summary">${summaryHtml}</td>
                </tr>
            `;
            
            if (hasCustomText && !isCustom) {
                paramRows += buildCustomTextareaRow(paramKey, paramOption);
            }
        });
        
        // Create modal
        const $modal = $(`
            <div id="${modalId}" class="modal section-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${section.sectionTitle}</h2>
                        <button class="close-button" data-modal="${modalId}">&times;</button>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="modal-back-button" data-section="${sectionKey}">← Back</button>
                        <button type="button" class="modal-close-button" data-section="${sectionKey}">Close</button>
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
                    </div>
                </div>
            </div>
        `);
        
        $('body').append($modal);
        
        // Setup event handlers using shared utilities
        Object.entries(section.params).forEach(([paramKey, paramOption]) => {
            if (paramKey === 'Summary' || !paramOption.enableSummary) return;
            if (paramOption.summaryAlwaysInclude === true) return;
            
            attachParameterEventHandlers($modal, paramKey, paramOption, sectionKey);
        });
        
            // Template button click - sync dropdown and textarea values when opening
            $(`.template-button[data-section="${sectionKey}"]`).on('click', function() {
                Object.entries(section.params).forEach(([paramKey, paramOption]) => {
                    const $select = $(`#${paramKey}-select`);
                    const $textarea = $(`#${paramKey}-textarea`);
                    const currentValue = window.metrics && window.metrics[paramKey] ? window.metrics[paramKey] : '';
                    
                    if ($select.length) {
                        $select.val(currentValue);
                    }
                    if ($textarea.length) {
                        $textarea.val(currentValue);
                    }
                });
                $(`#${modalId}`).addClass('active');
            });
        
        // Close button
        $(`.close-button[data-modal="${modalId}"]`).on('click', function() {
            $(`#${modalId}`).removeClass('active');
        });
        
        // Modal background click to close
        $(`#${modalId}`).on('click', function(e) {
            if ($(e.target).is(`#${modalId}`)) {
                $(this).removeClass('active');
            }
        });
        
        // Modal close button click
        $(`.modal-close-button[data-section="${sectionKey}"]`).on('click', function() {
            $(`#${modalId}`).removeClass('active');
        });
        
        // Back button - navigate to last visible section
        $(`.modal-back-button[data-section="${sectionKey}"]`).on('click', function() {
            const allSections = window.options.filter(section => section.sectionPreviewKey);
            const lastSection = findLastVisibleSection(allSections);
            
            if (lastSection) {
                const prevSectionKey = lastSection.section.sectionPreviewKey;
                const prevModalId = `${prevSectionKey}-modal`;
                
                // Add new modal active class first, then remove old - prevents overlay flash
                $(`#${prevModalId}`).addClass('active');
                $(`#${modalId}`).removeClass('active');
            }
        });
    }
    
    // Create modal for regular sections (REFACTORED - uses shared utilities)
    function createSectionModal(section) {
        const sectionKey = section.sectionPreviewKey;
        const modalId = `${sectionKey}-modal`;
        
        // Build parameter rows using shared utilities
        let paramRows = '';
        Object.entries(section.params).forEach(([paramKey, paramOption]) => {
            const isCustom = paramOption.custom === true;
            const isCustomText = paramOption.options === "customtext";
            const hasSummary = paramOption.enableSummary === true;
            const hasCustomText = paramOption.customText !== false;
            
            // Build options column using shared utilities
            let optionsHtml = '';
            let hasEditButton = false;
            if (isCustom || isCustomText) {
                // Both custom: true and options: "customtext" use textarea
                optionsHtml = buildTextareaHtml(paramKey, paramOption);
                hasEditButton = isCustomText; // Only customtext gets the edit button
            } else if (paramOption.options && Array.isArray(paramOption.options)) {
                optionsHtml = buildDropdownHtml(paramKey, paramOption);
                hasEditButton = hasCustomText;
            } else {
                optionsHtml = `<span class="no-options">No options available</span>`;
            }
            
            const editButtonHtml = buildEditButtonHtml(paramKey, hasEditButton);
            const summaryHtml = hasSummary ? buildCheckboxHtml(paramKey, paramOption) : '';
            
            paramRows += `
                <tr data-param="${paramKey}">
                    <td class="param-label">${paramOption.title || paramKey}</td>
                    <td class="param-edit">${editButtonHtml}</td>
                    <td class="param-options">${optionsHtml}</td>
                    ${hasSummary ? `<td class="param-summary">${summaryHtml}</td>` : `<td></td>`}
                </tr>
            `;
            
            // Add custom textarea row for dropdown options with customText enabled
            if (hasCustomText && !isCustom && !isCustomText) {
                paramRows += buildCustomTextareaRow(paramKey, paramOption);
            }
        });
        
        // Create modal
        const $modal = $(`
            <div id="${modalId}" class="modal section-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${section.sectionTitle}</h2>
                        <button class="close-button" data-modal="${modalId}">&times;</button>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="modal-back-button" data-section="${sectionKey}">← Back</button>
                        <button type="button" class="modal-exclude-button" data-section="${sectionKey}" title="Exclude section from report">−</button>
                        <button type="button" class="generate-section-button" data-section="${sectionKey}">Done</button>
                        <button type="button" class="modal-next-button" data-section="${sectionKey}">Next →</button>
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
                    </div>
                </div>
            </div>
        `);
        
        $('body').append($modal);
        
        // Setup event handlers using shared utilities
        Object.entries(section.params).forEach(([paramKey, paramOption]) => {
            attachParameterEventHandlers($modal, paramKey, paramOption, sectionKey);
        });
        
        // Template button click - open modal
        $(`.template-button[data-section="${sectionKey}"]`).on('click', function() {
            // Initialize modal state tracking
            if (!window.modalChangedInSession) {
                window.modalChangedInSession = {};
            }
            if (!window.modalInitialState) {
                window.modalInitialState = {};
            }
            
            // Capture initial state
            window.modalChangedInSession[sectionKey] = false;
            window.modalInitialState[sectionKey] = {};
            Object.keys(section.params).forEach(paramKey => {
                window.modalInitialState[sectionKey][paramKey] = window.metrics && window.metrics[paramKey] ? window.metrics[paramKey] : '';
            });
            
            // Sync dropdown and textarea values
            Object.entries(section.params).forEach(([paramKey, paramOption]) => {
                const $select = $modal.find(`#${paramKey}-select`);
                const $textarea = $modal.find(`#${paramKey}-textarea`);
                const currentValue = window.metrics && window.metrics[paramKey] ? window.metrics[paramKey] : '';
                
                if ($select.length) {
                    $select.val(currentValue);
                }
                if ($textarea.length) {
                    $textarea.val(currentValue);
                }
            });
            
            $(`#${modalId}`).addClass('active');
            
            // Auto-scroll measurements table to relevant section
            if (typeof window.scrollToMeasurementSection === 'function') {
                window.scrollToMeasurementSection(sectionKey);
            }
        });
        
        // Close button
        $(`.close-button[data-modal="${modalId}"]`).on('click', function() {
            $(`#${modalId}`).removeClass('active');
        });
        
        // Modal background click to close
        $(`#${modalId}`).on('click', function(e) {
            if ($(e.target).is(`#${modalId}`)) {
                $(this).removeClass('active');
            }
        });
        
        // Done button
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
        
        // Exclude button
        $(`.modal-exclude-button[data-section="${sectionKey}"]`).on('click', function() {
            if (!window.excludedSections) {
                window.excludedSections = {};
            }
            
            window.excludedSections[sectionKey] = true;
            
            const $textarea = $(`#${sectionKey}-textarea`);
            const $editButton = $(`.template-button[data-section="${sectionKey}"]`);
            const $excludeButton = $(`.exclude-button[data-section="${sectionKey}"]`);
            
            $textarea.addClass('excluded').prop('disabled', true);
            $textarea.css('height', '32px');
            $editButton.hide();
            $excludeButton.text('+').attr('title', 'Include section in report');
            
            $(`#${modalId}`).removeClass('active');
            updateSummaryNow();
        });
        
        // Back button
        $(`.modal-back-button[data-section="${sectionKey}"]`).on('click', function() {
            const allSections = window.options.filter(section => section.sectionPreviewKey);
            const currentIndex = allSections.findIndex(s => s.sectionPreviewKey === sectionKey);
            
            if (currentIndex > 0) {
                const prevSection = findPreviousVisibleSection(allSections, currentIndex);
                
                if (prevSection) {
                    const prevSectionKey = prevSection.section.sectionPreviewKey;
                    const prevModalId = `${prevSectionKey}-modal`;
                    
                    // Add new modal active class first, then remove old - prevents overlay flash
                    $(`#${prevModalId}`).addClass('active');
                    $(`#${modalId}`).removeClass('active');
                    
                    // Auto-scroll measurements table to previous section
                    if (typeof window.scrollToMeasurementSection === 'function') {
                        window.scrollToMeasurementSection(prevSectionKey);
                    }
                }
            }
        });
        
        // Next button
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
                    
                    // Find and open next visible (non-hidden) section modal or Summary modal
                    const allSections = window.options.filter(s => s.sectionPreviewKey);
                    const currentIndex = allSections.findIndex(s => s.sectionPreviewKey === sectionKey);
                    
                    const nextVisible = findNextVisibleSection(allSections, currentIndex);
                    if (nextVisible) {
                        const nextSectionKey = nextVisible.section.sectionPreviewKey;
                        const nextModalId = `${nextSectionKey}-modal`;
                        $(`#${nextModalId}`).addClass('active');
                        
                        // Auto-scroll measurements table to next section
                        if (typeof window.scrollToMeasurementSection === 'function') {
                            window.scrollToMeasurementSection(nextSectionKey);
                        }
                    } else {
                        // No more visible sections - open Summary modal
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
            
            // Find and open next visible (non-hidden) section modal or Summary modal
            const allSections = window.options.filter(s => s.sectionPreviewKey);
            const currentIndex = allSections.findIndex(s => s.sectionPreviewKey === sectionKey);
            
            const nextVisible = findNextVisibleSection(allSections, currentIndex);
            if (nextVisible) {
                const nextSectionKey = nextVisible.section.sectionPreviewKey;
                const nextModalId = `${nextSectionKey}-modal`;
                $(`#${nextModalId}`).addClass('active');
                
                // Auto-scroll measurements table to next section
                if (typeof window.scrollToMeasurementSection === 'function') {
                    window.scrollToMeasurementSection(nextSectionKey);
                }
            } else {
                // No more visible sections - open Summary modal
                $('#Summary-modal').addClass('active');
            }
        });
    }
    
    function findNextVisibleSection(allSections, currentIndex) {
        for (let i = currentIndex + 1; i < allSections.length; i++) {
            const section = allSections[i];
            const sectionKey = section.sectionPreviewKey;
            // Check if section is hidden
            if (window.hiddenSections && window.hiddenSections[sectionKey]) {
                continue; // Skip hidden sections
            }
            return { section, index: i };
        }
        return null; // No visible sections found
    }
    
    // Helper function to find the previous visible (non-hidden) section
    function findPreviousVisibleSection(allSections, currentIndex) {
        for (let i = currentIndex - 1; i >= 0; i--) {
            const section = allSections[i];
            const sectionKey = section.sectionPreviewKey;
            // Check if section is hidden
            if (window.hiddenSections && window.hiddenSections[sectionKey]) {
                continue; // Skip hidden sections
            }
            return { section, index: i };
        }
        return null; // No visible sections found
    }
    
    // Helper function to find the last visible section
    function findLastVisibleSection(allSections) {
        for (let i = allSections.length - 1; i >= 0; i--) {
            const section = allSections[i];
            const sectionKey = section.sectionPreviewKey;
            // Check if section is hidden
            if (window.hiddenSections && window.hiddenSections[sectionKey]) {
                continue; // Skip hidden sections
            }
            return { section, index: i };
        }
        return null; // No visible sections found
    }
    
    // Expose buildForm globally
    window.buildForm = buildForm;
    
    // Trigger initialization
    if (typeof window.initializeReportForm === 'function') {
        window.initializeReportForm();
    }
    
});