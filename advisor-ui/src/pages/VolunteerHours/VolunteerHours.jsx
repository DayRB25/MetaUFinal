// css imports
import "./VolunteerHours.css";
// library imports
import { Link } from "react-router-dom";
import { useEffect, useContext, useState } from "react";
// component imports
import { UserContext } from "../../UserContext.js";
// mui imports
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
// utils imports
import { createDateFromTimeStamp } from "../../utils/dateTimeUtils.js";
import apiBase from "../../utils/apiBase.js";

export default function VolunteerHours() {
  // state to hold event data returned from api
  const [studentEvents, setStudentEvents] = useState([]);
  // contains current user's info
  const { user } = useContext(UserContext);

  // general isLoading state to control display of progress spinner/content
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudentEvents = async () => {
    try {
      setIsLoading(true);
      const res = await apiBase.get(`/student-event/${user.id}`, {
        params: { studentId: user.id },
      });
      const fetchedStudentEvents = res.data.studentEvents;
      setStudentEvents(fetchedStudentEvents);
    } catch (error) {
      alert("Something went wrong!");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudentEvents();
  }, []);

  // function to delete student events from state array
  const deleteStudentEventFromState = (id) => {
    const filteredEvents = studentEvents.filter(
      (studentEvent) => studentEvent.id !== id
    );
    setStudentEvents(filteredEvents);
  };

  const deleteStudentEventFromDB = async (id) => {
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

  // handler function for deleting student events
  // attempt to delete record from DB first, upon
  // successful delete, the state is deleted from local state
  const handleDeleteStudentEvent = async (id) => {
    // step 1 delete DB record
    const successfulDelete = await deleteStudentEventFromDB(id);
    // step 2 delete from local state copy
    if (successfulDelete) {
      deleteStudentEventFromState(id);
    }
  };

  const studentEventRows = studentEvents.map((studentEvent) => {
    const eventDetails = studentEvent.EventDetail;
    const hours = studentEvent.hours;
    return (
      <TableRow key={studentEvent.id}>
        <TableCell>{eventDetails.title}</TableCell>
        <TableCell align="right">
          {createDateFromTimeStamp(eventDetails.date)}
        </TableCell>
        <TableCell align="right">{`${eventDetails.city}, ${eventDetails.state}`}</TableCell>
        <TableCell align="right">{`${eventDetails.admin_firstname} ${eventDetails.admin_lastname}`}</TableCell>
        <TableCell align="right">{hours}</TableCell>
        <TableCell align="right">
          <IconButton onClick={() => handleDeleteStudentEvent(studentEvent.id)}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <div className="volunteer-hours">
      <div className="content">
        <Link to="/student/volunteer">
          <ArrowBackIcon className="back" />
        </Link>
        <div className="table">
          <h3>Your Volunteer History:</h3>
          {!isLoading && (
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Date</TableCell>
                    <TableCell align="right">Location</TableCell>
                    <TableCell align="right">Admin</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{studentEventRows}</TableBody>
              </Table>
            </TableContainer>
          )}
          {isLoading && <CircularProgress />}
        </div>
      </div>
    </div>
  );
}
