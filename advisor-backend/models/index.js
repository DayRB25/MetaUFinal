import { Student } from "./student.js";
import { EventDetail } from "./event.js";
import { StudentEvent } from "./studentevent.js";
import { StudentSignup } from "./studentsignup.js";

StudentEvent.belongsTo(Student);
StudentEvent.belongsTo(EventDetail);

StudentSignup.belongsTo(Student);
StudentSignup.belongsTo(EventDetail);

export { Student, EventDetail, StudentEvent, StudentSignup };
