
// Contains the config for parsing the report into variables
const parseUKDate = (dateString) => {
    const splitDate = dateString.split('/');
    return new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
};

const calculations = {
    Age: (metrics) => {
        if (!metrics.DOB) return "N/A";

        const ageDifMs = Date.now() - parseUKDate(metrics.DOB).getTime();
        const ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    },
    HeightRounded: (metrics) => {
        return metrics.Height ? Math.round(metrics.Height)/100 : "N/A";
    },
    WeightRounded: (metrics) => {
        return metrics.Weight ? Math.round(metrics.Weight) : "N/A";
    }
};

// Contains the options for the dropdowns
const options = [
    {
        title: "Study details",
        params: {
            Machine: {
                title: "Performed on:",
                custom: true,
                options: [
                    {
                        label: "GE Pioneer",
                        title: "GE Pioneer",
                    },
                    {
                        label: "GE 95",
                        title: "GE E95",
                        default: true,
                    },
                    {
                        label: "GE S70",
                        title: "GE S70",
                    },
                    {
                        label: "GE iQ",
                        title: "GE iQ",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            Operator: {
                title: "Performed by:",
                custom: true, 
            },
            TechnicalQualilty: {
                title: "Technical quality:",
                custom: true,
                options: [
                    {
                        label: "Good",
                        title: "Good",
                    },
                    {
                        label: "Fair",
                        title: "Fair",
                        default: true,
                    },
                    {
                        label: "Poor",
                        title: "Poor -",
                    },
                    {
                        label: "Very poor",
                        title: "Very poor -",
                    },
                ],
            },
            Rhythm: {
                title: "Rhythm",
                custom: true, 
                options: [
                    {
                        label: "Sinus rhythm",
                        title: "Sinus rhythm",
                        default: true,
                    },
                    {
                        label: "AF",
                        title: "Atrial fibrillation"
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            Rate: {
                title: "Rate",
                custom: true, 
                default: "bpm",
            },
            BP: {
                title: "BP",
                custom: true, 
                default: "mmHg",
            },
        },
    },
    {
        title: "Left Ventricle",
        params: {
            LVSF: {
                title: "",
                custom: true,
                options: [
                    {
                        "label": "Normal systolic function",
                        "title": "Normal left ventricular systolic function",
                        default: true,
                    },
                    {
                        "label": "Mildly impaired systolic function",
                        "title": "Mildly impaired left ventricular systolic function",
                    },
                    {
                        "label": "Moderately impaired systolic function",
                        "title": "Moderately impaired left ventricular systolic function",
                    },
                    {
                        "label": "Severely impaired systolic function",
                        "title": "Severely impaired left ventricular systolic function",
                    },
                    {
                        "label": "Impaired systolic function",
                        "title": "Impaired left ventricular systolic function",
                    },
                    {
                        "label": "(free text)",
                        "title": "",
                    },
                ],
                enableSummary: true,
                summaryDefault: true,
            },
            LVH: {
                title: "",
                custom: true,
                options: [
                    {
                        "label": "No hypertrophy",
                        "title": "No left ventricular hypertrophy",
                        default: true,
                    },
                    {
                        "label": "Concentric hypertrophy",
                        "title": "Concentric hypertrophy",
                    },
                    {
                        "label": "Concentric remodelling",
                        "title": "Concentric remodelling",
                    },
                    {
                        "label": "Eccentric hypertrophy",
                        "title": "Eccentric hypertrophy",
                    },
                    {
                        "label": "(free text)",
                        "title": "",
                    },
                ],
                enableSummary: true,
                summaryDefault: true,
            },
            LVD: {
                title: "",
                custom: true,
                options: [
                    {
                        "label": "No dilatation",
                        "title": "No left ventricular dilatation",
                        default: true,
                    },
                    {
                        "label": "Mild dilatation",
                        "title": "Mild left ventricular dilatation",
                    },
                    {
                        "label": "Moderate dilatation",
                        "title": "Moderate left ventricular dilatation",
                    },
                    {
                        "label": "Severe dilatation",
                        "title": "Severe left ventricular dilatation",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: true,
            },
            Diastology: {
                title: "",
                custom: true,
                options: [
                    {
                        "label": "Normal diastolic function",
                        "title": "Normal diastolic function",
                        default: true,
                    },
                    {
                        "label": "Impaired diastolic function",
                        "title": "Impaired diastolic function",
                    },
                    {
                        "label": "Indeterminate diastolic function",
                        "title": "Indeterminate diastolic function",
                    },
                    {
                        "label": "(free text)",
                        "title": "",
                    },
                ],
                enableSummary: true,
                summaryDefault: true,
            },
            LAP: {
                title: "",
                custom: true,
                options: [
                    {
                        "label": "(filling pressure)",
                        "title": ".",
                        default: true,
                    },
                    {
                        "label": "Normal filling pressure",
                        "title": ", normal filling pressure.",
                    },
                    {
                        "label": "Indeterminate filling pressure",
                        "title": ", indeterminate filling pressure.",
                    },
                    {
                        "label": "Elevated filling pressure",
                        "title": ", elevated filling pressure.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
        },
    },
    {
        title: "Mitral Valve",
        params: {
            MV: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal leaflets",
                        title: "Thin and mobile leaflets, opens well.",
                        default: true,
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            MS: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No stenosis",
                        title: "No mitral stenosis.",
                        default: true,
                    },
                    {
                        label: "Mild stenosis",
                        title: "Mild mitral stenosis.",
                    },
                    {
                        label: "Moderate stenosis",
                        title: "Moderate mitral stenosis.",
                    },
                    {
                        label: "Severe stenosis",
                        title: "Severe mitral stenosis.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
            MR: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Trivial regurgitation",
                        title: "Trivial mitral regurgitation.",
                        default: true,
                    },
                    {
                        label: "Mild regurgitation",
                        title: "Mild mitral regurgitation.",
                    },
                    {
                        label: "Moderate regurgitation",
                        title: "Moderate mitral regurgitation.",
                    },
                    {
                        label: "Severe regurgitation",
                        title: "Severe mitral regurgitation.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
        },
    },
    {
        title: "Aortic Valve",
        params: {
            AV: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Trileaflet, normal",
                        title: "Trileaflet, thin and mobile cusps, opens well.",
                        default: true,
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            AS: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No stenosis",
                        title: "No aortic stenosis.",
                        default: true,
                    },
                    {
                        label: "Mild stenosis",
                        title: "Mild aortic stenosis.",
                    },
                    {
                        label: "Moderate stenosis",
                        title: "Moderate aortic stenosis.",
                    },
                    {
                        label: "Severe stenosis",
                        title: "Severe aortic stenosis.",
                    },
                    {
                        label: "Very severe stenosis",
                        title: "very severe aortic stenosis.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
            AR: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No regurgitation",
                        title: "No aortic regurgitation.",
                        default: true,
                    },
                    {
                        label: "Trivial regurgitation",
                        title: "Trivial aortic regurgitation.",
                    },
                    {
                        label: "Mild regurgitation",
                        title: "Mild aortic regurgitation.",
                    },
                    {
                        label: "Moderate regurgitation",
                        title: "Moderate aortic regurgitation.",
                    },
                    {
                        label: "Severe regurgitation",
                        title: "Severe aortic regurgitation.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
        },
    },
    {
        title: "Right Ventricle",
        params: {
            RVFl: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal longitudinal function",
                        title: "Normal longitudinal function.",
                        default: true,
                    },
                    {
                        label: "Impaired longitudinal function",
                        title: "Impaired longitudinal function.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: true,
            },
            RVFr: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal radial function",
                        title: "Normal radial function.",
                        default: true,
                    },
                    {
                        label: "Impaired radial function",
                        title: "Impaired radial function.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: true,
            },
            RVH: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No hypertrophy",
                        title: "No right ventricular hypertrophy.",
                        default: true,
                    },
                    {
                        label: "Hypertrophied",
                        title: "Right ventricular hypertrophy.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
            RVD: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No dilatation",
                        title: "No right ventricular dilatation.",
                        default: true,
                    },
                    {
                        label: "Dilated",
                        title: "Dilated right ventricle.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: true,
            },
        },
    },
    {
        title: "Tricuspid Valve",
        params: {
            TV: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal leaflets",
                        title: "Thin and mobile leaflets, opens well.",
                        default: true,
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            TS: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No stenosis",
                        title: "No tricuspid stenosis.",
                        default: true,
                    },
                    {
                        label: "Mild stenosis",
                        title: "Mild tricuspid stenosis.",
                    },
                    {
                        label: "Moderate stenosis",
                        title: "Moderate tricuspid stenosis.",
                    },
                    {
                        label: "Severe stenosis",
                        title: "Severe tricuspid stenosis.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
            TR: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Trivial regurgitation",
                        title: "Trivial tricuspid regurgitation.",
                        default: true,
                    },
                    {
                        label: "Mild regurgitation",
                        title: "Mild tricuspid regurgitation.",
                    },
                    {
                        label: "Moderate regurgitation",
                        title: "Moderate tricuspid regurgitation.",
                    },
                    {
                        label: "Severe regurgitation",
                        title: "Severe tricuspid regurgitation.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
        },
    },
    {
        title: "Pulmonary Valve",
        params: {
            PV: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal leaflets",
                        title: "Thin and mobile cusps where seen.",
                        default: true,
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            PS: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No stenosis",
                        title: "No pulmonary stenosis.",
                        default: true,
                    },
                    {
                        label: "Mild stenosis",
                        title: "Mild pulmonary stenosis.",
                    },
                    {
                        label: "Moderate stenosis",
                        title: "Moderate pulmonary stenosis.",
                    },
                    {
                        label: "Severe stenosis",
                        title: "Severe pulmonary stenosis.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
            PR: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Trivial regurgitation",
                        title: "Trivial pulmonary regurgitation.",
                        default: true,
                    },
                    {
                        label: "Mild regurgitation",
                        title: "Mild pulmonary regurgitation.",
                    },
                    {
                        label: "Moderate regurgitation",
                        title: "Moderate pulmonary regurgitation.",
                    },
                    {
                        label: "Severe regurgitation",
                        title: "Severe pulmonary regurgitation.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
            PVN: {
                title: "",
                options: [
                    {
                        label: "No systolic notch",
                        title: "No systolic notch.",
                        default: true,
                    },
                    {
                        label: "Systolic notch demonstrated",
                        title: "Systolic notch demonstrated.",
                    },
                ],
            },
        },
    },
    {
        title: "Atria",
        params: {
            Atria: {
                title: "",
                custom: true, 
                options: [
                    {
                        label: "Not dilated",
                        title: "Not dilated.",
                        default: true,
                    },
                    {
                        label: "Borderline dilated LA",
                        title: "Borderline dilated LA, non-dilated RA.",
                    },
                    {
                        label: "Dilated LA",
                        title: "Dilated LA, non-dilated RA.",
                    },
                    {
                        label: "Dilated RA",
                        title: "Dilated RA, non-dilated LA.",
                    },
                    {
                        label: "Dilated",
                        title: "Dilated atria.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
        },
    },
    {
        title: "Aorta",
        params: {
            Aorta: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal dimensions",
                        title: "The aortic root, proximal ascending aorta and aortic arch are not dilated.",
                        default: true,
                    },
                    {
                        label: "Dilated root and ascending",
                        title: "Dilated aortic root and proximal ascending aorta.",
                    },
                    {
                        label: "Dilated root only",
                        title: "Dilated aortic root.\nThe proximal ascending aorta is not dilated.",
                    },
                    {
                        label: "Dilated ascending aorta only",
                        title: "Dilated proximal ascending aorta.\nThe aortic root is not dilated.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
            DescAo: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No coarctation",
                        title: "No coarctation.",
                        default: true,
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
        },
    },
    {
        title: "Miscellaneous",
        params: {
            IVCD: {
                title: "IVC Size",
                custom: true,
                options: [
                    {
                        label: "Not dilated",
                        title: "not dilated",
                        default: true,                        
                    },
                    {
                        label: "Dilated",
                        title: "dilated",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            IVCC: {
                title: "IVC Collapse",
                options: [
                    {
                        label: "Normal",
                        title: "> 50%",
                        default: true,
                    },
                    {
                        label: "No collapse",
                        title: "< 50%",
                    },
                ],
            },
            RAP: {
                title: "RA Pressure",
                options: [
                    {
                        label: "0-5mmHg",
                        title: "0-5",
                        default: true,
                    },
                    {
                        label: "5-15mmHg",
                        title: "5-15",
                    },
                    {
                        label: ">15mmHg",
                        title: ">15",
                    },
                ],
            },
            PPHT: {
                title: "Probability of PHT",
                custom: true,
                options: [
                    {
                        label: "Low",
                        title: "Low",
                        default: true,
                    },
                    {
                        label: "Intermediate",
                        title: "Intermediate",
                    },
                    {
                        label: "High",
                        title: "High",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
            PASP: {
                title: "PASP =",
                custom: true,
                options: [
                    {
                        label: "(free text)",
                        title: "",
                        default: true,
                    },
                    {
                        label: "not estimated in the absence of TR Vmax.",
                        title: "not estimated in the absence of TR Vmax.",
                    },
                ]
            },
            ASD: {
                title: "Atrial Septal Defect",
                custom: true,
                options: [
                    {
                        label: "No obvious ASD",
                        title: "No obvious atrial septal defect imaged on CFM.",
                        default: true,
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
            PEff: {
                title: "Pericardial Effusion",
                custom: true,
                options: [
                    {
                        label: "No pericardial effusion",
                        title: "No pericardial effusion.",
                        default: true,
                    },
                    {
                        label: "Trivial pericardial effusion",
                        title: "Trivial pericardial effusion.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
        },
    },
    {
        title: "Summary",
        params: {
            Summary: {
                title: "",
                custom: true,
                large: true,
                default: "No significant valvular abnormalities",
            },
        },
    },
];

// Register a helper to round to 2dp with trailing 0s
// i.e 1.7 -> 1.70
Handlebars.registerHelper('2dp', function (num) {
    return num && typeof num === 'number' ? num.toFixed(2) : "N/A";
});

// The template for the output
const outputTemplate = Handlebars.compile(
`Performed on: {{Machine}} - Performed by: {{Operator}}
Technical Quality: {{TechnicalQualilty}} - ECG: {{Rhythm}}, {{Rate}} - BP: {{BP}}

Left Ventricle:
{{LVSF}}.
- {{LVH}}. {{LVD}}.
- {{Diastology}}{{LAP}}
Mitral Valve:
- {{MV}} {{MS}} {{MR}}
Aortic Valve:
- {{AV}} {{AS}} {{AR}}
Right Ventricle:
- {{RVFl}} {{RVFr}}
- {{RVD}} {{RVH}}
Tricuspid Valve:
- {{TV}} {{TS}} {{TR}}
Pulmonary Valve:
- {{PV}} {{PS}} {{PR}}
Atria:
- {{Atria}}
Aorta:
- {{Aorta}} {{DescAo}}
Miscellaneous:
- IVC is {{IVCD}} with {{IVCC}} collapse on inspiration estimating RA pressure at {{RAP}}mmHg. 
- {{PPHT}} echocardiographic probability for pulmonary hypertension. ePASP = {{PASP}}
- {{ASD}}
- {{PEff}}

Summary:
{{Summary}}

`, {noEscape: true});

jQuery(document).ready(function () {
    $("section").hide();
    $("#options").show();
    
    const metrics = {};

    function updateSummary() {
    const summaryParts = [];
    
    for (const section of options) {
        for (const key in section.params) {
            const option = section.params[key];
            if (option.enableSummary) {
                const checkbox = $(`#${key}-summary`);
                if (checkbox.length && checkbox.is(':checked')) {
                    // Get the current value from metrics
                    if (metrics[key] && metrics[key].trim()) {
                        summaryParts.push(metrics[key]);
                    }
                }
            }
        }
    }
    
    // Update the Summary textarea
    const summaryTextarea = $('#Summary textarea');
    if (summaryTextarea.length) {
        summaryTextarea.val(summaryParts.join('\n'));
        summaryTextarea.trigger('change');
    }
}
    
    for (const k in options) {
        $("#options > div").append(`
    <h3>${options[k].title}</h3>
    <h4><span></span><span>Summary</span></h4>
`);

        for (const key in options[k].params) {
            const option = options[k].params[key];
            const $option = $(`<div id="${key}">
    <div>
        <label for="${key}">${option.title ?? key}</label>
        ` + (option.options ? `
        <select>
            <option selected disabled value="" >Select...</option>
            ` + option.options.map(option => `<option ${option.default ? 'selected="selected"' : ''} title="${option.title}" value="${key}-${option.label.toLowerCase().replace(" ", "-")}">${option.label}</option>`).join("") + `
        </select>
        ` : '') + `
        ${option.custom ? `<textarea class="${option.large ? 'large' : ''}"></textarea>` : ''}
    </div>
    ` + (option.enableSummary ? `
    <div class="summary-checkbox-container">
        <input type="checkbox" id="${key}-summary" ${option.summaryDefault ? 'checked' : ''} />
    </div>
    ` : '') + `
</div>`);

            $("#options > div").append($option);

            $("textarea", $option).on("paste", (e) => {
                let paste = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
                paste = paste.replace(/\n/g, ", ").trim();

                // Insert the modified text into the textarea
                let textarea = e.target;
                let currentText = textarea.value;
                let selectionStart = textarea.selectionStart;
                let selectionEnd = textarea.selectionEnd;

                const newText = currentText.slice(0, selectionStart) + paste + currentText.slice(selectionEnd);

                $(e.currentTarget).val(newText);
                $(e.currentTarget).trigger("change");
                return false;
            });

            const df = option.options ? option.options.find(option => option.default) : '';
            if (df) {
                metrics[key] = df.title;
                $(".output", $option).html(df.title);
            }
            
            if (!option.options && option.default) {
                metrics[key] = option.default;
                $("textarea", $option).val(option.default);
}

            $("select, textarea", $option).on("change", function () {
    const vals = [];

    const selected = $("select", $option).find(":selected").attr("title");
    if (selected) {
        vals.push(selected);
        $(".output", $option).html(selected);
    }

    if (option.custom) {
        const ta = $("textarea", $option).val();
        if (ta) {
            vals.push(ta);
        }
    }

    metrics[key] = vals.join(" ");
    updateSummary();
});

if (option.enableSummary) {
    $(`#${key}-summary`, $option).on('change', function() {
        updateSummary();
    });
}
        }
        
        $("#options > div").append(`<hr />`);
    }
        
    updateSummary();
    
    $("#generate").on("click", function () {
        $("#options").hide();
        $("#output").show();

        $("#back").prop("disabled", false).on("click", function () {
            $("#output").hide();
            $("#options").show();
        });
        
        $("#copy").prop("disabled", false).on("click", function () {
            const text = $("#output textarea").val();
            navigator.clipboard.writeText(text);

            $("#copy").html("Copied!");
            setTimeout(() => {
                $("#copy").html("Copy to clipboard");
            }, 1000);
        });

        const output = {
            ...metrics,
        };

        $("#output textarea").val(outputTemplate(output));
    });
});