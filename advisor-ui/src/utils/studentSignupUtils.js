import axios from "axios";

const createStudentSignup = async (studentId, eventDetailId) => {
  const body = {
    studentId,
    eventDetailId,
  };
  try {
    const res = await axios.post(
      "http://localhost:5000/api/student-signup/create",
      body
    );
    alert("You signed up successfully!");
  } catch (error) {
    // handle student already signedup
    const statusCodeLength = 3;
    // network status code is the last 3 chars in error message, extract
    if (error.message.slice(-statusCodeLength) === "403") {
      alert("You are already signed up for this event.");
    } else {
      alert("Could not add event. Try later.");
    }
  }
};

export { createStudentSignup };
