"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { createClient } from "@/lib/supabase/client";
import styles from "./journal.module.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export type JournalEntryRow = {
  id: string;
  created_at: string;
  gratitud_1: string | null;
  gratitud_2: string | null;
  gratitud_3: string | null;
  intencion: string | null;
  estado: string | null;
  libre: string | null;
};

const TOTAL_SECONDS = 300;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatEntryDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function JournalMatutino({
  userId,
  initialEntries,
}: {
  userId: string;
  initialEntries: JournalEntryRow[];
}) {
  const supabase = useMemo(() => createClient(), []);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  const [g1, setG1] = useState("");
  const [g2, setG2] = useState("");
  const [g3, setG3] = useState("");
  const [intencion, setIntencion] = useState("");
  const [estado, setEstado] = useState("");
  const [libre, setLibre] = useState("");
  const [saving, setSaving] = useState(false);

  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [entries, setEntries] = useState<JournalEntryRow[]>(initialEntries);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  function showToast(message: string) {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2200);
  }

  function toggleTimer() {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      return;
    }
    if (remaining === 0) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          setFinished(true);
          showToast("⏱ Tiempo cumplido");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function resetTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(false);
    setRemaining(TOTAL_SECONDS);
  }

  const minutesLeft = Math.ceil(remaining / 60);

  async function fetchHistory() {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setEntries(data as JournalEntryRow[]);
    }
    setLoadingHistory(false);
  }

  function toggleHistory() {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next) fetchHistory();
  }

  function clearForm() {
    setG1("");
    setG2("");
    setG3("");
    setIntencion("");
    setEstado("");
    setLibre("");
  }

  async function saveEntry() {
    if (!g1.trim() && !intencion.trim() && !libre.trim()) {
      showToast("Escribe algo primero 🖊");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        gratitud_1: g1.trim() || null,
        gratitud_2: g2.trim() || null,
        gratitud_3: g3.trim() || null,
        intencion: intencion.trim() || null,
        estado: estado.trim() || null,
        libre: libre.trim() || null,
      })
      .select()
      .single();
    setSaving(false);

    if (error || !data) {
      showToast("No se pudo guardar. Intenta de nuevo.");
      return;
    }

    setEntries((prev) => [data as JournalEntryRow, ...prev]);
    showToast("Entrada guardada ✓");
    clearForm();
  }

  return (
    <div className={`${styles.journalPage} ${inter.variable} ${playfair.variable}`}>
      <header className={styles.header}>
        <span className={styles.headerTitle}>Journal Matutino</span>
        <span className={styles.headerDate}>{todayLabel}</span>
      </header>

      <div className={styles.page}>
        <div className={styles.timerBar}>
          <span className={styles.timerDisplay}>{formatTime(remaining)}</span>
          <span className={styles.timerLabel}>
            Tienes 5 minutos.
            <br />
            Sin prisas, sin presión.
          </span>
          <div className={styles.progress}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`${styles.dot} ${i < minutesLeft ? styles.dotActive : ""}`}
              />
            ))}
          </div>
          <button
            className={`${styles.timerBtn} ${styles.timerBtnReset}`}
            onClick={resetTimer}
            type="button"
          >
            ↺
          </button>
          <button
            className={styles.timerBtn}
            onClick={toggleTimer}
            disabled={remaining === 0}
            type="button"
          >
            {finished ? "Listo" : running ? "Pausar" : remaining === TOTAL_SECONDS ? "Iniciar" : "Continuar"}
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>01 — Gratitud</span>
            <span className={styles.sectionHint}>~60 seg · anclaje</span>
          </div>
          <p className={styles.sectionTitle}>¿Qué 3 cosas agradezco hoy?</p>
          <div className={styles.gratList}>
            <div className={styles.gratRow}>
              <span className={styles.gratNum}>1.</span>
              <input
                className={styles.lineInput}
                value={g1}
                onChange={(e) => setG1(e.target.value)}
                placeholder="algo concreto, no genérico…"
              />
            </div>
            <div className={styles.gratRow}>
              <span className={styles.gratNum}>2.</span>
              <input
                className={styles.lineInput}
                value={g2}
                onChange={(e) => setG2(e.target.value)}
              />
            </div>
            <div className={styles.gratRow}>
              <span className={styles.gratNum}>3.</span>
              <input
                className={styles.lineInput}
                value={g3}
                onChange={(e) => setG3(e.target.value)}
              />
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>02 — Intención</span>
            <span className={styles.sectionHint}>~60 seg · enfoque</span>
          </div>
          <p className={styles.sectionTitle}>¿Qué haría que hoy valiera la pena?</p>
          <input
            className={styles.lineInput}
            value={intencion}
            onChange={(e) => setIntencion(e.target.value)}
            placeholder="una sola cosa, la más importante…"
          />
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>03 — Estado interno</span>
            <span className={styles.sectionHint}>~60 seg · honestidad</span>
          </div>
          <p className={styles.sectionTitle}>¿Cómo llego a este día?</p>
          <input
            className={styles.lineInput}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            placeholder="cuerpo, mente, emociones… lo que sea real…"
          />
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>04 — Espacio libre</span>
            <span className={styles.sectionHint}>~2 min · vaciado</span>
          </div>
          <p className={styles.sectionTitle}>Lo que sea que esté en tu cabeza ahora.</p>
          <textarea
            className={styles.areaInput}
            value={libre}
            onChange={(e) => setLibre(e.target.value)}
            placeholder="sin estructura, sin filtro, sin audiencia — solo tú…"
          />
        </div>

        <div className={styles.saveRow}>
          <button className={styles.btnClear} onClick={clearForm} type="button">
            Limpiar
          </button>
          <button
            className={styles.btnSave}
            onClick={saveEntry}
            disabled={saving}
            type="button"
          >
            {saving ? "Guardando…" : "Guardar entrada"}
          </button>
        </div>

        <hr className={styles.divider} />

        <div className={styles.historySection}>
          <button className={styles.historyToggle} onClick={toggleHistory} type="button">
            <span>{historyOpen ? "▾" : "▸"}</span>
            <span>{historyOpen ? "Ocultar entradas" : "Ver entradas anteriores"}</span>
          </button>
          <div
            className={`${styles.historyList} ${historyOpen ? styles.historyListOpen : ""}`}
          >
            {loadingHistory ? (
              <p className={styles.emptyHistory}>Cargando entradas…</p>
            ) : entries.length === 0 ? (
              <p className={styles.emptyHistory}>Aún no hay entradas guardadas.</p>
            ) : (
              entries.map((entry) => (
                <div className={styles.entryCard} key={entry.id}>
                  <div className={styles.entryCardDate}>
                    {formatEntryDate(entry.created_at)}
                  </div>
                  {(entry.gratitud_1 || entry.gratitud_2 || entry.gratitud_3) && (
                    <div className={styles.entryField}>
                      <div className={styles.entryKey}>Gratitud</div>
                      <div className={styles.entryVal}>
                        {[entry.gratitud_1, entry.gratitud_2, entry.gratitud_3]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                  )}
                  {entry.intencion && (
                    <div className={styles.entryField}>
                      <div className={styles.entryKey}>Intención del día</div>
                      <div className={styles.entryVal}>{entry.intencion}</div>
                    </div>
                  )}
                  {entry.estado && (
                    <div className={styles.entryField}>
                      <div className={styles.entryKey}>Estado interno</div>
                      <div className={styles.entryVal}>{entry.estado}</div>
                    </div>
                  )}
                  {entry.libre && (
                    <div className={styles.entryField}>
                      <div className={styles.entryKey}>Espacio libre</div>
                      <div className={styles.entryVal}>{entry.libre}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={`${styles.toast} ${toast ? styles.toastShow : ""}`}>{toast}</div>
    </div>
  );
}
