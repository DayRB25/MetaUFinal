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
import { fetchCompletionInfo } from "../../utils/gradProgressUtils";

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

  // hanlder function for fetching completion info
  const handleFetchCompletionInfo = async () => {
    await fetchCompletionInfo(
      user.SchoolId,
      user.id,
      setIsLoading,
      setTakenCount,
      setRequiredCount,
      setCourseProgressList
    );
  };

  useEffect(() => {
    handleFetchCompletionInfo();
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
                <h2>{`You are ${Math.round(
                  (takenCount / requiredCount) * 100
                )}% complete!`}</h2>
              )}
              {takenCount !== -1 && requiredCount !== -1 && (
                <h4>{`You have ${
                  requiredCount - takenCount
                } classes left until graduation!`}</h4>
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
