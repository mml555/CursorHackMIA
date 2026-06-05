"use client";

import { useState } from "react";
import { BrowseNetwork } from "./screens/browse-network";
import { Join } from "./screens/join";
import { Landing } from "./screens/landing";
import { LandingNav } from "./screens/landing-nav";
import { Matches } from "./screens/matches";
import { TopNav } from "./screens/top-nav";
import type { Screen } from "./types";
import { useDiscoveryStats } from "./use-discovery-stats";

export function ReciprocaApp() {
  const [screen, setScreen] = useState<Screen>("landing");
  const { summary } = useDiscoveryStats("Austin");

  const go = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="app" data-screen-label={screen}>
      {screen !== "landing" && (
        <TopNav screen={screen} go={go} summary={summary} />
      )}
      {screen === "landing" && (
        <>
          <LandingNav go={go} />
          <Landing go={go} summary={summary} />
        </>
      )}
      {screen === "matches" && <Matches go={go} />}
      {screen === "network" && <BrowseNetwork go={go} summary={summary} />}
      {screen === "join" && <Join go={go} />}
    </div>
  );
}
