const reportConfigs = [
    {
        id: "standardtte",
        name: "Standard TTE",
        manual: false,
        measurements: "options/standardtte/opt-measures-default.js",
        options: "options/standardtte/opt-form-default.js",
        report: "options/standardtte/opt-report-default.js",
        default: true,
    },
    {
        id: "exercisestress",
        name: "Stress (Exercise)",
        manual: "options/input/opt-manual-stress.js",
        measurements: "options/stress-exercise/opt-measures-stress.js",
        options: "options/stress-exercise/opt-form-stress.js",
        report: "options/stress-exercise/opt-report-stress.js",
    },
];