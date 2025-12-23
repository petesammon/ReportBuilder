/* jshint loopfunc: true, esversion: 11 */

jQuery(document).ready(function () {
    // Show the options section
    $("#options").show();
    
    const metrics = {};
    const results = {}; // For parsed measurement data
    const selectedOptions = {}; // Track which option was selected for each parameter
    let summaryManuallyEdited = false;
    const summaryCheckboxManuallyEdited = {}; // Track which checkboxes were manually changed
    const sectionPreviewManuallyEdited = {}; // Track which section previews were manually edited
    const sectionTemplates = {}; // Store compiled section templates
    let parseConfig = []; // Will be loaded dynamically
    let parseConfigMap = {}; // Will be populated after loading
    let measurements = []; // Will be loaded dynamically
    let options = []; // Will be loaded dynamically

    // Auto-resize textarea to fit content
    function autoResizeTextarea($textarea) {
        // Reset height to auto to get the correct scrollHeight
        $textarea.css('height', 'auto');
        // Set height to scrollHeight to show all content
        const scrollHeight = $textarea[0].scrollHeight;
        $textarea.css('height', scrollHeight + 'px');
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

    // Load selected report config (measurements + options + report template)
    function loadReportConfig(configId) {
        const config = reportConfigs.find(c => c.id === configId);
        if (!config) return;

        // Remove any previously loaded scripts
        document.querySelectorAll('script[data-measurements-config], script[data-options-config], script[data-report-template]').forEach(s => s.remove());

        let measurementsLoaded = false;
        let optionsLoaded = false;
        let reportTemplateLoaded = false;

        function checkAllLoaded() {
            if (measurementsLoaded && optionsLoaded && reportTemplateLoaded) {
                console.log(`Loaded report config: ${config.name}`);
                
                // Clear metrics and tracking flags from previous config
                Object.keys(metrics).forEach(key => delete metrics[key]);
                Object.keys(sectionPreviewManuallyEdited).forEach(key => delete sectionPreviewManuallyEdited[key]);
                Object.keys(summaryCheckboxManuallyEdited).forEach(key => delete summaryCheckboxManuallyEdited[key]);
                summaryManuallyEdited = false;
                
                // Regenerate the measurements table and form
                generateMeasurementsTable();
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

    // Clear button handler
    $("#clear-import").on("click", function() {
        // Clear the textarea
        $("#report").val("");
        
        // Clear metrics and results
        Object.keys(metrics).forEach(key => delete metrics[key]);
        Object.keys(results).forEach(key => delete results[key]);
        
        // Reset summary tracking
        summaryManuallyEdited = false;
        Object.keys(summaryCheckboxManuallyEdited).forEach(key => delete summaryCheckboxManuallyEdited[key]);
        
        // Reset section preview tracking
        Object.keys(sectionPreviewManuallyEdited).forEach(key => delete sectionPreviewManuallyEdited[key]);
        
        // Regenerate the measurements table and form
        generateMeasurementsTable();
        $("#options-content").empty();
        buildOptionsForm();
        updateSummary();
        
        // Update section previews (will be empty since data is cleared)
        updateAllSectionPreviews();
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
            { label: config.label, unit: config.unit || '' } : 
            { label: handle, unit: '' };
    }

    // Generate measurements table with input boxes for manual entry
    function generateMeasurementsTable() {
        let rows = ``;
        
        for (const section of measurements) {
            // Add a class for highlighting sections that have highlight: true
            const sectionClass = section.highlight ? ' class="highlight-section"' : '';
            rows += `<tr${sectionClass}><th colspan="2">${section.title}</th></tr>`;
            
            for (const handle of section.items) {
                const details = getMeasurementDetails(handle);
                let rawValue = results[handle] || "";
                
                // Strip unit from display value if it's already included
                let displayValue = rawValue;
                if (details.unit && rawValue.endsWith(details.unit)) {
                    displayValue = rawValue.slice(0, -details.unit.length);
                }
                
                rows += `<tr${sectionClass}>
                    <td class="label">${details.label}<span class="copyable-value" style="opacity: 0; position: absolute; pointer-events: none;">${displayValue ? ' = ' + displayValue + (details.unit || '') : ''}</span></td>
                    <td class="measurement-cell">
                        <input type="text" class="measurement-input" data-key="${handle}" value="${displayValue}" />
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
            
            // Update summary to reflect the new measurement value
            updateSummary();
            
            // Update section previews with the new measurement value
            updateAllSectionPreviews();
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
        
        // Run calculations
        Object.entries(calculations).forEach(([calcKey, calcValue]) => {
            results[calcKey] = calcValue(results);
        });
        
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
            
            Object.entries(section.params).forEach(([key, option]) => {
                if (!option.enableSummary) return;
                
                const $checkbox = $(`#${key}-summary-modal`);
                const metricValue = metrics[key];
                
                // Include if either:
                // 1. summaryAlwaysInclude is true (no checkbox required), OR
                // 2. checkbox exists, is checked, and has value
                const shouldInclude = (option.summaryAlwaysInclude === true && metricValue && metricValue.trim()) ||
                                     ($checkbox.length && $checkbox.is(':checked') && metricValue && metricValue.trim());
                
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
                        if (!selectedOption && window.selectedOptions && window.selectedOptions[key]) {
                            selectedOption = window.selectedOptions[key];
                        }
                        
                        // If found and has summarytext, use that instead
                        if (selectedOption && typeof selectedOption !== 'string' && selectedOption.summarytext) {
                            textToUse = selectedOption.summarytext;
                        }
                    }
                    
                    // Process through Handlebars
                    let processedText = textToUse;
                    try {
                        const template = Handlebars.compile(processedText);
                        processedText = template(summaryData);
                    } catch (e) {
                        console.warn(`Failed to compile summary text for ${key}:`, e);
                    }
                    
                    summaryItems.push({
                        text: processedText,
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
        
        // Join items within same order (no separator), then join groups with newlines
        const lines = Object.keys(groupedByOrder)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(order => groupedByOrder[order].join(''));
        
        const autoGeneratedContent = lines.join('\n');
        
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
            if (section.enableSectionPreview && section.sectionPreviewKey) {
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
        options.forEach(section => {
            if (section.params) {
                Object.entries(section.params).forEach(([key, option]) => {
                    // Find default option
                    if (option.options) {
                        const defaultOption = option.options.find(opt => {
                            if (typeof opt === 'string') return false;
                            return opt.default === true;
                        });
                        
                        if (defaultOption) {
                            const title = typeof defaultOption === 'string' ? defaultOption : defaultOption.title;
                            metrics[key] = title || "";
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
            if (section.enableSectionPreview && section.sectionPreviewKey) {
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
    
    // Expose globally for form.js to call
    window.populateSectionTextareas = populateSectionTextareas;
    window.updateSectionPreview = updateSectionPreview;
    window.updateSummary = updateSummary;
    window.metrics = metrics;
    window.selectedOptions = selectedOptions;
    window.sectionPreviewManuallyEdited = sectionPreviewManuallyEdited;
    window.summaryCheckboxManuallyEdited = summaryCheckboxManuallyEdited;
    window.summaryManuallyEdited = summaryManuallyEdited;
    
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

        const output = { ...outputResults, ...metrics };
        const finalReport = outputTemplate(output);
        
        // Copy to clipboard
        navigator.clipboard.writeText(finalReport).then(() => {
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