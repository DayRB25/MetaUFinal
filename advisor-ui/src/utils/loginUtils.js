import apiBase from "./apiBase";
const loginToAccount = async (username, password, updateUser, navigate) => {
  try {
    const body = { username, password };
    const res = await apiBase.post("/student/login", body);
    const newStudent = res.data.student;
    updateUser(newStudent);
    navigate("/student/landing");
  } catch (err) {
    alert("Something went wrong. Try again.");
  }
};

export { loginToAccount };
