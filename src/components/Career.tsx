import { useEffect, useState } from "react";
import "./styles/Career.css";

interface CareerData {
  role: string;
  company: string;
  companyUrl: string;
  year: string;
  achievements: string[];
}

const Career = () => {
  const [experiences, setExperiences] = useState<CareerData[]>([]);

  useEffect(() => {
    fetch('/data/career.json')
      .then(response => response.json())
      .then(data => setExperiences(data.experiences));
  }, []);

  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {experiences.map((exp, index) => (
            <div className="career-info-box" key={index}>
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{exp.role}</h4>
                  <h5>{exp.company}</h5>
                </div>
                <h3>{exp.year}</h3>
              </div>
              <p>{exp.achievements[0]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
