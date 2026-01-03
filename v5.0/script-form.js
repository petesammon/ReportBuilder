/* 
 * EchoTools v5.0 - Form Builder Script
 * Builds modals based on opt-form.js and places buttons alongside contenteditable output
 */

jQuery(document).ready(function () {
    
    // =========================================================================
    // BUTTON PLACEMENT SYSTEM
    // =========================================================================
    
    /**
     * Calculate button positions based on parameter locations in output
     */
    function calculateButtonPositions() {
        const $reportOutput = $('#report-output');
        if (!$reportOutput.length) {
            console.warn('calculateButtonPositions: report-output not found');
            return {};
        }
        
        const positions = {};
        
        // Get form sections from opt-form.js
        if (!window.formSections || !Array.isArray(window.formSections)) {
            console.warn('calculateButtonPositions: formSections not found or not array');
            return {};
        }
        
        console.log('Calculating positions for', window.formSections.length, 'sections');
        
        window.formSections.forEach(formSection => {
            const sectionKey = formSection.sectionPreviewKey;
            if (!sectionKey || !formSection.parameters || formSection.parameters.length === 0) {
                console.warn('Section missing key or parameters:', formSection);
                return;
            }
            
            // Find first parameter from this section in the contenteditable
            let firstParamSpan = null;
            for (let paramKey of formSection.parameters) {
                const $span = $reportOutput.find(`[data-param="${paramKey}"]`).first();
                if ($span.length) {
                    firstParamSpan = $span;
                    console.log(`Found first param ${paramKey} for section ${sectionKey}`);
                    break;
                }
            }
            
            if (firstParamSpan) {
                // Get position relative to report output
                const spanOffset = firstParamSpan.offset();
                const containerOffset = $reportOutput.offset();
                
                if (spanOffset && containerOffset) {
                    const relativeTop = spanOffset.top - containerOffset.top;
                    positions[sectionKey] = {
                        top: relativeTop,
                        title: formSection.sectionTitle || sectionKey
                    };
                    console.log(`Position for ${sectionKey}: ${relativeTop}px`);
                }
            } else {
                console.warn(`No parameter spans found for section ${sectionKey}`);
            }
        });
        
        return positions;
    }
    
    /**
     * Render buttons alongside contenteditable output
     */
    function renderButtons() {
        console.log('renderButtons called');
        
        // Clear existing buttons
        $('.report-buttons-container').remove();
        
        const positions = calculateButtonPositions();
        console.log('Button positions:', positions);
        
        const $reportOutput = $('#report-output');
        
        if (!$reportOutput.length) {
            console.warn('report-output element not found');
            return;
        }
        
        // Create buttons container
        const $buttonsContainer = $('<div class="report-buttons-container"></div>');
        
        Object.entries(positions).forEach(([sectionKey, pos]) => {
            console.log(`Creating button group for ${sectionKey} at top: ${pos.top}px`);
            
            const $buttonGroup = $(`
                <div class="button-group" style="top: ${pos.top}px;">
                    <button type="button" 
                            class="edit-button" 
                            data-section="${sectionKey}"
                            title="Edit ${pos.title}">✎</button>
                    <button type="button" 
                            class="exclude-button" 
                            data-section="${sectionKey}"
                            title="Exclude ${pos.title}">−</button>
                </div>
            `);
            
            $buttonsContainer.append($buttonGroup);
        });
        
        // Insert buttons container before the report output
        $reportOutput.before($buttonsContainer);
        
        console.log('Buttons rendered, attaching handlers');
        
        // Attach handlers
        attachButtonHandlers();
    }
    
    /**
     * Attach click handlers to buttons
     */
    function attachButtonHandlers() {
        // Edit button - opens modal
        $('.edit-button').off('click').on('click', function() {
            const sectionKey = $(this).data('section');
            const modalId = `${sectionKey}-modal`;
            
            $(`#${modalId}`).addClass('active');
            
            // Auto-scroll measurements panel
            if (typeof window.scrollToMeasurementSection === 'function') {
                scrollToMeasurementSection(sectionKey);
            }
        });
        
        // Exclude button - excludes all parameters in section
        $('.exclude-button').off('click').on('click', function() {
            const sectionKey = $(this).data('section');
            const $button = $(this);
            
            // Check if currently excluded
            const formSection = window.formSections.find(s => s.sectionPreviewKey === sectionKey);
            if (!formSection) return;
            
            const firstParam = formSection.parameters[0];
            const isExcluded = window.parameterData[firstParam]?.excluded;
            
            if (isExcluded) {
                // Re-include
                if (typeof window.excludeParametersBySection === 'function') {
                    excludeParametersBySection(sectionKey, false);
                }
                $button.text('−').attr('title', `Exclude ${formSection.sectionTitle}`);
            } else {
                // Exclude
                if (typeof window.excludeParametersBySection === 'function') {
                    excludeParametersBySection(sectionKey, true);
                }
                $button.text('+').attr('title', `Include ${formSection.sectionTitle}`);
            }
            
            // Recalculate button positions after regeneration
            setTimeout(renderButtons, 100);
        });
    }
    
    // =========================================================================
    // AUTO-SCROLL TO MEASUREMENTS
    // =========================================================================
    
    function scrollToMeasurementSection(sectionPreviewKey) {
        if (!sectionPreviewKey) return;
        
        const $targetSection = $(`#measurements-table tr[data-section~="${sectionPreviewKey}"]`).first();
        
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
    
    // =========================================================================
    // MODAL CREATION SYSTEM
    // =========================================================================
    
    /**
     * Build all modals from opt-form.js configuration
     */
    function buildModals() {
        // Remove existing modals (except import modal)
        $('.modal:not(#import-modal)').remove();
        
        if (!window.formSections || !Array.isArray(window.formSections)) {
            console.warn('No form sections defined in opt-form.js');
            return;
        }
        
        window.formSections.forEach(formSection => {
            createModal(formSection);
        });
    }
    
    /**
     * Create a single modal for a form section
     */
    function createModal(formSection) {
        const sectionKey = formSection.sectionPreviewKey;
        if (!sectionKey) return;
        
        const modalId = `${sectionKey}-modal`;
        const title = formSection.sectionTitle || sectionKey;
        
        // Build modal HTML with 3-column table structure
        const $modal = $(`
            <div id="${modalId}" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${title}</h2>
                        <button class="close-button" data-section="${sectionKey}">&times;</button>
                    </div>
                    <div class="modal-body" id="${modalId}-body">
                        <table class="modal-table">
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Value</th>
                                    <th>Summary</th>
                                </tr>
                            </thead>
                            <tbody id="${modalId}-parameters">
                                <!-- Parameter rows will be inserted here -->
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-back-button secondary" data-section="${sectionKey}">Back</button>
                        <button class="modal-done-button" data-section="${sectionKey}">Done</button>
                        <button class="modal-next-button secondary" data-section="${sectionKey}">Next</button>
                    </div>
                </div>
            </div>
        `);
        
        // Populate modal with parameters (append to tbody)
        const $tbody = $modal.find(`#${modalId}-parameters`);
        
        if (formSection.parameters && formSection.parameters.length > 0) {
            formSection.parameters.forEach(paramKey => {
                const paramConfig = window.options.find(opt => opt.parameter === paramKey);
                if (paramConfig) {
                    const $paramRow = createParameterRow(paramKey, paramConfig);
                    $tbody.append($paramRow);
                }
            });
        }
        
        // Append to body
        $('body').append($modal);
        
        // Attach modal handlers
        attachModalHandlers(sectionKey, modalId, formSection);
    }
    
    /**
     * Create table row for a parameter (3 columns: label, input, summary checkbox)
     */
    function createParameterRow(paramKey, paramConfig) {
        const $row = $('<tr class="parameter-row"></tr>');
        
        // Column 1: Parameter Label
        const $labelCell = $('<td class="param-label"></td>');
        $labelCell.text(paramConfig.title || paramKey);
        $row.append($labelCell);
        
        // Column 2: Input (dropdown or textarea)
        const $inputCell = $('<td class="param-input"></td>');
        
        if (paramConfig.options === 'customtext') {
            // Custom textarea
            const currentValue = window.parameterData[paramKey]?.value || '';
            const rows = paramConfig.textareaSize || 4;
            const $textarea = $(`
                <textarea id="${paramKey}-input" 
                          class="parameter-textarea"
                          rows="${rows}">${currentValue}</textarea>
            `);
            $inputCell.append($textarea);
            
        } else if (Array.isArray(paramConfig.options)) {
            // Dropdown select
            const $select = $(`<select id="${paramKey}-input" class="parameter-select"></select>`);
            
            paramConfig.options.forEach(option => {
                const value = option.title || option.label || option;
                const label = option.label || option.title || option;
                const isDefault = option.default === true;
                
                const $option = $(`<option value="${value}">${label}</option>`);
                if (isDefault) {
                    $option.attr('selected', 'selected');
                }
                
                $select.append($option);
            });
            
            // Set current value
            const currentValue = window.parameterData[paramKey]?.value;
            if (currentValue) {
                $select.val(currentValue);
            }
            
            $inputCell.append($select);
        }
        
        $row.append($inputCell);
        
        // Column 3: Summary Checkbox (if enableSummary is true)
        const $summaryCell = $('<td class="param-summary"></td>');
        
        if (paramConfig.enableSummary) {
            const param = window.parameterData[paramKey];
            
            // Determine if checkbox should be checked
            let summaryChecked = false;
            
            if (paramConfig.summaryAlwaysInclude) {
                // Always included, checkbox should be checked and disabled
                summaryChecked = true;
            } else if (param && param.summaryIncluded !== undefined) {
                // Use saved checkbox state
                summaryChecked = param.summaryIncluded;
            } else if (paramConfig.summaryDefault) {
                // Default to checked
                summaryChecked = true;
            } else if (paramConfig.summaryOnChange) {
                // Check if value differs from default
                const defaultOption = Array.isArray(paramConfig.options) 
                    ? paramConfig.options.find(opt => opt.default === true)
                    : null;
                const defaultValue = defaultOption ? (defaultOption.title || defaultOption.label) : '';
                const currentValue = param ? param.value : '';
                summaryChecked = currentValue && currentValue !== defaultValue;
            }
            
            const $checkbox = $(`
                <input type="checkbox" 
                       id="${paramKey}-summary" 
                       class="summary-checkbox"
                       data-param="${paramKey}"
                       ${summaryChecked ? 'checked' : ''}
                       ${paramConfig.summaryAlwaysInclude ? 'disabled' : ''}>
            `);
            
            $summaryCell.append($checkbox);
            
            // Add change handler for summaryOnChange dropdowns
            if (paramConfig.summaryOnChange && Array.isArray(paramConfig.options)) {
                const $select = $inputCell.find('select');
                if ($select.length) {
                    $select.on('change', function() {
                        const newValue = $(this).val();
                        const defaultOption = paramConfig.options.find(opt => opt.default === true);
                        const defaultValue = defaultOption ? (defaultOption.title || defaultOption.label) : '';
                        
                        // Auto-tick checkbox if value differs from default, untick if back to default
                        if (newValue !== defaultValue) {
                            $checkbox.prop('checked', true);
                        } else {
                            $checkbox.prop('checked', false);
                        }
                    });
                }
            }
        }
        
        $row.append($summaryCell);
        
        return $row;
    }
    
    /**
     * Attach handlers to modal buttons
     */
    function attachModalHandlers(sectionKey, modalId, formSection) {
        // Close button
        $(`#${modalId} .close-button`).on('click', function() {
            $(`#${modalId}`).removeClass('active');
        });
        
        // Done button
        $(`#${modalId} .modal-done-button`).on('click', function() {
            saveModalChanges(sectionKey, formSection);
            $(`#${modalId}`).removeClass('active');
        });
        
        // Back button
        $(`#${modalId} .modal-back-button`).on('click', function() {
            saveModalChanges(sectionKey, formSection);
            $(`#${modalId}`).removeClass('active');
            
            // Find previous section
            const currentIndex = window.formSections.findIndex(s => s.sectionPreviewKey === sectionKey);
            if (currentIndex > 0) {
                const prevSection = window.formSections[currentIndex - 1];
                const prevModalId = `${prevSection.sectionPreviewKey}-modal`;
                $(`#${prevModalId}`).addClass('active');
                
                if (typeof scrollToMeasurementSection === 'function') {
                    scrollToMeasurementSection(prevSection.sectionPreviewKey);
                }
            }
        });
        
        // Next button
        $(`#${modalId} .modal-next-button`).on('click', function() {
            saveModalChanges(sectionKey, formSection);
            $(`#${modalId}`).removeClass('active');
            
            // Find next section
            const currentIndex = window.formSections.findIndex(s => s.sectionPreviewKey === sectionKey);
            if (currentIndex < window.formSections.length - 1) {
                const nextSection = window.formSections[currentIndex + 1];
                const nextModalId = `${nextSection.sectionPreviewKey}-modal`;
                $(`#${nextModalId}`).addClass('active');
                
                if (typeof scrollToMeasurementSection === 'function') {
                    scrollToMeasurementSection(nextSection.sectionPreviewKey);
                }
            }
        });
        
        // Click outside to close
        $(`#${modalId}`).on('click', function(e) {
            if ($(e.target).hasClass('modal')) {
                $(this).removeClass('active');
            }
        });
    }
    
    /**
     * Save changes from modal to parameter data
     */
    function saveModalChanges(sectionKey, formSection) {
        if (!formSection.parameters) return;
        
        formSection.parameters.forEach(paramKey => {
            const $input = $(`#${paramKey}-input`);
            const $checkbox = $(`#${paramKey}-summary`);
            
            // Save input value
            if ($input.length) {
                const value = $input.val() || '';
                
                // Update parameter via global function
                if (typeof window.updateParameter === 'function') {
                    window.updateParameter(paramKey, value, true);
                }
            }
            
            // Save checkbox state
            if ($checkbox.length && window.parameterData && window.parameterData[paramKey]) {
                const isChecked = $checkbox.is(':checked');
                window.parameterData[paramKey].summaryIncluded = isChecked;
                
                // If manually unchecked, mark as manually edited for summaryDefault handling
                if (!isChecked) {
                    window.parameterData[paramKey].manualEdit = true;
                }
            }
        });
        
        // Recalculate button positions after regeneration
        setTimeout(renderButtons, 100);
    }
    
    // =========================================================================
    // FORM BUILDING MAIN FUNCTION
    // =========================================================================
    
    function buildForm() {
        console.log('buildForm called');
        
        // Load opt-form.js configuration
        loadFormConfiguration();
        
        // Build modals
        buildModals();
        
        // Render buttons after a delay to ensure report is rendered
        setTimeout(() => {
            console.log('Calling renderButtons');
            renderButtons();
        }, 500);
    }
    
    /**
     * Load form configuration from opt-form.js
     */
    function loadFormConfiguration() {
        // The formSections should already be loaded from opt-form.js
        // Just verify it exists
        if (!window.formSections || !Array.isArray(window.formSections)) {
            console.warn('formSections not loaded from opt-form.js');
        }
    }
    
    // =========================================================================
    // EXPOSE GLOBALLY
    // =========================================================================
    
    window.buildForm = buildForm;
    window.renderButtons = renderButtons;
    window.scrollToMeasurementSection = scrollToMeasurementSection;
    
    // =========================================================================
    // NOTE: buildForm is called directly from script-report.js
    // after all configurations are loaded
    // =========================================================================
});