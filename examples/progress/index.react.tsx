import "./style.css";
import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";

export default function Example() {
  // State to track the progress value, starting at 30%
  const [progress, setProgress] = useState(30);

  // Automatically increase progress every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // If progress reaches 100%, reset to 10%, otherwise increase by 10%
      setProgress((p) => (p >= 100 ? 10 : p + 10));
    }, 5000); // ⏳ Update every 5 seconds

    return () => clearInterval(interval); // Cleanup interval when unmounted
  }, []);

  return (
    <div className="progress-container">
      {/* Dynamically update progress label */}
      <Ariakit.ProgressLabel
        text={`Uploading: ${progress}% complete`}
        className="progress-label"
      />

      {/* Progress bar component */}
      <Ariakit.ProgressRoot
        value={progress}
        min={0}
        max={100}
        label="Upload progress"
        className="progress-root"
      >
        <Ariakit.ProgressTrack className="progress-track">
          <Ariakit.ProgressIndicator
            value={progress}
            min={0}
            max={100}
            className="progress-indicator"
            style={{ width: `${progress}%` }} // Ensure width updates dynamically
          />
        </Ariakit.ProgressTrack>
      </Ariakit.ProgressRoot>
    </div>
  );
}
