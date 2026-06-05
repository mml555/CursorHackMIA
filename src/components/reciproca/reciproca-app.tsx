"use client";

import { useState } from "react";
import { BrowseNetwork } from "./screens/browse-network";
import { BusinessProfileScreen } from "./screens/business-profile";
import { Join } from "./screens/join";
import { Landing } from "./screens/landing";
import { LandingNav } from "./screens/landing-nav";
import { MatchPointsScreen } from "./screens/match-points";
import { Matches } from "./screens/matches";
import { TopNav } from "./screens/top-nav";
import type { Navigate, Screen } from "./types";
import { useDiscoveryStats } from "./use-discovery-stats";

export function ReciprocaApp() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [profileBusinessId, setProfileBusinessId] = useState<string | null>(
    null,
  );
  const [profileReturnTo, setProfileReturnTo] = useState<Screen>("network");
  const { summary } = useDiscoveryStats("Austin");

  const go: Navigate = (next, options) => {
    setScreen(next);
    if (options?.businessId) {
      setProfileBusinessId(options.businessId);
      setProfileReturnTo(options.returnTo ?? screen);
    } else if (next !== "profile") {
      setProfileBusinessId(null);
    }
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
      {screen === "match-points" && <MatchPointsScreen go={go} />}
      {screen === "network" && <BrowseNetwork go={go} summary={summary} />}
      {screen === "join" && <Join go={go} />}
      {screen === "profile" && profileBusinessId && (
        <BusinessProfileScreen
          businessId={profileBusinessId}
          returnTo={profileReturnTo}
          go={go}
        />
      )}
    </div>
  );
}
