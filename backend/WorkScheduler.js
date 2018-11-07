'use strict'
const TinyQueue = require('tinyqueue');

class StudentChoice
{
    constructor(student, choice)
    {
        this.student = student;
        this.choice = choice
    }
}
module.exports = class WorkScheduler {
    constructor(subjects, students) {
        let choicesList = []
        students.forEach((student) => { student.choices.forEach( (choice) => { choicesList.push(new StudentChoice(student, choice)) } ) })
        this.choicesQueue = new TinyQueue(choicesList, function (a, b) {
            return b.choice.numberOfPoints - a.choice.numberOfPoints} );
        this.subjects = subjects
        this.students = students
        this.choicesToIgnore = []
    }

    calculateWorkSchedule() {
        while (this.choicesQueue.length) {
            console.log('  -------------------------- ')
            let studentAndChoice = this.choicesQueue.pop()
            const c = studentAndChoice.choice
            let debugMsg = 'Student: ' + studentAndChoice.student.name + '|' + c.nameOfSubject + '-' + c.groupID + '-> ' + c.numberOfPoints
            if (this.choicesToIgnore.includes(studentAndChoice.choice)) {
                debugMsg += ' !! IGNORED'
            } else {
                this.processSingleChoice(studentAndChoice)
            }
            console.log(debugMsg)
            console.log("Items left: " + this.choicesQueue.length)
           // console.log(this.choicesToIgnore)
            console.log('  -------------------------- \n')
        }
    }

    processSingleChoice(studentChoice) {
        const isAssigned = this.tryToAssignStudentByChoice(studentChoice)
        if (isAssigned)
        {
            let choicesForSameSubject = this.findSameSubjectChoices(studentChoice.student, studentChoice.choice.nameOfSubject)
            this.calculateLevelOfSatisfaction(studentChoice, choicesForSameSubject);
            this.choicesToIgnore.push(...choicesForSameSubject)
        }
        else
        {
            this.increaseNextStudentPreferenceValue(studentChoice.student, studentChoice.choice)
        }
    }

    tryToAssignStudentByChoice(studentChoice) {
        let associatedGroup = this.findAssociatedGroup(studentChoice.choice.nameOfSubject, studentChoice.choice.groupID)
        if (associatedGroup.numberOfPeople > 0)
        {
            associatedGroup.numberOfPeople -= 1
            studentChoice.student.subjectsIds.push({'nameOfSubject': studentChoice.choice.nameOfSubject, 'groupID': studentChoice.choice.groupID })
            console.log('!!Assigned -> places left ' + associatedGroup.numberOfPeople)
            return true
        }
        else
        {
            console.log('!! Not assigned')
            console.log(associatedGroup)
            return false
        }
    }

    findAssociatedGroup(nameOfSubject, groupID) {
        let associatedSubject = this.subjects.find((subject) => subject.nameOfSubject ===  nameOfSubject)
        //console.log(groupID)
        return associatedSubject.groups[groupID - 1]
    }

    calculateLevelOfSatisfaction(studentChoice, choicesForSameSubject) {
        let student = studentChoice.student;
        let numberOfPoints = studentChoice.choice.numberOfPoints;

        let studentChoiceIndex = choicesForSameSubject.findIndex( (choice) => {
            return choice.numberOfPoints === numberOfPoints;
        });

        switch (studentChoiceIndex) {
            case 0:
                student.levelOfSatisfaction =+ 10
                break;
            case 1:
                student.levelOfSatisfaction =+ 5
                break;
            case 2:
                student.levelOfSatisfaction =+ 2
                break;
            default:
                student.levelOfSatisfaction =+ 1
        }

    }

    findSameSubjectChoices(student, nameOfSubject) {

        return student.choices.filter( (choice) => {
            return choice.nameOfSubject === nameOfSubject;
        }).sort((a,b) => {
            return (a.numberOfPoints < b.numberOfPoints)
        })
    }

    increaseNextStudentPreferenceValue(student, processedChoice) {
        student.choices.sort((a,b) => {
            return (a.numberOfPoints < b.numberOfPoints)
        })
        const choiceIndex = student.choices.findIndex( (choice) => {return choice === processedChoice})
        const nextIndex = choiceIndex + 1;
        if (nextIndex < student.choices.length) {
            student.choices[nextIndex].numberOfPoints += 0
        }
    }
}