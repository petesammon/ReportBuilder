/* jshint loopfunc: true, esversion: 11 */
/* 
 * EchoTools v5.0 - Report Script
 * New architecture: Parameter-centric with contenteditable output
 */

jQuery(document).ready(function () {
    // Show the options section
    $("#options").show();
    
    // Clear the import modal textarea on page load
    $("#report").val("");
    
    // =========================================================================
    // CORE DATA STRUCTURES - v5.0
    // =========================================================================
    
    /**
     * Parameter data storage
     * Each parameter stores: value, exclusion state, manual edit tracking
     * 
     * Structure:
     * {
     *   pQuality: {
     *     value: "Fair",
     *     excluded: false,      // Omitted = false
     *     manualEdit: false,    // User manually edited in contenteditable?
     *     modalValue: "Fair"    // Last value set via modal
     *   }
     * }
     */
    const parameterData = {};
    
    /**
     * Parsed measurement data from import
     */
    const results = {};
    
    /**
     * Configuration storage
     */
    let parseConfig = [];
    let parseConfigMap = {};
    let measurements = [];
    let options = [];
    let manualConfig = [];
    
    // =========================================================================
    // HANDLEBARS HELPERS - v5.0
    // =========================================================================
    
    /**
     * Parameter helper - wraps parameters in spans with data attributes
     * Usage: {{p 'paramName'}} or {{p 'paramName' conditional=true}}
     */
    Handlebars.registerHelper('p', function(paramName, options) {
        const param = parameterData[paramName];
        
        // If excluded or doesn't exist, return empty
        if (!param || param.excluded) {
            return '';
        }
        
        // CRITICAL: Use processed value from template context if available
        // (e.g., pLVMeasurements with nested {{IVSd}} variables already processed)
        // Otherwise fall back to raw value from parameterData
        const contextValue = this[paramName];
        const paramValue = param.value || '';
        const value = contextValue !== undefined ? contextValue : paramValue;
        
        // Debug logging for nested templates
        if (paramValue.includes('{{')) {
            console.log(`p helper for ${paramName}:`);
            console.log(`  Raw param.value: ${paramValue.substring(0, 60)}...`);
            console.log(`  Context value: ${contextValue ? contextValue.substring(0, 60) + '...' : 'undefined'}`);
            console.log(`  Using: ${value.substring(0, 60)}...`);
        }
        
        const conditional = options.hash && options.hash.conditional ? ' data-conditional="true"' : '';
        const manualClass = param.manualEdit ? ' manually-edited' : '';
        
        return new Handlebars.SafeString(
            `<span class="param-value${manualClass}" data-param="${paramName}"${conditional}>${value}</span>`
        );
    });
    
    /**
     * Conditional parameter check - for {{#if}} blocks
     * Returns true if parameter exists, has value, and is not excluded
     */
    Handlebars.registerHelper('hasParam', function(paramName) {
        const param = parameterData[paramName];
        return param && !param.excluded && param.value && param.value !== '';
    });
    
    /**
     * Summary helper - renders the generated summary text
     * Usage: {{summary}}
     * Note: This doesn't use {{p}} wrapping because summary is composed of multiple parameters
     */
    Handlebars.registerHelper('summary', function() {
        // generateSummary() will be called before template compilation
        // The summary text is passed in the template data
        return new Handlebars.SafeString(this.Summary || '');
    });
    
    // =========================================================================
    // PARAMETER MANAGEMENT - v5.0
    // =========================================================================
    
    /**
     * Initialize parameter with default value
     */
    function initializeParameter(paramKey, defaultValue = '', excluded = false) {
        if (!parameterData[paramKey]) {
            parameterData[paramKey] = {
                value: defaultValue,
                excluded: excluded,
                manualEdit: false,
                modalValue: defaultValue,
                summaryIncluded: false  // Track manual summary checkbox state
            };
        }
    }
    
    /**
     * Update parameter value (typically from modal)
     */
    function updateParameter(paramKey, value, fromModal = true) {
        if (!parameterData[paramKey]) {
            initializeParameter(paramKey, value);
        }
        
        const param = parameterData[paramKey];
        
        if (fromModal) {
            // Modal update - override manual edits
            param.modalValue = value;
            param.value = value;
            param.manualEdit = false;
        } else {
            // Automatic/calculated update - preserve if manually edited
            param.modalValue = value;
            if (!param.manualEdit) {
                param.value = value;
            }
        }
        
        regenerateReport();
    }
    
    /**
     * Exclude/include parameters by sectionPreviewKey
     */
    function excludeParametersBySection(sectionPreviewKey, exclude = true) {
        // Find all parameters in this section from opt-form.js
        const formSection = window.formSections.find(s => s.sectionPreviewKey === sectionPreviewKey);
        if (!formSection || !formSection.parameters) {
            console.warn(`No formSection found for ${sectionPreviewKey}`);
            return;
        }
        
        console.log(`${exclude ? 'Excluding' : 'Including'} section ${sectionPreviewKey}, parameters:`, formSection.parameters);
        
        formSection.parameters.forEach(paramKey => {
            if (parameterData[paramKey]) {
                parameterData[paramKey].excluded = exclude;
                console.log(`  Set ${paramKey}.excluded = ${exclude}`);
            }
        });
        
        regenerateReport();
    }
    
    /**
     * Get template data (filtered for excluded parameters)
     */
    function getTemplateData() {
        const baseData = {};
        
        // First pass: Add ALL measurement keys from parseConfigMap
        // This ensures {{IVSd}}, {{LVPWd}}, etc. are defined even if empty
        Object.keys(parseConfigMap).forEach(key => {
            baseData[key] = results[key] || '';
        });
        
        // Add units to non-empty values
        Object.entries(results).forEach(([key, value]) => {
            if (!value) return; // Skip empty values
            
            const config = parseConfigMap[key];
            if (config?.unit) {
                const unit = config.unit;
                baseData[key] = value.toString().endsWith(unit) ? value : value + unit;
            } else {
                baseData[key] = value;
            }
        });
        
        // Add calculated values to base data
        if (typeof calculations !== 'undefined') {
            Object.keys(calculations).forEach(key => {
                try {
                    baseData[key] = calculations[key](baseData);
                } catch (e) {
                    console.warn(`Failed to calculate ${key}:`, e);
                }
            });
        }
        
        // Second pass: Process parameters that may contain Handlebars templates
        // Some parameters like pLVMeasurements contain {{IVSd}}, {{LVPWd}}, etc.
        const processedParams = {};
        for (let key in parameterData) {
            const param = parameterData[key];
            if (param.excluded) continue;
            
            const value = param.value || '';
            
            // Check if this parameter value contains Handlebars variables
            if (typeof value === 'string' && value.includes('{{')) {
                console.log(`Processing nested template in ${key}:`, value.substring(0, 100));
                console.log('Available baseData keys:', Object.keys(baseData));
                try {
                    // Compile and render the nested template
                    const template = Handlebars.compile(value);
                    const processed = template(baseData);
                    console.log(`Processed result for ${key}:`, processed.substring(0, 100));
                    processedParams[key] = processed;
                } catch (e) {
                    console.warn(`Failed to process nested template in ${key}:`, e);
                    processedParams[key] = value;
                }
            } else {
                processedParams[key] = value;
            }
        }
        
        // Merge everything together
        const data = { ...baseData, ...processedParams };
        
        return data;
    }
    
    /**
     * Generate Summary section content
     * @param {Object} processedData - Template data with processed nested Handlebars
     */
    function generateSummary(processedData = {}) {
        // Collect all summary-enabled parameters
        const summaryItems = [];
        
        options.forEach(paramConfig => {
            const paramKey = paramConfig.parameter;
            if (!paramConfig.enableSummary) return;
            
            const param = parameterData[paramKey];
            if (!param || param.excluded) return;
            
            // Determine if this parameter should be included in summary
            let includeInSummary = false;
            
            // 1. Always include if summaryAlwaysInclude is true
            if (paramConfig.summaryAlwaysInclude) {
                includeInSummary = true;
            }
            // 2. Include if manually checked via checkbox
            else if (param.summaryIncluded) {
                includeInSummary = true;
            }
            // 3. Include if summaryDefault is true (and not manually edited to uncheck)
            else if (paramConfig.summaryDefault && !param.manualEdit) {
                includeInSummary = true;
            }
            // 4. Include if summaryOnChange and value has changed from default
            else if (paramConfig.summaryOnChange) {
                // Find the default option
                const defaultOption = Array.isArray(paramConfig.options) 
                    ? paramConfig.options.find(opt => opt.default === true)
                    : null;
                const defaultValue = defaultOption ? (defaultOption.title || defaultOption.label) : '';
                
                // Include if current value differs from default
                if (param.value && param.value !== defaultValue) {
                    includeInSummary = true;
                }
            }
            // 5. Include if value matches summaryThreshold
            else if (paramConfig.summaryThreshold && Array.isArray(paramConfig.summaryThreshold)) {
                // Get the current option label
                const currentOption = Array.isArray(paramConfig.options)
                    ? paramConfig.options.find(opt => (opt.title || opt.label) === param.value)
                    : null;
                const currentLabel = currentOption ? currentOption.label : '';
                
                // Include if current label is in threshold array
                if (paramConfig.summaryThreshold.includes(currentLabel)) {
                    includeInSummary = true;
                }
            }
            
            if (!includeInSummary) return;
            
            // Get summary text
            let summaryText = '';
            if (paramConfig.summary) {
                // This is a summary-specific parameter
                // Use PROCESSED value from template data if available
                const rawValue = param.value;
                const processedValue = processedData[paramKey];
                summaryText = processedValue !== undefined ? processedValue : rawValue;
                
                // Debug log for nested templates
                if (rawValue && rawValue.includes('{{')) {
                    console.log(`Summary for ${paramKey}:`);
                    console.log(`  Raw value: ${rawValue}`);
                    console.log(`  Processed value: ${processedValue || 'undefined'}`);
                    console.log(`  Using: ${summaryText}`);
                }
            } else {
                // Check for option-level summarytext first
                let optionSummaryText = null;
                if (Array.isArray(paramConfig.options)) {
                    const currentOption = paramConfig.options.find(opt => 
                        (opt.title || opt.label) === param.value
                    );
                    if (currentOption && currentOption.summarytext) {
                        optionSummaryText = currentOption.summarytext;
                    }
                }
                
                // Use option-level summarytext, then parameter-level summarytext, then value
                if (optionSummaryText) {
                    summaryText = optionSummaryText;
                } else if (paramConfig.summarytext) {
                    summaryText = paramConfig.summarytext;
                } else if (param.value) {
                    summaryText = processedData[paramKey] !== undefined 
                        ? processedData[paramKey] 
                        : param.value;
                }
            }
            
            if (summaryText) {
                const orderValue = paramConfig.summaryOrder || 999;
                summaryItems.push({
                    order: orderValue,
                    text: summaryText,
                    paramKey: paramKey
                });
                console.log(`Adding to summary: ${paramKey} (order ${orderValue})`);
            }
        });
        
        // Apply summaryExclude filtering
        // Remove items whose paramKey is listed in another item's summaryExclude array
        const excludedParams = new Set();
        summaryItems.forEach(item => {
            const config = options.find(opt => opt.parameter === item.paramKey);
            if (config && config.summaryExclude && Array.isArray(config.summaryExclude)) {
                config.summaryExclude.forEach(excludeKey => excludedParams.add(excludeKey));
            }
        });
        
        const filteredItems = summaryItems.filter(item => !excludedParams.has(item.paramKey));
        
        console.log('Summary items before sort:', filteredItems.map(item => `${item.paramKey} (order ${item.order}): ${item.text.substring(0, 30)}...`));
        
        // Sort by order
        filteredItems.sort((a, b) => a.order - b.order);
        
        console.log('Summary items after sort:', filteredItems.map(item => `${item.paramKey} (order ${item.order}): ${item.text.substring(0, 30)}...`));
        
        // Compile summary text with newlines
        return filteredItems.map(item => item.text).join('\n');
    }
    
    // =========================================================================
    // CONTENTEDITABLE REPORT OUTPUT - v5.0
    // =========================================================================
    
    /**
     * Regenerate the entire report from template
     */
    function regenerateReport() {
        if (!window.outputTemplate) {
            console.warn('Output template not loaded yet');
            return;
        }
        
        const data = getTemplateData();
        
        // Generate summary with processed parameter values
        data.Summary = generateSummary(data);
        
        // Compile template to HTML with parameter spans
        const htmlOutput = window.outputTemplate(data);
        
        // Update contenteditable div
        const $reportOutput = $('#report-output');
        if ($reportOutput.length) {
            $reportOutput.html(htmlOutput);
            
            // Re-attach manual edit listeners
            attachManualEditListeners();
            
            // Re-render buttons after content changes
            if (typeof window.renderButtons === 'function') {
                setTimeout(window.renderButtons, 100);
            }
        }
    }
    
    /**
     * Attach listeners to detect manual edits in contenteditable
     */
    function attachManualEditListeners() {
        const $reportOutput = $('#report-output');
        
        // Remove previous listeners to avoid duplicates
        $reportOutput.off('input.manual-edit');
        
        // Attach new listener
        $reportOutput.on('input.manual-edit', function(e) {
            // Find which parameter span was edited
            let target = e.target;
            
            // If user is editing inside a span, find the span
            if (target.nodeType === Node.TEXT_NODE) {
                target = target.parentElement;
            }
            
            const $paramSpan = $(target).closest('[data-param]');
            
            if ($paramSpan.length) {
                const paramKey = $paramSpan.data('param');
                const newValue = $paramSpan.text().trim();
                
                if (parameterData[paramKey]) {
                    parameterData[paramKey].value = newValue;
                    parameterData[paramKey].manualEdit = true;
                    
                    // Add visual indicator
                    $paramSpan.addClass('manually-edited');
                    
                    console.log(`Manual edit: ${paramKey} = "${newValue}"`);
                }
            }
        });
        
        // Handle paste - strip formatting
        $reportOutput.on('paste', function(e) {
            e.preventDefault();
            
            // Get plain text from clipboard
            const text = (e.originalEvent || e).clipboardData.getData('text/plain');
            
            // Insert as plain text
            document.execCommand('insertText', false, text);
        });
    }
    
    // =========================================================================
    // CONFIGURATION LOADING - v5.0
    // =========================================================================
    
    /**
     * Load report configuration (measurements + options + template + manual)
     */
    function loadReportConfig(configId) {
        const config = reportConfigs.find(c => c.id === configId);
        if (!config) return;
        
        // Remove any previously loaded scripts
        document.querySelectorAll('script[data-measurements-config], script[data-options-config], script[data-report-template], script[data-manual-config], script[data-form-config]').forEach(s => s.remove());
        
        let measurementsLoaded = false;
        let optionsLoaded = false;
        let formLoaded = false;
        let reportTemplateLoaded = false;
        let manualConfigLoaded = false;
        
        function checkAllLoaded() {
            console.log('checkAllLoaded called:', {
                measurementsLoaded,
                optionsLoaded,
                formLoaded,
                reportTemplateLoaded,
                manualConfigLoaded
            });
            
            if (measurementsLoaded && optionsLoaded && formLoaded && reportTemplateLoaded && manualConfigLoaded) {
                console.log(`Loaded report config: ${config.name}`);
                
                // Initialize parameters from options
                initializeParametersFromOptions();
                
                console.log('Parameters initialized:', Object.keys(parameterData).length, 'parameters');
                
                // Generate measurements table
                if (typeof generateMeasurementsTable === 'function') {
                    generateMeasurementsTable();
                }
                
                // Run calculations
                runCalculations();
                
                // Build the form
                $("#options-content").empty();
                
                console.log('About to call buildForm, type:', typeof buildForm);
                
                // buildForm might not be available yet if script-form.js jQuery ready hasn't executed
                // Retry with delays if needed
                function tryBuildForm(attempt = 0) {
                    if (typeof buildForm === 'function') {
                        buildForm();
                    } else if (attempt < 10) {
                        console.log(`buildForm not ready, retrying in ${50 * (attempt + 1)}ms (attempt ${attempt + 1}/10)`);
                        setTimeout(() => tryBuildForm(attempt + 1), 50 * (attempt + 1));
                    } else {
                        console.error('buildForm is not a function after 10 attempts!', buildForm);
                    }
                }
                
                tryBuildForm();
                
                // Generate initial report
                regenerateReport();
            }
        }
        
        // Load measurements config
        const measurementsScript = document.createElement('script');
        measurementsScript.src = config.measurements;
        measurementsScript.setAttribute('data-measurements-config', 'true');
        measurementsScript.onload = function() {
            console.log('Measurements script loaded');
            if (window.measurements && Array.isArray(window.measurements)) {
                measurements = window.measurements;
                measurementsLoaded = true;
                console.log('Measurements config OK, calling checkAllLoaded');
                checkAllLoaded();
            } else {
                console.error('window.measurements not found or not array');
            }
        };
        measurementsScript.onerror = function() {
            console.error('Failed to load measurements script:', config.measurements);
        };
        document.head.appendChild(measurementsScript);
        
        // Load options config (new structure - opt-options.js)
        const optionsScript = document.createElement('script');
        optionsScript.src = config.options;
        optionsScript.setAttribute('data-options-config', 'true');
        optionsScript.onload = function() {
            console.log('Options script loaded');
            if (window.options && Array.isArray(window.options)) {
                options = window.options;
                optionsLoaded = true;
                console.log('Options config OK, calling checkAllLoaded');
                checkAllLoaded();
            } else {
                console.error('window.options not found or not array');
            }
        };
        optionsScript.onerror = function() {
            console.error('Failed to load options script:', config.options);
        };
        document.head.appendChild(optionsScript);
        
        // Load form config (new in v5.0 - opt-form.js with formSections)
        const formScript = document.createElement('script');
        formScript.src = config.form;
        formScript.setAttribute('data-form-config', 'true');
        formScript.onload = function() {
            console.log('Form script loaded');
            if (window.formSections && Array.isArray(window.formSections)) {
                formLoaded = true;
                console.log('Form config OK, calling checkAllLoaded');
                checkAllLoaded();
            } else {
                console.error('window.formSections not found or not array');
            }
        };
        formScript.onerror = function() {
            console.error('Failed to load form script:', config.form);
        };
        document.head.appendChild(formScript);
        
        // Load report template
        const reportTemplateScript = document.createElement('script');
        reportTemplateScript.src = config.report;
        reportTemplateScript.setAttribute('data-report-template', 'true');
        reportTemplateScript.onload = function() {
            console.log('Report template script loaded');
            if (window.outputTemplate && typeof window.outputTemplate === 'function') {
                reportTemplateLoaded = true;
                console.log('Report template OK, calling checkAllLoaded');
                checkAllLoaded();
            } else {
                console.error('window.outputTemplate not found or not function');
            }
        };
        reportTemplateScript.onerror = function() {
            console.error('Failed to load report template:', config.report);
        };
        document.head.appendChild(reportTemplateScript);
        
        // Load manual measurements config (if specified)
        if (config.manual) {
            const manualConfigScript = document.createElement('script');
            manualConfigScript.src = config.manual;
            manualConfigScript.setAttribute('data-manual-config', 'true');
            manualConfigScript.onload = function() {
                console.log('Manual config script loaded');
                if (window.manualConfig && Array.isArray(window.manualConfig)) {
                    manualConfig = window.manualConfig;
                    manualConfigLoaded = true;
                    console.log('Manual config OK, calling checkAllLoaded');
                    checkAllLoaded();
                } else {
                    console.error('window.manualConfig not found or not array');
                }
            };
            manualConfigScript.onerror = function() {
                console.error('Failed to load manual config:', config.manual);
            };
            document.head.appendChild(manualConfigScript);
        } else {
            console.log('No manual config specified');
            manualConfigLoaded = true;
        }
    }
    
    /**
     * Initialize parameters from options configuration
     */
    function initializeParametersFromOptions() {
        options.forEach(paramConfig => {
            const paramKey = paramConfig.parameter;
            if (!paramKey) return;
            
            let defaultValue = '';
            
            // Find default value from options
            if (paramConfig.options && Array.isArray(paramConfig.options)) {
                const defaultOption = paramConfig.options.find(opt => opt.default === true);
                if (defaultOption) {
                    defaultValue = defaultOption.title || '';
                }
            } else if (paramConfig.options === 'customtext') {
                defaultValue = '';
            }
            
            // Initialize parameter
            initializeParameter(paramKey, defaultValue, false);
            
            // Set initial summary inclusion state
            if (paramConfig.enableSummary && parameterData[paramKey]) {
                parameterData[paramKey].summaryIncluded = paramConfig.summaryDefault || false;
            }
        });
    }
    
    /**
     * Run calculations on measurement data
     */
    function runCalculations() {
        if (typeof calculations === 'undefined') return;
        
        const data = getTemplateData();
        
        Object.keys(calculations).forEach(key => {
            try {
                const value = calculations[key](data);
                results[key] = value;
            } catch (e) {
                console.warn(`Failed to calculate ${key}:`, e);
            }
        });
    }
    
    // =========================================================================
    // MEASUREMENTS TABLE GENERATION
    // =========================================================================
    
    /**
     * Generate the measurements table
     */
    function generateMeasurementsTable() {
        const $table = $("#measurements-table");
        $table.empty();
        
        measurements.forEach(section => {
            // Section header
            const sectionKeys = Array.isArray(section.sectionPreviewKey) 
                ? section.sectionPreviewKey.join(' ')
                : (section.sectionPreviewKey || '');
                
            const highlightClass = section.highlight ? 'highlight-section' : '';
            
            const $headerRow = $(`
                <tr class="measurement-section-header ${highlightClass}" data-section="${sectionKeys}">
                    <td colspan="3"><strong>${section.sectionTitle}</strong></td>
                </tr>
            `);
            $table.append($headerRow);
            
            // Measurement items
            section.items.forEach(itemKey => {
                const config = parseConfigMap[itemKey];
                const label = config ? config.label : itemKey;
                const value = results[itemKey] || '';
                const unit = config ? config.unit : '';
                
                const $row = $(`
                    <tr class="measurement-row">
                        <td class="measurement-label">${label}</td>
                        <td class="measurement-value">
                            <input type="text" 
                                   id="measure-${itemKey}" 
                                   data-key="${itemKey}"
                                   value="${value}"
                                   placeholder="—">
                        </td>
                        <td class="measurement-unit">${unit}</td>
                    </tr>
                `);
                $table.append($row);
                
                // Update handler
                $row.find('input').on('input', function() {
                    const key = $(this).data('key');
                    const val = $(this).val();
                    results[key] = val;
                    runCalculations();
                    regenerateReport();
                });
            });
        });
    }
    
    // =========================================================================
    // COPY TO CLIPBOARD
    // =========================================================================
    
    $("#copy-report").on("click", function() {
        const $reportOutput = $('#report-output');
        
        if ($reportOutput.length) {
            // Get plain text from contenteditable
            const reportText = $reportOutput.text();
            
            // Clean up excessive whitespace
            const cleanedReport = reportText
                .replace(/\n{3,}/g, '\n\n')
                .trim();
            
            // Copy to clipboard
            navigator.clipboard.writeText(cleanedReport).then(() => {
                const originalText = $(this).html();
                $(this).html("Copied!");
                setTimeout(() => $(this).html(originalText), 2000);
            }).catch(err => {
                console.error('Failed to copy to clipboard:', err);
                alert('Failed to copy to clipboard. Please try again.');
            });
        }
    });
    
    // =========================================================================
    // RESET BUTTON
    // =========================================================================
    
    $("#reset-selections").on("click", function() {
        if (confirm("Reset all selections to default values?")) {
            // Reset all parameters
            Object.keys(parameterData).forEach(key => {
                delete parameterData[key];
            });
            
            // Reinitialize from options
            initializeParametersFromOptions();
            
            // Rebuild form
            if (typeof buildForm === 'function') {
                buildForm();
            }
            
            // Regenerate report
            regenerateReport();
        }
    });
    
    // =========================================================================
    // EXPOSE GLOBALLY
    // =========================================================================
    
    window.parameterData = parameterData;
    window.results = results;
    window.updateParameter = updateParameter;
    window.excludeParametersBySection = excludeParametersBySection;
    window.regenerateReport = regenerateReport;
    window.generateMeasurementsTable = generateMeasurementsTable;
    
    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    
    // Populate report config dropdown
    reportConfigs.forEach(config => {
        const option = `<option value="${config.id}">${config.name}</option>`;
        $("#report-config-select").append(option);
        
        if (config.default) {
            $("#report-config-select").val(config.id);
        }
    });
    
    // Load default report config
    const defaultReportConfig = reportConfigs.find(c => c.default);
    if (defaultReportConfig) {
        loadReportConfig(defaultReportConfig.id);
    }
    
    // Report config selector change handler
    $("#report-config-select").on("change", function() {
        loadReportConfig($(this).val());
    });
    
    // =========================================================================
    // IMPORT FUNCTIONALITY
    // =========================================================================
    
    // Populate input config dropdown
    inputConfigs.forEach(config => {
        const option = `<option value="${config.id}">${config.name}</option>`;
        $("#parse-config-select").append(option);
        
        if (config.default) {
            $("#parse-config-select").val(config.id);
        }
    });
    
    // Load parse configuration
    function loadParseConfig(configId) {
        const config = inputConfigs.find(c => c.id === configId);
        if (!config || !config.file) return;
        
        // Remove previously loaded parse config
        document.querySelectorAll('script[data-parse-config]').forEach(s => s.remove());
        
        const parseScript = document.createElement('script');
        parseScript.src = config.file;
        parseScript.setAttribute('data-parse-config', 'true');
        parseScript.onload = function() {
            if (window.parseConfig && Array.isArray(window.parseConfig)) {
                parseConfig = window.parseConfig;
                
                // Build parseConfigMap for quick lookups
                parseConfigMap = {};
                parseConfig.forEach(item => {
                    parseConfigMap[item.handle] = item;
                });
                
                console.log(`Loaded parse config: ${config.name}`);
            }
        };
        document.head.appendChild(parseScript);
    }
    
    // Load default parse config
    const defaultParseConfig = inputConfigs.find(c => c.default);
    if (defaultParseConfig) {
        loadParseConfig(defaultParseConfig.id);
    }
    
    // Parse config selector change
    $("#parse-config-select").on("change", function() {
        loadParseConfig($(this).val());
    });
    
    // Load example data button
    $("#load-example-data").on("click", function() {
        const configId = $("#parse-config-select").val();
        const config = inputConfigs.find(c => c.id === configId);
        
        if (config && config.exampledata) {
            // Load example data script
            const exampleScript = document.createElement('script');
            exampleScript.src = config.exampledata;
            exampleScript.onload = function() {
                if (window.parseExample) {
                    $("#report").val(window.parseExample);
                }
            };
            document.head.appendChild(exampleScript);
        }
    });
    
    // Clear import button
    $("#clear-import").on("click", function() {
        $("#report").val("");
    });
    
    // Submit/Import button
    $("#submit").on("click", function() {
        const rawText = $("#report").val();
        if (!rawText || !parseConfig.length) return;
        
        // Parse the text
        parseConfig.forEach(config => {
            if (!config.match) return; // Skip items without regex
            
            const regex = new RegExp(config.match, 'i');
            const match = rawText.match(regex);
            
            if (match && match[1]) {
                let value = match[1].trim();
                
                // Remove units if present
                if (config.unit) {
                    value = value.replace(new RegExp(config.unit + '$', 'i'), '').trim();
                }
                
                // Store in results
                results[config.handle] = value;
            }
        });
        
        // Update measurements table
        if (typeof generateMeasurementsTable === 'function') {
            generateMeasurementsTable();
        }
        
        // Run calculations
        runCalculations();
        
        // Regenerate report
        regenerateReport();
        
        // Close import modal
        $("#import-modal").removeClass("active");
        
        console.log("Import completed", results);
    });
    
    // Open import modal
    $("#open-import-modal").on("click", function() {
        $("#import-modal").addClass("active");
    });
    
    // Close import modal
    $("#close-import-modal").on("click", function() {
        $("#import-modal").removeClass("active");
    });
    
    // Close modal on background click
    $("#import-modal").on("click", function(e) {
        if ($(e.target).is("#import-modal")) {
            $(this).removeClass("active");
        }
    });
});