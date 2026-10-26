"""Analysis for the cue-availability source-monitoring experiment (marked / unmarked-informed / co-produced).

Usage:  python analyze_source_monitoring.py <folder_with_jsPsych_csvs> [--min-rt 300]

Reads every CSV in the folder (session 1 and session 2), builds one row per test item
(recognition, source, confidence, belief), flags speeded trials, and prints:
  - data-quality checks (duration, filler accuracy, speeded trials, set x condition balance)
  - per-condition item memory (hit rate, foil false alarms) and source memory
  - source accuracy split by true source, and source bias (P(respond AI))
  - confidence for correct vs incorrect source judgments (metacognitive resolution)
  - belief by attributed source and by true source (P1: provenance-belief coupling)
  - item-level P(respond AI) for stimulus screening
  - session-2 retention for participants with both sessions
Writes tidy_test_items.csv next to the data.
"""
import argparse, glob, os
import numpy as np
import pandas as pd
from scipy.stats import norm

ap = argparse.ArgumentParser()
ap.add_argument("folder")
ap.add_argument("--min-rt", type=float, default=300.0, help="ms; faster recognition/source responses are flagged")
a = ap.parse_args()

rows, quality = [], []
for f in sorted(glob.glob(os.path.join(a.folder, "*"))):
    try:
        d = pd.read_csv(f, dtype=str)
    except Exception:
        continue
    if "phase" not in d.columns:
        continue
    pid, ses = d.pid.iloc[0], int(d.session.iloc[0])
    fl = d[d.phase == "filler"]
    fill_acc = np.mean([str(e).strip().lower() in str(r).lower() for r, e in zip(fl.response, fl.expected)]) if len(fl) else np.nan
    quality.append(dict(file=os.path.basename(f), pid=pid, session=ses, minutes=round(int(d.time_elapsed.iloc[-1]) / 60000, 1),
                        filler_acc=round(fill_acc, 2) if len(fl) else np.nan, order=d.order.iloc[0],
                        set_marked=d.set_marked.iloc[0], set_unmarked=d.set_unmarked.iloc[0], set_coproduced=d.set_coproduced.iloc[0]))
    t = d[d.phase == "test"].copy()
    t["response"] = t.response.astype(int); t["rt"] = t.rt.astype(float)
    for iid, g in t.groupby("item_id", sort=False):
        m = {r.measure: r for r in g.itertuples()}
        rows.append(dict(pid=pid, session=ses, item=iid, cond=g.condition.iloc[0], itype=g.item_type.iloc[0],
                         src=g.true_source.iloc[0], set=iid[0] if iid[0] in "ABC" else "foil",
                         said_old=int(m["recognition"].response == 0), said_ai=int(m["source"].response == 1),
                         conf=m["confidence"].response + 1, belief=m["belief"].response + 1,
                         rt_rec=m["recognition"].rt, rt_src=m["source"].rt))

T = pd.DataFrame(rows)
T["src_correct"] = (T.said_ai == (T.src == "ai")).astype(int)
T["speeded"] = (T.rt_rec < a.min_rt) | (T.rt_src < a.min_rt)
T.to_csv(os.path.join(a.folder, "tidy_test_items.csv"), index=False)
pd.set_option("display.width", 160)

def hdr(s): print("\n" + "=" * 8, s, "=" * 8)

hdr("Data quality"); print(pd.DataFrame(quality).to_string(index=False))
print("\nSpeeded trials (excluded below):"); print(T[T.speeded][["pid", "session", "item", "rt_rec", "rt_src"]].to_string(index=False))
s1 = T[(T.session == 1) & ~T.speeded]
st = s1[s1.itype == "study"]
hdr("Set x condition balance (participants)"); print(st.groupby(["set", "cond"]).pid.nunique().unstack(fill_value=0))

hdr("Session 1: by encoding condition")
g = st.groupby("cond").agg(n=("item", "size"), hit=("said_old", "mean"), source_acc=("src_correct", "mean"),
                           p_say_ai=("said_ai", "mean"), confidence=("conf", "mean"), belief=("belief", "mean"))
print(g.round(2))
fo = s1[s1.itype == "foil"]
print(f"foils: n={len(fo)}  FA={fo.said_old.mean():.2f}  P(say AI)={fo.said_ai.mean():.2f}  belief={fo.belief.mean():.2f}")

hdr("Source accuracy by condition x true source"); print(st.pivot_table(index="cond", columns="src", values="src_correct").round(2))

def sdt(df):  # source d' and c treating 'AI' as signal; log-linear correction
    h = (df[df.src == "ai"].said_ai.sum() + .5) / ((df.src == "ai").sum() + 1)
    fa = (df[df.src == "human"].said_ai.sum() + .5) / ((df.src == "human").sum() + 1)
    return pd.Series(dict(d_src=norm.ppf(h) - norm.ppf(fa), c_src=-(norm.ppf(h) + norm.ppf(fa)) / 2))
hdr("Source SDT per participant x condition (c > 0 = bias toward 'human')")
print(st.groupby(["pid", "cond"]).apply(sdt).unstack().round(2))

hdr("Confidence: correct vs incorrect source judgments"); print(st.pivot_table(index="cond", columns="src_correct", values="conf", aggfunc=["mean", "size"]).round(2))
hdr("Belief by attributed source (rows) and true source (cols)"); print(s1.pivot_table(index="said_ai", columns="src", values="belief", aggfunc=["mean", "size"]).round(2))
hdr("Belief for AI items by condition x attribution (P1)"); print(st[st.src == "ai"].pivot_table(index="cond", columns="said_ai", values="belief").round(2))
hdr("Item-level P(say AI) — screen items far from the panel mean"); print(s1.groupby(["item", "src"]).said_ai.agg(["mean", "size"]).round(2))

s2 = T[(T.session == 2) & ~T.speeded]
if len(s2):
    hdr("Session 2 (delayed) by condition")
    print(s2[s2.itype == "study"].groupby("cond").agg(n=("item", "size"), hit=("said_old", "mean"), source_acc=("src_correct", "mean"),
                                                       p_say_ai=("said_ai", "mean"), confidence=("conf", "mean")).round(2))
