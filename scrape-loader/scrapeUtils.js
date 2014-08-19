function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function timeOfDay(input) {
    var time = input;

    time = _processTime(time, false);
    time = _processTime(time, true);
    
    return time;
}

function _processTime(input, pm) {
    var time = input;

    var indicator = (pm) ? "pm" : "am";
    if (time.indexOf(indicator) > -1) {
        time = time.replace(indicator, "");
        
        var timeParts = time.split(":");
        var minutes = 0;
        var hours = Number(timeParts[0]);
        if (hours != 12 && pm) {
            hours += 12;
        }
        
        if (timeParts.length == 2) {
            minutes = Number(timeParts[1]);
        }
        
        time = pad(hours, 2) + ":" + pad(minutes, 2);
    }

    return time;
}

module.exports.pad = pad;
module.exports.timeOfDay = timeOfDay;