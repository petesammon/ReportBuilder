# Complete Attribute Comparison: v4.13 vs v5.0

## ✅ FULLY IMPLEMENTED IN v5.0

### Section Attributes (opt-form.js)

| Attribute | v4.13 | v5.0 | Status | Implementation |
|-----------|-------|------|--------|----------------|
| `title` / `sectionTitle` | Section title on modal | Section title on modal | ✅ WORKING | Same functionality, attribute renamed to `sectionTitle` |
| `sectionPreviewKey` | Matches section titles on report page | Links buttons to parameters | ✅ WORKING | Used for button positioning and measurements auto-scroll |

### Parameter Attributes (opt-options.js)

| Attribute | v4.13 Purpose | v5.0 Status | Implementation |
|-----------|---------------|-------------|----------------|
| `title` | Parameter label on modal | ✅ WORKING | `createParameterRow()` line 284 |
| `options` (array) | Dropdown options | ✅ WORKING | `createParameterRow()` line 301-325 |
| `options: "customtext"` | Textarea input | ✅ WORKING | `createParameterRow()` line 290-299 with `textareaSize` support |
| `enableSummary` | Enables summary checkbox | ✅ WORKING | `createParameterRow()` line 332, `generateSummary()` line 259 |
| `summaryDefault` | Add to summary by default | ✅ WORKING | `generateSummary()` line 268, `createParameterRow()` line 344 |
| `summaryOnChange` | Auto-add when changed from default | ✅ WORKING | `generateSummary()` line 273, `createParameterRow()` line 369-385 |
| `summaryThreshold` | Options that DO trigger auto-add | ✅ WORKING | `generateSummary()` line 289-300 |
| `summaryAlwaysInclude` | Include without checkbox | ✅ WORKING | `generateSummary()` line 261, `createParameterRow()` line 338-340 |
| `summaryExclude` | Exclude from summary when activated | ✅ WORKING | `generateSummary()` line 356-363 |
| `summaryOrder` | Summary line ordering | ✅ WORKING | `generateSummary()` line 345, 369-370 |
| `textareaSize` | Size of textarea in modal | ✅ WORKING | `createParameterRow()` line 293 |

### Individual Option Attributes (opt-options.js)

| Attribute | v4.13 Purpose | v5.0 Status | Implementation |
|-----------|---------------|-------------|----------------|
| `default: true` | Default option in dropdown | ✅ WORKING | `createParameterRow()` line 311-312 |
| `summarytext` | Different statement for summary | ✅ WORKING | `generateSummary()` line 322-334 (checks option-level first) |
| `label` | Display label for option | ✅ WORKING | `createParameterRow()` line 307 |
| `title` | Value for option | ✅ WORKING | `createParameterRow()` line 306 |

### Template Attributes (opt-report.js / Handlebars)

| Attribute | v4.13 Purpose | v5.0 Equivalent | Status |
|-----------|---------------|-----------------|--------|
| `{{params}}` | Single-line parameters | `{{p 'params'}}` | ✅ WORKING |
| `{{{params}}}` | Multi-line with special chars | `{{p 'params'}}` | ✅ WORKING |

**Note:** v5.0 `{{p}}` helper automatically handles both single and multi-line content, escaping is handled via `SafeString`

---

## ❌ NOT IMPLEMENTED IN v5.0

### Section Attributes

#### 1. `enableSectionPreview`
**v4.13 Purpose:** Activates section textarea on form  
**v5.0 Status:** ❌ REMOVED (Architectural Change)  
**Reason:** v5.0 uses single contenteditable output instead of separate section textareas  
**Migration:** Not applicable - fundamental architecture change

#### 2. `defaultExcluded`
**v4.13 Purpose:** Section loads onto form but is hidden/excluded by default  
**v5.0 Status:** ❌ MISSING - NEEDS IMPLEMENTATION  
**Impact:** HIGH - Used for optional sections like "Pericardial Effusion"  

**v4.13 Usage Example:**
```javascript
{
    sectionPreviewKey: "sectPeff",
    sectionTitle: "Pericardial Effusion",
    defaultExcluded: true,  // Section excluded by default
    parameters: ["pEffSize", "pEffOther"]
}
```

**Implementation Required:**
1. Add `defaultExcluded` attribute to opt-form.js sections
2. Initialize all parameters in section as `excluded: true` in `initializeParametersFromOptions()`
3. Render Exclude button as "+" (include) instead of "−" (exclude) initially
4. Button handler should toggle from excluded → included on first click

**Files to Modify:**
- `script-report.js` - `initializeParametersFromOptions()` line 219
- `script-form.js` - `renderButtons()` line 145-162

---

#### 3. `defaultHidden`
**v4.13 Purpose:** Section completely hidden until triggered by dropdown selection  
**v5.0 Status:** ❌ MISSING - NEEDS IMPLEMENTATION  
**Impact:** HIGH - Used for conditional sections  

**v4.13 Usage Example:**
```javascript
// In opt-form.js:
{
    sectionPreviewKey: "sectPeff",
    sectionTitle: "Pericardial Effusion",
    defaultHidden: true,  // Section hidden until triggered
    parameters: ["pEffSize", "pEffOther"]
}

// In opt-options.js:
{
    parameter: "pEffusion",
    options: [
        { label: "No effusion", title: "No pericardial effusion.", default: true },
        { 
            label: "Effusion present", 
            title: "Pericardial effusion present.", 
            triggerSection: "sectPeff"  // Shows the hidden section
        }
    ]
}
```

**Implementation Required:**
1. Add `defaultHidden` attribute to opt-form.js sections
2. Track hidden sections in `window.hiddenSections = {}`
3. Don't render buttons for hidden sections initially
4. When dropdown option with `triggerSection` selected:
   - Set `hiddenSections[sectionKey] = false`
   - Call `renderButtons()` to show the section's buttons
   - Initialize section parameters (if not already initialized)
5. When triggering option deselected:
   - Set `hiddenSections[sectionKey] = true`
   - Call `renderButtons()` to hide the section's buttons
   - Set all section parameters as `excluded: true`

**Files to Modify:**
- `script-report.js` - `initializeParametersFromOptions()` line 219
- `script-form.js` - `renderButtons()` line 74, `saveModalChanges()` line 455
- Need new function to handle `triggerSection` logic

---

### Parameter Attributes

#### 4. `summaryNotThreshold`
**v4.13 Purpose:** Specify options that DO NOT trigger auto-add to summary  
**v5.0 Status:** ❌ MISSING - NEEDS IMPLEMENTATION  
**Impact:** MEDIUM - Useful for fine-grained summary control  

**v4.13 Usage Example:**
```javascript
{
    parameter: "pAV",
    title: "Aortic Valve",
    enableSummary: true,
    summaryOnChange: true,
    summaryNotThreshold: ["Normal", "Thin and mobile"], // Don't auto-add these
    options: [
        { label: "Normal", title: "Normal aortic valve.", default: true },
        { label: "Thin and mobile", title: "Aortic valve thin and mobile." },
        { label: "Thickened", title: "Thickened aortic valve." },
        { label: "Stenotic", title: "Aortic stenosis." }
    ]
}
```

**Behavior:**
- If `summaryOnChange` is true AND `summaryNotThreshold` exists:
  - Checkbox auto-ticks for all options EXCEPT those in `summaryNotThreshold`
  - "Normal" and "Thin and mobile" → checkbox stays unchecked
  - "Thickened" and "Stenotic" → checkbox auto-ticks

**Implementation Required:**
1. Add check in `generateSummary()` function after `summaryOnChange` logic
2. Check if current option label is in `summaryNotThreshold` array
3. If yes, set `includeInSummary = false`

**Code Addition (script-report.js, line ~287):**
```javascript
// After summaryOnChange check, add:
else if (paramConfig.summaryOnChange && paramConfig.summaryNotThreshold) {
    if (Array.isArray(paramConfig.options)) {
        const currentOption = paramConfig.options.find(opt => 
            (opt.title || opt.label) === param.value
        );
        const currentLabel = currentOption ? currentOption.label : '';
        
        // Include ONLY if not in summaryNotThreshold
        if (!paramConfig.summaryNotThreshold.includes(currentLabel)) {
            includeInSummary = true;
        }
    }
}
```

**Also update `createParameterRow()` checkbox logic (script-form.js, line ~347):**
```javascript
} else if (paramConfig.summaryOnChange) {
    const defaultOption = Array.isArray(paramConfig.options) 
        ? paramConfig.options.find(opt => opt.default === true)
        : null;
    const defaultValue = defaultOption ? (defaultOption.title || defaultOption.label) : '';
    const currentValue = param ? param.value : '';
    
    // NEW: Check summaryNotThreshold
    if (paramConfig.summaryNotThreshold && Array.isArray(paramConfig.summaryNotThreshold)) {
        const currentOption = paramConfig.options.find(opt => 
            (opt.title || opt.label) === currentValue
        );
        const currentLabel = currentOption ? currentOption.label : '';
        
        summaryChecked = currentValue && currentValue !== defaultValue 
            && !paramConfig.summaryNotThreshold.includes(currentLabel);
    } else {
        summaryChecked = currentValue && currentValue !== defaultValue;
    }
}
```

**Files to Modify:**
- `script-report.js` - `generateSummary()` line ~287
- `script-form.js` - `createParameterRow()` line ~347

---

#### 5. `customText: false`
**v4.13 Purpose:** Hide edit button in modal  
**v5.0 Status:** ❌ REMOVED (Architectural Change)  
**Reason:** v5.0 has no edit buttons inside modals - all editing happens in contenteditable output  
**Migration:** Not applicable - v5.0 modals only have input fields

---

### Individual Option Attributes

#### 6. `triggerSection`
**v4.13 Purpose:** Triggers visibility of `defaultHidden` section  
**v5.0 Status:** ❌ MISSING - NEEDS IMPLEMENTATION  
**Impact:** HIGH - Required for conditional section visibility  
**Dependencies:** Requires `defaultHidden` implementation (see #3 above)

**Implementation Required:**
See `defaultHidden` implementation above - they work together.

---

## 🔄 CHANGED IN v5.0 (Different Implementation)

### Summary System

**v4.13 Approach:**
- Summary modal with checkboxes for all parameters
- Manual checkbox toggling in Summary modal
- Auto-generation based on checkbox states

**v5.0 Approach:**
- Summary auto-generated from parameter config attributes
- Checkbox state saved in `parameterData[param].summaryIncluded`
- Checkboxes visible in each section's modal (not separate Summary modal)
- Summary updates automatically on parameter changes

**Key Differences:**
1. ✅ **Better:** No need for separate Summary modal
2. ✅ **Better:** Summary checkboxes co-located with parameters
3. ❌ **Missing:** No dedicated UI to view/edit all summary items at once
4. ❌ **Missing:** Harder to see overall summary composition

**Recommendation:** Consider adding optional Summary modal in future for power users who want to review all summary items together.

---

## 📊 IMPLEMENTATION PRIORITY

### 🔴 **Critical (Must Have for Feature Parity)**

1. **`defaultExcluded`** - Essential for optional sections
   - Effort: LOW (2-3 hours)
   - Files: 2 (script-report.js, script-form.js)
   - Complexity: Low - simple initialization + button state

2. **`defaultHidden` + `triggerSection`** - Essential for conditional sections
   - Effort: MEDIUM (4-6 hours)
   - Files: 2-3 (script-report.js, script-form.js, possibly new trigger handler)
   - Complexity: Medium - requires tracking hidden state + trigger logic

3. **`summaryNotThreshold`** - Important for precise summary control
   - Effort: LOW (1-2 hours)
   - Files: 2 (script-report.js, script-form.js)
   - Complexity: Low - inverse logic of `summaryThreshold`

### 🟡 **Nice to Have (Quality of Life)**

4. **Summary editing modal** - For reviewing all summary items
   - Effort: MEDIUM (3-4 hours)
   - Files: 1 (script-form.js)
   - Complexity: Medium - new modal + checkbox state sync

5. **Triple bracket support verification** - Ensure {{{params}}} works
   - Effort: LOW (30 min)
   - Files: 0 (just testing)
   - Complexity: Low - likely already working via SafeString

### ✅ **Already Complete**

- All other attributes from help-attributes.txt ✅

---

## 🎯 RECOMMENDED ACTION PLAN

### Option A: Add Missing Critical Features First (Recommended)
1. Implement `summaryNotThreshold` (1-2 hours) ✅ Quick win
2. Implement `defaultExcluded` (2-3 hours) ✅ Medium priority
3. Implement `defaultHidden` + `triggerSection` (4-6 hours) ✅ High complexity
4. Test all three together (1-2 hours)
5. **Total: ~8-13 hours**

### Option B: Prioritize by User Need
Let user decide which features are most critical for their workflow:
- If they use conditional sections heavily → Start with `defaultHidden` + `triggerSection`
- If they use optional sections → Start with `defaultExcluded`
- If they need precise summary control → Start with `summaryNotThreshold`

---

## 📝 MIGRATION NOTES

### For Users Migrating from v4.13:

1. **Remove `enableSectionPreview`** - No longer needed
   ```javascript
   // v4.13
   enableSectionPreview: true,  // ❌ Remove this
   
   // v5.0 - Just use sectionPreviewKey
   sectionPreviewKey: "sectStudy",  // ✅ This is enough
   ```

2. **Remove `customText: false`** - No longer applicable
   ```javascript
   // v4.13
   customText: false,  // ❌ Remove this
   
   // v5.0 - No need, modals don't have edit buttons
   ```

3. **Rename `title` to `sectionTitle`** in opt-form.js
   ```javascript
   // v4.13
   title: "Study Details",  // ❌ Old
   
   // v5.0
   sectionTitle: "Study Details",  // ✅ New
   ```

4. **Move `params` to `parameters`** in opt-form.js
   ```javascript
   // v4.13
   params: {
       pQuality: {...},
       pStudyDate: {...}
   }
   
   // v5.0
   parameters: ["pQuality", "pStudyDate"]
   ```

5. **Change template syntax** from `{{param}}` to `{{p 'param'}}`
   ```javascript
   // v4.13
   {{pQuality}}
   {{{pComments}}}
   
   // v5.0
   {{p 'pQuality'}}
   {{p 'pComments'}}
   ```

---

## ✅ SUMMARY

### What Works in v5.0:
- ✅ All summary attributes (except `summaryNotThreshold`)
- ✅ Dropdown options and defaults
- ✅ Custom textarea inputs with `textareaSize`
- ✅ Summary checkboxes and auto-add logic
- ✅ Summary ordering and exclusion
- ✅ Template parameter rendering

### What's Missing:
- ❌ `defaultExcluded` (optional sections)
- ❌ `defaultHidden` + `triggerSection` (conditional sections)
- ❌ `summaryNotThreshold` (inverse threshold logic)

### What Changed:
- 🔄 No section textareas (replaced with single contenteditable)
- 🔄 No edit buttons in modals (edit directly in output)
- 🔄 No separate Summary modal (checkboxes in section modals)

**Estimated effort to achieve full v4.13 feature parity: 8-13 hours**