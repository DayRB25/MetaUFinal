import dayjs from "dayjs";

const createDateFromTimeStamp = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  // Format the date to YYYY-MM-DD
  return dayjs(date).format("YYYY-MM-DD");
};

const formatTime = (time) => {
  // Format the time to HH:MM:SS
  return dayjs(time).format("HH:mm:ss");
};

export { createDateFromTimeStamp, formatDate, formatTime };
