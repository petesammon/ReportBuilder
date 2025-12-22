/* jshint loopfunc: true */

jQuery(document).ready(function () {
    $("section").hide();
    $("#options").show();
    
    const metrics = {};
    const results = {}; // For parsed measurement data
    let summaryManuallyEdited = false;
    const summaryCheckboxManuallyEdited = {}; // Track which checkboxes were manually changed
    const sectionPreviewManuallyEdited = {}; // Track which section previews were manually edited
    const sectionTemplates = {}; // Store compiled section templates
    let parseConfig = []; // Will be loaded dynamically
    let parseConfigMap = {}; // Will be populated after loading
    let measurements = []; // Will be loaded dynamically
    let options = []; // Will be loaded dynamically

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
                // Regenerate the measurements table and form
                generateMeasurementsTable();
                $("#options-content").empty();
                buildOptionsForm();
                updateSummary();
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
            // If already loaded, just regenerate the table
            generateMeasurementsTable();
        }
    });

    // Update summary from checked items
    function updateSummary() {
        const summaryItems = [];
        
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
        
        const summaryData = { ...resultsWithUnits, ...metrics };
        
        // Collect all summary items with their order
        options.forEach(section => {
            Object.entries(section.params).forEach(([key, option]) => {
                if (option.enableSummary) {
                    const checkbox = $(`#${key}-summary`);
                    if (checkbox.length && checkbox.is(':checked') && metrics[key]?.trim()) {
                        // Process the text through Handlebars to replace placeholders
                        let processedText = metrics[key];
                        try {
                            const template = Handlebars.compile(processedText);
                            processedText = template(summaryData);
                        } catch (e) {
                            // If Handlebars compilation fails, use original text
                            console.warn(`Failed to compile summary text for ${key}:`, e);
                        }
                        
                        summaryItems.push({
                            text: processedText,
                            order: option.summaryOrder ?? 999
                        });
                    }
                }
            });
        });
        
        // Sort by order, then join
        summaryItems.sort((a, b) => a.order - b.order);
        const autoGeneratedContent = summaryItems.map(item => item.text).join('\n');
        
        const summaryTextarea = $('#Summary textarea');
        if (summaryTextarea.length && !summaryTextarea.is(':focus')) {
            if (summaryManuallyEdited) {
                // Preserve manual edits and append new items
                const currentLines = summaryTextarea.val().split('\n').filter(line => line.trim());
                const autoLines = autoGeneratedContent.split('\n').filter(line => line.trim());
                const newLines = autoLines.filter(line => !currentLines.includes(line));
                
                if (newLines.length > 0) {
                    const updatedContent = summaryTextarea.val() + '\n' + newLines.join('\n');
                    summaryTextarea.val(updatedContent);
                    metrics.Summary = updatedContent;
                }
            } else {
                // Replace with auto-generated
                summaryTextarea.val(autoGeneratedContent);
                metrics.Summary = autoGeneratedContent;
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
        
        const data = { ...resultsWithUnits, ...metrics };
        
        try {
            const rendered = sectionTemplates[sectionKey](data);
            $(`#${sectionKey}-preview`).val(rendered);
            metrics[sectionKey] = rendered;
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
    
    // Build the options form
    function buildOptionsForm() {
        // Compile section templates first
        options.forEach(section => {
            if (section.enableSectionPreview && section.sectionTemplate && section.sectionPreviewKey) {
                try {
                    sectionTemplates[section.sectionPreviewKey] = Handlebars.compile(section.sectionTemplate);
                } catch (e) {
                    console.error(`Error compiling template for ${section.sectionPreviewKey}:`, e);
                }
            }
        });
        
        options.forEach(section => {
            $("#options-content").append(`<h3>${section.title}</h3>\n\n`);

            Object.entries(section.params).forEach(([key, option]) => {
                // Determine layout class
                let layoutClass = '';
                if (!option.options && option.custom && !option.clickText) {
                    layoutClass = 'no-dropdown';
                } else if (!option.options && option.custom && option.clickText) {
                    layoutClass = 'click-text';
                } else if (option.options && !option.custom) {
                    layoutClass = 'dropdown-only';
                } else if (option.options && option.custom && option.conditionalText) {
                    layoutClass = 'conditional-textarea';
                }
                
                // Build option HTML
                const $option = $(`<div id="${key}" class="${layoutClass}">
    <div class="label-container">
        ${option.title ? `<label>${option.title}</label>` : ''}
    </div>
    ${option.clickText ? `
    <div class="button-container">
        <button type="button" class="reveal-text-button" style="margin: 0;">Add additional measurements</button>
    </div>
    ` : ''}
    ${option.options ? `
    <div class="dropdown-container">
        <select>
            <option selected disabled value="">Select...</option>
            ${option.options.map(opt => {
                const isString = typeof opt === 'string';
                const text = isString ? opt : opt.title;
                const label = isString ? opt : (opt.label || opt.text);
                const isDefault = !isString && opt.default;
                return `<option ${isDefault ? 'selected="selected"' : ''} title="${text}" value="${key}-${label.toLowerCase().replace(/ /g, "-")}">${label}</option>`;
            }).join("")}
        </select>
    </div>
    ` : ''}
    ${option.custom ? `
    <div class="textarea-container" style="${option.conditionalText || option.clickText ? 'display: none;' : ''}">
        <textarea class="${option.large ? 'large' : ''}"></textarea>
    </div>
    ` : ''}
    ${option.enableSummary ? `
    <div class="summary-checkbox-container">
        <input type="checkbox" id="${key}-summary" ${option.summaryDefault ? 'checked' : ''} />
    </div>
    ` : ''}
</div>`);

                $("#options-content").append($option);

                // Paste handler: convert newlines to commas
                $("textarea", $option).on("paste", (e) => {
                    const paste = (e.originalEvent.clipboardData || window.clipboardData)
                        .getData('text')
                        .replace(/\n/g, ", ")
                        .trim();

                    const textarea = e.target;
                    const newText = textarea.value.slice(0, textarea.selectionStart) + 
                                   paste + 
                                   textarea.value.slice(textarea.selectionEnd);

                    $(textarea).val(newText).trigger("change");
                    return false;
                });

                // Set default values
                if (option.options) {
                    const df = option.options.find(opt => typeof opt !== 'string' && opt.default);
                    if (df) metrics[key] = df.title;
                }
                
                if (!option.options && option.default) {
                    metrics[key] = option.default;
                    $("textarea", $option).val(option.default);
                }

                // Handle conditional textarea visibility
                if (option.conditionalText && option.options) {
                    const handleConditionalVisibility = function () {
                        const $select = $("select", $option);
                        const selectedOption = $select.find(":selected");
                        const selectedLabel = selectedOption.text();
                        const selectedTitle = selectedOption.attr("title");
                        const $textarea = $(".textarea-container", $option);
                        
                        // Show textarea only when:
                        // 1. Title is empty AND
                        // 2. Label suggests free text entry (contains "free text" or similar)
                        const isFreeTextOption = (selectedTitle === "" || selectedTitle === undefined) && 
                                                selectedLabel.toLowerCase().includes("free text");
                        
                        if (isFreeTextOption) {
                            $textarea.show();
                        } else {
                            $textarea.hide();
                            $("textarea", $option).val("");
                        }
                    };
                    
                    $("select", $option).on("change", handleConditionalVisibility);
                    
                    // Set initial visibility based on default selection
                    handleConditionalVisibility();
                }

                // Handle clickText button to reveal textarea
                if (option.clickText && option.custom) {
                    $(".reveal-text-button", $option).on("click", function() {
                        const $textarea = $(".textarea-container", $option);
                        const $button = $(this);
                        
                        if ($textarea.is(':visible')) {
                            // Hide textarea, clear content, and change button text back
                            $textarea.hide();
                            $("textarea", $option).val("");
                            metrics[key] = "";
                            $button.text("Add additional measurements");
                        } else {
                            // Show textarea and change button text
                            $textarea.show();
                            $button.text("Clear additional measurements");
                            // Focus on the textarea
                            $("textarea", $textarea).focus();
                        }
                    });
                    
                    // Track changes to textarea
                    $("textarea", $option).on("input change blur", function() {
                        metrics[key] = $(this).val();
                    });
                }

                // Main change handler
                $("select, textarea", $option).on("change", function () {
                    if (key === 'Summary') return; // Special handling below
                    
                    // Auto-check/uncheck summary checkbox on selection change
                    if (option.summaryOnChange && option.enableSummary && option.options) {
                        const selectedOption = $("select", $option).find(":selected");
                        const selectedValue = selectedOption.val();
                        
                        // Only auto-change if user hasn't manually edited this checkbox
                        if (!summaryCheckboxManuallyEdited[key]) {
                            let shouldCheck = false;
                            
                            // If summaryThreshold is defined, check against threshold
                            if (option.summaryThreshold && Array.isArray(option.summaryThreshold)) {
                                // Check if selected value is in the threshold list
                                shouldCheck = option.summaryThreshold.some(thresholdValue => 
                                    selectedValue === `${key}-${thresholdValue.toLowerCase().replace(/ /g, "-")}`
                                );
                            } else {
                                // Default behavior: check if not default option
                                const isDefaultOption = selectedOption.attr('title') === '' || 
                                    option.options.some(opt => 
                                        typeof opt !== 'string' && opt.default && opt.title === selectedOption.attr('title')
                                    );
                                shouldCheck = !isDefaultOption;
                            }
                            
                            $(`#${key}-summary`).prop('checked', shouldCheck);
                            
                            // If checking this box and it has summaryExclude, uncheck excluded items
                            if (shouldCheck && option.summaryExclude && Array.isArray(option.summaryExclude)) {
                                option.summaryExclude.forEach(excludeKey => {
                                    const $excludeCheckbox = $(`#${excludeKey}-summary`);
                                    if ($excludeCheckbox.length && $excludeCheckbox.is(':checked')) {
                                        $excludeCheckbox.prop('checked', false);
                                        // Mark as manually edited so it doesn't auto-check again
                                        summaryCheckboxManuallyEdited[excludeKey] = true;
                                    }
                                });
                            }
                        }
                    }
                    
                    // Collect values
                    const vals = [];
                    const selected = $("select", $option).find(":selected").attr("title");
                    if (selected) vals.push(selected);
                    
                    if (option.custom) {
                        const ta = $("textarea", $option).val();
                        if (ta) vals.push(ta);
                    }

                    metrics[key] = vals.join(" ");
                    updateSummary();
                });

                // Summary checkbox handler
                if (option.enableSummary) {
                    $(`#${key}-summary`).on('change', function() {
                        const isChecked = $(this).is(':checked');
                        
                        // Mark this checkbox as manually edited
                        summaryCheckboxManuallyEdited[key] = true;
                        
                        // If this checkbox is checked and has summaryExclude, uncheck the excluded items
                        if (isChecked && option.summaryExclude && Array.isArray(option.summaryExclude)) {
                            option.summaryExclude.forEach(excludeKey => {
                                const $excludeCheckbox = $(`#${excludeKey}-summary`);
                                if ($excludeCheckbox.length && $excludeCheckbox.is(':checked')) {
                                    $excludeCheckbox.prop('checked', false);
                                    // Mark as manually edited so it doesn't auto-check again
                                    summaryCheckboxManuallyEdited[excludeKey] = true;
                                }
                            });
                        }
                        
                        updateSummary();
                    });
                }
                
                // Summary field manual edit tracking
                if (key === 'Summary') {
                    $("textarea", $option).on("input change blur", function() {
                        summaryManuallyEdited = true;
                        metrics.Summary = $(this).val();
                    });
                }
            });
            
            // Add section preview if enabled
            if (section.enableSectionPreview && section.sectionPreviewKey) {
                const previewKey = section.sectionPreviewKey;
                
                // Add generate button after the section params
                const $generateButton = $(`<div class="section-generate-container">
                    <button type="button" id="${previewKey}-generate" class="generate-preview-button">Generate text</button>
                </div>`);
                
                $("#options-content").append($generateButton);
                
                // Add section preview (initially hidden)
                const $sectionPreview = $(`<div class="section-preview" id="${previewKey}-preview-container" style="display: none;">
                    <div class="label-container">
                        <label>Section Preview</label>
                    </div>
                    <div class="textarea-container" style="grid-column: 2 / 4;">
                        <textarea id="${previewKey}-preview" class="large" style="font-family: monospace;"></textarea>
                    </div>
                    <div class="preview-button-container">
                        <button type="button" id="${previewKey}-reset" class="reset-preview-button secondary" title="Back to form fields">Reset</button>
                    </div>
                </div>`);
                
                $("#options-content").append($sectionPreview);
                
                // Store reference to section params for hiding/showing
                const sectionParams = [];
                Object.keys(section.params).forEach(key => {
                    sectionParams.push($(`#${key}`));
                });
                
                // Generate button click handler
                $(`#${previewKey}-generate`).on("click", function() {
                    // Generate the preview
                    sectionPreviewManuallyEdited[previewKey] = false;
                    updateSectionPreview(previewKey);
                    
                    // Hide form fields and generate button
                    sectionParams.forEach($param => $param.hide());
                    $(this).closest('.section-generate-container').hide();
                    
                    // Show section preview
                    $(`#${previewKey}-preview-container`).show();
                });
                
                // Track manual edits to section preview
                $(`#${previewKey}-preview`).on("input change blur", function() {
                    sectionPreviewManuallyEdited[previewKey] = true;
                    metrics[previewKey] = $(this).val();
                });
                
                // Reset button to go back to form fields
                $(`#${previewKey}-reset`).on("click", function() {
                    // Hide section preview
                    $(`#${previewKey}-preview-container`).hide();
                    
                    // Show form fields and generate button
                    sectionParams.forEach($param => $param.show());
                    $(`#${previewKey}-generate`).closest('.section-generate-container').show();
                    
                    // Clear manual edit flag
                    sectionPreviewManuallyEdited[previewKey] = false;
                });
            }
            
            $("#options-content").append(`<hr />`);
        });
    }
    
    // Initialize - load default report config on page load
    const defaultReportConfig = reportConfigs.find(c => c.default);
    if (defaultReportConfig) {
        loadReportConfig(defaultReportConfig.id);
        reportConfigLoaded = true;
    } else {
        buildOptionsForm();
        updateSummary();
    }
    
    // Generate output button
    $("#generate").on("click", function () {
        $("#options").hide();
        $("#output").show();

        $("#back").prop("disabled", false).on("click", function () {
            $("#output").hide();
            $("#options").show();
        });
        
        $("#copy").prop("disabled", false).on("click", function () {
            navigator.clipboard.writeText($("#output textarea").val());
            $("#copy").html("Copied!");
            setTimeout(() => $("#copy").html("Copy to clipboard"), 1000);
        });

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
        $("#output textarea").val(outputTemplate(output));
    });
});