'use strict'
const TinyQueue = require('tinyqueue');
const TimeController = require("../backend/TimeController");

class StudentChoice {
    constructor(student, choice) {
        this.student = student;
        this.choice = choice;
        this.additionalPoints = 0;
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
            return (b.choice.numberOfPoints + b.additionalPoints) - (a.choice.numberOfPoints + a.additionalPoints);
        });
        this.subjects = subjects;
        this.students = students;
        this.choicesToIgnore = [];
        this.shouldOutputDebugInfo = false;
        this.timeController = new TimeController(this.shouldOutputDebugInfo);
        this.orderedAssignments = []
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
        this.logDebugMsg("Before leftovers!")
        this.debugShowGroups();
        this.assignLeftovers();
        this.debugShowGroups();
    }

    logDebugMsg(debugMsg) {
        if (this.shouldOutputDebugInfo) {
            console.log(debugMsg)
        }

    }

    processSingleChoice(studentChoice) {
        const studentAssignment = this.tryToAssignStudentByChoice(studentChoice)
        if (studentAssignment) {
            let choicesForSameSubject = this.findSameSubjectChoices(studentAssignment.student, studentAssignment.choice.nameOfSubject);
            this.calculateLevelOfSatisfaction(studentAssignment, choicesForSameSubject);
            this.logDebugMsg('Make ignore ' + studentAssignment.student.name + '|' + studentAssignment.choice.nameOfSubject);
            this.choicesToIgnore.push(...choicesForSameSubject)
        } else {
            this.increaseNextStudentPreferenceValue(studentChoice.student, studentChoice.choice);
            this.logDebugMsg('Make ignore ' + studentChoice.student.name + '|' + studentChoice.choice.nameOfSubject + '|' + studentChoice.choice.groupID);
            this.choicesToIgnore.push(studentChoice.choice)

        }
    }

    tryToAssignStudentByChoice(studentChoice) {
        const associatedGroup = this.findAssociatedGroup(studentChoice.choice.nameOfSubject, studentChoice.choice.groupID)
        this.logDebugMsg('Associated group: \n' + associatedGroup);
        if (associatedGroup.numberOfPeople === 0) {
            this.logDebugMsg('!! Not assigned !!');
            return null;
        }
        const isStudentTimeAvailable = this.timeController.bookStudentTimeForGroup(studentChoice.student.name, associatedGroup);
        if (isStudentTimeAvailable) {
            this.assignStudentToGroup(associatedGroup, studentChoice.student, studentChoice.choice.nameOfSubject);
            this.logDebugMsg('!! Assigned !!');
            return studentChoice;
        } else {
            let sameSubjectChoices = this.findSameSubjectChoices(studentChoice.student, studentChoice.choice.nameOfSubject).filter((choice) => {
                return choice !== studentChoice.choice;
            });
            if (sameSubjectChoices.length) {
                for (let sameSubjectChoice of sameSubjectChoices) {
                    this.logDebugMsg('Trying other same subject choice' + studentChoice.choice.nameOfSubject + '|' + studentChoice.choice.groupID);
                    const associatedGroupL = this.findAssociatedGroup(sameSubjectChoice.nameOfSubject, sameSubjectChoice.groupID)
                    const isStudentTimeAvailableL = this.timeController.bookStudentTimeForGroup(studentChoice.student.name, associatedGroupL);
                    if (isStudentTimeAvailableL) {
                        this.assignStudentToGroup(associatedGroupL, studentChoice.student, sameSubjectChoice.nameOfSubject);
                        this.logDebugMsg('!! Assigned !!');
                        return new StudentChoice(studentChoice.student, sameSubjectChoice);
                    }
                }
            }
            // czy sa miejsca w innych przdmiotach z grupy
            //swapowanko!
        }
        this.logDebugMsg('!! Not assigned !!');
        return null;
    }

    assignStudentToGroup(associatedGroup, student, nameOfSubject) {
        associatedGroup.numberOfPeople -= 1;
        const assignment = {
            'nameOfSubject': nameOfSubject,
            'groupID': associatedGroup.groupID
        }
        student.subjectsIds.push(assignment)
        this.orderedAssignments.push([student, assignment])
    }

    findAssociatedGroup(nameOfSubject, groupID) {
        let associatedSubject = this.subjects.find((subject) => subject.nameOfSubject === nameOfSubject);
        return associatedSubject.groups[groupID - 1]
    }

    calculateLevelOfSatisfaction(studentChoice, choicesForSameSubject) {


        let student = studentChoice.student;
        let numberOfPoints = studentChoice.choice.numberOfPoints;

        let studentChoiceIndex = choicesForSameSubject.findIndex((choice) => {
            return choice.numberOfPoints === numberOfPoints;
        });

        let totalNumberOfPointsPerSubject = 0;
        choicesForSameSubject.forEach((choiceForSameSubject) => totalNumberOfPointsPerSubject += choiceForSameSubject.numberOfPoints);

        const satisfactionRatio = totalNumberOfPointsPerSubject / 100;

        let levelOfSatisfactionIncrease = 0;
        switch (studentChoiceIndex) {
            case 0:
                levelOfSatisfactionIncrease += 100;
                break;
            case 1:
                levelOfSatisfactionIncrease += 50;
                break;
            case 2:
                levelOfSatisfactionIncrease += 20;
                break;
            default:
                levelOfSatisfactionIncrease += 10;
        }
        student.levelOfSatisfaction += (satisfactionRatio * levelOfSatisfactionIncrease);
    }

    findSameSubjectChoices(student, nameOfSubject) {

        return this.choicesList.filter((studentChoice) => {
            return studentChoice.choice.nameOfSubject === nameOfSubject && studentChoice.student === student;
        }).sort((a, b) => {
            return a.choice.numberOfPoints < b.choice.numberOfPoints;
        }).map((studentChoice) => {
            return studentChoice.choice
        })
    }

    increaseNextStudentPreferenceValue(student, processedChoice) {
        let studentChoices = this.choicesList.filter((choice) => {
            return choice.student === student
        })
        studentChoices.sort((a, b) => {
            return (a.choice.numberOfPoints + a.additionalPoints) < (b.choice.numberOfPoints + b.additionalPoints)
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

    assignToFirstFreeGroup(student, subject, groups) {
        for (let sameSubjectGroup of groups) {
            if (this.timeController.bookStudentTimeForGroup(student.name, sameSubjectGroup)) {
                this.assignStudentToGroup(sameSubjectGroup, student, subject);
                return true;
            }
        }
        return false
    }

    assignLeftoversForSingleStudent(student, obligatorySubjects, groupsWithFreePlacesPerSubject) {
        if (obligatorySubjects.length !== student.subjectsIds.length) {
            this.logDebugMsg("Leftovers for " + student.name);
            const studentAssignedSubjectsNames = student.subjectsIds.map((subjectsId) => {
                return subjectsId.nameOfSubject
            });
            let notAssignedSubjectsStr = obligatorySubjects.filter((obligatorySubject) => {
                return !studentAssignedSubjectsNames.includes(obligatorySubject)
            });
            notAssignedSubjectsStr.forEach((notAssignedSubjectStr) => {
                this.logDebugMsg('Subject: ' + notAssignedSubjectStr);
                const freeGroups = groupsWithFreePlacesPerSubject.get(notAssignedSubjectStr)
                const isAssigned = this.assignToFirstFreeGroup(student, notAssignedSubjectStr, freeGroups)
                if (!isAssigned) {
                    this.logDebugMsg(' --- Backoff activated --- ')
                    // All groups are taken, try to back-off
                    for (let i = this.orderedAssignments.length - 1; i >= 0; --i) {
                        const assignment = this.orderedAssignments[i][1];
                        if (assignment.nameOfSubject !== notAssignedSubjectStr) {
                            continue;
                        }
                        let associatedStudent = this.orderedAssignments[i][0];
                        this.logDebugMsg('  Trying to reverse last choice of ' + associatedStudent.name + '|' + assignment.nameOfSubject + '->' + assignment.groupID)
                        const isAssigned = this.assignToFirstFreeGroup(associatedStudent, notAssignedSubjectStr, freeGroups)
                        if (isAssigned) {
                            let associatedGroup = this.findAssociatedGroup(assignment.nameOfSubject, assignment.groupID)
                            this.removeAssignment(associatedStudent, assignment, associatedGroup);
                            this.assignStudentToGroup(associatedGroup, student, assignment.nameOfSubject)
                        }
                    }
                }

            })
        }
    }

    debugShowGroups() {
        if (!this.shouldOutputDebugInfo) {
            return;
        }
        console.log(" --------------------------- ");
        console.log("Groups overview");
        this.subjects.forEach((subject) => {
            console.log("Subject: " + subject.nameOfSubject);
            subject.groups.forEach((group) => {
                console.log(' id-' + group.groupID + '|' + group.numberOfPeople)
            })
        });
    }

    removeAssignment(associatedStudent, assignment, group) {
        let ar = associatedStudent.subjectsIds;
        ar.splice(ar.findIndex((id) => {
            return id.nameOfSubject === assignment.nameOfSubject && id.groupID === assignment.groupID
        }), 1);
        group.numberOfPeople += 1;
        console.log(associatedStudent)
    }
}