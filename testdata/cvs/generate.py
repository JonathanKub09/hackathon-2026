# /// script
# requires-python = ">=3.10"
# dependencies = ["reportlab>=4"]
# ///
"""Erzeugt die Mock-Lebensläufe aus cvs.json. Das Format steht in README.md."""

import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

HERE = Path(__file__).parent
INK = HexColor("#1F2933")
RULE = HexColor("#CBD2D9")

NAME = ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=20, leading=25, textColor=INK)
HEADING = ParagraphStyle("heading", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=INK)
ENTRY = ParagraphStyle("entry", fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=INK)
DETAIL = ParagraphStyle(
    "detail",
    fontName="Helvetica",
    fontSize=10,
    leading=14,
    textColor=INK,
    leftIndent=9,
    firstLineIndent=-9,
)
BODY = ParagraphStyle("body", fontName="Helvetica", fontSize=10, leading=14, textColor=INK)


def para(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(escape(text), style)


def section(title: str) -> list:
    return [
        Spacer(1, 12),
        para(title, HEADING),
        HRFlowable(width="100%", thickness=0.6, color=RULE, spaceBefore=2, spaceAfter=6),
    ]


def entry(item: dict) -> KeepTogether:
    line = f"{item['von']} - {item['bis']} | {item['titel']} | {item['organisation']}"
    flowables = [para(line, ENTRY)]
    flowables += [para(f"- {detail}", DETAIL) for detail in item.get("details", [])]
    flowables.append(Spacer(1, 6))
    return KeepTogether(flowables)


def story(cv: dict) -> list:
    person = cv["identitaet"]
    flowables = [
        para(f"{person['vorname']} {person['nachname']}", NAME),
        para(f"E-Mail: {person['email']}", BODY),
        para(f"Telefon: {person['telefon']}", BODY),
        para(f"Ort: {person['ort']}", BODY),
    ]
    flowables += section("ERFAHRUNG") + [entry(item) for item in cv["erfahrung"]]
    flowables += section("AUSBILDUNG") + [entry(item) for item in cv["ausbildung"]]
    flowables += section("KENNTNISSE") + [para(", ".join(cv["kenntnisse"]), BODY)]
    flowables += section("SPRACHEN") + [para(", ".join(cv["sprachen"]), BODY)]
    return flowables


def main() -> None:
    cvs = json.loads((HERE / "cvs.json").read_text(encoding="utf-8"))
    for cv in cvs:
        document = SimpleDocTemplate(
            str(HERE / cv["datei"]),
            pagesize=A4,
            leftMargin=20 * mm,
            rightMargin=20 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
            title="Mock-Lebenslauf (fiktiv)",
            author="Hackathon-Testdaten",
            invariant=1,
        )
        document.build(story(cv))
        print(f"erzeugt: {cv['datei']}")


if __name__ == "__main__":
    main()
