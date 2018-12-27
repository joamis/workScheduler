const assert = require('chai').assert;
const expect = require('chai').expect;
const WorkScheduler = require('../backend/WorkScheduler');
const Subject = require('../models/Subject');
const Group = require('../models/Group').Group;
const Preference = require('../models/Preference').Preference;
const Student = require('../models/Student');

function getPreferences(prefArrays) {
    let preferences = []
    prefArrays.forEach((prefArray) => {
        preferences.push(new Preference({
            nameOfSubject: prefArray[0],
            groupID: prefArray[1],
            numberOfPoints: prefArray[2]
        }))
    });
    return preferences
}

function createStudent(name, prefArrays) {
    return new Student({
        name: name,
        surname: '',
        choices: getPreferences(prefArrays),
        levelOfSatisfaction: 0,
        subjectsIds: [],
        username: ''
    });
}

function createSubject(subjectName, groupParameters) {
    let groups = [];
    let groupIndex = 1;
    groupParameters.forEach((groupParameter) => {
        const numberOfPeopleInGroup = groupParameter[0]
        const groupDayOfWeek = groupParameter[1]
        const groupStarTimeOfDay = groupParameter[2]
        const groupDuration = groupParameter[3]
        groups.push(new Group({
            dayOfWeek: groupDayOfWeek,
            numberOfPeople: numberOfPeopleInGroup,
            groupID: groupIndex,
            startTime: groupStarTimeOfDay,
            duration: groupDuration
        }));
        groupIndex += 1
    });
    return new Subject({nameOfSubject: subjectName, groups: groups})
}

function matchImpl(associatedStudent, studentName, allocations) {
    let allocationsMap = new Map();
    allocations.forEach((allocation) => {
        allocationsMap.set(allocation[0], allocation[1])
    });
    if (associatedStudent.subjectsIds.length !== allocationsMap.size) {
        return false;
    }
    return !associatedStudent.subjectsIds.some((choice) => {
        let allocation = allocationsMap.get(choice.nameOfSubject);
        if (!allocation || allocation !== choice.groupID) {
            return true
        }
        return false
    });
}

function areFloatsEqual(a, b) {
    return (Math.abs(a - b) < 0.01)
}

function match(students, studentName, allocations, levelOfSatisfaction) {
    let associatedStudent = students.find((student) => {
        return student.name === studentName
    });
    const result = matchImpl(associatedStudent, studentName, allocations)
    if (!result) {
        allocations.sort();
        associatedStudent.subjectsIds.sort((choiceA, choiceB) => {
            return choiceA.nameOfSubject.localeCompare(choiceB.nameOfSubject)
        });
        console.log('Student: ' + associatedStudent.name)
        console.log('Expected:')
        let expectedMap = new Map();
        allocations.forEach((allocation) => {
            expectedMap.set(allocation[0], allocation[1])
        });
        console.log(expectedMap)
        console.log('Actual:')
        let actualMap = new Map();
        associatedStudent.subjectsIds.forEach((subjectId) => {
            actualMap.set(subjectId.nameOfSubject, subjectId.groupID)
        });
        console.log(actualMap)
    }
    assert.equal(result, true);
    if (levelOfSatisfaction) {
        const floatComparisionResult = areFloatsEqual(associatedStudent.levelOfSatisfaction, levelOfSatisfaction)
        if (!floatComparisionResult) {
            console.log('Student: ' + associatedStudent.name)
            console.log('Level of satisfaction expected:')
            console.log(levelOfSatisfaction)
            console.log('Level of satisfaction actual:')
            console.log(associatedStudent.levelOfSatisfaction)
        }
        assert.equal(floatComparisionResult, true)
    }
}

describe('WorkScheduler_1', () => {
    it('Wszyscy dostaja sie tam gdzie chca', () => {
        let students = [];
        let subjects = [];

        students.push(createStudent('Karol', [["WDI", 1, 50], ["SCS", 2, 50]]));
        students.push(createStudent('Jan', [["WDI", 1, 60], ["SCS", 1, 40]]));
        students.push(createStudent('Piotr', [["WDI", 2, 30], ["SCS", 1, 70]]));

        subjects.push(createSubject('WDI', [[2, "Monday", "0800", 90], [1, "Tuesday", "0800", 90]]))
        subjects.push(createSubject('SCS', [[2, "Wednesday", "0800", 90], [1, "Thursday", "0800", 90]]))

        let workScheduler = new WorkScheduler(subjects, students);
        workScheduler.calculateWorkSchedule();


        match(students, 'Karol', [["WDI", 1], ["SCS", 2]], 100);
        match(students, 'Jan', [["WDI", 1], ["SCS", 1]], 100);
        match(students, 'Piotr', [["WDI", 2], ["SCS", 1]], 100);
    })
});

describe('WorkScheduler_2', () => {
    it('Janusz nie dostaje sie na WDI1 ale dzieki dodatkowym punktom dostaje sie a WDI 2', () => {
        let students = [];
        let subjects = [];

        students.push(createStudent('Krzys', [["WDI", 1, 75], ["SCS", 1, 25]]))
        students.push(createStudent('Zbys', [["WDI", 1, 70], ["SCS", 1, 30]]))
        students.push(createStudent('Janusz', [["WDI", 1, 65], ["WDI", 2, 15], ["SCS", 1, 20]]))

        subjects.push(createSubject('WDI', [[2, "Monday", "0800", 90], [1, "Tuesday", "0800", 90]]))
        subjects.push(createSubject('SCS', [[2, "Wednesday", "0800", 90], [1, "Thursday", "0800", 90]]))


        let workScheduler = new WorkScheduler(subjects, students)
        workScheduler.calculateWorkSchedule();

        match(students, 'Krzys', [["WDI", 1], ["SCS", 2]], 75);
        match(students, 'Zbys', [["WDI", 1], ["SCS", 1]], 100);
        match(students, 'Janusz', [["WDI", 2], ["SCS", 1]], 60);
    })
});

describe('WorkScheduler_3', () => {
    it('Maria nie dostaje sie na WDI 1 ani na SCS 1 ale dostaje sie na WDI 2 dzięki dodatkowym punktom', () => {
        let students = [];
        let subjects = [];

        students.push(createStudent('Anna', [["WDI", 1, 60], ["SCS", 1, 40]]))
        students.push(createStudent('Karolina', [["WDI", 1, 60], ["SCS", 1, 40]]))
        students.push(createStudent('Maria', [["WDI", 1, 39], ["WDI", 2, 26], ["SCS", 1, 35]]))
        students.push(createStudent('Monika', [["WDI", 2, 28], ["SCS", 2, 72]]))
        students.push(createStudent('Maja', [["WDI", 2, 29], ["SCS", 2, 71]]))

        subjects.push(createSubject('WDI', [[2, "Monday", "0800", 90], [2, "Tuesday", "0800", 90], [1, "Wednesday", "0800", 90]]))
        subjects.push(createSubject('SCS', [[2, "Monday", "1000", 90], [2, "Tuesday", "1000", 90], [1, "Wednesday", "1000", 90]]))


        let workScheduler = new WorkScheduler(subjects, students)
        workScheduler.calculateWorkSchedule();
        assert.equal(true, true)

        match(students, 'Anna', [["WDI", 1], ["SCS", 1]], 100);
        match(students, 'Karolina', [["WDI", 1], ["SCS", 1]], 100);
        match(students, 'Maria', [["WDI", 2], ["SCS", 3]], 32.5);
        match(students, 'Monika', [["WDI", 3], ["SCS", 2]], 72);
        match(students, 'Maja', [["WDI", 2], ["SCS", 2]], 100);
    })
});


describe('WorkScheduler_4', () => {
    it('Jan nie dostaje sie na SCS1 bo jest juz przypisany na WDI1 o tej samej godzinie, dopisywany jest do SCS3 bo ma tam najwyzsze preferencje', () => {
        let students = [];
        let subjects = [];

        students.push(createStudent('Karol', [["WDI", 1, 50], ["SCS", 2, 50]]));
        students.push(createStudent('Jan', [["WDI", 1, 60], ["SCS", 1, 37], ["SCS", 2, 1], ["SCS", 3, 2]]));
        students.push(createStudent('Piotr', [["WDI", 2, 30], ["SCS", 1, 70]]));

        subjects.push(createSubject('WDI', [[2, "Monday", "0800", 90], [1, "Tuesday", "0800", 90]]));
        subjects.push(createSubject('SCS', [[2, "Monday", "0800", 90], [1, "Thursday", "0800", 90], [1, "Friday", "0800", 90]]));

        let workScheduler = new WorkScheduler(subjects, students);
        workScheduler.calculateWorkSchedule();


        match(students, 'Karol', [["WDI", 1], ["SCS", 2]], 100);
        match(students, 'Jan', [["WDI", 1], ["SCS", 3]], 80);
        match(students, 'Piotr', [["WDI", 2], ["SCS", 1]], 100);
    })

    it('Jan nie dostaje sie na SCS1 bo jest juz przypisany na WDI1 o tej samej godzinie, dopisywany jest do SCS2, ' +
        'bo mimo ze SCS3 ma wyzsze preferencje to tez jest o tej samej godzinie', () => {
        let students = [];
        let subjects = [];

        students.push(createStudent('Karol', [["WDI", 1, 50], ["SCS", 2, 50]]));
        students.push(createStudent('Jan', [["WDI", 1, 60], ["SCS", 1, 37], ["SCS", 2, 2], ["SCS", 3, 1]]));
        students.push(createStudent('Piotr', [["WDI", 2, 30], ["SCS", 1, 70]]));

        subjects.push(createSubject('WDI', [[2, "Monday", "0800", 180], [1, "Tuesday", "0800", 90]]));
        subjects.push(createSubject('SCS', [[2, "Monday", "0800", 90], [1, "Monday", "0930", 90], [2, "Friday", "0800", 90]]));

        let workScheduler = new WorkScheduler(subjects, students);
        workScheduler.calculateWorkSchedule();


        match(students, 'Karol', [["WDI", 1], ["SCS", 3]], 50);
        match(students, 'Jan', [["WDI", 1], ["SCS", 3]], 68);
        match(students, 'Piotr', [["WDI", 2], ["SCS", 1]], 100);
    })
});

describe('WorkScheduler_5', () => {
    it('Test rozbicia blokujacych sie rozwiazan', () => {
        let students = [];
        let subjects = [];

        students.push(createStudent('Karol', [["WDI", 1, 100]]));
        students.push(createStudent('Jan', [["WDI", 2, 20], ["SCS", 2, 80]]));

        subjects.push(createSubject('WDI', [[1, "Monday", "0800", 90], [1, "Tuesday", "0800", 90]]));
        subjects.push(createSubject('SCS', [[1, "Monday", "0800", 90], [1, "Thursday", "0800", 90]]));

        let workScheduler = new WorkScheduler(subjects, students);
        workScheduler.calculateWorkSchedule();


        match(students, 'Karol', [["WDI", 1], ["SCS", 2]], 100);
        match(students, 'Jan', [["WDI", 2], ["SCS", 1]], 80);
    });
});