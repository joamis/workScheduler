const TimeController = require("../backend/TimeController");

const assert = require('chai').assert;


describe('TimeController_1', () => {
    it('Test day of week conversion', () => {
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Monday", "0000"), 0);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Tuesday", "0000"), 3600);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Wednesday", "0000"), 7200);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Thursday", "0000"), 10800);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Friday", "0000"), 14400);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Saturday", "0000"), 18000);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Sunday", "0000"), 21600);

    });

    it('Time of day conversion', () => {
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Monday", "0000"), 0);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Monday", "0015"), 15);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Monday", "0315"), 195);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Monday", "0815"), 495);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Monday", "2300"), 1380);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Monday", "2359"), 1439);
        assert.throws( () => {TimeController.convertToMinSinceBegOfMonday("Monday", "080")}, Error,  "Invalid timeOfDay value: 080");
        assert.throws( () => {TimeController.convertToMinSinceBegOfMonday("Monday", "2400")}, Error, "Invalid timeOfDay value: 2400");
        assert.throws( () => {TimeController.convertToMinSinceBegOfMonday("Monday", "4444")}, Error, "Invalid timeOfDay value: 4444");
        assert.throws( () => {TimeController.convertToMinSinceBegOfMonday("Monday", "0060")}, Error, "Invalid timeOfDay value: 0060");
    });

    it('Day of week with time of day combined test', () => {
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Wednesday", "0815"), 7200 + 495);
        assert.equal(TimeController.convertToMinSinceBegOfMonday("Sunday", "2300"), 21600 + 1380);
    });
});

describe('TimeController_2', () => {
    it('Test single student time assignment jeden po drugim', () => {
        let timeController =  new TimeController();
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0000", 90), true);
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0130", 90), true);
    });
    it('Test single student time assignment jeden w trakcie drugiego', () => {
        let timeController =  new TimeController();
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0000", 90), true);
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0120", 90), false);
    });
    it('Test single student time assignment jeden miedzy dwoma innymi', () => {
        let timeController =  new TimeController();
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0000", 120), true);
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0400", 120), true);
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0200", 120), true);
    });
    it('Test single student time assignment jeden miedzy dwoma innymi, zbyt dlugi fail, krotki pozniej dziala', () => {
        let timeController =  new TimeController();
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0000", 120), true);
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0400", 120), true);
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0200", 121), false);
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0200", 120), true);
    });
});

describe('TimeController_2', () => {
    it('Test multiple student time assignment jeden po drugim', () => {
        let timeController =  new TimeController();
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0000", 90), true);
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0130", 90), true);
        assert.equal(timeController.bookStudentTime("Karol","Monday", "0000", 90), true);
        assert.equal(timeController.bookStudentTime("Karol","Monday", "0130", 90), true);
    });

    it('Test multiple student time assignment jeden jeden w trakcie drugiego', () => {
        let timeController =  new TimeController();
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0000", 90), true);
        assert.equal(timeController.bookStudentTime("Janek","Monday", "0120", 90), false);
        assert.equal(timeController.bookStudentTime("Karol","Monday", "0000", 90), true);
        assert.equal(timeController.bookStudentTime("Karol","Monday", "0120", 90), false);
    });
});
