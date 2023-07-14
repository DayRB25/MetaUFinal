import { Student } from "./student.js";
import { EventDetails } from "./event.js";
import { StudentEvent } from "./studentevent.js";

EventDetails.belongsToMany(Student, {
  through: StudentEvent,
});
Student.belongsToMany(EventDetails, {
  through: StudentEvent,
});

export { Student, EventDetails, StudentEvent };
