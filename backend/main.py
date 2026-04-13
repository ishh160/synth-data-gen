from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import os
UPLOADS_DIR = "uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    contents = await file.read()
    
    # save the file to disk
    save_path = os.path.join(UPLOADS_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(contents)
    
    df = pd.read_csv(io.BytesIO(contents))

    schema = []
    for col in df.columns:
        dtype = df[col].dtype
        null_pct = round(df[col].isnull().mean() * 100, 1)
        unique_ratio = df[col].nunique() / len(df)

        if pd.api.types.is_numeric_dtype(dtype):
            col_type = "ID" if unique_ratio > 0.95 else "numeric"
        elif pd.api.types.is_datetime64_any_dtype(dtype):
            col_type = "datetime"
        elif df[col].nunique() == 2:
            col_type = "boolean"
        else:
            col_type = "categorical"

        schema.append({
            "column": col,
            "detected_type": col_type,
            "null_pct": null_pct,
            "include": col_type != "ID"
        })

    return {
        "rows": len(df),
        "columns": len(df.columns),
        "filepath": save_path,
        "schema": schema
    }

@app.get("/health")
def health():
    return {"status": "ok"}


from fastapi.responses import FileResponse
from model import train_and_generate
import os

@app.post("/train")
async def train(payload: dict):
    filepath = payload["filepath"]
    schema   = payload["schema"]
    epochs   = payload.get("epochs", 300)
    num_rows = payload.get("num_rows", None)
    batch    = payload.get("batch_size", 500)

    synthetic_df, out_path = train_and_generate(
        filepath, schema, epochs, num_rows, batch
    )

    return {
        "status": "done",
        "synthetic_path": out_path,
        "rows_generated": len(synthetic_df),
        "columns": list(synthetic_df.columns)
    }

@app.get("/download/{filename}")
async def download(filename: str):
    path = os.path.join("uploads", filename)
    if not os.path.exists(path):
        return {"error": "file not found"}
    return FileResponse(path, media_type="text/csv", filename=filename)

from fidelity import compute_fidelity

@app.post("/fidelity")
async def fidelity(payload: dict):
    real_path = payload["real_path"]
    synthetic_path = payload["synthetic_path"]

    real_df = pd.read_csv(real_path)
    synth_df = pd.read_csv(synthetic_path)

    scores = compute_fidelity(real_df, synth_df)
    return scores