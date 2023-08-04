// css imports
import "./Progress.css";
// library imports
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
// component imports
import { UserContext } from "../../UserContext";
import ClassProgressCard from "../../components/ClassProgressCard/ClassProgressCard";
// mui imorts
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GraduationProgressSpinner from "../../components/GraduationSpinner/GraduationSpinner";
import { CircularProgress } from "@mui/material";
// utils imports
import apiBase from "../../utils/apiBase";

export default function Progress() {
  // state tracking the number of grad requirement classes a student has taken
  const [takenCount, setTakenCount] = useState(-1);
  // state tracking the number fo grad requirement classes a student needs to graduate
  const [requiredCount, setRequiredCount] = useState(-1);
  // state to store courseInformation returned from endpoint
  const [courseProgressList, setCourseProgressList] = useState([]);
  // is loading state to control display of progress spinner and content
  const [isLoading, setIsLoading] = useState(false);
  // contains info about the user
  const { user } = useContext(UserContext);

  const fetchCompletionInfo = async () => {
    const body = {
      SchoolId: user.SchoolId,
      StudentId: user.id,
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
        {!isLoading && (
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
        )}
        {!isLoading && <div className="grid">{requiredClassesDisplay}</div>}
        {isLoading && <CircularProgress />}
      </div>
    </div>
  );
}
