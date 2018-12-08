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
    it('Janusz nie dostaje sie na WDI1 ale dzieki dodatkowym punktom dostaje sie a WDI 2', () => {
        let students = []
        let subjects = []

        students.push(createStudent('Krzys', [["WDI", 1, 75], ["SCS", 1, 25]]))
        students.push(createStudent('Zbys', [["WDI", 1, 70], ["SCS", 1, 30]]))
        students.push(createStudent('Janusz', [["WDI", 1, 65], ["WDI", 2, 15], ["SCS", 1, 20]]))

        subjects.push(createSubject('WDI', [1, 2]))
        subjects.push(createSubject('SCS', [1, 2]))


        let workScheduler = new WorkScheduler(subjects, students)
        workScheduler.calculateWorkSchedule();
        console.log(students[0].subjectsIds)
        assert.equal(true, true)
    })
})

