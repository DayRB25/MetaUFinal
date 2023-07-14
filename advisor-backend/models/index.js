import { Student } from "./student.js";
import { EventDetails } from "./event.js";
import { StudentEvent } from "./studentevent.js";

StudentEvent.belongsTo(Student);
StudentEvent.belongsTo(EventDetails);

export { Student, EventDetails, StudentEvent };
