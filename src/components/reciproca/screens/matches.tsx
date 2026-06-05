"use client";

import { useState } from "react";
import { MatchCard } from "../match-card";
import { ProposeModal } from "../propose-modal";
import { SuccessView } from "../success-view";
import { MATCHES } from "../data/members";
import type { Member, Navigate } from "../types";
import { IconCheck, Vetted } from "../primitives";

export function Matches({ go }: { go: Navigate }) {
  const [modal, setModal] = useState<Member | null>(null);
  const [phase, setPhase] = useState<"list" | "success">("list");
  const [toast, setToast] = useState(false);

  if (phase === "success") {
    return (
      <div className="screen">
        <div className="container">
          <SuccessView
            onTrades={() => {
              setToast(true);
              setTimeout(() => setToast(false), 2600);
              setPhase("list");
            }}
            onBrowse={() => {
              setPhase("list");
              go("network");
            }}
          />
        </div>
        {toast && (
          <div className="toast">
            <span className="vetted-dot">
              <IconCheck size={15} stroke="var(--success)" />
            </span>
            Rating submitted. It appears on their profile after review.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="matches-wrap">
        <div className="matches-glow" />
        <div className="container" style={{ position: "relative" }}>
          <div className="section-head" style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 40, margin: 0 }}>Your matches</h1>
            <span className="progress-pill">
              <span
                className="reason-dot"
                style={{
                  background: "var(--teal)",
                  boxShadow: "0 0 8px var(--teal)",
                }}
              />
              AI-ranked by fit
            </span>
          </div>

          <div className="summary">
            <div className="cell">
              <div className="k">Offering</div>
              <div className="v">Yoga classes, 4x/month</div>
            </div>
            <div className="cell">
              <div className="k">Looking for</div>
              <div className="v">Brand photography</div>
            </div>
            <div className="cell">
              <Vetted />
            </div>
          </div>

          <div className="match-list">
            {MATCHES.map((mt, i) => (
              <MatchCard
                key={mt.member.id}
                match={mt}
                index={i}
                onPropose={(m) => setModal(m)}
              />
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <ProposeModal
          member={modal}
          onClose={() => setModal(null)}
          onSend={() => {
            setModal(null);
            setPhase("success");
          }}
        />
      )}
      {toast && (
        <div className="toast">
          <span className="vetted-dot">
            <IconCheck size={15} stroke="var(--success)" />
          </span>
          Rating submitted. It appears on their profile after review.
        </div>
      )}
    </div>
  );
}
