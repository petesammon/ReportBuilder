/* jshint loopfunc: true, esversion: 11 */
/* EchoTools v5.4 - Never re-render model for manual edit preservation */

jQuery(document).ready(function () {
    // Show the options section
    $("#options").show();
    
    // Clear the import modal textarea on page load
    $("#report").val("");
    
    const metrics = {};
    const results = {}; // For parsed measurement data
    const selectedOptions = {}; // Track which option was selected for each parameter
    const excludedModals = {}; // Track which sections are excluded from the report
    const hiddenModals = {}; // Track which sections are hidden (triggered sections)
    const triggeredModals = {}; // Track which sections were triggered (to show [x] button)
    let summaryManuallyEdited = false;
    const summaryCheckboxManuallyEdited = {}; // Track which checkboxes were manually changed
    const modalPreviewManuallyEdited = {}; // Track which section previews were manually edited
    const modalTemplates = {}; // Store compiled section templates
    let parseConfig = []; // Will be loaded dynamically
    let parseConfigMap = {}; // Will be populated after loading
    let measurements = []; // Will be loaded dynamically
    let parameters = {}; // Parameter definitions loaded from params file
    let options = []; // Will be loaded dynamically - modal groupings
    
    // Button protection state
    let buttonProtectionObserver = null;
    let expectedButtonCount = 0;
    let isRestoringButtons = false;
    let isFixingCursor = false;

    // ============================================================================
    // VARIABLE REGISTRY (v5.2)
    // Central data store for all parameters and measurements with metadata
    // ============================================================================
    
    /**
     * Variable Registry - stores value, modalKey, type, and state for every variable
     */
    const variableRegistry = {};
    
    /**
     * Initialize variable registry from config files
     * Called once after all configs are loaded
     */
    function initializeVariableRegistry() {
        // Clear existing registry
        Object.keys(variableRegistry).forEach(key => delete variableRegistry[key]);
        
        // Clear preprocessed template so it gets rebuilt with new registry
        clearPreprocessedTemplate();
        
        // 1. Register all parameters with their modalKeys (from options/form config)
        if (window.options && Array.isArray(window.options)) {
            window.options.forEach(group => {
                if (!group.modalKey || !group.params) return;
                const modalKey = group.modalKey;
                const paramList = Array.isArray(group.params) ? group.params : Object.keys(group.params);
                
                paramList.forEach(paramKey => {
                    variableRegistry[paramKey] = {
                        value: '',
                        modalKey: modalKey,
                        type: 'param',
                        state: 'default'
                    };
                });
            });
        }
        
        // 2. Register all measurements with their modalKeys (from measurements config)
        if (measurements && Array.isArray(measurements)) {
            measurements.forEach(group => {
                if (!group.items) return;
                const modalKeys = Array.isArray(group.modalKey) ? group.modalKey : [group.modalKey];
                const primaryModalKey = modalKeys[0] || null;
                
                group.items.forEach(measurementKey => {
                    // Get unit from parseConfigMap if available
                    const config = parseConfigMap[measurementKey];
                    const unit = config?.unit || '';
                    
                    variableRegistry[measurementKey] = {
                        value: '',
                        modalKey: primaryModalKey,
                        type: 'measurement',
                        state: 'imported',
                        unit: unit
                    };
                });
            });
        }
        
        // 3. Set default parameter values from parameters config
        if (window.parameters && typeof window.parameters === 'object') {
            Object.keys(window.parameters).forEach(paramKey => {
                const param = window.parameters[paramKey];
                // Check that options exists AND is an array before using .find()
                if (param.options && Array.isArray(param.options) && variableRegistry[paramKey]) {
                    const defaultOpt = param.options.find(o => typeof o !== 'string' && o.default);
                    if (defaultOpt) {
                        variableRegistry[paramKey].value = defaultOpt.title || '';
                        variableRegistry[paramKey].state = 'default';
                    }
                }
            });
        }
        
        // 4. Register Summary (special case - belongs to Summary modal)
        variableRegistry['Summary'] = {
            value: '',
            modalKey: 'Summary',
            type: 'param',
            state: 'default'
        };
        
        console.log('[VariableRegistry] Initialized with', Object.keys(variableRegistry).length, 'variables');
        
        // Expose globally
        window.variableRegistry = variableRegistry;
    }
    
    /**
     * Update a value in the registry
     */
    function updateRegistryValue(key, value, state) {
        if (variableRegistry[key]) {
            variableRegistry[key].value = value;
            if (state) {
                variableRegistry[key].state = state;
            }
        } else {
            // Auto-register unknown variables (edge case)
            console.warn(`[VariableRegistry] Auto-registering unknown variable: ${key}`);
            variableRegistry[key] = {
                value: value,
                modalKey: null,
                type: 'unknown',
                state: state || 'manual'
            };
        }
    }
    
    /**
     * Update measurement value with unit handling
     */
    function updateRegistryMeasurement(key, rawValue, state) {
        if (!variableRegistry[key]) {
            // Try to get unit from parseConfigMap
            const config = parseConfigMap[key];
            variableRegistry[key] = {
                value: '',
                modalKey: null,
                type: 'measurement',
                state: state || 'imported',
                unit: config?.unit || ''
            };
        }
        
        const entry = variableRegistry[key];
        const unit = entry.unit || '';
        
        // Store value with unit appended
        if (rawValue && unit && !rawValue.toString().endsWith(unit)) {
            entry.value = rawValue + unit;
        } else {
            entry.value = rawValue || '';
        }
        
        if (state) {
            entry.state = state;
        }
    }
    
    /**
     * Get a registry entry
     */
    function getRegistryEntry(key) {
        return variableRegistry[key] || null;
    }
    
    /**
     * Get all values from registry as a simple object
     */
    function getRegistryValues() {
        const values = {};
        Object.entries(variableRegistry).forEach(([key, entry]) => {
            values[key] = entry.value;
        });
        return values;
    }

    // ============================================================================
    // TEMPLATE PREPROCESSING (v5.2)
    // Wraps {{variables}} in spans at template compile time, not render time
    // ============================================================================
    
    let preprocessedTemplate = null;
    let preprocessedTemplateString = null;
    
    /**
     * Clear preprocessed template cache (called when config changes)
     */
    function clearPreprocessedTemplate() {
        preprocessedTemplate = null;
        preprocessedTemplateString = null;
    }
    
    /**
     * Build param -> modal mapping from options config
     */
    function buildParamToModalMap() {
        const paramToModal = {};
        if (window.options && Array.isArray(window.options)) {
            window.options.forEach(group => {
                if (!group.modalKey || !group.params) return;
                const modalKey = group.modalKey;
                const paramList = Array.isArray(group.params) ? group.params : Object.keys(group.params);
                paramList.forEach(paramKey => {
                    paramToModal[paramKey] = modalKey;
                });
            });
        }
        return paramToModal;
    }
    
    /**
     * Preprocess template to wrap {{variables}} in spans with data-modal attributes
     * Called once per template load, not on every render
     */
    function preprocessTemplate(templateString) {
        const paramToModal = buildParamToModalMap();
        
        // Regex to find Handlebars variables (but not helpers like #if, #each, etc.)
        // Matches: {{varName}} but not {{#if}} {{/if}} {{else}} {{{triple}}}
        const variableRegex = /\{\{(?!#|\/|else|!|>)([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
        
        const wrappedTemplate = templateString.replace(variableRegex, (match, varName) => {
            // Look up modal for this variable
            const modalKey = paramToModal[varName] || '';
            
            // Wrap in span with data attributes
            // The {{varName}} stays inside so Handlebars still processes it
            return `<span data-param="${varName}" data-modal="${modalKey}" class="param-span">{{${varName}}}</span>`;
        });
        
        return wrappedTemplate;
    }
    
    /**
     * Get or create preprocessed template
     */
    function getPreprocessedTemplate() {
        if (!preprocessedTemplate && window.outputTemplateString) {
            preprocessedTemplateString = preprocessTemplate(window.outputTemplateString);
            preprocessedTemplate = Handlebars.compile(preprocessedTemplateString, { noEscape: true });
            console.log('[v5.2] Template preprocessed with span wrapping');
        }
        return preprocessedTemplate;
    }

    // ============================================================================
    // SHARED UTILITIES
    // Functions used by both script-report.js and script-form.js
    // ============================================================================
    
    /**
     * Extract all variables (params + measurements) belonging to a section
     */
    function extractModalVariables(modalKey) {
        const variables = [];
        
        // Get parameters from options config
        if (window.options && Array.isArray(window.options)) {
            const section = window.options.find(s => s.modalKey === modalKey);
            if (section && section.params) {
                const paramList = Array.isArray(section.params) ? section.params : Object.keys(section.params);
                variables.push(...paramList);
            }
        }
        
        // Get measurements that belong to this section
        if (measurements && Array.isArray(measurements)) {
            measurements.forEach(group => {
                const modalKeys = Array.isArray(group.modalKey) ? group.modalKey : [group.modalKey];
                if (modalKeys.includes(modalKey)) {
                    variables.push(...group.items);
                }
            });
        }
        
        return variables;
    }
    
    /**
     * Prepare results object with units appended
     */
    function prepareResultsWithUnits() {
        const outputResults = {};
        
        Object.entries(results).forEach(([key, value]) => {
            const config = parseConfigMap[key];
            if (value && config?.unit) {
                const unit = config.unit;
                outputResults[key] = value.toString().endsWith(unit) ? value : value + unit;
            } else {
                outputResults[key] = value;
            }
        });
        
        return outputResults;
    }
    
    /**
     * Process metrics through Handlebars to resolve nested templates
     */
    function processMetricsThroughHandlebars(baseData) {
        const processedMetrics = {};
        
        Object.entries(metrics).forEach(([key, value]) => {
            if (typeof value === 'string' && value.includes('{{')) {
                try {
                    const template = Handlebars.compile(value);
                    processedMetrics[key] = template(baseData);
                } catch (e) {
                    console.warn(`Failed to process metric ${key}:`, e);
                    processedMetrics[key] = value;
                }
            } else {
                processedMetrics[key] = value;
            }
        });
        
        return processedMetrics;
    }
    
    /**
     * Prepare complete output data (results with units + processed metrics)
     */
    function prepareOutputData() {
        const outputResults = prepareResultsWithUnits();
        const processedMetrics = processMetricsThroughHandlebars(outputResults);
        return { ...outputResults, ...processedMetrics };
    }
    
    /**
     * Filter data by clearing variables in excluded/hidden sections
     * Also tracks which variables were excluded (for field marker logic)
     */
    function filterExcludedModalData(data) {
        const filteredData = { ...data };
        const excludedVariables = new Set();
        
        // Clear variables in excluded sections
        Object.keys(excludedModals).forEach(modalKey => {
            if (excludedModals[modalKey]) {
                // Add the section key itself (for field markers using section key as name)
                excludedVariables.add(modalKey);
                
                const sectionVariables = extractModalVariables(modalKey);
                sectionVariables.forEach(varName => {
                    filteredData[varName] = '';
                    excludedVariables.add(varName);
                });
            }
        });
        
        // Clear variables in hidden sections
        if (window.hiddenModals) {
            Object.keys(window.hiddenModals).forEach(modalKey => {
                if (window.hiddenModals[modalKey]) {
                    // Add the section key itself (for field markers using section key as name)
                    excludedVariables.add(modalKey);
                    
                    const sectionVariables = extractModalVariables(modalKey);
                    sectionVariables.forEach(varName => {
                        filteredData[varName] = '';
                        excludedVariables.add(varName);
                    });
                }
            });
        }
        
        // Attach excluded variables set for field marker processing
        filteredData._excludedVariables = excludedVariables;
        
        return filteredData;
    }
    
    /**
     * Initialize section visibility states based on config
     * Called when report config is loaded
     */
    function initializeModalVisibility() {
        if (!window.options || !Array.isArray(window.options)) return;
        
        window.options.forEach(section => {
            if (!section.modalKey) return;
            
            const modalKey = section.modalKey;
            
            // Initialize defaultHidden sections (note: check for both spellings)
            if (section.defaultHidden === true || section.defaulHidden === true) {
                hiddenModals[modalKey] = true;
                excludedModals[modalKey] = true; // Hidden sections are also excluded
            }
            // Initialize defaultExcluded sections
            else if (section.defaultExcluded === true) {
                excludedModals[modalKey] = true;
            }
        });
        
        // Sync to window for access from other modules
        window.hiddenModals = hiddenModals;
        window.excludedModals = excludedModals;
        window.triggeredModals = triggeredModals;
    }
    
    /**
     * Trigger a hidden section to become visible
     * Called when a parameter option with triggerModal is selected
     * [v5.4] Uses granular DOM updates instead of full re-render
     */
    function triggerModal(modalKey) {
        const isHidden = window.hiddenModals && window.hiddenModals[modalKey];
        
        if (isHidden) {
            // Update both local and window state
            hiddenModals[modalKey] = false;
            excludedModals[modalKey] = false;
            triggeredModals[modalKey] = true;
            
            // Sync to window
            window.hiddenModals = hiddenModals;
            window.excludedModals = excludedModals;
            window.triggeredModals = triggeredModals;
            
            // Also ensure window state is updated for this specific key
            window.hiddenModals[modalKey] = false;
            window.excludedModals[modalKey] = false;
            window.triggeredModals[modalKey] = true;
            
            // Update button count
            updateExpectedButtonCount();
            
            // [v5.4] For triggering sections, we need to show new content
            // This is one case where we DO need to regenerate HTML for the new section
            // But we do it in a way that preserves manual edits in OTHER sections
            if (typeof updateReportTextarea === 'function') {
                updateReportTextarea();
            }
        }
    }
    
    /**
     * Reset a triggered section back to hidden state
     * Called when the [x] button is clicked
     */
    function resetTriggeredModal(modalKey) {
        console.log(`[resetTriggeredModal] Attempting to reset: ${modalKey}`);
        
        const isTriggered = (window.triggeredModals && window.triggeredModals[modalKey]) || 
                            triggeredModals[modalKey];
        
        if (isTriggered) {
            // Clear triggered state in both local and window
            triggeredModals[modalKey] = false;
            window.triggeredModals = triggeredModals;
            if (window.triggeredModals) {
                window.triggeredModals[modalKey] = false;
            }
            
            console.log(`[resetTriggeredModal] Cleared triggered state, calling resetTriggerParameter`);
            
            // Reset the parameter that triggered this section to its default value
            resetTriggerParameter(modalKey);
            
            // Update button count after parameter reset completes
            setTimeout(() => {
                updateExpectedButtonCount();
            }, 0);
            
            return true;
        }
        return false;
    }
    
    /**
     * Find and reset the parameter that triggered a section
     */
    function resetTriggerParameter(modalKey) {
        if (!window.parameters) {
            console.warn('[resetTriggerParameter] No parameters found');
            return;
        }
        
        // Find the parameter that triggers this section
        let triggerParamKey = null;
        let triggerParamDef = null;
        let defaultOption = null;
        
        Object.entries(window.parameters).forEach(([paramKey, paramDef]) => {
            if (!paramDef.options || !Array.isArray(paramDef.options)) return;
            
            paramDef.options.forEach(opt => {
                if (typeof opt !== 'string' && opt.triggerModal === modalKey) {
                    triggerParamKey = paramKey;
                    triggerParamDef = paramDef;
                }
                if (typeof opt !== 'string' && opt.default === true) {
                    defaultOption = opt;
                }
            });
        });
        
        if (!triggerParamKey || !defaultOption) {
            console.warn(`[resetTriggerParameter] Could not find trigger parameter for ${modalKey}`);
            return;
        }
        
        console.log(`[resetTriggerParameter] Resetting ${triggerParamKey} to default: "${defaultOption.title}"`);
        
        // Find and update the dropdown
        const $select = $(`#${triggerParamKey}-select`);
        if ($select.length) {
            $select.val(defaultOption.title);
            // Trigger change event to run all the update logic
            $select.trigger('change');
        } else {
            // Fallback: update metrics directly
            if (window.metrics) {
                window.metrics[triggerParamKey] = defaultOption.title;
            }
            if (window.selectedOptions) {
                window.selectedOptions[triggerParamKey] = defaultOption;
            }
        }
    }
    
    /**
     * [v5.4] Toggle section exclusion with granular DOM updates
     * Instead of full re-render, we show/hide section content in the DOM
     */
    function toggleModalExclusion(modalKey) {
        // Initialize excludedModals if needed
        if (!window.excludedModals) {
            window.excludedModals = {};
        }
        
        // Toggle state
        const wasExcluded = window.excludedModals[modalKey] || false;
        window.excludedModals[modalKey] = !wasExcluded;
        
        // Also update local reference
        excludedModals[modalKey] = window.excludedModals[modalKey];
        
        const isNowExcluded = window.excludedModals[modalKey];
        
        // [v5.4] Granular DOM update instead of full re-render
        // Find and update button in report textarea
        const $textarea = $('#report-textarea');
        const $buttonGroup = $textarea.find(`.inline-button-group[data-modal="${modalKey}"]`);
        
        if ($buttonGroup.length) {
            // Get the section config
            const section = window.options.find(s => s.modalKey === modalKey);
            const modalTitle = section ? section.modalTitle : modalKey;
            
            if (isNowExcluded) {
                // Update button to show + only
                $buttonGroup.html(`<button type="button" class="inline-exclude-button excluded" data-modal="${modalKey}" title="Include section in report">+</button>`);
            } else {
                // Update button to show edit + exclude
                $buttonGroup.html(`<button type="button" class="inline-edit-button" data-modal="${modalKey}" title="Edit ${modalTitle}">✎</button><button type="button" class="inline-exclude-button" data-modal="${modalKey}" title="Exclude section from report">−</button>`);
            }
            
            // [v5.4] Hide/show field wrappers for this section
            const sectionVariables = extractModalVariables(modalKey);
            sectionVariables.forEach(varName => {
                const $fieldWrapper = $textarea.find(`.field-wrapper[data-field="${varName}"]`);
                if ($fieldWrapper.length) {
                    if (isNowExcluded) {
                        $fieldWrapper.hide();
                    } else {
                        $fieldWrapper.show();
                    }
                }
                
                // Also clear/restore param spans
                const $paramSpan = $textarea.find(`[data-param="${varName}"][data-modal="${modalKey}"]`);
                if ($paramSpan.length) {
                    if (isNowExcluded) {
                        $paramSpan.data('savedValue', $paramSpan.text());
                        $paramSpan.text('');
                    } else {
                        // Restore from saved value or metrics
                        const savedValue = $paramSpan.data('savedValue');
                        const metricsValue = window.metrics ? window.metrics[varName] : '';
                        $paramSpan.text(savedValue || metricsValue || '');
                    }
                }
            });
            
            // Also handle the section heading field wrapper (uses modalKey as field name)
            const $sectionFieldWrapper = $textarea.find(`.field-wrapper[data-field="${modalKey}"]`);
            if ($sectionFieldWrapper.length) {
                if (isNowExcluded) {
                    $sectionFieldWrapper.hide();
                } else {
                    $sectionFieldWrapper.show();
                }
            }
        } else {
            // Fallback: if button not found, do full regenerate
            // This shouldn't happen in normal operation
            console.warn(`[toggleModalExclusion] Button group not found for ${modalKey}, falling back to full re-render`);
            if (typeof updateReportTextarea === 'function') {
                updateReportTextarea();
            }
        }
        
        // Update summary (excluded sections shouldn't contribute)
        if (typeof window.updateSummary === 'function') {
            window.updateSummary();
        }
        
        return window.excludedModals[modalKey];
    }
    
    // Expose toggle function globally for form.js
    window.toggleModalExclusion = toggleModalExclusion;

    // ============================================================================
    // END SHARED UTILITIES
    // ============================================================================

    // Register Handlebars helper (kept for backwards compatibility)
    Handlebars.registerHelper('param', function(paramKey, options) {
        const value = options.fn ? options.fn(this) : this[paramKey];
        
        if (!value || value === '') {
            return '';
        }
        
        const isParameter = paramKey && (paramKey.startsWith('p') || paramKey.startsWith('sp'));
        
        if (isParameter) {
            return new Handlebars.SafeString(
                `<span data-param="${paramKey}" class="param-span">${value}</span>`
            );
        } else {
            return value;
        }
    });

    // Auto-resize textarea to fit content
    function autoResizeTextarea($textarea, minHeight) {
        if (!$textarea || !$textarea.length) return;
        
        if (minHeight) {
            // First, set to minimum height
            $textarea.css('height', minHeight + 'px');
            
            // Now check if content overflows at this height
            const scrollHeight = $textarea[0].scrollHeight;
            
            if (scrollHeight > minHeight) {
                // Content overflows, expand to fit
                $textarea.css('height', scrollHeight + 'px');
            }
        } else {
            // Original behavior: auto-resize to content
            $textarea.css('height', 'auto');
            $textarea.css('height', $textarea[0].scrollHeight + 'px');
        }
    }

    // ============================================================================
    // MEASUREMENT PARSING
    // ============================================================================

    // Build the measurements table
    function buildMeasurementsTable() {
        const $table = $('#measurements-table');
        $table.empty();
        
        // Create table structure
        const $tableElement = $('<table></table>');
        
        measurements.forEach(group => {
            // Create section header row with data-section attribute for scrolling
            const modalKeys = Array.isArray(group.modalKey) ? group.modalKey : [group.modalKey];
            const modalKeysAttr = modalKeys.join(' ');
            
            const headerClass = group.highlight ? 'highlight-header' : '';
            const $headerRow = $(`<tr class="section-header ${headerClass}" data-section="${modalKeysAttr}"><th colspan="3">${group.modalTitle}</th></tr>`);
            $tableElement.append($headerRow);
            
            // Create rows for each measurement
            group.items.forEach(itemKey => {
                const config = parseConfigMap[itemKey];
                const label = config?.label || itemKey;
                const unit = config?.unit || '';
                const value = results[itemKey] || '';
                const isManual = config?.match === ''; // Empty match string indicates manual entry
                
                const $row = $(`
                    <tr data-measurement="${itemKey}" data-section="${modalKeysAttr}">
                        <td class="measurement-label">${label}</td>
                        <td class="measurement-value">
                            <input type="text" 
                                   id="measurement-${itemKey}" 
                                   value="${value}" 
                                   placeholder="${isManual ? 'Manual' : '—'}"
                                   class="${isManual ? 'manual-entry' : ''}"
                            />
                        </td>
                        <td class="measurement-unit">${unit}</td>
                    </tr>
                `);
                
                // Add change handler
                $row.find('input').on('change', function() {
                    const newValue = $(this).val();
                    results[itemKey] = newValue;
                    
                    // Update registry
                    if (typeof updateRegistryMeasurement === 'function') {
                        updateRegistryMeasurement(itemKey, newValue, 'manual');
                    }
                    
                    // Run calculations
                    runCalculations();
                    
                    // [v5.4] Granular update for measurement changes
                    if (typeof updateChangedParameters === 'function') {
                        updateChangedParameters([itemKey]);
                    }
                });
                
                $tableElement.append($row);
            });
        });
        
        $table.append($tableElement);
    }
    
    // Run calculations on results
    function runCalculations() {
        if (typeof calculations === 'undefined') return;
        
        Object.entries(calculations).forEach(([key, calcFn]) => {
            try {
                const result = calcFn(results);
                if (result !== undefined && result !== null && result !== "N/A") {
                    results[key] = result;
                    
                    // Update the input field if it exists
                    const $input = $(`#measurement-${key}`);
                    if ($input.length) {
                        $input.val(result);
                    }
                }
            } catch (e) {
                console.warn(`Calculation error for ${key}:`, e);
            }
        });
    }

    // Parse input text to extract measurements
    function parseInputText(inputText) {
        // Clear previous results (but keep manual entries)
        const manualEntries = {};
        Object.entries(results).forEach(([key, value]) => {
            const config = parseConfigMap[key];
            if (config?.match === '' && value) {
                manualEntries[key] = value;
            }
        });
        
        // Clear results
        Object.keys(results).forEach(key => delete results[key]);
        
        // Restore manual entries
        Object.assign(results, manualEntries);
        
        // Parse each config
        parseConfig.forEach(config => {
            if (!config.match) return; // Skip items without match pattern
            
            const regex = new RegExp(config.match);
            const match = inputText.match(regex);
            
            if (match && match[1]) {
                results[config.handle] = match[1].trim();
            }
        });
        
        // Run calculations
        runCalculations();
        
        // Update the measurements table
        updateMeasurementsDisplay();
        
        // Update variable registry with imported values
        Object.entries(results).forEach(([key, value]) => {
            if (typeof updateRegistryMeasurement === 'function') {
                updateRegistryMeasurement(key, value, 'imported');
            }
        });
        
        // [v5.4] Update report using granular updates
        if (typeof updateChangedParameters === 'function') {
            updateChangedParameters(Object.keys(results));
        }
    }
    
    // Update measurements display
    function updateMeasurementsDisplay() {
        Object.entries(results).forEach(([key, value]) => {
            const $input = $(`#measurement-${key}`);
            if ($input.length) {
                $input.val(value);
            }
        });
    }

    // ============================================================================
    // MODAL/SECTION PREVIEW
    // ============================================================================
    
    // Update a single modal preview
    function updateModalPreview(modalKey) {
        const section = options.find(s => s.modalKey === modalKey);
        if (!section) return;
        
        // Skip if manually edited (unless it's being reset)
        if (modalPreviewManuallyEdited[modalKey]) {
            return;
        }
        
        try {
            const resultsWithUnits = prepareResultsWithUnits();
            
            const processedMetrics = {};
            Object.entries(metrics).forEach(([key, value]) => {
                if (typeof value === 'string' && value.includes('{{')) {
                    try {
                        const template = Handlebars.compile(value);
                        const processed = template(resultsWithUnits);
                        processedMetrics[key] = new Handlebars.SafeString(processed);
                    } catch (e) {
                        processedMetrics[key] = value;
                    }
                } else {
                    processedMetrics[key] = value;
                }
            });
            
            const data = { ...resultsWithUnits, ...processedMetrics };
            
            if (modalTemplates[modalKey]) {
                const rendered = modalTemplates[modalKey](data);
                const $textarea = $(`#${modalKey}-preview`);
                
                if ($textarea.length) {
                    $textarea.val(rendered);
                    
                    if (typeof window.autoResizeTextarea === 'function') {
                        window.autoResizeTextarea($textarea);
                    }
                }
            }
        } catch (e) {
            console.error(`Error rendering section preview for ${modalKey}:`, e);
        }
    }
    
    // Update all section previews
    function updateAllSectionPreviews() {
        options.forEach(section => {
            if (section.modalKey) {
                updateModalPreview(section.modalKey);
            }
        });
    }
    
    // Build the options form - now delegated to form.js
    function buildOptionsForm() {
        // Compile section templates from window.modalTemplates
        if (window.modalTemplates) {
            Object.entries(window.modalTemplates).forEach(([key, templateString]) => {
                try {
                    modalTemplates[key] = Handlebars.compile(templateString);
                } catch (e) {
                    console.error(`Error compiling template for ${key}:`, e);
                }
            });
        }
        
        // Ensure options is globally accessible for form.js
        window.options = options;
        
        // IMPORTANT: Expose metrics globally FIRST
        window.metrics = metrics;
        window.selectedOptions = selectedOptions;
        
        // Populate metrics with default values BEFORE building the form
        options.forEach(section => {
            if (section.params) {
                Object.entries(section.params).forEach(([key, option]) => {
                    // Find default option (only if options is an array)
                    if (option.options && Array.isArray(option.options)) {
                        const defaultOption = option.options.find(opt => {
                            if (typeof opt === 'string') return false;
                            return opt.default === true;
                        });
                        
                        if (defaultOption) {
                            const title = typeof defaultOption === 'string' ? defaultOption : defaultOption.title;
                            // Only set default if value doesn't already exist
                            if (metrics[key] === undefined) {
                                metrics[key] = title || "";
                            }
                        }
                    }
                    // For customtext options, initialize with empty string
                    else if (option.options === "customtext") {
                        if (metrics[key] === undefined) {
                            metrics[key] = "";
                        }
                    }
                });
            }
        });
        
        // Call the new form builder if available
        if (typeof window.buildForm === "function") {
            window.buildForm();
        } else {
            console.error("form.js not loaded - buildForm function not available");
        }
    }
    
    // Populate section textareas with default content
    function populateModalTextareas() {
        options.forEach(section => {
            if (section.modalKey) {
                const modalKey = section.modalKey;
                
                if (!modalTemplates[modalKey]) {
                    console.warn(`No template found for section: ${modalKey}`);
                    return;
                }
                
                const resultsWithUnits = prepareResultsWithUnits();
                
                const processedMetrics = {};
                Object.entries(metrics).forEach(([key, value]) => {
                    if (typeof value === 'string' && value.includes('{{')) {
                        try {
                            const template = Handlebars.compile(value);
                            const processed = template(resultsWithUnits);
                            processedMetrics[key] = new Handlebars.SafeString(processed);
                        } catch (e) {
                            console.warn(`Failed to process metric ${key}:`, e);
                            processedMetrics[key] = value;
                        }
                    } else {
                        processedMetrics[key] = value;
                    }
                });
                
                const data = { ...resultsWithUnits, ...processedMetrics };
                
                try {
                    const rendered = modalTemplates[modalKey](data);
                    const $textarea = $(`#${modalKey}-textarea`);
                    
                    if ($textarea.length) {
                        $textarea.val(rendered);
                        metrics[modalKey] = rendered;
                        
                        if (typeof window.autoResizeTextarea === 'function') {
                            window.autoResizeTextarea($textarea);
                        }
                    }
                } catch (e) {
                    console.error(`Error rendering section ${modalKey}:`, e);
                }
            }
        });
        
        // Also populate the Summary textarea
        if (typeof updateSummary === 'function') {
            updateSummary();
        }
    }
    
    // [v5.4] Granular update - only updates changed parameter spans
    // NEVER falls back to full re-render to preserve manual edits
    function updateChangedParameters(changedParamKeys) {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) {
            console.warn('ContentEditable textarea not found');
            return;
        }
        
        // Build param -> modal mapping for precise targeting
        const paramToModal = {};
        if (window.options && Array.isArray(window.options)) {
            window.options.forEach(group => {
                if (!group.modalKey || !group.params) return;
                const modalKey = group.modalKey;
                const paramList = Array.isArray(group.params) ? group.params : Object.keys(group.params);
                paramList.forEach(paramKey => {
                    paramToModal[paramKey] = modalKey;
                });
            });
        }
        
        // Prepare data using shared utility
        const outputResults = prepareResultsWithUnits();
        
        // Track if cursor was in the textarea
        const selection = window.getSelection();
        const wasInTextarea = selection.rangeCount > 0 && 
                             $textarea[0].contains(selection.anchorNode);
        let savedRange = null;
        
        if (wasInTextarea) {
            savedRange = selection.getRangeAt(0).cloneRange();
        }
        
        // Update each changed parameter
        changedParamKeys.forEach(paramKey => {
            let newValue = metrics[paramKey];
            
            // For measurements, check results too
            if (newValue === undefined && results[paramKey] !== undefined) {
                newValue = results[paramKey];
                // Append unit if needed
                const config = parseConfigMap[paramKey];
                if (newValue && config?.unit && !newValue.toString().endsWith(config.unit)) {
                    newValue = newValue + config.unit;
                }
            }
            
            // Process through Handlebars if needed
            if (typeof newValue === 'string' && newValue.includes('{{')) {
                try {
                    const template = Handlebars.compile(newValue);
                    newValue = template(outputResults);
                } catch (e) {
                    console.warn(`Failed to process metric ${paramKey}:`, e);
                }
            }
            
            // Get the modal this parameter belongs to
            const modalKey = paramToModal[paramKey];
            
            // Check if parameter is excluded/hidden
            let isExcludedOrHidden = false;
            if (modalKey && (window.excludedModals || window.hiddenModals)) {
                if ((window.excludedModals && window.excludedModals[modalKey]) ||
                    (window.hiddenModals && window.hiddenModals[modalKey])) {
                    isExcludedOrHidden = true;
                }
            }
            
            // If excluded/hidden, set to empty
            if (isExcludedOrHidden) {
                newValue = '';
            }
            
            // Find spans using BOTH data-param AND data-modal for precise targeting
            let $spans;
            if (modalKey) {
                $spans = $textarea.find(`[data-param="${paramKey}"][data-modal="${modalKey}"]`);
            } else {
                $spans = $textarea.find(`[data-param="${paramKey}"]`);
            }
            
            if ($spans.length > 0) {
                $spans.each(function() {
                    $(this).text(newValue || '');
                });
            }
            // [v5.4] Don't fall back to full re-render - just log if span not found
            // This preserves manual edits at the cost of potentially missing some updates
            // for parameters wrapped in {{#if}} blocks that become empty
        });
        
        // Restore cursor position if it was in the textarea
        if (wasInTextarea && savedRange) {
            try {
                selection.removeAllRanges();
                selection.addRange(savedRange);
            } catch (e) {
                // Cursor restoration failed, that's ok
                console.log('Could not restore cursor position');
            }
        }
    }
    
    // Update ContentEditable report textarea with span-wrapped parameters
    // [v5.4] This is now only called for initial render and section show/hide
    function updateReportTextarea() {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) {
            console.warn('ContentEditable textarea not found');
            return;
        }
        
        // 1. Prepare data using shared utilities
        const data = prepareOutputData();
        
        // 2. Filter excluded/hidden sections
        const filteredData = filterExcludedModalData(data);
        
        // 3. Generate report using preprocessed template
        let rawReport = '';
        try {
            const template = getPreprocessedTemplate();
            rawReport = template(filteredData);
        } catch (e) {
            console.error('Error generating report:', e);
            return;
        }
        
        // 4. Post-process: field markers and button placement
        const processedReport = postProcessReport(rawReport, filteredData);
        
        // 5. Update ContentEditable preserving cursor position
        updateContentEditableHTML(processedReport);
        
        // 6. Update button positions
        if (typeof updateButtonPositions === 'function') {
            updateButtonPositions();
        }
    }
    
    // Post-process report: field markers and button placement
    function postProcessReport(reportHTML, data) {
        let processed = reportHTML;
        
        // Get excluded variables set (for field marker logic)
        const excludedVariables = data._excludedVariables || new Set();
        
        // ========================================================================
        // FIELD MARKERS: Process <!--@FieldName-->content<!--/@FieldName-->
        // ========================================================================
        const fieldMarkerRegex = /<!--@(\w+)-->([\s\S]*?)<!--\/@\1-->\n?/g;
        
        processed = processed.replace(fieldMarkerRegex, (match, fieldName, content) => {
            // Check if this field's variable is excluded/hidden
            if (excludedVariables.has(fieldName)) {
                return '';
            }
            
            // Field is included - wrap in field wrapper span
            const hadNewline = match.endsWith('\n');
            return `<span class="field-wrapper" data-field="${fieldName}">${content}</span>${hadNewline ? '\n' : ''}`;
        });
        
        // ========================================================================
        // BUTTON PLACEMENT: Replace <!--button:modalKey--> with button groups
        // ========================================================================
        window.options.forEach(modalGroup => {
            const modalKey = modalGroup.modalKey;
            if (!modalKey) return;
            
            // Check if section is excluded or hidden
            const isExcluded = excludedModals[modalKey] || (window.excludedModals && window.excludedModals[modalKey]);
            const isHidden = window.hiddenModals && window.hiddenModals[modalKey];
            const isTriggered = window.triggeredModals && window.triggeredModals[modalKey];
            
            // For hidden sections (but not triggered), just remove the marker
            if (isHidden && !isTriggered) {
                processed = processed.replace(new RegExp(`<!--button:${modalKey}-->`, 'g'), '');
                return;
            }
            
            // Create button HTML
            let buttonHTML = '';
            
            if (modalKey === 'Summary') {
                buttonHTML = `<button type="button" class="inline-edit-button" data-modal="${modalKey}" title="Edit Summary">✎</button>`;
            } else if (isTriggered) {
                buttonHTML = `<button type="button" class="inline-exclude-button reset-trigger-button" data-modal="${modalKey}" title="Close and reset to default">×</button>`;
            } else {
                const excludeText = isExcluded ? '+' : '−';
                const excludeTitle = isExcluded ? 'Include section in report' : 'Exclude section from report';
                const excludeClass = isExcluded ? 'inline-exclude-button excluded' : 'inline-exclude-button';
                
                if (isExcluded) {
                    buttonHTML = `<button type="button" class="${excludeClass}" data-modal="${modalKey}" title="${excludeTitle}">${excludeText}</button>`;
                } else {
                    buttonHTML = `<button type="button" class="inline-edit-button" data-modal="${modalKey}" title="Edit ${modalGroup.modalTitle}">✎</button><button type="button" class="${excludeClass}" data-modal="${modalKey}" title="${excludeTitle}">${excludeText}</button>`;
                }
            }
            
            // Create button group
            const trailingNewline = isExcluded ? '\n' : '';
            const buttonGroup = `<span class="inline-button-group" contenteditable="false" data-modal="${modalKey}">${buttonHTML}</span>${trailingNewline}`;
            
            // Replace marker with button group
            processed = processed.replace(new RegExp(`<!--button:${modalKey}-->`, 'g'), buttonGroup);
        });
        
        // Remove any remaining button markers not in options
        processed = processed.replace(/<!--button:[^>]+-->/g, '');
        
        // ========================================================================
        // WHITESPACE CLEANUP
        // ========================================================================
        
        // Remove param spans that are completely empty
        processed = processed.replace(/<span[^>]*data-param="[^"]*"[^>]*>\s*<\/span>/g, '');
        
        // Remove field wrapper spans that are completely empty
        processed = processed.replace(/<span[^>]*class="field-wrapper"[^>]*>\s*<\/span>/g, '');
        
        // Clean up lines that only contain whitespace
        processed = processed
            .split('\n')
            .map(line => {
                const textOnly = line.replace(/<[^>]+>/g, '').trim();
                return textOnly === '' ? '' : line;
            })
            .join('\n')
            .replace(/\n{3,}/g, '\n\n');
        
        return processed;
    }
    
    // Update ContentEditable HTML while preserving cursor position and manual edits
    function updateContentEditableHTML(newHTML) {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) return;
        
        // Set flag to prevent MutationObserver from triggering during intentional update
        isRestoringButtons = true;
        
        // [v5.2] Capture manual edits with their context before re-rendering
        const manualEdits = [];
        $textarea.find('.manual-edit').each(function(index) {
            const $edit = $(this);
            const editId = `manual-${Date.now()}-${index}`;
            const editText = $edit.text();
            
            // Find anchor context
            let anchorType = null;
            let anchorId = null;
            let hasLineBreakBefore = false;
            
            // Check for line break before this element
            const prevSibling = this.previousSibling;
            if (prevSibling) {
                if (prevSibling.nodeName === 'BR') {
                    hasLineBreakBefore = true;
                } else if (prevSibling.nodeType === Node.TEXT_NODE && /\n\s*$/.test(prevSibling.textContent)) {
                    hasLineBreakBefore = true;
                }
            }
            
            // Check what's immediately before this element
            const $prev = $edit.prev();
            if ($prev.length) {
                if ($prev.attr('data-param')) {
                    anchorType = 'afterParam';
                    anchorId = $prev.attr('data-param');
                } else if ($prev.hasClass('inline-button-group')) {
                    anchorType = 'afterButton';
                    anchorId = $prev.attr('data-modal');
                }
            }
            
            // If no prev, check what's immediately after
            if (!anchorType) {
                const $next = $edit.next();
                if ($next.length) {
                    if ($next.attr('data-param')) {
                        anchorType = 'beforeParam';
                        anchorId = $next.attr('data-param');
                    } else if ($next.hasClass('inline-button-group')) {
                        anchorType = 'beforeButton';
                        anchorId = $next.attr('data-modal');
                    }
                }
            }
            
            if (anchorId) {
                manualEdits.push({
                    id: editId,
                    text: editText,
                    anchorType: anchorType,
                    anchor: anchorId,
                    hasLineBreakBefore: hasLineBreakBefore
                });
                console.log(`[v5.2] Captured manual edit: "${editText.substring(0, 30)}..." anchor=${anchorId} type=${anchorType} lineBreak=${hasLineBreakBefore}`);
            }
        });
        
        // Update HTML
        $textarea.html(newHTML);
        
        // Restore manual edit spans with line break context
        let restoredCount = 0;
        
        manualEdits.forEach(edit => {
            if (!edit.anchor) {
                console.warn(`[v5.2] Skipping restoration of "${edit.text.substring(0, 20)}..." - no anchor`);
                return;
            }
            
            let $anchorElement = null;
            let restored = false;
            
            // Find anchor element
            if (edit.anchorType === 'afterParam' || edit.anchorType === 'beforeParam') {
                $anchorElement = $textarea.find(`[data-param="${edit.anchor}"]`).first();
            } else if (edit.anchorType === 'afterButton' || edit.anchorType === 'beforeButton') {
                $anchorElement = $textarea.find(`.inline-button-group[data-modal="${edit.anchor}"]`).first();
            }
            
            if ($anchorElement && $anchorElement.length) {
                const $newSpan = $('<span class="manual-edit"></span>')
                    .attr('data-manual-id', edit.id)
                    .text(edit.text);
                
                if (edit.anchorType === 'afterParam' || edit.anchorType === 'afterButton') {
                    if (edit.hasLineBreakBefore) {
                        $anchorElement.after($newSpan);
                        $anchorElement.after('<br>');
                    } else {
                        $anchorElement.after($newSpan);
                    }
                    restored = true;
                } else if (edit.anchorType === 'beforeParam' || edit.anchorType === 'beforeButton') {
                    if (edit.hasLineBreakBefore) {
                        $anchorElement.before('<br>');
                        $anchorElement.before($newSpan);
                    } else {
                        $anchorElement.before($newSpan);
                    }
                    restored = true;
                }
            }
            
            if (restored) {
                restoredCount++;
            } else {
                console.warn(`[v5.2] Could not restore manual edit: "${edit.text.substring(0, 20)}..." - anchor ${edit.anchor} not found`);
            }
        });
        
        if (manualEdits.length > 0) {
            console.log(`[v5.2] Restored ${restoredCount}/${manualEdits.length} manual edit(s)`);
        }
        
        // Reset flag after a short delay
        setTimeout(() => {
            isRestoringButtons = false;
        }, 10);
    }
    
    // Setup button event handlers
    function updateButtonPositions() {
        setupInlineButtonHandlers();
    }
    
    // Setup click handlers for inline buttons
    function setupInlineButtonHandlers() {
        const $reportTextarea = $('#report-textarea');
        
        // Edit button - open modal
        $reportTextarea.off('click', '.inline-edit-button').on('click', '.inline-edit-button', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const modalKey = $(this).data('modal');
            const modalId = `${modalKey}-modal`;
            const $modal = $(`#${modalId}`);
            
            // Initialize modal state tracking
            if (!window.modalChangedInSession) window.modalChangedInSession = {};
            if (!window.modalInitialState) window.modalInitialState = {};
            if (!window.modalDropdownState) window.modalDropdownState = {};
            
            window.modalChangedInSession[modalKey] = false;
            window.modalInitialState[modalKey] = {};
            window.modalDropdownState[modalKey] = {};
            
            // Find all params in this modal and capture their dropdown states
            $modal.find('select[data-param]').each(function() {
                const paramKey = $(this).data('param');
                window.modalDropdownState[modalKey][paramKey] = $(this).val() || '';
                window.modalInitialState[modalKey][paramKey] = window.metrics?.[paramKey] || '';
                
                // If this param was manually edited, show the custom textarea
                if (window.manuallyEditedParams && window.manuallyEditedParams[paramKey]) {
                    const $customRow = $modal.find(`#${paramKey}-custom-row`);
                    const $customTextarea = $modal.find(`#${paramKey}-custom-textarea`);
                    const $select = $(this);
                    
                    if ($customRow.length && $customTextarea.length) {
                        $customRow.show();
                        $customTextarea.val(window.metrics?.[paramKey] || '');
                        $select.css({
                            'opacity': '0.5',
                            'background-color': '#f0f0f0'
                        });
                        console.log(`[v5.2] Showing custom textarea for manually edited param: ${paramKey}`);
                    }
                }
            });
            
            // Open the modal
            $modal.addClass('active');
            
            // Auto-scroll measurements table (skip for Summary)
            if (modalKey !== 'Summary' && typeof window.scrollToMeasurementModal === 'function') {
                window.scrollToMeasurementModal(modalKey);
            }
        });
        
        // Exclude button - use unified toggle function or reset triggered section
        $reportTextarea.off('click', '.inline-exclude-button').on('click', '.inline-exclude-button', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const modalKey = $(this).data('modal');
            
            // Check if this is a reset-trigger-button (for triggered sections)
            if ($(this).hasClass('reset-trigger-button')) {
                if (typeof window.resetTriggeredModal === 'function') {
                    window.resetTriggeredModal(modalKey);
                }
            } else {
                toggleModalExclusion(modalKey);
            }
        });
        
        // Protect buttons using MutationObserver
        setupButtonProtection($reportTextarea[0]);
    }
    
    // MutationObserver to protect buttons from deletion
    function setupButtonProtection(textarea) {
        if (buttonProtectionObserver) {
            buttonProtectionObserver.disconnect();
        }
        
        // Count expected buttons based on options config
        expectedButtonCount = 0;
        if (window.options && Array.isArray(window.options)) {
            window.options.forEach(section => {
                if (section.modalKey) {
                    const isHidden = window.hiddenModals && window.hiddenModals[section.modalKey];
                    if (!isHidden) {
                        expectedButtonCount++;
                    }
                }
            });
        }
        
        // Create observer
        buttonProtectionObserver = new MutationObserver((mutations) => {
            if (isRestoringButtons) return;
            
            const currentButtonCount = textarea.querySelectorAll('.inline-button-group').length;
            
            if (currentButtonCount < expectedButtonCount) {
                console.log(`[ButtonProtection] Buttons removed (${currentButtonCount}/${expectedButtonCount}), restoring...`);
                isRestoringButtons = true;
                
                const savedCursor = saveCursorPosition(textarea);
                
                setTimeout(() => {
                    if (typeof updateReportTextarea === 'function') {
                        updateReportTextarea();
                    }
                    
                    setTimeout(() => {
                        restoreCursorPosition(textarea, savedCursor);
                        isRestoringButtons = false;
                    }, 0);
                }, 0);
            }
        });
        
        // Start observing
        buttonProtectionObserver.observe(textarea, {
            childList: true,
            subtree: true
        });
        
        // Prevent cursor from entering buttons via selection change
        setupCursorProtection(textarea);
    }
    
    // Save cursor position relative to text content
    function saveCursorPosition(textarea) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;
        
        const range = selection.getRangeAt(0);
        if (!textarea.contains(range.startContainer)) return null;
        
        // Calculate text offset by walking the DOM
        let textOffset = 0;
        let foundCursor = false;
        
        function walkNodes(node) {
            if (foundCursor) return;
            
            if (node === range.startContainer) {
                textOffset += range.startOffset;
                foundCursor = true;
                return;
            }
            
            if (node.nodeType === Node.TEXT_NODE) {
                textOffset += node.textContent.length;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Skip button groups
                if (node.classList && node.classList.contains('inline-button-group')) {
                    return;
                }
                for (const child of node.childNodes) {
                    walkNodes(child);
                    if (foundCursor) return;
                }
            }
        }
        
        walkNodes(textarea);
        
        return foundCursor ? textOffset : null;
    }
    
    // Restore cursor position from text offset
    function restoreCursorPosition(textarea, textOffset) {
        if (textOffset === null) return;
        
        const selection = window.getSelection();
        const range = document.createRange();
        
        let currentOffset = 0;
        let targetNode = null;
        let targetOffset = 0;
        
        function walkNodes(node) {
            if (targetNode) return;
            
            if (node.nodeType === Node.TEXT_NODE) {
                const nodeLength = node.textContent.length;
                if (currentOffset + nodeLength >= textOffset) {
                    targetNode = node;
                    targetOffset = textOffset - currentOffset;
                    return;
                }
                currentOffset += nodeLength;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList && node.classList.contains('inline-button-group')) {
                    return;
                }
                for (const child of node.childNodes) {
                    walkNodes(child);
                    if (targetNode) return;
                }
            }
        }
        
        walkNodes(textarea);
        
        if (targetNode) {
            try {
                range.setStart(targetNode, targetOffset);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (e) {
                console.log('[CursorRestore] Could not restore cursor:', e);
            }
        }
    }
    
    // Prevent cursor from entering button elements
    function setupCursorProtection(textarea) {
        document.addEventListener('selectionchange', function() {
            if (isRestoringButtons || isFixingCursor) return;
            
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            
            const buttonGroup = node.nodeType === Node.ELEMENT_NODE 
                ? node.closest('.inline-button-group')
                : node.parentElement?.closest('.inline-button-group');
            
            if (buttonGroup && textarea.contains(buttonGroup)) {
                isFixingCursor = true;
                
                const newRange = document.createRange();
                let nextNode = buttonGroup.nextSibling;
                
                if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
                    newRange.setStart(nextNode, 0);
                } else if (nextNode && nextNode.nodeType === Node.ELEMENT_NODE) {
                    newRange.setStartBefore(nextNode);
                } else {
                    newRange.setStartAfter(buttonGroup);
                }
                
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
                
                setTimeout(() => {
                    isFixingCursor = false;
                }, 10);
            }
        });
    }
    
    // Update expected button count when sections change
    function updateExpectedButtonCount() {
        expectedButtonCount = 0;
        if (window.options && Array.isArray(window.options)) {
            window.options.forEach(section => {
                if (section.modalKey) {
                    const isHidden = window.hiddenModals && window.hiddenModals[section.modalKey];
                    if (!isHidden) {
                        expectedButtonCount++;
                    }
                }
            });
        }
    }
    
    function scrollToMeasurementModal(modalKey) {
        if (!modalKey) return;
        
        const $targetSection = $(`#measurements-table tr[data-section~="${modalKey}"]`).first();
        
        if ($targetSection.length) {
            const $measurementsPanel = $('#measurements-panel');
            if ($measurementsPanel.length) {
                const targetOffset = $targetSection.offset().top;
                const panelOffset = $measurementsPanel.offset().top;
                const currentScroll = $measurementsPanel.scrollTop();
                
                const scrollPosition = currentScroll + (targetOffset - panelOffset) - 60;
                
                $measurementsPanel.animate({
                    scrollTop: scrollPosition
                }, 300);
            }
        }
    }

    // ============================================================================
    // SUMMARY GENERATION
    // ============================================================================
    
    function updateSummary() {
        // Build summary from selected options with summarytext
        let summaryParts = [];
        
        // Skip if manually edited
        if (summaryManuallyEdited) {
            return;
        }
        
        // Process Summary section parameters
        const summarySection = options.find(s => s.modalKey === 'Summary');
        if (!summarySection || !summarySection.params) {
            metrics.Summary = '';
            return;
        }
        
        // Get parameter list
        const paramList = Array.isArray(summarySection.params) 
            ? summarySection.params 
            : Object.keys(summarySection.params);
        
        paramList.forEach(paramKey => {
            // Get param config
            const paramConfig = window.parameters ? window.parameters[paramKey] : null;
            if (!paramConfig) return;
            
            // Check if checkbox is checked (use virtual state)
            let isChecked = false;
            if (window.summaryCheckboxStates && window.summaryCheckboxStates[paramKey] !== undefined) {
                isChecked = window.summaryCheckboxStates[paramKey];
            }
            
            if (!isChecked) return;
            
            // Check if this parameter's section is excluded
            let isExcluded = false;
            if (window.options && Array.isArray(window.options)) {
                const section = window.options.find(s => {
                    if (!s.params) return false;
                    const sectionParams = Array.isArray(s.params) ? s.params : Object.keys(s.params);
                    return sectionParams.includes(paramKey);
                });
                if (section && window.excludedModals && window.excludedModals[section.modalKey]) {
                    isExcluded = true;
                }
            }
            
            if (isExcluded) return;
            
            // Get summary text
            const selectedOption = selectedOptions[paramKey];
            let summaryText = '';
            
            if (selectedOption) {
                if (selectedOption.summarytext) {
                    summaryText = selectedOption.summarytext;
                } else if (selectedOption.title) {
                    summaryText = selectedOption.title;
                }
            } else {
                // Try to get from metrics for custom text
                summaryText = metrics[paramKey] || '';
            }
            
            // Process Handlebars in summary text
            if (summaryText && summaryText.includes('{{')) {
                try {
                    const template = Handlebars.compile(summaryText);
                    const data = { ...prepareResultsWithUnits(), ...metrics };
                    summaryText = template(data);
                } catch (e) {
                    console.warn(`Error processing summary text for ${paramKey}:`, e);
                }
            }
            
            if (summaryText && summaryText.trim()) {
                summaryParts.push(summaryText);
            }
        });
        
        // Build final summary
        let summary = summaryParts.join('\n');
        
        // Update metrics
        metrics.Summary = summary;
        
        // Update Summary textarea in modal
        const $summaryTextarea = $('#Summary-textarea');
        if ($summaryTextarea.length) {
            $summaryTextarea.val(summary);
            
            if (typeof autoResizeTextarea === 'function') {
                autoResizeTextarea($summaryTextarea);
            }
        }
    }

    // ============================================================================
    // CONFIG LOADING
    // ============================================================================
    
    let reportConfigLoaded = false;
    
    function loadReportConfig(configId) {
        const config = reportConfigs.find(c => c.id === configId);
        if (!config) {
            console.error(`Report config '${configId}' not found`);
            return;
        }
        
        console.log(`Loading report config: ${config.name}`);
        
        // Load all config files in sequence
        Promise.all([
            loadScript(config.manual),
            loadScript(config.measurements),
            loadScript(config.parameters),
            loadScript(config.options),
            loadScript(config.report)
        ]).then(() => {
            // Store references to loaded configs
            if (window.manualConfig) {
                parseConfig = [...parseConfig, ...window.manualConfig];
            }
            
            if (window.parseConfig) {
                parseConfig = [...parseConfig, ...window.parseConfig];
            }
            
            // Build parse config map
            parseConfigMap = {};
            parseConfig.forEach(item => {
                parseConfigMap[item.handle] = item;
            });
            
            if (window.measurements) {
                measurements = window.measurements;
            }
            
            if (window.parameters) {
                parameters = window.parameters;
                window.parameters = parameters;
            }
            
            if (window.options) {
                options = window.options;
            }
            
            // Initialize variable registry after configs are loaded
            initializeVariableRegistry();
            
            // Initialize section visibility
            initializeModalVisibility();
            
            // Build measurements table
            buildMeasurementsTable();
            
            // Build options form
            buildOptionsForm();
            
            // Update summary
            updateSummary();
            
        }).catch(err => {
            console.error('Error loading report config:', err);
        });
    }
    
    function loadScript(filename) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = filename;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Populate input config dropdown
    function populateInputConfigDropdown() {
        const $select = $('#parse-config-select');
        $select.empty();
        
        inputConfigs.forEach(config => {
            const $option = $(`<option value="${config.id}">${config.name}</option>`);
            if (config.default) {
                $option.attr('selected', true);
            }
            $select.append($option);
        });
    }
    
    // Populate report config dropdown
    function populateReportConfigDropdown() {
        const $select = $('#report-config-select');
        $select.empty();
        
        reportConfigs.forEach(config => {
            const $option = $(`<option value="${config.id}">${config.name}</option>`);
            if (config.default) {
                $option.attr('selected', true);
            }
            $select.append($option);
        });
        
        $select.on('change', function() {
            loadReportConfig($(this).val());
        });
    }

    // ============================================================================
    // IMPORT MODAL HANDLERS
    // ============================================================================
    
    $('#open-import-modal').on('click', function() {
        $('#import-modal').addClass('active');
    });
    
    $('#close-import-modal').on('click', function() {
        $('#import-modal').removeClass('active');
    });
    
    $('#submit').on('click', function() {
        const inputText = $('#report').val();
        if (inputText.trim()) {
            parseInputText(inputText);
            $('#import-modal').removeClass('active');
        }
    });
    
    $('#clear-import').on('click', function() {
        $('#report').val('');
    });
    
    $('#load-example-data').on('click', function() {
        if (window.parseExample) {
            $('#report').val(window.parseExample);
        }
    });
    
    // Reset selections button
    $('#reset-selections').on('click', function() {
        // Reset all modals to default states
        if (window.options && Array.isArray(window.options)) {
            window.options.forEach(section => {
                if (!section.params) return;
                
                const paramList = Array.isArray(section.params) ? section.params : Object.keys(section.params);
                
                paramList.forEach(paramKey => {
                    const paramOption = window.parameters ? window.parameters[paramKey] : null;
                    if (!paramOption || !paramOption.options || !Array.isArray(paramOption.options)) return;
                    
                    const defaultOption = paramOption.options.find(opt => 
                        typeof opt !== 'string' && opt.default === true
                    );
                    
                    if (defaultOption) {
                        // Update dropdown
                        const $select = $(`#${paramKey}-select`);
                        if ($select.length) {
                            $select.val(defaultOption.title);
                        }
                        
                        // Update metrics
                        if (window.metrics) {
                            window.metrics[paramKey] = defaultOption.title;
                        }
                        
                        // Update selectedOptions
                        if (window.selectedOptions) {
                            window.selectedOptions[paramKey] = defaultOption;
                        }
                        
                        // Reset checkbox state
                        if (paramOption.enableSummary && window.summaryCheckboxStates) {
                            window.summaryCheckboxStates[paramKey] = paramOption.summaryDefault === true;
                            const $checkbox = $(`#${paramKey}-summary-modal`);
                            if ($checkbox.length) {
                                $checkbox.prop('checked', paramOption.summaryDefault === true);
                            }
                        }
                    }
                });
            });
        }
        
        // Reset manual edit tracking
        window.manuallyEditedParams = {};
        window.summaryCheckboxManuallyEdited = {};
        summaryManuallyEdited = false;
        
        // Update summary and report
        if (typeof updateSummary === 'function') {
            updateSummary();
        }
        if (typeof updateReportTextarea === 'function') {
            updateReportTextarea();
        }
    });

    // ============================================================================
    // GLOBAL EXPORTS
    // ============================================================================
    
    window.autoResizeTextarea = autoResizeTextarea;
    window.populateModalTextareas = populateModalTextareas;
    window.updateModalPreview = updateModalPreview;
    window.updateReportTextarea = updateReportTextarea;
    window.updateChangedParameters = updateChangedParameters;
    window.updateButtonPositions = updateButtonPositions;
    window.updateSummary = updateSummary;
    window.scrollToMeasurementModal = scrollToMeasurementModal;
    window.metrics = metrics;
    window.selectedOptions = selectedOptions;
    window.modalPreviewManuallyEdited = modalPreviewManuallyEdited;
    window.summaryCheckboxManuallyEdited = summaryCheckboxManuallyEdited;
    window.summaryManuallyEdited = summaryManuallyEdited;
    window.excludedModals = excludedModals;
    window.hiddenModals = hiddenModals;
    window.triggeredModals = triggeredModals;
    window.parameters = parameters;
    window.options = options;
    
    // Expose shared utilities for form.js
    window.extractModalVariables = extractModalVariables;
    window.prepareOutputData = prepareOutputData;
    window.filterExcludedModalData = filterExcludedModalData;
    window.initializeModalVisibility = initializeModalVisibility;
    window.triggerModal = triggerModal;
    window.resetTriggeredModal = resetTriggeredModal;
    
    // Variable Registry exports
    window.variableRegistry = variableRegistry;
    window.initializeVariableRegistry = initializeVariableRegistry;
    window.updateRegistryValue = updateRegistryValue;
    window.updateRegistryMeasurement = updateRegistryMeasurement;
    window.getRegistryEntry = getRegistryEntry;
    window.getRegistryValues = getRegistryValues;
    
    // Initialize - load default report config
    window.initializeReportForm = function() {
        const defaultReportConfig = reportConfigs.find(c => c.default);
        if (defaultReportConfig) {
            loadReportConfig(defaultReportConfig.id);
            reportConfigLoaded = true;
        } else {
            buildOptionsForm();
            updateSummary();
        }
    };
    
    // Initialize dropdowns
    populateInputConfigDropdown();
    populateReportConfigDropdown();
    
    // ============================================================================
    // CLIPBOARD - SIMPLIFIED
    // Simply copies visible text from ContentEditable
    // ============================================================================
    
    $("#copy-report").on("click", function () {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) {
            alert('Report textarea not found');
            return;
        }
        
        // Clone the content to manipulate without affecting the display
        const $clone = $textarea.clone();
        
        // Remove button groups from the clone
        $clone.find('.inline-button-group').remove();
        
        // Get the visible text content
        const textContent = $clone[0].innerText;
        
        // Clean up excessive whitespace
        const cleanedText = textContent
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        
        // Copy to clipboard
        navigator.clipboard.writeText(cleanedText).then(() => {
            const originalText = $(this).html();
            $(this).html("Copied!");
            setTimeout(() => $(this).html(originalText), 2000);
        }).catch(err => {
            console.error('Failed to copy to clipboard:', err);
            alert('Failed to copy to clipboard. Please try again.');
        });
    });
});
