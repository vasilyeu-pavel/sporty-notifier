const getYear = (date = null) => new Date(date).getFullYear();

const getMonth = (date = null) => {
    const month = new Date(date).getMonth() + 1;
    if (month < 10) return `0${month}`;
    return month;
};

const getDay = (number = 0, date = null) => {
    const d = new Date(date);

    d.setDate(d.getDate() + number);
    return d.getDate();
};

const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // even 32 is acceptable
    return tomorrow;
};

const getFullDate = (date) => {
    const currentDate = new Date(date);

    return (separator = '/') => {
        return `${getYear(currentDate)}${separator}${getMonth(currentDate)}${separator}${getDay(0, currentDate) < 10
            ? '0' + getDay(0, currentDate)
            : getDay(0, currentDate)}`;
    };
};

module.exports = {
    getYear,
    getMonth,
    getDay,
    getTomorrow,
    getFullDate,
};
