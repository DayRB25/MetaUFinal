import { Student } from "./student.js";
import { EventDetail } from "./event.js";
import { StudentEvent } from "./studentevent.js";
import { StudentSignup } from "./studentsignup.js";
import { School } from "./school.js";
import { Class } from "./class.js";
import { RequiredClass } from "./requiredclass.js";
import { Prerequisite } from "./prerequisite.js";
import { TakenClass } from "./takenclass.js";
import { Admin } from "./admin.js";
import { Schedule } from "./schedule.js";
import { Year } from "./year.js";
import { Semester } from "./semester.js";
import { SemesterClass } from "./semesterclass.js";

Prerequisite.belongsTo(Class, { foreignKey: "PostreqId" });
Prerequisite.belongsTo(Class, { foreignKey: "PrereqId" });

TakenClass.belongsTo(Student);
TakenClass.belongsTo(Class);

Class.belongsTo(School);
RequiredClass.belongsTo(School);
RequiredClass.belongsTo(Class);

Student.belongsTo(School);

StudentEvent.belongsTo(Student);
StudentEvent.belongsTo(EventDetail);

StudentSignup.belongsTo(Student);
StudentSignup.belongsTo(EventDetail);

EventDetail.belongsTo(Admin);

Student.hasMany(Schedule);

SemesterClass.belongsTo(Class);
SemesterClass.belongsTo(Semester);

Schedule.hasMany(Year);
Year.hasMany(Semester);
Semester.hasMany(SemesterClass);

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
  Admin,
  Schedule,
  Year,
  Semester,
  SemesterClass,
};
