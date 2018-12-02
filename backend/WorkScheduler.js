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
            let studentAndChoice = this.choicesQueue.pop()
            const c = studentAndChoice.choice
            let debugMsg = 'Student: ' + studentAndChoice.student.name + '|' + c.nameOfSubject + '-' + c.groupID + '-> ' + c.numberOfPoints
            if (this.choicesToIgnore.includes(studentAndChoice.choice)) {
                debugMsg += ' !! IGNORED'
            } else {
                this.processSingleChoice(studentAndChoice)
            }
        }
     //   console.log(this.subjects[0].nameOfSubject + this.subjects[0].groups)
       this.assignLeftovers()

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
        if (associatedGroup.numberOfPeople > 0 )
        {
           // console.log(associatedGroup.numberOfPeople + studentChoice.choice.nameOfSubject + studentChoice.choice.groupID)
            this.assignStudentToGroup(associatedGroup, studentChoice.student, studentChoice.choice.nameOfSubject);
            return true
        }
        else
        {
            return false
        }
    }

    assignStudentToGroup(associatedGroup, student, nameOfSubject) {
        associatedGroup.numberOfPeople -= 1
        student.subjectsIds.push({
            'nameOfSubject': nameOfSubject,
            'groupID': associatedGroup.groupID
        })
    }

    findAssociatedGroup(nameOfSubject, groupID) {
        let associatedSubject = this.subjects.find((subject) => subject.nameOfSubject ===  nameOfSubject)
        return associatedSubject.groups[groupID - 1]
    }

    calculateLevelOfSatisfaction(studentChoice, choicesForSameSubject) {


        let student = studentChoice.student;
        student.levelOfSatisfaction==0;
        let numberOfPoints = studentChoice.choice.numberOfPoints;

        let studentChoiceIndex = choicesForSameSubject.findIndex( (choice) => {
            return choice.numberOfPoints === numberOfPoints;
        });

        switch (studentChoiceIndex) {
            case 0:
                student.levelOfSatisfaction += 10
                break;
            case 1:
                student.levelOfSatisfaction += 5
                break;
            case 2:
                student.levelOfSatisfaction += 2
                break;
            default:
                student.levelOfSatisfaction += 1
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

    assignLeftovers() {

        const obligatorySubjects = this.subjects.map((subject) => {
            return subject.nameOfSubject
        })
        let groupsWithFreePlaces = [];
        this.subjects.forEach((subject) => {
            groupsWithFreePlaces.push(... subject.groups.filter((group) => {
                return group.numberOfPeople > 0
            }))
           // console.log(subject.nameOfSubject + gr)
        })
       // console.log(groupsWithFreePlaces)
       this.students.forEach((student) => {

           this.assignLeftoversForSingleStudent(student, obligatorySubjects, groupsWithFreePlaces)
           groupsWithFreePlaces = groupsWithFreePlaces.filter((groupWithFreePlaces) => {return groupWithFreePlaces.numberOfPeople > 0})


       })
    }

    assignLeftoversForSingleStudent(student, obligatorySubjects, groupsWithFreePlaces) {
        console.log(student.subjectsIds.length)
        if (obligatorySubjects.length != student.subjectsIds.length) {
            const studentAssignedSubjectsNames = student.subjectsIds.map((subjectsId) => {return subjectsId.nameOfSubject} )
            let notAssignedSubjects = obligatorySubjects.filter((obligatorySubject) => { return !studentAssignedSubjectsNames.includes(obligatorySubject)})
            notAssignedSubjects.forEach( (notAssignedSubject) => {
                let sameSubjectGroup = groupsWithFreePlaces.find( (groupWithFreePlaces) => { return groupWithFreePlaces.nameOfSubject === notAssignedSubject.nameOfSubject} )
              //  console.log(student.username + sameSubjectGroup + notAssignedSubject)
                this.assignStudentToGroup(sameSubjectGroup,student, notAssignedSubject);
            })
        }
    }
}