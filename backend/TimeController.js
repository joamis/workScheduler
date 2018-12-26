'use strict'


module.exports = class TimeController {
    constructor(showDebugInfo) {
        this.studentWithBusyTimeMap = new Map()
        this.showDebugInfo = showDebugInfo
    }

    static convertToMinSinceBegOfMonday(dayOfWeek, timeOfDay) {
        let ratio = 0;
        switch (dayOfWeek) {
            case "Monday":
                ratio = 0;
                break;
            case "Tuesday":
                ratio = 1;
                break;
            case "Wednesday":
                ratio = 2;
                break;
            case "Thursday":
                ratio = 3;
                break;
            case "Friday":
                ratio = 4;
                break;
            case "Saturday":
                ratio = 5;
                break;
            case "Sunday":
                ratio = 6;
                break;
            default:
                throw new Error("Invalid dayOfWeek value: " + dayOfWeek);
        }
        let dayOfWeekMinutes = 3600 * ratio;
        //validation thad timeOfDay value makes sense
        if (timeOfDay.length !== 4 || parseInt(timeOfDay.charAt(0), 10) > 2 ||
            (parseInt(timeOfDay.charAt(0), 10) === 2 &&
                parseInt(timeOfDay.charAt(1), 10) > 3) ||
            parseInt(timeOfDay.charAt(2), 10) > 5) {
            throw new Error("Invalid timeOfDay value: " + timeOfDay);
        }
        let hours = parseInt(timeOfDay.substr(0, 2), 10);
        let minutes = parseInt(timeOfDay.substr(2, 2), 10);
        return dayOfWeekMinutes + hours * 60 + minutes;
    }

    bookStudentTime(studentID, dayOfWeek, timeOfDay, duration) {
        const currentlyBookedTimeStart = TimeController.convertToMinSinceBegOfMonday(dayOfWeek, timeOfDay);
        const currentlyBookedTimeEnd = currentlyBookedTimeStart + duration;
        if (this.studentWithBusyTimeMap.has(studentID)) {
            let studentBusyTimeRanges = this.studentWithBusyTimeMap.get(studentID);
            for (let studentBusyTimeRange of studentBusyTimeRanges) {
                const [rangeStart, rangeEnd] = studentBusyTimeRange;
                if (rangeEnd <= currentlyBookedTimeStart || currentlyBookedTimeEnd <= rangeStart) {
                    continue; // we're  outside range
                }
                return false;
            }
            studentBusyTimeRanges.push([currentlyBookedTimeStart, currentlyBookedTimeEnd]);
            return true;
        } else {
            let studentBusyTime = [[currentlyBookedTimeStart, currentlyBookedTimeEnd]]
            this.studentWithBusyTimeMap.set(studentID, studentBusyTime);
            return true;
        }
    }

    bookStudentTimeForGroup(studentID, group) {
        const retValue = this.bookStudentTime(studentID, group.dayOfWeek, group.startTime, group.duration);
        if (this.showDebugInfo) {
            let msg = "Student: " + studentID + " in booking group " + group.groupID + " " + group.dayOfWeek + " " + group.startTime + " " + group.duration + " -> "
            if (retValue) {
                msg += " !! Available !!"
            } else {
                msg += " !! Failed - is already busy in time range !!"
            }
            console.log(msg)
        }
        return retValue;
    }
}