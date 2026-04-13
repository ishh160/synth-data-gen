import { useState } from "react"
import Upload from "./components/Upload"
import ModelConfig from "./components/ModelConfig"
import FidelityDashboard from "./components/FidelityDashboard"
import { t } from "./theme"

export default function App() {
  const [step, setStep] = useState(1)
  const [uploadData, setUploadData] = useState(null)
  const [trainData, setTrainData] = useState(null)
  const [fidelityData, setFidelityData] = useState(null)

  const steps = ["01 upload", "02 config", "03 fidelity"]

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 32px", fontFamily: t.mono }}>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.accent }} />
          <div>
            <div style={{ fontSize: "13px", fontWeight: "500", color: t.text, letterSpacing: "0.05em" }}>SynthGen</div>
            <div style={{ fontSize: "11px", color: t.textDim, letterSpacing: "0.04em", marginTop: "2px" }}>synthetic data generator</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {steps.map((label, i) => {
            const s = i + 1
            const active = step === s
            const done = step > s
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {i > 0 && <span style={{ color: t.textDim, fontSize: "10px" }}>›</span>}
                <div style={{
                  fontSize: "11px", padding: "4px 12px", borderRadius: "4px",
                  letterSpacing: "0.04em",
                  background: active ? t.accent : done ? t.accentBg : "transparent",
                  color: active ? t.bg : done ? t.accent : t.textDim,
                  border: active ? "none" : done ? `0.5px solid ${t.accentDim}` : `0.5px solid ${t.border}`,
                  fontWeight: active ? "500" : "400"
                }}>{done ? `✓ ${label}` : label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {step === 1 && <Upload onComplete={(d) => { setUploadData(d); setStep(2) }} />}
      {step === 2 && <ModelConfig uploadData={uploadData} onComplete={(d) => { setTrainData(d); setStep(3) }} />}
      {step === 3 && <FidelityDashboard uploadData={uploadData} trainData={trainData} onComplete={setFidelityData} />}
    </div>
  )
}