import apiBase from "./apiBase";

const generateNewSchedule = async (
  preferredCourses,
  gradYear,
  SchoolId,
  userId,
  setScheduleIsLoading,
  setSchedule,
  setScheduleAdjList
) => {
  const body = {
    SchoolId,
    StudentId: userId,
    preferredCourses,
    gradYear,
  };
  try {
    setScheduleIsLoading(true);
    const res = await apiBase.post("/schedule/create", body);
    setScheduleIsLoading(false);
    if (res.data.schedule === undefined || res.data.schedule === null) {
      alert("Schedule not possible. Enter new constraints.");
      return;
    }
    setSchedule(res.data.schedule);
    setScheduleAdjList(res.data.finalScheduleAdjList);
  } catch (error) {
    alert("Something went wrong");
  }
  setScheduleIsLoading(false);
};

export { generateNewSchedule };
