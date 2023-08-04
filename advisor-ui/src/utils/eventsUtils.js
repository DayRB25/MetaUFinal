import apiBase from "./apiBase";

const fetchRecommendedEvents = async (
  startTime,
  endTime,
  startDate,
  endDate,
  distance,
  timeCommitment,
  setRecommendIsLoading,
  userId,
  setRecommendedEvents
) => {
  try {
    setRecommendIsLoading(true);
    const res = await apiBase.get(
      `/events/recommended/${userId}?distance=${distance}&start_date=${startDate}&end_date=${endDate}&start_time=${startTime}&end_time=${endTime}&time_commitment=${timeCommitment}`,
      { params: { studentId: userId } }
    );
    const fetchedRecommendedEvents = res.data.events;
    setRecommendedEvents(fetchedRecommendedEvents);
  } catch (err) {
    alert("Something went wrong. Try again later.");
  }
  setRecommendIsLoading(false);
};

const fetchEventsByPage = async (page, setExploreIsLoading, setEvents) => {
  try {
    setExploreIsLoading(true);
    const res = await apiBase.get(`/events/page/${page}`);
    const fetchedEvents = res.data.events;
    setEvents(fetchedEvents);
  } catch (error) {
    alert("Something went wrong. Try again later.");
  }
  setExploreIsLoading(false);
};

const fetchPageCount = async (setPageCount) => {
  try {
    const res = await apiBase.get("/events/page-count");
    const pageCount = res.data.pageCount;
    setPageCount(pageCount);
  } catch (error) {
    alert("Something went wrong. Try again later.");
  }
};

export { fetchEventsByPage, fetchPageCount, fetchRecommendedEvents };
