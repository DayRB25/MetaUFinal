import { Student } from "./student.js";
import { EventDetail } from "./event.js";
import { StudentEvent } from "./studentevent.js";

StudentEvent.belongsTo(Student);
StudentEvent.belongsTo(EventDetail);

export { Student, EventDetail, StudentEvent };
