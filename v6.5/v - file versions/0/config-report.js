const reportConfigs = [
    {
        id: "default",
        name: "Normal BHI TTE",
        manual: "opt-m-manual.js",
        measurements: "opt-m-table.js",
        parameters: "opt-r-parameters.js",
        options: "opt-r-modals.js",
        report: "opt-r-template.js",
        default: true,
    },
    {
        id: "stress",
        name: "Stress",
        manual: "config-stress/opt-m-stress-manual.js",
        measurements: "config-stress/opt-m-stress-table.js",
        parameters: "config-stress/opt-r-stress-parameters.js",
        options: "config-stress/opt-r-stress-modals.js",
        report: "config-stress/opt-r-stress-template.js",
    },
];