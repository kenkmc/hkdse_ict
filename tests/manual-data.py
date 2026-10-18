"""Validate this author's ten textbook units and execute their SQLite examples.
Only local JSON, repository source, in-memory SQLite and Python standard libraries.
Run: python tests/manual-data.py
"""
from pathlib import Path
import json, math, re, sqlite3

ROOT = Path(__file__).resolve().parents[1]
PACK = json.loads((ROOT / "course-manual/data/data.json").read_text(encoding="utf-8"))
UNITS = {u["id"]: u for u in PACK["units"]}
EXPECTED = ["cha-1", "cha-2", "cha-3", "cha-4", "cha-5", "chb-1", "chb-2", "ea-1", "ea-2", "ea-3"]
assert PACK["schemaVersion"] == 1 and list(UNITS) == EXPECTED
checks = 0

def ok(condition, message):
    global checks
    assert condition, message
    checks += 1

def text(value, message):
    ok(isinstance(value, str) and bool(value.strip()), message)
    ok(not re.search(r"</?(?:div|p|span|script|iframe|img|a|table|br|section)\b", value, re.I), "HTML in " + message)

def strings(values, message, minimum=1):
    ok(isinstance(values, list) and len(values) >= minimum, message)
    for i, value in enumerate(values):
        text(value, f"{message}[{i}]")

plan = (ROOT / "assets/js/lesson-plan-data.js").read_text(encoding="utf-8")
for uid, unit in UNITS.items():
    for key in ["title", "syllabusRef", "intro"]:
        text(unit[key], f"{uid}.{key}")
    for key in ["question", "answer"]:
        text(unit["readiness"][key], f"{uid}.readiness.{key}")
    strings(unit["outcomes"], uid + ".outcomes", 4)
    ok(len(unit["outcomes"]) <= 8, uid + " excessive outcomes")
    ok(all(p in UNITS for p in unit["prerequisites"]), uid + " prerequisite IDs")
    ok(len(unit["vocabulary"]) >= 4, uid + " vocabulary")
    for word in unit["vocabulary"]:
        for key in ["term", "english", "meaning", "example"]:
            text(word[key], uid + ".vocabulary." + key)
    ok(len(unit["sections"]) >= 4, uid + " section count")
    ids = [s["id"] for s in unit["sections"]]
    ok(len(ids) == len(set(ids)), uid + " duplicate section ID")
    for section in unit["sections"]:
        sid = uid + "." + section["id"]
        text(section["title"], sid + ".title")
        strings(section["explanation"], sid + ".explanation", 2)
        ok(len(section["explanation"]) <= 4, sid + " paragraph count")
        for key in ["question", "answer"]:
            text(section["worked"][key], sid + ".worked." + key)
        strings(section["worked"]["steps"], sid + ".worked.steps", 2)
        c = section["check"]
        text(c["question"], sid + ".check.question")
        ok(len(c["options"]) == len(c["feedback"]) == 4, sid + " four options/feedback")
        ok(type(c["correct"]) is int and 0 <= c["correct"] < 4, sid + " answer index")
        strings(c["options"], sid + ".options", 4)
        strings(c["feedback"], sid + ".feedback", 4)
        ok(len(set(c["feedback"])) == 4, sid + " option-specific feedback")
        for link in section.get("links", []):
            text(link["label"], sid + ".link label")
            href = link["href"]
            ok(not re.match(r"(?:https?:|/)", href), sid + " local relative link")
            file, _, anchor = href.partition("#")
            ok((ROOT / file).is_file(), sid + " linked file " + file)
            if anchor.startswith("sim-"):
                page_plan = re.search(r"'" + re.escape(file[:-5]) + r"'\s*:\s*\[(.*?)\]", plan, re.S)
                ok(page_plan is not None and ("sim:'" + anchor[4:] + "'") in page_plan.group(1), sid + " mounted scene " + href)
            elif anchor:
                html = (ROOT / file).read_text(encoding="utf-8")
                ok(re.search(r"\bid\s*=\s*['\"]" + re.escape(anchor) + r"['\"]", html) is not None, sid + " HTML anchor " + href)
        if "code" in section:
            for key in ["language", "text"]:
                text(section["code"][key], sid + ".code." + key)
        if "table" in section:
            table = section["table"]
            ok(len(table["headers"]) > 0 and all(len(row) == len(table["headers"]) for row in table["rows"]), sid + " table shape")
    ok(len(unit["practice"]) >= 6, uid + " practice count")
    ok({q["level"] for q in unit["practice"]} == {"foundation", "exam", "transfer"}, uid + " practice levels")
    ok(len({q["id"] for q in unit["practice"]}) == len(unit["practice"]), uid + " question IDs")
    for q in unit["practice"]:
        for key in ["question", "answer"]:
            text(q[key], uid + "." + q["id"] + "." + key)
        strings(q["hints"], uid + "." + q["id"] + ".hints")
        ok(len(q["marking"]) > 0, uid + "." + q["id"] + ".marking")
        for point in q["marking"]:
            text(point["point"], uid + "." + q["id"] + ".point")
            ok(type(point["marks"]) is int and point["marks"] > 0, uid + " positive marks")
    practical = unit["practical"]
    text(practical["title"], uid + ".practical.title")
    for key in ["tools", "steps", "deliverables", "answerNotes"]:
        strings(practical[key], uid + ".practical." + key)
    ok(len(practical["tests"]) >= 3, uid + " practical tests")
    for test in practical["tests"]:
        for key in ["input", "expected", "reason"]:
            text(test[key], uid + ".practical.test." + key)
    teacher = unit["teacher"]
    for period in teacher["periods"]:
        ok(period["minutes"] in (40, 80), uid + " lesson length")
        ok(sum(a["minutes"] for a in period["activities"]) == period["minutes"], uid + " activity total")
        for key in ["title", "objective"]:
            text(period[key], uid + ".teacher." + key)
        for activity in period["activities"]:
            ok(type(activity["minutes"]) is int and activity["minutes"] > 0, uid + " positive activity duration")
            for key in ["action", "evidence"]:
                text(activity[key], uid + ".activity." + key)
    for key, fields in [("diagnostic", ["question", "expected", "ifWrong"]), ("differentiation", ["support", "stretch"]), ("exitTicket", ["question", "answer"])]:
        for field in fields:
            text(teacher[key][field], uid + ".teacher." + key + "." + field)
    text(teacher["homework"], uid + ".homework")
    strings(teacher["assessmentNotes"], uid + ".assessmentNotes")
    ok(len(unit["mastery"]) >= 3, uid + " mastery")
    for row in unit["mastery"]:
        for key in ["skill", "evidence", "remediation"]:
            text(row[key], uid + ".mastery." + key)

def section(uid, sid):
    return next(s for s in UNITS[uid]["sections"] if s["id"] == sid)

def run_script(connection, script):
    """Execute the authored example in order, retaining each SELECT result."""
    results, pending = [], ""
    for line in script.splitlines():
        if line.lstrip().startswith("--"):
            continue
        pending += line + "\n"
        if sqlite3.complete_statement(pending):
            cursor = connection.execute(pending)
            if cursor.description:
                results.append(cursor.fetchall())
            pending = ""
    ok(not pending.strip(), "unterminated authored SQL")
    return results

# A5: execute the displayed query against the displayed setup, not a renamed test fixture.
db = sqlite3.connect(":memory:", isolation_level=None)
run_script(db, section("cha-5", "maintain")["code"]["text"])
ok(run_script(db, section("cha-5", "query")["code"]["text"]) == [[("Amy", 80)]], "A5 original query")
db.execute("UPDATE MANUAL_STUDENT SET Score=85 WHERE StudentID='S02'")
ok(db.execute("SELECT Name,Score FROM MANUAL_STUDENT WHERE Class='4A' AND Score>=70 ORDER BY Score DESC").fetchall() == [("Bo",85),("Amy",80)], "A5 updated query")
try:
    db.execute("INSERT INTO MANUAL_STUDENT VALUES ('S01','Other','4A',75)")
    raise AssertionError("A5 duplicate PK accepted")
except sqlite3.IntegrityError:
    checks += 1
db.close()

# EA1: actual foreign key, PK, UNIQUE, CHECK and nullable-FK behaviour.
db = sqlite3.connect(":memory:", isolation_level=None)
run_script(db, section("ea-1", "integrity")["code"]["text"])
for row in [("S1","other@example.invalid","Cy","C1",80),("S3","s3@example.invalid","Cy","C9",80),("S4","s4@example.invalid","Di","C1",120),("S9","s1@example.invalid","Xi","C1",80)]:
    try:
        db.execute("INSERT INTO M_STUDENT VALUES (?,?,?,?,?)", row)
        raise AssertionError("EA1 constraint accepted " + str(row))
    except sqlite3.IntegrityError:
        checks += 1
db.execute("INSERT INTO M_STUDENT VALUES ('S5','s5@example.invalid','Eve',NULL,80)")
ok(db.execute("SELECT COUNT(*) FROM M_STUDENT").fetchone() == (2,), "EA1 nullable FK")
ok(run_script(db, section("ea-1","transaction")["code"]["text"]) == [[("A",100),("B",50)]], "EA1 authored rollback")
db.execute("BEGIN")
db.execute("UPDATE M_BANK SET Balance=Balance-20 WHERE ID='A'")
db.execute("UPDATE M_BANK SET Balance=Balance+20 WHERE ID='B'")
db.execute("COMMIT")
ok(db.execute("SELECT * FROM M_BANK ORDER BY ID").fetchall() == [("A",80),("B",70)], "EA1 successful transfer")
db.close()

# EA2: execute every authored SQL block; all returned rows are checked.
db = sqlite3.connect(":memory:", isolation_level=None)
run_script(db, section("ea-2","ea2-fixture")["code"]["text"])
expected = {
 "ea2-select": [[("Cy","4B"),("Di","4B"),("Amy","4A"),("Bo","4A")]],
 "ea2-conditions": [[("S1","C1",80),("S1","C2",60)]],
 "ea2-expressions": [[("S1",80,72.0),("S1",60,54.0),("S2",50,45.0),("S3",90,81.0),("S3",None,None)],[("S-01",)]],
 "ea2-aggregate": [[(5,4,280,70.0,50,90)]],
 "ea2-group": [[("C1",3,220/3)]],
 "ea2-inner": [[("Cy","ICT",90),("Amy","ICT",80)]],
 "ea2-outer": [[("S1","Amy","C1",80),("S1","Amy","C2",60),("S2","Bo","C1",50),("S3","Cy","C1",90),("S3","Cy","C3",None),("S4","Di",None,None)],[("S4","Di")]],
 "ea2-subquery": [[("S1","C1",80),("S3","C1",90)],[("S1","Amy"),("S2","Bo"),("S3","Cy")]],
 "ea2-maintain": [[("S2","C1",50)],[(65,)],[(50,)]],
 "ea2-view": [[("S1","C1",80),("S1","C2",60),("S3","C1",90)]]
}
for sid, expected_rows in expected.items():
    ok(run_script(db,section("ea-2",sid)["code"]["text"]) == expected_rows, "EA2 authored results " + sid)
for pid in ["ea2-p1","ea2-p3","ea2-p4","ea2-p5","ea2-p6","ea2-p7","ea2-p9"]:
    answer = next(p["answer"] for p in UNITS["ea-2"]["practice"] if p["id"] == pid)
    queries = re.findall(r"SELECT\b[^;]+;", answer)
    ok(bool(queries), "EA2 executable practice " + pid)
    results = [db.execute(sql).fetchall() for sql in queries]
    want = {
      "ea2-p1":[[("S4","Di"),("S3","Cy")]],
      "ea2-p3":[[("S3","C1",90),("S1","C1",80),("S1","C2",60)]],
      "ea2-p4":[[("4A",3,3,190/3),("4B",2,1,90.0)]],
      "ea2-p5":[[("S1","Amy"),("S2","Bo"),("S3","Cy")],[("S4","Di")]],
      "ea2-p6":[[("Cy","ICT",90),("Amy","ICT",80)]],
      "ea2-p7":[[("S1","Amy",2),("S2","Bo",0),("S3","Cy",1),("S4","Di",0)]],
      "ea2-p9":[[("4A",2,3,190/3),("4B",2,1,90.0)]]
    }[pid]
    ok(results == want, "EA2 practice result " + pid)
ok(db.execute("SELECT COUNT(*),COUNT(Mark),AVG(Mark) FROM M_SQL_RESULT WHERE Mark<0").fetchone() == (0,0,None), "EA2 empty set")
ok(db.execute("SELECT COUNT(*),COUNT(Mark),AVG(Mark) FROM M_SQL_RESULT WHERE CID='C3'").fetchone() == (1,0,None), "EA2 missing value")
ok(db.execute("SELECT COUNT(*) FROM M_SQL_RESULT WHERE SID='S1' OR CID='C2'").fetchone() == (2,), "EA2 erroneous DELETE scope")
db.execute("BEGIN")
db.execute("DELETE FROM M_SQL_RESULT WHERE SID='S1' AND CID='C2'")
ok(db.execute("SELECT COUNT(*) FROM M_SQL_RESULT").fetchone() == (4,), "EA2 correct DELETE count")
db.execute("ROLLBACK")
ok(db.execute("SELECT COUNT(*) FROM M_SQL_RESULT").fetchone() == (5,), "EA2 DELETE rollback")
ok(db.execute("SELECT COUNT(*) FROM M_HIGH").fetchone() == (3,), "EA2 view baseline")
db.execute("BEGIN")
db.execute("UPDATE M_SQL_RESULT SET Mark=65 WHERE SID='S2' AND CID='C1'")
ok(db.execute("SELECT COUNT(*) FROM M_HIGH").fetchone() == (4,), "EA2 view changes")
db.execute("ROLLBACK")
ok(db.execute("SELECT COUNT(*) FROM M_HIGH").fetchone() == (3,), "EA2 view rollback")
try:
    db.execute("INSERT INTO M_SQL_RESULT VALUES ('S9','C1',80)")
    raise AssertionError("EA2 orphan FK accepted")
except sqlite3.IntegrityError:
    checks += 1
db.close()

# Quantitative examples: recompute from independent arithmetic / supplied bytes.
ok(int("10101101",2) == int("AD",16) == 173, "A3 base conversion")
ok(-128+64+32+16+2+1 == -13 and ((-13)&255) == int("11110011",2), "A3 signed decode")
for a,b,result,carry,overflow in [(7,1,8,0,True),(-1,1,0,1,False),(5,-3,2,1,False)]:
    total=(a&15)+(b&15)
    signed=(total&15) if total&15<8 else (total&15)-16
    ok(total&15 == result and (total>>4)==carry and ((not -8<=a+b<=7)==overflow), "A3 carry/overflow")
ok(len("A中😀".encode("utf-8")) == 8, "A3 actual UTF-8")
ok(320*240*24/8 == 230400 and 230400/1024 == 225, "A3 image bytes")
ok(8000*16*2*30/8 == 960000 and 960000/1024 == 937.5, "A3 PCM bytes")
ok(100*80*8*10*5/8+8000*8*1*5/8 == 440000, "A3 raw video+audio")
ok(16000*8*20/8 == 320000 and 16000*16*2*20/8 == 1280000, "A3 audio factor")
ok((300000+80000)/(600000+80000)*100 == 55.88235294117647, "A3 video half FPS with fixed audio")
sales=[20,15,10,16]
ok(sum(sales)==61 and sum(sales)/4==15.25, "A4 amount")
ok(math.isclose(sum(x*.9 for x in sales),54.9) and math.isclose(sum(x*.8 for x in sales),48.8), "A4 discount links")
ok((60*2+90*8)/10==84 and (70*20+90*5)/25==74, "A4 weighted means")
ok(math.ceil(205/(12-7))==41 and (8-5)*40-120==0, "A4 break even")
ok(2**16*16/8/1024==128 and 2**12*4/1024==16, "B1 address capacity")
ok(1/2e9*1e9==.5 and 1/500e6*1e9==2, "B1 clock period")
ok(2*8+20==36 and 3*11==33, "EA3 preserved sold-price totals")

print(json.dumps({"units":len(UNITS),"sections":sum(len(u["sections"]) for u in UNITS.values()),"practice":sum(len(u["practice"]) for u in UNITS.values()),"checks":checks,"sqlite":sqlite3.sqlite_version,"status":"passed"}, ensure_ascii=False))
