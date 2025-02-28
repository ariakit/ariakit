import "./style.css";
import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";

export default function ProgressExample() {
  const min = 0;
  const max = 100;
  const step = 10;
  const [progress, setProgress] = useState(40);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= max ? min : p + step));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="progress-container">
      <Ariakit.ProgressRoot
        value={progress}
        min={0}
        max={100}
        className="progress-root"
      >
        <div className="progress-header">
          <Ariakit.ProgressLabel className="progress-label">
            Uploading:
          </Ariakit.ProgressLabel>
          <Ariakit.ProgressValue value={progress} className="progress-value">
            {progress}%
          </Ariakit.ProgressValue>
        </div>
        <Ariakit.ProgressTrack className="progress-track">
          <Ariakit.ProgressIndicator
            value={progress}
            min={0}
            max={100}
            className="progress-indicator"
          />
        </Ariakit.ProgressTrack>
      </Ariakit.ProgressRoot>
    </div>
  );
}
