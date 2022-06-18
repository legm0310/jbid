import React from 'react';
import {
  CircularProgressbarWithChildren,
  CircularProgressbar,
  buildStyles
} from 'react-circular-progressbar';
import { easeQuadInOut } from "d3-ease";
import AnimatedProgressProvider from "./AnimatedProgressProvider";

const percentage = 66;

export const Loading = () => {


  <div style={{ padding: "40px 40px 40px 40px" }}>
    <h1>react-circular-progressbar examples</h1>
    <p>
      <a href="https://github.com/kevinsqi/react-circular-progressbar">
        <strong>View Github docs</strong>
      </a>
    </p>
  <Example label="Fully controlled text animation using react-move">
    <AnimatedProgressProvider
      valueStart={0}
      valueEnd={66}
      duration={1.4}
      easingFunction={easeQuadInOut}
      repeat
    >
      {value => {
        const roundedValue = Math.round(value);
        return (
          <CircularProgressbar
            value={value}
            text={`${roundedValue}%`}
            /* This is important to include, because if you're fully managing the
      animation yourself, you'll want to disable the CSS animation. */
            styles={buildStyles({ pathTransition: "none" })}
          />
        );
      }}
    </AnimatedProgressProvider>
    </Example>
  </div>
};

function Example(props) {
  return (
    <div style={{ marginBottom: 80 }}>
      <hr style={{ border: "2px solid #ddd" }} />
      <div style={{ marginTop: 30, display: "flex" }}>
        <div style={{ width: "20%", paddingRight: 30 }}>{props.children}</div>
        <div style={{ width: "60%" }}>
          <h3 className="h5">{props.label}</h3>
          <p>{props.description}</p>
        </div>
      </div>
    </div>
  );
}

export default Loading;
