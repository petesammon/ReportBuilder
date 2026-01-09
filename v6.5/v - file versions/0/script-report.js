/* jshint loopfunc: true, esversion: 11 */
/* EchoTools v6.20 - Central Registry with Span-based ContentEditable */

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
    
    // Configuration storage
    let parseConfig = [];
    let parseConfigMap = {};
    let measurements = [];
    let parameters = {};
    let options = [];
    
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
            
            if (excludeSpanId && spanId === excludeSpanId) {
                return;
            }
            
            const displayValue = getDisplayValueForEntry(entry);
            
            $span.text(displayValue || '');
            $span.attr('data-status', entry.status);
            updateSpanColorClass($span, entry.type, entry.status);
        });
        
        isUpdatingSpans = wasUpdating;
    }
    
    function updateSpanColorClass($span, type, status) {
        $span.removeClass('span-clean-measurement span-clean-parameter span-clean-fixed span-dirty span-unknown');
        
        if (status === 'dirty') {
            $span.addClass('span-dirty');
        } else {
            switch (type) {
                case 'measurement':
                    $span.addClass('span-clean-measurement');
                    break;
                case 'parameter':
                    $span.addClass('span-clean-parameter');
                    break;
                case 'fixed-text':
                    $span.addClass('span-clean-fixed');
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
        preprocessedOutputTemplate = null;
        calculatedHandles.clear();
        
        // Build set of calculated measurement handles
        if (typeof window.calculations === 'object' && window.calculations !== null) {
            Object.keys(window.calculations).forEach(key => {
                calculatedHandles.add(key);
            });
        }
        
        // Register measurements
        if (measurements && Array.isArray(measurements)) {
            measurements.forEach(group => {
                if (!group.items) return;
                
                group.items.forEach(measurementKey => {
                    let config = parseConfigMap[measurementKey];
                    if (!config && window.manualConfig) {
                        config = window.manualConfig.find(m => m.handle === measurementKey);
                    }
                    
                    registry[measurementKey] = {
                        type: 'measurement',
                        value: '',
                        unit: config?.unit || '',
                        status: 'clean',
                        spanIds: []
                    };
                });
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
                    status: 'clean',
                    spanIds: []
                };
            });
        }
        
        // Register Summary
        registry['Summary'] = {
            type: 'parameter',
            value: '',
            status: 'clean',
            spanIds: []
        };
        
        console.log('[v6.20 Registry] Initialized with', Object.keys(registry).length, 'entries');
        console.log('[v6.20 Registry] Calculated handles:', Array.from(calculatedHandles));
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
            
            const entry = registry[varName];
            
            if (entry) {
                const spanId = generateSpanId();
                addSpanIdToRegistry(varName, spanId);
                
                const type = entry.type;
                const status = entry.status || 'clean';
                
                let cssClass = 'span-unknown';
                if (status === 'dirty') {
                    cssClass = 'span-dirty';
                } else {
                    switch (type) {
                        case 'measurement': cssClass = 'span-clean-measurement'; break;
                        case 'parameter': cssClass = 'span-clean-parameter'; break;
                        case 'fixed-text': cssClass = 'span-clean-fixed'; break;
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
        
        console.log('[v6.0] Report textarea updated (full render)');
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
                    
                    const $row = $(`
                        <tr>
                            <td class="measurement-label">${label}</td>
                            <td class="measurement-value">
                                <input type="text" 
                                       class="measurement-input${calculatedClass}" 
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
    // SUMMARY FUNCTIONS
    // ============================================================================
    
    function updateSummary() {
        const summaryItems = [];
        const processedParams = new Set();
        const resultsWithUnits = prepareResultsWithUnits();
        
        // Process ALL parameters from window.parameters directly
        if (window.parameters && typeof window.parameters === 'object') {
            Object.entries(window.parameters).forEach(([varKey, paramConfig]) => {
                if (processedParams.has(varKey)) return;
                if (!paramConfig || !paramConfig.enableSummary) return;
                
                processedParams.add(varKey);
                
                const entry = registry[varKey];
                const isChecked = entry?.checked === true;
                const paramValue = entry?.value || '';
                
                const shouldInclude = isChecked && paramValue.trim();
                
                if (shouldInclude) {
                    let textToUse = paramValue;
                    
                    if (paramConfig.options && Array.isArray(paramConfig.options)) {
                        const selectedOpt = paramConfig.options.find(opt => {
                            const title = typeof opt === 'string' ? opt : opt.title;
                            return title === paramValue;
                        }) || selectedOptions[varKey];
                        
                        if (selectedOpt && typeof selectedOpt !== 'string' && selectedOpt.summarytext) {
                            textToUse = selectedOpt.summarytext;
                        }
                    } else if (paramConfig.summarytext) {
                        textToUse = paramConfig.summarytext;
                    }
                    
                    if (textToUse && textToUse.includes('{{')) {
                        try {
                            const template = Handlebars.compile(textToUse);
                            textToUse = template(resultsWithUnits);
                        } catch (e) {
                            console.warn(`[v6.0] Failed to process summary text for ${varKey}:`, e);
                        }
                    }
                    
                    if (textToUse) {
                        summaryItems.push({
                            key: varKey,
                            text: textToUse,
                            order: paramConfig.summaryOrder || 100
                        });
                    }
                }
            });
        }
        
        summaryItems.sort((a, b) => a.order - b.order);
        
        const groupedItems = {};
        summaryItems.forEach(item => {
            const order = item.order;
            if (!groupedItems[order]) {
                groupedItems[order] = [];
            }
            groupedItems[order].push(item.text);
        });
        
        const lines = Object.values(groupedItems).map(items => {
            let result = '';
            items.forEach((text, index) => {
                if (index === 0) {
                    result += text.startsWith('^') ? text.substring(1) : text;
                } else {
                    result += text.startsWith('^') ? text.substring(1) : ' ' + text;
                }
            });
            return result;
        });
        
        const autoGeneratedContent = lines.join('\n');
        
        if (summaryManuallyEdited && registry['Summary']?.value) {
            const currentLines = registry['Summary'].value.split('\n').filter(line => line.trim());
            const autoLines = autoGeneratedContent.split('\n').filter(line => line.trim());
            const newLines = autoLines.filter(line => !currentLines.includes(line));
            
            if (newLines.length > 0) {
                const updatedContent = registry['Summary'].value + '\n' + newLines.join('\n');
                setParamValue('Summary', updatedContent, 'dirty', false);
            }
        } else {
            setParamValue('Summary', autoGeneratedContent, 'clean', false);
        }
        
        updateSpansForHandle('Summary');
        
        const $summaryTextarea = $('#Summary-textarea');
        if ($summaryTextarea.length && !$summaryTextarea.is(':focus')) {
            $summaryTextarea.val(registry['Summary']?.value || '');
            autoResizeTextarea($summaryTextarea);
        }
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
     * Run all calculations and update registry with results
     * Calculated values are treated as 'clean' - same as imported values
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
            
            // Load options
            const optionsScript = document.createElement('script');
            optionsScript.src = config.options;
            optionsScript.setAttribute('data-options-config', 'true');
            optionsScript.onload = function() {
                if (window.options) options = window.options;
                templatesLoaded.options = true;
                checkPartialLoaded();
            };
            document.head.appendChild(optionsScript);
            
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
                console.log(`[v6.0] Loaded config: ${config.name}`);
                
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
        
        // Load options
        const optionsScript = document.createElement('script');
        optionsScript.src = config.options;
        optionsScript.setAttribute('data-options-config', 'true');
        optionsScript.onload = function() {
            if (window.options && Array.isArray(window.options)) {
                options = window.options;
                optionsLoaded = true;
                checkAllLoaded();
            }
        };
        optionsScript.onerror = () => alert(`Failed to load options: ${config.name}`);
        document.head.appendChild(optionsScript);
        
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
    window.autoResizeTextarea = autoResizeTextarea;
    window.populateModalTextareas = populateModalTextareas;
    window.updateModalPreview = updateModalPreview;
    window.scrollToMeasurementModal = scrollToMeasurementModal;
    window.cacheModalScrollPositions = cacheModalScrollPositions;
    window.generateMeasurementsTable = generateMeasurementsTable;
    
    window.parameters = parameters;
    window.options = options;
    window.measurements = measurements;
    window.getParseConfigMap = function() { return parseConfigMap; };
    
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