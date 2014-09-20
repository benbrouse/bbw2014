function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function timeOfDay(input) {
    var processDate = input.toLowerCase().replace("date:", "").trim().split(",");

    var time = processDate[1].trim().split(" ")[0].trim();
    time = time.replace(",", "");
    time = time.replace(":00", "");
    time = time.split("-")[0].trim();
    
    time = _processTimes(time);    
    
    // fix-up bad data like "19,"
    var location = time.indexOf(",");
    if (location > -1) {
        time = _processTimes("12pm");
    }
    
    if (time.split(":").length <= 2) {
        time = input;
        time = _processTime(time);
    }

    return time;
}

function _processTimes(input) {
    var time = input.toLowerCase().replace(" ", "");
    var timeParts = time.split('-');

    var indicator = "am";
    if (time.indexOf(indicator) > -1) {
        time = _processTime(timeParts[0], false);
    } else {
        time = _processTime(timeParts[0], true);
    }
    
    return time;
}

function _processTime(input, pm) {
    var time = input.toLowerCase();

    var indicator = (pm) ? "pm" : "am";

    if (time == "open" || time == "all" || time.indexOf("all day") > -1) {
        time = "12:00:00";
    } else {
        if (time.indexOf(indicator) > -1 || indicator == "pm") {
            time = time.replace(indicator, "");

            var splitString = ":";
            if (time.indexOf("-") > -1) {
                splitString = "-";
            }

            var timeParts = time.split(splitString);
            var minutes = 0;
            var hours = Number(timeParts[0]);
            if (hours != 12 && pm) {
                hours += 12;
            }

            if (timeParts.length == 2 && splitString == ":") {
                minutes = Number(timeParts[1]);
            }

            time = pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(Number(0), 2);
        }
    }

    return time;
}

module.exports.pad = pad;
module.exports.timeOfDay = timeOfDay;