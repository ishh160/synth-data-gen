import { useState } from "react"
import axios from "axios"
import { t } from "../theme"

const badge = (type) => {
  const map = {
    numeric: { bg: t.blueBg, color: t.blue, border: `${t.blue}33` },
    categorical: { bg: t.purpleBg, color: t.purple, border: `${t.purple}33` },
    boolean: { bg: t.amberBg, color: t.amber, border: `${t.amber}33` },
    datetime: { bg: t.accentBg, color: t.accent, border: `${t.accent}33` },
    ID: { bg: "#1a1a1a", color: "#555", border: "#33333355" },
  }
  const s = map[type] || map.categorical
  return { fontSize: "10px", padding: "2px 7px", borderRadius: "3px", fontWeight: "500",
    letterSpacing: "0.03em", background: s.bg, color: s.color, border: `0.5px solid ${s.border}` }
}

const card = { background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: "10px", padding: "20px 22px", marginBottom: "14px" }
const cardTitle = { fontSize: "11px", color: t.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }

export default function Upload({ onComplete }) {
  const [schema, setSchema] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append("file", file)
    const res = await axios.post("http://127.0.0.1:8000/upload", form)
    setMeta(res.data)
    setSchema(res.data.schema)
    setLoading(false)
  }

  function toggleInclude(i) {
    const u = [...schema]
    u[i].include = !u[i].include
    setSchema(u)
  }

  return (
    <div>
      <div style={{ ...card }}>
        <div style={cardTitle}>dataset</div>
        <div style={{
          border: `1px dashed ${t.border}`, borderRadius: "8px",
          padding: "32px", textAlign: "center", cursor: "pointer",
          transition: "border-color 0.15s"
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
          onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
        >
          <div style={{ fontSize: "13px", color: t.textMid, marginBottom: "8px" }}>drop csv file here</div>
          <div style={{ fontSize: "11px", color: t.textDim, marginBottom: "16px" }}>or click to browse</div>
          <input type="file" accept=".csv" onChange={handleFile}
            style={{ fontSize: "11px", color: t.textMuted }} />
        </div>
        {loading && (
          <div style={{ fontSize: "11px", color: t.accent, marginTop: "12px", letterSpacing: "0.04em" }}>
            › detecting schema...
          </div>
        )}
      </div>

      {schema && (
        <div style={{ ...card }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={cardTitle}>schema — auto-detected</div>
            <div style={{ fontSize: "11px", color: t.textMuted }}>
              {meta.rows.toLocaleString()} rows · {meta.columns} cols
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${t.border}` }}>
                {["column", "type", "nulls", "include"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0 8px 10px", fontSize: "10px",
                    color: t.textDim, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: "500" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schema.map((col, i) => (
                <tr key={col.column} style={{ borderBottom: `0.5px solid #161616` }}>
                  <td style={{ padding: "9px 8px", color: "#ccc", fontWeight: "500" }}>{col.column}</td>
                  <td style={{ padding: "9px 8px" }}>
                    <span style={badge(col.detected_type)}>{col.detected_type}</span>
                  </td>
                  <td style={{ padding: "9px 8px", color: t.textMuted }}>{col.null_pct}%</td>
                  <td style={{ padding: "9px 8px" }}>
                    <button onClick={() => toggleInclude(i)} style={{
                      width: "28px", height: "16px", borderRadius: "8px", border: "none",
                      background: col.include ? t.accent : "#1e1e1e", cursor: "pointer",
                      position: "relative", transition: "background 0.15s"
                    }}>
                      <span style={{
                        position: "absolute", top: "2px",
                        left: col.include ? "14px" : "2px",
                        width: "12px", height: "12px", borderRadius: "50%",
                        background: col.include ? t.bg : "#444",
                        transition: "left 0.15s"
                      }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => onComplete({ ...meta, schema })} style={{
              padding: "8px 20px", borderRadius: "6px", border: "none",
              background: t.accent, color: t.bg, fontSize: "12px",
              fontWeight: "500", cursor: "pointer", letterSpacing: "0.04em",
              fontFamily: t.mono
            }}>
              continue →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}