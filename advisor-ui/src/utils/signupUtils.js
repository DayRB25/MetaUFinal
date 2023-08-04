import apiBase from "./apiBase";
const createStudentAccount = async (
  firstname,
  lastname,
  username,
  password,
  email,
  year,
  city,
  state,
  address,
  updateUser,
  navigate
) => {
  const body = {
    firstname,
    lastname,
    username,
    password,
    email,
    year,
    city,
    state,
    address,
  };
  try {
    const res = await apiBase.post("/student/create", body);
    const newStudent = res.data.user;
    updateUser(newStudent);
    // navigate to landing page
    navigate("/student/landing");
  } catch (err) {
    const statusCodeLength = 3;
    // network status code is the last 3 chars in error message, extract
    if (err.message.slice(-statusCodeLength) === "400") {
      alert("Username or email taken.");
      return;
    } else {
      alert("Something went wrong. Try again later.");
    }
  }
};

export { createStudentAccount };
