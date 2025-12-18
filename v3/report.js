/* jshint loopfunc: true */

jQuery(document).ready(function () {
    $("section").hide();
    $("#import").show();
    
    const metrics = {};
    const results = {}; // For parsed measurement data
    let summaryManuallyEdited = false;
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

    // Load selected report config (measurements + options)
    function loadReportConfig(configId) {
        const config = reportConfigs.find(c => c.id === configId);
        if (!config) return;

        // Remove any previously loaded scripts
        document.querySelectorAll('script[data-measurements-config], script[data-options-config]').forEach(s => s.remove());

        let measurementsLoaded = false;
        let optionsLoaded = false;

        function checkBothLoaded() {
            if (measurementsLoaded && optionsLoaded) {
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
                checkBothLoaded();
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
        optionsScript.src = config.report;
        optionsScript.setAttribute('data-options-config', 'true');
        optionsScript.onload = function() {
            if (window.options && Array.isArray(window.options)) {
                options = window.options;
                optionsLoaded = true;
                checkBothLoaded();
            } else {
                alert(`Options configuration loaded but not found: ${config.name}`);
            }
        };
        optionsScript.onerror = function() {
            alert(`Failed to load options configuration: ${config.name}`);
        };
        document.head.appendChild(optionsScript);
    }

    // Handle report config selection
    $("#report-config-select").on("change", function() {
        const configId = $(this).val();
        if (configId) {
            loadReportConfig(configId);
        }
    });

    // Back to import button handler
    $("#back-to-import").on("click", function() {
        $("#options").hide();
        $("#import").show();
    });

    // Load the default report config on first entry to options page
    let reportConfigLoaded = false;
    
    // Populate parse config dropdown
    parseConfigs.forEach(config => {
        const option = `<option value="${config.id}" data-file="${config.file}">${config.name}</option>`;
        $("#parse-config-select").append(option);
        
        // Set as selected if it's the default
        if (config.default) {
            $("#parse-config-select").val(config.id);
        }
    });

    // Load the default config on page load
    const defaultConfig = parseConfigs.find(c => c.default);
    if (defaultConfig) {
        loadParseConfig(defaultConfig.id);
    }

    // Load selected parse config
    function loadParseConfig(configId) {
        const config = parseConfigs.find(c => c.id === configId);
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
            rows += `<tr><th colspan="2">${section.title}</th></tr>`;
            
            for (const handle of section.items) {
                const details = getMeasurementDetails(handle);
                const displayValue = results[handle] || "";
                
                rows += `<tr>
                    <td class="label">${details.label}</td>
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
        
        // Show options section first
        $("#import").hide();
        $("#options").show();
        
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
        
        // Collect all summary items with their order
        options.forEach(section => {
            Object.entries(section.params).forEach(([key, option]) => {
                if (option.enableSummary) {
                    const checkbox = $(`#${key}-summary`);
                    if (checkbox.length && checkbox.is(':checked') && metrics[key]?.trim()) {
                        summaryItems.push({
                            text: metrics[key],
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
    
    // Build the options form
    function buildOptionsForm() {
        options.forEach(section => {
            $("#options-content").append(`<h3>${section.title}</h3>\n\n`);

            Object.entries(section.params).forEach(([key, option]) => {
                // Determine layout class
                let layoutClass = '';
                if (!option.options && option.custom) {
                    layoutClass = 'no-dropdown';
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
    <div class="textarea-container" style="${option.conditionalText ? 'display: none;' : ''}">
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
                    $("select", $option).on("change", function () {
                        const selectedTitle = $(this).find(":selected").attr("title");
                        const $textarea = $(".textarea-container", $option);
                        
                        if (selectedTitle === "" || selectedTitle === undefined) {
                            $textarea.show();
                        } else {
                            $textarea.hide();
                            $("textarea", $option).val("");
                        }
                    });
                }

                // Main change handler
                $("select, textarea", $option).on("change", function () {
                    if (key === 'Summary') return; // Special handling below
                    
                    // Auto-check summary checkbox on non-default selection
                    if (option.summaryOnChange && option.enableSummary && option.options) {
                        const selectedOption = $("select", $option).find(":selected");
                        const isDefaultOption = selectedOption.attr('title') === '' || 
                            option.options.some(opt => 
                                typeof opt !== 'string' && opt.default && opt.title === selectedOption.attr('title')
                            );
                        
                        if (!isDefaultOption) {
                            $(`#${key}-summary`).prop('checked', true);
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
                    $(`#${key}-summary`).on('change', updateSummary);
                }
                
                // Summary field manual edit tracking
                if (key === 'Summary') {
                    $("textarea", $option).on("input change blur", function() {
                        summaryManuallyEdited = true;
                        metrics.Summary = $(this).val();
                    });
                }
            });
            
            $("#options-content").append(`<hr />`);
        });
    }
    
    // Initialize
    buildOptionsForm();
    updateSummary();
    
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