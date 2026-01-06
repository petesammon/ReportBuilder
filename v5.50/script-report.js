/* jshint loopfunc: true, esversion: 11 */
/* EchoTools v5.5 - Registry as single source of truth, on-demand modals */

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
    let parameters = {}; // [v5.0] Parameter definitions loaded from params file
    let options = []; // Will be loaded dynamically - modal groupings
    
    // [v5.1] Button protection state
    let buttonProtectionObserver = null;
    let expectedButtonCount = 0;
    let isRestoringButtons = false;
    let isFixingCursor = false;
    
    // [v5.42] Counter for unique fixed text IDs
    let fixedTextIdCounter = 0;
    let manualEditIdCounter = 0;

    // ============================================================================
    // VARIABLE REGISTRY (v5.42)
    // Central data store for all parameters, measurements, fixed text, and manual edits
    // modalKey is NO LONGER stored in registry - use window.options for modal membership
    // ============================================================================
    
    /**
     * Variable Registry - single source of truth for all variable values
     * 
     * [v5.5] Registry consolidates results and metrics objects
     * - Measurements: store RAW value (no unit), unit stored separately
     * - Parameters: store value directly
     * - All reads/writes go through registry getter/setter functions
     * 
     * [v5.43] summaryChecked added to parameter entries
     * This is the single source of truth for summary checkbox state
     * 
     * Structure:
     * {
     *   'pLVSize': { 
     *     value: 'Normal LV size',
     *     type: 'param',
     *     state: 'default' | 'selected' | 'manual',
     *     summaryChecked: true | false
     *   },
     *   'LVEF': {
     *     value: '55',              // [v5.5] RAW value without unit
     *     type: 'measurement',
     *     state: 'imported' | 'manual',
     *     unit: '%'                 // Unit stored separately
     *   },
     *   'fixed-pQuality-prefix': {
     *     value: 'Technical Quality: ',
     *     type: 'fixed',
     *     state: 'default' | 'manual'
     *   },
     *   'manual-1735689234567-0': {
     *     value: 'User typed this',
     *     type: 'manual',
     *     state: 'manual'
     *   }
     * }
     */
    const variableRegistry = {};
    
    /**
     * [v5.42] Helper to get modalKey(s) for a parameter from options config
     * Used for exclusion checking - NOT stored in registry
     * @param {string} paramKey - Parameter name
     * @returns {string[]} - Array of modalKeys this param belongs to
     */
    function getModalKeysForParam(paramKey) {
        const modalKeys = [];
        if (window.options && Array.isArray(window.options)) {
            window.options.forEach(group => {
                if (!group.modalKey || !group.variables) return;
                if (group.variables.includes(paramKey)) {
                    modalKeys.push(group.modalKey);
                }
            });
        }
        return modalKeys;
    }
    
    /**
     * [v5.42] Check if a parameter is excluded/hidden based on its modal membership
     * A param is excluded if ALL its modals are excluded/hidden
     * @param {string} paramKey - Parameter name
     * @returns {boolean} - True if param should be hidden
     */
    function isParamExcluded(paramKey) {
        const modalKeys = getModalKeysForParam(paramKey);
        if (modalKeys.length === 0) return false;
        
        // Param is excluded only if ALL its modals are excluded/hidden
        return modalKeys.every(modalKey => {
            const isExcluded = window.excludedModals && window.excludedModals[modalKey];
            const isHidden = window.hiddenModals && window.hiddenModals[modalKey];
            return isExcluded || isHidden;
        });
    }
    
    /**
     * Initialize variable registry from config files
     * [v5.42] modalKey is NO LONGER stored - use getModalKeysForParam() when needed
     * Called once after all configs are loaded
     */
    function initializeVariableRegistry() {
        // Clear existing registry
        Object.keys(variableRegistry).forEach(key => delete variableRegistry[key]);
        
        // Clear preprocessed template so it gets rebuilt with new registry
        clearPreprocessedTemplate();
        
        // Reset ID counters
        fixedTextIdCounter = 0;
        manualEditIdCounter = 0;
        
        // 1. Register all measurements FIRST (from measurements config - opt-m-table.js)
        // [v5.42] No modalKey stored
        if (measurements && Array.isArray(measurements)) {
            measurements.forEach(group => {
                if (!group.items) return;
                
                group.items.forEach(measurementKey => {
                    // Get unit from parseConfigMap, fallback to manualConfig
                    let config = parseConfigMap[measurementKey];
                    if (!config && window.manualConfig) {
                        config = window.manualConfig.find(m => m.handle === measurementKey);
                    }
                    const unit = config?.unit || '';
                    
                    variableRegistry[measurementKey] = {
                        value: '',
                        type: 'measurement',
                        state: 'imported',
                        unit: unit
                    };
                });
            });
        }
        
        // 2. Register all parameters (from options/modal config)
        // [v5.42] Use variables array, check window.parameters to identify params
        // [v5.43] Initialize summaryChecked from parameter config
        if (window.options && Array.isArray(window.options)) {
            window.options.forEach(group => {
                if (!group.modalKey || !group.variables) return;
                
                group.variables.forEach(varKey => {
                    // Only register as param if it's in window.parameters
                    // and NOT already registered as a measurement
                    if (window.parameters && window.parameters[varKey] && !variableRegistry[varKey]) {
                        const paramConfig = window.parameters[varKey];
                        variableRegistry[varKey] = {
                            value: '',
                            type: 'param',
                            state: 'default',
                            // [v5.43] Initialize summaryChecked from config
                            summaryChecked: paramConfig.enableSummary ? (paramConfig.summaryDefault === true) : undefined
                        };
                    }
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
                // [v5.43] Ensure summaryChecked is initialized for all params with enableSummary
                if (param.enableSummary && variableRegistry[paramKey] && variableRegistry[paramKey].summaryChecked === undefined) {
                    variableRegistry[paramKey].summaryChecked = param.summaryDefault === true;
                }
            });
        }
        
        // 4. Register Summary (special case)
        variableRegistry['Summary'] = {
            value: '',
            type: 'param',
            state: 'default'
        };
        
        // 5. [v5.42] Fixed text entries will be registered during template preprocessing
        // They are created dynamically based on field markers in the template
        
        console.log('[VariableRegistry] Initialized with', Object.keys(variableRegistry).length, 'variables');
        
        // Expose globally
        window.variableRegistry = variableRegistry;
    }
    
    /**
     * Update a value in the registry
     * @param {string} key - Variable name
     * @param {string} value - New value (for measurements, should include unit)
     * @param {string} state - Optional state override ('default', 'selected', 'manual', 'imported')
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
                type: 'unknown',
                state: state || 'manual'
            };
        }
    }
    
    /**
     * [v5.42] Register a manual edit in the registry
     * @param {string} id - Unique ID for this manual edit
     * @param {string} value - Text content
     * @returns {string} - The ID used (may be generated if not provided)
     */
    function registerManualEdit(id, value) {
        const editId = id || `manual-${Date.now()}-${manualEditIdCounter++}`;
        variableRegistry[editId] = {
            value: value,
            type: 'manual',
            state: 'manual'
        };
        return editId;
    }
    
    /**
     * [v5.42] Register fixed text in the registry
     * @param {string} fieldName - Field marker name (e.g., 'pQuality')
     * @param {string} value - Fixed text content
     * @returns {string} - The registry key used
     */
    function registerFixedText(fieldName, value) {
        const fixedId = `fixed-${fieldName}-${fixedTextIdCounter++}`;
        variableRegistry[fixedId] = {
            value: value,
            type: 'fixed',
            state: 'default',
            fieldName: fieldName  // Track which field this belongs to
        };
        return fixedId;
    }
    
    /**
     * Update measurement value with unit handling
     * @param {string} key - Measurement variable name
     * @param {string} rawValue - Value without unit
     * @param {string} state - 'imported' or 'manual'
     */
    function updateRegistryMeasurement(key, rawValue, state) {
        if (!variableRegistry[key]) {
            // Try to get unit from parseConfigMap, fallback to manualConfig
            let config = parseConfigMap[key];
            if (!config && window.manualConfig) {
                config = window.manualConfig.find(m => m.handle === key);
            }
            variableRegistry[key] = {
                value: '',
                type: 'measurement',
                state: state || 'imported',
                unit: config?.unit || ''
            };
        }
        
        const entry = variableRegistry[key];
        
        // [v5.5] Store RAW value (without unit)
        entry.value = rawValue || '';
        
        if (state) {
            entry.state = state;
        }
        
        // [v5.5] Sync to legacy results object for backwards compatibility
        results[key] = rawValue || '';
        
        // [v5.43] Sync modal measurement input if it exists
        const $modalInput = $(`#${key}-modal-input`);
        if ($modalInput.length) {
            $modalInput.val(rawValue || '');
        }
    }
    
    /**
     * [v5.5] Get measurement raw value (without unit)
     * @param {string} key - Measurement key
     * @returns {string} - Raw value or empty string
     */
    function getMeasurementValue(key) {
        const entry = variableRegistry[key];
        return entry ? entry.value : '';
    }
    
    /**
     * [v5.5] Get measurement value with unit appended
     * @param {string} key - Measurement key
     * @returns {string} - Value with unit or empty string
     */
    function getMeasurementWithUnit(key) {
        const entry = variableRegistry[key];
        if (!entry || !entry.value) return '';
        return entry.unit ? entry.value + entry.unit : entry.value;
    }
    
    /**
     * [v5.5] Get parameter value
     * @param {string} key - Parameter key
     * @returns {string} - Parameter value or empty string
     */
    function getParamValue(key) {
        const entry = variableRegistry[key];
        return entry ? entry.value : '';
    }
    
    /**
     * [v5.5] Set parameter value
     * @param {string} key - Parameter key
     * @param {string} value - New value
     * @param {string} state - Optional state ('default', 'selected', 'manual')
     */
    function setParamValue(key, value, state) {
        if (!variableRegistry[key]) {
            variableRegistry[key] = {
                value: '',
                type: 'param',
                state: 'default'
            };
        }
        variableRegistry[key].value = value || '';
        if (state) {
            variableRegistry[key].state = state;
        }
        
        // [v5.5] Sync to legacy metrics object for backwards compatibility
        metrics[key] = value || '';
    }
    
    /**
     * Get value and metadata for a variable
     * @param {string} key - Variable name
     * @returns {object|null} - Registry entry or null
     */
    function getRegistryEntry(key) {
        return variableRegistry[key] || null;
    }
    
    /**
     * [v5.43] Get summary checkbox state from registry
     * @param {string} paramKey - Parameter name
     * @returns {boolean} - Whether summary checkbox is checked
     */
    function getRegistrySummaryChecked(paramKey) {
        const entry = variableRegistry[paramKey];
        if (entry && entry.summaryChecked !== undefined) {
            return entry.summaryChecked;
        }
        return false;
    }
    
    /**
     * [v5.43] Set summary checkbox state in registry
     * @param {string} paramKey - Parameter name
     * @param {boolean} isChecked - Whether checkbox is checked
     */
    function setRegistrySummaryChecked(paramKey, isChecked) {
        if (variableRegistry[paramKey]) {
            variableRegistry[paramKey].summaryChecked = isChecked;
        }
    }
    
    /**
     * Get all values from registry as a flat object (for Handlebars)
     * @returns {object} - { key: value, ... }
     */
    function getRegistryValues() {
        const values = {};
        Object.keys(variableRegistry).forEach(key => {
            values[key] = variableRegistry[key].value;
        });
        return values;
    }
    
    /**
     * [v5.42] Preprocess template to wrap {{variables}} in spans
     * Called before Handlebars compilation
     * 
     * This ensures spans are created with correct identity at point of creation,
     * rather than reverse-engineering after the fact.
     * 
     * [v5.42] data-modal attribute REMOVED - spans identified by data-param only
     * This allows same parameter to be controlled by multiple modals
     * 
     * @param {string} templateHTML - Raw Handlebars template
     * @returns {string} - Template with variables wrapped in spans
     */
    function preprocessTemplate(templateHTML) {
        // Match {{variableName}} or {{~variableName}} or {{variableName~}} but NOT:
        // - {{#helper}} or {{/helper}} - block helpers
        // - {{> partial}} - partials
        // - {{! comment }} - comments
        // - {{else}} - else clause
        // 
        // Pattern captures optional ~ for whitespace control
        const variableRegex = /\{\{(~?)([a-zA-Z_][a-zA-Z0-9_]*)(~?)\}\}/g;
        
        return templateHTML.replace(variableRegex, (match, leadingTilde, varName, trailingTilde) => {
            // Skip Handlebars keywords and block helpers
            if (varName === 'else' || varName === 'this' || varName === 'if' || varName === 'unless' || varName === 'each' || varName === 'with') {
                return match;
            }
            
            const entry = variableRegistry[varName];
            
            if (entry) {
                // [v5.42] Wrap in span with data-param and state class ONLY
                // No data-modal attribute - modal membership looked up when needed
                const stateClass = entry.state ? ` param-${entry.state}` : '';
                const typeClass = entry.type ? ` param-type-${entry.type}` : '';
                return `<span data-param="${varName}" class="param-span${stateClass}${typeClass}">{{${leadingTilde}${varName}${trailingTilde}}}</span>`;
            }
            
            // Not in registry - leave as-is for Handlebars to handle
            // This covers things like helper arguments, etc.
            return match;
        });
    }
    
    /**
     * Store for preprocessed and compiled template
     * Recompiled when registry changes
     */
    let preprocessedOutputTemplate = null;
    
    /**
     * Get or create the preprocessed output template
     * @returns {function} - Compiled Handlebars template with spans pre-wrapped
     */
    function getPreprocessedTemplate() {
        if (!preprocessedOutputTemplate && window.outputTemplateString) {
            const preprocessed = preprocessTemplate(window.outputTemplateString);
            preprocessedOutputTemplate = Handlebars.compile(preprocessed, { noEscape: true });
            console.log('[Template] Preprocessed and compiled output template');
        }
        return preprocessedOutputTemplate || window.outputTemplate;
    }
    
    /**
     * Clear preprocessed template (call when registry changes)
     */
    function clearPreprocessedTemplate() {
        preprocessedOutputTemplate = null;
    }

    // ============================================================================
    // SHARED UTILITIES (v5.1 REFACTORED)
    // ============================================================================
    
    /**
     * Extract all variables belonging to a section from config
     * [v5.1] Now uses config lookup (options + measurements) instead of template parsing
     * @param {string} modalKey - The modal identifier (e.g., 'modalLV')
     * @returns {string[]} - Array of unique variable names in the section
     */
    function extractModalVariables(modalKey) {
        const variables = [];
        
        // [v5.42] Get variables from options config (unified variables array)
        if (options && Array.isArray(options)) {
            options.forEach(section => {
                if (section.modalKey === modalKey && section.variables) {
                    variables.push(...section.variables);
                }
            });
        }
        
        // 2. Get measurements from measurements config (opt-m-table.js)
        if (measurements && Array.isArray(measurements)) {
            measurements.forEach(section => {
                // modalKey can be string or array
                const modalKeys = Array.isArray(section.modalKey) 
                    ? section.modalKey 
                    : [section.modalKey];
                
                if (modalKeys.includes(modalKey) && section.items) {
                    variables.push(...section.items);
                }
            });
        }
        
        return [...new Set(variables)]; // Remove duplicates
    }
    
    /**
     * Prepare output data with units appended to measurements
     * @returns {object} - Results object with units appended to values
     */
    function prepareResultsWithUnits() {
        const outputResults = {};
        Object.entries(results).forEach(([key, value]) => {
            // Check parseConfigMap first, then fallback to manualConfig
            let config = parseConfigMap[key];
            if (!config && window.manualConfig) {
                config = window.manualConfig.find(m => m.handle === key);
            }
            
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
     * Process metrics through Handlebars to resolve {{}} syntax
     * @param {object} baseData - Base data for Handlebars processing
     * @returns {object} - Processed metrics with Handlebars variables resolved
     */
    function processMetricsThroughHandlebars(baseData) {
        const processedMetrics = {};
        
        // Read from metrics object (still the primary store for param values)
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
     * @returns {object} - Combined data ready for template rendering
     */
    function prepareOutputData() {
        const outputResults = prepareResultsWithUnits();
        const processedMetrics = processMetricsThroughHandlebars(outputResults);
        return { ...outputResults, ...processedMetrics };
    }
    
    /**
     * Filter data by clearing variables in excluded/hidden sections
     * Also tracks which variables were excluded (for field marker logic)
     * @param {object} data - The data object to filter
     * @returns {object} - Filtered data with excluded section variables cleared
     *                     Includes _excludedVariables Set for field marker processing
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
     * @param {string} modalKey - The section to trigger
     */
    function triggerModal(modalKey) {
        // IMPORTANT: Check window state, not local state!
        // handleDropdownChange in script-form.js modifies window.hiddenModals directly,
        // so the local variable can get out of sync after a reset-and-retrigger cycle.
        // By checking window state, we ensure we have the latest state.
        const isHidden = window.hiddenModals && window.hiddenModals[modalKey];
        
        console.log(`[triggerModal] Called for ${modalKey}, isHidden: ${isHidden}`);
        
        if (isHidden) {
            console.log(`[triggerModal] Section ${modalKey} was hidden, will unhide and trigger full re-render`);
            
            // Update both local and window state
            hiddenModals[modalKey] = false;
            excludedModals[modalKey] = false;
            triggeredModals[modalKey] = true;
            
            // Sync to window
            window.hiddenModals = hiddenModals;
            window.excludedModals = excludedModals;
            window.triggeredModals = triggeredModals;
            
            // Also ensure window state is updated for this specific key
            // (in case local object was not fully synced)
            window.hiddenModals[modalKey] = false;
            window.excludedModals[modalKey] = false;
            window.triggeredModals[modalKey] = true;
            
            // Update button count
            updateExpectedButtonCount();
            
            // Regenerate report
            if (typeof window.updateReportTextarea === 'function') {
                window.updateReportTextarea();
            }
        }
    }
    
    /**
     * Reset a triggered section back to hidden state
     * Called when the [x] button is clicked
     * @param {string} modalKey - The section to reset
     */
    function resetTriggeredModal(modalKey) {
        console.log(`[resetTriggeredModal] Attempting to reset: ${modalKey}`);
        console.log(`[resetTriggeredModal] triggeredModals:`, window.triggeredModals);
        
        // Check window state for consistency with triggerModal
        const isTriggered = (window.triggeredModals && window.triggeredModals[modalKey]) || 
                            triggeredModals[modalKey];
        
        console.log(`[resetTriggeredModal] isTriggered: ${isTriggered}`);
        
        if (isTriggered) {
            // Clear triggered state in both local and window
            triggeredModals[modalKey] = false;
            window.triggeredModals = triggeredModals;
            if (window.triggeredModals) {
                window.triggeredModals[modalKey] = false;
            }
            
            console.log(`[resetTriggeredModal] Cleared triggered state, calling resetTriggerParameter`);
            
            // Reset the parameter that triggered this section to its default value
            // This triggers the dropdown change event which will:
            // - Update hiddenModals and excludedModals (since default has no triggerModal)
            // - Update metrics and selectedOptions
            // - Update checkbox state
            // - Update summary
            // - Call updateChangedParameters() or updateReportTextarea()
            resetTriggerParameter(modalKey);
            
            // Update button count after parameter reset completes
            setTimeout(() => {
                updateExpectedButtonCount();
            }, 0);
            
            return true; // Return true to indicate section was reset
        } else {
            console.log(`[resetTriggeredModal] Section ${modalKey} is not triggered, nothing to reset`);
        }
        return false;
    }
    
    /**
     * Find and reset the parameter that triggered a section
     * @param {string} modalKey - The section that was triggered
     */
    function resetTriggerParameter(modalKey) {
        if (!window.parameters) {
            console.warn('[resetTriggerParameter] No parameters found');
            return;
        }
        
        console.log(`[resetTriggerParameter] Looking for parameter with triggerModal: ${modalKey}`);
        
        // Find parameter with option that has triggerModal matching modalKey
        let foundParam = false;
        Object.keys(window.parameters).forEach(paramKey => {
            const param = window.parameters[paramKey];
            if (!param.options || !Array.isArray(param.options)) return;
            
            // Check if any option has triggerModal matching this section
            const hasTrigger = param.options.some(opt => 
                typeof opt !== 'string' && opt.triggerModal === modalKey
            );
            
            if (hasTrigger) {
                foundParam = true;
                console.log(`[resetTriggerParameter] Found parameter: ${paramKey}`);
                
                // Find the default option
                const defaultOption = param.options.find(opt => 
                    typeof opt !== 'string' && opt.default === true
                );
                
                if (defaultOption) {
                    console.log(`[resetTriggerParameter] Default option: "${defaultOption.title}"`);
                    
                    // Find the dropdown
                    const $select = $(`#${paramKey}-select`);
                    console.log(`[resetTriggerParameter] Dropdown found: ${$select.length > 0}, current value: "${$select.val()}"`);
                    
                    if ($select.length) {
                        // Set value and trigger change
                        $select.val(defaultOption.title).trigger('change');
                        console.log(`[resetTriggerParameter] Set dropdown to: "${defaultOption.title}", now: "${$select.val()}"`);
                        
                        // Verify the selection was successful
                        if ($select.val() !== defaultOption.title) {
                            console.warn(`[resetTriggerParameter] Failed to reset dropdown ${paramKey}. Expected: "${defaultOption.title}", Got: "${$select.val()}"`);
                        }
                    } else {
                        console.warn(`[resetTriggerParameter] Dropdown not found for ${paramKey}`);
                    }
                } else {
                    console.warn(`[resetTriggerParameter] No default option found for ${paramKey}`);
                }
            }
        });
        
        if (!foundParam) {
            console.warn(`[resetTriggerParameter] No parameter found with triggerModal: ${modalKey}`);
        }
    }
    
    /**
     * Toggle section exclusion state and update UI
     * Unified handler for both inline and modal exclude buttons
     * @param {string} modalKey - The section to toggle
     * @returns {boolean} - New exclusion state (true = excluded)
     */
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
            
            // Hide/show field wrappers for this section
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
                
                // [v5.42] Clear/restore param spans - now using data-param only
                const $paramSpan = $textarea.find(`[data-param="${varName}"]`);
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

    // [v5.0] Register Handlebars helper to wrap parameter outputs in spans
    // [v5.2] DEPRECATED: preprocessTemplate now handles span wrapping at template level
    // This helper is kept for backwards compatibility but should not be used in new templates
    Handlebars.registerHelper('param', function(paramKey, options) {
        // Get the value - either from context or options.fn(this)
        const value = options.fn ? options.fn(this) : this[paramKey];
        
        if (!value || value === '') {
            return '';
        }
        
        // Check if this is actually a parameter (starts with 'p' or 'sp') or a measurement
        const isParameter = paramKey && (paramKey.startsWith('p') || paramKey.startsWith('sp'));
        
        if (isParameter) {
            // Wrap in parameter span
            return new Handlebars.SafeString(
                `<span data-param="${paramKey}" class="param-span">${value}</span>`
            );
        } else {
            // Not a parameter - return unwrapped
            return value;
        }
    });

    // Auto-resize textarea to fit content
    // Supports optional minHeight parameter for minimum textarea size
    function autoResizeTextarea($textarea, minHeight) {
        if (!$textarea || !$textarea.length) return;
        
        if (minHeight) {
            // First, set to minimum height
            $textarea.css('height', minHeight + 'px');
            
            // Now check if content overflows at this height
            const scrollHeight = $textarea[0].scrollHeight;
            
            // If scrollHeight exceeds the set height, content has overflowed - expand
            if (scrollHeight > minHeight) {
                $textarea.css('height', scrollHeight + 'px');
            }
            // Otherwise, stay at minHeight (already set above)
        } else {
            // No minHeight - just size to content
            $textarea.css('height', 'auto');
            const scrollHeight = $textarea[0].scrollHeight;
            $textarea.css('height', scrollHeight + 'px');
        }
    }

    // Populate report config dropdown
    reportConfigs.forEach(config => {
        const option = `<option value="${config.id}">${config.name}</option>`;
        $("#report-config-select").append(option);
        
        // Set as selected if it's the default
        if (config.default) {
            $("#report-config-select").val(config.id);
        }
    });

    // Load selected report config (measurements + options + report template + manual measurements)
    function loadReportConfig(configId) {
        const config = reportConfigs.find(c => c.id === configId);
        if (!config) return;

        // Remove any previously loaded scripts
        document.querySelectorAll('script[data-measurements-config], script[data-parameters-config], script[data-options-config], script[data-report-template], script[data-manual-config]').forEach(s => s.remove());

        let measurementsLoaded = false;
        let parametersLoaded = false;
        let optionsLoaded = false;
        let reportTemplateLoaded = false;
        let manualConfigLoaded = false;

        function checkAllLoaded() {
            if (measurementsLoaded && parametersLoaded && optionsLoaded && reportTemplateLoaded && manualConfigLoaded) {
                console.log(`Loaded report config: ${config.name}`);
                
                // [v5.5] Clear all state on template switch - fresh start
                Object.keys(metrics).forEach(key => delete metrics[key]);
                Object.keys(results).forEach(key => delete results[key]);
                Object.keys(selectedOptions).forEach(key => delete selectedOptions[key]);
                if (window.manuallyEditedParams) {
                    Object.keys(window.manuallyEditedParams).forEach(key => delete window.manuallyEditedParams[key]);
                }
                if (window.modalChangedInSession) {
                    Object.keys(window.modalChangedInSession).forEach(key => delete window.modalChangedInSession[key]);
                }
                if (window.modalInitialState) {
                    Object.keys(window.modalInitialState).forEach(key => delete window.modalInitialState[key]);
                }
                if (window.modalDropdownState) {
                    Object.keys(window.modalDropdownState).forEach(key => delete window.modalDropdownState[key]);
                }
                
                // Clear tracking flags from previous config
                Object.keys(modalPreviewManuallyEdited).forEach(key => delete modalPreviewManuallyEdited[key]);
                Object.keys(summaryCheckboxManuallyEdited).forEach(key => delete summaryCheckboxManuallyEdited[key]);
                Object.keys(excludedModals).forEach(key => delete excludedModals[key]);
                Object.keys(hiddenModals).forEach(key => delete hiddenModals[key]);
                Object.keys(triggeredModals).forEach(key => delete triggeredModals[key]);
                summaryManuallyEdited = false;
                
                // Initialize section visibility states based on config
                initializeModalVisibility();
                
                // [v5.5] Ensure manualConfig items are in parseConfigMap for unit lookup
                // This must happen after manualConfig is loaded but before generateMeasurementsTable
                if (window.manualConfig && Array.isArray(window.manualConfig)) {
                    window.manualConfig.forEach(item => {
                        if (!parseConfigMap[item.handle]) {
                            parseConfigMap[item.handle] = item;
                        }
                    });
                }
                
                // [v5.2] Initialize variable registry from loaded configs
                initializeVariableRegistry();
                
                // Regenerate the measurements table and form
                generateMeasurementsTable();
                runCalculations(); // Calculate derived values
                $("#options-content").empty();
                buildOptionsForm();
                
                updateSummary();
                // Update section previews with imported data
                updateAllSectionPreviews();
            }
        }

        // Load measurements config
        const measurementsScript = document.createElement('script');
        measurementsScript.src = config.measurements;
        measurementsScript.setAttribute('data-measurements-config', 'true');
        measurementsScript.onload = function() {
            if (window.measurements && Array.isArray(window.measurements)) {
                measurements = window.measurements;
                measurementsLoaded = true;
                checkAllLoaded();
            } else {
                alert(`Measurements configuration loaded but not found: ${config.name}`);
            }
        };
        measurementsScript.onerror = function() {
            alert(`Failed to load measurements configuration: ${config.name}`);
        };
        document.head.appendChild(measurementsScript);

        // Load parameters config
        if (config.parameters) {
            const parametersScript = document.createElement('script');
            parametersScript.src = config.parameters;
            parametersScript.setAttribute('data-parameters-config', 'true');
            parametersScript.onload = function() {
                if (window.parameters && typeof window.parameters === 'object') {
                    // Use parameters directly from window.parameters
                    parameters = window.parameters;
                    // Also expose globally immediately for form.js access
                    window.parameters = parameters;
                    parametersLoaded = true;
                    checkAllLoaded();
                } else {
                    alert(`Parameters configuration loaded but not found: ${config.name}`);
                }
            };
            parametersScript.onerror = function() {
                alert(`Failed to load parameters configuration: ${config.name}`);
            };
            document.head.appendChild(parametersScript);
        } else {
            parametersLoaded = true;
            checkAllLoaded();
        }

        // Load options config (modal groupings)
        const optionsScript = document.createElement('script');
        optionsScript.src = config.options;
        optionsScript.setAttribute('data-options-config', 'true');
        optionsScript.onload = function() {
            if (window.options && Array.isArray(window.options)) {
                options = window.options;
                optionsLoaded = true;
                checkAllLoaded();
            } else {
                alert(`Options configuration loaded but not found: ${config.name}`);
            }
        };
        optionsScript.onerror = function() {
            alert(`Failed to load options configuration: ${config.name}`);
        };
        document.head.appendChild(optionsScript);

        // Load report template
        const reportScript = document.createElement('script');
        reportScript.src = config.report;
        reportScript.setAttribute('data-report-template', 'true');
        reportScript.onload = function() {
            if (window.outputTemplate) {
                reportTemplateLoaded = true;
                checkAllLoaded();
            } else {
                alert(`Report template loaded but not found: ${config.name}`);
            }
        };
        reportScript.onerror = function() {
            alert(`Failed to load report template: ${config.name}`);
        };
        document.head.appendChild(reportScript);

        // Load manual measurements config
        const manualScript = document.createElement('script');
        manualScript.src = config.manual;
        manualScript.setAttribute('data-manual-config', 'true');
        manualScript.onload = function() {
            if (window.manualConfig && Array.isArray(window.manualConfig)) {
                manualConfigLoaded = true;
                checkAllLoaded();
            } else {
                alert(`Manual measurements config loaded but not found: ${config.name}`);
            }
        };
        manualScript.onerror = function() {
            alert(`Failed to load manual measurements config: ${config.name}`);
        };
        document.head.appendChild(manualScript);
    }

    // Handle report config selection change
    let reportConfigLoaded = false;
    $("#report-config-select").on("change", function () {
        const selectedId = $(this).val();
        loadReportConfig(selectedId);
    });

    // Populate input config dropdown
    inputConfigs.forEach(config => {
        const option = `<option value="${config.id}">${config.name}</option>`;
        $("#parse-config-select").append(option);
        
        // Set as selected if it's the default
        if (config.default) {
            $("#parse-config-select").val(config.id);
        }
    });

    // Load input/parse config
    function loadInputConfig(configId) {
        const config = inputConfigs.find(c => c.id === configId);
        if (!config) return;
        
        // Remove any previously loaded input config script
        document.querySelectorAll('script[data-input-config]').forEach(s => s.remove());
        
        // Dynamically load the input config file
        const script = document.createElement('script');
        script.src = config.file;
        script.setAttribute('data-input-config', 'true');
        script.onload = function() {
            // After loading, parseConfig should be available as window.parseConfig
            if (window.parseConfig && Array.isArray(window.parseConfig)) {
                parseConfig = window.parseConfig;
                
                // Build the lookup map
                parseConfigMap = {};
                parseConfig.forEach(item => {
                    parseConfigMap[item.handle] = item;
                });
                
                // Also add manual measurements to parseConfigMap so units are available
                if (window.manualConfig && Array.isArray(window.manualConfig)) {
                    window.manualConfig.forEach(item => {
                        // Don't overwrite parseConfig entries, but add manual ones
                        if (!parseConfigMap[item.handle]) {
                            parseConfigMap[item.handle] = item;
                        }
                    });
                }
                
                console.log(`Loaded input config: ${config.name}`);
                
                // Regenerate the measurements table
                generateMeasurementsTable();
            } else {
                alert(`Input configuration loaded but not found: ${config.name}`);
            }
        };
        script.onerror = function() {
            alert(`Failed to load input configuration: ${config.name}`);
        };
        document.head.appendChild(script);
    }

    // Handle input config selection change
    $("#parse-config-select").on("change", function () {
        const selectedId = $(this).val();
        loadInputConfig(selectedId);
    });

    // Load default input config on page load
    const defaultInputConfig = inputConfigs.find(c => c.default);
    if (defaultInputConfig) {
        loadInputConfig(defaultInputConfig.id);
    }

    // Generate measurements table
    function generateMeasurementsTable() {
        const $table = $("#measurements-table");
        $table.empty();
        
        // Create table structure
        const $tableEl = $('<table></table>');
        
        measurements.forEach(section => {
            // Check if this is a highlighted section
            const highlightClass = section.highlight ? ' highlight-section' : '';
            
            // Handle modalKey as string or array for data attribute
            let sectionDataAttr = '';
            if (section.modalKey) {
                if (Array.isArray(section.modalKey)) {
                    sectionDataAttr = section.modalKey.join(' ');
                } else {
                    sectionDataAttr = section.modalKey;
                }
            }
            
            // Section header row
            const $headerRow = $(`<tr class="section-header${highlightClass}" data-section="${sectionDataAttr}"><th colspan="3">${section.modalTitle}</th></tr>`);
            $tableEl.append($headerRow);
            
            // Measurement rows
            section.items.forEach(handle => {
                // Look up in parseConfig first
                let config = parseConfigMap[handle];
                
                // If not found in parseConfig, check manualConfig
                if (!config && window.manualConfig) {
                    config = window.manualConfig.find(m => m.handle === handle);
                }
                
                if (!config) {
                    console.warn(`No config found for measurement: ${handle}`);
                    return;
                }
                
                const label = config.label || handle;
                const unit = config.unit || '';
                const currentValue = results[handle] || '';
                
                // Check if this is a calculated field
                const isCalculated = typeof calculations !== 'undefined' && calculations[handle];
                const calculatedClass = isCalculated ? ' calculated-field' : '';
                // Calculated fields are now editable, but keep the class for styling distinction
                
                // Check if this should be full width (for fields like DOB, Operator)
                const isFullWidth = config.full === true;
                const fullWidthClass = isFullWidth ? ' full-width' : '';
                
                const $row = $(`
                    <tr class="${highlightClass}" data-section="${sectionDataAttr}">
                        <td class="measurement-label">${label}</td>
                        <td class="measurement-value">
                            <input type="text" 
                                   class="measurement-input${calculatedClass}${fullWidthClass}" 
                                   data-handle="${handle}" 
                                   value="${currentValue}" />
                            ${!isFullWidth ? `<span class="unit-label">${unit}</span>` : ''}
                        </td>
                    </tr>
                `);
                $tableEl.append($row);
            });
        });
        
        $table.append($tableEl);
        
        // Add event handlers for measurement inputs
        $table.find('.measurement-input').on('input', function() {
            const handle = $(this).data('handle');
            const value = $(this).val();
            
            // Don't update calculated fields manually
            if ($(this).hasClass('calculated-field')) {
                return;
            }
            
            results[handle] = value;
            
            // [v5.2] Update variable registry with measurement
            if (typeof updateRegistryMeasurement === 'function') {
                updateRegistryMeasurement(handle, value, 'manual');
            }
            
            // Run calculations after updating a measurement
            runCalculations();
            
            // Update the report
            if (typeof window.updateReportTextarea === 'function') {
                window.updateReportTextarea();
            }
            
            // Update summary if it contains measurements
            updateSummary();
        });
    }
    
    // Run calculations for derived values
    function runCalculations() {
        if (typeof calculations === 'undefined') return;
        
        Object.entries(calculations).forEach(([handle, calcFn]) => {
            try {
                const result = calcFn(results);
                results[handle] = result;
                
                // [v5.2] Update variable registry for calculated measurement
                if (typeof updateRegistryMeasurement === 'function') {
                    updateRegistryMeasurement(handle, result, 'imported');
                }
                
                // Update the input field if it exists
                const $input = $(`.measurement-input[data-handle="${handle}"]`);
                if ($input.length) {
                    $input.val(result !== 'N/A' ? result : '');
                }
            } catch (e) {
                console.warn(`Calculation error for ${handle}:`, e);
            }
        });
    }

    // Import modal handling
    $("#open-import-modal").on("click", function() {
        $("#import-modal").addClass("active");
    });
    
    $("#close-import-modal").on("click", function() {
        $("#import-modal").removeClass("active");
    });
    
    // Close modal when clicking outside
    $("#import-modal").on("click", function(e) {
        if (e.target === this) {
            $(this).removeClass("active");
        }
    });
    
    // Load example data button
    $("#load-example-data").on("click", function() {
        // Get the currently selected parse config
        const configId = $("#parse-config-select").val();
        const config = inputConfigs.find(c => c.id === configId);
        
        if (!config || !config.exampledata) {
            alert('No example data file specified for this configuration.');
            return;
        }
        
        // Remove any previously loaded example data script
        const oldExampleScript = document.querySelector('script[data-example-data]');
        if (oldExampleScript) {
            oldExampleScript.remove();
            // Clear the previous parseExample
            delete window.parseExample;
        }
        
        // Create a script element to load the example data
        const script = document.createElement('script');
        script.src = config.exampledata;
        script.setAttribute('data-example-data', 'true');
        
        script.onload = function() {
            // After loading, window.parseExample should be available
            if (window.parseExample && typeof window.parseExample === 'string') {
                $("#report").val(window.parseExample);
                console.log('Example data loaded successfully');
            } else {
                alert('Example data file loaded but window.parseExample not found.');
            }
        };
        
        script.onerror = function() {
            alert(`Failed to load example data file: ${config.exampledata}`);
        };
        
        document.head.appendChild(script);
    });
    
    // Clear button handler - only clears imported measurements, not form selections
    $("#clear-import").on("click", function() {
        // Clear the textarea
        $("#report").val("");
        
        // Clear ONLY measurements (results), preserve form selections (metrics)
        Object.keys(results).forEach(key => delete results[key]);
        
        // Regenerate the measurements table (form selections remain unchanged)
        generateMeasurementsTable();
    });

    // Parse imported data
    $("#submit").on("click", function () {
        const inputText = $("#report").val();
        
        // Clear previous results
        Object.keys(results).forEach(key => delete results[key]);
        
        // Parse each config item
        parseConfig.forEach(config => {
            if (config.match) {
                const regex = new RegExp(config.match);
                const match = inputText.match(regex);
                if (match && match[1]) {
                    results[config.handle] = match[1].trim();
                }
            }
        });
        
        // [v5.2] Update variable registry with all imported measurements
        if (typeof updateRegistryMeasurement === 'function') {
            Object.entries(results).forEach(([handle, value]) => {
                updateRegistryMeasurement(handle, value, 'imported');
            });
        }
        
        // Run calculations after parsing
        runCalculations();
        
        // Update the measurements table
        Object.entries(results).forEach(([handle, value]) => {
            const $input = $(`.measurement-input[data-handle="${handle}"]`);
            if ($input.length) {
                $input.val(value);
            }
        });
        
        // Update the report
        if (typeof window.updateReportTextarea === 'function') {
            window.updateReportTextarea();
        }
        
        // Update summary
        updateSummary();
        
        // Update section previews with imported data
        updateAllSectionPreviews();
        
        // Close the modal
        $("#import-modal").removeClass("active");
    });

    // Reset button handler - clears all form selections, preserves measurements
    $("#reset-selections").on("click", function() {
        // Confirm before resetting
        if (!confirm("Reset all form selections to defaults? This will not affect imported measurements.")) {
            return;
        }
        
        // Clear all metrics
        Object.keys(metrics).forEach(key => delete metrics[key]);
        
        // Clear selected options
        Object.keys(selectedOptions).forEach(key => delete selectedOptions[key]);
        
        // Clear excluded sections
        Object.keys(excludedModals).forEach(key => delete excludedModals[key]);
        if (window.excludedModals) {
            Object.keys(window.excludedModals).forEach(key => delete window.excludedModals[key]);
        }
        
        // Clear hidden sections
        if (window.hiddenModals) {
            Object.keys(window.hiddenModals).forEach(key => delete window.hiddenModals[key]);
        }
        
        // [v5.43] Reset summaryChecked in registry to defaults
        if (window.variableRegistry && window.parameters) {
            Object.keys(window.variableRegistry).forEach(key => {
                const entry = window.variableRegistry[key];
                if (entry && entry.summaryChecked !== undefined) {
                    const paramConfig = window.parameters[key];
                    entry.summaryChecked = paramConfig?.summaryDefault === true;
                }
            });
        }
        
        // Reset tracking flags
        Object.keys(modalPreviewManuallyEdited).forEach(key => delete modalPreviewManuallyEdited[key]);
        Object.keys(summaryCheckboxManuallyEdited).forEach(key => delete summaryCheckboxManuallyEdited[key]);
        summaryManuallyEdited = false;
        
        // Rebuild the form (this will re-initialize defaults)
        $("#options-content").empty();
        buildOptionsForm();
        
        // Update summary and report
        updateSummary();
        if (typeof window.updateReportTextarea === 'function') {
            window.updateReportTextarea();
        }
    });

    // Update summary
    function updateSummary() {
        const summaryItems = [];
        
        // [v5.43] Track processed parameters to avoid duplicates
        // (same param can appear in multiple modals)
        const processedParams = new Set();
        
        // Prepare data for Handlebars using shared utility
        const resultsWithUnits = prepareResultsWithUnits();
        const summaryData = { ...resultsWithUnits, ...metrics };
        
        // [v5.43] Collect summary items - read summaryChecked from registry
        options.forEach(section => {
            if (!section.variables) return;
            
            // Skip this entire section if it's excluded OR hidden
            if (section.modalKey && (excludedModals[section.modalKey] || (window.hiddenModals && window.hiddenModals[section.modalKey]))) {
                return;
            }
            
            section.variables.forEach(varKey => {
                // [v5.43] Skip if already processed (param can appear in multiple modals)
                if (processedParams.has(varKey)) {
                    return;
                }
                
                // [v5.42] Look up parameter definition from global parameters
                const option = window.parameters ? window.parameters[varKey] : null;
                
                if (!option || !option.enableSummary) return;
                
                // Mark as processed
                processedParams.add(varKey);
                
                const metricValue = metrics[varKey];
                
                // [v5.43] Read summaryChecked from registry (single source of truth)
                const isChecked = getRegistrySummaryChecked(varKey);
                
                // Include if either:
                // 1. summaryAlwaysInclude is true (no checkbox required), OR
                // 2. checkbox is checked (from registry) and has value
                const shouldInclude = (option.summaryAlwaysInclude === true && metricValue && metricValue.trim()) ||
                                     (isChecked && metricValue && metricValue.trim());
                
                if (shouldInclude) {
                    // Determine text to use: summarytext if available, otherwise the metric value (which is the title)
                    let textToUse = metricValue;
                    
                    // Look up the selected option to check for summarytext attribute
                    let selectedOption = null;
                    
                    if (option.options && Array.isArray(option.options)) {
                        // First, try to find by matching title
                        selectedOption = option.options.find(opt => {
                            const title = typeof opt === 'string' ? opt : opt.title;
                            return title === metricValue;
                        });
                        
                        // If not found and we have a tracked selected option, use that
                        if (!selectedOption && window.selectedOptions && window.selectedOptions[varKey]) {
                            selectedOption = window.selectedOptions[varKey];
                        }
                        
                        // If found and has summarytext, use that instead
                        if (selectedOption && typeof selectedOption !== 'string' && selectedOption.summarytext) {
                            textToUse = selectedOption.summarytext;
                        }
                    }
                    // For customtext options, use summarytext from selectedOptions
                    else if (option.options === "customtext") {
                        if (window.selectedOptions && window.selectedOptions[varKey]) {
                            selectedOption = window.selectedOptions[varKey];
                            if (selectedOption.summarytext) {
                                textToUse = selectedOption.summarytext;
                            }
                        }
                    }
                    
                    // DON'T process through Handlebars here - keep {{}} syntax intact
                    // This will be processed later in updateReportTextarea() along with everything else
                    // This allows measurement values within summary to be wrapped in spans
                    summaryItems.push({
                        text: textToUse,
                        order: option.summaryOrder ?? 999
                    });
                }
            });
        });
        
        // Sort and join
        summaryItems.sort((a, b) => a.order - b.order);
        
        // Group items by order number
        const groupedByOrder = {};
        summaryItems.forEach(item => {
            if (!groupedByOrder[item.order]) {
                groupedByOrder[item.order] = [];
            }
            groupedByOrder[item.order].push(item.text);
        });
        
        // Join items within same order, handling special ^ prefix for no-space items
        const lines = Object.keys(groupedByOrder)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(order => {
                const items = groupedByOrder[order];
                // Join items, but handle ^ prefix to suppress leading space
                let result = '';
                items.forEach((text, index) => {
                    if (index === 0) {
                        // First item - just add it (strip ^ if present)
                        result += text.startsWith('^') ? text.substring(1) : text;
                    } else {
                        // Subsequent items - check for ^ prefix
                        if (text.startsWith('^')) {
                            // No space before this item
                            result += text.substring(1);
                        } else {
                            // Normal: add space before item
                            result += ' ' + text;
                        }
                    }
                });
                return result;
            });
        
        const autoGeneratedContent = lines.join('\n');
        
        console.log('[v5.1] updateSummary called - autoGeneratedContent:', autoGeneratedContent ? autoGeneratedContent.substring(0, 100) : '(empty string)');
        
        // [v5.5] Update Summary in registry (single source of truth)
        // setParamValue updates both registry AND metrics object
        if (summaryManuallyEdited && metrics.Summary) {
            // Append new items to existing manual content
            const currentLines = metrics.Summary.split('\n').filter(line => line.trim());
            const autoLines = autoGeneratedContent.split('\n').filter(line => line.trim());
            const newLines = autoLines.filter(line => !currentLines.includes(line));
            
            if (newLines.length > 0) {
                const updatedContent = metrics.Summary + '\n' + newLines.join('\n');
                setParamValue('Summary', updatedContent);
            }
        } else {
            // Replace with auto-generated
            setParamValue('Summary', autoGeneratedContent);
        }
        
        // TODO [v5.0]: Old Summary textarea code below - kept for reference
        // Summary is now part of ContentEditable, not a separate textarea
        // Update Summary textarea
        const $summaryTextarea = $('#Summary-textarea');
        if ($summaryTextarea.length && !$summaryTextarea.is(':focus')) {
            if (summaryManuallyEdited) {
                // Append new items to manual content
                const currentLines = $summaryTextarea.val().split('\n').filter(line => line.trim());
                const autoLines = autoGeneratedContent.split('\n').filter(line => line.trim());
                const newLines = autoLines.filter(line => !currentLines.includes(line));
                
                if (newLines.length > 0) {
                    const updatedContent = $summaryTextarea.val() + '\n' + newLines.join('\n');
                    $summaryTextarea.val(updatedContent);
                    setParamValue('Summary', updatedContent);
                    if (typeof window.autoResizeTextarea === 'function') {
                        window.autoResizeTextarea($summaryTextarea);
                    }
                }
            } else {
                // Replace with auto-generated
                $summaryTextarea.val(autoGeneratedContent);
                setParamValue('Summary', autoGeneratedContent);
                if (typeof window.autoResizeTextarea === 'function') {
                    window.autoResizeTextarea($summaryTextarea);
                }
            }
        }
    }
    
    // Update section preview
    function updateModalPreview(modalKey) {
        if (!modalTemplates[modalKey]) return;
        
        // Don't update if manually edited
        if (modalPreviewManuallyEdited[modalKey]) return;
        
        // Prepare data using shared utility (with SafeString for nested Handlebars)
        const resultsWithUnits = prepareResultsWithUnits();
        
        // Pre-process metrics values through Handlebars with SafeString
        const processedMetrics = {};
        Object.entries(metrics).forEach(([key, value]) => {
            if (typeof value === 'string' && value.includes('{{')) {
                try {
                    const template = Handlebars.compile(value);
                    const processed = template(resultsWithUnits);
                    // Mark as SafeString to prevent double-escaping
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
            
            // Use new textarea-based form
            const $textarea = $(`#${modalKey}-textarea`);
            if ($textarea.length) {
                $textarea.val(rendered);
                metrics[modalKey] = rendered;
                // Auto-resize textarea using global function
                if (typeof window.autoResizeTextarea === 'function') {
                    window.autoResizeTextarea($textarea);
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
        
        // IMPORTANT: Populate metrics with default values BEFORE building the form
        // This ensures modals can access the default values when they're created
        // BUT only set defaults if values don't already exist (preserve user selections)
        options.forEach(section => {
            if (section.variables) {
                section.variables.forEach(varKey => {
                    // Look up parameter definition from global parameters
                    const option = window.parameters ? window.parameters[varKey] : null;
                    if (!option) return; // Not a parameter (likely a measurement)
                    
                    // Find default option (only if options is an array)
                    if (option.options && Array.isArray(option.options)) {
                        const defaultOption = option.options.find(opt => {
                            if (typeof opt === 'string') return false;
                            return opt.default === true;
                        });
                        
                        if (defaultOption) {
                            const title = typeof defaultOption === 'string' ? defaultOption : defaultOption.title;
                            // Only set default if value doesn't already exist (preserve user selections)
                            if (metrics[varKey] === undefined) {
                                metrics[varKey] = title || "";
                            }
                        }
                    }
                    // For customtext options, initialize with empty string
                    else if (option.options === "customtext") {
                        // Only set empty string if value doesn't already exist
                        if (metrics[varKey] === undefined) {
                            metrics[varKey] = "";
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
        // Metrics defaults are now set in buildOptionsForm() before the form is built
        // This function just renders the sections with those defaults
        
        // Render and populate each section textarea
        options.forEach(section => {
            if (section.modalKey) {
                const modalKey = section.modalKey;
                
                if (!modalTemplates[modalKey]) {
                    console.warn(`No template found for section: ${modalKey}`);
                    return;
                }
                
                // Prepare data using shared utilities (with SafeString)
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
                        
                        // Auto-resize the textarea using global function
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
    
    // [v5.42] Granular update - only updates changed parameter spans
    // NEVER falls back to full re-render to preserve manual edits
    // [v5.42] Uses data-param ONLY for span targeting (data-modal removed)
    function updateChangedParameters(changedParamKeys) {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) {
            console.warn('ContentEditable textarea not found');
            return;
        }
        
        // [v5.5] Set flag to prevent MutationObserver from triggering during update
        // Without this, .text() calls trigger childList mutations which could
        // cause button protection to call updateReportTextarea and recreate content
        const wasRestoringButtons = isRestoringButtons;
        isRestoringButtons = true;
        
        // Prepare data using shared utility
        const outputResults = prepareResultsWithUnits();
        
        // Track if any spans were updated
        let spansUpdated = false;
        
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
            
            // Process through Handlebars if needed
            if (typeof newValue === 'string' && newValue.includes('{{')) {
                try {
                    const template = Handlebars.compile(newValue);
                    newValue = template(outputResults);
                } catch (e) {
                    console.warn(`Failed to process metric ${paramKey}:`, e);
                }
            }
            
            // [v5.42] Check if parameter is excluded/hidden using helper function
            const paramExcluded = isParamExcluded(paramKey);
            
            // If excluded/hidden, set to empty
            if (paramExcluded) {
                newValue = '';
            }
            
            // [v5.42] Find spans using data-param ONLY (data-modal removed)
            // All spans with this param get updated - allows cross-modal control
            const $spans = $textarea.find(`[data-param="${paramKey}"]`);
            
            if ($spans.length > 0) {
                $spans.each(function() {
                    $(this).text(newValue || '');
                    
                    // [v5.42] Apply state-based CSS class for color coding
                    const entry = getRegistryEntry(paramKey);
                    if (entry) {
                        // Remove all state classes first
                        $(this).removeClass('param-default param-selected param-manual param-imported param-unknown');
                        
                        // Add the current state class
                        if (entry.state) {
                            $(this).addClass(`param-${entry.state}`);
                        }
                    }
                });
                spansUpdated = true;
                
                // [v5.42] Toggle if-block visibility based on value
                const $block = $textarea.find(`.param-block[data-block-param="${paramKey}"]`);
                if ($block.length) {
                    if (newValue && newValue.trim() !== '') {
                        $block.removeClass('block-empty');
                    } else {
                        $block.addClass('block-empty');
                    }
                }
            }
            // [v5.4] Span always exists - no fallback needed
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
        
        // [v5.5] Reset flag after a short delay to allow mutations to complete
        setTimeout(() => {
            isRestoringButtons = wasRestoringButtons;
        }, 10);
    }
    
    // [v5.42] Helper function to wrap fixed text portions within content
    // Fixed text is any text that's not inside a param span
    // Example: "Technical Quality: <span data-param="pQuality">Good</span>"
    //   Fixed text = "Technical Quality: "
    //   Param span = <span data-param="pQuality">Good</span>
    function wrapFixedTextInContent(content, fieldName) {
        // Use a parsing approach to identify text segments vs span elements
        // Split by span tags while preserving them
        const spanRegex = /(<span[^>]*>[\s\S]*?<\/span>)/g;
        const parts = content.split(spanRegex);
        
        let wrappedParts = [];
        let fixedTextIndex = 0;
        
        parts.forEach(part => {
            if (!part) return; // Skip empty parts
            
            if (part.startsWith('<span')) {
                // This is a span element - keep as-is
                wrappedParts.push(part);
            } else if (part.trim()) {
                // This is fixed text - wrap it in a span and register
                const fixedId = `fixed-${fieldName}-${fixedTextIndex++}`;
                
                // Register in variable registry
                variableRegistry[fixedId] = {
                    value: part,
                    type: 'fixed',
                    state: 'default',
                    fieldName: fieldName
                };
                
                // Wrap in span with data-fixed attribute
                wrappedParts.push(`<span data-fixed="${fixedId}" class="fixed-span param-fixed">${part}</span>`);
            } else if (part) {
                // Whitespace-only text - preserve but don't wrap
                wrappedParts.push(part);
            }
        });
        
        return wrappedParts.join('');
    }
    
    // [v5.2] Update ContentEditable report textarea with span-wrapped parameters
    // Now uses preprocessed template that wraps variables in spans at template level
    function updateReportTextarea() {
        console.log('[updateReportTextarea] FULL RE-RENDER triggered');
        console.trace('[updateReportTextarea] Call stack:');
        
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
        // [v5.42] The preprocessed template has {{variables}} wrapped in spans with data-param
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
    
    // [v5.4] Post-process report: if-blocks, field markers, and button placement
    function postProcessReport(reportHTML, data) {
        let processed = reportHTML;
        
        // Get excluded variables set (for field marker logic)
        const excludedVariables = data._excludedVariables || new Set();
        
        // ========================================================================
        // IF-BLOCKS: Process <!--if:paramKey-->content<!--/if-->
        // Creates inline span wrapper for granular updates
        // CSS ::before adds line break for non-empty, display:none hides empty
        // Consumes template newline - CSS provides visual line break instead
        // ========================================================================
        const ifBlockRegex = /\n?<!--if:(\w+)-->([\s\S]*?)<!--\/if-->/g;
        
        processed = processed.replace(ifBlockRegex, (match, paramKey, content) => {
            const paramValue = data[paramKey] || '';
            const isEmpty = !paramValue || paramValue.trim() === '';
            const emptyClass = isEmpty ? ' block-empty' : '';
            
            // Span is always inline, CSS ::before adds line break when not empty
            return `<span class="param-block${emptyClass}" data-block-param="${paramKey}">${content.trim()}</span>`;
        });
        
        // ========================================================================
        // FIELD MARKERS: Process <!--@FieldName-->content<!--/@FieldName-->
        // [v5.42] These now wrap fixed text in spans and register in variable registry
        // - Fixed text outside param spans gets its own span with data-fixed attribute
        // - Excluded variable: entire field is hidden (fixed text + variable)
        // - Included but empty: field is shown (fixed text + empty variable)
        // ========================================================================
        const fieldMarkerRegex = /<!--@(\w+)-->([\s\S]*?)<!--\/@\1-->\n?/g;
        
        processed = processed.replace(fieldMarkerRegex, (match, fieldName, content) => {
            // Check if this field's variable is excluded/hidden
            if (excludedVariables.has(fieldName)) {
                // Remove the entire field (fixed text + variable + trailing newline)
                return '';
            }
            
            // [v5.42] Wrap fixed text portions (text outside of param spans)
            // Parse content to identify and wrap fixed text segments
            const wrappedContent = wrapFixedTextInContent(content, fieldName);
            
            // Field is included - wrap in field wrapper span
            const hadNewline = match.endsWith('\n');
            return `<span class="field-wrapper" data-field="${fieldName}">${wrappedContent}</span>${hadNewline ? '\n' : ''}`;
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
                // Summary only gets edit button
                buttonHTML = `<button type="button" class="inline-edit-button" data-modal="${modalKey}" title="Edit Summary">✎</button>`;
            } else if (isTriggered) {
                // Triggered sections get edit button AND orange [x] reset button
                buttonHTML = `<button type="button" class="inline-edit-button" data-modal="${modalKey}" title="Edit ${modalGroup.modalTitle}">✎</button><button type="button" class="inline-exclude-button reset-trigger-button" data-modal="${modalKey}" title="Close and reset to default">×</button>`;
            } else {
                // Regular sections get exclude button always, edit button only when not excluded
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
        
        // [v5.4] Keep all param spans - needed for granular updates
        // Empty param spans are invisible, param-block spans handle visibility via CSS
        
        // [v5.2] Remove field wrapper spans that are completely empty
        processed = processed.replace(/<span[^>]*class="field-wrapper"[^>]*>\s*<\/span>/g, '');
        
        // Clean up lines that only contain whitespace or empty spans
        // This handles hidden modal content (like mPEffFull)
        // [v5.4] Preserve lines containing param-block (they use CSS for visibility)
        processed = processed
            .split('\n')
            .map(line => {
                // Preserve lines with param-block spans - they use CSS for visibility
                if (line.includes('param-block') || line.includes('data-block-param')) {
                    return line;
                }
                // Check if line only contains HTML tags (spans) with no text content
                const textOnly = line.replace(/<[^>]+>/g, '').trim();
                return textOnly === '' ? '' : line;
            })
            .join('\n')
            .replace(/\n{3,}/g, '\n\n');  // Collapse 3+ newlines to 2
        
        return processed;
    }
    
    // [v5.0] Update ContentEditable HTML while preserving cursor position
    function updateContentEditableHTML(newHTML) {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) return;
        
        // [v5.1] Set flag to prevent MutationObserver from triggering during intentional update
        isRestoringButtons = true;
        
        // [v5.2] Capture manual edit spans before update
        // These are text edits made outside of parameter spans
        // Store context including preceding line breaks for proper restoration
        const manualEdits = [];
        let manualEditCounter = 0;
        
        $textarea.find('.manual-edit').each(function() {
            const $edit = $(this);
            const text = $edit.text();
            
            if (!text.trim()) return; // Skip empty edits
            
            // Assign unique ID if not already present
            let editId = $edit.attr('data-manual-id');
            if (!editId) {
                editId = `manual-${Date.now()}-${manualEditCounter++}`;
                $edit.attr('data-manual-id', editId);
            }
            
            // [v5.2] Check for preceding line break context
            // Browsers create different structures for new lines:
            // - <br> before text
            // - Text inside a <div>
            // - Text after a newline character
            let hasLineBreakBefore = false;
            
            // Check for <br> immediately before
            const prevSibling = this.previousSibling;
            if (prevSibling) {
                if (prevSibling.nodeName === 'BR') {
                    hasLineBreakBefore = true;
                } else if (prevSibling.nodeType === Node.TEXT_NODE && 
                           prevSibling.textContent.endsWith('\n')) {
                    hasLineBreakBefore = true;
                }
            }
            
            // Check if we're inside a div (browser's way of creating new lines)
            const $parent = $edit.parent();
            if ($parent.is('div') && !$parent.is('#report-textarea')) {
                hasLineBreakBefore = true;
            }
            
            // [v5.2] Find anchors by searching the entire textarea
            let anchor = null;
            let anchorType = null;
            let bestDistance = Infinity;
            
            // Get the text position of this manual edit (approximate)
            const editRect = this.getBoundingClientRect();
            const editTop = editRect.top;
            
            // Search all param spans and button groups for closest anchor
            $textarea.find('[data-param], .inline-button-group').each(function() {
                const $candidate = $(this);
                const candidateRect = this.getBoundingClientRect();
                const candidateBottom = candidateRect.bottom;
                
                // Check if candidate is BEFORE this edit (above it in the document)
                if (candidateBottom <= editTop + 5) { // 5px tolerance
                    const distance = editTop - candidateBottom;
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        if ($candidate.attr('data-param')) {
                            anchor = $candidate.data('param');
                            anchorType = 'afterParam';
                        } else if ($candidate.hasClass('inline-button-group')) {
                            anchor = $candidate.data('modal');
                            anchorType = 'afterButton';
                        }
                    }
                }
            });
            
            // If no "before" anchor found, look for "after" anchor
            if (!anchor) {
                bestDistance = Infinity;
                $textarea.find('[data-param], .inline-button-group').each(function() {
                    const $candidate = $(this);
                    const candidateRect = this.getBoundingClientRect();
                    const candidateTop = candidateRect.top;
                    
                    // Check if candidate is AFTER this edit (below it)
                    if (candidateTop >= editTop - 5) { // 5px tolerance
                        const distance = candidateTop - editTop;
                        if (distance < bestDistance) {
                            bestDistance = distance;
                            if ($candidate.attr('data-param')) {
                                anchor = $candidate.data('param');
                                anchorType = 'beforeParam';
                            } else if ($candidate.hasClass('inline-button-group')) {
                                anchor = $candidate.data('modal');
                                anchorType = 'beforeButton';
                            }
                        }
                    }
                });
            }
            
            // Store edit info for restoration
            manualEdits.push({
                id: editId,
                text: text,
                anchor: anchor,
                anchorType: anchorType,
                hasLineBreakBefore: hasLineBreakBefore
            });
            
            if (anchor) {
                console.log(`[v5.2] Captured manual edit: "${text.substring(0, 20)}..." anchor=${anchor} type=${anchorType} lineBreak=${hasLineBreakBefore}`);
            } else {
                console.warn(`[v5.2] No anchor found for manual edit: "${text.substring(0, 20)}..."`);
            }
        });
        
        // Also store in window for debugging
        window._lastManualEdits = manualEdits;
        
        // Get current cursor position
        const selection = window.getSelection();
        let cursorOffset = 0;
        let cursorNode = null;
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            cursorNode = range.startContainer;
            cursorOffset = range.startOffset;
        }
        
        // Update HTML
        $textarea.html(newHTML);
        
        // [v5.2] Restore manual edit spans with line break context
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
                // Create the span with line break if needed
                const $newSpan = $('<span class="manual-edit"></span>')
                    .attr('data-manual-id', edit.id)
                    .text(edit.text);
                
                if (edit.anchorType === 'afterParam' || edit.anchorType === 'afterButton') {
                    if (edit.hasLineBreakBefore) {
                        // Insert line break then span
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
                console.warn(`[v5.2] Could not restore manual edit: "${edit.text.substring(0, 20)}..." - anchor ${edit.anchor} not found in new HTML`);
            }
        });
        
        if (manualEdits.length > 0) {
            console.log(`[v5.2] Restored ${restoredCount}/${manualEdits.length} manual edit(s)`);
        }
        
        // [v5.1] Reset flag after a short delay to allow mutations to complete
        setTimeout(() => {
            isRestoringButtons = false;
        }, 10);
        
        // Don't automatically focus or move cursor - this was causing issues
        // when typing in measurement fields. The cursor should only move when
        // the user explicitly interacts with the report textarea.
    }
    
    // [v5.0] Setup button event handlers (buttons are placed via template markers)
    function updateButtonPositions() {
        setupInlineButtonHandlers();
    }
    
    // [v5.0] Setup click handlers for inline buttons
    function setupInlineButtonHandlers() {
        const $reportTextarea = $('#report-textarea');
        
        // [v5.5] Edit button - build and open modal on-demand
        $reportTextarea.off('click', '.inline-edit-button').on('click', '.inline-edit-button', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const modalKey = $(this).data('modal');
            
            // [v5.5] Create and open modal on-demand
            if (typeof window.openModalByKey === 'function') {
                const $modal = window.openModalByKey(modalKey);
                
                if ($modal) {
                    // Initialize modal state tracking for bi-directional updates
                    if (!window.modalChangedInSession) window.modalChangedInSession = {};
                    if (!window.modalInitialState) window.modalInitialState = {};
                    if (!window.modalDropdownState) window.modalDropdownState = {};
                    
                    window.modalChangedInSession[modalKey] = false;
                    window.modalInitialState[modalKey] = {};
                    window.modalDropdownState[modalKey] = {};
                    
                    // Capture initial states for change detection
                    $modal.find('select[data-param]').each(function() {
                        const paramKey = $(this).data('param');
                        window.modalDropdownState[modalKey][paramKey] = $(this).val() || '';
                        window.modalInitialState[modalKey][paramKey] = window.metrics?.[paramKey] || '';
                    });
                }
            } else {
                console.error('[v5.5] openModalByKey not available');
            }
        });
        
        // Exclude button - use unified toggle function or reset triggered section
        $reportTextarea.off('click', '.inline-exclude-button').on('click', '.inline-exclude-button', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const modalKey = $(this).data('modal');
            
            // Check if this is a reset-trigger-button (for triggered sections)
            if ($(this).hasClass('reset-trigger-button')) {
                // Reset the triggered section
                if (typeof window.resetTriggeredModal === 'function') {
                    window.resetTriggeredModal(modalKey);
                }
            } else {
                // Use unified toggle function for normal sections
                toggleModalExclusion(modalKey);
            }
        });
        
        // [v5.1] Protect buttons using MutationObserver
        // If buttons get deleted by any means, restore them by re-rendering
        setupButtonProtection($reportTextarea[0]);
        
        // [v5.5] Setup right-click context menu for parameter options
        setupParameterContextMenu($reportTextarea);
    }
    
    // [v5.1] MutationObserver to protect buttons from deletion
    function setupButtonProtection(textarea) {
        // Disconnect existing observer if any
        if (buttonProtectionObserver) {
            buttonProtectionObserver.disconnect();
        }
        
        // Count expected buttons based on options config
        expectedButtonCount = 0;
        if (window.options && Array.isArray(window.options)) {
            window.options.forEach(section => {
                if (section.modalKey) {
                    // Check if section is hidden
                    const isHidden = window.hiddenModals && window.hiddenModals[section.modalKey];
                    if (!isHidden) {
                        expectedButtonCount++;
                    }
                }
            });
        }
        
        // Create observer
        buttonProtectionObserver = new MutationObserver((mutations) => {
            // Skip if we're currently restoring buttons (prevent infinite loop)
            if (isRestoringButtons) return;
            
            // Count current button groups
            const currentButtonCount = textarea.querySelectorAll('.inline-button-group').length;
            
            // If buttons were removed, restore them
            if (currentButtonCount < expectedButtonCount) {
                console.log(`[ButtonProtection] Buttons removed (${currentButtonCount}/${expectedButtonCount}), restoring...`);
                isRestoringButtons = true;
                
                // Save cursor position before restoration
                const savedCursor = saveCursorPosition(textarea);
                
                // Use setTimeout to allow the current mutation to complete
                setTimeout(() => {
                    if (typeof updateReportTextarea === 'function') {
                        updateReportTextarea();
                    }
                    
                    // Restore cursor position after re-render
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
        
        // [v5.1] Prevent cursor from entering buttons via selection change
        setupCursorProtection(textarea);
    }
    
    // [v5.1] Save cursor position relative to text content
    function saveCursorPosition(textarea) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;
        
        const range = selection.getRangeAt(0);
        
        // Calculate text offset from start of textarea
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(textarea);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        
        // Get text content up to cursor, excluding button text
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(preCaretRange.cloneContents());
        
        // Remove button groups from the clone to get accurate text position
        tempDiv.querySelectorAll('.inline-button-group').forEach(el => el.remove());
        
        const textOffset = tempDiv.textContent.length;
        
        return {
            textOffset: textOffset,
            collapsed: range.collapsed
        };
    }
    
    // [v5.1] Restore cursor position based on saved text offset
    function restoreCursorPosition(textarea, savedCursor) {
        if (!savedCursor) return;
        
        const selection = window.getSelection();
        const range = document.createRange();
        
        // Walk through text nodes to find the right position
        let currentOffset = 0;
        let targetNode = null;
        let targetOffset = 0;
        
        function walkNodes(node) {
            if (targetNode) return; // Already found
            
            if (node.nodeType === Node.TEXT_NODE) {
                const nodeLength = node.textContent.length;
                if (currentOffset + nodeLength >= savedCursor.textOffset) {
                    targetNode = node;
                    targetOffset = savedCursor.textOffset - currentOffset;
                    return;
                }
                currentOffset += nodeLength;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Skip button groups
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
    
    // [v5.1] Prevent cursor from entering button elements
    function setupCursorProtection(textarea) {
        // Use selectionchange to detect cursor entering buttons
        document.addEventListener('selectionchange', function() {
            // Skip during restoration or if already fixing cursor
            if (isRestoringButtons || isFixingCursor) return;
            
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            
            // Check if cursor is inside a button group
            const buttonGroup = node.nodeType === Node.ELEMENT_NODE 
                ? node.closest('.inline-button-group')
                : node.parentElement?.closest('.inline-button-group');
            
            if (buttonGroup && textarea.contains(buttonGroup)) {
                isFixingCursor = true;
                
                // Move cursor after the button group
                const newRange = document.createRange();
                
                // Find next valid position after button group
                let nextNode = buttonGroup.nextSibling;
                
                // If next sibling is a text node, position at start
                if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
                    newRange.setStart(nextNode, 0);
                } else if (nextNode && nextNode.nodeType === Node.ELEMENT_NODE) {
                    // Position at start of next element
                    newRange.setStartBefore(nextNode);
                } else {
                    // No next sibling, position after button group
                    newRange.setStartAfter(buttonGroup);
                }
                
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
                
                // Reset flag after a short delay
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
        
        // Find the first measurement section header with matching data-section attribute
        const $targetSection = $(`#measurements-table tr[data-section~="${modalKey}"]`).first();
        
        if ($targetSection.length) {
            const $measurementsPanel = $('#measurements-panel');
            if ($measurementsPanel.length) {
                // Get the position of the target section relative to the measurements table
                const targetOffset = $targetSection.offset().top;
                const panelOffset = $measurementsPanel.offset().top;
                const currentScroll = $measurementsPanel.scrollTop();
                
                // Calculate the scroll position with extra offset
                const scrollPosition = currentScroll + (targetOffset - panelOffset) - 60;
                
                // Smooth scroll to the target
                $measurementsPanel.animate({
                    scrollTop: scrollPosition
                }, 300);
            }
        }
    }
    
    // ============================================================================
    // [v5.5] PARAMETER CONTEXT MENU
    // Right-click on parameter text to show dropdown options
    // ============================================================================
    
    let $contextMenu = null;
    
    /**
     * Setup right-click context menu for parameter options
     * @param {jQuery} $reportTextarea - The contenteditable element
     */
    function setupParameterContextMenu($reportTextarea) {
        // Create context menu element if it doesn't exist
        if (!$contextMenu) {
            $contextMenu = $('<ul id="param-context-menu" class="param-context-menu"></ul>');
            $('body').append($contextMenu);
        }
        
        // Right-click handler
        $reportTextarea.on('contextmenu', function(e) {
            const $target = $(e.target);
            const $paramSpan = $target.closest('[data-param]');
            
            // Only handle if clicking on a parameter span
            if (!$paramSpan.length) {
                hideContextMenu();
                return; // Allow default context menu
            }
            
            const paramKey = $paramSpan.data('param');
            const paramConfig = window.parameters?.[paramKey];
            
            // No config found - allow default
            if (!paramConfig) {
                hideContextMenu();
                return;
            }
            
            // Check if parameter is in an excluded section
            const modalKeys = getModalKeysForParam(paramKey);
            const isExcluded = modalKeys.some(mk => excludedModals[mk] || (window.hiddenModals && window.hiddenModals[mk]));
            if (isExcluded) {
                hideContextMenu();
                return; // No action for excluded parameters
            }
            
            // [v5.5] TODO: custom: true is deprecated - flag for future cleanup
            // Skip context menu for custom: true params
            if (paramConfig.custom === true) {
                hideContextMenu();
                return;
            }
            
            // Handle customtext - select text for manual editing
            if (paramConfig.options === "customtext") {
                e.preventDefault();
                hideContextMenu();
                selectParameterText($paramSpan[0]);
                return;
            }
            
            // Must have array options to show menu
            if (!paramConfig.options || !Array.isArray(paramConfig.options)) {
                hideContextMenu();
                return;
            }
            
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, paramKey, paramConfig, $paramSpan[0]);
        });
        
        // Click outside to close
        $(document).on('click', function(e) {
            if (!$(e.target).closest('#param-context-menu').length) {
                hideContextMenu();
            }
        });
        
        // Escape to close
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                hideContextMenu();
            }
        });
        
        // Scroll to close
        $reportTextarea.on('scroll', hideContextMenu);
        $(window).on('scroll', hideContextMenu);
    }
    
    /**
     * Show context menu with parameter options
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} paramKey - Parameter key
     * @param {object} paramConfig - Parameter configuration
     * @param {HTMLElement} paramSpan - The span element that was clicked
     */
    function showContextMenu(x, y, paramKey, paramConfig, paramSpan) {
        const currentValue = metrics[paramKey] || '';
        
        // Check if custom text is allowed for this parameter
        const allowsCustomText = paramConfig.customText !== false;
        
        // Build menu items
        let menuHtml = '';
        
        // Add custom text option at top if allowed
        if (allowsCustomText) {
            menuHtml += `<li class="context-menu-item context-menu-custom" data-param="${paramKey}" data-action="custom">(custom text)</li>`;
            menuHtml += `<li class="context-menu-separator"></li>`;
        }
        
        paramConfig.options.forEach((opt, index) => {
            const isString = typeof opt === 'string';
            const label = isString ? opt : (opt.label || opt.title);
            const title = isString ? opt : opt.title;
            const isSelected = title === currentValue;
            const selectedClass = isSelected ? ' selected' : '';
            
            menuHtml += `<li class="context-menu-item${selectedClass}" data-param="${paramKey}" data-index="${index}" data-value="${title.replace(/"/g, '&quot;')}">${label}</li>`;
        });
        
        $contextMenu.html(menuHtml);
        
        // Position menu
        $contextMenu.css({
            display: 'block',
            left: x + 'px',
            top: y + 'px'
        });
        
        // Adjust if overflowing viewport
        const menuRect = $contextMenu[0].getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (menuRect.right > viewportWidth) {
            $contextMenu.css('left', (x - menuRect.width) + 'px');
        }
        if (menuRect.bottom > viewportHeight) {
            $contextMenu.css('top', (y - menuRect.height) + 'px');
        }
        
        // Setup click handler for custom text option
        $contextMenu.find('.context-menu-custom').off('click').on('click', function() {
            hideContextMenu();
            selectParameterText(paramSpan);
        });
        
        // Setup click handlers for regular menu items
        $contextMenu.find('.context-menu-item:not(.context-menu-custom)').off('click').on('click', function() {
            const paramKey = $(this).data('param');
            const selectedValue = $(this).data('value');
            const selectedIndex = $(this).data('index');
            
            handleContextMenuSelection(paramKey, selectedValue, selectedIndex);
            hideContextMenu();
        });
    }
    
    /**
     * Hide the context menu
     */
    function hideContextMenu() {
        if ($contextMenu) {
            $contextMenu.css('display', 'none');
        }
    }
    
    /**
     * Handle selection from context menu
     */
    function handleContextMenuSelection(paramKey, selectedValue, selectedIndex) {
        const paramConfig = window.parameters?.[paramKey];
        if (!paramConfig) return;
        
        // Get the full option object
        const selectedOption = paramConfig.options[selectedIndex];
        const isObjectOption = typeof selectedOption === 'object';
        
        // Get label for threshold checking
        const selectedLabel = isObjectOption ? (selectedOption.label || selectedOption.title) : selectedOption;
        
        // Determine state: default or selected
        const state = (isObjectOption && selectedOption.default === true) ? 'default' : 'selected';
        
        // Update metrics
        metrics[paramKey] = selectedValue;
        
        // [v5.5] Update variable registry
        if (typeof updateRegistryValue === 'function') {
            updateRegistryValue(paramKey, selectedValue, state);
        }
        
        // Update selectedOptions with the full option object
        if (isObjectOption) {
            selectedOptions[paramKey] = selectedOption;
        } else {
            selectedOptions[paramKey] = { title: selectedOption };
        }
        
        // Clear manual edit flag if it was set
        if (window.manuallyEditedParams && window.manuallyEditedParams[paramKey]) {
            delete window.manuallyEditedParams[paramKey];
        }
        
        // ========================================================================
        // Handle triggerModal - show/hide sections based on selection
        // ========================================================================
        const currentTriggerSection = isObjectOption && selectedOption.triggerModal ? selectedOption.triggerModal : null;
        
        // Check if ANY option in this parameter has a triggerModal
        let paramTriggersSections = [];
        if (paramConfig.options && Array.isArray(paramConfig.options)) {
            paramConfig.options.forEach(opt => {
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
                const wasVisible = !hiddenModals[triggeredSectionKey];
                
                hiddenModals[triggeredSectionKey] = true;
                excludedModals[triggeredSectionKey] = true;
                triggeredModals[triggeredSectionKey] = false;
                
                if (wasVisible) {
                    sectionsWereHidden = true;
                }
            }
        });
        
        // Trigger the currently selected section (if any)
        if (currentTriggerSection && typeof triggerModal === 'function') {
            console.log('[ContextMenu] Calling triggerModal for section:', currentTriggerSection);
            triggerModal(currentTriggerSection);
        }
        
        // ========================================================================
        // Handle summary checkbox auto-check/uncheck
        // [v5.5] Update registry directly (modal may not exist in DOM)
        // ========================================================================
        if (paramConfig.enableSummary) {
            const shouldCheck = determineContextMenuCheckboxState(selectedOption, selectedLabel, paramConfig, selectedValue);
            
            // Update registry directly
            if (typeof setRegistrySummaryChecked === 'function') {
                setRegistrySummaryChecked(paramKey, shouldCheck);
            }
            
            // Handle summaryExclude
            if (shouldCheck) {
                handleContextMenuSummaryExclude(paramKey, paramConfig);
            } else {
                handleContextMenuSummaryRestore(paramKey, paramConfig);
            }
        }
        
        // ========================================================================
        // Update display
        // ========================================================================
        if (typeof updateSummary === 'function') {
            updateSummary();
        }
        
        // Use appropriate update strategy
        if (sectionsWereHidden && typeof updateReportTextarea === 'function') {
            console.log('[ContextMenu] Calling updateReportTextarea because sectionsWereHidden');
            updateReportTextarea();
        } else if (typeof updateChangedParameters === 'function') {
            console.log('[ContextMenu] Using granular updateChangedParameters for:', paramKey);
            updateChangedParameters([paramKey]);
            // Also update Summary since parameter changes affect it
            updateChangedParameters(['Summary']);
        }
    }
    
    /**
     * Determine if summary checkbox should be checked (context menu version)
     * Mirrors logic from script-form.js determineCheckboxState
     */
    function determineContextMenuCheckboxState(selectedOption, selectedLabel, paramConfig, selectedValue) {
        const isObjectOption = typeof selectedOption === 'object';
        
        // If this is the default option, check based on summaryDefault
        if (isObjectOption && selectedOption.default === true) {
            return paramConfig.summaryDefault === true;
        }
        // If summaryThreshold exists, check only labels against threshold
        if (paramConfig.summaryThreshold && Array.isArray(paramConfig.summaryThreshold) && selectedLabel) {
            return paramConfig.summaryThreshold.includes(selectedLabel);
        }
        // If summaryNotThreshold exists, check all labels EXCEPT those in the list
        if (paramConfig.summaryNotThreshold && Array.isArray(paramConfig.summaryNotThreshold) && selectedLabel) {
            return !paramConfig.summaryNotThreshold.includes(selectedLabel);
        }
        // If summaryOnChange is true, check for any non-default selection
        if (paramConfig.summaryOnChange === true && isObjectOption && selectedOption.default !== true) {
            return true;
        }
        // If none of the above, but summaryDefault is true, keep it checked
        if (paramConfig.summaryDefault === true && selectedValue !== "") {
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle summary exclude logic (context menu version)
     * Updates registry directly since modal may not be in DOM
     */
    function handleContextMenuSummaryExclude(paramKey, paramConfig) {
        if (paramConfig.summaryExclude && Array.isArray(paramConfig.summaryExclude)) {
            paramConfig.summaryExclude.forEach(excludeKey => {
                // Check if currently checked in registry
                const isCurrentlyChecked = typeof getRegistrySummaryChecked === 'function' 
                    ? getRegistrySummaryChecked(excludeKey) 
                    : false;
                
                if (isCurrentlyChecked) {
                    // Uncheck in registry
                    if (typeof setRegistrySummaryChecked === 'function') {
                        setRegistrySummaryChecked(excludeKey, false);
                    }
                    
                    if (summaryCheckboxManuallyEdited) {
                        summaryCheckboxManuallyEdited[excludeKey] = true;
                    }
                }
            });
        }
    }
    
    /**
     * Handle summary restore logic (context menu version)
     * Re-checks excluded items if no other excluders are active
     */
    function handleContextMenuSummaryRestore(paramKey, paramConfig) {
        if (!paramConfig.summaryExclude || !Array.isArray(paramConfig.summaryExclude)) return;
        
        paramConfig.summaryExclude.forEach(excludeKey => {
            // Check if any OTHER parameters that also exclude this key are currently checked
            let otherExcludersChecked = false;
            
            if (window.options && Array.isArray(window.options)) {
                window.options.forEach(section => {
                    if (!section.variables || otherExcludersChecked) return;
                    
                    section.variables.forEach(otherVarKey => {
                        if (otherVarKey === paramKey || otherExcludersChecked) return;
                        
                        const otherParamConfig = window.parameters?.[otherVarKey];
                        if (!otherParamConfig) return;
                        
                        if (otherParamConfig.summaryExclude && 
                            Array.isArray(otherParamConfig.summaryExclude) && 
                            otherParamConfig.summaryExclude.includes(excludeKey)) {
                            
                            const isOtherChecked = typeof getRegistrySummaryChecked === 'function'
                                ? getRegistrySummaryChecked(otherVarKey)
                                : false;
                            
                            if (isOtherChecked) {
                                otherExcludersChecked = true;
                            }
                        }
                    });
                });
            }
            
            // If no other excluders are checked, restore this item based on its default
            if (!otherExcludersChecked) {
                const excludeParamConfig = window.parameters?.[excludeKey];
                if (excludeParamConfig && excludeParamConfig.summaryDefault === true) {
                    if (typeof setRegistrySummaryChecked === 'function') {
                        setRegistrySummaryChecked(excludeKey, true);
                    }
                }
            }
        });
    }
    
    /**
     * Select parameter text for manual editing (customtext params)
     */
    function selectParameterText(paramSpan) {
        const selection = window.getSelection();
        const range = document.createRange();
        
        // Select all text content within the param span
        range.selectNodeContents(paramSpan);
        
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
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
    
    // [v5.2] Variable Registry exports
    window.variableRegistry = variableRegistry;
    window.initializeVariableRegistry = initializeVariableRegistry;
    window.updateRegistryValue = updateRegistryValue;
    
    // [v5.42] New registry functions
    window.registerManualEdit = registerManualEdit;
    window.registerFixedText = registerFixedText;
    window.getModalKeysForParam = getModalKeysForParam;
    window.isParamExcluded = isParamExcluded;
    window.updateRegistryMeasurement = updateRegistryMeasurement;
    window.getRegistryEntry = getRegistryEntry;
    window.getRegistryValues = getRegistryValues;
    
    // [v5.43] Summary status registry functions
    window.getRegistrySummaryChecked = getRegistrySummaryChecked;
    window.setRegistrySummaryChecked = setRegistrySummaryChecked;
    
    // [v5.5] Registry value accessor functions
    window.getMeasurementValue = getMeasurementValue;
    window.getMeasurementWithUnit = getMeasurementWithUnit;
    window.getParamValue = getParamValue;
    window.setParamValue = setParamValue;
    
    // [v5.42] Measurement data exports (legacy compatibility)
    window.results = results;  // Parsed measurement values
    window.getParseConfigMap = function() { return parseConfigMap; };  // Measurement metadata
    
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
    
    // ============================================================================
    // CLIPBOARD - SIMPLIFIED (v5.1)
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
        
        // Remove button groups (edit/exclude buttons) from the clone
        $clone.find('.inline-button-group').remove();
        
        // [v5.4] Process param-block spans: CSS adds line breaks via ::before
        // Convert CSS-generated line breaks to actual line breaks in HTML
        $clone.find('.param-block:not(.block-empty)').each(function() {
            // Insert an actual line break before non-empty param-blocks
            // This replicates the CSS ::before { content: "\A"; } effect
            $(this).before('\n');
        });
        
        // Get the visible text content from the cleaned clone
        // innerText preserves visual line breaks and excludes hidden elements
        const textContent = $clone[0].innerText;
        
        // Clean up excessive whitespace
        const cleanedText = textContent
            .replace(/\n{3,}/g, '\n\n')  // Replace 3+ newlines with 2
            .trim();                       // Remove leading/trailing whitespace
        
        // Copy to clipboard
        navigator.clipboard.writeText(cleanedText).then(() => {
            // Show success feedback
            const originalText = $(this).html();
            $(this).html("Copied!");
            setTimeout(() => $(this).html(originalText), 2000);
        }).catch(err => {
            console.error('Failed to copy to clipboard:', err);
            alert('Failed to copy to clipboard. Please try again.');
        });
    });
});