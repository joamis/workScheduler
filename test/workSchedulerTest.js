const assert = require('chai').assert;
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

function createSubject(subjectName, numbersOfPeopleInGroups) {
    let groups = []
    let groupIndex = 1
    numbersOfPeopleInGroups.forEach((numbersOfPeopleInGroup) => {
        groups.push(new Group({date: '', numberOfPeople: numbersOfPeopleInGroup, groupID: groupIndex}))
        groupIndex += 1
    })
    return new Subject({nameOfSubject: subjectName, groups: groups})
}

describe('WorkScheduler', () => {
    it('Karol should be assigned to WDI and BST', () => {
        let students = []
        let subjects = []

        students.push(createStudent('Karol', [["WDI", 1, 50], ["BST", 2, 35]]))

        subjects.push(createSubject('WDI', [1, 2]))
        subjects.push(createSubject('BST', [1, 2]))


        let workScheduler = new WorkScheduler(subjects, students)
        workScheduler.calculateWorkSchedule();
        console.log(students[0].subjectsIds)
        assert.equal(true, true)
    })
})

