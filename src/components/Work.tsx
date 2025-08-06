import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const Work = () => {
  function setTranslateX() {
    let translateX: number = 0;
    const box = document.getElementsByClassName("work-box");
    const rectLeft = document.querySelector(".work-container")!.getBoundingClientRect().left;
    const rect = box[0].getBoundingClientRect();
    const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
    let padding: number = parseInt(window.getComputedStyle(box[0]).padding) / 2;
    return translateX = rect.width * box.length - (rectLeft + parentWidth) + padding,
      translateX
  }
  return useGSAP(() => {
    let r = setTranslateX();
    function t() {
      let i = null;
      i && clearTimeout(i),
        i = setTimeout(() => {
          r = setTranslateX()
        }
          , 200)
    }

    return gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: "+=1500",
        scrub: .5,
        pinSpacing: !0,
        pin: !0,
        pinType: ScrollTrigger.isTouch ? "fixed" : "transform",
        id: "work"
      }
    }).to(".work-flex", {
      x: -r,
      duration: 500,
      delay: .2
    }),
      window.addEventListener("resize", t),
      () => {
        window.removeEventListener("resize", t)
      }
  }
    , []),
    <div className="work-section" id="work">
      <div className="work-container section-container">,
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {
            <div className="work-box" key={1}>
              <div className="work-info">
                <div className="work-title">
                  <h3>1</h3>

                  <div>
                    <h4>OculAR - Drive AR Cars</h4>
                    <p>AR App</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>Unity, TypeScript, React, Threejs</p>
              </div>
              <WorkImage image="/images/nextBL.webp" alt="" />
            </div>
          }
          {
            <div className="work-box" key={2}>
              <div className="work-info">
                <div className="work-title">
                  <h3>2</h3>

                  <div>
                    <h4>Project Name</h4>
                    <p>Category</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>Javascript, TypeScript, React, Threejs</p>
              </div>
              <WorkImage image="/images/nextBL.webp" alt="" />
            </div>
          }
          {
            <div className="work-box" key={3}>
              <div className="work-info">
                <div className="work-title">
                  <h3>3</h3>

                  <div>
                    <h4>Project Name</h4>
                    <p>Category</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>Javascript, TypeScript, React, Threejs</p>
              </div>
              <WorkImage image="/images/nextBL.webp" alt="" />
            </div>
          }
          {
            <div className="work-box" key={4}>
              <div className="work-info">
                <div className="work-title">
                  <h3>4</h3>

                  <div>
                    <h4>Project Name</h4>
                    <p>Category</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>Javascript, TypeScript, React, Threejs</p>
              </div>
              <WorkImage image="/images/nextBL.webp" alt="" />
            </div>
          }
        </div>
      </div>
    </div>
};

export default Work;
