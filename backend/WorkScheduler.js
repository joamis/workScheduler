const TinyQueue = require('tinyqueue');

class StudentChoice
{
    constructor(student, nameOfSubject, groupID, numberOfPoints)
    {
        this.student = student;
        this.nameOfSubject = nameOfSubject;
        this.groupID = groupID;
        this.numberOfPoints = numberOfPoints;
    }
}
module.exports = class WorkScheduler {
    constructor(subjects, students) {
        let choicesList = []
        students.forEach((student) => { student.choices.forEach( (studentChoice) => { choicesList.push(new StudentChoice(student, studentChoice.nameOfSubject, studentChoice.groupID, studentChoice.numberOfPoints)) } ) })
        this.choicesQueue = new TinyQueue(choicesList, function (a, b) {
            return a.numberOfPoints - b.numberOfPoints} );
        this.subjects = subjects
        this.students = students
    }

    calculateWorkSchedule() {
        while (this.choicesQueue.length) {
            this.processSingleChoice(this.choicesQueue.pop())
        }
    }

    processSingleChoice(studentChoice) {
        const isAssigned = this.tryToAssignStudentByChoice(studentChoice)
        if (isAssigned)
        {
            this.calculateLevelOfSatisfaction(studentChoice);
        }
    }

    tryToAssignStudentByChoice(studentChoice) {
        let associatedGroup = this.findAssociatedGroup(studentChoice.nameOfSubject, studentChoice.groupID)
        let numberOfVacationsLeft = associatedGroup.numberOfPeople
        if (numberOfVacationsLeft > 0)
        {
            numberOfVacationsLeft -= 1
            return true
        }
        else
        {
            return false
        }
    }

    findAssociatedGroup(nameOfSubject, groupID) {
        let associatedSubject = this.subjects.find((subject) => subject.nameOfSubject =  nameOfSubject)
        return associatedSubject.groups[groupID]
    }

    calculateLevelOfSatisfaction(studentChoice) {
        let student = studentChoice.student;
        let numberOfPoints = studentChoice.numberOfPoints;

        let choicesForSameSubject = student.choices.filter( (choice) => {
            return choice.nameOfSubject === studentChoice.nameOfSubject;
        }).sort((a,b) => {
            return (a.numberOfPoints < b.numberOfPoints)
        })

        if (numberOfPoints === choicesForSameSubject[0].numberOfPoints)
        {
            student.levelOfSatisfaction =+ 10;
        }
    }
}