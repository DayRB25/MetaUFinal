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

  return (
    <div className="volunteer-hours">
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
        </Table>
      </TableContainer>
    </div>
  );
}
