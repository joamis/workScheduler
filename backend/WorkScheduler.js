'use strict'
const TinyQueue = require('tinyqueue');

class StudentChoice {
    constructor(student, choice) {
        this.student = student;
        this.choice = choice
        this.additionalPoints = 0
    }
}

module.exports = class WorkScheduler {
    constructor(subjects, students) {
        this.choicesList = [];
        students.forEach((student) => {
            student.choices.forEach((choice) => {
                this.choicesList.push(new StudentChoice(student, choice))
            })
        })
        this.choicesQueue = new TinyQueue(this.choicesList.slice(), function (a, b) {
            return b.choice.numberOfPoints - a.choice.numberOfPoints
        });
        this.subjects = subjects;
        this.students = students;
        this.choicesToIgnore = [];
        this.shouldOutputDebugInfo = false;
    }

    calculateWorkSchedule() {
        while (this.choicesQueue.length) {
            let studentAndChoice = this.choicesQueue.pop()
            const c = studentAndChoice.choice
            let debugMsg = studentAndChoice.student.name + '|' + c.nameOfSubject + '-' + c.groupID + ' -> ' + c.numberOfPoints
            if (this.choicesToIgnore.includes(studentAndChoice.choice)) {
                debugMsg += ' !! IGNORED'
                this.logDebugMsg(debugMsg)
            } else {
                this.logDebugMsg(debugMsg)
                this.processSingleChoice(studentAndChoice)
            }
            this.logDebugMsg(' ------------------------------- ')
        }
        this.assignLeftovers()
    }

    logDebugMsg(debugMsg) {
        if (this.shouldOutputDebugInfo) {
            console.log(debugMsg)
        }
    }

    processSingleChoice(studentChoice) {
        const isAssigned = this.tryToAssignStudentByChoice(studentChoice)
        if (isAssigned) {
            let choicesForSameSubject = this.findSameSubjectChoices(studentChoice.student, studentChoice.choice.nameOfSubject);
            this.calculateLevelOfSatisfaction(studentChoice, choicesForSameSubject);
            this.logDebugMsg('Make ignore ' + studentChoice.student.name + '|' + studentChoice.choice.nameOfSubject);
            this.choicesToIgnore.push(...choicesForSameSubject)
        } else {
            this.increaseNextStudentPreferenceValue(studentChoice.student, studentChoice.choice);
            this.logDebugMsg('Make ignore ' + studentChoice.student.name + '|' + studentChoice.choice.nameOfSubject + '|' + studentChoice.choice.groupID);
            this.choicesToIgnore.push(studentChoice.choice)

        }
    }

    tryToAssignStudentByChoice(studentChoice) {
        let associatedGroup = this.findAssociatedGroup(studentChoice.choice.nameOfSubject, studentChoice.choice.groupID)
        this.logDebugMsg('Associated group: \n' + associatedGroup)
        if (associatedGroup.numberOfPeople > 0) {
            this.assignStudentToGroup(associatedGroup, studentChoice.student, studentChoice.choice.nameOfSubject);
            this.logDebugMsg('!! Assigned !!')
            return true
        } else {
            this.logDebugMsg('!! Not assigned !!')
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
        let associatedSubject = this.subjects.find((subject) => subject.nameOfSubject === nameOfSubject)
        return associatedSubject.groups[groupID - 1]
    }

    calculateLevelOfSatisfaction(studentChoice, choicesForSameSubject) {


        let student = studentChoice.student;
        let numberOfPoints = studentChoice.choice.numberOfPoints;

        let studentChoiceIndex = choicesForSameSubject.findIndex((choice) => {
            return choice.numberOfPoints === numberOfPoints;
        });

        let totalNumberOfPointsPerSubject = 0
        choicesForSameSubject.forEach((choiceForSameSubject) => totalNumberOfPointsPerSubject += choiceForSameSubject.numberOfPoints);

        const satisfactionRatio = (totalNumberOfPointsPerSubject - studentChoice.additionalPoints) / 100;

        let levelOfSatisfactionIncrease = 0
        switch (studentChoiceIndex) {
            case 0:
                levelOfSatisfactionIncrease += 100
                break;
            case 1:
                levelOfSatisfactionIncrease += 50
                break;
            case 2:
                levelOfSatisfactionIncrease += 20
                break;
            default:
                levelOfSatisfactionIncrease += 10
        }
        student.levelOfSatisfaction += (satisfactionRatio * levelOfSatisfactionIncrease);
    }

    findSameSubjectChoices(student, nameOfSubject) {

        return this.choicesList.filter((studentChoice) => {
            return studentChoice.choice.nameOfSubject === nameOfSubject && studentChoice.student === student;
        }).sort((a, b) => {
            return (a.choice.numberOfPoints - a.additionalPoints) < (b.choice.numberOfPoints - b.additionalPoints);
        }).map((studentChoice) => {
            return studentChoice.choice
        })
    }

    increaseNextStudentPreferenceValue(student, processedChoice) {
        let studentChoices = this.choicesList.filter((choice) => {
            return choice.student === student
        })
        studentChoices.sort((a, b) => {
            return (a.choice.numberOfPoints < b.choice.numberOfPoints)
        })
        const choiceIndex = studentChoices.findIndex((studentChoice) => {
            return studentChoice.choice === processedChoice
        })
        let nextIndex = choiceIndex + 1;
        while (nextIndex < student.choices.length) {
            let nextStudentChoice = studentChoices[nextIndex];
            if (this.choicesToIgnore.includes(nextStudentChoice.choice)) {
                nextIndex += 1
                this.logDebugMsg('Going to next choice, as ' + nextStudentChoice.choice.nameOfSubject + '|' + nextStudentChoice.choice.groupID + ' is on ignore list')
                continue
            }
            nextStudentChoice.choice.numberOfPoints += 20
            nextStudentChoice.additionalPoints += 20
            this.logDebugMsg('Increasing choice by ' + nextStudentChoice.additionalPoints + ': \n' + nextStudentChoice.choice)
            //Lower points choices will be ignored anyway
            this.choicesQueue.push(nextStudentChoice)
            return
        }
    }

    assignLeftovers() {

        const obligatorySubjects = this.subjects.map((subject) => {
            return subject.nameOfSubject
        })
        let groupsWithFreePlacesPerSubject = new Map();
        this.subjects.forEach((subject) => {
                const groupsWithFreePlacesSingleSubject = subject.groups.filter((group) => {
                    return group.numberOfPeople > 0
                })
                groupsWithFreePlacesPerSubject.set(subject.nameOfSubject, groupsWithFreePlacesSingleSubject)
            }
        );
        this.students.forEach((student) => {

            this.assignLeftoversForSingleStudent(student, obligatorySubjects, groupsWithFreePlacesPerSubject)
            for (let [subject, subjectGroupsWithFreePlaces] of groupsWithFreePlacesPerSubject) {
                groupsWithFreePlacesPerSubject.set(subject, subjectGroupsWithFreePlaces.filter((groupWithFreePlace) => {
                    return groupWithFreePlace.numberOfPeople > 0
                }))
            }


        })
    }

    assignLeftoversForSingleStudent(student, obligatorySubjects, groupsWithFreePlacesSingleSubject) {
        if (obligatorySubjects.length !== student.subjectsIds.length) {
            const studentAssignedSubjectsNames = student.subjectsIds.map((subjectsId) => {
                return subjectsId.nameOfSubject
            })
            let notAssignedSubjects = obligatorySubjects.filter((obligatorySubject) => {
                return !studentAssignedSubjectsNames.includes(obligatorySubject)
            })
            notAssignedSubjects.forEach((notAssignedSubject) => {
                let sameSubjectGroup = groupsWithFreePlacesSingleSubject.get(notAssignedSubject)[0]
                this.assignStudentToGroup(sameSubjectGroup, student, notAssignedSubject);
            })
        }
    }
}