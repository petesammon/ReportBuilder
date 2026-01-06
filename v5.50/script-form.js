// form.js - Clean rebuild of form builder with auto-summary
// v5.5 - On-demand modal building, registry as single source of truth
// Modals are built when opened and destroyed when closed

jQuery(document).ready(function () {
    
    // Initialize default state for parameters
    // Populates window.selectedOptions as central state for option objects
    // [v5.43] Summary checkbox states now stored in registry
    function initializeDefaultState() {
        // Initialize or preserve existing state
        if (!window.selectedOptions) {
            window.selectedOptions = {};
        }
        
        // [v5.42] Iterate through all modal groupings and their variables
        window.options.forEach(section => {
            if (!section.variables) return;
            
            section.variables.forEach(varKey => {
                // [v5.42] Only process parameters (not measurements)
                // Parameters are defined in window.parameters
                const paramOption = window.parameters ? window.parameters[varKey] : null;
                
                if (!paramOption) {
                    // Not a parameter (likely a measurement) - skip
                    return;
                }
                
                // Initialize dropdown/option defaults
                if (paramOption.options && Array.isArray(paramOption.options)) {
                    // Find the default option
                    const defaultOption = paramOption.options.find(opt => 
                        typeof opt !== 'string' && opt.default === true
                    );
                    
                    if (defaultOption) {
                        // Store the full option object (includes summarytext, etc.)
                        window.selectedOptions[varKey] = defaultOption;
                        
                        // Store the title in metrics (for display/templates)
                        // Only set default if value doesn't already exist (preserve user selections)
                        if (window.metrics && window.metrics[varKey] === undefined) {
                            window.metrics[varKey] = defaultOption.title;
                        }
                    }
                }
                // Initialize customtext options with empty string
                else if (paramOption.options === "customtext") {
                    if (window.metrics && window.metrics[varKey] === undefined) {
                        window.metrics[varKey] = "";
                    }
                    // Store a pseudo-option for summary text
                    if (paramOption.summarytext) {
                        window.selectedOptions[varKey] = {
                            title: "",
                            summarytext: paramOption.summarytext
                        };
                    }
                }
                
                // [v5.43] Summary checkbox states are initialized in registry by script-report.js
                // No need to initialize here - registry is source of truth
            });
        });
    }
    
    // [v5.0] Setup ContentEditable event handlers for bidirectional editing
    function setupContentEditableHandlers() {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) {
            console.warn('ContentEditable textarea not found');
            return;
        }
        
        // Handle user input in ContentEditable
        $textarea.on('input', function() {
            detectAndUpdateParameters();
        });
        
        // Handle paste events to clean up formatting
        $textarea.on('paste', function(e) {
            e.preventDefault();
            const text = (e.originalEvent || e).clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    }
    
    // [v5.42] Detect changes in ContentEditable and update values in registry
    // Handles: parameter spans, fixed text spans, and manual edit spans
    function detectAndUpdateParameters() {
        const $textarea = $('#report-textarea');
        const selection = window.getSelection();
        
        if (!selection || !selection.anchorNode) return;
        
        // [v5.42] Check if user is editing inside a fixed text span
        const $fixedSpan = $(selection.anchorNode).closest('[data-fixed]');
        
        if ($fixedSpan.length) {
            // User edited inside a fixed text span
            const fixedId = $fixedSpan.data('fixed');
            const newValue = $fixedSpan.text();
            
            // [v5.42] Update variable registry - change state to 'manual'
            if (typeof window.updateRegistryValue === 'function') {
                window.updateRegistryValue(fixedId, newValue, 'manual');
            }
            
            // [v5.42] Update CSS class for color change (fixed -> manual = yellow -> orange)
            $fixedSpan.removeClass('param-default param-fixed').addClass('param-manual');
            
            console.log(`[Manual Edit] Fixed text ${fixedId} edited to: "${newValue.substring(0, 50)}..."`);
            return;
        }
        
        // Find if user is editing inside a parameter span
        const $parentSpan = $(selection.anchorNode).closest('[data-param]');
        
        if ($parentSpan.length) {
            // User edited inside a parameter span
            const paramKey = $parentSpan.data('param');
            const newValue = $parentSpan.text();
            
            // Update stored value
            if (window.metrics) {
                window.metrics[paramKey] = newValue;
            }
            
            // [v5.42] Update variable registry with manual state
            if (typeof window.updateRegistryValue === 'function') {
                window.updateRegistryValue(paramKey, newValue, 'manual');
            }
            
            // [v5.42] Update CSS class for color change (any previous state -> orange)
            $parentSpan.removeClass('param-default param-selected param-imported').addClass('param-manual');
            
            // Mark as manually edited
            if (!window.manuallyEditedParams) {
                window.manuallyEditedParams = {};
            }
            window.manuallyEditedParams[paramKey] = true;
            
            console.log(`[Manual Edit] Parameter ${paramKey} edited to: "${newValue.substring(0, 50)}..."`);
        } else {
            // [v5.42] Check if user is editing inside an existing manual-edit span
            const $existingManualEdit = $(selection.anchorNode).closest('.manual-edit');
            
            if ($existingManualEdit.length) {
                // Update registry with new value
                const manualId = $existingManualEdit.data('manual-id');
                const newValue = $existingManualEdit.text();
                
                if (manualId && typeof window.updateRegistryValue === 'function') {
                    window.updateRegistryValue(manualId, newValue, 'manual');
                }
                return;
            }
            
            // User typed outside all spans - wrap in manual-edit span and register
            const anchorNode = selection.anchorNode;
            
            // Check if this is a text node
            if (anchorNode.nodeType === Node.TEXT_NODE) {
                const textNode = anchorNode;
                const textContent = textNode.textContent;
                
                // Only wrap if there's actual content
                if (textContent && textContent.trim()) {
                    // Save cursor position within the text node
                    const cursorOffset = selection.anchorOffset;
                    
                    // [v5.42] Generate unique ID and register in registry
                    let manualId = null;
                    if (typeof window.registerManualEdit === 'function') {
                        manualId = window.registerManualEdit(null, textContent);
                    } else {
                        manualId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    }
                    
                    // Create a span to wrap the text node
                    const span = document.createElement('span');
                    span.className = 'manual-edit param-manual';
                    span.setAttribute('data-manual-id', manualId);
                    span.textContent = textContent;
                    
                    // Replace the text node with the span
                    textNode.parentNode.replaceChild(span, textNode);
                    
                    // Restore cursor position inside the span
                    const range = document.createRange();
                    const textNodeInSpan = span.firstChild;
                    if (textNodeInSpan) {
                        range.setStart(textNodeInSpan, Math.min(cursorOffset, textNodeInSpan.length));
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                    
                    console.log(`[Manual Edit] New text registered as ${manualId}: "${textContent.substring(0, 30)}..."`);
                }
            }
        }
    }
    
    // Build the form layout
    function buildForm() {
        const $formContainer = $("#options-content");
        $formContainer.empty();
        
        // [v5.5] Remove any existing modal (on-demand modals should be destroyed on close)
        $('.modal:not(#import-modal)').remove();
        
        // Reset hidden sections for new template (prevents state from previous template persisting)
        window.hiddenModals = {};
        
        // [v5.0] Create single ContentEditable report textarea with button container
        const $reportContainer = $(`
            <div id="report-container" class="form-row">
                <div class="form-right" style="width: 100%;">
                    <div id="report-textarea" contenteditable="true" class="group-textarea report-contenteditable"></div>
                </div>
            </div>
        `);
        
        $formContainer.append($reportContainer);
        
        // [v5.5] Initialize section state (excluded/hidden) but do NOT create modals
        // Modals are created on-demand when user clicks edit button
        window.options.forEach(section => {
            if (section.modalKey || section.summary === true) {
                const modalKey = section.modalKey || 'Summary';
                
                // Initialize excluded sections if defaultExcluded is set
                if (section.defaultExcluded && !window.excludedModals) {
                    window.excludedModals = {};
                }
                if (section.defaultExcluded && window.excludedModals[modalKey] === undefined) {
                    window.excludedModals[modalKey] = true;
                }
                
                // Set hidden state if defaultHidden is true
                const isDefaultHidden = section.defaultHidden === true;
                if (isDefaultHidden) {
                    window.hiddenModals[modalKey] = true;
                }
            }
        });
        
        // [v5.0] Initialize parameter defaults
        initializeDefaultState();
        
        // [v5.0] Initialize summary
        if (typeof window.updateSummary === 'function') {
            window.updateSummary();
            console.log('[v5.5] updateSummary called in buildForm');
        }
        
        // [v5.0] Setup ContentEditable event handlers
        setupContentEditableHandlers();
        
        // [v5.0] Initial report generation
        if (typeof window.updateReportTextarea === 'function') {
            window.updateReportTextarea();
        }
    }
    
    // TODO [v5.0]: Summary modal creation
    // Summary is now part of the single ContentEditable, no separate textarea needed
    // But we still create the summary modal for editing summary parameters
    
    // ============================================================================
    // SHARED MODAL UTILITIES
    // These functions eliminate duplication between createSummaryModal and createSectionModal
    // ============================================================================
    
    // Build dropdown HTML for a parameter
    function buildDropdownHtml(paramKey, paramOption) {
        if (!paramOption.options || !Array.isArray(paramOption.options)) {
            return `<span class="no-options">No options available</span>`;
        }
        
        // [v5.5] Get current value from metrics to set selected option
        const currentMetricsValue = window.metrics && window.metrics[paramKey] ? window.metrics[paramKey] : null;
        
        return `
            <select id="${paramKey}-select" data-param="${paramKey}">
                ${paramOption.options.map(opt => {
                    const isString = typeof opt === 'string';
                    const label = isString ? opt : (opt.label || opt.title);
                    const title = isString ? opt : opt.title;
                    const isDefault = !isString && opt.default === true;
                    // [v5.5] Select based on current metrics value, fallback to default
                    const isSelected = currentMetricsValue !== null 
                        ? (title === currentMetricsValue) 
                        : isDefault;
                    return `<option value="${title}" ${isSelected ? 'selected' : ''}>${label}</option>`;
                }).join('')}
            </select>
        `;
    }
    
    // Build checkbox HTML for a parameter
    // [v5.43] Read initial state from registry (single source of truth)
    function buildCheckboxHtml(paramKey, paramOption) {
        let defaultChecked = '';
        // Read from registry if available
        if (typeof window.getRegistrySummaryChecked === 'function') {
            defaultChecked = window.getRegistrySummaryChecked(paramKey) ? 'checked' : '';
        } else {
            // Fallback to config default
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
    
    // ============================================================================
    // [v5.42] MEASUREMENT INPUT HELPERS
    // Build measurement input rows for modals
    // ============================================================================
    
    /**
     * Get measurement info (label, unit) from parseConfigMap, manualConfig, or registry
     * @param {string} measurementKey - The measurement handle
     * @returns {object} - { label, unit, handle }
     */
    function getMeasurementInfo(measurementKey) {
        // Try parseConfigMap via getter (populated from parse config file)
        const parseConfigMap = typeof window.getParseConfigMap === 'function' ? window.getParseConfigMap() : null;
        if (parseConfigMap && parseConfigMap[measurementKey]) {
            const config = parseConfigMap[measurementKey];
            return {
                handle: measurementKey,
                label: config.label || measurementKey,
                unit: config.unit || ''
            };
        }
        
        // Try manualConfig (manual measurement definitions)
        if (window.manualConfig && Array.isArray(window.manualConfig)) {
            const manualItem = window.manualConfig.find(item => item.handle === measurementKey);
            if (manualItem) {
                return {
                    handle: measurementKey,
                    label: manualItem.label || measurementKey,
                    unit: manualItem.unit || ''
                };
            }
        }
        
        // Try variable registry for unit info
        if (window.variableRegistry && window.variableRegistry[measurementKey]) {
            const regEntry = window.variableRegistry[measurementKey];
            return {
                handle: measurementKey,
                label: measurementKey,  // No label in registry, use handle
                unit: regEntry.unit || ''
            };
        }
        
        // Fallback - use handle as label, no unit
        return {
            handle: measurementKey,
            label: measurementKey,
            unit: ''
        };
    }
    
    /**
     * Check if a variable key is a measurement (vs parameter)
     * @param {string} key - Variable key
     * @returns {boolean} - True if measurement, false if parameter
     */
    function isMeasurement(key) {
        // FIRST: Check if it's a parameter - if in window.parameters, it's NOT a measurement
        if (window.parameters && window.parameters[key]) {
            return false;
        }
        
        // Check registry type (if already registered)
        if (window.variableRegistry && window.variableRegistry[key]) {
            return window.variableRegistry[key].type === 'measurement';
        }
        
        // Check if in measurements table config (opt-m-table.js)
        if (window.measurements && Array.isArray(window.measurements)) {
            for (const group of window.measurements) {
                if (group.items && group.items.includes(key)) {
                    return true;
                }
            }
        }
        
        // Check parseConfigMap
        const parseConfigMap = typeof window.getParseConfigMap === 'function' ? window.getParseConfigMap() : null;
        if (parseConfigMap && parseConfigMap[key]) {
            return true;
        }
        
        // Check manualConfig
        if (window.manualConfig && Array.isArray(window.manualConfig)) {
            if (window.manualConfig.some(item => item.handle === key)) {
                return true;
            }
        }
        
        // Default: assume parameter (unknown keys are likely params)
        return false;
    }
    
    /**
     * Build measurement input row HTML for modal (unified table format)
     * Creates a row matching parameter row structure: label | [empty] | input + unit | [empty]
     * @param {string} measurementKey - The measurement handle
     * @returns {string} - HTML string for table row
     */
    function buildMeasurementInputRowHtml(measurementKey) {
        const info = getMeasurementInfo(measurementKey);
        
        // Get current value from results or registry
        let currentValue = '';
        if (window.results && window.results[measurementKey] !== undefined) {
            currentValue = window.results[measurementKey];
        } else if (window.variableRegistry && window.variableRegistry[measurementKey]) {
            // Strip unit from registry value for input
            const regValue = window.variableRegistry[measurementKey].value || '';
            const unit = window.variableRegistry[measurementKey].unit || info.unit || '';
            if (unit && regValue.endsWith(unit)) {
                currentValue = regValue.slice(0, -unit.length).trim();
            } else {
                currentValue = regValue;
            }
        }
        
        const unitDisplay = info.unit ? `<span class="measurement-unit">${info.unit}</span>` : '';
        
        return `
            <tr data-measurement="${measurementKey}" class="measurement-input-row">
                <td class="param-label">${info.label}</td>
                <td class="param-edit"></td>
                <td class="param-options">
                    <div class="measurement-input-wrapper">
                        <input type="text" 
                               id="${measurementKey}-modal-input" 
                               class="modal-measurement-input" 
                               data-measurement="${measurementKey}"
                               data-unit="${info.unit}"
                               value="${currentValue}"
                               placeholder="-" />
                        ${unitDisplay}
                    </div>
                </td>
                <td></td>
            </tr>
        `;
    }
    
    /**
     * Build measurement section header row (only used if separate section needed)
     * @param {string} title - Section title
     * @returns {string} - HTML string for header row
     */
    function buildMeasurementSectionHeaderHtml(title) {
        return `
            <tr class="measurement-section-header">
                <td colspan="4" style="background-color: #f0f0f0; font-weight: bold; padding: 0.5rem;">${title}</td>
            </tr>
        `;
    }
    
    /**
     * Handle measurement input change in modal
     * Updates registry, results, metrics, and syncs with measurements table
     * @param {string} measurementKey - The measurement handle
     * @param {string} rawValue - The input value (without unit)
     * @param {string} unit - The unit for this measurement
     */
    function handleMeasurementModalInput(measurementKey, rawValue, unit) {
        // Update results object (raw value without unit)
        if (window.results) {
            window.results[measurementKey] = rawValue;
        }
        
        // Update variable registry (value with unit, state as 'manual')
        if (typeof window.updateRegistryMeasurement === 'function') {
            window.updateRegistryMeasurement(measurementKey, rawValue, 'manual');
        }
        
        // [v5.42] Also update metrics with value+unit so updateChangedParameters works
        const valueWithUnit = rawValue && unit ? rawValue + unit : rawValue;
        if (window.metrics) {
            window.metrics[measurementKey] = valueWithUnit;
        }
        
        // Sync with measurements table input if it exists
        const $tableInput = $(`#measurements-table input[data-handle="${measurementKey}"]`);
        if ($tableInput.length) {
            $tableInput.val(rawValue);
            // DON'T trigger input event to avoid circular updates
            // The table's own handler would call back here
        }
        
        // Update any spans in the report that use this measurement
        if (typeof window.updateChangedParameters === 'function') {
            window.updateChangedParameters([measurementKey]);
        }
        
        console.log(`[MeasurementModal] ${measurementKey} updated to: "${valueWithUnit}"`);
    }
    
    /**
     * Attach event handlers for measurement inputs in a modal
     * @param {jQuery} $modal - The modal jQuery object
     * @param {Array} measurementKeys - Array of measurement handles
     */
    function attachMeasurementEventHandlers($modal, measurementKeys) {
        measurementKeys.forEach(measurementKey => {
            const $input = $modal.find(`#${measurementKey}-modal-input`);
            
            if ($input.length) {
                $input.on('input', function() {
                    const rawValue = $(this).val();
                    const unit = $(this).data('unit') || '';
                    handleMeasurementModalInput(measurementKey, rawValue, unit);
                });
                
                // Also sync value when modal opens (in case table was updated)
                $input.on('focus', function() {
                    // Get latest value from results
                    if (window.results && window.results[measurementKey] !== undefined) {
                        $(this).val(window.results[measurementKey]);
                    }
                });
            }
        });
    }
    
    // Expose measurement helpers globally
    window.getMeasurementInfo = getMeasurementInfo;
    window.isMeasurement = isMeasurement;
    window.buildMeasurementInputRowHtml = buildMeasurementInputRowHtml;
    window.handleMeasurementModalInput = handleMeasurementModalInput;
    
    // ============================================================================
    // END MEASUREMENT INPUT HELPERS
    // ============================================================================
    
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
    
    // Update checkbox state in both DOM and registry
    // [v5.43] Write to registry as single source of truth
    function updateCheckboxState($checkbox, shouldCheck, paramKey) {
        if ($checkbox && $checkbox.length) {
            $checkbox.prop('checked', shouldCheck);
            
            // [v5.43] Sync to registry
            if (typeof window.setRegistrySummaryChecked === 'function') {
                window.setRegistrySummaryChecked(paramKey, shouldCheck);
            }
        }
    }
    
    // Handle summary exclude logic
    // [v5.43] Write to registry as single source of truth
    function handleSummaryExclude(paramKey, paramOption) {
        if (paramOption.summaryExclude && Array.isArray(paramOption.summaryExclude)) {
            paramOption.summaryExclude.forEach(excludeKey => {
                const $excludeCheckbox = $(`#${excludeKey}-summary-modal`);
                if ($excludeCheckbox.length && $excludeCheckbox.is(':checked')) {
                    $excludeCheckbox.prop('checked', false);
                    
                    // [v5.43] Sync to registry
                    if (typeof window.setRegistrySummaryChecked === 'function') {
                        window.setRegistrySummaryChecked(excludeKey, false);
                    }
                    
                    if (window.summaryCheckboxManuallyEdited) {
                        window.summaryCheckboxManuallyEdited[excludeKey] = true;
                    }
                }
            });
        }
    }
    
    // Handle summary restore logic - re-check excluded items if appropriate
    // [v5.43] Read/write registry as single source of truth
    function handleSummaryRestore(paramKey, paramOption) {
        if (paramOption.summaryExclude && Array.isArray(paramOption.summaryExclude)) {
            paramOption.summaryExclude.forEach(excludeKey => {
                // Check if any OTHER parameters that also exclude this key are currently checked
                let otherExcludersChecked = false;
                
                // [v5.42] Iterate through all sections and variables
                window.options.forEach(section => {
                    if (!section.variables) return;
                    
                    section.variables.forEach(otherVarKey => {
                        // Skip the parameter we're unchecking
                        if (otherVarKey === paramKey) return;
                        
                        // Look up parameter definition
                        const otherParamOption = window.parameters ? window.parameters[otherVarKey] : null;
                        if (!otherParamOption) return; // Not a parameter
                        
                        // Check if this parameter also excludes the same key
                        if (otherParamOption.summaryExclude && 
                            Array.isArray(otherParamOption.summaryExclude) && 
                            otherParamOption.summaryExclude.includes(excludeKey)) {
                            
                            // [v5.43] Check registry for state, fallback to DOM
                            let isOtherChecked = false;
                            if (typeof window.getRegistrySummaryChecked === 'function') {
                                isOtherChecked = window.getRegistrySummaryChecked(otherVarKey);
                            } else {
                                const $otherCheckbox = $(`#${otherVarKey}-summary-modal`);
                                if ($otherCheckbox.length) {
                                    isOtherChecked = $otherCheckbox.is(':checked');
                                }
                            }
                            
                            if (isOtherChecked) {
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
                        
                        // [v5.43] Sync to registry
                        if (typeof window.setRegistrySummaryChecked === 'function') {
                            window.setRegistrySummaryChecked(excludeKey, true);
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
        // Update the ContentEditable display with the new summary (granular update for performance)
        if (typeof window.updateChangedParameters === 'function') {
            window.updateChangedParameters(['Summary']);
        } else if (typeof window.updateReportTextarea === 'function') {
            // Fallback to full update if granular update not available
            window.updateReportTextarea();
        }
    }
    
    // Handle textarea input event
    function handleTextareaInput(value, paramKey, paramOption, $checkbox, modalKey, $textarea) {
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
        // Only auto-check if summaryOnChange is true
        if (paramOption.enableSummary && $checkbox && $checkbox.length && paramOption.summaryOnChange === true) {
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
        if (modalKey && typeof window.updateModalPreview === 'function') {
            window.updateModalPreview(modalKey);
        }
        
        // [v5.4] Always use granular update - line markers handle visibility
        if (typeof window.updateChangedParameters === 'function') {
            window.updateChangedParameters([paramKey]);
        }
        
        updateSummaryNow();
    }
    
    // Handle custom textarea input event
    function handleCustomTextareaInput(value, paramKey, paramOption, $checkbox, modalKey, $customTextarea) {
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
        if (modalKey && typeof window.updateModalPreview === 'function') {
            window.updateModalPreview(modalKey);
        }
        
        // [v5.4] Always use granular update - line markers handle visibility
        if (typeof window.updateChangedParameters === 'function') {
            window.updateChangedParameters([paramKey]);
        }
        
        updateSummaryNow();
    }
    
    // Handle dropdown change event
    function handleDropdownChange(selectedValue, selectedIndex, paramKey, paramOption, $checkbox, $customTextarea, modalKey) {
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
        
        // Determine state: default, selected, or manual
        let state = 'selected';
        if (selectedOption && selectedOption.default === true) {
            state = 'default';
        }
        
        // Update metrics
        if (window.metrics) {
            window.metrics[paramKey] = selectedValue || "";
        }
        
        // [v5.2] Update variable registry
        if (typeof window.updateRegistryValue === 'function') {
            window.updateRegistryValue(paramKey, selectedValue || "", state);
        }
        
        // Mark that this modal session had changes
        if (window.modalChangedInSession && window.modalInitialState && modalKey && window.modalInitialState[modalKey]) {
            const initialValue = window.modalInitialState[modalKey][paramKey];
            if (initialValue !== selectedValue) {
                window.modalChangedInSession[modalKey] = true;
            }
        }
        
        // Track the selected option object for summary text lookup
        if (window.selectedOptions && selectedOption) {
            window.selectedOptions[paramKey] = selectedOption;
        }
        
        // Handle triggerModal - show/hide sections based on selection
        const currentTriggerSection = selectedOption && selectedOption.triggerModal ? selectedOption.triggerModal : null;
        
        // Check if ANY option in this parameter has a triggerModal
        let paramTriggersSections = [];
        if (paramOption.options && Array.isArray(paramOption.options)) {
            paramOption.options.forEach(opt => {
                if (typeof opt !== 'string' && opt.triggerModal) {
                    paramTriggersSections.push(opt.triggerModal);
                }
            });
        }
        
        // Track if any sections need to be hidden (need full report update)
        let sectionsWereHidden = false;
        
        // Hide any sections that were triggered by this parameter but are not currently selected
        paramTriggersSections.forEach(triggeredSectionKey => {
            if (triggeredSectionKey !== currentTriggerSection) {
                // Check if this section is currently visible (not hidden)
                const wasVisible = !window.hiddenModals || !window.hiddenModals[triggeredSectionKey];
                
                // Hide this section regardless of its current triggered state
                if (window.hiddenModals) {
                    window.hiddenModals[triggeredSectionKey] = true;
                }
                if (window.excludedModals) {
                    window.excludedModals[triggeredSectionKey] = true;
                }
                // Clear triggered state if it was set
                if (window.triggeredModals) {
                    window.triggeredModals[triggeredSectionKey] = false;
                }
                
                // [v5.2] Mark as hidden if it was previously visible
                if (wasVisible) {
                    sectionsWereHidden = true;
                    console.log(`[handleDropdownChange] Section ${triggeredSectionKey} hidden after parameter change`);
                }
            }
        });
        
        // Now trigger the currently selected section (if any)
        if (currentTriggerSection) {
            if (typeof window.triggerModal === 'function') {
                window.triggerModal(currentTriggerSection);
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
        if (modalKey && typeof window.updateModalPreview === 'function') {
            window.updateModalPreview(modalKey);
        }
        
        // [v5.4] Determine update strategy
        if (sectionsWereHidden && typeof window.updateReportTextarea === 'function') {
            // Sections were hidden - need full re-render to remove buttons/content
            window.updateReportTextarea();
        } else if (typeof window.updateChangedParameters === 'function') {
            // Use granular update - line markers handle visibility
            window.updateChangedParameters([paramKey]);
        }
        
        updateSummaryNow();
    }
    
    // Toggle custom textarea visibility
    function toggleCustomTextarea($modal, paramKey, $select, $customTextarea, paramOption, $checkbox, modalKey) {
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
                if (modalKey && typeof window.updateModalPreview === 'function') {
                    window.updateModalPreview(modalKey);
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
    
    // Handle manual checkbox changes
    // [v5.43] Write to registry as single source of truth
    function handleManualCheckboxChange(paramKey, paramOption, isChecked) {
        // [v5.43] Update registry (single source of truth)
        if (typeof window.setRegistrySummaryChecked === 'function') {
            window.setRegistrySummaryChecked(paramKey, isChecked);
        }
        
        // Mark as manually edited
        if (window.summaryCheckboxManuallyEdited) {
            window.summaryCheckboxManuallyEdited[paramKey] = true;
        }
        
        // If checkbox was checked, handle exclusions
        if (isChecked) {
            handleSummaryExclude(paramKey, paramOption);
        } else {
            // If checkbox was unchecked, handle restoration of excluded items
            handleSummaryRestore(paramKey, paramOption);
        }
        
        // Update summary
        updateSummaryNow();
    }
    
    // Attach event handlers for a single parameter
    function attachParameterEventHandlers($modal, paramKey, paramOption, modalKey) {
        const $textarea = $modal.find(`#${paramKey}-textarea`);
        const $select = $modal.find(`#${paramKey}-select`);
        const $checkbox = $modal.find(`#${paramKey}-summary-modal`);
        const $customTextarea = $modal.find(`#${paramKey}-custom-textarea`);
        const isCustomText = paramOption.options === "customtext";
        
        // Textarea input handler (for custom: true or options: "customtext")
        if ($textarea.length) {
            $textarea.on('input', function() {
                handleTextareaInput($(this).val(), paramKey, paramOption, $checkbox, modalKey, $(this));
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
                    modalKey
                );
            });
        }
        
        // Custom textarea input handler (for dropdown + custom text)
        if ($customTextarea.length) {
            $customTextarea.on('input', function() {
                handleCustomTextareaInput($(this).val(), paramKey, paramOption, $checkbox, modalKey, $(this));
            });
        }
        
        // CRITICAL FIX: Manual checkbox change handler
        if ($checkbox.length && paramOption.enableSummary) {
            $checkbox.on('change', function() {
                const isChecked = $(this).is(':checked');
                handleManualCheckboxChange(paramKey, paramOption, isChecked);
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
                    if (modalKey && typeof window.updateModalPreview === 'function') {
                        window.updateModalPreview(modalKey);
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
                    toggleCustomTextarea($modal, paramKey, $select, $customTextarea, paramOption, $checkbox, modalKey);
                });
            }
        }
    }
    
    // ============================================================================
    // END OF SHARED UTILITIES
    // ============================================================================
    
    // ============================================================================
    // [v5.5] MODAL LIFECYCLE MANAGEMENT
    // Modals are created on-demand when opened and destroyed when closed
    // ============================================================================
    
    /**
     * [v5.5] Destroy a modal and remove from DOM
     * @param {string} modalId - Modal element ID
     */
    function destroyModal(modalId) {
        const $modal = $(`#${modalId}`);
        if ($modal.length) {
            $modal.remove();
            console.log(`[v5.5] Destroyed modal: ${modalId}`);
        }
    }
    
    /**
     * [v5.5] Open a modal by modalKey - creates on-demand if needed
     * @param {string} modalKey - The modal key (section identifier)
     * @param {boolean} scrollToSection - Whether to scroll measurements table
     * @returns {jQuery} - The modal element
     */
    function openModalByKey(modalKey) {
        const modalId = `${modalKey}-modal`;
        
        // Destroy existing modal if any
        destroyModal(modalId);
        
        // Find section config
        const section = window.options.find(s => 
            s.modalKey === modalKey || (modalKey === 'Summary' && s.summary === true)
        );
        
        if (!section) {
            console.warn(`[v5.5] Section not found for modalKey: ${modalKey}`);
            return null;
        }
        
        // Create the modal
        createModal(section);
        
        // Get reference and open
        const $modal = $(`#${modalId}`);
        $modal.addClass('active');
        
        // Auto-scroll measurements table (skip for Summary)
        if (modalKey !== 'Summary' && typeof window.scrollToMeasurementModal === 'function') {
            window.scrollToMeasurementModal(modalKey);
        }
        
        return $modal;
    }
    
    /**
     * [v5.5] Close current modal and optionally navigate to another
     * @param {string} currentModalId - Current modal ID to close
     * @param {string} nextModalKey - Optional next modal to open (null = just close)
     */
    function closeAndNavigate(currentModalId, nextModalKey) {
        // Destroy current modal
        destroyModal(currentModalId);
        
        // Open next modal if specified
        if (nextModalKey) {
            openModalByKey(nextModalKey);
        }
    }
    
    // Expose globally for use by script-report.js
    window.openModalByKey = openModalByKey;
    window.destroyModal = destroyModal;
    window.closeAndNavigate = closeAndNavigate;
    
    // Create modal for Summary section (REFACTORED - uses shared utilities)
    // [v5.5] Modals are created on-demand - this function is called when user clicks edit
    function createModal(section) {
        const isSummarySection = section.summary === true || section.modalKey === "Summary";
        const modalKey = section.modalKey || "Summary";
        const modalId = `${modalKey}-modal`;
        
        // [v5.42] Use unified 'variables' array - contains params and measurements interspersed
        const variablesList = section.variables || [];
        
        // Track which items are params vs measurements for event handler attachment
        const paramKeys = [];
        const measurementKeys = [];
        
        // Build all rows (params and measurements interspersed)
        let allRows = '';
        
        variablesList.forEach(varKey => {
            // Determine if this is a measurement or parameter
            const isMeasurementVar = isMeasurement(varKey);
            
            if (isMeasurementVar) {
                // Build measurement input row
                measurementKeys.push(varKey);
                allRows += buildMeasurementInputRowHtml(varKey);
            } else {
                // Build parameter row
                const paramOption = window.parameters[varKey];
                
                if (!paramOption) {
                    console.warn(`Parameter ${varKey} not found in parameters config`);
                    return;
                }
                
                // Summary-specific filtering
                if (isSummarySection) {
                    if (varKey === 'Summary') return;
                    if (!paramOption.enableSummary) return;
                    if (paramOption.summaryAlwaysInclude === true) return;
                }
                
                paramKeys.push(varKey);
                
                const isCustom = paramOption.custom === true;
                const isCustomText = paramOption.options === "customtext";
                const hasSummary = paramOption.enableSummary === true;
                const hasCustomText = paramOption.customText !== false;
                
                let optionsHtml = '';
                let hasEditButton = false;
                if (isCustom || isCustomText) {
                    optionsHtml = buildTextareaHtml(varKey, paramOption);
                    hasEditButton = isCustomText;
                } else if (paramOption.options && Array.isArray(paramOption.options)) {
                    optionsHtml = buildDropdownHtml(varKey, paramOption);
                    hasEditButton = hasCustomText;
                } else {
                    optionsHtml = `<span class="no-options">No options available</span>`;
                }
                
                const editButtonHtml = buildEditButtonHtml(varKey, hasEditButton);
                const summaryHtml = (isSummarySection || hasSummary) ? buildCheckboxHtml(varKey, paramOption) : '';
                
                allRows += `
                    <tr data-param="${varKey}">
                        <td class="param-label">${paramOption.title || varKey}</td>
                        <td class="param-edit">${editButtonHtml}</td>
                        <td class="param-options">${optionsHtml}</td>
                        ${(isSummarySection || hasSummary) ? `<td class="param-summary">${summaryHtml}</td>` : `<td></td>`}
                    </tr>
                `;
                
                if (hasCustomText && !isCustom && !isCustomText) {
                    allRows += buildCustomTextareaRow(varKey, paramOption);
                }
            }
        });
        
        // Build buttons based on section type
        const isDefaultHidden = section.defaultHidden === true;
        const modalButtons = isSummarySection ? `
            <button type="button" class="modal-back-button" data-modal="${modalKey}">← Back</button>
            <button type="button" class="modal-close-button" data-modal="${modalKey}">Close</button>
        ` : isDefaultHidden ? `
            <button type="button" class="modal-back-button" data-modal="${modalKey}">← Back</button>
            <button type="button" class="modal-exclude-button reset-trigger-button" data-modal="${modalKey}" title="Close and reset to default">×</button>
            <button type="button" class="generate-section-button" data-modal="${modalKey}">Done</button>
            <button type="button" class="modal-next-button" data-modal="${modalKey}">Next →</button>
        ` : `
            <button type="button" class="modal-back-button" data-modal="${modalKey}">← Back</button>
            <button type="button" class="modal-exclude-button" data-modal="${modalKey}" title="Exclude section from report">−</button>
            <button type="button" class="generate-section-button" data-modal="${modalKey}">Done</button>
            <button type="button" class="modal-next-button" data-modal="${modalKey}">Next →</button>
        `;
        
        const $modal = $(`
            <div id="${modalId}" class="modal group-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${section.modalTitle}</h2>
                        <button class="close-button" data-modal="${modalId}">&times;</button>
                    </div>
                    <div class="modal-actions">
                        ${modalButtons}
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
                                ${allRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `);
        
        $('body').append($modal);
        
        // Attach parameter event handlers
        paramKeys.forEach(paramKey => {
            const paramOption = window.parameters[paramKey];
            if (paramOption) {
                if (isSummarySection && (paramKey === 'Summary' || !paramOption.enableSummary || paramOption.summaryAlwaysInclude)) {
                    return;
                }
                attachParameterEventHandlers($modal, paramKey, paramOption, modalKey);
            }
        });
        
        // [v5.42] Attach measurement input event handlers
        if (measurementKeys.length > 0) {
            attachMeasurementEventHandlers($modal, measurementKeys);
        }
        
        // [v5.5] Common event handlers - destroy modal on close
        $(`.close-button[data-modal="${modalId}"]`).on('click', function() {
            destroyModal(modalId);
        });
        
        $(`#${modalId}`).on('click', function(e) {
            if ($(e.target).is(`#${modalId}`)) {
                destroyModal(modalId);
            }
        });
        
        if (isSummarySection) {
            $(`.modal-close-button[data-modal="${modalKey}"]`).on('click', function() {
                // Save all dropdown selections before closing and track changes
                const changedParams = [];
                
                paramKeys.forEach(paramKey => {
                    const $select = $modal.find(`#${paramKey}-select`);
                    const $textarea = $modal.find(`#${paramKey}-textarea`);
                    const $customTextarea = $modal.find(`#${paramKey}-custom-textarea`);
                    
                    const oldValue = window.metrics?.[paramKey] || "";
                    let newValue = "";
                    
                    if ($customTextarea.length && $customTextarea.is(':visible')) {
                        newValue = $customTextarea.val() || "";
                        if (window.metrics) window.metrics[paramKey] = newValue;
                    }
                    else if ($select.length && window.metrics) {
                        newValue = $select.val() || "";
                        window.metrics[paramKey] = newValue;
                    }
                    else if ($textarea.length && window.metrics) {
                        newValue = $textarea.val() || "";
                        window.metrics[paramKey] = newValue;
                    }
                    
                    // Track if this parameter changed
                    if (oldValue !== newValue) {
                        changedParams.push(paramKey);
                    }
                });
                
                // Update summary and display
                if (typeof window.updateSummary === 'function') window.updateSummary();
                
                // Only update changed parameters to preserve manual edits
                if (changedParams.length > 0 && typeof window.updateChangedParameters === 'function') {
                    window.updateChangedParameters(changedParams);
                    // Also update Summary since summary modal changes affect it
                    window.updateChangedParameters(['Summary']);
                } else if (changedParams.length > 0 && typeof window.updateReportTextarea === 'function') {
                    // Fallback to full update if granular update not available
                    window.updateReportTextarea();
                }
                
                // Close the modal
                destroyModal(modalId);
            });
        } else if (isDefaultHidden) {
            // DefaultHidden sections: Close button saves changes like Done button
            $(`.modal-close-button[data-modal="${modalKey}"]`).on('click', function() {
                const changedParams = [];
                
                paramKeys.forEach(paramKey => {
                    const $select = $modal.find(`#${paramKey}-select`);
                    const $textarea = $modal.find(`#${paramKey}-textarea`);
                    const $customTextarea = $modal.find(`#${paramKey}-custom-textarea`);
                    
                    const currentMetricsValue = window.metrics?.[paramKey] || "";
                    let newValue = currentMetricsValue;
                    let shouldUpdate = false;
                    
                    if ($customTextarea.length && $customTextarea.is(':visible')) {
                        newValue = $customTextarea.val() || "";
                        shouldUpdate = true;
                    }
                    else if ($select.length) {
                        const initialDropdownValue = window.modalDropdownState?.[modalKey]?.[paramKey] || '';
                        const currentDropdownValue = $select.val() || '';
                        
                        if (currentDropdownValue !== initialDropdownValue) {
                            newValue = currentDropdownValue;
                            shouldUpdate = true;
                            
                            if (window.manuallyEditedParams) {
                                delete window.manuallyEditedParams[paramKey];
                            }
                        }
                    }
                    else if ($textarea.length) {
                        newValue = $textarea.val() || "";
                        shouldUpdate = true;
                    }
                    
                    if (shouldUpdate && newValue !== currentMetricsValue) {
                        if (window.metrics) window.metrics[paramKey] = newValue;
                        changedParams.push(paramKey);
                    }
                });
                
                if (typeof window.updateSummary === 'function') window.updateSummary();
                
                if (changedParams.length > 0 && typeof window.updateChangedParameters === 'function') {
                    window.updateChangedParameters(changedParams);
                }
                
                destroyModal(modalId);
            });
        }
        
        $(`.modal-back-button[data-modal="${modalKey}"]`).on('click', function() {
            // Get all sections except Summary
            const allSections = window.options.filter(section => 
                section.modalKey && 
                section.modalKey !== "Summary" &&
                section.summary !== true
            );
            
            let prevSection = null;
            
            if (isSummarySection) {
                // Summary → go to last visible non-Summary section
                prevSection = findLastVisibleSection(allSections);
            } else {
                // Regular section → go to previous visible section
                const currentIndex = allSections.findIndex(s => s.modalKey === modalKey);
                prevSection = findPreviousVisibleSection(allSections, currentIndex);
            }
            
            // [v5.5] Destroy current modal first, then open new one
            destroyModal(modalId);
            
            if (prevSection) {
                const prevSectionKey = prevSection.section.modalKey;
                openModalByKey(prevSectionKey);
            }
        });
        
        // Section-specific handlers
        if (!isSummarySection) {
            // [v5.5] Template button opens modal from measurements table
            $(`.template-button[data-modal="${modalKey}"]`).on('click', function() {
                // Open modal on-demand (it will be created fresh with current values)
                openModalByKey(modalKey);
                
                // Initialize state tracking after modal is created
                if (!window.modalChangedInSession) window.modalChangedInSession = {};
                if (!window.modalInitialState) window.modalInitialState = {};
                if (!window.modalDropdownState) window.modalDropdownState = {};
                
                window.modalChangedInSession[modalKey] = false;
                window.modalInitialState[modalKey] = {};
                window.modalDropdownState[modalKey] = {};
                
                // Capture current state for change detection
                const $newModal = $(`#${modalId}`);
                $newModal.find('select[data-param]').each(function() {
                    const paramKey = $(this).data('param');
                    window.modalDropdownState[modalKey][paramKey] = $(this).val() || '';
                    window.modalInitialState[modalKey][paramKey] = window.metrics?.[paramKey] || '';
                });
            });
            
            $(`.generate-section-button[data-modal="${modalKey}"]`).on('click', function() {
                const changedParams = [];
                
                paramKeys.forEach(paramKey => {
                    const $select = $modal.find(`#${paramKey}-select`);
                    const $textarea = $modal.find(`#${paramKey}-textarea`);
                    const $customTextarea = $modal.find(`#${paramKey}-custom-textarea`);
                    
                    const currentMetricsValue = window.metrics?.[paramKey] || "";
                    let newValue = currentMetricsValue; // Default: preserve current value
                    let shouldUpdate = false;
                    
                    if ($customTextarea.length && $customTextarea.is(':visible')) {
                        // Custom textarea is visible - use its value
                        newValue = $customTextarea.val() || "";
                        shouldUpdate = true;
                    }
                    else if ($select.length) {
                        // [v5.2] Check if dropdown actually changed during this modal session
                        const initialDropdownValue = window.modalDropdownState?.[modalKey]?.[paramKey] || '';
                        const currentDropdownValue = $select.val() || '';
                        
                        if (currentDropdownValue !== initialDropdownValue) {
                            // User changed the dropdown - use dropdown value
                            newValue = currentDropdownValue;
                            shouldUpdate = true;
                            
                            // Clear manual edit flag since user made a dropdown selection
                            if (window.manuallyEditedParams) {
                                delete window.manuallyEditedParams[paramKey];
                            }
                        }
                        // If dropdown didn't change, preserve the current metrics value
                        // (which may include manual edits)
                    }
                    else if ($textarea.length) {
                        newValue = $textarea.val() || "";
                        shouldUpdate = true;
                    }
                    
                    // Only update metrics if the value actually changed
                    if (shouldUpdate && newValue !== currentMetricsValue) {
                        if (window.metrics) window.metrics[paramKey] = newValue;
                        changedParams.push(paramKey);
                    }
                });
                
                if (typeof window.updateSummary === 'function') window.updateSummary();
                
                // [v5.4] Only update changed parameters to preserve manual edits
                if (changedParams.length > 0 && typeof window.updateChangedParameters === 'function') {
                    window.updateChangedParameters(changedParams);
                }
                
                destroyModal(modalId);
            });
            
            $(`.modal-next-button[data-modal="${modalKey}"]`).on('click', function() {
                const changedParams = [];
                
                paramKeys.forEach(paramKey => {
                    const $select = $modal.find(`#${paramKey}-select`);
                    const $textarea = $modal.find(`#${paramKey}-textarea`);
                    const $customTextarea = $modal.find(`#${paramKey}-custom-textarea`);
                    
                    const currentMetricsValue = window.metrics?.[paramKey] || "";
                    let newValue = currentMetricsValue;
                    let shouldUpdate = false;
                    
                    if ($customTextarea.length && $customTextarea.is(':visible')) {
                        newValue = $customTextarea.val() || "";
                        shouldUpdate = true;
                    }
                    else if ($select.length) {
                        // [v5.2] Check if dropdown actually changed during this modal session
                        const initialDropdownValue = window.modalDropdownState?.[modalKey]?.[paramKey] || '';
                        const currentDropdownValue = $select.val() || '';
                        
                        if (currentDropdownValue !== initialDropdownValue) {
                            newValue = currentDropdownValue;
                            shouldUpdate = true;
                            if (window.manuallyEditedParams) {
                                delete window.manuallyEditedParams[paramKey];
                            }
                        }
                    }
                    else if ($textarea.length) {
                        newValue = $textarea.val() || "";
                        shouldUpdate = true;
                    }
                    
                    if (shouldUpdate && newValue !== currentMetricsValue) {
                        if (window.metrics) window.metrics[paramKey] = newValue;
                        changedParams.push(paramKey);
                    }
                });
                
                if (typeof window.updateSummary === 'function') window.updateSummary();
                
                // [v5.4] Only update changed parameters to preserve manual edits
                if (changedParams.length > 0 && typeof window.updateChangedParameters === 'function') {
                    window.updateChangedParameters(changedParams);
                }
                
                // [v5.5] Destroy current modal first
                destroyModal(modalId);
                
                const allSections = window.options.filter(s => s.modalKey);
                const currentIndex = allSections.findIndex(s => s.modalKey === modalKey);
                const nextVisible = findNextVisibleSection(allSections, currentIndex);
                
                // [v5.5] Open next modal on-demand
                if (nextVisible) {
                    const nextSectionKey = nextVisible.section.modalKey;
                    openModalByKey(nextSectionKey);
                } else {
                    // Open Summary modal
                    openModalByKey('Summary');
                }
            });
            
            $(`.modal-exclude-button[data-modal="${modalKey}"]`).on('click', function() {
                // Check if this is a reset-trigger button (for defaultHidden/triggered sections)
                if ($(this).hasClass('reset-trigger-button')) {
                    // Reset the triggered section
                    if (typeof window.resetTriggeredModal === 'function') {
                        window.resetTriggeredModal(modalKey);
                    }
                    // Close the modal after resetting
                    destroyModal(modalId);
                } else {
                    // Use unified toggle function from script-report.js
                    const isNowExcluded = typeof window.toggleModalExclusion === 'function' 
                        ? window.toggleModalExclusion(modalKey)
                        : false;
                    
                    // Update button text in modal
                    if (isNowExcluded) {
                        $(this).text('+').attr('title', 'Include section in report');
                    } else {
                        $(this).text('−').attr('title', 'Exclude section from report');
                    }
                }
            });
        }
    }
    function findNextVisibleSection(allSections, currentIndex) {
        for (let i = currentIndex + 1; i < allSections.length; i++) {
            const section = allSections[i];
            const modalKey = section.modalKey;
            // Check if section is hidden or excluded
            if (window.hiddenModals && window.hiddenModals[modalKey]) {
                continue; // Skip hidden sections
            }
            if (window.excludedModals && window.excludedModals[modalKey]) {
                continue; // Skip excluded sections
            }
            return { section, index: i };
        }
        return null; // No visible sections found
    }
    
    // Helper function to find the previous visible (non-hidden, non-excluded) section
    function findPreviousVisibleSection(allSections, currentIndex) {
        for (let i = currentIndex - 1; i >= 0; i--) {
            const section = allSections[i];
            const modalKey = section.modalKey;
            // Check if section is hidden or excluded
            if (window.hiddenModals && window.hiddenModals[modalKey]) {
                continue; // Skip hidden sections
            }
            if (window.excludedModals && window.excludedModals[modalKey]) {
                continue; // Skip excluded sections
            }
            return { section, index: i };
        }
        return null; // No visible sections found
    }
    
    // Helper function to find the last visible section
    function findLastVisibleSection(allSections) {
        for (let i = allSections.length - 1; i >= 0; i--) {
            const section = allSections[i];
            const modalKey = section.modalKey;
            // Check if section is hidden or excluded
            if (window.hiddenModals && window.hiddenModals[modalKey]) {
                continue; // Skip hidden sections
            }
            if (window.excludedModals && window.excludedModals[modalKey]) {
                continue; // Skip excluded sections
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