import { useEffect, useRef, useState } from "react"
import axios from "axios"
import * as d3 from "d3"
import { t } from "../theme"

const card = { background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: "10px", padding: "20px 22px", marginBottom: "14px" }
const cardTitle = { fontSize: "11px", color: t.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }

export default function FidelityDashboard({ uploadData, trainData, onComplete }) {
  const [fidelity, setFidelity] = useState(null)
  const [loading, setLoading] = useState(true)
  const pcaRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    axios.post("http://127.0.0.1:8000/fidelity", {
      real_path: uploadData.filepath,
      synthetic_path: trainData.synthetic_path
    }).then(res => {
      setFidelity(res.data)
      onComplete(res.data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!fidelity) return
    drawPCA()
    drawKS()
  }, [fidelity])

  function drawPCA() {
    const el = pcaRef.current
    if (!el) return
    d3.select(el).selectAll("*").remove()
    const W = el.clientWidth || 400, H = 240
    const m = { top: 16, right: 16, bottom: 28, left: 32 }
    const w = W - m.left - m.right, h = H - m.top - m.bottom
    const svg = d3.select(el).append("svg").attr("width", W).attr("height", H)
      .style("background", t.surfaceAlt)
      .append("g").attr("transform", `translate(${m.left},${m.top})`)

    const real = fidelity.pca.real, synth = fidelity.pca.synthetic
    const all = [...real, ...synth]
    const xS = d3.scaleLinear().domain(d3.extent(all, d => d.x)).nice().range([0, w])
    const yS = d3.scaleLinear().domain(d3.extent(all, d => d.y)).nice().range([h, 0])

    svg.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xS).ticks(5).tickSize(2))
      .call(g => g.selectAll("text").style("fill", t.textDim).style("font-size", "10px").style("font-family", t.mono))
      .call(g => g.select(".domain").style("stroke", t.border))
      .call(g => g.selectAll(".tick line").style("stroke", t.border))

    svg.append("g")
      .call(d3.axisLeft(yS).ticks(5).tickSize(2))
      .call(g => g.selectAll("text").style("fill", t.textDim).style("font-size", "10px").style("font-family", t.mono))
      .call(g => g.select(".domain").style("stroke", t.border))
      .call(g => g.selectAll(".tick line").style("stroke", t.border))

    svg.selectAll(".r").data(real).enter().append("circle")
      .attr("cx", d => xS(d.x)).attr("cy", d => yS(d.y))
      .attr("r", 2.5).attr("fill", t.blue).attr("opacity", 0.5)

    svg.selectAll(".s").data(synth).enter().append("circle")
      .attr("cx", d => xS(d.x)).attr("cy", d => yS(d.y))
      .attr("r", 2.5).attr("fill", t.accent).attr("opacity", 0.5)

    const lg = svg.append("g").attr("transform", `translate(${w - 100}, 4)`)
    lg.append("circle").attr("cx", 5).attr("cy", 5).attr("r", 4).attr("fill", t.blue).attr("opacity", 0.7)
    lg.append("text").attr("x", 14).attr("y", 9).style("fill", t.textMuted).style("font-size", "10px").style("font-family", t.mono).text("real")
    lg.append("circle").attr("cx", 5).attr("cy", 20).attr("r", 4).attr("fill", t.accent).attr("opacity", 0.7)
    lg.append("text").attr("x", 14).attr("y", 24).style("fill", t.textMuted).style("font-size", "10px").style("font-family", t.mono).text("synthetic")
  }

  function drawKS() {
    const el = barRef.current
    if (!el) return
    d3.select(el).selectAll("*").remove()
    const data = Object.entries(fidelity.ks_tests).map(([col, v]) => ({ col, stat: v.ks_statistic, pass: v.pass }))
    const W = el.clientWidth || 400, H = 180
    const m = { top: 12, right: 16, bottom: 36, left: 32 }
    const w = W - m.left - m.right, h = H - m.top - m.bottom

    const svg = d3.select(el).append("svg").attr("width", W).attr("height", H)
      .style("background", t.surfaceAlt)
      .append("g").attr("transform", `translate(${m.left},${m.top})`)

    const x = d3.scaleBand().domain(data.map(d => d.col)).range([0, w]).padding(0.35)
    const y = d3.scaleLinear().domain([0, Math.max(1, d3.max(data, d => d.stat) * 1.3)]).range([h, 0])

    svg.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x))
      .call(g => g.selectAll("text").style("fill", t.textMid).style("font-size", "10px").style("font-family", t.mono))
      .call(g => g.select(".domain").style("stroke", t.border))
      .call(g => g.selectAll(".tick line").remove())

    svg.append("g")
      .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format(".2f")))
      .call(g => g.selectAll("text").style("fill", t.textDim).style("font-size", "10px").style("font-family", t.mono))
      .call(g => g.select(".domain").style("stroke", t.border))
      .call(g => g.selectAll(".tick line").style("stroke", t.borderSub))

    svg.append("line")
      .attr("x1", 0).attr("x2", w).attr("y1", y(0.05)).attr("y2", y(0.05))
      .style("stroke", t.red).style("stroke-dasharray", "4,3").style("stroke-width", 0.5).style("opacity", 0.5)

    svg.selectAll(".bar").data(data).enter().append("rect")
      .attr("x", d => x(d.col)).attr("y", d => y(d.stat))
      .attr("width", x.bandwidth()).attr("height", d => h - y(d.stat))
      .attr("fill", d => d.pass ? t.accent : t.red).attr("opacity", 0.75).attr("rx", 3)
  }

  if (loading) return (
    <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
      <div style={{ fontSize: "12px", color: t.accent, letterSpacing: "0.06em" }}>› computing fidelity scores...</div>
    </div>
  )

  const ksTests = Object.entries(fidelity.ks_tests)
  const passCount = ksTests.filter(([, v]) => v.pass).length

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "14px" }}>
        {[
          { label: "overall score", val: `${fidelity.overall_score}%`, green: true },
          { label: "ks tests passed", val: `${passCount} / ${ksTests.length}` },
          { label: "correlation delta", val: fidelity.correlation_delta.toFixed(4) },
        ].map(s => (
          <div key={s.label} style={{ background: t.surface, border: `0.5px solid ${t.border}`,
            borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ fontSize: "10px", color: t.textDim, letterSpacing: "0.06em",
              textTransform: "uppercase", marginBottom: "6px" }}>{s.label}</div>
            <div style={{ fontSize: "22px", fontWeight: "500",
              color: s.green ? t.accent : t.text }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={cardTitle}>pca overlay — real vs synthetic</div>
        <div style={{ fontSize: "11px", color: t.textDim, marginBottom: "12px", letterSpacing: "0.03em" }}>
          points cluster together when distributions match
        </div>
        <div ref={pcaRef} style={{ width: "100%", borderRadius: "6px", overflow: "hidden" }} />
      </div>

      <div style={card}>
        <div style={cardTitle}>ks statistic per column</div>
        <div style={{ fontSize: "11px", color: t.textDim, marginBottom: "12px", letterSpacing: "0.03em" }}>
          lower is better — teal passes, red fails threshold
        </div>
        <div ref={barRef} style={{ width: "100%", borderRadius: "6px", overflow: "hidden" }} />
      </div>

      <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "12px", color: t.text, fontWeight: "500", marginBottom: "3px" }}>
            synthetic dataset ready
          </div>
          <div style={{ fontSize: "11px", color: t.textMuted }}>
            {trainData.rows_generated.toLocaleString()} rows · {trainData.columns.length} columns
          </div>
        </div>
        <a href={`http://127.0.0.1:8000/download/${trainData.synthetic_path.split("/").pop()}`}
          style={{ padding: "8px 20px", borderRadius: "6px", background: t.accent,
            color: t.bg, fontSize: "12px", fontWeight: "500",
            textDecoration: "none", letterSpacing: "0.04em", fontFamily: t.mono }}>
          download synthetic.csv
        </a>
      </div>
    </div>
  )
}