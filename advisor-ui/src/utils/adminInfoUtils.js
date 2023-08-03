import apiBase from "./apiBase";

const fetchAdminInfo = async (setAdminInfoIsLoading, setAdminInfo, AdminId) => {
  try {
    setAdminInfoIsLoading(true);
    const res = await apiBase.get(`/admin/${AdminId}`);
    setAdminInfo(res.data.admin);
  } catch (error) {
    alert("Something went wrong!");
  }
  setAdminInfoIsLoading(false);
};

export { fetchAdminInfo };
