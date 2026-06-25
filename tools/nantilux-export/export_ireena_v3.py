"""Export IREENA v3 — phases 1, 2 et 3.
Bascule le jeu de démo sur IREENA (a des équipes via effectifs.csv).
Dérive : teams par publication (appariement authors_lab <-> membres), hasPhd,
authorsMeta pseudonymisés (Chercheur N, teams, isPhd), authorIds par publication.
Aucun nom d'auteur réel n'est exporté (réseau en pseudonymes)."""
import json, math, os, unicodedata
import pandas as pd

BASE = r"C:\Users\godet-g\Documents\GitHub\nantilux\data\ireena"
OUTDIR = r"C:\Users\godet-g\Documents\GitHub\maquettes\SoVisuPlus\src\mocks\data"
TEAM_UNKNOWN = "Non identifié"
# Anonymisation des libellés d'équipe (UTR1/2/3 -> Équipe 1/2/3) pour la maquette.
TEAM_RENAME = {"UTR1": "Équipe 1", "UTR2": "Équipe 2", "UTR3": "Équipe 3"}

df = pd.read_parquet(os.path.join(BASE, "data.parquet"))
inst = pd.read_csv(os.path.join(BASE, "institutions.csv"))
sci = pd.read_csv(os.path.join(BASE, "scimago.csv"), sep=";")
if len(sci.columns) == 1:
    sci = pd.read_csv(os.path.join(BASE, "scimago.csv"))
eff = pd.read_csv(os.path.join(BASE, "effectifs.csv"), sep=";")

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
    "ET": ("Éthiopie", "Ethiopia"), "FI": ("Finlande", "Finland"), "FR": ("France", "France"),
    "GB": ("Royaume-Uni", "United Kingdom"), "GF": ("Guyane française", ""), "GH": ("Ghana", "Ghana"),
    "GR": ("Grèce", "Greece"), "HK": ("Hong Kong", ""), "HU": ("Hongrie", "Hungary"),
    "ID": ("Indonésie", "Indonesia"), "IE": ("Irlande", "Ireland"), "IL": ("Israël", "Israel"),
    "IN": ("Inde", "India"), "IQ": ("Irak", "Iraq"), "IR": ("Iran", "Iran"),
    "IS": ("Islande", "Iceland"), "IT": ("Italie", "Italy"), "JO": ("Jordanie", "Jordan"),
    "JP": ("Japon", "Japan"), "KP": ("Corée du Nord", "Dem. Rep. Korea"),
    "KR": ("Corée du Sud", "Korea"), "KW": ("Koweït", "Kuwait"), "KZ": ("Kazakhstan", "Kazakhstan"),
    "LB": ("Liban", "Lebanon"), "LT": ("Lituanie", "Lithuania"), "LU": ("Luxembourg", "Luxembourg"),
    "LY": ("Libye", "Libya"), "MA": ("Maroc", "Morocco"), "MC": ("Monaco", ""), "ML": ("Mali", "Mali"),
    "MO": ("Macao", ""), "MR": ("Mauritanie", "Mauritania"), "MX": ("Mexique", "Mexico"),
    "MY": ("Malaisie", "Malaysia"), "NC": ("Nouvelle-Calédonie", "New Caledonia"),
    "NE": ("Niger", "Niger"), "NL": ("Pays-Bas", "Netherlands"), "NO": ("Norvège", "Norway"),
    "NP": ("Népal", "Nepal"), "NZ": ("Nouvelle-Zélande", "New Zealand"), "OM": ("Oman", "Oman"),
    "PE": ("Pérou", "Peru"), "PK": ("Pakistan", "Pakistan"), "PL": ("Pologne", "Poland"),
    "PS": ("Palestine", "Palestine"), "PT": ("Portugal", "Portugal"), "RE": ("La Réunion", ""),
    "RO": ("Roumanie", "Romania"), "RS": ("Serbie", "Serbia"), "RU": ("Russie", "Russia"),
    "SA": ("Arabie saoudite", "Saudi Arabia"), "SE": ("Suède", "Sweden"),
    "SG": ("Singapour", "Singapore"), "SI": ("Slovénie", "Slovenia"), "SK": ("Slovaquie", "Slovakia"),
    "SN": ("Sénégal", "Senegal"), "SS": ("Soudan du Sud", "S. Sudan"), "SY": ("Syrie", "Syria"),
    "TH": ("Thaïlande", "Thailand"), "TN": ("Tunisie", "Tunisia"), "TR": ("Turquie", "Turkey"),
    "TW": ("Taïwan", ""), "UA": ("Ukraine", "Ukraine"), "UG": ("Ouganda", "Uganda"),
    "US": ("États-Unis", "United States"), "UZ": ("Ouzbékistan", "Uzbekistan"),
    "VN": ("Viêt Nam", "Vietnam"), "ZA": ("Afrique du Sud", "South Africa"),
}
EU_ISO2 = {"AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
           "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
           "SI", "ES", "SE"}

def _f(v):
    return float(v) if pd.notna(v) else None


inst_map = {
    r["inst_id"]: (
        r["name"],
        r.get("country_code"),
        r.get("city") if pd.notna(r.get("city")) else None,
        _f(r.get("latitude")),
        _f(r.get("longitude")),
    )
    for _, r in inst.iterrows()
}

issn_col = next((c for c in sci.columns if "issn" in c.lower()), sci.columns[0])
q_col = next((c for c in sci.columns if "quartile" in c.lower() or "sjr best" in c.lower()), sci.columns[-1])
quart = {}
for _, r in sci[[issn_col, q_col]].dropna().iterrows():
    q = str(r[q_col]).strip()
    for part in str(r[issn_col]).split(","):
        norm = part.strip().replace("-", "").upper()
        if norm:
            quart[norm] = q


def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s)
                    if unicodedata.category(c) != "Mn")


def norm_name(s):
    return strip_accents(str(s)).lower().strip()


# ── Membres : nom complet normalisé -> (teams, isPhd)
members = {}
for _, r in eff.iterrows():
    full = f"{r['Prénom']} {r['Nom de famille']}"
    eq = r["Équipes"]
    teams = ([] if pd.isna(eq)
             else [TEAM_RENAME.get(t.strip(), t.strip())
                   for t in str(eq).split("|")
                   if t.strip() and t.strip().lower() != "nan"])
    is_phd = str(r["Type"]).strip().lower().startswith("doctorant")
    members[norm_name(full)] = {"teams": teams, "isPhd": is_phd}


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
    for sep in ("|", ";"):
        if sep in s:
            return [p.strip() for p in s.split(sep) if p.strip()]
    return [s]


def quartile_for(issn):
    if issn is None or (isinstance(issn, float) and math.isnan(issn)):
        return None
    n = str(issn).replace("-", "").strip().upper()
    if not n or n == "N/A":
        return None
    return quart.get(n)


# ── Pseudonymisation des auteurs internes (authors_lab), ordre déterministe
all_authors = set()
for v in df["authors_lab"].dropna():
    for a in as_list(v):
        all_authors.add(a)
ordered = sorted(all_authors, key=lambda s: norm_name(s))
author_id = {name: i for i, name in enumerate(ordered)}

authors_meta = []
for name in ordered:
    m = members.get(norm_name(name))
    authors_meta.append({
        "id": author_id[name],
        "label": f"Chercheur {author_id[name] + 1}",
        "teams": m["teams"] if m else [],
        "isPhd": bool(m["isPhd"]) if m else False,
    })

records = []
for _, r in df.iterrows():
    lab_authors = as_list(r.get("authors_lab"))
    ids = [author_id[a] for a in lab_authors if a in author_id]
    # équipes de la publication = union des équipes des auteurs membres appariés
    teams = set()
    has_phd = False
    for a in lab_authors:
        m = members.get(norm_name(a))
        if m:
            teams.update(m["teams"])
            if m["isPhd"]:
                has_phd = True
    team_list = sorted(teams) if teams else [TEAM_UNKNOWN]

    partners = []
    for iid in as_list(r.get("partner_institutions")):
        if iid in inst_map:
            nm, cc, city, lat, lon = inst_map[iid]
            partners.append({
                "name": nm,
                "cc": cc if isinstance(cc, str) else None,
                "city": city,
                "lat": lat,
                "lon": lon,
            })

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
        "subfields": as_list(r.get("subfields")),
        "partnerInstitutions": partners,
        "sjrQuartile": quartile_for(r.get("issn")),
        "fwci": float(r["fwci"]) if pd.notna(r.get("fwci")) else None,
        "citedByCount": int(r["cited_by_count"]) if pd.notna(r.get("cited_by_count")) else 0,
        "isTop10Percent": tri(r.get("is_top10_percent")),
        "isTop1Percent": tri(r.get("is_top1_percent")),
        # phase 3
        "teams": team_list,
        "authorIds": ids,
        "hasPhd": has_phd,
    })

out = {"lab": "IREENA", "slug": "ireena", "publications": records,
       "authors": authors_meta}
with open(os.path.join(OUTDIR, "dashboard-publications.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)

names_out = {iso: {"fr": fr, "echarts": ec, "eu": iso in EU_ISO2}
             for iso, (fr, ec) in COUNTRY.items()}
with open(os.path.join(OUTDIR, "countryNames.json"), "w", encoding="utf-8") as f:
    json.dump(names_out, f, ensure_ascii=False)

present = set()
for r in records:
    present.update(r["countries"])
missing = sorted(present - set(COUNTRY.keys()))
size = os.path.getsize(os.path.join(OUTDIR, "dashboard-publications.json"))
n_matched = sum(1 for a in authors_meta if a["teams"])
n_phd = sum(1 for a in authors_meta if a["isPhd"])
team_pubs = {}
for r in records:
    for tm in r["teams"]:
        team_pubs[tm] = team_pubs.get(tm, 0) + 1
print(f"OK -> {len(records)} publis, {len(authors_meta)} auteurs internes, {size/1024:.0f} KB")
print("pays sans libellé:", missing or "aucun")
print("auteurs appariés à une équipe:", n_matched, "| doctorants:", n_phd)
print("publis avec quartile:", sum(1 for r in records if r['sjrQuartile']))
print("publis par équipe:", team_pubs)
print("publis impliquant doctorant:", sum(1 for r in records if r['hasPhd']))
