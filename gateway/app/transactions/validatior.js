const trendThreshold = [-0.5, 0.5];
const lastPoints = 10;
const avgPoints = 30;

const isValid = function(items) {
    return verifyPwrTrend(items);
}

function verifyPwrTrend(items) {
    let pwrChart = items.map((item) => {
        return item.pwr_avg;
    });

    if (pwrChart.length < lastPoints + avgPoints) {
        console.log("Not enough data: ", pwrChart.length);
        return false;
    }

    let lastArr = pwrChart.slice(pwrChart.length - lastPoints, pwrChart.length);
    let chartArr = pwrChart.slice(pwrChart.length - lastPoints - avgPoints,  pwrChart.length - lastPoints);
    let chartAvg = chartArr.reduce(function(res, val) { return res += val }) / chartArr.length;
    let lastAvg = lastArr.reduce(function(res, val) { return res += val }) / lastArr.length;

    console.log("lastAvg", lastAvg);
    console.log("chartAvg", chartAvg);
    if (chartAvg == 0) {
        return false;
    }
    let trend = lastAvg/chartAvg;
    console.log("Power supply trend ", trend);
    return trend <= trendThreshold[0] && trend >= trendThreshold[1];
}

module.exports = isValid;