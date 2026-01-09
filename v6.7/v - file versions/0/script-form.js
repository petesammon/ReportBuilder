/* jshint loopfunc: true, esversion: 11 */
/* EchoTools v6.5 - Form Building and ContentEditable Handlers + Multi-file Modal Navigation */

jQuery(document).ready(function () {
    
    // ============================================================================
    // CONTENTEDITABLE EVENT HANDLERS
    // ============================================================================
    
    /**
     * Setup ContentEditable event handlers
     */
    function setupContentEditableHandlers() {
        const $textarea = $('#report-textarea');
        if (!$textarea.length) return;
        
        // Remove existing handlers
        $textarea.off('input.v6 keydown.v6 paste.v6 contextmenu.v6');
        
        // Input handler - detect manual edits WITHOUT moving cursor
        $textarea.on('input.v6', function(e) {
            handleInputEvent(e);
        });
        
        // Keydown handler - handle special keys
        $textarea.on('keydown.v6', function(e) {
            handleKeyDown(e);
        });
        
        // Paste handler
        $textarea.on('paste.v6', function(e) {
            handlePaste(e);
        });
        
        // Context menu handler - works on all span types
        $textarea.on('contextmenu.v6', '[data-handle]', function(e) {
            handleContextMenu(e);
        });
        
        console.log('[v6.5 Form] ContentEditable handlers attached');
    }
    
    /**
     * Handle input event - update registry without moving cursor
     */
    function handleInputEvent(e) {
        const $textarea = $('#report-textarea');
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        
        let $span = null;
        while (node && node !== $textarea[0]) {
            if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('data-handle')) {
                $span = $(node);
                break;
            }
            node = node.parentNode;
        }
        
        if ($span && $span.length) {
            const handle = $span.attr('data-handle');
            const type = $span.attr('data-type');
            const spanId = $span.attr('data-id');
            const currentContent = $span.text();
            
            const entry = window.getRegistryEntry(handle);
            if (!entry) return;
            
            let expectedValue = entry.value || '';
            if (type === 'measurement' && entry.unit && entry.value) {
                expectedValue = `${entry.value}${entry.unit}`;
            }
            
            if (currentContent !== expectedValue) {
                if (type === 'measurement') {
                    let rawValue = currentContent;
                    if (entry.unit && currentContent.endsWith(entry.unit)) {
                        rawValue = currentContent.slice(0, -entry.unit.length);
                    }
                    window.setMeasurementValue(handle, rawValue, 'dirty', false);
                    
                    const $input = $(`.measurement-input[data-handle="${handle}"]`);
                    if ($input.length) {
                        $input.val(rawValue);
                    }
                } else if (type === 'parameter') {
                    window.setParamValue(handle, currentContent, 'dirty', false);
                } else {
                    window.setRegistryValue(handle, currentContent, 'dirty');
                }
                
                $span.attr('data-status', 'dirty');
                $span.removeClass('span-clean-measurement span-clean-parameter span-clean-fixed span-unknown');
                $span.addClass('span-dirty');
                
                window.updateSpansForHandle(handle, spanId);
            }
        }
    }
    
    /**
     * Handle keydown events
     */
    function handleKeyDown(e) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEnterKey(range, selection);
            return;
        }
        
        if (e.key === 'Backspace' || e.key === 'Delete') {
            const $span = findParentSpan(range.commonAncestorContainer);
            
            if ($span && $span.length && isFullSpanSelected($span[0], range)) {
                e.preventDefault();
                clearSpanContent($span);
                return;
            }
        }
    }
    
    function findParentSpan(node) {
        const $textarea = $('#report-textarea');
        while (node && node !== $textarea[0]) {
            if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('data-handle')) {
                return $(node);
            }
            node = node.parentNode;
        }
        return null;
    }
    
    function isFullSpanSelected(span, range) {
        if (!span || !range) return false;
        
        const spanRange = document.createRange();
        spanRange.selectNodeContents(span);
        
        const startsAtBeginning = range.compareBoundaryPoints(Range.START_TO_START, spanRange) <= 0;
        const endsAtEnd = range.compareBoundaryPoints(Range.END_TO_END, spanRange) >= 0;
        
        return startsAtBeginning && endsAtEnd;
    }
    
    function clearSpanContent($span) {
        const handle = $span.attr('data-handle');
        const type = $span.attr('data-type');
        
        $span.text('');
        
        if (type === 'measurement') {
            window.setMeasurementValue(handle, '', 'dirty', false);
            
            const $input = $(`.measurement-input[data-handle="${handle}"]`);
            if ($input.length) {
                $input.val('');
            }
        } else if (type === 'parameter') {
            window.setParamValue(handle, '', 'dirty', false);
            window.setParameterChecked(handle, false);
            
            const $checkbox = $(`.summary-checkbox[data-param="${handle}"]`);
            if ($checkbox.length) {
                $checkbox.prop('checked', false);
            }
        } else {
            window.setRegistryValue(handle, '', 'dirty');
        }
        
        $span.attr('data-status', 'dirty');
        $span.removeClass('span-clean-measurement span-clean-parameter span-clean-fixed span-unknown');
        $span.addClass('span-dirty');
        
        window.updateSpansForHandle(handle, $span.attr('data-id'));
        
        if (type === 'parameter') {
            window.updateSummary();
        }
        
        const newRange = document.createRange();
        newRange.setStart($span[0], 0);
        newRange.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
    
    function handleEnterKey(range, selection) {
        const $textarea = $('#report-textarea');
        const $span = findParentSpan(range.commonAncestorContainer);
        
        if ($span && $span.length) {
            const handle = $span.attr('data-handle');
            const type = $span.attr('data-type');
            
            const br = document.createElement('br');
            range.deleteContents();
            range.insertNode(br);
            
            range.setStartAfter(br);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            
            $span.attr('data-status', 'dirty');
            $span.removeClass('span-clean-measurement span-clean-parameter span-clean-fixed span-unknown');
            $span.addClass('span-dirty');
            
            const newContent = $span.text();
            if (type === 'measurement') {
                const entry = window.getRegistryEntry(handle);
                let rawValue = newContent;
                if (entry?.unit && newContent.endsWith(entry.unit)) {
                    rawValue = newContent.slice(0, -entry.unit.length);
                }
                window.setMeasurementValue(handle, rawValue, 'dirty', false);
            } else if (type === 'parameter') {
                window.setParamValue(handle, newContent, 'dirty', false);
            } else {
                window.setRegistryValue(handle, newContent, 'dirty');
            }
        } else {
            const br = document.createElement('br');
            range.deleteContents();
            range.insertNode(br);
            
            const manualHandle = window.registerManualEdit('');
            const spanId = window.generateSpanId();
            window.addSpanIdToRegistry(manualHandle, spanId);
            
            const manualSpan = document.createElement('span');
            manualSpan.setAttribute('data-type', 'manual');
            manualSpan.setAttribute('data-handle', manualHandle);
            manualSpan.setAttribute('data-id', spanId);
            manualSpan.setAttribute('data-status', 'dirty');
            manualSpan.className = 'span-dirty';
            manualSpan.appendChild(document.createTextNode('\u200B'));
            
            if (br.nextSibling) {
                br.parentNode.insertBefore(manualSpan, br.nextSibling);
            } else {
                br.parentNode.appendChild(manualSpan);
            }
            
            const newRange = document.createRange();
            newRange.setStart(manualSpan.firstChild, 1);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
    
    function handlePaste(e) {
        e.preventDefault();
        
        const clipboardData = e.originalEvent.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text/plain');
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const $span = findParentSpan(range.commonAncestorContainer);
        
        range.deleteContents();
        
        const textNode = document.createTextNode(pastedText);
        range.insertNode(textNode);
        
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        if ($span && $span.length) {
            const handle = $span.attr('data-handle');
            const type = $span.attr('data-type');
            
            $span.attr('data-status', 'dirty');
            $span.removeClass('span-clean-measurement span-clean-parameter span-clean-fixed span-unknown');
            $span.addClass('span-dirty');
            
            const newContent = $span.text();
            if (type === 'measurement') {
                const entry = window.getRegistryEntry(handle);
                let rawValue = newContent;
                if (entry?.unit && newContent.endsWith(entry.unit)) {
                    rawValue = newContent.slice(0, -entry.unit.length);
                }
                window.setMeasurementValue(handle, rawValue, 'dirty', false);
            } else if (type === 'parameter') {
                window.setParamValue(handle, newContent, 'dirty', false);
            } else {
                window.setRegistryValue(handle, newContent, 'dirty');
            }
            
            window.updateSpansForHandle(handle, $span.attr('data-id'));
        } else {
            const manualHandle = window.registerManualEdit(pastedText);
            const spanId = window.generateSpanId();
            window.addSpanIdToRegistry(manualHandle, spanId);
            
            const manualSpan = document.createElement('span');
            manualSpan.setAttribute('data-type', 'manual');
            manualSpan.setAttribute('data-handle', manualHandle);
            manualSpan.setAttribute('data-id', spanId);
            manualSpan.setAttribute('data-status', 'dirty');
            manualSpan.className = 'span-dirty';
            
            textNode.parentNode.insertBefore(manualSpan, textNode);
            manualSpan.appendChild(textNode);
            
            range.setStartAfter(textNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    // ============================================================================
    // SUMMARY CHECKBOX EVALUATION HELPERS
    // ============================================================================
    
    /**
     * Evaluate whether summary checkbox should be checked based on parameter config
     * Handles: summaryOnChange, summaryThreshold, summaryNotThreshold
     * 
     * @param {string} paramKey - Parameter key
     * @param {object} paramConfig - Parameter configuration from window.parameters
     * @param {string} selectedValue - Currently selected value (title)
     * @param {object|null} selectedOption - Full option object if available
     * @returns {boolean|null} - true/false for checkbox state, null to leave unchanged
     */
    function evaluateSummaryCheckboxState(paramKey, paramConfig, selectedValue, selectedOption) {
        if (!paramConfig || !paramConfig.enableSummary) {
            return null; // No summary for this parameter
        }
        
        // Get the label for threshold checking
        const selectedLabel = selectedOption 
            ? (selectedOption.label || selectedOption.title) 
            : selectedValue;
        
        // Check if this is the default option
        const isDefault = selectedOption && selectedOption.default === true;
        
        // If this is the default option, use summaryDefault
        if (isDefault) {
            return paramConfig.summaryDefault === true;
        }
        
        // summaryThreshold: check only if value matches one of the threshold values
        if (paramConfig.summaryThreshold && Array.isArray(paramConfig.summaryThreshold)) {
            return paramConfig.summaryThreshold.includes(selectedLabel);
        }
        
        // summaryNotThreshold: check only if value does NOT match threshold values
        if (paramConfig.summaryNotThreshold && Array.isArray(paramConfig.summaryNotThreshold)) {
            return !paramConfig.summaryNotThreshold.includes(selectedLabel);
        }
        
        // summaryOnChange: check if changed from default (any non-default selection)
        if (paramConfig.summaryOnChange === true) {
            return true; // Non-default selection with summaryOnChange = check
        }
        
        // Default behavior: if summaryDefault is true and there's a value, keep checked
        if (paramConfig.summaryDefault === true && selectedValue) {
            return true;
        }
        
        return null; // Leave unchanged
    }
    
    /**
     * Apply summary checkbox evaluation and update registry
     * @param {string} paramKey - Parameter key
     * @param {string} selectedValue - Selected value
     * @param {object|null} selectedOption - Full option object if available
     */
    function applySummaryCheckboxLogic(paramKey, selectedValue, selectedOption) {
        const paramConfig = window.parameters?.[paramKey];
        if (!paramConfig?.enableSummary) return;
        
        const shouldCheck = evaluateSummaryCheckboxState(paramKey, paramConfig, selectedValue, selectedOption);
        
        if (shouldCheck !== null) {
            window.setParameterChecked(paramKey, shouldCheck);
            
            // Update any visible checkboxes in modals
            const $checkbox = $(`.modal-summary-checkbox[data-param="${paramKey}"]`);
            if ($checkbox.length) {
                $checkbox.prop('checked', shouldCheck);
            }
        }
        
        // Handle summaryExclude - exclude other parameters when this one is checked
        if (shouldCheck) {
            handleSummaryExclude(paramKey, paramConfig);
        } else {
            // When unchecking, check if excluded items should be restored
            handleSummaryRestore(paramKey, paramConfig);
        }
    }
    
    /**
     * Handle summaryExclude logic - when a parameter is checked, exclude specified parameters
     * @param {string} paramKey - The parameter being checked
     * @param {object} paramConfig - Parameter configuration
     */
    function handleSummaryExclude(paramKey, paramConfig) {
        if (!paramConfig?.summaryExclude || !Array.isArray(paramConfig.summaryExclude)) {
            return;
        }
        
        paramConfig.summaryExclude.forEach(excludeKey => {
            // Get current checked state
            const isCurrentlyChecked = window.getParameterChecked(excludeKey);
            
            if (isCurrentlyChecked) {
                // Uncheck the excluded parameter
                window.setParameterChecked(excludeKey, false);
                
                // Update UI checkboxes
                const $checkbox = $(`.modal-summary-checkbox[data-param="${excludeKey}"], .summary-checkbox[data-param="${excludeKey}"]`);
                if ($checkbox.length) {
                    $checkbox.prop('checked', false);
                }
                
                console.log(`[summaryExclude] ${paramKey} excluded ${excludeKey} from summary`);
            }
        });
    }
    
    /**
     * Handle summaryRestore logic - when a parameter is unchecked, restore excluded parameters
     * Only restores if no OTHER parameters are still excluding the same key
     * @param {string} paramKey - The parameter being unchecked
     * @param {object} paramConfig - Parameter configuration
     */
    function handleSummaryRestore(paramKey, paramConfig) {
        if (!paramConfig?.summaryExclude || !Array.isArray(paramConfig.summaryExclude)) {
            return;
        }
        
        paramConfig.summaryExclude.forEach(excludeKey => {
            // Check if any OTHER parameters are still excluding this key
            let otherExcludersActive = false;
            
            if (window.options && Array.isArray(window.options)) {
                window.options.forEach(section => {
                    if (!section.variables || otherExcludersActive) return;
                    
                    section.variables.forEach(otherVarKey => {
                        if (otherVarKey === paramKey || otherExcludersActive) return;
                        
                        const otherParamConfig = window.parameters?.[otherVarKey];
                        if (!otherParamConfig) return;
                        
                        // Check if this other parameter also excludes the same key
                        if (otherParamConfig.summaryExclude && 
                            Array.isArray(otherParamConfig.summaryExclude) &&
                            otherParamConfig.summaryExclude.includes(excludeKey)) {
                            
                            // Check if the other excluder is currently checked
                            const isOtherChecked = window.getParameterChecked(otherVarKey);
                            if (isOtherChecked) {
                                otherExcludersActive = true;
                            }
                        }
                    });
                });
            }
            
            // If no other excluders are active, restore based on the excluded parameter's config
            if (!otherExcludersActive) {
                const excludeParamConfig = window.parameters?.[excludeKey];
                
                // Determine if it should be restored (based on its own summaryDefault)
                if (excludeParamConfig?.enableSummary && excludeParamConfig?.summaryDefault === true) {
                    // Check if the excluded parameter has a non-empty value
                    const excludeValue = window.getParamValue(excludeKey);
                    if (excludeValue && excludeValue.trim()) {
                        window.setParameterChecked(excludeKey, true);
                        
                        // Update UI checkboxes
                        const $checkbox = $(`.modal-summary-checkbox[data-param="${excludeKey}"], .summary-checkbox[data-param="${excludeKey}"]`);
                        if ($checkbox.length) {
                            $checkbox.prop('checked', true);
                        }
                        
                        console.log(`[summaryRestore] ${excludeKey} restored to summary`);
                    }
                }
            }
        });
    }
    
    // ============================================================================
    // CONTEXT MENU - Enhanced for all span types
    // ============================================================================
    
    /**
     * Handle context menu for any span type
     * - Parameters: show options list with (custom text) at top
     * - Measurements/Fixed/Manual: show (custom text) only
     */
    function handleContextMenu(e) {
        const $span = $(e.target).closest('[data-handle]');
        if (!$span.length) return;
        
        const handle = $span.attr('data-handle');
        const type = $span.attr('data-type');
        
        e.preventDefault();
        
        // Remove any existing menu
        $('.param-context-menu').remove();
        
        const $menu = $('<div class="param-context-menu"></div>');
        
        // Add (custom text) option for ALL span types
        $menu.append(`<div class="context-menu-item context-menu-custom" data-action="custom">(custom text)</div>`);
        
        // For parameters with options, add the options list
        const paramConfig = window.parameters?.[handle];
        if (type === 'parameter' && paramConfig?.options && Array.isArray(paramConfig.options)) {
            $menu.append(`<div class="context-menu-separator"></div>`);
            
            const currentValue = window.getParamValue(handle);
            
            paramConfig.options.forEach((opt, index) => {
                const isString = typeof opt === 'string';
                const displayText = isString ? opt : (opt.label || opt.title || '');
                const valueText = isString ? opt : (opt.title || '');
                const isSelected = valueText === currentValue;
                const selectedClass = isSelected ? ' selected' : '';
                
                $menu.append(`<div class="context-menu-item${selectedClass}" data-value="${valueText.replace(/"/g, '&quot;')}" data-index="${index}">${displayText}</div>`);
            });
        }
        
        $menu.css({
            position: 'absolute',
            left: e.pageX + 'px',
            top: e.pageY + 'px',
            zIndex: 10000
        });
        
        $('body').append($menu);
        
        // Adjust position if overflowing viewport
        const menuRect = $menu[0].getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (menuRect.right > viewportWidth) {
            $menu.css('left', (e.pageX - menuRect.width) + 'px');
        }
        if (menuRect.bottom > viewportHeight) {
            $menu.css('top', (e.pageY - menuRect.height) + 'px');
        }
        
        // Handle (custom text) click
        $menu.on('click', '.context-menu-custom', function() {
            $menu.remove();
            
            // Mark span as dirty
            $span.attr('data-status', 'dirty');
            $span.removeClass('span-clean-measurement span-clean-parameter span-clean-fixed span-unknown');
            $span.addClass('span-dirty');
            
            // Update registry status to dirty (keep value, change status)
            const entry = window.getRegistryEntry(handle);
            if (entry) {
                if (type === 'measurement') {
                    window.setMeasurementValue(handle, entry.value, 'dirty', false);
                } else if (type === 'parameter') {
                    window.setParamValue(handle, entry.value, 'dirty', false);
                } else {
                    window.setRegistryValue(handle, entry.value, 'dirty');
                }
            }
            
            // Select the full span text for editing
            selectSpanText($span[0]);
        });
        
        // Handle option selection (for parameters)
        $menu.on('click', '.context-menu-item:not(.context-menu-custom)', function() {
            const value = $(this).data('value');
            const index = $(this).data('index');
            
            // Update registry
            window.setParamValue(handle, value, 'clean');
            
            // Find and store the selected option object
            let selectedOpt = null;
            if (paramConfig?.options && index !== undefined) {
                selectedOpt = paramConfig.options[index];
                if (selectedOpt) {
                    window.selectedOptions[handle] = selectedOpt;
                }
            }
            
            // Apply summary checkbox logic (summaryOnChange, summaryThreshold, summaryNotThreshold)
            applySummaryCheckboxLogic(handle, value, selectedOpt);
            
            // Update any form selects
            const $select = $(`#${handle}-select, .modal-select[data-param="${handle}"]`);
            if ($select.length) {
                $select.val(value);
            }
            
            window.updateSummary();
            $menu.remove();
        });
        
        // Close on click outside
        $(document).one('click', function(evt) {
            if (!$(evt.target).closest('.param-context-menu').length) {
                $menu.remove();
            }
        });
        
        // Close on escape
        $(document).one('keydown', function(evt) {
            if (evt.key === 'Escape') {
                $menu.remove();
            }
        });
    }
    
    /**
     * Select all text within a span element for editing
     * @param {HTMLElement} spanElement - The span to select
     */
    function selectSpanText(spanElement) {
        const selection = window.getSelection();
        const range = document.createRange();
        
        range.selectNodeContents(spanElement);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Focus the contenteditable
        const $textarea = $('#report-textarea');
        if ($textarea.length) {
            $textarea.focus();
        }
    }
    
    // ============================================================================
    // FORM BUILDING
    // ============================================================================
    
    /**
     * Build the options form from config (hidden, used for internal state)
     */
    function buildForm() {
        const $optionsContent = $('#options-content');
        if (!$optionsContent.length || !window.options) return;
        
        $optionsContent.empty();
        
        window.options.forEach((section, sectionIndex) => {
            if (!section.modalKey) return;
            
            const $section = $(`
                <div class="options-section" data-modal="${section.modalKey}">
                    <div class="options-section-header">
                        <h3>${section.modalTitle || section.modalKey}</h3>
                    </div>
                    <div class="options-section-content"></div>
                </div>
            `);
            
            const $content = $section.find('.options-section-content');
            
            if (section.variables) {
                section.variables.forEach(varKey => {
                    const paramConfig = window.parameters?.[varKey];
                    if (!paramConfig) return;
                    
                    const $field = buildParameterField(varKey, paramConfig);
                    if ($field) {
                        $content.append($field);
                    }
                });
            }
            
            $optionsContent.append($section);
        });
        
        setupFormHandlers();
        
        // IMPORTANT: updateSummary MUST be called BEFORE updateReportTextarea
        // so that the Summary registry value is populated before the template renders
        window.updateSummary();
        window.updateReportTextarea();
        
        setupContentEditableHandlers();
        
        console.log('[v6.5 Form] Form built');
    }
    
    /**
     * Build a parameter field (for hidden form)
     */
    function buildParameterField(varKey, paramConfig) {
        const $field = $('<div class="param-field"></div>');
        
        const $labelRow = $('<div class="param-label-row"></div>');
        
        if (paramConfig.enableSummary) {
            const isChecked = window.getParameterChecked(varKey);
            $labelRow.append(`
                <label class="summary-checkbox-label">
                    <input type="checkbox" class="summary-checkbox" data-param="${varKey}" ${isChecked ? 'checked' : ''}>
                    ${paramConfig.label || varKey}
                </label>
            `);
        } else {
            $labelRow.append(`<label>${paramConfig.label || varKey}</label>`);
        }
        
        $field.append($labelRow);
        
        if (paramConfig.options && Array.isArray(paramConfig.options)) {
            const $select = $(`<select id="${varKey}-select" class="param-select" data-param="${varKey}"></select>`);
            
            paramConfig.options.forEach(opt => {
                const title = typeof opt === 'string' ? opt : opt.title;
                const label = typeof opt === 'string' ? opt : (opt.label || opt.title);
                const isDefault = typeof opt !== 'string' && opt.default;
                
                $select.append(`<option value="${title}" ${isDefault ? 'selected' : ''}>${label}</option>`);
            });
            
            const currentValue = window.getParamValue(varKey);
            if (currentValue) {
                $select.val(currentValue);
            }
            
            $field.append($select);
        } else if (paramConfig.customtext || paramConfig.options === 'customtext') {
            const $textarea = $(`
                <textarea id="${varKey}-textarea" class="param-textarea" data-param="${varKey}" 
                          placeholder="${paramConfig.placeholder || ''}"></textarea>
            `);
            
            const currentValue = window.getParamValue(varKey);
            if (currentValue) {
                $textarea.val(currentValue);
            }
            
            $field.append($textarea);
            
            setTimeout(() => window.autoResizeTextarea($textarea), 10);
        }
        
        return $field;
    }
    
    /**
     * Setup form event handlers
     */
    function setupFormHandlers() {
        // Parameter selects
        $('.param-select').off('change').on('change', function() {
            const varKey = $(this).data('param');
            const value = $(this).val();
            const selectedIndex = this.selectedIndex;
            const paramConfig = window.parameters?.[varKey];
            
            window.setParamValue(varKey, value, 'clean');
            
            // Find and store the selected option object
            let selectedOpt = null;
            if (paramConfig?.options && selectedIndex >= 0) {
                selectedOpt = paramConfig.options[selectedIndex];
                if (selectedOpt && typeof selectedOpt !== 'string') {
                    window.selectedOptions[varKey] = selectedOpt;
                } else if (selectedOpt) {
                    window.selectedOptions[varKey] = { title: selectedOpt };
                }
            }
            
            // Apply summary checkbox logic (summaryOnChange, summaryThreshold, summaryNotThreshold)
            applySummaryCheckboxLogic(varKey, value, selectedOpt);
            
            window.updateSummary();
        });
        
        // Summary checkboxes
        $('.summary-checkbox').off('change').on('change', function() {
            const varKey = $(this).data('param');
            const isChecked = $(this).is(':checked');
            
            window.setParameterChecked(varKey, isChecked);
            window.updateSummary();
        });
        
        // Custom textareas
        $('.param-textarea').off('input').on('input', function() {
            const varKey = $(this).data('param');
            const value = $(this).val();
            
            window.setParamValue(varKey, value, 'dirty');
            window.updateSummary();
            window.autoResizeTextarea($(this));
        });
        
        // Inline edit button
        $('#report-textarea').off('click.buttons').on('click.buttons', '.inline-edit-button', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const modalKey = $(this).data('modal');
            openModal(modalKey);
        });
    }
    
    // ============================================================================
    // MODAL NAVIGATION HELPERS (v6.5 - Multi-file aware)
    // ============================================================================
    
    // Track where we came from when navigating to Summary
    let lastModalBeforeSummary = null;
    
    /**
     * Get the file index for a modal key
     * Returns the index, or -1 if not found (for Summary, etc.)
     */
    function getFileIndexForModal(modalKey) {
        if (modalKey === 'Summary') return -1; // Summary is special, not in any file
        if (window.modalToFileIndex && window.modalToFileIndex[modalKey] !== undefined) {
            return window.modalToFileIndex[modalKey];
        }
        // Fallback: look it up from options
        const section = window.options?.find(s => s.modalKey === modalKey);
        if (section && section._fileIndex !== undefined) {
            return section._fileIndex;
        }
        return 0; // Default to first file
    }
    
    /**
     * Get visible modal keys within a specific options file
     * @param {number|null} fileIndex - Optional file index filter, null for all
     */
    function getVisibleModalKeys(fileIndex = null) {
        if (!window.options) return [];
        
        return window.options
            .filter(section => {
                if (!section.modalKey) return false;
                if (section.modalKey === 'Summary') return false; // Exclude Summary from file lists
                if (fileIndex !== null) {
                    // Check both the _fileIndex property and the lookup map
                    const sectionFileIndex = section._fileIndex !== undefined 
                        ? section._fileIndex 
                        : getFileIndexForModal(section.modalKey);
                    if (sectionFileIndex !== fileIndex) return false;
                }
                return true;
            })
            .map(section => section.modalKey);
    }
    
    /**
     * Get previous modal key within the same options file
     */
    function getPreviousModalKey(currentModalKey) {
        if (currentModalKey === 'Summary') return null; // Summary uses getBackModalForSummary instead
        const fileIndex = getFileIndexForModal(currentModalKey);
        const keys = getVisibleModalKeys(fileIndex);
        const currentIndex = keys.indexOf(currentModalKey);
        if (currentIndex > 0) {
            return keys[currentIndex - 1];
        }
        return null;
    }
    
    /**
     * Get next modal key within the same options file
     */
    function getNextModalKey(currentModalKey) {
        if (currentModalKey === 'Summary') return null;
        const fileIndex = getFileIndexForModal(currentModalKey);
        const keys = getVisibleModalKeys(fileIndex);
        const currentIndex = keys.indexOf(currentModalKey);
        if (currentIndex >= 0 && currentIndex < keys.length - 1) {
            return keys[currentIndex + 1];
        }
        return null;
    }
    
    /**
     * Check if this is the first modal in its options file
     */
    function isFirstModal(modalKey) {
        if (modalKey === 'Summary') return false;
        const fileIndex = getFileIndexForModal(modalKey);
        const keys = getVisibleModalKeys(fileIndex);
        return keys.length > 0 && keys.indexOf(modalKey) === 0;
    }
    
    /**
     * Check if this is the last modal in its options file
     */
    function isLastModal(modalKey) {
        if (modalKey === 'Summary') return false;
        const fileIndex = getFileIndexForModal(modalKey);
        const keys = getVisibleModalKeys(fileIndex);
        const idx = keys.indexOf(modalKey);
        return keys.length > 0 && idx >= 0 && idx === keys.length - 1;
    }
    
    /**
     * Get the appropriate "back" modal for Summary
     * Returns the modal user came from, or last modal in first file as fallback
     */
    function getBackModalForSummary() {
        // If we tracked where we came from, use that
        if (lastModalBeforeSummary) {
            return lastModalBeforeSummary;
        }
        // Fallback: last modal in first options file
        const firstFileModals = getVisibleModalKeys(0);
        if (firstFileModals.length > 0) {
            return firstFileModals[firstFileModals.length - 1];
        }
        // Ultimate fallback: first modal we can find
        const allModals = getVisibleModalKeys(null);
        return allModals.length > 0 ? allModals[allModals.length - 1] : null;
    }
    
    // ============================================================================
    // MODAL BUILDING - 4 COLUMN STRUCTURE
    // ============================================================================
    
    /**
     * Open a modal for editing
     */
    function openModal(modalKey) {
        const section = window.options?.find(s => s.modalKey === modalKey);
        if (!section) {
            console.warn(`[v6.5 Modal] Section not found for modalKey: ${modalKey}`);
            return;
        }
        
        let $modal = $(`#modal-${modalKey}`);
        
        if (!$modal.length) {
            $modal = buildModal(modalKey, section);
            $('body').append($modal);
        }
        
        updateModalContent($modal, section);
        $modal.addClass('active');
        
        // Scroll measurements table to show corresponding measurements
        if (typeof window.scrollToMeasurementModal === 'function') {
            window.scrollToMeasurementModal(modalKey);
        }
    }
    
    /**
     * Build a modal dialog with navigation buttons
     * Button structure: [< Back] [Done] [Next >]
     * Back button is hidden (not disabled) on first modal in its file
     * Summary modal only gets: [Back] [Done]
     * For file index 0: Last modal shows "Summary >" button
     * For file index > 0: Last modal shows only [Back] [Done] - no Summary
     */
    function buildModal(modalKey, section) {
        const isSummary = modalKey === 'Summary';
        const prevKey = getPreviousModalKey(modalKey);
        const nextKey = getNextModalKey(modalKey);
        const isFirst = isFirstModal(modalKey);
        const isLast = !isSummary && isLastModal(modalKey);
        const fileIndex = getFileIndexForModal(modalKey);
        const isSecondaryFile = fileIndex > 0;
        
        // Debug logging
        console.log(`[v6.5 Modal] Building ${modalKey}: fileIndex=${fileIndex}, isFirst=${isFirst}, isLast=${isLast}, prevKey=${prevKey}, nextKey=${nextKey}`);
        
        // Build action buttons
        let actionButtons = '';
        
        // Back button
        if (isSummary) {
            // Summary always has a back button (goes to where we came from)
            actionButtons += `<button type="button" class="modal-back-button modal-summary-back" data-modal="${modalKey}">< Back</button>`;
        } else if (isFirst) {
            // First modal in file - invisible placeholder
            actionButtons += `<button type="button" class="modal-back-placeholder" disabled>< Back</button>`;
        } else {
            actionButtons += `<button type="button" class="modal-back-button" data-modal="${modalKey}">< Back</button>`;
        }
        
        // Done button
        actionButtons += `<button type="button" class="modal-done-button" data-modal="${modalKey}">Done</button>`;
        
        // Next button (not for Summary)
        if (!isSummary) {
            if (isLast) {
                // Last modal in file
                if (isSecondaryFile) {
                    // Secondary file (eye button): No Summary button, just Back and Done
                    // Add invisible placeholder to maintain layout
                    actionButtons += `<button type="button" class="modal-next-placeholder" disabled style="visibility: hidden;">Next ></button>`;
                } else {
                    // Primary file (index 0): Show Summary button
                    actionButtons += `<button type="button" class="modal-next-button modal-next-to-summary" data-modal="${modalKey}">Summary ></button>`;
                }
            } else if (nextKey) {
                // Has a next modal in file
                actionButtons += `<button type="button" class="modal-next-button" data-modal="${modalKey}">Next ></button>`;
            } else {
                // No next key and not marked as last - treat based on file
                if (isSecondaryFile) {
                    actionButtons += `<button type="button" class="modal-next-placeholder" disabled style="visibility: hidden;">Next ></button>`;
                } else {
                    actionButtons += `<button type="button" class="modal-next-button modal-next-to-summary" data-modal="${modalKey}">Summary ></button>`;
                }
            }
        }
        
        const $modal = $(`
            <div id="modal-${modalKey}" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${section.modalTitle || modalKey}</h2>
                        <button type="button" class="close-button" data-modal="${modalKey}">&times;</button>
                    </div>
                    <div class="modal-actions">
                        ${actionButtons}
                    </div>
                    <div class="modal-body">
                        <table class="template-options-table">
                            <thead>
                                <tr>
                                    <th>Label</th>
                                    <th></th>
                                    <th>Value</th>
                                    <th>Summary</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `);
        
        const $tbody = $modal.find('.template-options-table tbody');
        
        // Build table rows for each variable in order (parameters AND measurements)
        if (section.variables) {
            const parseConfigMap = window.getParseConfigMap ? window.getParseConfigMap() : {};
            section.variables.forEach(varKey => {
                const paramConfig = window.parameters?.[varKey];
                if (paramConfig) {
                    // This is a parameter
                    const $row = buildModalParameterRow(varKey, paramConfig);
                    if ($row) {
                        $tbody.append($row);
                    }
                } else {
                    // Check if it's a measurement (from parseConfig or manualConfig)
                    const measurementConfig = parseConfigMap[varKey] || 
                                              (window.manualConfig?.find(m => m.handle === varKey));
                    if (measurementConfig) {
                        const $row = buildModalMeasurementRow(varKey);
                        if ($row) {
                            $tbody.append($row);
                        }
                    }
                }
            });
        }
        
        // Event handlers
        $modal.find('.close-button').on('click', function() {
            saveModalChanges($modal, section);
            $modal.removeClass('active');
        });
        
        $modal.find('.modal-done-button').on('click', function() {
            saveModalChanges($modal, section);
            $modal.removeClass('active');
        });
        
        $modal.find('.modal-back-button:not(.modal-summary-back)').on('click', function() {
            saveModalChanges($modal, section);
            $modal.removeClass('active');
            const prevModalKey = getPreviousModalKey(modalKey);
            if (prevModalKey) {
                openModal(prevModalKey);
            }
        });
        
        // Summary back button - goes to where we came from
        $modal.find('.modal-summary-back').on('click', function() {
            saveModalChanges($modal, section);
            $modal.removeClass('active');
            const backModal = getBackModalForSummary();
            console.log('[v6.5 Modal] Summary back clicked, going to:', backModal, '(lastModalBeforeSummary was:', lastModalBeforeSummary, ')');
            if (backModal) {
                openModal(backModal);
            } else {
                console.warn('[v6.5 Modal] No back modal found for Summary');
            }
        });
        
        // Regular next button - goes to next modal in same file
        $modal.find('.modal-next-button:not(.modal-next-to-summary)').on('click', function() {
            saveModalChanges($modal, section);
            $modal.removeClass('active');
            const nextModalKey = getNextModalKey(modalKey);
            if (nextModalKey) {
                openModal(nextModalKey);
            }
        });
        
        // Next to Summary button - goes to Summary and tracks where we came from
        $modal.find('.modal-next-to-summary').on('click', function() {
            saveModalChanges($modal, section);
            $modal.removeClass('active');
            lastModalBeforeSummary = modalKey;
            openModal('Summary');
        });
        
        // Click overlay to close
        $modal.on('click', function(e) {
            if ($(e.target).hasClass('modal-overlay')) {
                saveModalChanges($modal, section);
                $modal.removeClass('active');
            }
        });
        
        return $modal;
    }
    
    /**
     * Build measurement rows for a modal based on opt-m-table.js config
     */
    function buildMeasurementRowsForModal($tbody, modalKey) {
        if (!window.measurements || !Array.isArray(window.measurements)) return;
        
        window.measurements.forEach(group => {
            // Check if this group's modalKey matches (can be string or array)
            const groupModalKeys = Array.isArray(group.modalKey) ? group.modalKey : [group.modalKey];
            
            if (!groupModalKeys.includes(modalKey)) return;
            
            if (group.items && Array.isArray(group.items)) {
                group.items.forEach(measurementKey => {
                    const $row = buildModalMeasurementRow(measurementKey);
                    if ($row) {
                        $tbody.append($row);
                    }
                });
            }
        });
    }
    
    /**
     * Build a table row for a PARAMETER in modal (4-column layout)
     * Columns: Label | [Edit] Button | Options/Textarea | Summary Checkbox
     */
    function buildModalParameterRow(varKey, paramConfig) {
        const $row = $('<tr class="modal-param-row" data-param="' + varKey + '"></tr>');
        
        // Column 1: Label (use paramConfig.label, fall back to title, then varKey)
        const label = paramConfig.label || paramConfig.title || varKey;
        $row.append(`<td class="param-label">${label}</td>`);
        
        // Column 2: [Edit] button
        const $editCell = $('<td class="param-edit"></td>');
        
        // Show edit button for parameters with dropdown options, unless customtext is explicitly false
        const hasOptions = paramConfig.options && Array.isArray(paramConfig.options);
        const canHaveCustomText = paramConfig.customtext !== false;
        
        if (hasOptions && canHaveCustomText) {
            const $editBtn = $(`<button type="button" class="modal-edit-button" data-param="${varKey}" title="Enable custom text">✎</button>`);
            $editCell.append($editBtn);
        }
        
        $row.append($editCell);
        
        // Column 3: Options (select with optional custom textarea below)
        const $optionsCell = $('<td class="param-options"></td>');
        
        if (hasOptions) {
            // Create dropdown
            const $select = $(`<select class="modal-select" data-param="${varKey}"></select>`);
            
            paramConfig.options.forEach(opt => {
                const title = typeof opt === 'string' ? opt : opt.title;
                const optLabel = typeof opt === 'string' ? opt : (opt.label || opt.title);
                $select.append(`<option value="${title}" data-label="${optLabel}">${optLabel}</option>`);
            });
            
            $optionsCell.append($select);
            
            // Create custom textarea (initially hidden) with rows=1 for single-line initial height
            if (canHaveCustomText) {
                const $customTextarea = $(`<textarea class="modal-custom-textarea" data-param="${varKey}" rows="1" style="display: none;"></textarea>`);
                $optionsCell.append($customTextarea);
                
                // Setup auto-resize for custom textarea
                $customTextarea.on('input', function() {
                    autoResizeModalTextarea($(this));
                });
            }
        } else if (paramConfig.customtext || paramConfig.options === 'customtext') {
            // Pure custom text field (no dropdown)
            const $textarea = $(`
                <textarea class="modal-textarea" data-param="${varKey}" rows="1"
                          placeholder="${paramConfig.placeholder || ''}"></textarea>
            `);
            $optionsCell.append($textarea);
            
            // Setup auto-resize
            $textarea.on('input', function() {
                autoResizeModalTextarea($(this));
            });
        } else {
            $optionsCell.append('<span>—</span>');
        }
        
        $row.append($optionsCell);
        
        // Column 4: Summary checkbox
        const $summaryCell = $('<td class="param-summary"></td>');
        
        if (paramConfig.enableSummary) {
            const isChecked = window.getParameterChecked(varKey);
            $summaryCell.append(`
                <input type="checkbox" class="modal-summary-checkbox" data-param="${varKey}" ${isChecked ? 'checked' : ''}>
            `);
        }
        
        $row.append($summaryCell);
        
        return $row;
    }
    
    /**
     * Build a table row for a MEASUREMENT in modal (4-column layout)
     * Columns: Label | (empty) | Input + Unit | (empty)
     */
    function buildModalMeasurementRow(measurementKey) {
        const entry = window.getRegistryEntry(measurementKey);
        const parseConfigMap = window.getParseConfigMap ? window.getParseConfigMap() : {};
        const config = parseConfigMap[measurementKey] || 
                       (window.manualConfig?.find(m => m.handle === measurementKey));
        
        if (!config && !entry) return null;
        
        const label = config?.label || measurementKey;
        const unit = config?.unit || entry?.unit || '';
        const value = entry?.value || '';
        
        // Check if this is a calculated measurement
        const isCalculated = typeof window.isCalculatedMeasurement === 'function' && 
                             window.isCalculatedMeasurement(measurementKey);
        const calculatedClass = isCalculated ? ' calculated' : '';
        
        // Check if this should be full-width (extends into unit space)
        const isFullWidth = config?.full === true;
        const fullWidthClass = isFullWidth ? ' full-width' : '';
        
        const $row = $('<tr class="modal-measurement-row" data-measurement="' + measurementKey + '"></tr>');
        
        // Column 1: Label
        $row.append(`<td class="measurement-label">${label}</td>`);
        
        // Column 2: Empty (no edit button for measurements)
        $row.append(`<td class="measurement-edit"></td>`);
        
        // Column 3: Input + Unit (unit outside the input)
        const $valueCell = $('<td class="measurement-value-cell"></td>');
        const $valueWrapper = $('<div class="modal-measurement-input-wrapper"></div>');
        
        $valueWrapper.append(`
            <input type="text" class="modal-measurement-input${calculatedClass}${fullWidthClass}" data-measurement="${measurementKey}" value="${value}" ${isCalculated ? 'title="Calculated field"' : ''}>
            <span class="modal-measurement-unit">${unit}</span>
        `);
        
        $valueCell.append($valueWrapper);
        $row.append($valueCell);
        
        // Column 4: Empty (no summary checkbox for measurements)
        $row.append(`<td class="measurement-summary"></td>`);
        
        return $row;
    }
    
    /**
     * Auto-resize textarea to fit content
     * Ensures single-line textarea matches dropdown height (32px)
     * and expands by exactly one line-height for each additional line
     */
    function autoResizeModalTextarea($textarea) {
        if (!$textarea || !$textarea.length) return;
        
        const textarea = $textarea[0];
        const minHeight = 32; // Match dropdown height (--element-height)
        
        // Get computed styles for precise calculation
        const computed = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(computed.lineHeight) || 19; // fallback line-height
        const paddingTop = parseFloat(computed.paddingTop) || 0;
        const paddingBottom = parseFloat(computed.paddingBottom) || 0;
        const borderTop = parseFloat(computed.borderTopWidth) || 0;
        const borderBottom = parseFloat(computed.borderBottomWidth) || 0;
        
        // Temporarily set height to 0 to get accurate scrollHeight
        $textarea.css('height', '0');
        
        // scrollHeight gives us the content height including padding
        const scrollHeight = textarea.scrollHeight;
        
        // Calculate if we need more than one line
        const contentHeight = scrollHeight;
        
        // Use the larger of minHeight or content height
        const newHeight = Math.max(minHeight, contentHeight);
        
        $textarea.css('height', newHeight + 'px');
    }
    
    /**
     * Update modal content with current values
     */
    function updateModalContent($modal, section) {
        // Update parameters
        if (section.variables) {
            section.variables.forEach(varKey => {
                const currentValue = window.getParamValue(varKey);
                const isChecked = window.getParameterChecked(varKey);
                
                const $select = $modal.find(`.modal-select[data-param="${varKey}"]`);
                if ($select.length && currentValue) {
                    $select.val(currentValue);
                }
                
                const $textarea = $modal.find(`.modal-textarea[data-param="${varKey}"]`);
                if ($textarea.length) {
                    $textarea.val(currentValue || '');
                    autoResizeModalTextarea($textarea);
                }
                
                // Reset custom textarea state (hide it, un-grey the dropdown)
                const $customTextarea = $modal.find(`.modal-custom-textarea[data-param="${varKey}"]`);
                if ($customTextarea.length) {
                    $customTextarea.hide().val('');
                }
                if ($select.length) {
                    $select.removeClass('greyed-out');
                }
                
                const $checkbox = $modal.find(`.modal-summary-checkbox[data-param="${varKey}"]`);
                if ($checkbox.length) {
                    $checkbox.prop('checked', isChecked);
                }
            });
        }
        
        // Update measurements
        $modal.find('.modal-measurement-input').each(function() {
            const measurementKey = $(this).data('measurement');
            const entry = window.getRegistryEntry(measurementKey);
            $(this).val(entry?.value || '');
        });
        
        // Update navigation button states
        const modalKey = section.modalKey;
        const nextKey = getNextModalKey(modalKey);
        // Only disable regular next buttons, not the "Summary >" button
        $modal.find('.modal-next-button:not(.modal-next-to-summary)').prop('disabled', !nextKey);
        
        // Setup edit button handlers
        setupModalEditHandlers($modal);
        
        // Setup measurement input handlers
        setupModalMeasurementHandlers($modal);
    }
    
    /**
     * Setup [edit] button handlers for custom text in modals
     * Note: setMeasurementValue now cascades to all UI elements including main table
     */
    function setupModalEditHandlers($modal) {
        $modal.find('.modal-edit-button').off('click').on('click', function() {
            const varKey = $(this).data('param');
            const $row = $(this).closest('tr');
            const $select = $row.find(`.modal-select[data-param="${varKey}"]`);
            const $customTextarea = $row.find(`.modal-custom-textarea[data-param="${varKey}"]`);
            
            if (!$customTextarea.length) return;
            
            const isCurrentlyEnabled = $customTextarea.is(':visible');
            
            if (isCurrentlyEnabled) {
                // Disable custom textarea mode
                $customTextarea.hide();
                $select.removeClass('greyed-out');
                
                // Reset to dropdown value
                const dropdownValue = $select.val();
                window.setParamValue(varKey, dropdownValue, 'clean', false);
                window.updateSpansForHandle(varKey);
                window.updateSummary();
            } else {
                // Enable custom textarea mode
                $customTextarea.show();
                $select.addClass('greyed-out');
                
                // Pre-populate with current option's LABEL
                const selectedOption = $select.find('option:selected');
                const labelText = selectedOption.attr('data-label') || selectedOption.text();
                $customTextarea.val(labelText);
                
                // Use requestAnimationFrame to ensure CSS has applied before resizing
                requestAnimationFrame(function() {
                    // Auto-resize, focus, and select all
                    autoResizeModalTextarea($customTextarea);
                    $customTextarea.focus().select();
                });
                
                // Mark as dirty and update registry
                window.setParamValue(varKey, labelText, 'dirty', false);
                window.updateSpansForHandle(varKey);
                
                // Handle checkbox - enable if it was previously unchecked
                const paramConfig = window.parameters?.[varKey];
                if (paramConfig?.enableSummary) {
                    const $checkbox = $row.find(`.modal-summary-checkbox[data-param="${varKey}"]`);
                    if ($checkbox.length && !$checkbox.is(':checked')) {
                        $checkbox.prop('checked', true);
                        window.setParameterChecked(varKey, true);
                    }
                }
                
                window.updateSummary();
            }
        });
        
        // When dropdown changes - handles both normal and custom textarea modes
        $modal.find('.modal-select').off('change.edit').on('change.edit', function() {
            const varKey = $(this).data('param');
            const selectedValue = $(this).val();
            const selectedIndex = this.selectedIndex;
            const $row = $(this).closest('tr');
            const $customTextarea = $row.find(`.modal-custom-textarea[data-param="${varKey}"]`);
            const paramConfig = window.parameters?.[varKey];
            
            // Get the selected option object
            let selectedOpt = null;
            if (paramConfig?.options && selectedIndex >= 0) {
                selectedOpt = paramConfig.options[selectedIndex];
                if (selectedOpt && typeof selectedOpt !== 'string') {
                    window.selectedOptions[varKey] = selectedOpt;
                }
            }
            
            if ($customTextarea.length && $customTextarea.is(':visible')) {
                // Custom textarea mode: update textarea with new option's label
                const selectedOption = $(this).find('option:selected');
                const labelText = selectedOption.attr('data-label') || selectedOption.text();
                $customTextarea.val(labelText);
                
                // Auto-resize, focus, and select all
                autoResizeModalTextarea($customTextarea);
                $customTextarea.focus().select();
                
                // Update registry as dirty (custom text)
                window.setParamValue(varKey, labelText, 'dirty', false);
                window.updateSpansForHandle(varKey);
            } else {
                // Normal dropdown mode: update registry as clean
                window.setParamValue(varKey, selectedValue, 'clean', false);
                window.updateSpansForHandle(varKey);
                
                // Apply summary checkbox logic (summaryOnChange, summaryThreshold, summaryNotThreshold)
                applySummaryCheckboxLogic(varKey, selectedValue, selectedOpt);
            }
            
            window.updateSummary();
        });
        
        // Custom textarea input handler (dropdown+edit mode) - update registry in real-time
        $modal.find('.modal-custom-textarea').off('input.edit').on('input.edit', function() {
            const varKey = $(this).data('param');
            const value = $(this).val();
            
            // Update registry and mark as dirty
            window.setParamValue(varKey, value, 'dirty', false);
            window.updateSpansForHandle(varKey);
            
            // Handle summary checkbox - for custom text, check if there's content
            // and if summaryOnChange is enabled
            const paramConfig = window.parameters?.[varKey];
            if (paramConfig?.enableSummary) {
                const $row = $(this).closest('tr');
                const $checkbox = $row.find(`.modal-summary-checkbox[data-param="${varKey}"]`);
                if ($checkbox.length) {
                    const hasContent = value.trim().length > 0;
                    // For custom text with summaryOnChange, check if there's content
                    // Otherwise use the threshold/default logic
                    let shouldCheck = hasContent;
                    if (paramConfig.summaryOnChange === true) {
                        shouldCheck = hasContent;
                    } else if (paramConfig.summaryDefault === true) {
                        shouldCheck = hasContent;
                    }
                    $checkbox.prop('checked', shouldCheck);
                    window.setParameterChecked(varKey, shouldCheck);
                }
            }
            
            window.updateSummary();
        });
        
        // Pure customtext textarea input handler (.modal-textarea) - update registry and apply summaryOnChange
        $modal.find('.modal-textarea').off('input.edit').on('input.edit', function() {
            const varKey = $(this).data('param');
            const value = $(this).val();
            
            // Update registry and mark as dirty (even empty string is "dirty" if user typed)
            const status = value.trim().length > 0 ? 'dirty' : 'clean';
            window.setParamValue(varKey, value, status, false);
            window.updateSpansForHandle(varKey);
            
            // Handle summary checkbox - apply summaryOnChange logic for pure customtext fields
            const paramConfig = window.parameters?.[varKey];
            if (paramConfig?.enableSummary) {
                const $row = $(this).closest('tr');
                const $checkbox = $row.find(`.modal-summary-checkbox[data-param="${varKey}"]`);
                if ($checkbox.length) {
                    const hasContent = value.trim().length > 0;
                    
                    // For summaryOnChange: check when content exists, uncheck when empty
                    // For summaryDefault: use default state
                    let shouldCheck;
                    if (paramConfig.summaryOnChange === true) {
                        // summaryOnChange means: check if changed from default (empty)
                        shouldCheck = hasContent;
                    } else if (paramConfig.summaryDefault === true) {
                        // Keep checked if there's content
                        shouldCheck = hasContent;
                    } else {
                        // summaryDefault is false - only check if manually enabled
                        shouldCheck = $checkbox.is(':checked') && hasContent;
                    }
                    
                    $checkbox.prop('checked', shouldCheck);
                    window.setParameterChecked(varKey, shouldCheck);
                }
            }
            
            window.updateSummary();
        });
    }
    
    /**
     * Setup measurement input handlers in modals
     * Note: setMeasurementValue triggers reactive calculations automatically
     */
    function setupModalMeasurementHandlers($modal) {
        $modal.find('.modal-measurement-input').off('input change').on('input change', function() {
            const measurementKey = $(this).data('measurement');
            const value = $(this).val();
            
            // If this is a calculated field being manually edited, mark it to skip auto-calculation
            if (window.isCalculatedMeasurement && window.isCalculatedMeasurement(measurementKey)) {
                if (window.markCalculatedAsManuallyEdited) {
                    window.markCalculatedAsManuallyEdited(measurementKey);
                }
            }
            
            // Registry cascade handles updating main table and other UI elements
            // setMeasurementValue also triggers reactive calculations
            window.setMeasurementValue(measurementKey, value, 'dirty');
        });
    }
    
    /**
     * Save modal changes to registry
     */
    function saveModalChanges($modal, section) {
        const changedHandles = [];
        
        // Save parameter changes
        if (section.variables) {
            section.variables.forEach(varKey => {
                const paramConfig = window.parameters?.[varKey];
                const $customTextarea = $modal.find(`.modal-custom-textarea[data-param="${varKey}"]`);
                
                // If custom textarea is visible, use its value
                if ($customTextarea.length && $customTextarea.is(':visible')) {
                    const value = $customTextarea.val();
                    const currentValue = window.getParamValue(varKey);
                    
                    if (value !== currentValue) {
                        window.setParamValue(varKey, value, 'dirty', false);
                        changedHandles.push(varKey);
                    }
                } else {
                    // Use dropdown or standard textarea value
                    const $select = $modal.find(`.modal-select[data-param="${varKey}"]`);
                    if ($select.length) {
                        const value = $select.val();
                        const currentValue = window.getParamValue(varKey);
                        
                        if (value !== currentValue) {
                            window.setParamValue(varKey, value, 'clean', false);
                            changedHandles.push(varKey);
                            
                            if (paramConfig?.options) {
                                const selectedOpt = paramConfig.options.find(opt => 
                                    (typeof opt === 'string' ? opt : opt.title) === value
                                );
                                if (selectedOpt) {
                                    window.selectedOptions[varKey] = selectedOpt;
                                }
                            }
                            
                            const $mainSelect = $(`#${varKey}-select`);
                            if ($mainSelect.length) {
                                $mainSelect.val(value);
                            }
                        }
                    }
                    
                    const $textarea = $modal.find(`.modal-textarea[data-param="${varKey}"]`);
                    if ($textarea.length) {
                        const value = $textarea.val();
                        const currentValue = window.getParamValue(varKey);
                        
                        if (value !== currentValue) {
                            window.setParamValue(varKey, value, 'dirty', false);
                            changedHandles.push(varKey);
                            
                            const $mainTextarea = $(`#${varKey}-textarea`);
                            if ($mainTextarea.length) {
                                $mainTextarea.val(value);
                            }
                        }
                    }
                }
                
                const $checkbox = $modal.find(`.modal-summary-checkbox[data-param="${varKey}"]`);
                if ($checkbox.length) {
                    const isChecked = $checkbox.is(':checked');
                    // Registry cascade handles updating main form checkbox
                    window.setParameterChecked(varKey, isChecked);
                    }
            });
        }
        
        // Save measurement changes
        $modal.find('.modal-measurement-input').each(function() {
            const measurementKey = $(this).data('measurement');
            const value = $(this).val();
            const entry = window.getRegistryEntry(measurementKey);
            
            if (entry && value !== entry.value) {
                window.setMeasurementValue(measurementKey, value, 'dirty');
                changedHandles.push(measurementKey);
            }
        });
        
        if (changedHandles.length > 0) {
            window.updateChangedParameters(changedHandles);
        }
        
        window.updateSummary();
    }
    
    // ============================================================================
    // GLOBAL EXPORTS
    // ============================================================================
    
    window.buildForm = buildForm;
    window.setupContentEditableHandlers = setupContentEditableHandlers;
    window.openModal = openModal;
    window.openModalByKey = openModal;
    
    // Summary checkbox evaluation helpers
    window.evaluateSummaryCheckboxState = evaluateSummaryCheckboxState;
    window.applySummaryCheckboxLogic = applySummaryCheckboxLogic;
    window.handleSummaryExclude = handleSummaryExclude;
    window.handleSummaryRestore = handleSummaryRestore;
    
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    setTimeout(function() {
        if (typeof window.initializeReportForm === 'function') {
            window.initializeReportForm();
        }
    }, 100);
    
});
