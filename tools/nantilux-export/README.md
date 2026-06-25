# Scripts d'export Nantilux → mocks du tableau de bord

Génèrent les données mock du tableau de bord SoVisu+ à partir des données Nantilux
(`C:\Users\godet-g\Documents\GitHub\nantilux\data\<slug>\`).

**Aucun nom d'auteur réel n'est exporté** (agrégats ; réseau pseudonymisé).

| Script | Jeu | Couvre | Sortie |
|---|---|---|---|
| `export_ireena_v3.py` | **IREENA** (courant) | Phases 1-3 (équipes + doctorants via `effectifs.csv`) | `src/mocks/data/dashboard-publications.json` + `countryNames.json` |
| `export_ls2n_v2.py` | LS2N | Phases 1-2 uniquement (pas d'`effectifs.csv`) | idem |

## Lancer

```bash
"C:/ProgramData/anaconda3/python.exe" tools/nantilux-export/export_ireena_v3.py
```

Nécessite `pandas` + `pyarrow`. Le descriptif fonctionnel du tableau de bord (écran par
écran, charts, modèle de données) est dans `public/prompts/dashboard.md`.
