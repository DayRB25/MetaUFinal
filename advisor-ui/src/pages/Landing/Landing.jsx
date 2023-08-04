// css imports
import "./Landing.css";
// component imports
import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";

export default function Landing() {
  return (
    <div className="landing">
      <Navbar />
      <Hero />
    </div>
  );
}
