import { Student } from "./student.js";
import { EventDetail } from "./event.js";
import { StudentEvent } from "./studentevent.js";
import { StudentSignup } from "./studentsignup.js";
import { School } from "./school.js";
import { Class } from "./class.js";
import { RequiredClass } from "./requiredclass.js";
import { Prerequisite } from "./prerequisite.js";
import { TakenClass } from "./takenclass.js";

Prerequisite.belongsTo(Class, { foreignKey: "PostreqId" });
Prerequisite.belongsTo(Class, { foreignKey: "PrereqId" });

TakenClass.belongsTo(Student);
TakenClass.belongsTo(Class);

Class.belongsTo(School);
RequiredClass.belongsTo(School);

Student.belongsTo(School);

StudentEvent.belongsTo(Student);
StudentEvent.belongsTo(EventDetail);

StudentSignup.belongsTo(Student);
StudentSignup.belongsTo(EventDetail);

export {
  Student,
  EventDetail,
  StudentEvent,
  StudentSignup,
  Prerequisite,
  TakenClass,
  Class,
  RequiredClass,
  School,
};
