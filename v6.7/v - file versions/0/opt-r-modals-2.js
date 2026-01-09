window.optionsFileMeta = {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
    </svg>`,
    title: 'Open layer options'
};

window.options = [
    {
        modalKey: "mFull",
        modalTitle: "Full Normal Study",
        variables: [
            "Operator1",
            "pMachine",
            "pQuality",
            "pDemo",
            "BP",
            "HR",
            "pRhythm",
            "pLVMeasurements",
            "EFVisual",
            "pLVEF",
            "spLV",
            "pAoMeasurements",
            "pRVtoRA",
            "pPASP",
        ],
    },
    {
        modalKey: "mDiastology",
        modalTitle: "Full Diastology Assessment",
        variables: [
            "pRhythm",
            "pRWMA",
            "EFBP",
            "GLS",
            "EEPrimeAv",
            "LAESVInd",
            "TRVmax",
            "EPrimeSept",
            "EPrimeLat",
            "EVel",
            "EDecT",
            "EEPrimeSept",
            "LARs",
            "LAPs",
            "ArADur",
            "LWave",
            "PVSDR",
            "Age",
            "Gender",
            "Height",
            "Weight",
            "BMI",
        ],
    },
];