import React, { useEffect, useContext, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import axios from "axios";
import { UserContext } from "../../UserContext.js";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link } from "react-router-dom";

export default function VolunteerHours() {
  const [studentEvents, setStudentEvents] = useState([]);
  const { user } = useContext(UserContext);

  const fetchStudentEvents = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/student-event/${user.id}`,
        { params: { studentId: user.id } }
      );
      const fetchedStudentEvents = res.data.studentEvents;
      setStudentEvents(fetchedStudentEvents);
    } catch (error) {
      alert("Something went wrong!");
    }
  };

  useEffect(() => {
    fetchStudentEvents();
  }, []);

  const deleteStudentEventFromState = (id) => {
    const filteredEvents = studentEvents.filter(
      (studentEvent) => studentEvent.id !== id
    );
    setStudentEvents(filteredEvents);
  };

  const deleteStudentEventFromDB = async (id) => {
    try {
      const res = axios.delete(
        `http://localhost:5000/api/student-event/${id}`,
        { params: { studentEventId: id } }
      );
      return true;
    } catch (error) {
      alert("Unable to delete. Try again later.");
      return false;
    }
  };

  const handleDeleteStudentEvent = async (id) => {
    // step 1 delete DB record
    const successfulDelete = await deleteStudentEventFromDB(id);
    // step 2 delete from local state copy
    if (successfulDelete) {
      deleteStudentEventFromState(id);
    }
  };

  const createDateFromTimeStamp = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
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
        <TableCell align="right">{eventDetails.admin}</TableCell>
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
        </div>
      </div>
    </div>
  );
}
