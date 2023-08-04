// mui imports
import { CircularProgress } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

function GraduationProgressSpinner({ value }) {
  return (
    <div
      className="grad-progress-spinner"
      style={{ position: "relative", display: "inline-block" }}
    >
      <div
        className="content"
        style={{
          width: "100px",
          height: "100px",
          padding: "20px",
        }}
      >
        <SchoolIcon style={{ fontSize: "48px" }} />
      </div>
      <CircularProgress
        size={120}
        variant="determinate"
        value={value}
        style={{
          position: "absolute",
          top: "-15px",
          left: "-15px",
          zIndex: "10",
        }}
      />
      <CircularProgress
        size={120}
        variant="determinate"
        value={100}
        style={{
          color: "lightgray",
          position: "absolute",
          top: "-15px",
          left: "-15px",
          zIndex: "0",
        }}
      />
    </div>
  );
}

export default GraduationProgressSpinner;
