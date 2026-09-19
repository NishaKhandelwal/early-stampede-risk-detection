#!/usr/bin/env python3
"""
extract_results.py
------------------
Reads the project's SQLite database (analytics + alerts tables) and writes
results_auto.tex, which chapter4_results_findings.tex loads automatically.
Every number comes from the database; nothing is estimated or invented.

USAGE (run on the laptop where you tested, from anywhere):

  1) See what test runs exist in the database:
       python extract_results.py --db backend/app/database/stampede.db --list

     Runs are separated automatically: rows of the same camera_id are split
     into separate runs whenever there is a time gap larger than --gap
     seconds (default 30). Each processed video therefore becomes one run
     even if every upload used the same camera_id.

  2) Pick the runs that are your real test videos and generate the file:
       python extract_results.py --db backend/app/database/stampede.db \
              --runs 1 2 3 --labels "Video 1" "Video 2" "Video 3"

  3) Put results_auto.tex in the same folder as chapter4_results_findings.tex
     and compile. Stop the backend (or copy the .db file) first if you get a
     "database is locked" message.
"""

import argparse
import datetime
import os
import sqlite3
import sys


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------
def ts(row):
    return datetime.datetime.fromisoformat(row["timestamp"])


def tex_escape(s):
    for a, b in (("\\", r"\textbackslash{}"), ("&", r"\&"), ("%", r"\%"),
                 ("$", r"\$"), ("#", r"\#"), ("_", r"\_"), ("{", r"\{"),
                 ("}", r"\}")):
        s = s.replace(a, b)
    return s


def f_int(x):
    return "--" if x is None else str(int(x))


def f_dec(x, nd=2):
    return "--" if x is None else f"{x:.{nd}f}"


def f_dens(x):
    """Density can be ~1e-5 (persons/pixel) or ~10-100 (persons/Mpx)."""
    if x is None:
        return "--"
    if x == 0:
        return "0"
    if abs(x) < 0.01 or abs(x) >= 10000:
        mant, exp = f"{x:.2e}".split("e")
        return f"${float(mant):g}\\times10^{{{int(exp)}}}$"
    return f"{x:.4g}"


def mean(v):
    return sum(v) / len(v) if v else None


def counts(rows, col, keys):
    out = {k: 0 for k in keys}
    for r in rows:
        v = r[col]
        if v in out:
            out[v] += 1
    return out


# --------------------------------------------------------------------------
# load + split into runs
# --------------------------------------------------------------------------
def load(db_path):
    if not os.path.exists(db_path):
        sys.exit(f"Database not found: {db_path}")
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    analytics = con.execute("SELECT * FROM analytics ORDER BY id").fetchall()
    try:
        alerts = con.execute("SELECT * FROM alerts ORDER BY id").fetchall()
    except sqlite3.OperationalError:
        alerts = []
    con.close()
    return analytics, alerts


def split_runs(rows, gap):
    by_cam = {}
    for r in rows:
        by_cam.setdefault(r["camera_id"], []).append(r)
    runs = []
    for cam, rs in by_cam.items():
        cur = [rs[0]]
        for prev, r in zip(rs, rs[1:]):
            if (ts(r) - ts(prev)).total_seconds() > gap:
                runs.append((cam, cur))
                cur = []
            cur.append(r)
        runs.append((cam, cur))
    runs.sort(key=lambda x: ts(x[1][0]))
    return runs


def run_stats(cam, rs, alerts):
    people = [r["people_count"] or 0 for r in rs]
    dens = [r["density_score"] or 0.0 for r in rs]
    motion = [r["motion_score"] for r in rs if r["motion_score"] is not None]
    start, end = ts(rs[0]), ts(rs[-1])
    wall = (end - start).total_seconds()
    thr = (len(rs) - 1) / wall if wall > 0 and len(rs) > 1 else None

    a = [x for x in alerts
         if x["camera_id"] == cam
         and start - datetime.timedelta(seconds=1)
         <= datetime.datetime.fromisoformat(x["timestamp"])
         <= end + datetime.timedelta(seconds=5)]

    return {
        "cam": cam, "rows": rs, "start": start, "end": end,
        "n": len(rs), "people": people, "dens": dens, "motion": motion,
        "wall": wall, "thr": thr,
        "dlev": counts(rs, "density_level", ("LOW", "MEDIUM", "HIGH")),
        "mlev": counts(rs, "motion_level", ("LOW", "MEDIUM", "HIGH")),
        "risk": counts(rs, "risk_level", ("NORMAL", "WARNING", "HIGH RISK")),
        "a_warn": sum(1 for x in a if x["risk_level"] == "WARNING"),
        "a_high": sum(1 for x in a if x["risk_level"] == "HIGH RISK"),
        "a_ack": sum(1 for x in a if x["acknowledged"] == 1),
    }


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default="backend/app/database/stampede.db")
    ap.add_argument("--gap", type=float, default=30.0,
                    help="seconds of silence that separates two runs")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--runs", type=int, nargs="*")
    ap.add_argument("--labels", nargs="*")
    ap.add_argument("--out", default="results_auto.tex")
    args = ap.parse_args()

    analytics, alerts = load(args.db)
    if not analytics:
        sys.exit("The analytics table is empty: process a video first.")
    runs = split_runs(analytics, args.gap)

    if args.list or not args.runs:
        print(f"{len(runs)} run(s) found (gap > {args.gap:g}s starts a new run)\n")
        print(f"{'#':>3}  {'camera_id':<18}{'start':<21}{'frames':>7}"
              f"{'people min/max':>16}{'wall s':>9}")
        for i, (cam, rs) in enumerate(runs, 1):
            p = [r["people_count"] or 0 for r in rs]
            w = (ts(rs[-1]) - ts(rs[0])).total_seconds()
            print(f"{i:>3}  {cam:<18}{ts(rs[0]).strftime('%Y-%m-%d %H:%M:%S'):<21}"
                  f"{len(rs):>7}{min(p):>8}/{max(p):<7}{w:>9.1f}")
        if not args.runs:
            print("\nRe-run with  --runs <numbers>  to generate results_auto.tex")
            return

    chosen = []
    for i in args.runs:
        if not 1 <= i <= len(runs):
            sys.exit(f"Run {i} does not exist (1..{len(runs)})")
        chosen.append(run_stats(*runs[i - 1], alerts))

    labels = args.labels or []
    while len(labels) < len(chosen):
        labels.append(f"Video {len(labels) + 1}")

    # ---- pooled statistics over the selected runs ----
    all_rows = [r for c in chosen for r in c["rows"]]
    people = [x for c in chosen for x in c["people"]]
    dens = [x for c in chosen for x in c["dens"]]
    motion = [x for c in chosen for x in c["motion"]]
    dlev = {k: sum(c["dlev"][k] for c in chosen) for k in ("LOW", "MEDIUM", "HIGH")}
    mlev = {k: sum(c["mlev"][k] for c in chosen) for k in ("LOW", "MEDIUM", "HIGH")}
    risk = {k: sum(c["risk"][k] for c in chosen) for k in ("NORMAL", "WARNING", "HIGH RISK")}
    a_warn = sum(c["a_warn"] for c in chosen)
    a_high = sum(c["a_high"] for c in chosen)
    a_ack = sum(c["a_ack"] for c in chosen)
    thr = [c["thr"] for c in chosen if c["thr"] is not None]

    # ---- table rows ----
    rows_a, rows_b = [], []
    for lab, c in zip(labels, chosen):
        L = tex_escape(lab)
        pm = mean(c["people"])
        mm = mean(c["motion"])
        rows_a.append(
            f"{L} & {c['n']} & {f_int(min(c['people']))}/{f_dec(pm,1)}/{f_int(max(c['people']))}"
            f" & {f_dens(min(c['dens']))}--{f_dens(max(c['dens']))}"
            f" & {f_dec(min(c['motion']) if c['motion'] else None)}/{f_dec(mm)}/"
            f"{f_dec(max(c['motion']) if c['motion'] else None)}"
            f" & {f_dec(c['wall'],1)} & {f_dec(c['thr'],2)} \\\\")
        rows_b.append(
            f"{L} & {c['dlev']['LOW']}/{c['dlev']['MEDIUM']}/{c['dlev']['HIGH']}"
            f" & {c['mlev']['LOW']}/{c['mlev']['MEDIUM']}/{c['mlev']['HIGH']}"
            f" & {c['risk']['NORMAL']}/{c['risk']['WARNING']}/{c['risk']['HIGH RISK']}"
            f" & {c['a_warn']}/{c['a_high']} \\\\")

    hasrisk = risk["WARNING"] + risk["HIGH RISK"] > 0
    hasalerts = (a_warn + a_high) > 0
    scaled = max(dens) > 1.0

    def m(name, val):
        return f"\\renewcommand{{\\{name}}}{{{val}}}\n"

    out = ["% AUTO-GENERATED by extract_results.py: do not edit by hand.\n",
           f"% generated {datetime.datetime.now().isoformat(timespec='seconds')} "
           f"from {os.path.basename(args.db)}\n",
           m("NumCases", len(chosen)),
           m("TotalFrames", len(all_rows)),
           m("PeopleMinAll", f_int(min(people))),
           m("PeopleMaxAll", f_int(max(people))),
           m("PeopleMeanAll", f_dec(mean(people), 1)),
           m("DensityMinAll", f_dens(min(dens))),
           m("DensityMaxAll", f_dens(max(dens))),
           m("MotionFrames", len(motion)),
           m("MotionMinAll", f_dec(min(motion) if motion else None)),
           m("MotionMaxAll", f_dec(max(motion) if motion else None)),
           m("MotionMeanAll", f_dec(mean(motion))),
           m("DensLow", dlev["LOW"]), m("DensMed", dlev["MEDIUM"]), m("DensHigh", dlev["HIGH"]),
           m("MotLow", mlev["LOW"]), m("MotMed", mlev["MEDIUM"]), m("MotHigh", mlev["HIGH"]),
           m("RiskNormal", risk["NORMAL"]), m("RiskWarning", risk["WARNING"]),
           m("RiskHigh", risk["HIGH RISK"]), m("RiskTotal", sum(risk.values())),
           m("AlertWarn", a_warn), m("AlertHigh", a_high),
           m("AlertTotal", a_warn + a_high), m("AlertAck", a_ack),
           m("ThroughputMin", f_dec(min(thr), 2) if thr else "--"),
           m("ThroughputMax", f_dec(max(thr), 2) if thr else "--"),
           f"\\has{'risk'}{'true' if hasrisk else 'false'}\n",
           f"\\hasalerts{'true' if hasalerts else 'false'}\n",
           f"\\densityscaled{'true' if scaled else 'false'}\n",
           "\\renewcommand{\\TableCaseRows}{%\n" + "\n".join(rows_a) + "\n}\n",
           "\\renewcommand{\\TableLevelRows}{%\n" + "\n".join(rows_b) + "\n}\n"]

    with open(args.out, "w", encoding="utf-8") as fh:
        fh.writelines(out)

    print(f"\nWrote {args.out}  ({len(chosen)} run(s), {len(all_rows)} processed frames)")
    print(f"  people min/mean/max : {min(people)}/{mean(people):.1f}/{max(people)}")
    print(f"  density max         : {max(dens):.6g}   (scaled={scaled})")
    print(f"  risk counts         : {risk}")
    print(f"  alerts (W/H)        : {a_warn}/{a_high}")
    if not hasrisk:
        print("\n  NOTE: every frame is NORMAL. The chapter will describe this honestly.\n"
              "  If you expected Warning/High Risk, the density thresholds need\n"
              "  recalibration (see the earlier audit) before re-running your videos.")


if __name__ == "__main__":
    main()
