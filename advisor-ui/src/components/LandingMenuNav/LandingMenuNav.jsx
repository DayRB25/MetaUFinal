// css imports
import "./LandingMenuNav.css";

export default function LandingMenuNav({ text, img }) {
  return (
    <div className="landing-menu-nav">
      <div className="content">
        <img src={img} alt="nav description" />
        <div id="text">
          <h3>{text}</h3>
        </div>
      </div>
    </div>
  );
}
