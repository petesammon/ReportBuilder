const reportConfigs = [
    {
        id: "default",
        name: "Normal BHI TTE",
        manual: "opt-default-manual.js",
        measurements: "opt-default-measures.js",
        options: "opt-default-form.js",
        report: "opt-default-report.js",
        default: true,
    },
    {
        id: "stress",
        name: "Stress",
        manual: "opt-stress-manual.js",
        measurements: "opt-stress-measures.js",
        options: "opt-stress-form.js",
        report: "opt-stress-report.js",
    },
    {
        id: "peff",
        name: "Pericardial Effusion",
        manual: "opt-default-manual.js",
        measurements: "opt-peff-measures.js",
        options: "opt-peff-form.js",
        report: "opt-peff-report.js",
    },
];