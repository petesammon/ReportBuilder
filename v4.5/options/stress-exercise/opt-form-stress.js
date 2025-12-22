window.options = [
    {
        sectionPreviewKey: "sectProtocol",
        enableSectionPreview: true,
        title: "",
        params: {
            paramsStudyQuality: {
                title: "Technical quality:",
                options: [
                    { label: "Good", title: "This was a technically good study", default: true,},
                    { label: "Adequate", title: "This was a technically adequate study"},
                    { label: "Poor", title: "This was a technically poor study"},
                    { label: "Inadequate", title: "This was a technically inadequate study"},
                ],
            },
            paramsProtocol: {
                title: "Stress Protocol:",
                options: [
                    { label: "Supine bike", title: `The patient exercised for {{ExMinutes}} and {{ExSeconds}} (peak {{PeakWatts}}) according to a supine bicycle protocol, reaching a peak heart rate of {{MaxHR}} ({{PercentMaxHR}} of predicted max) and a peak blood pressure of {{MaxBP}}.`, default: true,},
                ],
            },
            paramsContrast: {
                title: "Contrast Used:",
                options: [
                    { label: "Luminity", title: `Luminity contrast used: {{mlsLuminity}} diluted in {{mlsNaCl}} of 0.9% NaCl - total of {{ContrastAdministered}} administered. LOT No. {{ContrastLOT}}, Exp. {{ContrastEXP}}`, default: true,},
                    { label: "Sonovue", title: `Luminity contrast used - total of {{ContrastAdministered}} administered. LOT No. {{ContrastLOT}}, Exp. {{ContrastEXP}}`, default: true,},
                    { label: "No contrast", title: "No contrast used"},
                ],
            },
            paramsSymptoms: {
                title: "Symptoms",
                options: [
                    { label: "Fatigue", title: "Fatigue.", default: true,},
                    { label: "Leg pain", title: "Leg pain."},
                    { label: "Chest pain", title: "Chest pain."},
                    { label: "Breathlessness", title: "Breathlessness."},
                ],
            },
            paramsStopReason: {
                title: "Reason for stopping:",
                options: [
                    { label: "Fatigue", title: "The test was stopped because of fatigue.", default: true,},
                    { label: "Leg pain", title: "The test was stopped because of leg pain."},
                    { label: "Chest pain", title: "The test was stopped because of chest pain."},
                    { label: "ECG changes", title: "The test was stopped because of significnat ECG changes."},
                    { label: "Breathlessness", title: "The test was stopped because of breathlessness."},
                ],
            },
            paramsTargetHRAchieved: {
                title: "Target HR Achieved",
                options: [
                    { label: "Yes", title: "Target heart rate was achieved.", default: true,},
                    { label: "No", title: "Target heart rate was not achieved - inconclusive test."},
                ],
            },
            paramsExerciseTolerance: {
                title: "Exercise tolerance:",
                options: [
                    { label: "Excellent", title: "This level of exercise represents an excellent exercise tolerance for age."},
                    { label: "Very good", title: "This level of exercise represents a very good exercise tolerance for age."},
                    { label: "Good", title: "This level of exercise represents a good exercise tolerance for age.", default: true,},
                    { label: "Average", title: "This level of exercise represents an average exercise tolerance for age."},
                    { label: "Poor", title: "This level of exercise represents a poor exercise tolerance for age."},
                    { label: "Very poor", title: "This level of exercise represents a very poor exercise tolerance for age."},
                ],
            },
        },
    },
    {
        sectionPreviewKey: "sectECG",
        enableSectionPreview: true,
        title: "",
        params: {
            paramsRestingECG: {
                title: "Resting ECG:",
                options: [
                    { label: "Normal sinus rhythm", title: "Normal sinus rhythm.", default: true,},
                ],
            },
            paramsStressECG: {
                title: "Post-exercise ECG:",
                options: [
                    { label: "No ECG changes", title: "In response to stress, the ECG showed no ST-T wave changes.", default: true,},
                    { label: "Non-diagnostic ST-T wave changes", title: "In response to stress, the ECG showed non-diagnostic ST-T wave changes."},
                    { label: "Non-singificant ST-T wave changes", title: "In response to stress, the ECG showed non-significant ST-T wave changes."},
                    { label: "Ischaemic ST-T wave changes", title: "In response to stress, the ECG showed ischaemic ST-T wave changes."},
                ],
            },
            paramsHaemoResponse: {
                title: "Haemodynamic response:",
                options: [
                    { label: "Normal response", title: "There were normal blood pressure and heart rate responses to stress.", default: true,},
                    { label: "Blunted BP response (<30mmHg)", title: "There was blunted blood pressure responses to stress."},
                    { label: "Mild hypertensive response (>70mmHg change)", title: "There was mild hypertensive blood pressure responses to stress."},
                    { label: "Hypertensive response (>230mmHg absolute)", title: "There was hypertensive blood pressure responses to stress."},
                    { label: "Abnormal heart rate response", title: "There wasabnormal heart rate responses to stress."},
                ],
            },
        },
    },
    {
        sectionPreviewKey: "sectEcho",
        enableSectionPreview: true,
        title: "",
        params: {
            paramsRestingEcho: {
                title: "Resting Echo Findings:",
                options: [
                    { label: "Normal LV", title: "Normal left ventricular size, wall thickness and systolic function (EF greater than 55%).", default: true,},
                    { label: "Full scan (normal)", title: "Normal left ventricular size, wall thickness and systolic function (EF greater than 55%).\n- Normal right ventricular size and function.\n- No significant valvular abnormalities.\n- Normal aorta dimensions."},
                ],
            },
            paramsStressEcho: {
                title: "Peak Stress Echo Findings:",
                options: [
                    { label: "No inducible ischaemia", title: "Echo images were acquired at peak stress which demonstrated appropriate augmentation of all left ventricular segments with slight decrease in cavity size (normal response).", default: true,},
                    { label: "Inducible ischaemia", title: "Echo images were acquired at peak stress which demonstrated .", default: true,},
                ],
            },
        },
    },
    {
        title: "Summary",
        sectionPreviewKey: "Summary",
        params: {
            SummaryTitle: {
                title: "Header",
                options: [
                    { label: "Conclusions", title: "Conclusions:", default: true },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 0,
            },
            SummaryDefault: {
                title: "Summary style",
                options: [
                    { label: "Default", title: "1. Normal resting LV function (EF >55%)\n2. No echocardiographic evidence of inducible ischaemia.\n3. No symptoms.\n4. No ECG changes.", default: true },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 0,
            },
            SummaryOperators: {
                title: "Operator style",
                options: [
                    { label: "Operator and Supervisor", title: "\nPerformed by: {{Operator}}\nSupervised by: {{Supervisor}}", default: true },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 0,
            },
            Summary: {
                title: "",
                custom: true,
                large: true,
            },
        },
    },
];