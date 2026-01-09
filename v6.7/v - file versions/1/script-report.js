/* jshint loopfunc: true, esversion: 11 */
/* EchoTools v6.7 - Summary Span Architecture with Granular Updates */

jQuery(document).ready(function () {
    // Show the options section
    $("#options").show();
    
    // Clear the import modal textarea on page load
    $("#report").val("");
    
    // ============================================================================
    // CENTRAL VARIABLE REGISTRY (v6.7)
    // ============================================================================
    
    const registry = {};
    
    // ID counters
    let spanIdCounter = 0;
    let fixedTextCounter = 0;
    let manualEditCounter = 0;
    let summaryLineBreakCounter = 0;
    
    // Configuration storage
    let parseConfig = [];
    let parseConfigMap = {};
    let measurements = [];
    let parameters = {};
    let options = [];
    
    // ============================================================================
    // MULTIPLE OPTIONS FILES TRACKING (v6.5)
    // ============================================================================
    
    // Tracks the loaded options files and which modals belong to which file
    // Structure: [{ file: 'opt-r-modals.js', modals: ['mLV', 'mMV', ...] }, ...]
    let optionsFiles = [];
    
    // Map of modalKey -> fileIndex for quick lookup
    const modalToFileIndex = {};
    
    // Modal/section state tracking
    const selectedOptions = {};
    
    // State flags
    let isUpdatingSpans = false;
    let preprocessedOutputTemplate = null;
    let reportConfigLoaded = false;
    let summaryManuallyEdited = false;
    
    // Calculation tracking
    let calculatedHandles = new Set();
    
    // ============================================================================
    // REGISTRY CORE FUNCTIONS
    // ============================================================================
    
    function generateSpanId() {
        return `span-${++spanIdCounter}`;
    }
    
    function getRegistryEntry(handle) {
        return registry[handle] || null;
    }
    
    function setRegistryValue(handle, value, status = 'clean') {
        if (!registry[handle]) {
            registry[handle] = {
                type: 'unknown',
                value: '',
                status: 'clean',
                spanIds: []
            };
        }
        registry[handle].value = value;
        if (status) {
            registry[handle].status = status;
        }
    }
    
    function getMeasurementValue(handle) {
        const entry = registry[handle];
        return entry && entry.type === 'measurement' ? entry.value : '';
    }
    
    function getMeasurementWithUnit(handle) {
        const entry = registry[handle];
        if (!entry || entry.type !== 'measurement' || !entry.value) return '';
        return entry.unit ? `${entry.value}${entry.unit}` : entry.value;
    }
    
    function setMeasurementValue(handle, rawValue, status = 'clean', updateUI = true) {
        if (!registry[handle]) {
            let config = parseConfigMap[handle];
            if (!config && window.manualConfig) {
                config = window.manualConfig.find(m => m.handle === handle);
            }
            registry[handle] = {
                type: 'measurement',
                value: '',
                unit: config?.unit || '',
                status: 'clean',
                spanIds: []
            };
        }
        
        registry[handle].value = rawValue || '';
        registry[handle].status = status;
        
        if (updateUI) {
            updateSpansForHandle(handle);
            updateMeasurementTableCell(handle);
            updateOpenModalsForHandle(handle);
            // Update any parameters that reference this measurement via handlebars
            updateParametersWithEmbeddedHandlebars();
        }
        
        // Run calculations reactively when measurements change
        // Use setTimeout to batch multiple rapid changes
        scheduleCalculations();
    }
    
    function getParamValue(handle) {
        const entry = registry[handle];
        return entry ? entry.value : '';
    }
    
    function setParamValue(handle, value, status = 'clean', updateUI = true) {
        if (!registry[handle]) {
            registry[handle] = {
                type: 'parameter',
                value: '',
                checked: false,
                summarystring: '',
                status: 'clean',
                spanIds: []
            };
        }
        
        registry[handle].value = value || '';
        registry[handle].status = status;
        
        if (updateUI) {
            updateSpansForHandle(handle);
            updateOpenModalsForHandle(handle);
        }
    }
    
    function getParameterChecked(handle) {
        const entry = registry[handle];
        return entry && entry.checked === true;
    }
    
    function setParameterChecked(handle, isChecked, updateUI = true) {
        if (registry[handle]) {
            registry[handle].checked = isChecked === true;
            
            if (updateUI) {
                updateCheckboxesForHandle(handle);
            }
        }
    }
    
    // ============================================================================
    // SUMMARYSTRING HELPERS (v6.7)
    // ============================================================================
    
    /**
     * Get the summarystring value for a parameter
     */
    function getSummaryString(handle) {
        const entry = registry[handle];
        return entry?.summarystring || '';
    }
    
    /**
     * Set the summarystring value for a parameter
     */
    function setSummaryString(handle, value) {
        if (registry[handle]) {
            registry[handle].summarystring = value || '';
        }
    }
    
    /**
     * Parse summaryOrder into line and position components
     * Handles both integer (5 -> {line: 5, position: 0}) and decimal (5.2 -> {line: 5, position: 2})
     */
    function parseSummaryOrder(order) {
        if (order === undefined || order === null) {
            return { line: 100, position: 0 };
        }
        
        const orderNum = parseFloat(order);
        if (isNaN(orderNum)) {
            return { line: 100, position: 0 };
        }
        
        const line = Math.floor(orderNum);
        // Extract decimal part as position (e.g., 3.2 -> position 2)
        const decimalPart = orderNum - line;
        const position = Math.round(decimalPart * 10);
        
        return { line, position };
    }
    
    /**
     * Get the text to use for a parameter's summary entry
     * Priority: summarytext (from selected option) -> title -> paramValue
     */
    function getSummaryTextForParam(handle) {
        const entry = registry[handle];
        if (!entry) return '';
        
        const paramConfig = window.parameters?.[handle];
        if (!paramConfig) return entry.value || '';
        
        const paramValue = entry.value || '';
        let textToUse = paramValue;
        
        // Check if there's a summarytext for the selected option
        if (paramConfig.options && Array.isArray(paramConfig.options)) {
            const selectedOpt = paramConfig.options.find(opt => {
                const title = typeof opt === 'string' ? opt : opt.title;
                return title === paramValue;
            }) || selectedOptions[handle];
            
            if (selectedOpt && typeof selectedOpt !== 'string' && selectedOpt.summarytext) {
                textToUse = selectedOpt.summarytext;
            }
        } else if (paramConfig.summarytext) {
            // For customtext fields with summarytext at parameter level
            textToUse = paramConfig.summarytext;
        }
        
        return textToUse;
    }
    
    // ============================================================================
    // FIXED TEXT AND MANUAL EDIT REGISTRATION
    // ============================================================================
    
    function registerFixedText(value, fieldName = '') {
        const handle = `fixed-${++fixedTextCounter}`;
        registry[handle] = {
            type: 'fixed-text',
            value: value,
            status: 'clean',
            fieldName: fieldName,
            spanIds: []
        };
        return handle;
    }
    
    function registerManualEdit(value) {
        const handle = `manual-${++manualEditCounter}`;
        registry[handle] = {
            type: 'manual',
            value: value,
            status: 'dirty',
            spanIds: []
        };
        return handle;
    }
    
    function registerSummaryLineBreak() {
        const handle = `summary-lb-${++summaryLineBreakCounter}`;
        registry[handle] = {
            type: 'summary-linebreak',
            value: '\n',
            status: 'clean',
            spanIds: []
        };
        return handle;
    }
    
    function addSpanIdToRegistry(handle, spanId) {
        if (registry[handle]) {
            if (!registry[handle].spanIds) {
                registry[handle].spanIds = [];
            }
            if (!registry[handle].spanIds.includes(spanId)) {
                registry[handle].spanIds.push(spanId);
            }
        }
    }
    
    function removeSpanIdFromRegistry(handle, spanId) {
        if (registry[handle] && registry[handle].spanIds) {
            const index = registry[handle].spanIds.indexOf(spanId);
            if (index > -1) {
                registry[handle].spanIds.splice(index, 1);
            }
        }
    }
    
    // ============================================================================
    // SPAN UPDATE FUNCTIONS
    // ============================================================================
    
    /**
     * Process handlebars in a value string using current registry measurements
     */
    function processHandlebarsValue(value) {
        if (typeof value !== 'string' || !value.includes('{{')) {
            return value;
        }
        
        try {
            const resultsWithUnits = prepareResultsWithUnits();
            const template = Handlebars.compile(value, { noEscape: true });
            return template(resultsWithUnits);
        } catch (e) {
            console.warn('[v6.7] Failed to process handlebars:', e);
            return value;
        }
    }
    
    /**
     * Get the display value for a registry entry, processing handlebars if needed
     */
    function getDisplayValueForEntry(entry) {
        if (!entry) return '';
        
        let displayValue = entry.value || '';
        
        // Process handlebars for parameters
        if (entry.type === 'parameter' && typeof displayValue === 'string' && displayValue.includes('{{')) {
            displayValue = processHandlebarsValue(displayValue);
        }
        
        // Add unit for measurements
        if (entry.type === 'measurement' && entry.unit && entry.value) {
            displayValue = `${entry.value}${entry.unit}`;
        }
        
        return displayValue;
    }
    
    function updateSpansForHandle(handle, excludeSpanId = null) {
        const entry = registry[handle];
        if (!entry) return;
        
        const $textarea = $('#report-textarea');
        if (!$textarea.length) return;
        
        const wasUpdating = isUpdatingSpans;
        isUpdatingSpans = true;
        
        const $spans = $textarea.find(`[data-handle="${handle}"]`);
        
        $spans.each(function() {
            const $span = $(this);
            const spanId = $span.attr('data-id');
            const spanType = $span.attr('data-type');
            
            if (excludeSpanId && spanId === excludeSpanId) {
                return;
            }
            
            // For summarystring spans, use the summarystring value
            let displayValue;
            if (spanType === 'summarystring') {
                displayValue = entry.summarystring || '';
            } else {
                displayValue = getDisplayValueForEntry(entry);
            }
            
            $span.text(displayValue || '');
            $span.attr('data-status', entry.status);
            updateSpanColorClass($span, spanType, entry.status);
        });
        
        isUpdatingSpans = wasUpdating;
    }
    
    function updateSpanColorClass($span, type, status) {
        $span.removeClass('span-clean-measurement span-clean-parameter span-clean-fixed span-clean-summarystring span-dirty span-auto span-unknown');
        
        if (status === 'dirty') {
            $span.addClass('span-dirty');
        } else if (status === 'auto') {
            $span.addClass('span-auto');
        } else {
            switch (type) {
                case 'measurement':
                    $span.addClass('span-clean-measurement');
                    break;
                case 'parameter':
                    $span.addClass('span-clean-parameter');
                    break;
                case 'fixed-text':
                case 'summary-linebreak':
                    $span.addClass('span-clean-fixed');
                    break;
                case 'summarystring':
                    $span.addClass('span-clean-summarystring');
                    break;
                default:
                    $span.addClass('span-unknown');
            }
        }
    }
    
    function updateMeasurementTableCell(handle) {
        const entry = registry[handle];
        if (!entry || entry.type !== 'measurement') return;
        
        const $input = $(`.measurement-input[data-handle="${handle}"]`);
        if ($input.length && $input.val() !== entry.value) {
            $input.val(entry.value);
        }
    }
    
    /**
     * Update all parameters that contain embedded handlebars
     * Called when measurements change to ensure parameter displays are updated
     */
    function updateParametersWithEmbeddedHandlebars() {
        const $textarea = $('#report-textarea');
        if (!$textarea.length) return;
        
        const wasUpdating = isUpdatingSpans;
        isUpdatingSpans = true;
        
        // Find all parameters that contain handlebars in their value
        Object.entries(registry).forEach(([handle, entry]) => {
            if (entry.type === 'parameter' && 
                typeof entry.value === 'string' && 
                entry.value.includes('{{')) {
                
                // Update spans for this parameter with newly processed handlebars
                const displayValue = getDisplayValueForEntry(entry);
                
                const $spans = $textarea.find(`[data-handle="${handle}"][data-type="parameter"]`);
                $spans.each(function() {
                    $(this).text(displayValue || '');
                });
                
                // Also update any param blocks
                const $block = $textarea.find(`.param-block[data-block-param="${handle}"]`);
                if ($block.length) {
                    $block.toggleClass('block-empty', !displayValue || !displayValue.trim());
                }
            }
        });
        
        // Also update summarystrings that may contain handlebars
        updateSummaryStringsWithHandlebars();
        
        isUpdatingSpans = wasUpdating;
    }
    
    /**
     * Update summarystring spans that contain handlebars
     */
    function updateSummaryStringsWithHandlebars() {
        const $textarea = $('#report-textarea');
        if (!$textarea.length) return;
        
        const resultsWithUnits = prepareResultsWithUnits();
        
        $textarea.find('[data-type="summarystring"]').each(function() {
            const $span = $(this);
            const handle = $span.attr('data-handle');
            const entry = registry[handle];
            
            if (!entry || !entry.checked) return;
            
            // Get the raw summarystring and process handlebars if needed
            let rawText = getSummaryTextForParam(handle);
            if (rawText && rawText.includes('{{')) {
                try {
                    const template = Handlebars.compile(rawText, { noEscape: true });
                    rawText = template(resultsWithUnits);
                } catch (e) {
                    console.warn(`[v6.7] Failed to process summarystring handlebars for ${handle}:`, e);
                }
            }
            
            // Update if changed
            if (entry.summarystring !== rawText) {
                entry.summarystring = rawText;
                $span.text(rawText);
            }
        });
    }
    
    /**
     * Update any open modals when registry value changes
     * This ensures real-time cascade across all UI elements
     */
    function updateOpenModalsForHandle(handle) {
        const entry = registry[handle];
        if (!entry) return;
        
        // Find any active/open modals
        const $activeModals = $('.modal-overlay.active');
        if (!$activeModals.length) return;
        
        $activeModals.each(function() {
            const $modal = $(this);
            
            if (entry.type === 'measurement') {
                // Update measurement inputs in modal
                const $input = $modal.find(`.modal-measurement-input[data-measurement="${handle}"]`);
                if ($input.length && $input.val() !== entry.value) {
                    $input.val(entry.value || '');
                }
            } else if (entry.type === 'parameter') {
                // Update parameter selects in modal
                const $select = $modal.find(`.modal-select[data-param="${handle}"]`);
                if ($select.length && $select.val() !== entry.value) {
                    $select.val(entry.value || '');
                }
                
                // Update parameter textareas in modal
                const $textarea = $modal.find(`.modal-textarea[data-param="${handle}"]`);
                if ($textarea.length && $textarea.val() !== entry.value) {
                    $textarea.val(entry.value || '');
                }
                
                // Update custom textareas if visible
                const $customTextarea = $modal.find(`.modal-custom-textarea[data-param="${handle}"]`);
                if ($customTextarea.length && $customTextarea.is(':visible') && $customTextarea.val() !== entry.value) {
                    $customTextarea.val(entry.value || '');
                }
                
                // Update summary checkboxes in modal
                const $checkbox = $modal.find(`.modal-summary-checkbox[data-param="${handle}"]`);
                if ($checkbox.length) {
                    $checkbox.prop('checked', entry.checked === true);
                }
            }
        });
    }
    
    /**
     * Update all checkbox UI elements for a parameter from registry
     */
    function updateCheckboxesForHandle(handle) {
        const entry = registry[handle];
        if (!entry) return;
        
        const isChecked = entry.checked === true;
        
        // Update main form checkbox
        const $mainCheckbox = $(`.summary-checkbox[data-param="${handle}"]`);
        if ($mainCheckbox.length) {
            $mainCheckbox.prop('checked', isChecked);
        }
        
        // Update modal checkboxes (in any open modal)
        const $modalCheckbox = $(`.modal-summary-checkbox[data-param="${handle}"]`);
        if ($modalCheckbox.length) {
            $modalCheckbox.prop('checked', isChecked);
        }
    }
    
    // ============================================================================
    // MODAL HELPERS
    // ============================================================================
    
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
    
    function extractModalVariables(modalKey) {
        const variables = [];
        
        if (options && Array.isArray(options)) {
            options.forEach(section => {
                if (section.modalKey === modalKey && section.variables) {
                    section.variables.forEach(v => {
                        if (!variables.includes(v)) {
                            variables.push(v);
                        }
                    });
                }
            });
        }
        
        return variables;
    }
    
    // ============================================================================
    // REGISTRY INITIALIZATION
    // ============================================================================
    
    // Track manually edited calculations to skip auto-recalculation
    let manuallyEditedCalculations = new Set();
    
    function initializeRegistry() {
        Object.keys(registry).forEach(key => delete registry[key]);
        
        spanIdCounter = 0;
        fixedTextCounter = 0;
        manualEditCounter = 0;
        summaryLineBreakCounter = 0;
        preprocessedOutputTemplate = null;
        calculatedHandles.clear();
        manuallyEditedCalculations.clear();
        
        // Build set of calculated measurement handles
        if (typeof window.calculations === 'object' && window.calculations !== null) {
            Object.keys(window.calculations).forEach(key => {
                calculatedHandles.add(key);
            });
        }
        
        // =====================================================================
        // Register ALL measurements from parseConfig (primary source)
        // These are all possible measurements that can be imported
        // =====================================================================
        if (parseConfig && Array.isArray(parseConfig)) {
            parseConfig.forEach(config => {
                if (!config.handle || config.handle === '') return;
                
                registry[config.handle] = {
                    type: 'measurement',
                    value: '',
                    unit: config.unit || '',
                    status: 'clean',
                    spanIds: []
                };
            });
        }
        
        // =====================================================================
        // Register ALL measurements from manualConfig (additional manual entries)
        // These are measurements that can only be entered manually
        // =====================================================================
        if (window.manualConfig && Array.isArray(window.manualConfig)) {
            window.manualConfig.forEach(config => {
                if (!config.handle || config.handle === '') return;
                if (registry[config.handle]) return; // Skip if already registered from parseConfig
                
                registry[config.handle] = {
                    type: 'measurement',
                    value: '',
                    unit: config.unit || '',
                    status: 'clean',
                    spanIds: []
                };
            });
        }
        
        // =====================================================================
        // Register ALL calculated measurements
        // These are computed from other measurements
        // =====================================================================
        if (typeof window.calculations === 'object' && window.calculations !== null) {
            Object.keys(window.calculations).forEach(key => {
                if (registry[key]) return; // Skip if already registered
                
                // Try to get unit from parseConfigMap or manualConfig
                let unit = '';
                if (parseConfigMap[key]) {
                    unit = parseConfigMap[key].unit || '';
                } else if (window.manualConfig) {
                    const manualItem = window.manualConfig.find(m => m.handle === key);
                    if (manualItem) unit = manualItem.unit || '';
                }
                
                registry[key] = {
                    type: 'measurement',
                    value: '',
                    unit: unit,
                    status: 'clean',
                    spanIds: []
                };
            });
        }
        
        // =====================================================================
        // Register ALL parameters from window.parameters directly (v6.7)
        // Parameters exist in the registry regardless of whether they're assigned to a modal
        // Modals only provide UI for editing, not existence
        // Added: summarystring attribute for v6.7 summary architecture
        // =====================================================================
        if (window.parameters && typeof window.parameters === 'object') {
            Object.entries(window.parameters).forEach(([varKey, paramConfig]) => {
                if (registry[varKey]) return; // Skip if already registered (shouldn't happen)
                
                let defaultValue = '';
                if (paramConfig.options && Array.isArray(paramConfig.options)) {
                    // Find default option from dropdown options
                    const defaultOpt = paramConfig.options.find(o => 
                        typeof o !== 'string' && o.default
                    );
                    if (defaultOpt) {
                        defaultValue = defaultOpt.title || '';
                    }
                }
                // For customtext fields (options: "customtext"), default is empty string
                
                registry[varKey] = {
                    type: 'parameter',
                    value: defaultValue,
                    checked: paramConfig.enableSummary ? (paramConfig.summaryDefault === true) : false,
                    summarystring: '',  // v6.7: Initialize summarystring attribute
                    status: 'clean',
                    spanIds: []
                };
            });
        }
        
        // Register Summary anchor (v6.7)
        registry['Summary'] = {
            type: 'summary-anchor',
            value: '',
            status: 'clean',
            spanIds: []
        };
        
        console.log('[v6.7 Registry] Initialized with', Object.keys(registry).length, 'entries');
        console.log('[v6.7 Registry] From parseConfig:', parseConfig?.length || 0);
        console.log('[v6.7 Registry] From manualConfig:', window.manualConfig?.length || 0);
        console.log('[v6.7 Registry] Calculated handles:', Array.from(calculatedHandles));
    }
    
    // ============================================================================
    // TEMPLATE PREPROCESSING
    // ============================================================================
    
    function preprocessTemplate(templateHTML) {
        const variableRegex = /\{\{(~?)([a-zA-Z_][a-zA-Z0-9_]*)(~?)\}\}/g;
        
        return templateHTML.replace(variableRegex, (match, leadingTilde, varName, trailingTilde) => {
            if (['else', 'this', 'if', 'unless', 'each', 'with'].includes(varName)) {
                return match;
            }
            
            // Special handling for Summary - create anchor span (v6.7)
            if (varName === 'Summary') {
                const spanId = generateSpanId();
                addSpanIdToRegistry('Summary', spanId);
                return `<span data-type="summary-anchor" data-handle="Summary" data-id="${spanId}" data-status="clean" class="summary-anchor"></span>`;
            }
            
            const entry = registry[varName];
            
            if (entry) {
                const spanId = generateSpanId();
                addSpanIdToRegistry(varName, spanId);
                
                const type = entry.type;
                const status = entry.status || 'clean';
                
                let cssClass = 'span-unknown';
                if (status === 'dirty') {
                    cssClass = 'span-dirty';
                } else if (status === 'auto') {
                    cssClass = 'span-auto';
                } else {
                    switch (type) {
                        case 'measurement': cssClass = 'span-clean-measurement'; break;
                        case 'parameter': cssClass = 'span-clean-parameter'; break;
                        case 'fixed-text': cssClass = 'span-clean-fixed'; break;
                        case 'summarystring': cssClass = 'span-clean-summarystring'; break;
                    }
                }
                
                return `<span data-type="${type}" data-handle="${varName}" data-id="${spanId}" data-status="${status}" class="${cssClass}">{{${leadingTilde}${varName}${trailingTilde}}}</span>`;
            }
            
            return match;
        });
    }
    
    function getPreprocessedTemplate() {
        if (!preprocessedOutputTemplate && window.outputTemplateString) {
            const preprocessed = preprocessTemplate(window.outputTemplateString);
            preprocessedOutputTemplate = Handlebars.compile(preprocessed, { noEscape: true });
        }
        return preprocessedOutputTemplate || window.outputTemplate;
    }
    
    function clearPreprocessedTemplate() {
        preprocessedOutputTemplate = null;
    }
    
    // ============================================================================
    // PREPARE OUTPUT DATA
    // ============================================================================
    
    function prepareResultsWithUnits() {
        const resultsWithUnits = {};
        
        Object.entries(registry).forEach(([handle, entry]) => {
            if (entry.type === 'measurement') {
                if (entry.value && entry.unit) {
                    resultsWithUnits[handle] = `${entry.value}${entry.unit}`;
                } else {
                    resultsWithUnits[handle] = entry.value || '';
                }
            } else {
                resultsWithUnits[handle] = entry.value || '';
            }
        });
        
        return resultsWithUnits;
    }
    
    function prepareOutputData() {
        const resultsWithUnits = prepareResultsWithUnits();
        const processedData = {};
        
        Object.entries(registry).forEach(([handle, entry]) => {
            let value = entry.value || '';
            
            if (typeof value === 'string' && value.includes('{{')) {
                try {
                    const template = Handlebars.compile(value);
                    value = template(resultsWithUnits);
                } catch (e) {
                    console.warn(`[v6.7] Failed to process ${handle}:`, e);
                }
            }
            
            if (entry.type === 'measurement' && entry.unit && entry.value) {
                processedData[handle] = `${entry.value}${entry.unit}`;
            } else {
                processedData[handle] = value;
            }
        });
        
        // Summary is now built from spans, not a single value
        processedData['Summary'] = '';
        
        return processedData;
    }
    
    // ============================================================================
    // FIXED TEXT WRAPPING (DOM-based for proper nesting support)
    // ============================================================================
    
    /**
     * Wrap all text nodes that aren't inside variable/measurement spans as fixed-text spans.
     * Uses DOM parsing to properly handle nested structures like param-blocks.
     * 
     * Fixed text = any text in the template that is not a variable, measurement, or marker
     */
    function wrapRemainingTextAsFixedText(htmlString) {
        const container = document.createElement('div');
        container.innerHTML = htmlString;
        
        function processNode(node) {
            // Only process element nodes
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            
            // Don't recurse into these (they're already complete/protected):
            // - Spans with data-handle (variable/measurement/manual spans)
            // - Button groups
            // - Buttons
            if (node.tagName === 'SPAN' && node.hasAttribute('data-handle')) return;
            if (node.classList && node.classList.contains('inline-button-group')) return;
            if (node.tagName === 'BUTTON') return;
            
            // Process children - iterate over a copy since we'll modify the DOM
            const children = Array.from(node.childNodes);
            
            children.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.textContent;
                    // Only wrap text that has non-whitespace content
                    if (text && text.trim()) {
                        const handle = registerFixedText(text, '');
                        const spanId = generateSpanId();
                        addSpanIdToRegistry(handle, spanId);
                        
                        const span = document.createElement('span');
                        span.setAttribute('data-type', 'fixed-text');
                        span.setAttribute('data-handle', handle);
                        span.setAttribute('data-id', spanId);
                        span.setAttribute('data-status', 'clean');
                        span.className = 'span-clean-fixed';
                        span.textContent = text;
                        
                        node.replaceChild(span, child);
                    }
                    // Leave whitespace-only text nodes unwrapped for cleaner structure
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    // Recurse into child elements
                    processNode(child);
                }
            });
        }
        
        processNode(container);
        return container.innerHTML;
    }
    
    // ============================================================================
    // REPORT RENDERING
    // ============================================================================
    
    function updateReportTextarea() {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) {
            console.warn('[v6.7] ContentEditable textarea not found');
            return;
        }
        
        const data = prepareOutputData();
        
        let rawReport = '';
        try {
            const template = getPreprocessedTemplate();
            rawReport = template(data);
        } catch (e) {
            console.error('[v6.7] Error generating report:', e);
            return;
        }
        
        const processedReport = postProcessReport(rawReport, data);
        updateContentEditableHTML(processedReport);
        
        // Build summary spans after initial render (v6.7)
        buildSummarySpans();
        
        console.log('[v6.7] Report textarea updated (full render)');
    }
    
    function postProcessReport(reportHTML, data) {
        let processed = reportHTML;
        
        // Process if-blocks: <!--if:paramKey-->content<!--/if-->
        const ifBlockRegex = /\n?<!--if:(\w+)-->([\s\S]*?)<!--\/if-->/g;
        processed = processed.replace(ifBlockRegex, (match, paramKey, content) => {
            const paramValue = data[paramKey] || '';
            const isEmpty = !paramValue || paramValue.trim() === '';
            const emptyClass = isEmpty ? ' block-empty' : '';
            return `<span class="param-block${emptyClass}" data-block-param="${paramKey}">${content.trim()}</span>`;
        });
        
        // Process button placement: <!--button:modalKey-->
        if (window.options) {
            window.options.forEach(modalGroup => {
                const modalKey = modalGroup.modalKey;
                if (!modalKey) return;
                
                const buttonHTML = `<button type="button" class="inline-edit-button" data-modal="${modalKey}" title="Edit ${modalGroup.modalTitle || modalKey}">✎</button>`;
                const buttonGroup = `<span class="inline-button-group" contenteditable="false" data-modal="${modalKey}">${buttonHTML}</span>`;
                
                processed = processed.replace(new RegExp(`<!--button:${modalKey}-->`, 'g'), buttonGroup);
            });
        }
        
        // Clean up any unprocessed button markers
        processed = processed.replace(/<!--button:[^>]+-->/g, '');
        
        // Clean up empty lines (lines with only whitespace or empty spans)
        processed = processed
            .split('\n')
            .map(line => {
                // Preserve lines with param-blocks
                if (line.includes('param-block') || line.includes('data-block-param')) {
                    return line;
                }
                // Remove lines that are empty after stripping HTML tags
                const textOnly = line.replace(/<[^>]+>/g, '').trim();
                return textOnly === '' ? '' : line;
            })
            .join('\n')
            .replace(/\n{3,}/g, '\n\n');
        
        // Wrap all remaining text (not in variable spans) as fixed-text spans
        processed = wrapRemainingTextAsFixedText(processed);
        
        return processed;
    }
    
    function updateContentEditableHTML(newHTML) {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) {
            const $optionsPanel = $('#options-panel');
            if ($optionsPanel.length) {
                $optionsPanel.prepend('<div id="report-textarea" class="report-contenteditable" contenteditable="true"></div>');
            }
        }
        
        $('#report-textarea').html(newHTML);
    }
    
    function updateChangedParameters(changedHandles) {
        const $textarea = $('#report-textarea');
        if (!$textarea.length) return;
        
        isUpdatingSpans = true;
        
        const resultsWithUnits = prepareResultsWithUnits();
        
        changedHandles.forEach(handle => {
            const entry = registry[handle];
            if (!entry) return;
            
            let newValue = entry.value || '';
            
            if (typeof newValue === 'string' && newValue.includes('{{')) {
                try {
                    const template = Handlebars.compile(newValue);
                    newValue = template(resultsWithUnits);
                } catch (e) {
                    console.warn(`[v6.7] Failed to process ${handle}:`, e);
                }
            }
            
            const $spans = $textarea.find(`[data-handle="${handle}"][data-type="parameter"], [data-handle="${handle}"][data-type="measurement"]`);
            $spans.each(function() {
                let displayValue = newValue;
                if (entry.type === 'measurement' && entry.unit && newValue) {
                    displayValue = `${newValue}${entry.unit}`;
                }
                
                $(this).text(displayValue);
                $(this).attr('data-status', entry.status);
                updateSpanColorClass($(this), entry.type, entry.status);
            });
            
            const $block = $textarea.find(`.param-block[data-block-param="${handle}"]`);
            if ($block.length) {
                $block.toggleClass('block-empty', !newValue || !newValue.trim());
            }
        });
        
        isUpdatingSpans = false;
    }
    
    // ============================================================================
    // MEASUREMENTS TABLE
    // ============================================================================
    
    function generateMeasurementsTable() {
        const $table = $('#measurements-table');
        if (!$table.length) return;
        
        $table.empty();
        
        if (!measurements || !Array.isArray(measurements)) return;
        
        measurements.forEach(group => {
            // Build data-modal-keys attribute for scrollToMeasurementModal
            const modalKeys = Array.isArray(group.modalKey) ? group.modalKey : [group.modalKey];
            const modalKeysAttr = modalKeys.filter(k => k).join(' ');
            
            const $header = $(`
                <div class="measurement-group-header" data-modal-keys="${modalKeysAttr}" ${group.highlight ? '' : ''}>
                    <strong>${group.modalTitle || 'Measurements'}</strong>
                </div>
            `);
            $table.append($header);
            
            const $grid = $('<div class="measurement-grid"></div>');
            
            if (group.items && Array.isArray(group.items)) {
                group.items.forEach(measurementKey => {
                    const entry = registry[measurementKey];
                    if (!entry) return;
                    
                    let label = measurementKey;
                    let unit = entry.unit || '';
                    
                    if (parseConfigMap[measurementKey]) {
                        label = parseConfigMap[measurementKey].label || measurementKey;
                    } else if (window.manualConfig) {
                        const manualItem = window.manualConfig.find(m => m.handle === measurementKey);
                        if (manualItem) {
                            label = manualItem.label || measurementKey;
                        }
                    }
                    
                    const unitLabel = unit ? ` (${unit})` : '';
                    const isCalculated = calculatedHandles.has(measurementKey);
                    const calcClass = isCalculated ? ' calculated-field' : '';
                    const highlightClass = group.highlight ? ' highlight-field' : '';
                    
                    const $row = $(`
                        <div class="measurement-row${calcClass}${highlightClass}">
                            <label>${label}${unitLabel}</label>
                            <input type="text" 
                                class="measurement-input" 
                                data-handle="${measurementKey}"
                                value="${entry.value || ''}"
                                ${isCalculated ? 'title="Calculated field - edit to override"' : ''}>
                        </div>
                    `);
                    
                    $grid.append($row);
                });
            }
            
            $table.append($grid);
        });
        
        // Attach input handlers
        $table.find('.measurement-input').on('input change', function() {
            const handle = $(this).data('handle');
            const value = $(this).val();
            
            // If this is a calculated field being manually edited, mark it to skip auto-calculation
            if (calculatedHandles.has(handle)) {
                manuallyEditedCalculations.add(handle);
            }
            
            setMeasurementValue(handle, value, 'dirty');
        });
    }
    
    // ============================================================================
    // SUMMARY SYSTEM (v6.7 - Individual Span Architecture)
    // ============================================================================
    
    /**
     * Build summary spans and insert after the Summary anchor
     * Called during initial render and full rebuilds only
     */
    function buildSummarySpans() {
        const $textarea = $('#report-textarea');
        const $anchor = $textarea.find('[data-handle="Summary"][data-type="summary-anchor"]');
        
        if (!$anchor.length) {
            console.warn('[v6.7] Summary anchor not found');
            return;
        }
        
        // Collect all parameters with enableSummary that are checked
        const summaryItems = collectSummaryItems();
        
        if (summaryItems.length === 0) {
            console.log('[v6.7] No summary items to build');
            return;
        }
        
        // Sort by summaryOrder (line, then position)
        summaryItems.sort((a, b) => {
            if (a.order.line !== b.order.line) {
                return a.order.line - b.order.line;
            }
            return a.order.position - b.order.position;
        });
        
        // Group by line
        const lines = {};
        summaryItems.forEach(item => {
            const lineKey = item.order.line;
            if (!lines[lineKey]) {
                lines[lineKey] = [];
            }
            lines[lineKey].push(item);
        });
        
        // Build HTML for summary spans
        const resultsWithUnits = prepareResultsWithUnits();
        const sortedLineKeys = Object.keys(lines).map(Number).sort((a, b) => a - b);
        
        let isFirstLine = true;
        let insertionPoint = $anchor[0];
        
        sortedLineKeys.forEach(lineKey => {
            const lineItems = lines[lineKey];
            
            // Insert line break before this line (except first line)
            if (!isFirstLine) {
                const lbHandle = registerSummaryLineBreak();
                const lbSpanId = generateSpanId();
                addSpanIdToRegistry(lbHandle, lbSpanId);
                
                const lbSpan = document.createElement('span');
                lbSpan.setAttribute('data-type', 'summary-linebreak');
                lbSpan.setAttribute('data-handle', lbHandle);
                lbSpan.setAttribute('data-id', lbSpanId);
                lbSpan.setAttribute('data-status', 'clean');
                lbSpan.setAttribute('data-line', lineKey);
                lbSpan.className = 'span-clean-fixed summary-linebreak';
                lbSpan.textContent = '\n';
                
                insertAfter(lbSpan, insertionPoint);
                insertionPoint = lbSpan;
            }
            isFirstLine = false;
            
            // Insert each item on this line
            lineItems.forEach((item, index) => {
                const entry = registry[item.handle];
                if (!entry) return;
                
                // Get the text for this summary item
                let textToUse = getSummaryTextForParam(item.handle);
                
                // Process handlebars
                if (textToUse && textToUse.includes('{{')) {
                    try {
                        const template = Handlebars.compile(textToUse, { noEscape: true });
                        textToUse = template(resultsWithUnits);
                    } catch (e) {
                        console.warn(`[v6.7] Failed to process summary text for ${item.handle}:`, e);
                    }
                }
                
                // Handle ^ prefix (removes trailing space from previous)
                let addTrailingSpace = true;
                if (textToUse && textToUse.startsWith('^')) {
                    textToUse = textToUse.substring(1);
                    // Remove trailing space from previous span if exists
                    if (insertionPoint.tagName === 'SPAN' && insertionPoint.getAttribute('data-type') === 'summarystring') {
                        const prevText = insertionPoint.textContent;
                        if (prevText.endsWith(' ')) {
                            insertionPoint.textContent = prevText.slice(0, -1);
                            // Update registry
                            const prevHandle = insertionPoint.getAttribute('data-handle');
                            if (registry[prevHandle]) {
                                registry[prevHandle].summarystring = insertionPoint.textContent;
                            }
                        }
                    }
                }
                
                // Add trailing space (unless last item on line or next has ^)
                const nextItem = lineItems[index + 1];
                const nextHasCaret = nextItem && getSummaryTextForParam(nextItem.handle)?.startsWith('^');
                if (addTrailingSpace && !nextHasCaret && index < lineItems.length - 1) {
                    textToUse = textToUse + ' ';
                }
                
                // Store in registry
                entry.summarystring = textToUse;
                
                // Create span
                const spanId = generateSpanId();
                addSpanIdToRegistry(item.handle, spanId);
                
                const span = document.createElement('span');
                span.setAttribute('data-type', 'summarystring');
                span.setAttribute('data-handle', item.handle);
                span.setAttribute('data-id', spanId);
                span.setAttribute('data-status', entry.status);
                span.setAttribute('data-line', lineKey);
                span.setAttribute('data-position', item.order.position);
                
                // Set color class based on status inherited from parameter
                let cssClass = 'span-clean-summarystring';
                if (entry.status === 'dirty') {
                    cssClass = 'span-dirty';
                } else if (entry.status === 'auto') {
                    cssClass = 'span-auto';
                }
                span.className = cssClass;
                span.textContent = textToUse;
                
                insertAfter(span, insertionPoint);
                insertionPoint = span;
            });
        });
        
        console.log('[v6.7] Summary spans built:', summaryItems.length, 'items');
    }
    
    /**
     * Collect all parameters that should appear in summary
     */
    function collectSummaryItems() {
        const items = [];
        
        if (!window.parameters || typeof window.parameters !== 'object') {
            return items;
        }
        
        Object.entries(window.parameters).forEach(([varKey, paramConfig]) => {
            if (!paramConfig || !paramConfig.enableSummary) return;
            
            const entry = registry[varKey];
            if (!entry) return;
            
            const isChecked = entry.checked === true;
            const paramValue = entry.value || '';
            
            if (isChecked && paramValue.trim()) {
                items.push({
                    handle: varKey,
                    order: parseSummaryOrder(paramConfig.summaryOrder)
                });
            }
        });
        
        return items;
    }
    
    /**
     * Helper to insert element after reference
     */
    function insertAfter(newNode, referenceNode) {
        if (referenceNode.nextSibling) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        } else {
            referenceNode.parentNode.appendChild(newNode);
        }
    }
    
    /**
     * Update summary when a parameter's checkbox state changes (v6.7 granular)
     */
    function updateSummary() {
        const $textarea = $('#report-textarea');
        if (!$textarea.length) return;
        
        const resultsWithUnits = prepareResultsWithUnits();
        
        // Process each parameter with enableSummary
        if (!window.parameters || typeof window.parameters !== 'object') return;
        
        Object.entries(window.parameters).forEach(([varKey, paramConfig]) => {
            if (!paramConfig || !paramConfig.enableSummary) return;
            
            const entry = registry[varKey];
            if (!entry) return;
            
            const isChecked = entry.checked === true;
            const paramValue = entry.value || '';
            const hasContent = paramValue.trim().length > 0;
            
            const $existingSpan = $textarea.find(`[data-handle="${varKey}"][data-type="summarystring"]`);
            
            if (isChecked && hasContent) {
                // Should be in summary
                if ($existingSpan.length) {
                    // Update existing span content
                    updateSummarySpanContent($existingSpan, varKey, resultsWithUnits);
                } else {
                    // Need to insert new span
                    insertNewSummarySpan(varKey, paramConfig, resultsWithUnits);
                }
            } else {
                // Should NOT be in summary - clear span content but keep it
                if ($existingSpan.length) {
                    $existingSpan.text('');
                    entry.summarystring = '';
                }
            }
        });
        
        // Update Summary textarea if present
        const $summaryTextarea = $('#Summary-textarea');
        if ($summaryTextarea.length && !$summaryTextarea.is(':focus')) {
            const summaryText = getSummaryPlainText();
            $summaryTextarea.val(summaryText);
            autoResizeTextarea($summaryTextarea);
        }
    }
    
    /**
     * Update content of existing summarystring span
     */
    function updateSummarySpanContent($span, handle, resultsWithUnits) {
        const entry = registry[handle];
        if (!entry) return;
        
        // Get new text (always use current summarytext/title, overwrites manual edits)
        let textToUse = getSummaryTextForParam(handle);
        
        // Process handlebars
        if (textToUse && textToUse.includes('{{')) {
            try {
                const template = Handlebars.compile(textToUse, { noEscape: true });
                textToUse = template(resultsWithUnits);
            } catch (e) {
                console.warn(`[v6.7] Failed to process summary text for ${handle}:`, e);
            }
        }
        
        // Handle trailing space logic
        const $nextSpan = $span.next('[data-type="summarystring"]');
        const isSameLineAsNext = $nextSpan.length && $nextSpan.attr('data-line') === $span.attr('data-line');
        
        if (textToUse.startsWith('^')) {
            textToUse = textToUse.substring(1);
        }
        
        // Add trailing space if not last on line
        if (isSameLineAsNext) {
            const nextText = getSummaryTextForParam($nextSpan.attr('data-handle'));
            if (!nextText?.startsWith('^')) {
                textToUse = textToUse.replace(/\s+$/, '') + ' ';
            }
        }
        
        // Update registry and span
        entry.summarystring = textToUse;
        $span.text(textToUse);
        $span.attr('data-status', entry.status);
        updateSpanColorClass($span, 'summarystring', entry.status);
    }
    
    /**
     * Insert a new summarystring span at the correct position
     */
    function insertNewSummarySpan(handle, paramConfig, resultsWithUnits) {
        const $textarea = $('#report-textarea');
        const entry = registry[handle];
        if (!entry) return;
        
        const order = parseSummaryOrder(paramConfig.summaryOrder);
        
        // Find insertion point
        const $anchor = $textarea.find('[data-handle="Summary"][data-type="summary-anchor"]');
        if (!$anchor.length) return;
        
        // Get all existing summarystring spans
        const $existingSpans = $textarea.find('[data-type="summarystring"]');
        
        let insertionPoint = null;
        let needsLineBreakBefore = false;
        let foundSameLine = false;
        
        // Strategy: Find spans on same line (X level) first
        $existingSpans.each(function() {
            const $this = $(this);
            const spanLine = parseInt($this.attr('data-line')) || 0;
            const spanPosition = parseInt($this.attr('data-position')) || 0;
            
            if (spanLine === order.line) {
                foundSameLine = true;
                // Same line - find position
                if (spanPosition < order.position) {
                    insertionPoint = this;
                } else if (!insertionPoint && spanPosition >= order.position) {
                    // Insert before this span
                    insertionPoint = $this.prev()[0] || $anchor[0];
                }
            } else if (spanLine < order.line) {
                // Lower line number - potential insertion point
                insertionPoint = this;
            }
        });
        
        // If no same-line found, need line break
        if (!foundSameLine && $existingSpans.length > 0) {
            needsLineBreakBefore = true;
        }
        
        // Default to anchor if no insertion point found
        if (!insertionPoint) {
            insertionPoint = $anchor[0];
            // Check if any spans exist after anchor
            if ($existingSpans.length > 0) {
                needsLineBreakBefore = true;
            }
        }
        
        // Insert line break if needed
        if (needsLineBreakBefore) {
            const lbHandle = registerSummaryLineBreak();
            const lbSpanId = generateSpanId();
            addSpanIdToRegistry(lbHandle, lbSpanId);
            
            const lbSpan = document.createElement('span');
            lbSpan.setAttribute('data-type', 'summary-linebreak');
            lbSpan.setAttribute('data-handle', lbHandle);
            lbSpan.setAttribute('data-id', lbSpanId);
            lbSpan.setAttribute('data-status', 'clean');
            lbSpan.setAttribute('data-line', order.line);
            lbSpan.className = 'span-clean-fixed summary-linebreak';
            lbSpan.textContent = '\n';
            
            insertAfter(lbSpan, insertionPoint);
            insertionPoint = lbSpan;
        }
        
        // Get text for this summary item
        let textToUse = getSummaryTextForParam(handle);
        
        // Process handlebars
        if (textToUse && textToUse.includes('{{')) {
            try {
                const template = Handlebars.compile(textToUse, { noEscape: true });
                textToUse = template(resultsWithUnits);
            } catch (e) {
                console.warn(`[v6.7] Failed to process summary text for ${handle}:`, e);
            }
        }
        
        // Handle ^ prefix
        if (textToUse && textToUse.startsWith('^')) {
            textToUse = textToUse.substring(1);
        }
        
        // Add trailing space (may be adjusted later by spacing rules)
        textToUse = textToUse + ' ';
        
        // Store in registry
        entry.summarystring = textToUse;
        
        // Create span
        const spanId = generateSpanId();
        addSpanIdToRegistry(handle, spanId);
        
        const span = document.createElement('span');
        span.setAttribute('data-type', 'summarystring');
        span.setAttribute('data-handle', handle);
        span.setAttribute('data-id', spanId);
        span.setAttribute('data-status', entry.status);
        span.setAttribute('data-line', order.line);
        span.setAttribute('data-position', order.position);
        
        let cssClass = 'span-clean-summarystring';
        if (entry.status === 'dirty') {
            cssClass = 'span-dirty';
        } else if (entry.status === 'auto') {
            cssClass = 'span-auto';
        }
        span.className = cssClass;
        span.textContent = textToUse;
        
        insertAfter(span, insertionPoint);
        
        console.log(`[v6.7] Inserted new summarystring span for ${handle} at line ${order.line}, position ${order.position}`);
    }
    
    /**
     * Get plain text version of summary (for textarea display)
     */
    function getSummaryPlainText() {
        const $textarea = $('#report-textarea');
        if (!$textarea.length) return '';
        
        let text = '';
        $textarea.find('[data-type="summarystring"], [data-type="summary-linebreak"]').each(function() {
            text += $(this).text();
        });
        
        return text.trim();
    }
    
    /**
     * Update a summarystring span from direct edit in contenteditable
     */
    function updateSummaryStringFromEdit($span, newText) {
        const handle = $span.attr('data-handle');
        const entry = registry[handle];
        
        if (!entry) return;
        
        // Update registry
        entry.summarystring = newText;
        entry.status = 'dirty';
        
        // Update span styling
        $span.attr('data-status', 'dirty');
        updateSpanColorClass($span, 'summarystring', 'dirty');
    }
    
    // ============================================================================
    // CALCULATIONS - Reactive System
    // ============================================================================
    
    let calculationTimeout = null;
    
    /**
     * Schedule calculations to run after a brief delay
     * This batches multiple rapid measurement changes into a single calculation run
     */
    function scheduleCalculations() {
        if (calculationTimeout) {
            clearTimeout(calculationTimeout);
        }
        calculationTimeout = setTimeout(() => {
            runCalculations();
            calculationTimeout = null;
        }, 50); // 50ms debounce
    }
    
    /**
     * Run all configured calculations
     */
    function runCalculations() {
        if (typeof window.calculations !== 'object' || window.calculations === null) {
            return;
        }
        
        // Prepare metrics object with current values
        const metrics = {};
        Object.entries(registry).forEach(([handle, entry]) => {
            if (entry.type === 'measurement') {
                metrics[handle] = entry.value || '';
            }
        });
        
        // Run each calculation
        Object.entries(window.calculations).forEach(([key, calcFn]) => {
            // Skip if manually edited
            if (manuallyEditedCalculations.has(key)) {
                return;
            }
            
            try {
                const result = calcFn(metrics);
                const resultStr = result !== undefined && result !== null && result !== 'N/A' ? String(result) : '';
                
                // Only update if changed
                const entry = registry[key];
                if (entry && entry.value !== resultStr) {
                    setMeasurementValue(key, resultStr, 'clean', true);
                }
            } catch (e) {
                console.warn(`[v6.7] Calculation error for ${key}:`, e);
            }
        });
    }
    
    /**
     * Check if a measurement is calculated
     */
    function isCalculatedMeasurement(handle) {
        return calculatedHandles.has(handle);
    }
    
    /**
     * Mark a calculated measurement as manually edited (skip auto-calculation)
     */
    function markCalculatedAsManuallyEdited(handle) {
        if (calculatedHandles.has(handle)) {
            manuallyEditedCalculations.add(handle);
        }
    }
    
    // ============================================================================
    // ALGORITHMS
    // ============================================================================
    
    function loadAndRunAlgorithms() {
        const currentConfig = reportConfigs.find(c => c.id === $('#report-config-select').val()) ||
                              reportConfigs.find(c => c.default);
        
        if (!currentConfig || !currentConfig.algorithms || currentConfig.algorithms.length === 0) {
            console.log('[v6.7] No algorithms configured for this template');
            return;
        }
        
        let loadedCount = 0;
        const totalToLoad = currentConfig.algorithms.length;
        
        currentConfig.algorithms.forEach(algoFile => {
            const existingScript = document.querySelector(`script[src="${algoFile}"]`);
            if (existingScript) {
                loadedCount++;
                if (loadedCount === totalToLoad) {
                    runAlgorithms();
                }
                return;
            }
            
            const script = document.createElement('script');
            script.src = algoFile;
            script.onload = () => {
                loadedCount++;
                if (loadedCount === totalToLoad) {
                    runAlgorithms();
                }
            };
            script.onerror = () => {
                console.error(`[v6.7] Failed to load algorithm: ${algoFile}`);
                loadedCount++;
                if (loadedCount === totalToLoad) {
                    runAlgorithms();
                }
            };
            document.body.appendChild(script);
        });
    }
    
    function runAlgorithms() {
        if (typeof window.algorithms === 'undefined' || !Array.isArray(window.algorithms)) {
            console.log('[v6.7] No algorithms array found');
            return;
        }
        
        const context = createAlgorithmContext();
        const changedHandles = [];
        
        window.algorithms.forEach(algo => {
            if (typeof algo.run === 'function') {
                try {
                    console.log(`[v6.7] Running algorithm: ${algo.name || 'unnamed'}`);
                    algo.run(context);
                } catch (e) {
                    console.error(`[v6.7] Algorithm error (${algo.name || 'unnamed'}):`, e);
                }
            }
        });
        
        // Collect changed handles from algorithm context
        if (context._changedHandles) {
            changedHandles.push(...context._changedHandles);
        }
        
        if (changedHandles.length > 0) {
            updateChangedParameters(changedHandles);
        }
        
        updateSummary();
        
        console.log('[v6.7] Algorithms completed');
    }
    
    function createAlgorithmContext() {
        const context = {
            _changedHandles: [],
            
            getMeasurement: function(handle) {
                return getMeasurementValue(handle);
            },
            
            getMeasurementNumeric: function(handle) {
                const val = getMeasurementValue(handle);
                const num = parseFloat(val);
                return isNaN(num) ? null : num;
            },
            
            getParameter: function(handle) {
                return getParamValue(handle);
            },
            
            setParameter: function(handle, value, status = 'auto') {
                setParamValue(handle, value, status, false);
                this._changedHandles.push(handle);
            },
            
            setParameterByLabel: function(handle, label) {
                setParameterByLabel(handle, label, 'auto');
                this._changedHandles.push(handle);
            },
            
            setParameterChecked: function(handle, isChecked) {
                setParameterChecked(handle, isChecked, true);
            },
            
            getParameterChecked: function(handle) {
                return getParameterChecked(handle);
            },
            
            registry: registry,
            parameters: window.parameters
        };
        
        return context;
    }
    
    function setParameterByLabel(handle, label, status = 'auto') {
        const paramConfig = window.parameters?.[handle];
        if (!paramConfig?.options || !Array.isArray(paramConfig.options)) {
            console.warn(`[v6.7] setParameterByLabel: No options for ${handle}`);
            return false;
        }
        
        const option = paramConfig.options.find(opt => {
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            return optLabel === label;
        });
        
        if (!option) {
            console.warn(`[v6.7] setParameterByLabel: Label "${label}" not found for ${handle}`);
            return false;
        }
        
        const value = typeof option === 'string' ? option : option.title;
        setParamValue(handle, value, status, false);
        selectedOptions[handle] = option;
        
        return true;
    }
    
    // ============================================================================
    // CONFIG LOADING
    // ============================================================================
    
    function loadReportConfig(configId) {
        const config = reportConfigs.find(c => c.id === configId);
        if (!config) {
            console.error(`[v6.7] Config not found: ${configId}`);
            return;
        }
        
        console.log(`[v6.7] Loading report config: ${config.name}`);
        
        reportConfigLoaded = false;
        summaryManuallyEdited = false;
        optionsFiles = [];
        Object.keys(modalToFileIndex).forEach(k => delete modalToFileIndex[k]);
        
        const loadPromises = [];
        
        // Load manual config
        if (config.manual) {
            loadPromises.push(loadScript(config.manual).then(() => {
                console.log(`[v6.7] Loaded manual config: ${config.manual}`);
            }));
        }
        
        // Load measurements config
        if (config.measurements) {
            loadPromises.push(loadScript(config.measurements).then(() => {
                measurements = window.measurements || [];
                console.log(`[v6.7] Loaded measurements: ${config.measurements}`);
            }));
        }
        
        // Load parameters
        if (config.parameters) {
            loadPromises.push(loadScript(config.parameters).then(() => {
                parameters = window.parameters || {};
                console.log(`[v6.7] Loaded parameters: ${config.parameters}`);
            }));
        }
        
        // Load options files (array)
        const optionsToLoad = Array.isArray(config.options) ? config.options : [config.options];
        optionsToLoad.forEach((optFile, fileIndex) => {
            if (optFile) {
                loadPromises.push(loadScript(optFile).then(() => {
                    // Store which modals belong to this file
                    const modalsInFile = (window.options || []).map(o => o.modalKey).filter(k => k);
                    optionsFiles.push({
                        file: optFile,
                        fileIndex: fileIndex,
                        modals: modalsInFile
                    });
                    
                    // Map each modal to its file index
                    modalsInFile.forEach(modalKey => {
                        modalToFileIndex[modalKey] = fileIndex;
                    });
                    
                    options = window.options || [];
                    console.log(`[v6.7] Loaded options file ${fileIndex}: ${optFile}`);
                }));
            }
        });
        
        // Load template
        if (config.report) {
            loadPromises.push(loadScript(config.report).then(() => {
                clearPreprocessedTemplate();
                console.log(`[v6.7] Loaded template: ${config.report}`);
            }));
        }
        
        Promise.all(loadPromises).then(() => {
            reportConfigLoaded = true;
            
            initializeRegistry();
            generateMeasurementsTable();
            
            if (typeof window.buildOptionsForm === 'function') {
                window.buildOptionsForm();
            }
            
            updateSummary();
            updateReportTextarea();
            
            if (typeof window.setupContentEditableHandlers === 'function') {
                window.setupContentEditableHandlers();
            }
            
            // Show/hide algorithm button
            if (config.algorithms && config.algorithms.length > 0) {
                $('#run-algorithms').show();
            } else {
                $('#run-algorithms').hide();
            }
            
            // Show/hide secondary options button
            if (optionsFiles.length > 1) {
                $('#open-secondary-options').show();
            } else {
                $('#open-secondary-options').hide();
            }
            
            console.log(`[v6.7] Config loaded: ${config.name}`);
        }).catch(err => {
            console.error('[v6.7] Error loading config:', err);
        });
    }
    
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Remove existing script with same src
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                existing.remove();
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load: ${src}`));
            document.body.appendChild(script);
        });
    }
    
    // ============================================================================
    // MODAL HELPERS FOR FORM
    // ============================================================================
    
    function autoResizeTextarea($textarea) {
        if (!$textarea || !$textarea.length) return;
        
        $textarea.css('height', 'auto');
        const scrollHeight = $textarea[0].scrollHeight;
        $textarea.css('height', Math.max(60, scrollHeight) + 'px');
    }
    
    function populateModalTextareas($modal, variables) {
        if (!variables || !Array.isArray(variables)) return;
        
        variables.forEach(varKey => {
            const entry = registry[varKey];
            if (!entry) return;
            
            const $textarea = $modal.find(`.modal-textarea[data-param="${varKey}"], .modal-custom-textarea[data-param="${varKey}"]`);
            if ($textarea.length) {
                $textarea.val(entry.value || '');
                autoResizeTextarea($textarea);
            }
            
            const $select = $modal.find(`.modal-select[data-param="${varKey}"]`);
            if ($select.length) {
                $select.val(entry.value || '');
            }
            
            const $checkbox = $modal.find(`.modal-summary-checkbox[data-param="${varKey}"]`);
            if ($checkbox.length) {
                $checkbox.prop('checked', entry.checked === true);
            }
        });
    }
    
    function updateModalPreview($modal, sectionVariables) {
        const $preview = $modal.find('.modal-preview');
        if (!$preview.length) return;
        
        const resultsWithUnits = prepareResultsWithUnits();
        let previewText = '';
        
        sectionVariables.forEach(varKey => {
            const entry = registry[varKey];
            if (!entry) return;
            
            let value = entry.value || '';
            if (value.includes('{{')) {
                try {
                    const template = Handlebars.compile(value);
                    value = template(resultsWithUnits);
                } catch (e) {}
            }
            
            if (value.trim()) {
                previewText += value + '\n';
            }
        });
        
        $preview.text(previewText.trim());
    }
    
    function scrollToMeasurementModal($modal, modalKey) {
        const $measurementSection = $modal.find(`.modal-measurements-section[data-modal="${modalKey}"]`);
        if ($measurementSection.length) {
            $measurementSection[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    function cacheModalScrollPositions() {
        // Placeholder for scroll position caching
    }
    
    // ============================================================================
    // UI SETUP
    // ============================================================================
    
    // Populate input format dropdown
    inputConfigs.forEach(config => {
        const selected = config.default ? ' selected' : '';
        $('#parse-config-select').append(`<option value="${config.id}"${selected}>${config.name}</option>`);
    });
    
    // Load parse config on selection change
    $('#parse-config-select').on('change', function() {
        const configId = $(this).val();
        const config = inputConfigs.find(c => c.id === configId);
        if (config && config.file) {
            loadScript(config.file).then(() => {
                parseConfig = window.parseConfig || [];
                parseConfigMap = {};
                parseConfig.forEach(c => {
                    if (c.handle) parseConfigMap[c.handle] = c;
                });
                console.log(`[v6.7] Loaded parse config: ${config.file}`);
            });
        }
    });
    
    // Load default parse config
    const defaultInputConfig = inputConfigs.find(c => c.default);
    if (defaultInputConfig && defaultInputConfig.file) {
        loadScript(defaultInputConfig.file).then(() => {
            parseConfig = window.parseConfig || [];
            parseConfigMap = {};
            parseConfig.forEach(c => {
                if (c.handle) parseConfigMap[c.handle] = c;
            });
        });
    }
    
    // Populate report template dropdown
    reportConfigs.forEach(config => {
        const selected = config.default ? ' selected' : '';
        $('#report-config-select').append(`<option value="${config.id}"${selected}>${config.name}</option>`);
    });
    
    // Load report config on selection change
    $('#report-config-select').on('change', function() {
        loadReportConfig($(this).val());
    });
    
    // Import modal handlers
    $('#open-import-modal').on('click', function() {
        $('#import-modal').addClass('active');
    });
    
    $('#close-import-modal').on('click', function() {
        $('#import-modal').removeClass('active');
    });
    
    $('#import-modal').on('click', function(e) {
        if (e.target === this) {
            $(this).removeClass('active');
        }
    });
    
    $('#load-example-data').on('click', function() {
        const configId = $('#parse-config-select').val();
        const config = inputConfigs.find(c => c.id === configId);
        if (config && config.exampledata) {
            loadScript(config.exampledata).then(() => {
                if (window.exampleData) {
                    $('#report').val(window.exampleData);
                }
            });
        }
    });
    
    $('#clear-import').on('click', function() {
        $("#report").val("");
        
        Object.entries(registry).forEach(([handle, entry]) => {
            if (entry.type === 'measurement') {
                entry.value = '';
                entry.status = 'clean';
            }
        });
        
        generateMeasurementsTable();
        
        // Update parameters that contain embedded handlebars (now referencing empty measurements)
        updateParametersWithEmbeddedHandlebars();
    });
    
    // FIX: Import uses GRANULAR update, not full re-render
    $("#submit").on("click", function() {
        const inputText = $("#report").val();
        const changedHandles = [];
        
        parseConfig.forEach(config => {
            if (config.match) {
                const regex = new RegExp(config.match);
                const match = inputText.match(regex);
                if (match && match[1]) {
                    setMeasurementValue(config.handle, match[1].trim(), 'clean', false);
                    changedHandles.push(config.handle);
                }
            }
        });
        
        // Run calculations after import (will also add calculated handles)
        runCalculations();
        
        if (typeof window.calculations === 'object' && window.calculations !== null) {
            Object.keys(window.calculations).forEach(key => {
                if (!changedHandles.includes(key)) {
                    changedHandles.push(key);
                }
            });
        }
        
        generateMeasurementsTable();
        
        // GRANULAR update: update measurement spans
        updateChangedParameters(changedHandles);
        
        // Update parameters that contain embedded handlebars referencing measurements
        updateParametersWithEmbeddedHandlebars();
        
        updateSummary();
        
        $("#import-modal").removeClass("active");
    });
    
    // Run Algorithms button
    $("#run-algorithms").on("click", function() {
        loadAndRunAlgorithms();
    });
    
    $("#reset-selections").on("click", function() {
        if (!confirm("Reset all form selections to defaults? This will not affect imported measurements.")) {
            return;
        }
        
        Object.entries(registry).forEach(([handle, entry]) => {
            if (entry.type === 'parameter') {
                const paramConfig = window.parameters?.[handle];
                if (paramConfig?.options && Array.isArray(paramConfig.options)) {
                    const defaultOpt = paramConfig.options.find(opt => 
                        typeof opt !== 'string' && opt.default === true
                    );
                    if (defaultOpt) {
                        entry.value = defaultOpt.title || '';
                    } else {
                        entry.value = '';
                    }
                } else {
                    entry.value = '';
                }
                entry.status = 'clean';
                entry.checked = paramConfig?.summaryDefault === true;
                entry.summarystring = '';
            }
        });
        
        Object.keys(selectedOptions).forEach(key => delete selectedOptions[key]);
        summaryManuallyEdited = false;
        
        $("#options-content").empty();
        buildOptionsForm();
        
        updateSummary();
        updateReportTextarea();
    });
    
    // ============================================================================
    // CLIPBOARD
    // ============================================================================
    
    $("#copy-report").on("click", function() {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) {
            alert('Report textarea not found');
            return;
        }
        
        const $clone = $textarea.clone();
        $clone.find('.inline-button-group').remove();
        
        $clone.find('.param-block:not(.block-empty)').each(function() {
            $(this).before('\n');
        });
        
        const textContent = $clone[0].innerText;
        
        const cleanedText = textContent
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        
        navigator.clipboard.writeText(cleanedText).then(() => {
            const originalText = $(this).html();
            $(this).html("Copied!");
            setTimeout(() => $(this).html(originalText), 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        });
    });
    
    // ============================================================================
    // GLOBAL EXPORTS
    // ============================================================================
    
    window.registry = registry;
    window.getRegistryEntry = getRegistryEntry;
    window.setRegistryValue = setRegistryValue;
    window.getMeasurementValue = getMeasurementValue;
    window.getMeasurementWithUnit = getMeasurementWithUnit;
    window.setMeasurementValue = setMeasurementValue;
    window.getParamValue = getParamValue;
    window.setParamValue = setParamValue;
    window.getParameterChecked = getParameterChecked;
    window.setParameterChecked = setParameterChecked;
    window.registerFixedText = registerFixedText;
    window.registerManualEdit = registerManualEdit;
    
    // v6.7 Summary exports
    window.getSummaryString = getSummaryString;
    window.setSummaryString = setSummaryString;
    window.parseSummaryOrder = parseSummaryOrder;
    window.getSummaryTextForParam = getSummaryTextForParam;
    window.updateSummaryStringFromEdit = updateSummaryStringFromEdit;
    window.buildSummarySpans = buildSummarySpans;
    
    window.generateSpanId = generateSpanId;
    window.addSpanIdToRegistry = addSpanIdToRegistry;
    window.removeSpanIdFromRegistry = removeSpanIdFromRegistry;
    window.updateSpansForHandle = updateSpansForHandle;
    window.updateSpanColorClass = updateSpanColorClass;
    window.updateOpenModalsForHandle = updateOpenModalsForHandle;
    window.updateCheckboxesForHandle = updateCheckboxesForHandle;
    window.updateParametersWithEmbeddedHandlebars = updateParametersWithEmbeddedHandlebars;
    window.processHandlebarsValue = processHandlebarsValue;
    window.getDisplayValueForEntry = getDisplayValueForEntry;
    
    window.selectedOptions = selectedOptions;
    window.getModalKeysForParam = getModalKeysForParam;
    window.extractModalVariables = extractModalVariables;
    
    window.updateReportTextarea = updateReportTextarea;
    window.updateChangedParameters = updateChangedParameters;
    window.prepareOutputData = prepareOutputData;
    window.prepareResultsWithUnits = prepareResultsWithUnits;
    
    window.initializeRegistry = initializeRegistry;
    window.updateSummary = updateSummary;
    window.runCalculations = runCalculations;
    window.scheduleCalculations = scheduleCalculations;
    window.isCalculatedMeasurement = isCalculatedMeasurement;
    window.markCalculatedAsManuallyEdited = markCalculatedAsManuallyEdited;
    
    // Algorithm exports
    window.loadAndRunAlgorithms = loadAndRunAlgorithms;
    window.runAlgorithms = runAlgorithms;
    window.setParameterByLabel = setParameterByLabel;
    window.createAlgorithmContext = createAlgorithmContext;
    
    window.autoResizeTextarea = autoResizeTextarea;
    window.populateModalTextareas = populateModalTextareas;
    window.updateModalPreview = updateModalPreview;
    window.scrollToMeasurementModal = scrollToMeasurementModal;
    window.cacheModalScrollPositions = cacheModalScrollPositions;
    window.generateMeasurementsTable = generateMeasurementsTable;
    window.setSummaryManuallyEdited = function(value) { summaryManuallyEdited = value; };
    
    window.parameters = parameters;
    window.options = options;
    window.measurements = measurements;
    window.getParseConfigMap = function() { return parseConfigMap; };
    
    // Multiple options files navigation exports (v6.5)
    window.optionsFiles = optionsFiles;
    window.modalToFileIndex = modalToFileIndex;
    window.getModalFileIndex = function(modalKey) { return modalToFileIndex[modalKey] ?? 0; };
    window.getOptionsFilesCount = function() { return optionsFiles.length; };
    window.getModalsForFileIndex = function(fileIndex) {
        const file = optionsFiles.find(f => f.fileIndex === fileIndex);
        return file ? file.modals : [];
    };
    window.getFirstModalInFile = function(fileIndex) {
        const modals = window.getModalsForFileIndex(fileIndex);
        return modals.length > 0 ? modals[0] : null;
    };
    window.getLastModalInFile = function(fileIndex) {
        const modals = window.getModalsForFileIndex(fileIndex);
        return modals.length > 0 ? modals[modals.length - 1] : null;
    };
    
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    window.initializeReportForm = function() {
        const defaultReportConfig = reportConfigs.find(c => c.default);
        if (defaultReportConfig) {
            loadReportConfig(defaultReportConfig.id);
        }
    };
    
});
