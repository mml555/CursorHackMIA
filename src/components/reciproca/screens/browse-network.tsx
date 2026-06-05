"use client";

import { useState } from "react";
import { BusinessCard } from "../business-card";
import { MEMBERS } from "../data/members";
import type { Navigate } from "../types";
import { Button, IconSearch } from "../primitives";

export function BrowseNetwork({ go }: { go: Navigate }) {
  const verticals = [
    "All",
    "Wellness",
    "Photography",
    "Social agency",
    "Finance",
    "Web design",
  ];
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [count, setCount] = useState(6);

  const list = MEMBERS.filter(
    (m) =>
      (filter === "All" || m.industry === filter) &&
      (q === "" ||
        m.name.toLowerCase().includes(q.toLowerCase()) ||
        m.trading.toLowerCase().includes(q.toLowerCase())),
  );
  const shown = list.slice(0, count);

  return (
    <div className="screen">
      <div className="container" style={{ paddingTop: 36, paddingBottom: 56 }}>
        <div className="section-head">
          <div>
            <h1 style={{ fontSize: 40, margin: 0 }}>Member Network</h1>
            <p className="muted" style={{ marginTop: 8 }}>
              47 vetted businesses in Austin
            </p>
          </div>
          <Button variant="primary" onClick={() => go("join")}>
            List your business
          </Button>
        </div>

        <div className="toolbar">
          <div className="search">
            <IconSearch />
            <input
              placeholder="Search members or services"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="pill-row">
            {verticals.map((v) => (
              <button
                key={v}
                type="button"
                className={"filter-pill" + (filter === v ? " active" : "")}
                onClick={() => {
                  setFilter(v);
                  setCount(6);
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid">
          {shown.map((m) => (
            <BusinessCard key={m.id} member={m} />
          ))}
        </div>

        {shown.length === 0 && (
          <p className="muted" style={{ textAlign: "center", padding: "48px 0" }}>
            No members match that filter yet.
          </p>
        )}
        {count < list.length && (
          <div className="loadmore">
            <Button variant="secondary" onClick={() => setCount((c) => c + 6)}>
              Load more members
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
