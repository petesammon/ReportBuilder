window.options = [
    {
        sectionPreviewKey: "sectStudy",
        sectionTitle: "Study details",
        params: {
            pQuality: {
                title: "Technical quality:",
                options: [
                    { label: "Good", title: "Good" },
                    { label: "Fair", title: "Fair", default: true },
                    { label: "Poor", title: "Poor" },
                    { label: "Very poor", title: "Very poor" },
                ],
            },
            pMachine: {
                title: "Machine",
                options: [
                    { label: "GE Pioneer", title: "GE Pioneer" },
                    { label: "GE 95", title: "GE E95", default: true },
                    { label: "GE S70", title: "GE S70" },
                    { label: "GE iQ", title: "GE iQ" },
                ],
            },
            pRhythm: {
                title: "Rhythm",
                options: [
                    { label: "Sinus rhythm", title: "Sinus rhythm", default: true },
                    { label: "AF", title: "Atrial fibrillation" },
                ],
            },
        },
    },
    {
        sectionPreviewKey: "sectPeffFull",
        sectionTitle: "Pericardial Effusion",
        params: {
            pEffSize: {
                title: "Size",
                options: [
                    { label: "Trivial global", title: "Trivial global pericardial effusion."},
                    { label: "Small global", title: "Small global pericardial effusion.", default: true },
                    { label: "Moderate global", title: "Moderate global pericardial effusion."},
                    { label: "Large global", title: "Large global pericardial effusion."},
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 90,
            },
            pEffOther: {
                title: "Other Comments",
                options: [
                    { label: "(none)", title: "", default: true },
                ],
            },
            pEffCompromise: {
                title: "Haemodynamic Compromise",
                options: [
                    { label: "No haemodynamic compromise", title: "No haemodynamic compromise.", default: true,},
                    { label: "Mixed parameters", title: "Mixed parameters for haemodynamic compromise."},
                    { label: "Evidence of haemodynamic compromise", title: "Evidence of haemodynamic compromise."},
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 90,
            },
            pSeptMotion: {
                title: "Septal Motion",
                options: [
                    { label: "Normal", title: "Normal septal motion.", default: true },
                    { label: "Septal bounce", title: "Septal bounce."},
                ],
            },
            pRVCollapse: {
                title: "RV Collapse",
                options: [
                    { label: "No RV collapse", title: "No mid-diastolic RV collapse.", default: true },
                    { label: "RV collapse", title: "Mid-diastolic RV collapse demonstrated."},
                ],
            },
            pRACollapse: {
                title: "RA Collapse",
                options: [
                    { label: "No RA collapse", title: "No mid-systolic RA collapse.", default: true },
                    { label: "RA collapse", title: "Mid-systolic RA collapse demonstrated."},
                    { label: "Not seen", title: "RA was not adequately seen for assessment."},
                ],
            },
            pIVC: {
                title: "IVC",
                options: [
                    { label: "Normal size, collapse >50%", title: "Normal IVC size, collapses >50%.", default: true },
                    { label: "Normal size, collapse <50%", title: "Normal size IVC, collapses <50%"},
                    { label: "Dilated, collapse >50%", title: "Dilated IVC, collapses <50%"},
                    { label: "Dilated, collapse <50%", title: "Dilated IVC, collapses <50%"},
                    { label: "Not seen", title: "IVC was not adequately seen for assessment."},
                    { label: "Ventilated", title: "Ventilated patient, unable to assess RA pressures from IVC appearance."},
                ],
            },
            pEffVariation: {
                title: "Respiratory Variation",
                options: [
                    { label: "No significant respiratory variation.", title: "No significant respiratory variation.", default: true },
                    { label: "Significant respiratory variation.", title: "Significant respiratory variation."},
                    { label: "AF, unable to assess.", title: "Unable to assess respiratory variation due to atrial fibrillation with significant beat-to-beat variability."},
                ],
            },
        },
    },
    {
        summary: true, 
        sectionTitle: "Summary",
        params: {
            spHeader: {
                title: "Header",
                options: [
                    { label: "Summary", title: "Summary:", default: true },
                ],
                enableSummary: true,
                summaryAlwaysInclude: true,
                summaryOrder: 0,
            },
        },
    },
];