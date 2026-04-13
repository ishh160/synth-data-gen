# SynthGen

A full-stack synthetic data generator built with CTGAN, FastAPI, and React.

Upload a real dataset → train a generative model → get statistically verified synthetic data with a visual fidelity proof.

![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-teal?style=flat-square)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square)
![CTGAN](https://img.shields.io/badge/CTGAN-SDV-purple?style=flat-square)

---

## What it does

Most synthetic data tools are black boxes. SynthGen generates synthetic tabular data and then **proves** the output is statistically indistinguishable from the real data using:

- **KS test** per column — checks if distributions match
- **Correlation matrix delta** — checks if feature relationships are preserved  
- **PCA overlay** — visual proof that real and synthetic data occupy the same space
- **Overall fidelity score** — single number summarizing data quality

---

## Tech stack

| Layer | Technology |
|---|---|
| Generative model | CTGAN (SDV) |
| Backend | FastAPI + Python |
| Statistical validation | SciPy, scikit-learn |
| Frontend | React + Vite |
| Visualization | D3.js |

---

## Getting started

**Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## How it works

1. **Upload** — drop any CSV, schema is auto-detected with type inference (numeric, categorical, boolean, datetime, ID)
2. **Configure** — set epochs, output row count, batch size, choose CTGAN or TabDDPM
3. **Train** — CTGAN learns the real data distribution and generates synthetic rows
4. **Verify** — fidelity dashboard shows KS tests, correlation delta, and PCA overlay proving the synthetic data matches the real data statistically

---

## Why this matters

Synthetic data solves real enterprise problems — HIPAA compliance, class imbalance, data sharing across teams. This project was built to demonstrate that synthetic data generation is only half the problem. The other half is **proving it works**.

---

## Author

Isha — Data Scientist · [LinkedIn](https://linkedin.com/in/yourprofile) · [GitHub](https://github.com/ishh160)
