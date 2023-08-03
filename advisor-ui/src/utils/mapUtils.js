import apiBase from "./apiBase";

const fetchMap = async (setMapIsLoading, setImgData, latitude, longitude) => {
  try {
    setMapIsLoading(true);
    const res = await apiBase.get(`/maps/${latitude}/${longitude}`);
    setImgData(res.data.response);
  } catch (error) {
    alert("Something went wrong.");
  }
  setMapIsLoading(false);
};

export { fetchMap };
