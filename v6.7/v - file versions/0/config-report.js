const reportConfigs = [
    {
        id: "default",
        name: "Normal BHI TTE",
        manual: "opt-m-manual.js",
        measurements: "opt-m-table.js",
        parameters: "opt-r-parameters.js",
        options: ["opt-r-modals.js", "opt-r-modals-2.js"],  // Now an array - can add more files
        report: "opt-r-template.js",
        algorithms: ["opt-a-diastology.js", "opt-a-lvh.js"],
        default: true,
    },
    {
        id: "defaultpeff",
        name: "Normal BHI + PEff",
        manual: "opt-m-manual.js",
        measurements: "opt-m-table.js",
        parameters: "opt-r-parameters.js",
        options: ["opt-r-modals.js"],  // Now an array
        report: "opt-r-template-peff.js",
        algorithms: ["opt-a-diastology.js"],
    },
    {
        id: "stress",
        name: "Stress",
        manual: "config-stress/opt-m-stress-manual.js",
        measurements: "config-stress/opt-m-stress-table.js",
        parameters: "config-stress/opt-r-stress-parameters.js",
        options: ["config-stress/opt-r-stress-modals.js"],  // Now an array
        report: "config-stress/opt-r-stress-template.js",
        algorithms: [], // No algorithms for stress template
    },
];
