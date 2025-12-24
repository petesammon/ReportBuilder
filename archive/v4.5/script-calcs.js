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
    },
    EFBPRounded: (metrics) => {
        return metrics.EFBP ? Math.round(metrics.EFBP) : "N/A";
    }
};

// Register Handlebars helper to round to 2dp with trailing 0s
// i.e 1.7 -> 1.70
Handlebars.registerHelper('2dp', function (num) {
    return num && typeof num === 'number' ? num.toFixed(2) : "N/A";
});