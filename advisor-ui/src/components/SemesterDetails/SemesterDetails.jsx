// css imports
import "./SemesterDetails.css";
// component imports
import ClassDetails from "../ClassDetails/ClassDetails";

export default function SemesterDetails({
  semester,
  displayYear,
  handleOpenModal,
}) {
  const classItems = semester.classes.map((classItem, index) => (
    <ClassDetails
      key={index}
      classItem={classItem}
      displayYear={displayYear}
      handleOpenModal={handleOpenModal}
    />
  ));
  return (
    <div className="semester-details">
      <h5>{`Semester: ${semester.number}`}</h5>
      <div className="content">{classItems}</div>
    </div>
  );
}
