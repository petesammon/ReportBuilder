/* jshint loopfunc: true, esversion: 11 */

jQuery(document).ready(function () {
    // Show the options section
    $("#options").show();
    
    // Clear the import modal textarea on page load
    $("#report").val("");
    
    const metrics = {};
    const results = {}; // For parsed measurement data
    const selectedOptions = {}; // Track which option was selected for each parameter
    const excludedSections = {}; // Track which sections are excluded from the report
    let summaryManuallyEdited = false;
    const summaryCheckboxManuallyEdited = {}; // Track which checkboxes were manually changed
    const sectionPreviewManuallyEdited = {}; // Track which section previews were manually edited
    const sectionTemplates = {}; // Store compiled section templates
    let parseConfig = []; // Will be loaded dynamically
    let parseConfigMap = {}; // Will be populated after loading
    let measurements = []; // Will be loaded dynamically
    let parameters = {}; // [v5.0] Parameter definitions loaded from params file
    let options = []; // Will be loaded dynamically - modal groupings

    // [v5.0] Register Handlebars helper to wrap parameter outputs in spans
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
                
                // DON'T clear metrics - preserve all form selections across template switches
                // Only clear tracking flags from previous config
                Object.keys(sectionPreviewManuallyEdited).forEach(key => delete sectionPreviewManuallyEdited[key]);
                Object.keys(summaryCheckboxManuallyEdited).forEach(key => delete summaryCheckboxManuallyEdited[key]);
                Object.keys(excludedSections).forEach(key => delete excludedSections[key]);
                summaryManuallyEdited = false;
                
                // Regenerate the measurements table and form
                generateMeasurementsTable();
                runCalculations(); // Calculate derived values
                $("#options-content").empty();
                buildOptionsForm();
                
                // After rebuilding the form, update UI elements from preserved metrics
                // This ensures dropdowns and textareas show the user's previous selections
                Object.keys(metrics).forEach(key => {
                    const value = metrics[key];
                    
                    // Update dropdown if it exists
                    const $select = $(`#${key}-select`);
                    if ($select.length) {
                        $select.val(value).trigger('change');
                    }
                    
                    // Update textarea if it exists
                    const $textarea = $(`#${key}-textarea`);
                    if ($textarea.length) {
                        $textarea.val(value);
                    }
                    
                    // Update custom textarea if it exists
                    const $customTextarea = $(`#${key}-custom-textarea`);
                    if ($customTextarea.length) {
                        $customTextarea.val(value);
                    }
                });
                
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
                    console.log(`Loaded parameters config: ${Object.keys(parameters).length} parameters`);
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
            // No parameters file specified - use legacy embedded params from options
            parametersLoaded = true;
        }

        // Load options config
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
        const reportTemplateScript = document.createElement('script');
        reportTemplateScript.src = config.report;
        reportTemplateScript.setAttribute('data-report-template', 'true');
        reportTemplateScript.onload = function() {
            if (window.outputTemplate && typeof window.outputTemplate === 'function') {
                // Template is loaded and available globally
                reportTemplateLoaded = true;
                checkAllLoaded();
            } else {
                alert(`Report template loaded but outputTemplate not found: ${config.name}`);
            }
        };
        reportTemplateScript.onerror = function() {
            alert(`Failed to load report template: ${config.name}`);
        };
        document.head.appendChild(reportTemplateScript);

        // Load manual measurements config (if specified)
        if (config.manual) {
            const manualConfigScript = document.createElement('script');
            manualConfigScript.src = config.manual;
            manualConfigScript.setAttribute('data-manual-config', 'true');
            manualConfigScript.onload = function() {
                if (window.manualConfig && Array.isArray(window.manualConfig)) {
                    // Merge manual config with existing parseConfig
                    // Manual configs are appended to parseConfig
                    parseConfig = [...parseConfig, ...window.manualConfig];
                    
                    // Rebuild the lookup map to include manual measurements
                    parseConfigMap = {};
                    parseConfig.forEach(item => {
                        parseConfigMap[item.handle] = item;
                    });
                    
                    console.log(`Loaded manual config: ${config.name} (${window.manualConfig.length} manual items, ${parseConfig.length} total)`);
                    manualConfigLoaded = true;
                    checkAllLoaded();
                } else {
                    alert(`Manual configuration loaded but manualConfig not found: ${config.name}`);
                }
            };
            manualConfigScript.onerror = function() {
                alert(`Failed to load manual configuration: ${config.name}`);
            };
            document.head.appendChild(manualConfigScript);
        } else {
            // No manual config specified, mark as loaded
            manualConfigLoaded = true;
            checkAllLoaded();
        }
    }

    // Handle report config selection
    $("#report-config-select").on("change", function() {
        const configId = $(this).val();
        if (configId) {
            loadReportConfig(configId);
        }
    });

    // Modal handlers
    $("#open-import-modal").on("click", function() {
        $("#import-modal").addClass("active");
    });

    $("#close-import-modal").on("click", function() {
        $("#import-modal").removeClass("active");
    });

    // Close modal when clicking outside of it
    $("#import-modal").on("click", function(e) {
        if (e.target.id === "import-modal") {
            $("#import-modal").removeClass("active");
        }
    });

    // Load example data button handler
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
    
    // Reset button handler - clears all form selections, preserves measurements
    $("#reset-selections").on("click", function() {
        // Confirm before resetting
        if (!confirm("Reset all form selections to defaults? This will not affect imported measurements.")) {
            return;
        }
        
        // Clear ONLY form selections (metrics), preserve measurements (results)
        Object.keys(metrics).forEach(key => delete metrics[key]);
        
        // Reset summary tracking
        summaryManuallyEdited = false;
        Object.keys(summaryCheckboxManuallyEdited).forEach(key => delete summaryCheckboxManuallyEdited[key]);
        
        // Reset section preview tracking
        Object.keys(sectionPreviewManuallyEdited).forEach(key => delete sectionPreviewManuallyEdited[key]);
        
        // Reset excluded sections
        Object.keys(excludedSections).forEach(key => delete excludedSections[key]);
        
        // Rebuild the form (measurements table remains unchanged)
        $("#options-content").empty();
        buildOptionsForm();
        updateSummary();
        // [v5.0] Update ContentEditable instead of section previews
        if (typeof window.updateReportTextarea === 'function') {
            window.updateReportTextarea();
        }
    });

    // Load the default report config on first entry to options page
    let reportConfigLoaded = false;
    
    // Populate parse config dropdown
    inputConfigs.forEach(config => {
        const option = `<option value="${config.id}" data-file="${config.file}">${config.name}</option>`;
        $("#parse-config-select").append(option);
        
        // Set as selected if it's the default
        if (config.default) {
            $("#parse-config-select").val(config.id);
        }
    });

    // Load the default config on page load
    const defaultConfig = inputConfigs.find(c => c.default);
    if (defaultConfig) {
        loadParseConfig(defaultConfig.id);
    }

    // Load selected parse config
    function loadParseConfig(configId) {
        const config = inputConfigs.find(c => c.id === configId);
        if (!config) return;

        // Remove any previously loaded parse config script
        const oldScript = document.querySelector('script[data-parse-config]');
        if (oldScript) {
            oldScript.remove();
        }

        // Create a script element to load the parse config
        const script = document.createElement('script');
        script.src = config.file;
        script.setAttribute('data-parse-config', 'true');
        
        script.onload = function() {
            // After loading, parseConfig should be available in window scope
            if (window.parseConfig && Array.isArray(window.parseConfig)) {
                parseConfig = window.parseConfig;
                
                // Rebuild the lookup map
                parseConfigMap = {};
                parseConfig.forEach(item => {
                    parseConfigMap[item.handle] = item;
                });
                
                console.log(`Loaded parse config: ${config.name} (${parseConfig.length} items)`);
            } else {
                alert(`Parse configuration loaded but parseConfig not found: ${config.name}`);
            }
        };
        
        script.onerror = function() {
            alert(`Failed to load parse configuration: ${config.name}`);
        };
        
        document.head.appendChild(script);
    }

    // Handle parse config selection
    $("#parse-config-select").on("change", function() {
        const configId = $(this).val();
        if (configId) {
            loadParseConfig(configId);
        }
    });

    // Helper function to find measurement details in parseConfig
    function getMeasurementDetails(handle) {
        const config = parseConfigMap[handle];
        return config ? 
            { label: config.label, unit: config.unit || '', full: config.full || false } : 
            { label: handle, unit: '', full: false };
    }

    // Generate measurements table with input boxes for manual entry
    function generateMeasurementsTable() {
        let rows = ``;
        
        for (const section of measurements) {
            // Add a class for highlighting sections that have highlight: true
            const sectionClass = section.highlight ? ' class="highlight-section"' : '';
            
            // Add data-section attribute for auto-scroll matching
            // Support both string and array formats for sectionPreviewKey
            let sectionData = '';
            if (section.sectionPreviewKey) {
                const keys = Array.isArray(section.sectionPreviewKey) 
                    ? section.sectionPreviewKey 
                    : [section.sectionPreviewKey];
                sectionData = ` data-section="${keys.join(' ')}"`;
            }
            
            rows += `<tr${sectionClass}${sectionData}><th colspan="2">${section.sectionTitle}</th></tr>`;
            
            for (const handle of section.items) {
                const details = getMeasurementDetails(handle);
                let rawValue = results[handle] || "";
                
                // Check if this is a calculated field
                const isCalculated = typeof calculations === 'object' && calculations.hasOwnProperty(handle);
                
                // Strip unit from display value if it's already included
                let displayValue = rawValue;
                if (details.unit && rawValue.endsWith(details.unit)) {
                    displayValue = rawValue.slice(0, -details.unit.length);
                }
                
                // Add readonly attribute for calculated fields
                const readonlyAttr = isCalculated ? ' readonly' : '';
                const calculatedClass = isCalculated ? ' calculated-field' : '';
                
                rows += `<tr${sectionClass}>
                    <td class="label">${details.label}<span class="copyable-value" style="opacity: 0; position: absolute; pointer-events: none;">${displayValue ? ' = ' + displayValue + (details.unit || '') : ''}</span></td>
                    <td class="measurement-cell">
                        <input type="text" class="measurement-input${details.full ? ' full-width' : ''}${calculatedClass}" data-key="${handle}" value="${displayValue}"${readonlyAttr} />
                        ${details.unit ? `<span class="unit-label">${details.unit}</span>` : ''}
                    </td>
                </tr>`;
            }
        }
        
        $("#measurements-table").html(`<table><tbody>${rows}</tbody></table>`);
        
        // Add event listeners for measurement inputs
        $(".measurement-input").on("change input", function() {
            const key = $(this).data("key");
            const value = $(this).val().trim(); // Trim whitespace
            const unit = $(this).closest('td').find('.unit-label').text().trim();
            
            // Store value with unit appended (no space) only if both value and unit exist
            results[key] = (value && unit) ? value + unit : value;
            
            // Update the copyable span in the label cell
            const $row = $(this).closest('tr');
            const $copyableSpan = $row.find('.copyable-value');
            $copyableSpan.text(value ? ` = ${value}${unit}` : '');
            
            // Run calculations to update derived values
            runCalculations();
            
            // Update summary to reflect the new measurement value
            updateSummary();
            
            // [v5.0] Update ContentEditable with the new measurement value
            if (typeof window.updateReportTextarea === 'function') {
                window.updateReportTextarea();
            }
        });
    }
    
    // Run calculations and update dependent measurement fields
    function runCalculations() {
        if (typeof calculations !== 'object') return;
        
        // Prepare metrics object with parsed numeric values for calculations
        const metricsForCalc = {};
        Object.entries(results).forEach(([key, value]) => {
            // Strip units to get numeric value
            const config = parseConfigMap[key];
            if (config && config.unit && value) {
                const numStr = value.toString().replace(config.unit, '').trim();
                const num = parseFloat(numStr);
                metricsForCalc[key] = isNaN(num) ? value : num;
            } else {
                metricsForCalc[key] = value;
            }
        });
        
        // Run each calculation function
        Object.entries(calculations).forEach(([calcKey, calcFn]) => {
            if (typeof calcFn === 'function') {
                const calculatedValue = calcFn(metricsForCalc);
                
                // Update results with calculated value
                if (calculatedValue !== "N/A" && calculatedValue !== null && calculatedValue !== undefined) {
                    const config = parseConfigMap[calcKey];
                    const unit = config?.unit || '';
                    results[calcKey] = unit ? calculatedValue + unit : calculatedValue;
                    
                    // Update the input field display
                    const $input = $(`.measurement-input[data-key="${calcKey}"]`);
                    if ($input.length) {
                        $input.val(calculatedValue);
                        
                        // Update the copyable span
                        const $row = $input.closest('tr');
                        const $copyableSpan = $row.find('.copyable-value');
                        $copyableSpan.text(` = ${calculatedValue}${unit}`);
                    }
                } else {
                    // Clear the field if calculation returns N/A
                    results[calcKey] = "";
                    const $input = $(`.measurement-input[data-key="${calcKey}"]`);
                    if ($input.length) {
                        $input.val("");
                        const $row = $input.closest('tr');
                        const $copyableSpan = $row.find('.copyable-value');
                        $copyableSpan.text('');
                    }
                }
            }
        });
    }
    
    // Import button handler
    $("#submit").on("click", function () {
        // Check if a parse config has been selected
        if (parseConfig.length === 0) {
            alert("Please select a data format before importing.");
            return;
        }

        const report = $("#report").val();
        
        // Parse the report data
        parseConfig.forEach(item => {
            if (item.match) {
                const match = new RegExp(item.match, 'g').exec(report);
                if (match) {
                    results[item.handle] = match[1].trim(); // Trim parsed values
                }
            }
        });
        
        // Run calculations to compute derived values
        runCalculations();
        
        // [v5.0] Update ContentEditable with new measurement values
        if (typeof window.updateReportTextarea === 'function') {
            window.updateReportTextarea();
        }
        
        // Close the modal
        $("#import-modal").removeClass("active");
        
        // Load default report config on first entry to options page
        if (!reportConfigLoaded) {
            const defaultReportConfig = reportConfigs.find(c => c.default);
            if (defaultReportConfig) {
                loadReportConfig(defaultReportConfig.id);
                reportConfigLoaded = true;
            }
        } else {
            // If already loaded, just regenerate the table and update section previews
            generateMeasurementsTable();
            runCalculations(); // Ensure calculated values are updated in the new table
            updateAllSectionPreviews();
            updateSummary();  // Update summary to process Handlebars variables like {{EFBP}}
        }
    });

    // Update summary from checked items in modal checkboxes
    function updateSummary() {
        const summaryItems = [];
        
        // Prepare data for Handlebars
        const resultsWithUnits = {};
        Object.entries(results).forEach(([key, value]) => {
            const config = parseConfigMap[key];
            if (value && config?.unit) {
                const unit = config.unit;
                resultsWithUnits[key] = value.toString().endsWith(unit) ? value : value + unit;
            } else {
                resultsWithUnits[key] = value;
            }
        });
        
        const summaryData = { ...resultsWithUnits, ...metrics };
        
        // Collect summary items from modal checkboxes
        options.forEach(section => {
            if (!section.params) return;
            
            // Skip this entire section if it's excluded OR hidden
            if (section.sectionPreviewKey && (excludedSections[section.sectionPreviewKey] || (window.hiddenSections && window.hiddenSections[section.sectionPreviewKey]))) {
                return;
            }
            
            // [v5.0] Handle both array-based (new) and object-based (old) params
            const paramList = Array.isArray(section.params) ? section.params : Object.keys(section.params || {});
            
            paramList.forEach(paramKey => {
                // [v5.0] Look up parameter definition from global parameters
                const option = window.parameters ? window.parameters[paramKey] : (section.params[paramKey] || null);
                
                if (!option || !option.enableSummary) return;
                
                const $checkbox = $(`#${paramKey}-summary-modal`);
                const metricValue = metrics[paramKey];
                
                // Determine if checkbox is checked:
                // - If modal exists (checkbox in DOM), use actual checkbox state
                // - If modal doesn't exist (lazy loading), use virtual state
                let isChecked = false;
                if ($checkbox.length) {
                    // Checkbox exists in DOM - use its state
                    isChecked = $checkbox.is(':checked');
                } else {
                    // Checkbox doesn't exist yet (modal not created) - use virtual state
                    isChecked = window.summaryCheckboxStates?.[paramKey] ?? false;
                }
                
                // Include if either:
                // 1. summaryAlwaysInclude is true (no checkbox required), OR
                // 2. checkbox is checked (from DOM or virtual state) and has value
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
                        if (!selectedOption && window.selectedOptions && window.selectedOptions[paramKey]) {
                            selectedOption = window.selectedOptions[paramKey];
                        }
                        
                        // If found and has summarytext, use that instead
                        if (selectedOption && typeof selectedOption !== 'string' && selectedOption.summarytext) {
                            textToUse = selectedOption.summarytext;
                        }
                    }
                    // For customtext options, use summarytext from selectedOptions
                    else if (option.options === "customtext") {
                        if (window.selectedOptions && window.selectedOptions[paramKey]) {
                            selectedOption = window.selectedOptions[paramKey];
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
        
        console.log('[v5.0] updateSummary called - autoGeneratedContent:', autoGeneratedContent ? autoGeneratedContent.substring(0, 100) : '(empty string)');
        console.log('[v5.0] summaryItems count:', summaryItems.length);
        
        // [v5.0] Update Summary in metrics (no separate textarea in new architecture)
        // Always update metrics.Summary for use in ContentEditable
        if (summaryManuallyEdited && metrics.Summary) {
            // Append new items to existing manual content
            const currentLines = metrics.Summary.split('\n').filter(line => line.trim());
            const autoLines = autoGeneratedContent.split('\n').filter(line => line.trim());
            const newLines = autoLines.filter(line => !currentLines.includes(line));
            
            if (newLines.length > 0) {
                metrics.Summary = metrics.Summary + '\n' + newLines.join('\n');
            }
        } else {
            // Replace with auto-generated
            metrics.Summary = autoGeneratedContent;
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
                    metrics.Summary = updatedContent;
                    if (typeof window.autoResizeTextarea === 'function') {
                        window.autoResizeTextarea($summaryTextarea);
                    }
                }
            } else {
                // Replace with auto-generated
                $summaryTextarea.val(autoGeneratedContent);
                metrics.Summary = autoGeneratedContent;
                if (typeof window.autoResizeTextarea === 'function') {
                    window.autoResizeTextarea($summaryTextarea);
                }
            }
        }
    }
    
    // Update section preview
    function updateSectionPreview(sectionKey) {
        if (!sectionTemplates[sectionKey]) return;
        
        // Don't update if manually edited
        if (sectionPreviewManuallyEdited[sectionKey]) return;
        
        // Prepare data for Handlebars - ensure units are appended to results
        const resultsWithUnits = {};
        Object.entries(results).forEach(([key, value]) => {
            const config = parseConfigMap[key];
            if (value && config?.unit) {
                const unit = config.unit;
                resultsWithUnits[key] = value.toString().endsWith(unit) ? value : value + unit;
            } else {
                resultsWithUnits[key] = value;
            }
        });
        
        // Pre-process metrics values through Handlebars
        // This allows metrics that contain Handlebars variables (like {{IVSd}}) to be resolved
        // before being passed to the section template
        const processedMetrics = {};
        const baseData = { ...resultsWithUnits }; // Base data for processing metrics
        
        Object.entries(metrics).forEach(([key, value]) => {
            if (typeof value === 'string' && value.includes('{{')) {
                // This metric contains Handlebars variables, process it
                try {
                    const template = Handlebars.compile(value);
                    const processed = template(baseData);
                    // Mark as SafeString to prevent double-escaping when inserted into section template
                    processedMetrics[key] = new Handlebars.SafeString(processed);
                } catch (e) {
                    console.warn(`Failed to process metric ${key}:`, e);
                    processedMetrics[key] = value; // Fall back to original
                }
            } else {
                processedMetrics[key] = value;
            }
        });
        
        const data = { ...resultsWithUnits, ...processedMetrics };
        
        try {
            const rendered = sectionTemplates[sectionKey](data);
            
            // Use new textarea-based form
            const $textarea = $(`#${sectionKey}-textarea`);
            if ($textarea.length) {
                $textarea.val(rendered);
                metrics[sectionKey] = rendered;
                // Auto-resize textarea using global function
                if (typeof window.autoResizeTextarea === 'function') {
                    window.autoResizeTextarea($textarea);
                }
            }
        } catch (e) {
            console.error(`Error rendering section preview for ${sectionKey}:`, e);
        }
    }
    
    // Update all section previews
    function updateAllSectionPreviews() {
        options.forEach(section => {
            if (section.sectionPreviewKey) {
                updateSectionPreview(section.sectionPreviewKey);
            }
        });
    }
    
    // Build the options form - now delegated to form.js
    function buildOptionsForm() {
        // Compile section templates from window.sectionTemplates
        if (window.sectionTemplates) {
            Object.entries(window.sectionTemplates).forEach(([key, templateString]) => {
                try {
                    sectionTemplates[key] = Handlebars.compile(templateString);
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
                            // Only set default if value doesn't already exist (preserve user selections)
                            if (metrics[key] === undefined) {
                                metrics[key] = title || "";
                            }
                        }
                    }
                    // For customtext options, initialize with empty string
                    else if (option.options === "customtext") {
                        // Only set empty string if value doesn't already exist
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
    function populateSectionTextareas() {
        // Metrics defaults are now set in buildOptionsForm() before the form is built
        // This function just renders the sections with those defaults
        
        // Render and populate each section textarea
        options.forEach(section => {
            if (section.sectionPreviewKey) {
                const sectionKey = section.sectionPreviewKey;
                
                if (!sectionTemplates[sectionKey]) {
                    console.warn(`No template found for section: ${sectionKey}`);
                    return;
                }
                
                // Prepare data for Handlebars - ensure units are appended to results
                const resultsWithUnits = {};
                Object.entries(results).forEach(([key, value]) => {
                    const config = parseConfigMap[key];
                    if (value && config?.unit) {
                        const unit = config.unit;
                        resultsWithUnits[key] = value.toString().endsWith(unit) ? value : value + unit;
                    } else {
                        resultsWithUnits[key] = value;
                    }
                });
                
                // Pre-process metrics values through Handlebars
                // This allows metrics that contain Handlebars variables (like {{IVSd}}) to be resolved
                // before being passed to the section template
                const processedMetrics = {};
                const baseData = { ...resultsWithUnits }; // Base data for processing metrics
                
                Object.entries(metrics).forEach(([key, value]) => {
                    if (typeof value === 'string' && value.includes('{{')) {
                        // This metric contains Handlebars variables, process it
                        try {
                            const template = Handlebars.compile(value);
                            const processed = template(baseData);
                            // Mark as SafeString to prevent double-escaping when inserted into section template
                            processedMetrics[key] = new Handlebars.SafeString(processed);
                        } catch (e) {
                            console.warn(`Failed to process metric ${key}:`, e);
                            processedMetrics[key] = value; // Fall back to original
                        }
                    } else {
                        processedMetrics[key] = value;
                    }
                });
                
                const data = { ...resultsWithUnits, ...processedMetrics };
                
                try {
                    const rendered = sectionTemplates[sectionKey](data);
                    const $textarea = $(`#${sectionKey}-textarea`);
                    
                    if ($textarea.length) {
                        $textarea.val(rendered);
                        metrics[sectionKey] = rendered;
                        
                        // Auto-resize the textarea using global function
                        if (typeof window.autoResizeTextarea === 'function') {
                            window.autoResizeTextarea($textarea);
                        }
                    }
                } catch (e) {
                    console.error(`Error rendering section ${sectionKey}:`, e);
                }
            }
        });
        
        // Also populate the Summary textarea
        if (typeof updateSummary === 'function') {
            updateSummary();
        }
    }
    
    // [v5.0] Update ContentEditable report textarea with span-wrapped parameters
    // [v5.0] Granular update - only updates changed parameter spans (PERFORMANCE OPTIMIZATION)
    function updateChangedParameters(changedParamKeys) {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) {
            console.warn('ContentEditable textarea not found');
            return;
        }
        
        console.log('[UPDATE_PARAMS] Changed parameters:', changedParamKeys);
        
        // Prepare data with units for processing Handlebars
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
            
            console.log(`[UPDATE_PARAMS] Processing ${paramKey}, value:`, newValue);
            
            // Process through Handlebars if needed
            if (typeof newValue === 'string' && newValue.includes('{{')) {
                try {
                    const template = Handlebars.compile(newValue);
                    newValue = template(outputResults);
                } catch (e) {
                    console.warn(`Failed to process metric ${paramKey}:`, e);
                }
            }
            
            // Check if parameter is excluded/hidden
            let isExcludedOrHidden = false;
            if (window.excludedSections || window.hiddenSections) {
                options.forEach(section => {
                    const sectionKey = section.sectionPreviewKey;
                    if (section.params && section.params.includes(paramKey)) {
                        if ((window.excludedSections && window.excludedSections[sectionKey]) ||
                            (window.hiddenSections && window.hiddenSections[sectionKey])) {
                            isExcludedOrHidden = true;
                        }
                    }
                });
            }
            
            // If excluded/hidden, set to empty
            if (isExcludedOrHidden) {
                newValue = '';
            }
            
            // Find and update all spans with this parameter
            const $spans = $textarea.find(`[data-param="${paramKey}"]`);
            console.log(`[UPDATE_PARAMS] Found ${$spans.length} spans for ${paramKey}`);
            $spans.each(function() {
                console.log(`[UPDATE_PARAMS] Updating span for ${paramKey} from "${$(this).text()}" to "${newValue}"`);
                $(this).text(newValue || '');
            });
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
    
    function updateReportTextarea() {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) {
            console.warn('ContentEditable textarea not found');
            return;
        }
        
        // 1. Prepare data with units appended to results
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
        
        // 2. Pre-process metrics values through Handlebars
        const processedMetrics = {};
        const baseData = { ...outputResults };
        
        console.log('[v5.0] metrics.Summary before processing:', metrics.Summary !== undefined ? (metrics.Summary === '' ? '(empty string)' : metrics.Summary.substring(0, 50)) : 'undefined');
        
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
        
        // 3. Generate raw report
        const data = { ...outputResults, ...processedMetrics };
        
        console.log('[v5.0] Data before exclusion - Summary:', data.Summary ? data.Summary.substring(0, 50) : 'undefined');
        
        // Helper function to extract all {{variables}} from a template section
        function extractSectionVariables(sectionKey) {
            const templateString = window.outputTemplateString || '';
            const startMarker = `<!--start:${sectionKey}-->`;
            const endMarker = `<!--end:${sectionKey}-->`;
            
            const startIndex = templateString.indexOf(startMarker);
            const endIndex = templateString.indexOf(endMarker);
            
            if (startIndex === -1 || endIndex === -1) {
                console.log(`[UPDATE] Section ${sectionKey} markers not found in template`);
                return [];
            }
            
            const sectionContent = templateString.substring(startIndex, endIndex);
            
            // Extract all {{variable}} patterns (both {{xxx}} and {{{xxx}}})
            const variableRegex = /\{\{+([^}]+)\}+/g;
            const variables = [];
            let match;
            
            while ((match = variableRegex.exec(sectionContent)) !== null) {
                const varName = match[1].trim();
                // Skip Handlebars helpers and conditional statements
                if (!varName.startsWith('#') && !varName.startsWith('/') && !varName.startsWith('if ')) {
                    variables.push(varName);
                }
            }
            
            return [...new Set(variables)]; // Remove duplicates
        }
        
        // Filter excluded/hidden parameters AND measurements
        Object.keys(window.excludedSections || {}).forEach(sectionKey => {
            if (window.excludedSections[sectionKey]) {
                // Get ALL variables (parameters and measurements) in this section
                const sectionVariables = extractSectionVariables(sectionKey);
                
                // Clear all of them
                sectionVariables.forEach(varName => {
                    data[varName] = '';
                });
            }
        });
        
        // Filter hidden sections (triggered sections that haven't been shown)
        if (window.hiddenSections) {
            Object.keys(window.hiddenSections).forEach(sectionKey => {
                if (window.hiddenSections[sectionKey]) {
                    // Get ALL variables in this section
                    const sectionVariables = extractSectionVariables(sectionKey);
                    
                    // Clear all of them
                    sectionVariables.forEach(varName => {
                        data[varName] = '';
                    });
                }
            });
        }
        
        console.log('[v5.0] Data after exclusion - Summary:', data.Summary ? data.Summary.substring(0, 50) : 'undefined');
        
        let rawReport = '';
        try {
            rawReport = outputTemplate(data);
        } catch (e) {
            console.error('Error generating report:', e);
            return;
        }
        
        // 4. Wrap parameters in spans (post-processing)
        const wrappedReport = wrapParametersInSpans(rawReport, data);
        
        // 5. Update ContentEditable preserving cursor position
        updateContentEditableHTML(wrappedReport);
        
        // 6. Update button positions
        if (typeof updateButtonPositions === 'function') {
            updateButtonPositions();
        }
    }
    
    // [v5.0] Wrap parameter values in spans for tracking
    function wrapParametersInSpans(reportHTML, data) {
        let wrapped = reportHTML;
        
        // Get all parameter keys (start with 'p' or 'sp', not measurements)
        const paramKeys = Object.keys(parameters || {});
        
        // Also include Summary (always, even if empty)
        if (data.Summary !== undefined) {
            paramKeys.push('Summary');
            if (data.Summary === '') {
                console.log('[v5.0] Summary is EMPTY STRING');
            } else {
                console.log('[v5.0] Summary found in data:', data.Summary.substring(0, 100) + '...');
            }
        } else {
            console.log('[v5.0] Summary NOT found in data (undefined). metrics.Summary =', metrics.Summary !== undefined ? (metrics.Summary === '' ? '(empty string)' : metrics.Summary.substring(0, 50)) : 'undefined');
        }
        
        console.log('[v5.0] Wrapping parameters:', paramKeys.length, 'params found');
        
        // Sort by length (longest first) to avoid partial replacements
        paramKeys.sort((a, b) => {
            const aVal = data[a] || '';
            const bVal = data[b] || '';
            return bVal.length - aVal.length;
        });
        
        // Wrap each parameter value
        paramKeys.forEach(paramKey => {
            let value = data[paramKey];
            
            if (!value || value === '' || typeof value !== 'string') {
                if (paramKey === 'pLAP' || paramKey === 'pDiastology') {
                    console.log(`[WRAP] Skipping ${paramKey} - empty or not string:`, value);
                }
                return;
            }
            
            // Skip very short values (< 3 chars) - they're too generic and may match wrong text
            // For example, "." might match a period anywhere in the document
            if (value.length < 3) {
                if (paramKey === 'pLAP' || paramKey === 'pDiastology') {
                    console.log(`[WRAP] Skipping ${paramKey} - value too short (${value.length} chars): "${value}"`);
                }
                return;
            }
            
            // Skip if already wrapped
            if (wrapped.includes(`data-param="${paramKey}"`)) {
                if (paramKey === 'pLAP' || paramKey === 'pDiastology') {
                    console.log(`[WRAP] ${paramKey} already wrapped`);
                }
                return;
            }
            
            if (paramKey === 'pLAP' || paramKey === 'pDiastology') {
                console.log(`[WRAP] Wrapping ${paramKey} with value: "${value}"`);
            }
            
            // Escape special regex characters in the value
            const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // Replace first occurrence with span-wrapped version
            const regex = new RegExp(escapedValue, '');
            const beforeWrap = wrapped.substring(0, 200); // Sample for debugging
            wrapped = wrapped.replace(regex, `<span data-param="${paramKey}" class="param-span">${value}</span>`);
            
            if (paramKey === 'pLAP' || paramKey === 'pDiastology') {
                const afterWrap = wrapped.substring(0, 200);
                console.log(`[WRAP] ${paramKey} wrapped. Before (sample):`, beforeWrap);
                console.log(`[WRAP] ${paramKey} wrapped. After (sample):`, afterWrap);
            }
        });
        
        // Also wrap individual measurement values (not just parameters)
        // This ensures measurements like {{EFBP}} within summary text get wrapped
        if (parseConfigMap && typeof parseConfigMap === 'object') {
            const measurementKeys = Object.keys(parseConfigMap);
            
            // Sort by value length (longest first) to avoid partial replacements
            measurementKeys.sort((a, b) => {
                const aVal = data[a] || '';
                const bVal = data[b] || '';
                return bVal.toString().length - aVal.toString().length;
            });
            
            measurementKeys.forEach(measurementKey => {
                let value = data[measurementKey];
                
                if (!value || value === '' || typeof value !== 'string') {
                    return;
                }
                
                // Skip if already wrapped (might be wrapped as part of a parameter)
                if (wrapped.includes(`data-param="${measurementKey}"`)) {
                    return;
                }
                
                // Escape special regex characters in the value
                const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                // Replace all occurrences with span-wrapped version (using global flag)
                const regex = new RegExp(escapedValue, 'g');
                wrapped = wrapped.replace(regex, `<span data-param="${measurementKey}" class="param-span">${value}</span>`);
            });
        }
        
        // Replace button markers with actual button HTML
        // [v5.0] NEW: Convert section boundary markers into wrapper spans
        window.options.forEach(modalGroup => {
            const modalKey = modalGroup.sectionPreviewKey;
            if (!modalKey) return;
            
            // Check if section is excluded or hidden
            const isExcluded = window.excludedSections && window.excludedSections[modalKey];
            const isHidden = window.hiddenSections && window.hiddenSections[modalKey];
            
            // Don't process hidden sections - just remove the markers
            if (isHidden) {
                wrapped = wrapped.replace(new RegExp(`<!--start:${modalKey}-->`, 'g'), '');
                wrapped = wrapped.replace(new RegExp(`\\n?<!--end:${modalKey}-->`, 'g'), '');
                return;
            }
            
            // Create button HTML
            let buttonHTML = '';
            
            if (modalKey === 'sectSummary') {
                // Summary only gets edit button
                buttonHTML = `<button type="button" class="inline-edit-button" data-modal="${modalKey}" title="Edit Summary">✎</button>`;
            } else {
                // Regular sections get exclude button always, edit button only when not excluded
                const excludeText = isExcluded ? '+' : '−';
                const excludeTitle = isExcluded ? 'Include section in report' : 'Exclude section from report';
                const excludeClass = isExcluded ? 'inline-exclude-button excluded' : 'inline-exclude-button';
                
                if (isExcluded) {
                    // When excluded, show placeholder + include [+] button to maintain spacing
                    // Placeholder has same size as edit button but is invisible
                    buttonHTML = `<span class="button-placeholder"></span><button type="button" class="${excludeClass}" data-modal="${modalKey}" title="${excludeTitle}">${excludeText}</button>`;
                } else {
                    // When included, show both edit and exclude buttons
                    // HTML order: edit first, then exclude (displays as [✎][−] with text-align:right)
                    buttonHTML = `<button type="button" class="inline-edit-button" data-modal="${modalKey}" title="Edit ${modalGroup.sectionTitle}">✎</button><button type="button" class="${excludeClass}" data-modal="${modalKey}" title="${excludeTitle}">${excludeText}</button>`;
                }
            }
            
            // Create wrapper span with buttons and exclusion class if needed
            const excludedClass = isExcluded ? ' section-excluded' : '';
            // Buttons will float left into padding space; newline kept for clean HTML
            const wrapperStart = `<span class="section-wrapper${excludedClass}" data-section="${modalKey}"><span class="inline-button-group" contenteditable="false" data-modal="${modalKey}">${buttonHTML}</span>`;
            
            // Replace start marker - newline from template follows, but float handles positioning
            // Pattern: <!--start:sectXXX-->
            wrapped = wrapped.replace(new RegExp(`<!--start:${modalKey}-->`, 'g'), wrapperStart);
            
            // Replace newline before end marker with closing span
            // Pattern: \n<!--end:sectXXX-->
            // This preserves the blank line between sections
            wrapped = wrapped.replace(new RegExp(`\\n<!--end:${modalKey}-->`, 'g'), `</span>`);
        });
        
        // For excluded sections, remove all content between wrapper and closing span (but keep buttons)
        window.options.forEach(modalGroup => {
            const modalKey = modalGroup.sectionPreviewKey;
            if (!modalKey) return;
            
            const isExcluded = window.excludedSections && window.excludedSections[modalKey];
            const isHidden = window.hiddenSections && window.hiddenSections[modalKey];
            
            if (isExcluded && !isHidden) {
                // Match the section wrapper and extract just the button group, removing all other content
                // Use positive lookahead to match until closing span followed by blank line or next section
                const sectionRegex = new RegExp(
                    `<span class="section-wrapper section-excluded" data-section="${modalKey}">` +
                    `(<span class="inline-button-group"[^>]*>.*?</span>)` +
                    `[\\s\\S]*?` +
                    `</span>(?=\\n\\n|\\n*<span class="section-wrapper|$)`,  // Must be followed by blank line, next section, or EOF
                    'g'
                );
                
                // Replace with just the wrapper + buttons + closing span (no content)
                wrapped = wrapped.replace(sectionRegex, 
                    `<span class="section-wrapper section-excluded" data-section="${modalKey}">$1</span>`
                );
            }
        });
        
        // Remove any remaining section markers (for sections that don't exist in options)
        wrapped = wrapped.replace(/<!--start:[^>]+-->/g, '');
        wrapped = wrapped.replace(/\n?<!--end:[^>]+-->/g, '');
        
        return wrapped;
    }
    
    // [v5.0] Update ContentEditable HTML while preserving cursor position
    function updateContentEditableHTML(newHTML) {
        const $textarea = $('#report-textarea');
        
        if (!$textarea.length) return;
        
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
        
        // Don't automatically focus or move cursor - this was causing issues
        // when typing in measurement fields. The cursor should only move when
        // the user explicitly interacts with the report textarea.
        // TODO [v5.0]: Restore cursor position intelligently if user WAS editing in the textarea
    }
    
    // [v5.0] Setup button event handlers (buttons are placed via template markers)
    function updateButtonPositions() {
        setupInlineButtonHandlers();
    }
    
    // [v5.0] Setup click handlers for inline buttons
    function setupInlineButtonHandlers() {
        const $reportTextarea = $('#report-textarea');
        
        // Edit button - open modal
        $reportTextarea.off('click', '.inline-edit-button').on('click', '.inline-edit-button', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const modalKey = $(this).data('modal');
            const modalId = `${modalKey}-modal`;
            
            // Open the modal
            $(`#${modalId}`).addClass('active');
            
            // Auto-scroll measurements table (skip for Summary)
            if (modalKey !== 'sectSummary' && typeof window.scrollToMeasurementSection === 'function') {
                window.scrollToMeasurementSection(modalKey);
            }
        });
        
        // Exclude button - hide/show parameters
        $reportTextarea.off('click', '.inline-exclude-button').on('click', '.inline-exclude-button', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const modalKey = $(this).data('modal');
            const modalGroup = window.options.find(o => o.sectionPreviewKey === modalKey);
            
            if (!modalGroup) return;
            
            // Initialize excludedSections if needed
            if (!window.excludedSections) {
                window.excludedSections = {};
            }
            
            // Toggle exclusion state
            const isExcluded = window.excludedSections[modalKey] || false;
            window.excludedSections[modalKey] = !isExcluded;
            
            // Update button appearance
            const $button = $(this);
            if (window.excludedSections[modalKey]) {
                $button.text('+').attr('title', 'Include section in report').addClass('excluded');
            } else {
                $button.text('−').attr('title', 'Exclude section from report').removeClass('excluded');
            }
            
            // Regenerate report with excluded parameters
            if (typeof window.updateReportTextarea === 'function') {
                window.updateReportTextarea();
            }
            
            // Update summary
            if (typeof window.updateSummary === 'function') {
                window.updateSummary();
            }
        });
    }
    
    function scrollToMeasurementSection(sectionPreviewKey) {
        if (!sectionPreviewKey) return;
        
        // Find the first measurement section header with matching data-section attribute
        // Using [data-section~="value"] to match space-separated values
        const $targetSection = $(`#measurements-table tr[data-section~="${sectionPreviewKey}"]`).first();
        
        if ($targetSection.length) {
            const $measurementsPanel = $('#measurements-panel');
            if ($measurementsPanel.length) {
                // Get the position of the target section relative to the measurements table
                const targetOffset = $targetSection.offset().top;
                const panelOffset = $measurementsPanel.offset().top;
                const currentScroll = $measurementsPanel.scrollTop();
                
                // Calculate the scroll position with extra offset to show the header clearly
                // 60px offset ensures the section header is visible with comfortable spacing
                const scrollPosition = currentScroll + (targetOffset - panelOffset) - 60;
                
                // Smooth scroll to the target
                $measurementsPanel.animate({
                    scrollTop: scrollPosition
                }, 300);
            }
        }
    }
    
    // Expose globally for form.js to call
    window.autoResizeTextarea = autoResizeTextarea;
    window.populateSectionTextareas = populateSectionTextareas;
    window.updateSectionPreview = updateSectionPreview;
    window.updateReportTextarea = updateReportTextarea; // [v5.0] New ContentEditable updater
    window.updateChangedParameters = updateChangedParameters; // [v5.0] Granular parameter updates (performance)
    window.updateButtonPositions = updateButtonPositions; // [v5.0] Dynamic button positioning
    window.updateSummary = updateSummary;
    window.scrollToMeasurementSection = scrollToMeasurementSection;
    window.metrics = metrics;
    window.selectedOptions = selectedOptions;
    window.sectionPreviewManuallyEdited = sectionPreviewManuallyEdited;
    window.summaryCheckboxManuallyEdited = summaryCheckboxManuallyEdited;
    window.summaryManuallyEdited = summaryManuallyEdited;
    window.excludedSections = excludedSections;
    window.parameters = parameters; // [v5.0] Parameter definitions
    window.options = options; // [v5.0] Modal groupings
    
    // Initialize - load default report config
    // This is called by form.js once it's ready
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
    
    // Copy to clipboard button
    $("#copy-report").on("click", function () {
        // Update all section previews to ensure they're current
        updateAllSectionPreviews();
        
        // Note: We don't call updateSummary() here because:
        // 1. Summary is already updated when checkboxes change (via checkbox handlers)
        // 2. Summary is already updated when user types (via textarea input handler)
        // 3. metrics.Summary always contains the current textarea value
        // This preserves manual edits to the summary textarea
        
        // Prepare output by appending units to results
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

        // Pre-process metrics values through Handlebars (same as updateReportTextarea does)
        // This resolves {{}} syntax within metric values before rendering
        const processedMetrics = {};
        const baseData = { ...outputResults }; // Base data for processing metrics
        
        Object.entries(metrics).forEach(([key, value]) => {
            if (typeof value === 'string' && value.includes('{{')) {
                // This metric contains Handlebars variables, process it
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

        const output = { ...outputResults, ...processedMetrics };
        
        console.log('[CLIPBOARD] Starting copy-to-clipboard');
        console.log('[CLIPBOARD] Excluded sections:', window.excludedSections);
        
        // Helper function to extract all {{variables}} from a template section
        function extractSectionVariables(sectionKey) {
            const templateString = window.outputTemplateString || '';
            const startMarker = `<!--start:${sectionKey}-->`;
            const endMarker = `<!--end:${sectionKey}-->`;
            
            const startIndex = templateString.indexOf(startMarker);
            const endIndex = templateString.indexOf(endMarker);
            
            if (startIndex === -1 || endIndex === -1) {
                console.log(`[CLIPBOARD] Section ${sectionKey} markers not found in template`);
                return [];
            }
            
            const sectionContent = templateString.substring(startIndex, endIndex);
            
            // Extract all {{variable}} patterns (both {{xxx}} and {{{xxx}}})
            const variableRegex = /\{\{+([^}]+)\}+/g;
            const variables = [];
            let match;
            
            while ((match = variableRegex.exec(sectionContent)) !== null) {
                const varName = match[1].trim();
                // Skip Handlebars helpers and conditional statements
                if (!varName.startsWith('#') && !varName.startsWith('/') && !varName.startsWith('if ')) {
                    variables.push(varName);
                }
            }
            
            return [...new Set(variables)]; // Remove duplicates
        }
        
        // Filter out excluded sections AND hidden sections
        const filteredOutput = { ...output };
        
        console.log('[CLIPBOARD] Output before filtering:', Object.keys(filteredOutput));
        
        // Filter out excluded sections (defaultExcluded or manually excluded)
        Object.keys(excludedSections).forEach(sectionKey => {
            if (excludedSections[sectionKey]) {
                console.log(`[CLIPBOARD] Processing excluded section: ${sectionKey}`);
                // Get ALL variables in this section and clear them
                const sectionVariables = extractSectionVariables(sectionKey);
                console.log(`[CLIPBOARD] Variables to clear in ${sectionKey}:`, sectionVariables);
                sectionVariables.forEach(varName => {
                    console.log(`[CLIPBOARD] Clearing variable: ${varName} (was: ${filteredOutput[varName]})`);
                    filteredOutput[varName] = '';
                });
            }
        });
        
        // Filter out hidden sections (defaultHidden that haven't been triggered)
        if (window.hiddenSections) {
            Object.keys(window.hiddenSections).forEach(sectionKey => {
                if (window.hiddenSections[sectionKey]) {
                    console.log(`[CLIPBOARD] Processing hidden section: ${sectionKey}`);
                    // Get ALL variables in this section and clear them
                    const sectionVariables = extractSectionVariables(sectionKey);
                    console.log(`[CLIPBOARD] Variables to clear in ${sectionKey}:`, sectionVariables);
                    sectionVariables.forEach(varName => {
                        filteredOutput[varName] = '';
                    });
                }
            });
        }
        
        console.log('[CLIPBOARD] Output after filtering:', filteredOutput);
        
        const finalReport = outputTemplate(filteredOutput);
        
        console.log('[CLIPBOARD] Final report (first 500 chars):', finalReport.substring(0, 500));
        
        // Remove excluded and hidden sections entirely (including static text like "Left Ventricle:")
        let cleanedReport = finalReport;
        
        // Remove excluded sections
        Object.keys(excludedSections).forEach(sectionKey => {
            if (excludedSections[sectionKey]) {
                const startMarker = `<!--start:${sectionKey}-->`;
                const endMarker = `<!--end:${sectionKey}-->`;
                
                // Create regex to match everything from start marker to end marker (including markers)
                const sectionRegex = new RegExp(
                    `${startMarker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}[\\s\\S]*?${endMarker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`,
                    'g'
                );
                
                cleanedReport = cleanedReport.replace(sectionRegex, '');
                console.log(`[CLIPBOARD] Removed entire section: ${sectionKey}`);
            }
        });
        
        // Remove hidden sections
        if (window.hiddenSections) {
            Object.keys(window.hiddenSections).forEach(sectionKey => {
                if (window.hiddenSections[sectionKey]) {
                    const startMarker = `<!--start:${sectionKey}-->`;
                    const endMarker = `<!--end:${sectionKey}-->`;
                    
                    const sectionRegex = new RegExp(
                        `${startMarker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}[\\s\\S]*?${endMarker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`,
                        'g'
                    );
                    
                    cleanedReport = cleanedReport.replace(sectionRegex, '');
                    console.log(`[CLIPBOARD] Removed entire hidden section: ${sectionKey}`);
                }
            });
        }
        
        // Clean up excessive whitespace and remove any remaining section markers
        // Replace 3+ consecutive newlines with just 2 newlines (keeps section spacing)
        cleanedReport = cleanedReport
            .replace(/<!--start:[^>]+-->/g, '')   // Remove any remaining start markers
            .replace(/<!--end:[^>]+-->/g, '')     // Remove any remaining end markers
            .replace(/\n{3,}/g, '\n\n')           // Replace 3+ newlines with 2
            .trim();                               // Remove leading/trailing whitespace
        
        console.log('[CLIPBOARD] Cleaned report (first 500 chars):', cleanedReport.substring(0, 500));
        
        // Copy to clipboard
        navigator.clipboard.writeText(cleanedReport).then(() => {
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