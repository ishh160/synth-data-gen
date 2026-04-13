import pandas as pd
import numpy as np
from scipy import stats
from sklearn.decomposition import PCA
from sklearn.preprocessing import LabelEncoder

def compute_fidelity(real_df: pd.DataFrame, synthetic_df: pd.DataFrame) -> dict:
    results = {}

    # 1. KS test per numeric column
    ks_scores = {}
    for col in real_df.select_dtypes(include=np.number).columns:
        if col in synthetic_df.columns:
            stat, pval = stats.ks_2samp(
                real_df[col].dropna(),
                synthetic_df[col].dropna()
            )
            ks_scores[col] = {
                "ks_statistic": round(stat, 4),
                "p_value": round(pval, 4),
                "pass": bool(pval > 0.05)
            }
    results["ks_tests"] = ks_scores

    # 2. Correlation matrix difference
    real_corr = real_df.select_dtypes(include=np.number).corr()
    synth_corr = synthetic_df.select_dtypes(include=np.number).corr()
    corr_diff = (real_corr - synth_corr).abs().mean().mean()
    results["correlation_delta"] = round(float(corr_diff), 4)

    # 3. PCA overlay (real vs synthetic)
    combined = pd.concat([real_df, synthetic_df])
    encoded = combined.copy()
    for col in encoded.select_dtypes(include="object").columns:
        le = LabelEncoder()
        encoded[col] = le.fit_transform(encoded[col].astype(str))
    encoded = encoded.fillna(0)

    pca = PCA(n_components=2)
    components = pca.fit_transform(encoded)

    n_real = len(real_df)
    results["pca"] = {
        "real": [
            {"x": round(float(components[i][0]), 4),
             "y": round(float(components[i][1]), 4)}
            for i in range(min(n_real, 300))
        ],
        "synthetic": [
            {"x": round(float(components[n_real + i][0]), 4),
             "y": round(float(components[n_real + i][1]), 4)}
            for i in range(min(len(synthetic_df), 300))
        ]
    }

    # 4. Overall fidelity score
    ks_pass_rate = sum(
        1 for v in ks_scores.values() if v["pass"]
    ) / max(len(ks_scores), 1)
    corr_score = max(0, 1 - corr_diff)
    results["overall_score"] = round((ks_pass_rate + corr_score) / 2 * 100, 1)

    return results