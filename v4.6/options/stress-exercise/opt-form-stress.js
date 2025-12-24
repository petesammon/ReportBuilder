window.options = [
    {
        sectionPreviewKey: "sectProtocol",
        enableSectionPreview: true,
        title: "",
        params: {
            paramsStudyQuality: {
                title: "Technical quality:",
                options: [
                    { label: "Excellent", title: "This was a technically excellent study"},
                    { label: "Good", title: "This was a technically good study"},
                    { label: "Adequate", title: "This was a technically adequate study", default: true, },
                    { label: "Difficult with suboptimal views", title: "This was a technically difficult with suboptimal study"},
                    { label: "(enter custom text)", title: ""},
                ],
            },
            paramsProtocol: {
                title: "Stress Protocol:",
                options: [
                    { label: "Supine bike", title: `The patient exercised for {{ExMinutes}} and {{ExSeconds}} (peak {{PeakWatts}}) according to a supine bicycle protocol, reaching a peak heart rate of {{MaxHR}} ({{PercentMaxHR}} of predicted max) and a peak blood pressure of {{MaxBP}}.`, default: true,},
                    { label: "Low dose DSE", title: `The patient received intravenous dobutamine in 3 minute stages (low dose 5mcg/kg/min) and to a maximum of {{MaxDobutamineDose}} plus {{AtropineDose}} atropine. `},
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
                    { label: "Shortness of breath", title: "Shortness of breath."},
                    { label: "Chest pain", title: "Chest pain."},
                    { label: "Anginal chest pain", title: "Anginal chest pain."},
                    { label: "Atypical chest pain", title: "Atypical chest pain."},
                    { label: "Leg fatigue", title: "Leg fatigue."},
                    { label: "Claudication", title: "Claudication."},
                    { label: "(enter custom text)", title: ""},
                ],
            },
            paramsStopReason: {
                title: "Reason for stopping:",
                options: [
                    { label: "Fatigue", title: "The test was stopped because of fatigue.", default: true,},
                    { label: "Shortness of breath", title: "The test was stopped because of shortness of breath."},
                    { label: "Chest pain", title: "The test was stopped because of chest pain."},
                    { label: "Anginal chest pain", title: "The test was stopped because of anginal chest pain."},
                    { label: "Atypical chest pain", title: "The test was stopped because of atypical chest pain."},
                    { label: "Leg fatigue", title: "The test was stopped because of leg fatigue."},
                    { label: "Claudication", title: "The test was stopped because of claudication."},
                    { label: "Patient request", title: "The test was stopped at the patient's request."},
                    { label: "Target heart rate achieved", title: "The test was stopped because target heart rate was achieved."},
                    { label: "Hypotensive response", title: "The test was stopped because of hypotensive response."},
                    { label: "Hypertensive response", title: "The test was stopped because of hypertensive response."},
                    { label: "Ischaemic ECG changes", title: "The test was stopped because of ischaemic ECG changes."},
                    { label: "Arrhythmia", title: "The test was stopped because of arrhythmia."},
                    { label: "(enter custom text)", title: ""},
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
                    { label: "No exercise (DSE)", title: "The patient did not exercise."},
                    { label: "Outstanding", title: "This level of exercise represents an outstanding exercise tolerance for age."},
                    { label: "Excellent", title: "This level of exercise represents an excellent exercise tolerance for age."},
                    { label: "Very good", title: "This level of exercise represents a very good exercise tolerance for age."},
                    { label: "Good", title: "This level of exercise represents a good exercise tolerance for age.", default: true,},
                    { label: "Fair", title: "This level of exercise represents a fair exercise tolerance for age."},
                    { label: "Average", title: "This level of exercise represents an average exercise tolerance for age."},
                    { label: "Limited", title: "This level of exercise represents a limited exercise tolerance for age."},
                    { label: "Poor", title: "This level of exercise represents a poor exercise tolerance for age."},
                    { label: "(enter custom text)", title: ""},
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
                    { label: "Sinus rhythm with extra systolic beats", title: "Sinus rhythm with extra systolic beats."},
                    { label: "Atrial fibrillation", title: "Atrial fibrillation."},
                    { label: "Paced rhythm", title: "Paced rhythm."},
                    { label: "Undeterminate rhythm", title: "Undeterminate rhythm."},
                    { label: "RBBB", title: "Right bundle branch block."},
                    { label: "LBBB", title: "Left bundle branch block."},
                    { label: "Resting bradycardia", title: "Resting bradycardia."},
                    { label: "Resting tachycardia", title: "Resting tachycardia."},
                    { label: "Frequent PACs", title: "Frequent premature atrial beats."},
                    { label: "Frequent PVCs", title: "Frequent premature ventricular beats."},
                    { label: "(enter custom text)", title: ""},
                ],
            },
            paramsStressECG: {
                title: "Post-exercise ECG:",
                options: [
                    { label: "No ECG changes", title: "In response to stress, the ECG showed no ST-T wave changes.", default: true,},
                    { label: "No diagnostic ST-T wave changes", title: "In response to stress, the ECG showed no diagnostic ST-T wave changes."},
                    { label: "Equivocal ST-T wave changes", title: "In response to stress, the ECG showed equivocal/borderline ST-T wave changes."},
                    { label: "Ischaemic ST-T wave changes", title: "In response to stress, the ECG showed ischaemic ST-T wave changes."},
                    { label: "(enter custom text)", title: ""},
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
                    { label: "(enter custom text)", title: ""},
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
                    { label: "(enter custom text)", title: ""},
                ],
            },
            paramsStressEcho: {
                title: "Peak Stress Echo Findings:",
                options: [
                    { label: "No inducible ischaemia", title: "Echo images were acquired at peak stress which demonstrated appropriate augmentation of all left ventricular segments with slight decrease in cavity size (normal response).", default: true,},
                    { label: "Inducible ischaemia", title: "Echo images were acquired at peak stress which demonstrated .", default: true,},
                    { label: "(enter custom text)", title: ""},
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
                summaryAlwaysInclude: true,
                summaryOrder: 0,
            },
            SummaryDefault: {
                title: "Summary style",
                options: [
                    { label: "Default", title: "1. Normal resting LV function (EF >55%)\n2. No echocardiographic evidence of inducible ischaemia.\n3. No symptoms.\n4. No ECG changes.", default: true },
                    { label: "(enter custom text)", title: ""},
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 1,
            },
            SummaryOperators: {
                title: "Operator style",
                options: [
                    { label: "Single operator", title: "\nPerformed by: {{Operator}}", default: true },
                    { label: "Two operators", title: "\nPerformed by: {{Operator}} and {{Operator2}}"},
                    { label: "Operator and Supervisor", title: "\nPerformed by: {{Operator}}\nSupervised by: {{Supervisor}}"},
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 5,
            },
            Summary: {
                title: "",
                custom: true,
                large: true,
            },
        },
    },
];