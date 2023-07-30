import React, { useEffect, useRef, useState } from "react";
import FeedSearch from "./components/FeedSearch/FeedSearch";

import ReactFullpage from "@fullpage/react-fullpage";

import * as handdetection from "@tensorflow-models/hand-pose-detection";

import * as tf from "@tensorflow/tfjs-core";

import "./styles.css";

import Webcam from "react-webcam";

const model = handdetection.SupportedModels.MediaPipeHands;

const detectorConfig: handdetection.MediaPipeHandsMediaPipeModelConfig = {
  runtime: "mediapipe", // or 'tfjs'
  // modelType: 'full',
  solutionPath: process.env.PUBLIC_URL + "/hands/",
};

const SEL = "custom-section";
const SECTION_SEL = `.${SEL}`;

// NOTE: if using fullpage extensions/plugins put them here and pass it as props.
const pluginWrapper = () => {
  /*
   * require('./fullpage.fadingEffect.min'); // Optional. Required when using the "fadingEffect" extension.
   */
};

const originalColors = ["#0c0c63"];

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

function App() {
  const webcamRef: any = useRef(null);
  const fullpageRef: any = useRef(null);

  const [response, setResponse] = useState({
    items: [],
  });

  let sectionsColor = [...originalColors];

  let onLeave = (origin: any, destination: any, direction: any) => {
    console.log("onLeave", { origin, destination, direction });
  };

  caches.keys().then((names) => {
    names.forEach((name) => {
      caches.delete(name);
    });
  });

  useEffect(() => {
    let detector: any = null;
    if (fullpageRef.current == null) return;
    if (webcamRef == null) return;

    let last_x = 0;
    let last_side = 0; // 0 left 1 right
    let last_time = 0;

    let func = async (): Promise<any> => {
      if (detector == null) {
        try {
          detector = await handdetection.createDetector(model, detectorConfig);
          console.log("model loaded");
        } catch (error) {
          console.log("load error");
          return func();
        }
      }

      const image_data = webcamRef?.current.getScreenshot();
      const estimationConfig = { flipHorizontal: true };
      var image = new Image();
      image.src = image_data;

      let hands = [];

      try {
        hands = await detector.estimateHands(image, estimationConfig);
      } catch (error) {
        console.log("detect error");
        detector.dispose();
        detector = null;
        return func();
      }

      if (hands.length == 0) return setTimeout(func, 50);

      let hand_score = hands[0].score;
      if (hand_score < 0.95) return setTimeout(func, 50);

      let kp = hands[0].keypoints;
      kp = kp.filter((val: any) => {
        return val["name"].endsWith("tip");
      });

      var x = 0;
      var y = 0;
      for (let i = 0; i < kp.length; i++) {
        x += kp[i].x;
        y += kp[i].y;
      }
      x = x / kp.length;
      y = y / kp.length;

      const left = 480;
      const right = 800;

      if (x > left && x < right) return setTimeout(func, 50);

      let now = Date.now();
      let diff = now - last_time;

      let det_diff = 800;

      let curr_side = 0;
      if (x >= right) curr_side = 1;

      if (diff < det_diff) {
        if (last_side != curr_side) {
          if (curr_side == 1) fullpageRef.current.fullpageApi.moveSlideLeft();
          else fullpageRef.current.fullpageApi.moveSlideRight();
          now = 0;
        }
      }

      console.log(x, y, diff, last_side, curr_side);

      last_x = x;
      last_time = now;
      last_side = curr_side;

      setTimeout(func, now == 0 ? det_diff : 50);
    }

    func();

    return () => {
      detector.dispose();
      detector = null;
      console.log("disposed");
    };
  }, [webcamRef]);

  const Menu = () => (
    <div
      className="menu"
      style={{
        position: "fixed",
        top: 0,
        zIndex: 100,
      }}
    ></div>
  );

  return (
    <div className="App">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />
      <FeedSearch
        setResponse={setResponse}
        url="https://www.mynet.com/haber/rss/sondakika"
      />
      <Menu />
      <ReactFullpage
        ref={fullpageRef}
        debug={false} /* Debug logging */
        credits={{ enabled: false }}
        pluginWrapper={pluginWrapper}
        licenseKey={""}
        navigation={false}
        sectionSelector={SECTION_SEL}
        onLeave={onLeave}
        sectionsColor={sectionsColor}
        render={({ state, fullpageApi }) => (
          <ReactFullpage.Wrapper>
            <div className={SEL}>
              {response && response.items ? (
                response.items.map((item: any, index: any) => (
                  <div key={index} className="slide">
                    <div className="news-content">
                      <h3>{item.title}</h3>
                      <h4>
                        {item.description}
                        <br></br>
                        <hr></hr>
                        {item.date}
                      </h4>
                    </div>
                  </div>
                ))
              ) : (
                <></>
              )}
            </div>
          </ReactFullpage.Wrapper>
        )}
      />
    </div>
  );

  // return (
  //   <>
  //     <header>
  //       <h1>RSS Reader</h1>
  //       <FeedSearch setResponse={setResponse} />
  //     </header>
  //     <main>
  //       {response && "error" in response && <h3 className="error">{response.error}</h3>}
  //       {response && "feed" in response && (
  //         <SortableList title={response.feed.title} feed={response.items} />
  //       )}
  //     </main>
  //   </>
  // );
}

export default App;
