window.calculations = {
    Age: (metrics) => {
        if (!metrics.DOB) return "N/A";
        // Parse UK date format (DD/MM/YYYY)
        const [day, month, year] = metrics.DOB.split('/');
        const dob = new Date(year, month - 1, day);
        const ageMs = Date.now() - dob.getTime();
        return Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
    },
    HeightRounded: (metrics) => {
        return metrics.Height ? Math.round(metrics.Height)/100 : "N/A";
    },
    WeightRounded: (metrics) => {
        return metrics.Weight ? Math.round(metrics.Weight) : "N/A";
    },
    EFBPRounded: (metrics) => {
        return metrics.EFBP ? Math.round(metrics.EFBP) : "N/A";
    },
    EffMVVar: (metrics) => {
        if (!metrics.EffMVVmax || !metrics.EffMVVmin) return "N/A";
        const variation = ((metrics.EffMVVmax - metrics.EffMVVmin) / metrics.EffMVVmax) * 100;
        return parseFloat(variation.toFixed(1));
    },
    EffTVVar: (metrics) => {
        if (!metrics.EffTVVmax || !metrics.EffTVVmin) return "N/A";
        const variation = ((metrics.EffTVVmax - metrics.EffTVVmin) / metrics.EffTVVmax) * 100;
        return parseFloat(variation.toFixed(1));
    },
    AVAccEjT: (metrics) => {
        if (!metrics.AVAccT || !metrics.AVEjT) return "N/A";
        const ratio = metrics.AVAccT / metrics.AVEjT;
        return parseFloat(ratio.toFixed(2));
    },
};