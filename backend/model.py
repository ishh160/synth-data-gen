import pandas as pd
import numpy as np
from ctgan import CTGAN
import os, uuid, json

UPLOADS_DIR = "uploads"

def train_and_generate(
    filepath: str,
    schema: list,
    epochs: int = 300,
    num_rows: int = None,
    batch_size: int = 500,
):
    df = pd.read_csv(filepath)

    included = [col for col in schema if col["include"]]
    columns_to_use = [col["column"] for col in included]
    discrete_cols = [
        col["column"] for col in included
        if col["detected_type"] in ("categorical", "boolean")
    ]

    df = df[columns_to_use]

    model = CTGAN(
        epochs=epochs,
        batch_size=batch_size,
        verbose=True
    )
    model.fit(df, discrete_columns=discrete_cols)

    n = num_rows if num_rows else len(df)
    synthetic_df = model.sample(n)

    out_id = str(uuid.uuid4())[:8]
    out_path = os.path.join(UPLOADS_DIR, f"synthetic_{out_id}.csv")
    synthetic_df.to_csv(out_path, index=False)

    return synthetic_df, out_path