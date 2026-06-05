"use client";

import { useEffect, useState } from "react";

export function ReasonBox({
  text,
  typeIt = true,
  startDelay = 300,
}: {
  text: string;
  typeIt?: boolean;
  startDelay?: number;
}) {
  const [out, setOut] = useState(typeIt ? "" : text);
  const [done, setDone] = useState(!typeIt);

  useEffect(() => {
    if (!typeIt) return;

    let i = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const begin = setTimeout(function tick() {
      if (i <= text.length) {
        setOut(text.slice(0, i));
        i += 2;
        timer = setTimeout(tick, 14);
      } else {
        setDone(true);
      }
    }, startDelay);

    return () => {
      clearTimeout(begin);
      if (timer) clearTimeout(timer);
    };
  }, [text, typeIt, startDelay]);

  return (
    <div className="reason">
      <span className="reason-rail" />
      <div className="reason-head">
        <span className="reason-dot" />
        why this match
        {!done && (
          <span className="reason-think">
            <i />
            <i />
            <i />
          </span>
        )}
      </div>
      <div className="reason-body">
        {out}
        <span className="cursor" style={{ opacity: done ? 0 : 1 }}>
          ▌
        </span>
      </div>
    </div>
  );
}
