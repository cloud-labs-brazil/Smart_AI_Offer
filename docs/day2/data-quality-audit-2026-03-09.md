# Auditoria de Qualidade de Dados - 2026-03-09

## Escopo
- Arquivo de mapeamento: `DN_ARQ_9_3_2026.xlsx`
- Arquivo de producao analisado: `JIRA PBI (JIRA Indra) 2026-03-09T19_24_10-0300 - Copia.csv`
- Volume analisado: **1704 linhas**, **52 colunas**

## Resultado executivo
- Cobertura de mapeamento login->nome/email no CSV: **10.21%** (29/284)
- Logins sem mapeamento: **255**
- Regras de qualidade acionadas: **CRITICAL=1**, **ERROR=1**, **WARNING=0**

## Principais lacunas de mapeamento (top 30)
- `emoura` (277 ocorrencias)
- `holiveiram` (239 ocorrencias)
- `jdoss` (107 ocorrencias)
- `sbarbosa` (103 ocorrencias)
- `glopesal` (87 ocorrencias)
- `aangelo` (85 ocorrencias)
- `epereirab` (85 ocorrencias)
- `fdosa` (84 ocorrencias)
- `dbarul` (83 ocorrencias)
- `fcrivano` (79 ocorrencias)
- `kgruszkowska` (74 ocorrencias)
- `bsoarest` (66 ocorrencias)
- `speres` (66 ocorrencias)
- `vgrecci` (61 ocorrencias)
- `lgustavof` (57 ocorrencias)
- `dlucas` (52 ocorrencias)
- `laattianese` (52 ocorrencias)
- `amalheiros` (51 ocorrencias)
- `fabarcel` (51 ocorrencias)
- `aalexb` (48 ocorrencias)
- `tmoreirab` (46 ocorrencias)
- `ikolomenconkovas` (45 ocorrencias)
- `mpiazza` (45 ocorrencias)
- `prnascimento` (45 ocorrencias)
- `amiraldi` (41 ocorrencias)
- `mglattstein` (41 ocorrencias)
- `aazevedol` (40 ocorrencias)
- `dcapretz` (39 ocorrencias)
- `dcavalari` (39 ocorrencias)
- `lfernandol` (39 ocorrencias)

## RCA (causa raiz)
1. O pipeline resolve nomes via `services/ingestion/team_map.json`, mas o cadastro atual cobre apenas parte dos logins produtivos.
2. O Excel contem 33 colaboradores e o CSV possui centenas de logins distintos historicos/externos.
3. Sem gate bloqueante de mapeamento, os logins nao mapeados aparecem como `[unresolved]` no dashboard.

## Guardrails obrigatorios antes de producao
1. Gate G1 - Integridade estrutural (52 colunas + header contratual em ordem).
2. Gate G2 - Campos obrigatorios (`Issue key`, `Assignee`, `Created`).
3. Gate G3 - Mapeamento humano 100% (`missing_logins == 0`) para upload produtivo.
4. Gate G4 - Datas e valores financeiros validos.
5. Gate G5 - Persistencia com trilha de auditoria (hash + correlation_id + RCA).

## Artefatos gerados
- `docs/day2/login-mapping-resolved-2026-03-09.csv`
- `docs/day2/login-mapping-missing-for-completion-2026-03-09.csv`
- `docs/day2/jira-production-column-profile-2026-03-09.csv`
- `docs/day2/jira-production-quality-findings-2026-03-09.csv`
