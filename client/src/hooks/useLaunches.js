import { useCallback, useEffect, useState } from "react";

import { httpGetLaunches, httpSubmitLaunch, httpAbortLaunch } from "./requests";

function useLaunches(onSuccessSound, onAbortSound, onFailureSound) {
  const [launches, saveLaunches] = useState([]);
  const [isPendingLaunch, setPendingLaunch] = useState(false);
  const [launchError, setLaunchError] = useState(null);
  const [abortedFlight, setAbortedFlight] = useState(null);
  const [abortMessage, setAbortMessage] = useState(null);

  const getLaunches = useCallback(async () => {
    const fetchedLaunches = await httpGetLaunches();
    saveLaunches(fetchedLaunches);
  }, []);

  useEffect(() => {
    getLaunches();
  }, [getLaunches]);

  const submitLaunch = useCallback(
    async (e) => {
      e.preventDefault();
      setPendingLaunch(true);
      setLaunchError(null);
      const data = new FormData(e.target);
      const launchDate = new Date(data.get("launch-day"));
      const mission = data.get("mission-name");
      const rocket = data.get("rocket-name");
      const target = data.get("planets-selector");
      const response = await httpSubmitLaunch({
        launchDate,
        mission,
        rocket,
        target,
      });

      const success = response.ok;
      if (success) {
        getLaunches();
        setTimeout(() => {
          setPendingLaunch(false);
          onSuccessSound();
        }, 800);
      } else {
        // Surface server validation message if available
        const errMsg = response?.body?.error || "Launch failed";
        setLaunchError(errMsg);
        setPendingLaunch(false);
        onFailureSound();
      }
    },
    [getLaunches, onSuccessSound, onFailureSound]
  );

  const abortLaunch = useCallback(
    async (id) => {
      const response = await httpAbortLaunch(id);

      const success = response.ok;
      if (success) {
        // Show an animation for the aborted row before refreshing list
        setAbortedFlight(id);
        setAbortMessage(response.body?.message || `Launch ${id} aborted`);
        onAbortSound();
        setTimeout(() => {
          getLaunches();
          setAbortedFlight(null);
          setAbortMessage(null);
        }, 700);
      } else {
        const errMsg = response?.body?.error || "Abort failed";
        setAbortMessage(errMsg);
        onFailureSound();
        setTimeout(() => setAbortMessage(null), 2000);
      }
    },
    [getLaunches, onAbortSound, onFailureSound]
  );

  return {
    launches,
    isPendingLaunch,
    launchError,
    abortedFlight,
    abortMessage,
    submitLaunch,
    abortLaunch,
  };
}

export default useLaunches;
