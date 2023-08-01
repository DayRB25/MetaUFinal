import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../UserContext";
import ClassProgressCard from "../../components/ClassProgressCard/ClassProgressCard";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GraduationProgressSpinner from "../../components/GraduationSpinner/GraduationSpinner";
import "./Progress.css";

export default function Progress() {
  const [takenCount, setTakenCount] = useState(-1);
  const [requiredCount, setRequiredCount] = useState(-1);
  const [courseProgressList, setCourseProgressList] = useState([]);
  const { user } = useContext(UserContext);

  const fetchCompletionInfo = async () => {
    const body = {
      SchoolId: user.SchoolId,
      StudentId: user.id,
    };
    try {
      const res = await axios.post("http://localhost:5000/api/progress/", body);
      setTakenCount(res.data.takenClassesCount);
      setRequiredCount(res.data.requiredClassesCount);
      setCourseProgressList(res.data.currentAcademicProgress);
    } catch (error) {
      alert("Something went wrong");
    }
  };

  useEffect(() => {
    fetchCompletionInfo();
  }, []);

  const requiredClassesDisplay = courseProgressList.map((classInfo, idx) => (
    <ClassProgressCard key={idx} classInfo={classInfo} />
  ));

  return (
    <div className="progress">
      <div className="content">
        <div className="back-container">
          <Link to="/student/landing">
            <ArrowBackIcon className="back" />
          </Link>
        </div>
        <div className="header">
          <GraduationProgressSpinner
            value={
              takenCount !== -1 && requiredCount !== -1
                ? Math.round((takenCount / requiredCount) * 100)
                : 0
            }
          />
          <div className="text">
            {takenCount !== -1 && requiredCount !== -1 && (
              <h1>{`You are ${Math.round(
                (takenCount / requiredCount) * 100
              )}% complete!`}</h1>
            )}
            {takenCount !== -1 && requiredCount !== -1 && (
              <h3>{`You have ${
                requiredCount - takenCount
              } classes left until graduation!`}</h3>
            )}
          </div>
        </div>
        <div className="grid">{requiredClassesDisplay}</div>
      </div>
    </div>
  );
}
