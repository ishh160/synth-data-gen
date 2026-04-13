import { useState } from "react"
import axios from "axios"
import { t } from "../theme"

const card = { background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: "10px", padding: "20px 22px", marginBottom: "14px" }
const cardTitle = { fontSize: "11px", color: t.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }

export default function ModelConfig({ uploadData, onComplete }) {
  const [model, setModel] = useState("ctgan")
  const [epochs, setEpochs] = useState(300)
  const [numRows, setNumRows] = useState(uploadData?.rows || 500)
  const [batchSize, setBatchSize] = useState(500)
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState([])

  const estTime = Math.round((epochs / 300) * (model === "ctgan" ? 4 : 8))

  async function handleTrain() {
    setLoading(true)
    setLog([
      `› loading dataset — ${uploadData.rows.toLocaleString()} rows`,
      `› schema validated — ${uploadData.schema.filter(c => c.include).length} features`,
      `› starting ${model.toUpperCase()} — ${epochs} epochs...`,
    ])
    try {
      const res = await axios.post("http://127.0.0.1:8000/train", {
        filepath: uploadData.filepath,
        schema: uploadData.schema,
        epochs, num_rows: numRows, batch_size: batchSize
      })
      setLog(l => [...l,
        `✓ training complete`,
        `✓ generated ${res.data.rows_generated.toLocaleString()} synthetic rows`,
      ])
      setTimeout(() => onComplete(res.data), 600)
    } catch {
      setLog(l => [...l, `✗ training failed — check terminal`])
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={card}>
        <div style={cardTitle}>model</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "4px" }}>
          {[
            { id: "ctgan", name: "CTGAN", desc: "GAN-based · fast · mixed tabular", tag: "faster" },
            { id: "tabddpm", name: "TabDDPM", desc: "Diffusion-based · higher fidelity", tag: "better quality" }
          ].map(m => (
            <div key={m.id} onClick={() => setModel(m.id)} style={{
              border: `0.5px solid ${model === m.id ? t.accent : t.border}`,
              borderRadius: "8px", padding: "14px", cursor: "pointer",
              background: model === m.id ? t.accentBg : "transparent",
              transition: "all 0.15s"
            }}>
              <div style={{ fontSize: "13px", color: t.text, fontWeight: "500", marginBottom: "3px" }}>{m.name}</div>
              <div style={{ fontSize: "11px", color: t.textMuted, marginBottom: "8px" }}>{m.desc}</div>
              <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "3px",
                background: t.accentBg, color: t.accent, border: `0.5px solid ${t.accentDim}` }}>
                {m.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={cardTitle}>training settings</div>
        {[
          { label: "epochs", value: epochs, min: 100, max: 2000, step: 100, set: setEpochs,
            hint: epochs <= 300 ? "fast, good start" : epochs <= 800 ? "balanced" : "high quality" },
          { label: "output rows", value: numRows, min: 100, max: 50000, step: 100, set: setNumRows,
            hint: numRows <= (uploadData?.rows||500) ? "matched to dataset" : "augmented beyond real size" },
          { label: "batch size", value: batchSize, min: 100, max: 1000, step: 50, set: setBatchSize,
            hint: "larger = faster per epoch" },
        ].map(s => (
          <div key={s.label} style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ minWidth: "120px", fontSize: "12px", color: t.textMid }}>{s.label}</div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                onChange={e => s.set(Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontSize: "12px", color: t.accent, minWidth: "52px", textAlign: "right", fontWeight: "500" }}>
                {s.value.toLocaleString()}
              </span>
            </div>
            <div style={{ fontSize: "10px", color: t.textDim, paddingLeft: "132px", marginTop: "3px", letterSpacing: "0.03em" }}>
              {s.hint}
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={cardTitle}>summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
          {[
            { label: "est. time", val: `~${estTime} min` },
            { label: "output rows", val: numRows.toLocaleString() },
            { label: "model", val: model.toUpperCase() },
          ].map(s => (
            <div key={s.label} style={{ background: t.surfaceAlt, border: `0.5px solid ${t.border}`,
              borderRadius: "8px", padding: "12px 14px" }}>
              <div style={{ fontSize: "10px", color: t.textDim, letterSpacing: "0.06em",
                textTransform: "uppercase", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontSize: "18px", color: t.text, fontWeight: "500" }}>{s.val}</div>
            </div>
          ))}
        </div>

        {log.length > 0 && (
          <div style={{ background: t.surfaceAlt, border: `0.5px solid ${t.border}`,
            borderRadius: "6px", padding: "12px 14px", marginBottom: "14px" }}>
            {log.map((line, i) => (
              <div key={i} style={{ fontSize: "11px", marginBottom: "3px",
                color: line.startsWith("✓") ? t.accent : line.startsWith("✗") ? t.red : t.textMuted,
                letterSpacing: "0.03em" }}>{line}</div>
            ))}
            {loading && <div style={{ fontSize: "11px", color: t.textDim, marginTop: "4px" }}>_</div>}
          </div>
        )}

        <div style={{ textAlign: "right" }}>
          <button onClick={handleTrain} disabled={loading} style={{
            padding: "8px 20px", borderRadius: "6px", border: "none",
            background: loading ? "#1a2e24" : t.accent,
            color: loading ? t.accent : t.bg,
            fontSize: "12px", fontWeight: "500", cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.04em", fontFamily: t.mono
          }}>
            {loading ? "training..." : "start training →"}
          </button>
        </div>
      </div>
    </div>
  )
}