/* jshint loopfunc: true, esversion: 11 */
/* EchoTools v6.5 - Central Registry with Span-based ContentEditable + Algorithms + Multiple Modal Flows */

jQuery(document).ready(function () {
    // Show the options section
    $("#options").show();
    
    // Clear the import modal textarea on page load
    $("#report").val("");
    
    // ============================================================================
    // CENTRAL VARIABLE REGISTRY (v6.0)
    // ============================================================================
    
    const registry = {};
    
    // ID counters
    let spanIdCounter = 0;
    let fixedTextCounter = 0;
    let manualEditCounter = 0;
    let summaryLineBreakCounter = 0;  // v6.7
    
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
    
    // v6.7: Register a summary line break span
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
            console.warn('[v6.0] Failed to process handlebars:', e);
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
            
            // v6.7: For summarystring spans, use summarystring value
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
                case 'summary-linebreak':  // v6.7
                    $span.addClass('span-clean-fixed');
                    break;
                case 'summarystring':  // v6.7
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
                
                const $spans = $textarea.find(`[data-handle="${handle}"]`);
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
        
        isUpdatingSpans = wasUpdating;
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
    
    function initializeRegistry() {
        Object.keys(registry).forEach(key => delete registry[key]);
        
        spanIdCounter = 0;
        fixedTextCounter = 0;
        manualEditCounter = 0;
        summaryLineBreakCounter = 0;  // v6.7
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
        
        // Register ALL parameters from window.parameters directly
        // Parameters exist in the registry regardless of whether they're assigned to a modal
        // Modals only provide UI for editing, not existence
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
                    summarystring: '',  // v6.7: Individual summary text for this parameter
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
        console.log('[v6.27 Registry] From parseConfig:', parseConfig?.length || 0);
        console.log('[v6.27 Registry] From manualConfig:', window.manualConfig?.length || 0);
        console.log('[v6.27 Registry] Calculated handles:', Array.from(calculatedHandles));
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
            
            // v6.7: Special handling for Summary - create anchor span
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
                        case 'summarystring': cssClass = 'span-clean-summarystring'; break;  // v6.7
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
                    console.warn(`[v6.0] Failed to process ${handle}:`, e);
                }
            }
            
            if (entry.type === 'measurement' && entry.unit && entry.value) {
                processedData[handle] = `${entry.value}${entry.unit}`;
            } else {
                processedData[handle] = value;
            }
        });
        
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
            console.warn('[v6.0] ContentEditable textarea not found');
            return;
        }
        
        const data = prepareOutputData();
        
        let rawReport = '';
        try {
            const template = getPreprocessedTemplate();
            rawReport = template(data);
        } catch (e) {
            console.error('[v6.0] Error generating report:', e);
            return;
        }
        
        const processedReport = postProcessReport(rawReport, data);
        updateContentEditableHTML(processedReport);
        
        // v6.7: Build summary spans after initial render
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
                // v6.7: Preserve lines with summary-anchor
                if (line.includes('summary-anchor')) {
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
                    console.warn(`[v6.0] Failed to process ${handle}:`, e);
                }
            }
            
            const $spans = $textarea.find(`[data-handle="${handle}"]`);
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
            
            const $groupTable = $('<table class="measurement-group-table"></table>');
            
            if (group.items && Array.isArray(group.items)) {
                group.items.forEach(measurementKey => {
                    const entry = registry[measurementKey];
                    const config = parseConfigMap[measurementKey] || 
                                   (window.manualConfig?.find(m => m.handle === measurementKey));
                    
                    const label = config?.label || measurementKey;
                    const unit = config?.unit || entry?.unit || '';
                    const value = entry?.value || '';
                    
                    // Check if this is a calculated measurement
                    const isCalculated = calculatedHandles.has(measurementKey);
                    const calculatedClass = isCalculated ? ' calculated' : '';
                    
                    // Check if this should be a full-width input (extends into unit space)
                    const isFullWidth = config?.full === true;
                    const fullWidthClass = isFullWidth ? ' full-width' : '';
                    
                    const $row = $(`
                        <tr>
                            <td class="measurement-label">${label}</td>
                            <td class="measurement-value">
                                <input type="text" 
                                       class="measurement-input${calculatedClass}${fullWidthClass}" 
                                       data-handle="${measurementKey}" 
                                       value="${value}"
                                       ${isCalculated ? 'title="Calculated field"' : ''}>
                                <span class="measurement-unit">${unit}</span>
                            </td>
                        </tr>
                    `);
                    $groupTable.append($row);
                });
            }
            
            $table.append($groupTable);
        });
        
        setupMeasurementInputHandlers();
        
        // Cache scroll positions after table is built
        cacheModalScrollPositions();
    }
    
    function setupMeasurementInputHandlers() {
        $('.measurement-input').off('change input').on('change input', function() {
            const handle = $(this).data('handle');
            const value = $(this).val();
            
            // If this is a calculated field being manually edited, mark it to skip auto-calculation
            if (calculatedHandles.has(handle)) {
                markCalculatedAsManuallyEdited(handle);
            }
            
            setMeasurementValue(handle, value, 'dirty');
        });
    }
    
    // ============================================================================
    // SCROLL TO MEASUREMENT MODAL
    // ============================================================================
    
    // Cache of pre-calculated scroll positions for each modalKey
    const modalScrollPositions = {};
    
    /**
     * Build the scroll position cache after measurements table is generated
     * Called once after generateMeasurementsTable completes
     */
    function cacheModalScrollPositions() {
        // Clear existing cache
        Object.keys(modalScrollPositions).forEach(key => delete modalScrollPositions[key]);
        
        const scrollContainer = document.getElementById('measurements-table');
        if (!scrollContainer) return;
        
        // Reset scroll to top before calculating positions
        // This prevents browser scroll restoration from affecting cached values
        scrollContainer.scrollTop = 0;
        
        const headers = scrollContainer.querySelectorAll('.measurement-group-header');
        
        headers.forEach(header => {
            const keys = (header.getAttribute('data-modal-keys') || '').split(' ').filter(k => k);
            
            keys.forEach(modalKey => {
                // Only store the first (topmost) position for each modalKey
                if (modalScrollPositions[modalKey] === undefined) {
                    // offsetTop gives position relative to offsetParent
                    modalScrollPositions[modalKey] = header.offsetTop;
                }
            });
        });
        
        console.log('[v6.20] Cached scroll positions:', modalScrollPositions);
    }
    
    /**
     * Scroll the measurements table to show the section matching the given modalKey
     * Uses pre-calculated positions for reliability
     * 
     * @param {string} modalKey - The modal key to find in measurement groups
     */
    function scrollToMeasurementModal(modalKey) {
        if (!modalKey) return;
        
        const scrollContainer = document.getElementById('measurements-table');
        if (!scrollContainer) return;
        
        const targetPosition = modalScrollPositions[modalKey];
        if (targetPosition === undefined) return;
        
        // Offset to account for panel header
        const headerOffset = 65;
        
        // Direct scroll to cached position minus offset
        scrollContainer.scrollTo({
            top: Math.max(0, targetPosition - headerOffset),
            behavior: 'smooth'
        });
    }
    
    // ============================================================================
    // SUMMARY FUNCTIONS (v6.7 - Granular Summarystring Architecture)
    // ============================================================================
    
    /**
     * Parse summaryOrder into line and position components (v6.7)
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
        const decimalPart = orderNum - line;
        const position = Math.round(decimalPart * 10);
        
        return { line, position };
    }
    
    /**
     * Get the summarystring value for a parameter (v6.7)
     */
    function getSummaryString(handle) {
        const entry = registry[handle];
        return entry?.summarystring || '';
    }
    
    /**
     * Set the summarystring value for a parameter (v6.7)
     */
    function setSummaryString(handle, value) {
        if (registry[handle]) {
            registry[handle].summarystring = value || '';
        }
    }
    
    /**
     * Get the text to use for a parameter's summary entry (v6.7)
     * Priority: summarytext (from selected option) -> title -> paramValue
     */
    function getSummaryTextForParam(handle) {
        const entry = registry[handle];
        if (!entry) return '';
        
        const paramConfig = window.parameters?.[handle];
        if (!paramConfig) return entry.value || '';
        
        const paramValue = entry.value || '';
        let textToUse = paramValue;
        
        if (paramConfig.options && Array.isArray(paramConfig.options)) {
            const selectedOpt = paramConfig.options.find(opt => {
                const title = typeof opt === 'string' ? opt : opt.title;
                return title === paramValue;
            }) || selectedOptions[handle];
            
            if (selectedOpt && typeof selectedOpt !== 'string' && selectedOpt.summarytext) {
                textToUse = selectedOpt.summarytext;
            }
        } else if (paramConfig.summarytext) {
            textToUse = paramConfig.summarytext;
        }
        
        return textToUse;
    }
    
    /**
     * Update a summarystring span from direct edit in contenteditable (v6.7)
     */
    function updateSummaryStringFromEdit($span, newText) {
        const handle = $span.attr('data-handle');
        const entry = registry[handle];
        
        if (!entry) return;
        
        entry.summarystring = newText;
        entry.status = 'dirty';
        
        $span.attr('data-status', 'dirty');
        updateSpanColorClass($span, 'summarystring', 'dirty');
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
     * Build summary spans and insert after the Summary anchor (v6.7)
     * Called during initial render and full rebuilds only
     */
    function buildSummarySpans() {
        const $textarea = $('#report-textarea');
        const $anchor = $textarea.find('[data-handle="Summary"][data-type="summary-anchor"]');
        
        if (!$anchor.length) {
            console.warn('[v6.7] Summary anchor not found');
            return;
        }
        
        const summaryItems = collectSummaryItems();
        
        if (summaryItems.length === 0) {
            console.log('[v6.7] No summary items to build');
            return;
        }
        
        summaryItems.sort((a, b) => {
            if (a.order.line !== b.order.line) {
                return a.order.line - b.order.line;
            }
            return a.order.position - b.order.position;
        });
        
        const lines = {};
        summaryItems.forEach(item => {
            const lineKey = item.order.line;
            if (!lines[lineKey]) {
                lines[lineKey] = [];
            }
            lines[lineKey].push(item);
        });
        
        const resultsWithUnits = prepareResultsWithUnits();
        const sortedLineKeys = Object.keys(lines).map(Number).sort((a, b) => a - b);
        
        let isFirstLine = true;
        let insertionPoint = $anchor[0];
        
        sortedLineKeys.forEach(lineKey => {
            const lineItems = lines[lineKey];
            
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
            
            lineItems.forEach((item, index) => {
                const entry = registry[item.handle];
                if (!entry) return;
                
                let textToUse = getSummaryTextForParam(item.handle);
                
                if (textToUse && textToUse.includes('{{')) {
                    try {
                        const template = Handlebars.compile(textToUse, { noEscape: true });
                        textToUse = template(resultsWithUnits);
                    } catch (e) {
                        console.warn(`[v6.7] Failed to process summary text for ${item.handle}:`, e);
                    }
                }
                
                let addTrailingSpace = true;
                if (textToUse && textToUse.startsWith('^')) {
                    textToUse = textToUse.substring(1);
                    if (insertionPoint.tagName === 'SPAN' && insertionPoint.getAttribute('data-type') === 'summarystring') {
                        const prevText = insertionPoint.textContent;
                        if (prevText.endsWith(' ')) {
                            insertionPoint.textContent = prevText.slice(0, -1);
                            const prevHandle = insertionPoint.getAttribute('data-handle');
                            if (registry[prevHandle]) {
                                registry[prevHandle].summarystring = insertionPoint.textContent;
                            }
                        }
                    }
                }
                
                const nextItem = lineItems[index + 1];
                const nextHasCaret = nextItem && getSummaryTextForParam(nextItem.handle)?.startsWith('^');
                if (addTrailingSpace && !nextHasCaret && index < lineItems.length - 1) {
                    textToUse = textToUse + ' ';
                }
                
                entry.summarystring = textToUse;
                
                const spanId = generateSpanId();
                addSpanIdToRegistry(item.handle, spanId);
                
                const span = document.createElement('span');
                span.setAttribute('data-type', 'summarystring');
                span.setAttribute('data-handle', item.handle);
                span.setAttribute('data-id', spanId);
                span.setAttribute('data-status', entry.status);
                span.setAttribute('data-line', lineKey);
                span.setAttribute('data-position', item.order.position);
                
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
     * Collect all parameters that should appear in summary (v6.7)
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
     * Update summary when a parameter's checkbox or value changes (v6.7 granular)
     */
    function updateSummary() {
        const $textarea = $('#report-textarea');
        if (!$textarea.length) return;
        
        const resultsWithUnits = prepareResultsWithUnits();
        
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
                if ($existingSpan.length) {
                    updateSummarySpanContent($existingSpan, varKey, resultsWithUnits);
                } else {
                    insertNewSummarySpan(varKey, paramConfig, resultsWithUnits);
                }
            } else {
                if ($existingSpan.length) {
                    $existingSpan.text('');
                    entry.summarystring = '';
                }
            }
        });
        
        const $summaryTextarea = $('#Summary-textarea');
        if ($summaryTextarea.length && !$summaryTextarea.is(':focus')) {
            const summaryText = getSummaryPlainText();
            $summaryTextarea.val(summaryText);
            autoResizeTextarea($summaryTextarea);
        }
    }
    
    /**
     * Update content of existing summarystring span (v6.7)
     */
    function updateSummarySpanContent($span, handle, resultsWithUnits) {
        const entry = registry[handle];
        if (!entry) return;
        
        let textToUse = getSummaryTextForParam(handle);
        
        if (textToUse && textToUse.includes('{{')) {
            try {
                const template = Handlebars.compile(textToUse, { noEscape: true });
                textToUse = template(resultsWithUnits);
            } catch (e) {
                console.warn(`[v6.7] Failed to process summary text for ${handle}:`, e);
            }
        }
        
        const $nextSpan = $span.next('[data-type="summarystring"]');
        const isSameLineAsNext = $nextSpan.length && $nextSpan.attr('data-line') === $span.attr('data-line');
        
        if (textToUse.startsWith('^')) {
            textToUse = textToUse.substring(1);
        }
        
        if (isSameLineAsNext) {
            const nextText = getSummaryTextForParam($nextSpan.attr('data-handle'));
            if (!nextText?.startsWith('^')) {
                textToUse = textToUse.replace(/\s+$/, '') + ' ';
            }
        }
        
        entry.summarystring = textToUse;
        $span.text(textToUse);
        $span.attr('data-status', entry.status);
        updateSpanColorClass($span, 'summarystring', entry.status);
    }
    
    /**
     * Insert a new summarystring span at the correct position (v6.7)
     */
    function insertNewSummarySpan(handle, paramConfig, resultsWithUnits) {
        const $textarea = $('#report-textarea');
        const entry = registry[handle];
        if (!entry) return;
        
        const order = parseSummaryOrder(paramConfig.summaryOrder);
        
        const $anchor = $textarea.find('[data-handle="Summary"][data-type="summary-anchor"]');
        if (!$anchor.length) return;
        
        const $existingSpans = $textarea.find('[data-type="summarystring"]');
        
        let insertionPoint = null;
        let needsLineBreakBefore = false;
        let foundSameLine = false;
        
        $existingSpans.each(function() {
            const $this = $(this);
            const spanLine = parseInt($this.attr('data-line')) || 0;
            const spanPosition = parseInt($this.attr('data-position')) || 0;
            
            if (spanLine === order.line) {
                foundSameLine = true;
                if (spanPosition < order.position) {
                    insertionPoint = this;
                } else if (!insertionPoint && spanPosition >= order.position) {
                    insertionPoint = $this.prev()[0] || $anchor[0];
                }
            } else if (spanLine < order.line) {
                insertionPoint = this;
            }
        });
        
        if (!foundSameLine && $existingSpans.length > 0) {
            needsLineBreakBefore = true;
        }
        
        if (!insertionPoint) {
            insertionPoint = $anchor[0];
            if ($existingSpans.length > 0) {
                needsLineBreakBefore = true;
            }
        }
        
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
        
        let textToUse = getSummaryTextForParam(handle);
        
        if (textToUse && textToUse.includes('{{')) {
            try {
                const template = Handlebars.compile(textToUse, { noEscape: true });
                textToUse = template(resultsWithUnits);
            } catch (e) {
                console.warn(`[v6.7] Failed to process summary text for ${handle}:`, e);
            }
        }
        
        if (textToUse && textToUse.startsWith('^')) {
            textToUse = textToUse.substring(1);
        }
        
        textToUse = textToUse + ' ';
        
        entry.summarystring = textToUse;
        
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
     * Get plain text version of summary for textarea display (v6.7)
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
    
    // Track calculated measurements that have been manually edited
    let manuallyEditedCalculations = new Set();
    
    /**
     * Mark a calculated measurement as manually edited (skip future auto-calculations)
     */
    function markCalculatedAsManuallyEdited(handle) {
        if (calculatedHandles.has(handle)) {
            manuallyEditedCalculations.add(handle);
            console.log(`[v6.5 Calc] Marked ${handle} as manually edited - will skip auto-calculation`);
        }
    }
    
    /**
     * Clear manual edit flag for a calculated measurement (allow auto-calculation again)
     */
    function clearManualEditFlag(handle) {
        manuallyEditedCalculations.delete(handle);
    }
    
    /**
     * Run all calculations and update registry with results
     * Calculated values are treated as 'clean' - same as imported values
     * Skips calculations for manually edited fields
     */
    function runCalculations() {
        if (typeof window.calculations !== 'object' || window.calculations === null) return;
        
        // Build metrics object from registry
        const metricsForCalc = {};
        Object.entries(registry).forEach(([handle, entry]) => {
            if (entry.type === 'measurement') {
                // Only convert to number if the ENTIRE value is a valid number
                // Use Number() not parseFloat() - parseFloat("20/10/1995") returns 20, but Number() returns NaN
                const trimmedValue = (entry.value || '').trim();
                const numVal = Number(trimmedValue);
                metricsForCalc[handle] = isNaN(numVal) ? entry.value : numVal;
            } else {
                metricsForCalc[handle] = entry.value;
            }
        });
        
        const changedHandles = [];
        
        Object.entries(window.calculations).forEach(([key, calcFn]) => {
            // Skip if this calculated field has been manually edited
            if (manuallyEditedCalculations.has(key)) {
                return;
            }
            
            try {
                const result = calcFn(metricsForCalc);
                
                if (result !== undefined && result !== null && result !== 'N/A') {
                    const newValue = String(result);
                    const entry = registry[key];
                    
                    // Update if entry exists and value is different
                    if (entry && entry.value !== newValue) {
                        entry.value = newValue;
                        entry.status = 'clean'; // Calculated values are clean
                        changedHandles.push(key);
                        
                        // Update UI
                        updateMeasurementTableCell(key);
                        updateSpansForHandle(key);
                        updateOpenModalsForHandle(key);
                    }
                }
            } catch (e) {
                console.warn(`[v6.20 Calc] Error calculating ${key}:`, e);
            }
        });
        
        if (changedHandles.length > 0) {
            console.log('[v6.20 Calc] Updated:', changedHandles.join(', '));
            // Also update parameters that might embed these measurements
            updateParametersWithEmbeddedHandlebars();
        }
    }
    
    /**
     * Check if a handle is a calculated measurement
     */
    function isCalculatedMeasurement(handle) {
        return calculatedHandles.has(handle);
    }
    
    // ============================================================================
    // ALGORITHMS - Button-triggered Decision Trees
    // ============================================================================
    
    /**
     * Create algorithm context with getter methods for safe registry access
     * Algorithms receive this context to read values without direct registry access
     */
    function createAlgorithmContext() {
        return {
            /**
             * Get raw measurement value as number, or null if not available/not numeric
             */
            getMeasurement: function(handle) {
                const entry = registry[handle];
                if (!entry) return null;
                
                // For measurements, parse as number
                if (entry.type === 'measurement') {
                    const val = parseFloat(entry.value);
                    return isNaN(val) ? null : val;
                }
                
                // For other types (like Gender from import), try to parse
                const val = parseFloat(entry.value);
                return isNaN(val) ? null : val;
            },
            
            /**
             * Get raw string value of measurement (for non-numeric like Gender)
             */
            getMeasurementRaw: function(handle) {
                const entry = registry[handle];
                return entry?.value || '';
            },
            
            /**
             * Get parameter value (title/string)
             */
            getParam: function(handle) {
                const entry = registry[handle];
                return entry?.value || '';
            },
            
            /**
             * Get current label for a dropdown parameter
             * Looks up the matching option by title and returns the label
             */
            getParamLabel: function(handle) {
                const entry = registry[handle];
                if (!entry || !entry.value) return '';
                
                const paramConfig = window.parameters?.[handle];
                if (!paramConfig?.options || !Array.isArray(paramConfig.options)) {
                    return entry.value; // No options, return value as-is
                }
                
                const matchingOpt = paramConfig.options.find(opt => {
                    const title = typeof opt === 'string' ? opt : opt.title;
                    return title === entry.value;
                });
                
                return matchingOpt ? (matchingOpt.label || matchingOpt.title) : entry.value;
            },
            
            /**
             * Check if a value is empty/null/undefined
             */
            isEmpty: function(handle) {
                const entry = registry[handle];
                return !entry || !entry.value || entry.value.trim() === '';
            },
            
            /**
             * Get parameter checked state
             */
            getChecked: function(handle) {
                const entry = registry[handle];
                return entry?.checked === true;
            }
        };
    }
    
    /**
     * Set a parameter by label (finds matching option and sets title)
     * This mimics user selecting from dropdown - triggers all normal behaviors
     * 
     * @param {string} paramHandle - Parameter handle (e.g., 'pDiastology')
     * @param {string} label - Label to set (e.g., 'Normal diastolic function for age')
     * @returns {boolean} - True if successfully set, false otherwise
     */
    function setParameterByLabel(paramHandle, label, status = 'auto') {
        const paramConfig = window.parameters?.[paramHandle];
        if (!paramConfig) {
            console.warn(`[Algorithm] Unknown parameter: ${paramHandle}`);
            return false;
        }
        
        // Handle customtext parameters - set value directly
        if (paramConfig.options === 'customtext') {
            setParamValue(paramHandle, label, status, false);
            updateSpansForHandle(paramHandle);
            
            // Apply summary checkbox logic for customtext
            if (paramConfig.enableSummary) {
                const hasContent = label && label.trim() !== '';
                if (paramConfig.summaryOnChange) {
                    setParameterChecked(paramHandle, hasContent);
                }
            }
            
            return true;
        }
        
        // For dropdown parameters - find matching option by label
        if (!paramConfig.options || !Array.isArray(paramConfig.options)) {
            console.warn(`[Algorithm] Parameter ${paramHandle} has no options array`);
            return false;
        }
        
        // Find option by label (case-insensitive for flexibility)
        const matchingOpt = paramConfig.options.find(opt => {
            if (typeof opt === 'string') {
                return opt.toLowerCase() === label.toLowerCase();
            }
            return opt.label && opt.label.toLowerCase() === label.toLowerCase();
        });
        
        if (!matchingOpt) {
            // Label not found - might be a custom string like "** unable to determine **"
            // Set it directly as the value (will show as custom text)
            setParamValue(paramHandle, label, status, false);
            updateSpansForHandle(paramHandle);
            
            // For custom strings, apply onChange logic
            if (paramConfig.enableSummary && paramConfig.summaryOnChange) {
                setParameterChecked(paramHandle, true);
            }
            
            // Update dropdown if visible
            const $select = $(`#${paramHandle}-select`);
            if ($select.length) {
                // Try to find or add the custom value
                if ($select.find(`option[value="${label}"]`).length === 0) {
                    // Option doesn't exist, select will show blank or first option
                }
            }
            
            return true;
        }
        
        // Found matching option - set the title as the value (like dropdown selection)
        const title = typeof matchingOpt === 'string' ? matchingOpt : matchingOpt.title;
        const isDefault = typeof matchingOpt !== 'string' && matchingOpt.default === true;
        
        setParamValue(paramHandle, title, status, false);
        selectedOptions[paramHandle] = matchingOpt;
        updateSpansForHandle(paramHandle);
        
        // Update dropdown if visible
        const $select = $(`#${paramHandle}-select`);
        if ($select.length) {
            $select.val(title);
        }
        
        // Apply summary checkbox logic (same as user selection)
        if (paramConfig.enableSummary) {
            const selectedLabel = typeof matchingOpt !== 'string' ? matchingOpt.label : matchingOpt;
            
            if (isDefault) {
                // Default option uses summaryDefault
                setParameterChecked(paramHandle, paramConfig.summaryDefault === true);
            } else if (paramConfig.summaryThreshold && Array.isArray(paramConfig.summaryThreshold)) {
                // Check if label is in threshold array
                setParameterChecked(paramHandle, paramConfig.summaryThreshold.includes(selectedLabel));
            } else if (paramConfig.summaryNotThreshold && Array.isArray(paramConfig.summaryNotThreshold)) {
                // Check if label is NOT in threshold array
                setParameterChecked(paramHandle, !paramConfig.summaryNotThreshold.includes(selectedLabel));
            } else if (paramConfig.summaryOnChange) {
                // Non-default with summaryOnChange = check
                setParameterChecked(paramHandle, true);
            }
        }
        
        return true;
    }
    
    /**
     * Load algorithm files dynamically and run them
     * Called when user clicks [Auto] button
     */
    function loadAndRunAlgorithms() {
        const currentConfig = reportConfigs.find(c => c.id === $('#report-config-select').val());
        if (!currentConfig) {
            console.warn('[Algorithm] No active report config');
            return;
        }
        
        const algorithmFiles = currentConfig.algorithms || [];
        if (algorithmFiles.length === 0) {
            console.log('[Algorithm] No algorithms configured for this template');
            alert('No algorithms configured for this template.');
            return;
        }
        
        console.log(`[Algorithm] Loading ${algorithmFiles.length} algorithm file(s)...`);
        
        // Clear previous algorithms
        window.algorithms = [];
        
        // Track loading state
        let loaded = 0;
        const total = algorithmFiles.length;
        
        // Remove any previously loaded algorithm scripts
        document.querySelectorAll('script[data-algorithm]').forEach(s => s.remove());
        
        algorithmFiles.forEach(file => {
            const script = document.createElement('script');
            script.src = file;
            script.setAttribute('data-algorithm', 'true');
            script.onload = function() {
                loaded++;
                console.log(`[Algorithm] Loaded: ${file}`);
                
                if (loaded === total) {
                    // All loaded - run algorithms
                    runAlgorithms();
                }
            };
            script.onerror = function() {
                loaded++;
                console.error(`[Algorithm] Failed to load: ${file}`);
                
                if (loaded === total) {
                    // Still run any successfully loaded algorithms
                    runAlgorithms();
                }
            };
            document.head.appendChild(script);
        });
    }
    
    /**
     * Run all loaded algorithms
     */
    function runAlgorithms() {
        if (!window.algorithms || !Array.isArray(window.algorithms) || window.algorithms.length === 0) {
            console.log('[Algorithm] No algorithms to run');
            return;
        }
        
        console.log(`[Algorithm] Running ${window.algorithms.length} algorithm(s)...`);
        
        const context = createAlgorithmContext();
        const changedHandles = [];
        const results = [];
        
        window.algorithms.forEach(algorithm => {
            if (!algorithm.evaluate || typeof algorithm.evaluate !== 'function') {
                console.warn(`[Algorithm] ${algorithm.id || 'Unknown'} has no evaluate function`);
                return;
            }
            
            try {
                const output = algorithm.evaluate(context);
                
                if (output && typeof output === 'object') {
                    Object.entries(output).forEach(([paramHandle, label]) => {
                        if (label !== null && label !== undefined) {
                            const success = setParameterByLabel(paramHandle, label);
                            if (success) {
                                changedHandles.push(paramHandle);
                                results.push({
                                    algorithm: algorithm.id || algorithm.name,
                                    param: paramHandle,
                                    label: label
                                });
                            }
                        }
                    });
                }
            } catch (e) {
                console.error(`[Algorithm] Error in ${algorithm.id || algorithm.name}:`, e);
            }
        });
        
        // Update UI for all changed parameters
        if (changedHandles.length > 0) {
            updateChangedParameters(changedHandles);
            updateSummary();
            
            console.log('[Algorithm] Results:', results);
        } else {
            console.log('[Algorithm] No changes made');
        }
    }
    
    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    
    function autoResizeTextarea($textarea, minHeight) {
        if (!$textarea || !$textarea.length) return;
        
        if (minHeight) {
            $textarea.css('height', minHeight + 'px');
            const scrollHeight = $textarea[0].scrollHeight;
            if (scrollHeight > minHeight) {
                $textarea.css('height', scrollHeight + 'px');
            }
        } else {
            $textarea.css('height', 'auto');
            $textarea.css('height', $textarea[0].scrollHeight + 'px');
        }
    }
    
    // ============================================================================
    // CONFIG LOADING
    // ============================================================================
    
    // Track current config for selective rebuild
    let currentConfigId = null;
    let currentParametersFile = null;
    let currentInputFile = null;
    
    if (typeof reportConfigs !== 'undefined') {
        reportConfigs.forEach(config => {
            const option = `<option value="${config.id}">${config.name}</option>`;
            $("#report-config-select").append(option);
            
            if (config.default) {
                $("#report-config-select").val(config.id);
            }
        });
    }
    
    function loadReportConfig(configId, forceFullRebuild = false) {
        const config = reportConfigs.find(c => c.id === configId);
        if (!config) return;
        
        // Check if we need full rebuild
        const parametersChanged = currentParametersFile !== config.parameters;
        const inputChanged = currentInputFile !== null && typeof inputConfigs !== 'undefined' && 
            inputConfigs.find(c => c.default)?.file !== currentInputFile;
        
        const needsFullRebuild = forceFullRebuild || 
            currentConfigId === null || 
            parametersChanged || 
            inputChanged;
        
        // Update tracking
        currentConfigId = configId;
        currentParametersFile = config.parameters;
        
        if (!needsFullRebuild) {
            // Partial update - only reload report template, options, measurements, manual
            // but don't reinitialize registry or rebuild form
            console.log(`[v6.0] Partial config update: ${config.name} (parameters unchanged)`);
            
            // Just reload the report template and update display
            document.querySelectorAll('script[data-report-template], script[data-options-config], script[data-measurements-config], script[data-manual-config]').forEach(s => s.remove());
            
            let templatesLoaded = { report: false, options: false, measurements: false, manual: false };
            
            function checkPartialLoaded() {
                if (templatesLoaded.report && templatesLoaded.options && templatesLoaded.measurements && templatesLoaded.manual) {
                    console.log(`[v6.0] Partial update complete: ${config.name}`);
                    
                    // Clear preprocessed template cache
                    clearPreprocessedTemplate();
                    
                    // Update the report display without reinitializing registry
                    updateReportTextarea();
                    updateSummary();
                }
            }
            
            // Load measurements
            const measurementsScript = document.createElement('script');
            measurementsScript.src = config.measurements;
            measurementsScript.setAttribute('data-measurements-config', 'true');
            measurementsScript.onload = function() {
                if (window.measurements) measurements = window.measurements;
                templatesLoaded.measurements = true;
                checkPartialLoaded();
            };
            document.head.appendChild(measurementsScript);
            
            // Load options (supports array of files)
            const partialOptionsArray = Array.isArray(config.options) ? config.options : [config.options];
            let partialOptionsLoaded = 0;
            const partialLoadedSections = [];
            
            partialOptionsArray.forEach((optFile, fIdx) => {
                const optionsScript = document.createElement('script');
                optionsScript.src = optFile;
                optionsScript.setAttribute('data-options-config', 'true');
                optionsScript.onload = function() {
                    if (window.options) {
                        window.options.forEach(section => {
                            if (section.modalKey) {
                                modalToFileIndex[section.modalKey] = fIdx;
                                section._fileIndex = fIdx;
                            }
                            partialLoadedSections.push(section);
                        });
                    }
                    partialOptionsLoaded++;
                    if (partialOptionsLoaded === partialOptionsArray.length) {
                        options = partialLoadedSections;
                        templatesLoaded.options = true;
                        checkPartialLoaded();
                    }
                };
                document.head.appendChild(optionsScript);
            });
            
            // Load report template
            const reportScript = document.createElement('script');
            reportScript.src = config.report;
            reportScript.setAttribute('data-report-template', 'true');
            reportScript.onload = function() {
                templatesLoaded.report = true;
                checkPartialLoaded();
            };
            document.head.appendChild(reportScript);
            
            // Load manual config
            if (config.manual) {
                const manualScript = document.createElement('script');
                manualScript.src = config.manual;
                manualScript.setAttribute('data-manual-config', 'true');
                manualScript.onload = function() {
                    templatesLoaded.manual = true;
                    checkPartialLoaded();
                };
                document.head.appendChild(manualScript);
            } else {
                templatesLoaded.manual = true;
                checkPartialLoaded();
            }
            
            return;
        }
        
        // Full rebuild
        console.log(`[v6.0] Full config rebuild: ${config.name}`);
        
        document.querySelectorAll('script[data-measurements-config], script[data-parameters-config], script[data-options-config], script[data-report-template], script[data-manual-config]').forEach(s => s.remove());
        
        let measurementsLoaded = false;
        let parametersLoaded = false;
        let optionsLoaded = false;
        let reportTemplateLoaded = false;
        let manualConfigLoaded = false;
        
        function checkAllLoaded() {
            if (measurementsLoaded && parametersLoaded && optionsLoaded && reportTemplateLoaded && manualConfigLoaded) {
                console.log(`[v6.5] Loaded config: ${config.name}`);
                
                Object.keys(selectedOptions).forEach(key => delete selectedOptions[key]);
                summaryManuallyEdited = false;
                
                if (window.manualConfig && Array.isArray(window.manualConfig)) {
                    window.manualConfig.forEach(item => {
                        if (!parseConfigMap[item.handle]) {
                            parseConfigMap[item.handle] = item;
                        }
                    });
                }
                
                initializeRegistry();
                generateMeasurementsTable();
                runCalculations();
                
                $("#options-content").empty();
                buildOptionsForm();
                
                // Show/hide algorithm button based on whether algorithms are configured
                const algorithmFiles = config.algorithms || [];
                if (algorithmFiles.length > 0) {
                    $('#run-algorithms').show();
                } else {
                    $('#run-algorithms').hide();
                }
                
                // Safety: ensure summary is definitely populated after full initialization
                setTimeout(function() {
                    updateSummary();
                }, 100);
                
                reportConfigLoaded = true;
            }
        }
        
        // Load measurements
        const measurementsScript = document.createElement('script');
        measurementsScript.src = config.measurements;
        measurementsScript.setAttribute('data-measurements-config', 'true');
        measurementsScript.onload = function() {
            if (window.measurements && Array.isArray(window.measurements)) {
                measurements = window.measurements;
                measurementsLoaded = true;
                checkAllLoaded();
            }
        };
        measurementsScript.onerror = () => alert(`Failed to load measurements: ${config.name}`);
        document.head.appendChild(measurementsScript);
        
        // Load parameters
        if (config.parameters) {
            const parametersScript = document.createElement('script');
            parametersScript.src = config.parameters;
            parametersScript.setAttribute('data-parameters-config', 'true');
            parametersScript.onload = function() {
                if (window.parameters && typeof window.parameters === 'object') {
                    parameters = window.parameters;
                    parametersLoaded = true;
                    checkAllLoaded();
                }
            };
            parametersScript.onerror = () => alert(`Failed to load parameters: ${config.name}`);
            document.head.appendChild(parametersScript);
        } else {
            parametersLoaded = true;
            checkAllLoaded();
        }
        
        // Load options (now supports array of files)
        const optionsFilesArray = Array.isArray(config.options) ? config.options : [config.options];
        let optionsFilesLoaded = 0;
        const loadedOptionsSections = [];
        
        // Clear previous options files tracking
        optionsFiles = [];
        Object.keys(modalToFileIndex).forEach(k => delete modalToFileIndex[k]);
        
        if (optionsFilesArray.length === 0) {
            optionsLoaded = true;
            checkAllLoaded();
        } else {
            optionsFilesArray.forEach((optionsFile, fileIndex) => {
                const optionsScript = document.createElement('script');
                optionsScript.src = optionsFile;
                optionsScript.setAttribute('data-options-config', 'true');
                optionsScript.setAttribute('data-options-index', fileIndex);
                optionsScript.onload = function() {
                    if (window.options && Array.isArray(window.options)) {
                        // Store the modals from this file with their file index
                        const fileEntry = {
                            file: optionsFile,
                            fileIndex: fileIndex,
                            modals: [],
                            // Capture optional metadata (icon, title) from the options file
                            meta: window.optionsFileMeta || null
                        };
                        
                        // Clear the meta for the next file
                        window.optionsFileMeta = null;
                        
                        window.options.forEach(section => {
                            if (section.modalKey) {
                                // Track which file this modal belongs to
                                modalToFileIndex[section.modalKey] = fileIndex;
                                fileEntry.modals.push(section.modalKey);
                                
                                // Add file index to section for navigation
                                section._fileIndex = fileIndex;
                            }
                            loadedOptionsSections.push(section);
                        });
                        
                        optionsFiles.push(fileEntry);
                        console.log(`[v6.5] Loaded options file ${fileIndex}: ${optionsFile} with modals:`, fileEntry.modals, 'meta:', fileEntry.meta);
                    }
                    
                    optionsFilesLoaded++;
                    if (optionsFilesLoaded === optionsFilesArray.length) {
                        // All options files loaded - merge into single options array
                        options = loadedOptionsSections;
                        
                        // Sort optionsFiles by fileIndex to maintain order
                        optionsFiles.sort((a, b) => a.fileIndex - b.fileIndex);
                        
                        // Show/hide secondary options button based on whether there's more than one file
                        if (optionsFilesArray.length > 1) {
                            const $secondaryBtn = $('#open-secondary-options');
                            $secondaryBtn.show();
                            
                            // Update button icon and title from second file's meta if available
                            const secondFile = optionsFiles.find(f => f.fileIndex === 1);
                            if (secondFile && secondFile.meta) {
                                if (secondFile.meta.icon) {
                                    $secondaryBtn.html(secondFile.meta.icon);
                                }
                                if (secondFile.meta.title) {
                                    $secondaryBtn.attr('title', secondFile.meta.title);
                                }
                            }
                        } else {
                            $('#open-secondary-options').hide();
                        }
                        
                        optionsLoaded = true;
                        checkAllLoaded();
                    }
                };
                optionsScript.onerror = () => {
                    optionsFilesLoaded++;
                    console.error(`Failed to load options file: ${optionsFile}`);
                    if (optionsFilesLoaded === optionsFilesArray.length) {
                        options = loadedOptionsSections;
                        optionsLoaded = true;
                        checkAllLoaded();
                    }
                };
                document.head.appendChild(optionsScript);
            });
        }
        
        // Load report template
        const reportScript = document.createElement('script');
        reportScript.src = config.report;
        reportScript.setAttribute('data-report-template', 'true');
        reportScript.onload = function() {
            reportTemplateLoaded = true;
            checkAllLoaded();
        };
        reportScript.onerror = () => alert(`Failed to load report template: ${config.name}`);
        document.head.appendChild(reportScript);
        
        // Load manual config
        if (config.manual) {
            const manualScript = document.createElement('script');
            manualScript.src = config.manual;
            manualScript.setAttribute('data-manual-config', 'true');
            manualScript.onload = function() {
                manualConfigLoaded = true;
                checkAllLoaded();
            };
            manualScript.onerror = () => {
                console.warn(`Manual config not found: ${config.manual}`);
                manualConfigLoaded = true;
                checkAllLoaded();
            };
            document.head.appendChild(manualScript);
        } else {
            manualConfigLoaded = true;
            checkAllLoaded();
        }
    }
    
    // Load parse config
    if (typeof inputConfigs !== 'undefined') {
        inputConfigs.forEach(config => {
            const option = `<option value="${config.id}">${config.name}</option>`;
            $("#parse-config-select").append(option);
            
            if (config.default) {
                $("#parse-config-select").val(config.id);
            }
        });
        
        const defaultInputConfig = inputConfigs.find(c => c.default);
        if (defaultInputConfig) {
            // Track current input file for selective rebuild
            currentInputFile = defaultInputConfig.file;
            
            const script = document.createElement('script');
            script.src = defaultInputConfig.file;
            script.onload = function() {
                if (window.parseConfig && Array.isArray(window.parseConfig)) {
                    parseConfig = window.parseConfig;
                    parseConfigMap = {};
                    parseConfig.forEach(item => {
                        if (item.handle) {
                            parseConfigMap[item.handle] = item;
                        }
                    });
                }
                
                // FIX: Load example data script
                if (defaultInputConfig.exampledata) {
                    const exampleScript = document.createElement('script');
                    exampleScript.src = defaultInputConfig.exampledata;
                    exampleScript.onload = function() {
                        console.log('[v6.0] Example data loaded');
                    };
                    document.head.appendChild(exampleScript);
                }
            };
            document.head.appendChild(script);
        }
    }
    
    function buildOptionsForm() {
        window.options = options;
        window.parameters = parameters;
        window.selectedOptions = selectedOptions;
        
        options.forEach(section => {
            if (!section.variables) return;
            
            section.variables.forEach(varKey => {
                const paramConfig = window.parameters?.[varKey];
                if (!paramConfig) return;
                
                if (paramConfig.options && Array.isArray(paramConfig.options)) {
                    const defaultOpt = paramConfig.options.find(opt => 
                        typeof opt !== 'string' && opt.default === true
                    );
                    
                    if (defaultOpt && !registry[varKey]?.value) {
                        setParamValue(varKey, defaultOpt.title, 'clean', false);
                    }
                }
            });
        });
        
        if (typeof window.buildForm === 'function') {
            window.buildForm();
        } else {
            console.error('[v6.0] form.js not loaded - buildForm not available');
        }
    }
    
    function populateModalTextareas() {
        options.forEach(section => {
            if (section.modalKey) {
                updateModalPreview(section.modalKey);
            }
        });
        
        updateSummary();
    }
    
    function updateModalPreview(modalKey) {
        // Placeholder for modal preview updates
    }
    
    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================
    
    $("#report-config-select").on("change", function() {
        const configId = $(this).val();
        loadReportConfig(configId);
    });
    
    $("#open-import-modal").on("click", function() {
        $("#import-modal").addClass("active");
    });
    
    // Secondary options button - opens first modal in second options file
    $("#open-secondary-options").on("click", function() {
        if (optionsFiles.length > 1) {
            const firstModalInSecondFile = window.getFirstModalInFile(1);
            if (firstModalInSecondFile && typeof window.openModal === 'function') {
                window.openModal(firstModalInSecondFile);
            } else {
                console.warn('[v6.5] No modals found in secondary options file');
            }
        } else {
            console.warn('[v6.5] No secondary options file loaded');
        }
    });
    
    $("#close-import-modal").on("click", function() {
        $("#import-modal").removeClass("active");
    });
    
    // FIX: Load example data button
    $("#load-example-data").on("click", function() {
        if (window.parseExample) {
            $("#report").val(window.parseExample);
        } else {
            // Try loading it now
            const defaultInputConfig = inputConfigs?.find(c => c.default);
            if (defaultInputConfig?.exampledata) {
                const script = document.createElement('script');
                script.src = defaultInputConfig.exampledata;
                script.onload = function() {
                    if (window.parseExample) {
                        $("#report").val(window.parseExample);
                    } else {
                        console.warn('[v6.0] parseExample still not available');
                    }
                };
                document.head.appendChild(script);
            }
        }
    });
    
    $("#clear-import").on("click", function() {
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
    window.updateSpanColorClass = updateSpanColorClass;
    
    window.generateSpanId = generateSpanId;
    window.addSpanIdToRegistry = addSpanIdToRegistry;
    window.removeSpanIdFromRegistry = removeSpanIdFromRegistry;
    window.updateSpansForHandle = updateSpansForHandle;
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