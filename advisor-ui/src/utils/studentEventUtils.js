import axios from "axios";

const createStudentEvent = async (studentId, eventDetailId, hours) => {
  const body = {
    studentId,
    eventDetailId,
    hours: parseInt(hours),
  };
  try {
    const res = await axios.post(
      "http://localhost:5000/api/student-event/create",
      body
    );
  } catch (error) {
    alert("Could not add event. Try later.");
  }
};

export { createStudentEvent };
