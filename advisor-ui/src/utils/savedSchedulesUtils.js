import apiBase from "./apiBase";

const createSaveScheduleRecord = async (
  userId,
  schedule,
  setScheduleIsLoading
) => {
  const body = {
    StudentId: userId,
    schedule,
  };
  try {
    setScheduleIsLoading(true);
    const res = await apiBase.post("/save-schedule/create", body);
    alert("Save successful!");
  } catch (error) {
    alert("Something went wrong.");
  }
  setScheduleIsLoading(false);
};

const fetchSchedulesByPage = async (
  page,
  setIsLoading,
  setSchedules,
  userId
) => {
  try {
    setIsLoading(true);
    const res = await apiBase.get(`/save-schedule/${userId}/${page}`);
    setSchedules(res.data.schedules);
  } catch (error) {
    alert("Something went wrong here.");
  }
  setIsLoading(false);
};

const fetchPageCount = async (userId, setPageCount) => {
  try {
    const res = await apiBase.get(`/save-schedule/${userId}/page-count`);
    const pageCount = res.data.pageCount;
    setPageCount(pageCount);
  } catch (error) {
    alert("Something went wrong. Try again later.");
  }
};

export { fetchSchedulesByPage, fetchPageCount, createSaveScheduleRecord };
