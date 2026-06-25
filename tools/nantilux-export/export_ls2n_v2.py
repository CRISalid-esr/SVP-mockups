"""Export LS2N v2 — phases 1 + 2.
Ajoute : partnerInstitutions (nom + pays via institutions.csv), sjrQuartile
(jointure scimago.csv via ISSN). Émet aussi countryNames.json (ISO2 -> {fr, echarts}).
Aucun nom d'auteur exporté."""
import json, math, os
import pandas as pd

BASE = r"C:\Users\godet-g\Documents\GitHub\nantilux\data\ls2n"
OUTDIR = r"C:\Users\godet-g\Documents\GitHub\maquettes\SoVisuPlus\src\mocks\data"

df = pd.read_parquet(os.path.join(BASE, "data.parquet"))
inst = pd.read_csv(os.path.join(BASE, "institutions.csv"))
sci = pd.read_csv(os.path.join(BASE, "scimago.csv"), sep=";")
if len(sci.columns) == 1:
    sci = pd.read_csv(os.path.join(BASE, "scimago.csv"))

# ── ISO2 -> {fr, echarts} (echarts = nom dans public/vendor/world.json ; '' si pas de polygone)
COUNTRY = {
    "AE": ("Émirats arabes unis", "United Arab Emirates"), "AF": ("Afghanistan", "Afghanistan"),
    "AM": ("Arménie", "Armenia"), "AR": ("Argentine", "Argentina"), "AT": ("Autriche", "Austria"),
    "AU": ("Australie", "Australia"), "BA": ("Bosnie-Herzégovine", "Bosnia and Herz."),
    "BD": ("Bangladesh", "Bangladesh"), "BE": ("Belgique", "Belgium"), "BG": ("Bulgarie", "Bulgaria"),
    "BI": ("Burundi", "Burundi"), "BJ": ("Bénin", "Benin"), "BR": ("Brésil", "Brazil"),
    "BY": ("Biélorussie", "Belarus"), "CA": ("Canada", "Canada"), "CH": ("Suisse", "Switzerland"),
    "CL": ("Chili", "Chile"), "CM": ("Cameroun", "Cameroon"), "CN": ("Chine", "China"),
    "CO": ("Colombie", "Colombia"), "CY": ("Chypre", "Cyprus"), "CZ": ("Tchéquie", "Czech Rep."),
    "DE": ("Allemagne", "Germany"), "DK": ("Danemark", "Denmark"), "DZ": ("Algérie", "Algeria"),
    "EE": ("Estonie", "Estonia"), "EG": ("Égypte", "Egypt"), "ES": ("Espagne", "Spain"),
    "FI": ("Finlande", "Finland"), "FR": ("France", "France"), "GB": ("Royaume-Uni", "United Kingdom"),
    "GF": ("Guyane française", ""), "GH": ("Ghana", "Ghana"), "GR": ("Grèce", "Greece"),
    "HK": ("Hong Kong", ""), "HU": ("Hongrie", "Hungary"), "ID": ("Indonésie", "Indonesia"),
    "IE": ("Irlande", "Ireland"), "IL": ("Israël", "Israel"), "IN": ("Inde", "India"),
    "IQ": ("Irak", "Iraq"), "IR": ("Iran", "Iran"), "IS": ("Islande", "Iceland"),
    "IT": ("Italie", "Italy"), "JP": ("Japon", "Japan"), "KP": ("Corée du Nord", "Dem. Rep. Korea"),
    "KR": ("Corée du Sud", "Korea"), "KW": ("Koweït", "Kuwait"), "KZ": ("Kazakhstan", "Kazakhstan"),
    "LB": ("Liban", "Lebanon"), "LU": ("Luxembourg", "Luxembourg"), "MA": ("Maroc", "Morocco"),
    "MC": ("Monaco", ""), "ML": ("Mali", "Mali"), "MO": ("Macao", ""),
    "MR": ("Mauritanie", "Mauritania"), "MX": ("Mexique", "Mexico"), "MY": ("Malaisie", "Malaysia"),
    "NC": ("Nouvelle-Calédonie", "New Caledonia"), "NE": ("Niger", "Niger"),
    "NL": ("Pays-Bas", "Netherlands"), "NO": ("Norvège", "Norway"), "NP": ("Népal", "Nepal"),
    "NZ": ("Nouvelle-Zélande", "New Zealand"), "OM": ("Oman", "Oman"), "PE": ("Pérou", "Peru"),
    "PK": ("Pakistan", "Pakistan"), "PL": ("Pologne", "Poland"), "PS": ("Palestine", "Palestine"),
    "PT": ("Portugal", "Portugal"), "RE": ("La Réunion", ""), "RO": ("Roumanie", "Romania"),
    "RS": ("Serbie", "Serbia"), "RU": ("Russie", "Russia"), "SA": ("Arabie saoudite", "Saudi Arabia"),
    "SE": ("Suède", "Sweden"), "SG": ("Singapour", "Singapore"), "SI": ("Slovénie", "Slovenia"),
    "SK": ("Slovaquie", "Slovakia"), "SN": ("Sénégal", "Senegal"), "SS": ("Soudan du Sud", "S. Sudan"),
    "SY": ("Syrie", "Syria"), "TH": ("Thaïlande", "Thailand"), "TN": ("Tunisie", "Tunisia"),
    "TR": ("Turquie", "Turkey"), "TW": ("Taïwan", ""), "UG": ("Ouganda", "Uganda"),
    "US": ("États-Unis", "United States"), "UZ": ("Ouzbékistan", "Uzbekistan"),
    "VN": ("Viêt Nam", "Vietnam"), "ZA": ("Afrique du Sud", "South Africa"),
}

EU_ISO2 = {"AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
           "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
           "SI", "ES", "SE"}

# ── inst_id -> (name, country_code)
inst_map = {r["inst_id"]: (r["name"], r.get("country_code"))
            for _, r in inst.iterrows()}

# ── ISSN normalisé -> quartile (split virgules, sans tiret, majuscule)
issn_col = next((c for c in sci.columns if "issn" in c.lower()), sci.columns[0])
q_col = next((c for c in sci.columns if "quartile" in c.lower() or "sjr best" in c.lower()),
             sci.columns[-1])
quart = {}
for _, r in sci[[issn_col, q_col]].dropna().iterrows():
    q = str(r[q_col]).strip()
    for part in str(r[issn_col]).split(","):
        norm = part.strip().replace("-", "").upper()
        if norm:
            quart[norm] = q  # keep last


def clean(v):
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return None
    return v


def tri(v):
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return None
    if isinstance(v, str):
        s = v.strip().lower()
        if s in ("true", "1"): return True
        if s in ("false", "0"): return False
        if s in ("", "nan", "none"): return None
    return bool(v)


def as_list(v):
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return []
    if isinstance(v, (list, tuple)):
        return [str(x) for x in v if x is not None and str(x) != "nan"]
    s = str(v).strip()
    if not s or s == "nan":
        return []
    for sep in ("|", ";", ","):
        if sep in s:
            return [p.strip() for p in s.split(sep) if p.strip()]
    return [s]


def quartile_for(issn):
    if issn is None or (isinstance(issn, float) and math.isnan(issn)):
        return None
    norm = str(issn).replace("-", "").strip().upper()
    if not norm or norm == "N/A":
        return None
    return quart.get(norm)


records = []
for _, r in df.iterrows():
    partners = []
    for iid in as_list(r.get("partner_institutions")):
        if iid in inst_map:
            name, cc = inst_map[iid]
            partners.append({"name": name, "cc": cc if isinstance(cc, str) else None})
    records.append({
        "year": int(r["year"]) if pd.notna(r["year"]) else None,
        "language": clean(r.get("language")),
        "isForeignLanguage": bool(r.get("is_foreign_language")) if pd.notna(r.get("is_foreign_language")) else False,
        "pubType": clean(r.get("pub_type")),
        "oaStatus": clean(r.get("oa_status")),
        "oaColor": clean(r.get("oa_color")),
        "isInternational": tri(r.get("is_international")),
        "hasApc": bool(r.get("has_apc")) if pd.notna(r.get("has_apc")) else False,
        "apcAmount": float(r["apc_amount"]) if pd.notna(r.get("apc_amount")) else None,
        "apcCurrency": clean(r.get("apc_currency")),
        "journal": clean(r.get("journal")),
        "countries": as_list(r.get("countries")),
        "partnerInstitutions": partners,
        "sjrQuartile": quartile_for(r.get("issn")),
        "fwci": float(r["fwci"]) if pd.notna(r.get("fwci")) else None,
        "citedByCount": int(r["cited_by_count"]) if pd.notna(r.get("cited_by_count")) else 0,
        "isTop10Percent": tri(r.get("is_top10_percent")),
        "isTop1Percent": tri(r.get("is_top1_percent")),
    })

with open(os.path.join(OUTDIR, "dashboard-publications.json"), "w", encoding="utf-8") as f:
    json.dump({"lab": "LS2N", "slug": "ls2n", "publications": records}, f, ensure_ascii=False)

names_out = {iso: {"fr": fr, "echarts": ec, "eu": iso in EU_ISO2}
             for iso, (fr, ec) in COUNTRY.items()}
with open(os.path.join(OUTDIR, "countryNames.json"), "w", encoding="utf-8") as f:
    json.dump(names_out, f, ensure_ascii=False)

# Diagnostics
present = set()
for r in records:
    present.update(r["countries"])
missing = sorted(present - set(COUNTRY.keys()))
q_match = sum(1 for r in records if r["sjrQuartile"])
size = os.path.getsize(os.path.join(OUTDIR, "dashboard-publications.json"))
print(f"OK -> {len(records)} publis, {size/1024:.0f} KB")
print("pays sans libellé:", missing or "aucun")
print("publis avec quartile SJR:", q_match)
print("scimago cols:", issn_col, "|", q_col, "| entries:", len(quart))
