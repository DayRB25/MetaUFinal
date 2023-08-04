import apiBase from "./apiBase";

const fetchCompletionInfo = async (
  SchoolId,
  userId,
  setIsLoading,
  setTakenCount,
  setRequiredCount,
  setCourseProgressList
) => {
  const body = {
    SchoolId: SchoolId,
    StudentId: userId,
  };
  try {
    setIsLoading(true);
    const res = await apiBase.post("/progress/", body);
    setTakenCount(res.data.takenClassesCount);
    setRequiredCount(res.data.requiredClassesCount);
    setCourseProgressList(res.data.currentAcademicProgress);
  } catch (error) {
    alert("Something went wrong");
  }
  setIsLoading(false);
};

export { fetchCompletionInfo };
