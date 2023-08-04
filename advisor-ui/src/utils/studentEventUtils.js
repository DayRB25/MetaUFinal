import apiBase from "./apiBase";

const createStudentEvent = async (studentId, eventDetailId, hours) => {
  const body = {
    studentId,
    eventDetailId,
    hours: parseInt(hours),
  };
  try {
    const res = await apiBase.post("/student-event/create", body);
  } catch (error) {
    alert("Could not add event. Try later.");
  }
};

const fetchStudentEvents = async (setIsLoading, userId, setStudentEvents) => {
  try {
    setIsLoading(true);
    const res = await apiBase.get(`/student-event/${userId}`, {
      params: { studentId: userId },
    });
    const fetchedStudentEvents = res.data.studentEvents;
    setStudentEvents(fetchedStudentEvents);
  } catch (error) {
    alert("Something went wrong!");
  }
  setIsLoading(false);
};

const deleteStudentEventFromDB = async (id, setIsLoading) => {
  try {
    setIsLoading(true);
    const res = apiBase.delete(`/student-event/${id}`, {
      params: { studentEventId: id },
    });
    setIsLoading(false);
    return true;
  } catch (error) {
    alert("Unable to delete. Try again later.");
    setIsLoading(false);
    return false;
  }
};

export { createStudentEvent, fetchStudentEvents, deleteStudentEventFromDB };
