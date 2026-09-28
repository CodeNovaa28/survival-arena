import { useEffect, useRef, useState } from "react";

export type MinigameDone = (coins: number) => void;

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#a855f7"];

const stageStyle: React.CSSProperties = {
  width: "min(560px, 92vw)",
  padding: 24,
  borderRadius: 16,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "linear-gradient(145deg, rgba(15,35,62,0.9), rgba(5,12,24,0.95))",
  boxShadow: "0 18px 60px rgba(0,0,0,0.28)",
};

const actionStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "11px 26px",
  fontSize: 13,
  fontWeight: "bold",
  fontFamily: "inherit",
  letterSpacing: 2,
  cursor: "pointer",
};

function StartButton({ onClick, label = "▶ START GAME" }: { onClick: () => void; label?: string }) {
  return <button onClick={onClick} style={actionStyle}>{label}</button>;
}

function Hint({ children }: { children: string }) {
  return <div style={{ fontSize: 11, color: "#8fa3bb", letterSpacing: 1.5, lineHeight: 1.6 }}>{children}</div>;
}

type DigitStatus = "correct" | "present" | "absent";
interface CodeFeedback {
  guess: string;
  statuses: DigitStatus[];
}

function evaluateCodeGuess(guess: string, secret: string): CodeFeedback {
  const statuses: DigitStatus[] = ["absent", "absent", "absent"];
  const remaining = new Map<string, number>();

  for (let index = 0; index < secret.length; index++) {
    if (guess[index] === secret[index]) {
      statuses[index] = "correct";
    } else {
      remaining.set(secret[index], (remaining.get(secret[index]) ?? 0) + 1);
    }
  }

  for (let index = 0; index < guess.length; index++) {
    if (statuses[index] === "correct") continue;
    const count = remaining.get(guess[index]) ?? 0;
    if (count > 0) {
      statuses[index] = "present";
      remaining.set(guess[index], count - 1);
    }
  }

  return { guess, statuses };
}

// ─── Memory Matrix ────────────────────────────────────────────────────────────
export function MemoryMatrix({ onDone }: { onDone: MinigameDone }) {
  const [phase, setPhase] = useState<"idle" | "show" | "input">("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (phase !== "show") return;
    const timer = window.setTimeout(() => {
      if (step + 1 < sequence.length) {
        setStep(step + 1);
      } else {
        setStep(0);
        setSelectedCells([]);
        setPhase("input");
      }
    }, 520);
    return () => window.clearTimeout(timer);
  }, [phase, sequence, step]);

  const start = () => {
    setSequence(Array.from({ length: 3 }, () => Math.floor(Math.random() * 9)));
    setRound(1);
    setScore(0);
    setSelectedCells([]);
    setStep(0);
    setPhase("show");
  };

  const choose = (cell: number) => {
    if (phase !== "input") return;
    setSelectedCells((cells) => cells.includes(cell) ? cells : [...cells, cell]);
    if (cell !== sequence[step]) {
      onDone(Math.min(120, Math.max(10, score)));
      return;
    }
    if (step + 1 < sequence.length) {
      setStep(step + 1);
      return;
    }
    const nextScore = score + sequence.length * 10;
    if (round >= 5) {
      onDone(Math.min(150, nextScore));
      return;
    }
    setScore(nextScore);
    setRound(round + 1);
    setSelectedCells([]);
    setSequence(Array.from({ length: sequence.length + 1 }, () => Math.floor(Math.random() * 9)));
    setStep(0);
    setPhase("show");
  };

  return (
    <div style={stageStyle}>
      <Hint>Memorize the illuminated sequence, then repeat it. Five rounds.</Hint>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "18px 0 14px", color: "#c4b5fd", fontSize: 12 }}>
        <span>ROUND {round}/5</span><span>SCORE {score}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 330, margin: "0 auto 20px" }}>
        {Array.from({ length: 9 }, (_, cell) => {
          const active = phase === "show" && sequence[step] === cell;
          const selected = phase === "input" && selectedCells.includes(cell);
          return (
            <button
              key={cell}
              onClick={() => choose(cell)}
              style={{
                aspectRatio: "1", borderRadius: 12,
                border: `1px solid ${active ? "#fef08a" : selected ? "#67e8f9" : "rgba(148,163,184,0.22)"}`,
                background: active
                  ? "radial-gradient(circle, #fef08a, #eab308)"
                  : selected
                    ? "radial-gradient(circle, #67e8f9, #0e7490)"
                    : "rgba(30,64,175,0.25)",
                boxShadow: active
                  ? "0 0 30px rgba(250,204,21,0.8)"
                  : selected
                    ? "0 0 22px rgba(34,211,238,0.65)"
                    : "inset 0 1px 0 rgba(255,255,255,0.06)",
                cursor: phase === "input" ? "pointer" : "default",
                transition: "all .15s",
              }}
              aria-label={`matrix cell ${cell + 1}`}
            />
          );
        })}
      </div>
      {phase === "idle" && <StartButton onClick={start} />}
      {phase === "show" && <div style={{ color: "#fef08a", fontSize: 12, letterSpacing: 2 }}>WATCH THE PATTERN</div>}
      {phase === "input" && <div style={{ color: "#67e8f9", fontSize: 12, letterSpacing: 2 }}>REPEAT THE PATTERN</div>}
    </div>
  );
}

// ─── Lock Breaker ─────────────────────────────────────────────────────────────
export function LockBreaker({ onDone }: { onDone: MinigameDone }) {
  const [running, setRunning] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [target, setTarget] = useState(30);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const direction = useRef(1);
  const cursorRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const TARGET_WIDTH_PERCENT = 18;
  const LINE_WIDTH_PX = 5;

  useEffect(() => {
    if (!running) {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastFrameRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      const previous = lastFrameRef.current ?? timestamp;
      const elapsed = Math.min(0.05, Math.max(0, (timestamp - previous) / 1000));
      lastFrameRef.current = timestamp;

      let next = cursorRef.current + direction.current * 150 * elapsed;
      if (next >= 96) { next = 96; direction.current = -1; }
      if (next <= 0) { next = 0; direction.current = 1; }
      cursorRef.current = next;
      setCursor(next);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastFrameRef.current = null;
    };
  }, [running]);

  const randomTarget = (minimum: number) =>
    minimum + Math.random() * Math.max(1, 100 - TARGET_WIDTH_PERCENT - minimum);

  const start = () => {
    setRunning(true);
    setRound(1);
    setScore(0);
    setCursor(0);
    cursorRef.current = 0;
    setTarget(randomTarget(18));
    direction.current = 1;
  };

  const strike = () => {
    if (!running) return;
    const trackWidth = trackRef.current?.getBoundingClientRect().width ?? 1;
    const targetStart = (target / 100) * trackWidth;
    const targetEnd = ((target + TARGET_WIDTH_PERCENT) / 100) * trackWidth;
    const lineCenter = (cursorRef.current / 100) * trackWidth;
    const lineHalfWidth = LINE_WIDTH_PX / 2;
    // Require the whole visible line to sit inside the visible target zone.
    const hit = lineCenter - lineHalfWidth >= targetStart
      && lineCenter + lineHalfWidth <= targetEnd;
    if (!hit) {
      setRunning(false);
      onDone(Math.max(10, score));
      return;
    }
    const nextScore = score + 12;
    if (round >= 5) {
      setRunning(false);
      onDone(Math.min(130, nextScore));
      return;
    }
    setScore(nextScore);
    setRound(round + 1);
    setCursor(0);
    cursorRef.current = 0;
    setTarget(randomTarget(8));
    direction.current = 1;
  };

  return (
    <div style={stageStyle}>
      <Hint>Stop the moving key inside the glowing zone. Five locks, one miss ends the run.</Hint>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "18px 0 10px", color: "#fbbf24", fontSize: 12 }}>
        <span>LOCK {round}/5</span><span>SCORE {score}</span>
      </div>
      <div ref={trackRef} style={{ position: "relative", height: 34, borderRadius: 8, background: "#111827", border: "1px solid rgba(255,255,255,.12)", overflow: "hidden", marginBottom: 18 }}>
        <div style={{ position: "absolute", left: `${target}%`, top: 0, width: `${TARGET_WIDTH_PERCENT}%`, height: "100%", background: "rgba(34,197,94,.3)", borderLeft: "1px solid #4ade80", borderRight: "1px solid #4ade80" }} />
        <div style={{ position: "absolute", left: `${cursor}%`, top: 2, width: LINE_WIDTH_PX, height: 28, borderRadius: 4, background: "#fef08a", boxShadow: "0 0 14px #facc15", transform: "translateX(-50%)" }} />
      </div>
      {!running ? <StartButton onClick={start} /> : <button onClick={strike} style={{ ...actionStyle, background: "#ca8a04" }}>🔒 BREAK LOCK</button>}
    </div>
  );
}

// ─── Reaction Core ────────────────────────────────────────────────────────────
export function ReactionCore({ onDone }: { onDone: MinigameDone }) {
  const [phase, setPhase] = useState<"idle" | "wait" | "ready">("idle");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startedAt = useRef(0);

  const beginRound = (nextRound: number) => {
    setRound(nextRound);
    setPhase("wait");
    timerRef.current = window.setTimeout(() => {
      startedAt.current = performance.now();
      setPhase("ready");
    }, 900 + Math.random() * 1700);
  };

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const start = () => {
    setScore(0);
    beginRound(1);
  };

  const tap = () => {
    if (phase === "wait") {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setPhase("idle");
      onDone(score);
      return;
    }
    if (phase !== "ready") return;
    const reaction = performance.now() - startedAt.current;
    const points = Math.max(8, Math.round(34 - reaction / 18));
    const nextScore = score + points;
    if (round >= 5) {
      setPhase("idle");
      onDone(Math.min(150, nextScore));
    } else {
      setScore(nextScore);
      beginRound(round + 1);
    }
  };

  return (
    <div style={stageStyle}>
      <Hint>Wait for the core to turn green, then click as quickly as possible. Early clicks fail.</Hint>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "18px 0 16px", color: "#67e8f9", fontSize: 12 }}>
        <span>ROUND {round}/5</span><span>SCORE {score}</span>
      </div>
      {phase === "idle" ? (
        <StartButton onClick={start} label="▶ START REACTION TEST" />
      ) : (
        <button
          onClick={tap}
          style={{
            width: "100%", height: 150, borderRadius: 18,
            border: `2px solid ${phase === "ready" ? "#4ade80" : "#f59e0b"}`,
            background: phase === "ready" ? "radial-gradient(circle, #4ade80, #166534)" : "radial-gradient(circle, #f59e0b, #78350f)",
            color: "#fff", fontSize: 22, fontWeight: 900, letterSpacing: 3, cursor: "pointer",
            boxShadow: phase === "ready" ? "0 0 45px rgba(74,222,128,.45)" : "0 0 30px rgba(245,158,11,.25)",
          }}
        >
          {phase === "ready" ? "TAP NOW" : "WAIT…"}
        </button>
      )}
    </div>
  );
}

// ─── Code Breaker ─────────────────────────────────────────────────────────────
export function CodeBreaker({ onDone }: { onDone: MinigameDone }) {
  const [secret, setSecret] = useState("");
  const [guess, setGuess] = useState("");
  const [tries, setTries] = useState(3);
  const [hint, setHint] = useState("");
  const [feedback, setFeedback] = useState<CodeFeedback[]>([]);
  const [running, setRunning] = useState(false);

  const start = () => {
    setSecret(String(Math.floor(100 + Math.random() * 900)));
    setGuess("");
    setTries(3);
    setHint("");
    setFeedback([]);
    setRunning(true);
  };

  const press = (key: string) => {
    if (!running) return;
    if (key === "clear") { setGuess(""); return; }
    if (key === "enter") {
      if (guess.length !== 3) return;
      if (guess === secret) {
        setRunning(false);
        onDone(100);
        return;
      }
      const result = evaluateCodeGuess(guess, secret);
      const exact = result.statuses.filter((status) => status === "correct").length;
      const present = result.statuses.filter((status) => status === "present").length;
      const remaining = tries - 1;
      setFeedback((history) => [...history, result]);
      setTries(remaining);
      setHint(`${exact} correct position · ${present} correct digit elsewhere · ${remaining} attempt${remaining === 1 ? "" : "s"} left`);
      setGuess("");
      if (remaining <= 0) {
        setRunning(false);
        onDone(15);
      }
      return;
    }
    if (guess.length < 3) setGuess((current) => current + key);
  };

  return (
    <div style={stageStyle}>
      <Hint>Crack the three-digit security code in three attempts. Exact and misplaced digit hints appear after each guess.</Hint>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "18px 0 12px", color: "#c084fc", fontSize: 12 }}>
        <span>ATTEMPTS {tries}/3</span><span style={{ letterSpacing: 4, color: "#fff" }}>{running ? guess.padEnd(3, "•") : "•••"}</span>
      </div>
      <div style={{ minHeight: 22, color: "#a7f3d0", fontSize: 12, marginBottom: 12 }}>{hint}</div>
      {feedback.length > 0 && (
        <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "rgba(15,23,42,.7)", border: "1px solid rgba(168,85,247,.18)" }}>
          <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 2, marginBottom: 8 }}>POSITION FEEDBACK</div>
          {feedback.map((attempt, attemptIndex) => (
            <div key={`${attempt.guess}-${attemptIndex}`} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: attemptIndex === feedback.length - 1 ? 0 : 7 }}>
              <span style={{ width: 42, fontSize: 9, color: "#64748b" }}>TRY {attemptIndex + 1}</span>
              <div style={{ display: "flex", gap: 5 }}>
                {attempt.guess.split("").map((digit, index) => {
                  const status = attempt.statuses[index];
                  const color = status === "correct" ? "#4ade80" : status === "present" ? "#fbbf24" : "#64748b";
                  const label = status === "correct" ? "CORRECT POSITION" : status === "present" ? "PRESENT ELSEWHERE" : "NOT IN CODE";
                  return (
                    <div key={`${digit}-${index}`} title={`Position ${index + 1}: ${label}`} style={{ width: 30, textAlign: "center" }}>
                      <div style={{ color: "#94a3b8", fontSize: 8, marginBottom: 2 }}>P{index + 1}</div>
                      <div style={{ border: `1px solid ${color}`, borderRadius: 5, padding: "4px 0", color, fontWeight: "bold" }}>{digit}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 9, fontSize: 9, color: "#94a3b8", lineHeight: 1.5 }}>
            Green = correct position · Amber = digit appears elsewhere · Gray = digit is not in the code
          </div>
        </div>
      )}
      {!running ? <StartButton onClick={start} label="▶ START CRACKING" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "enter"].map((key) => (
            <button key={key} onClick={() => press(key)} style={{ ...actionStyle, background: key === "enter" ? "#7c3aed" : key === "clear" ? "#334155" : "#1e40af", padding: "12px 6px", fontSize: 12 }}>
              {key === "clear" ? "CLR" : key === "enter" ? "ENTER" : key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Signal Sorter ────────────────────────────────────────────────────────────
export function SignalSorter({ onDone }: { onDone: MinigameDone }) {
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(18);
  const timeRef = useRef(18);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      timeRef.current = Math.max(0, timeRef.current - 0.1);
      setTime(timeRef.current);
      if (timeRef.current <= 0) {
        window.clearInterval(timer);
        setRunning(false);
        onDone(Math.min(140, score * 8));
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [running, score, onDone]);

  const start = () => {
    timeRef.current = 18;
    setTime(18);
    setScore(0);
    setTarget(Math.floor(Math.random() * COLORS.length));
    setRunning(true);
  };

  const choose = (index: number) => {
    if (!running) return;
    if (index !== target) {
      setRunning(false);
      onDone(Math.min(140, score * 8));
      return;
    }
    setScore((value) => value + 1);
    setTarget(Math.floor(Math.random() * COLORS.length));
  };

  return (
    <div style={stageStyle}>
      <Hint>Route each incoming signal to the matching color. One wrong channel ends the run.</Hint>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "18px 0 20px", color: "#67e8f9", fontSize: 12 }}>
        <span>SIGNALS {score}</span><span>{time.toFixed(1)}s</span>
      </div>
      {!running ? <StartButton onClick={start} label="▶ START SORTING" /> : (
        <>
          <div style={{ width: 120, height: 120, margin: "0 auto 24px", borderRadius: "50%", background: COLORS[target], boxShadow: `0 0 40px ${COLORS[target]}`, border: "8px solid rgba(255,255,255,.15)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {COLORS.map((color, index) => (
              <button key={color} onClick={() => choose(index)} aria-label={`route signal ${index + 1}`} style={{ height: 60, borderRadius: 12, border: "2px solid rgba(255,255,255,.22)", background: color, cursor: "pointer", boxShadow: `0 0 18px ${color}66` }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}