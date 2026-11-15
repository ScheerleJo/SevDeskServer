# API-Vertrag SevDeskServer

Version des Vertrags: **2.0** (gilt ab Server-Version `2.0.0`)

Dieses Dokument beschreibt die Schnittstelle zwischen dem Server und dem Web-Frontend
(SevDeskReact). Beide Seiten halten sich an diese Festlegungen. Änderungen an der
Schnittstelle werden zuerst hier eingetragen.

## Grundregeln

- **Basis-URL:** Alle Endpunkte liegen unter `/api`. Das Frontend verwendet relative Pfade
  (`/api/...`). Im Betrieb liefert der Server das gebaute Frontend selbst aus, in der
  Entwicklung leitet der Vite-Dev-Server `/api` an den Server weiter (Proxy).
- **Format:** Requests und Responses sind JSON (`Content-Type: application/json`).
  Ausnahmen: Upload und Download der LaTeX-Vorlage und der Download erzeugter Dateien
  (`.tex` als Text).
- **Methoden:**
  - `GET` liest und ändert nie etwas.
  - `POST` löst eine Aktion aus oder legt etwas an.
  - `PUT` ersetzt eine Ressource vollständig.
  - `PATCH` ändert einzelne Felder.
  - `DELETE` entfernt etwas.
- **Feldnamen:** camelCase.
- **Geldbeträge:** Zahlen in Euro mit höchstens zwei Nachkommastellen (`1650.5`), nie
  formatierte Strings. Formatiert wird im Frontend, z. B. mit
  `value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })`.
- **Datumsangaben:** ISO 8601. Reine Datumswerte als `YYYY-MM-DD`, Zeitpunkte als
  `YYYY-MM-DDTHH:mm:ss.sssZ`.
- **Speichern:** Jede Änderung am Datenstand wird sofort auf dem Server gespeichert.
  Es gibt kein manuelles Speichern/Laden mehr.
- **Gemeinsamer Stand:** Es gibt genau einen Datenstand auf dem Server. Alle, die das Tool
  im Browser öffnen, arbeiten auf demselben Stand.

## Fehler

Fehler werden immer mit einem passenden HTTP-Statuscode und diesem Body beantwortet:

```json
{ "error": { "code": "NO_CERTIFICATES", "message": "Es gibt keine geprüften Spender, für die eine Bescheinigung erstellt werden soll." } }
```

`code` ist maschinenlesbar und stabil, `message` ist ein deutscher Text, den das Frontend
direkt anzeigen kann.

| Status | `code` | Bedeutung |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request-Body oder Parameter ungültig |
| 400 | `NO_YEAR` | Es wurde noch kein Jahr geladen (`POST /api/sync` fehlt) |
| 400 | `NO_CERTIFICATES` | Keine Spender für eine Bescheinigung ausgewählt |
| 400 | `INVALID_TEMPLATE` | Hochgeladene Vorlage hat nicht die nötigen Marker |
| 404 | `NOT_FOUND` | Spender, Datei oder Endpunkt existiert nicht |
| 409 | `SYNC_RUNNING` | Ein Abruf von SevDesk läuft bereits |
| 412 | `TOKEN_MISSING` | Es ist kein SevDesk-API-Token hinterlegt |
| 502 | `SEVDESK_UNAUTHORIZED` | SevDesk hat den Token abgelehnt |
| 502 | `SEVDESK_ERROR` | SevDesk ist nicht erreichbar oder hat einen Fehler gemeldet |
| 500 | `INTERNAL_ERROR` | Unerwarteter Fehler auf dem Server |

## Datenmodell

### Donator

```json
{
  "id": "37188678",
  "status": "unchecked",
  "createCertificate": true,
  "academicTitle": "",
  "surename": "Max",
  "familyname": "Mustermann",
  "address": { "street": "Musterweg 1", "zip": "12345", "city": "Musterstadt", "country": "Deutschland" },
  "totalSum": 200,
  "sumInWords": "Zweihundert",
  "problems": [],
  "certificate": null,
  "donations": [
    { "id": "127188239", "date": "2025-10-11", "type": "Geldzuwendung", "waived": false, "sum": 200 }
  ]
}
```

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | SevDesk-Kontakt-ID. Bei Belegen ohne verknüpften Kontakt `voucher-<Beleg-ID>`. |
| `status` | `"unchecked"` \| `"error"` \| `"checked"` \| `"done"` | siehe Status-Ablauf |
| `createCertificate` | boolean | Ob bei `checked` eine Bescheinigung erstellt wird. Ersetzt den alten Status `checkedNotInPool`. |
| `academicTitle` | string | Titel, z. B. `Dr.` (leer, wenn keiner) |
| `surename` | string | Vorname(n), bei Firmen leer |
| `familyname` | string | Nachname bzw. Firmenname |
| `address` | Address | Nie `null`, fehlende Teile sind leere Strings |
| `totalSum` | number | Summe aller Spenden im Jahr |
| `sumInWords` | string | Summe in Worten für die Bescheinigung |
| `problems` | string[] | Gründe für `status: "error"` (z. B. `"Adresse fehlt"`) |
| `certificate` | `{ file, createdAt }` \| null | Zuletzt erzeugte Datei, in der dieser Spender enthalten ist |
| `donations` | Donation[] | Nach Datum aufsteigend sortiert |

### Donation

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | SevDesk-Beleg-ID |
| `date` | string `YYYY-MM-DD` | Belegdatum |
| `type` | string | Art der Zuwendung, aktuell immer `"Geldzuwendung"` |
| `waived` | boolean | Verzicht auf Erstattung von Aufwendungen |
| `sum` | number | Betrag |

### Status-Ablauf

```
unchecked ──prüfen──▶ checked ──POST /api/certificates──▶ done
error ─────prüfen──▶ checked
```

- `unchecked`: frisch importiert, Daten vollständig.
- `error`: frisch importiert, Daten unvollständig (siehe `problems`). Kann trotzdem auf
  `checked` gesetzt werden, wenn die Daten bewusst so übernommen werden sollen.
- `checked`: geprüft. Mit `createCertificate: true` kommt der Spender in die nächste
  Bescheinigungs-Datei, mit `false` nicht (wird aber in der Prüfsumme mitgezählt).
- `done`: Bescheinigung wurde erstellt.

Über `PATCH` kann jeder Status manuell gesetzt werden, z. B. zurück auf `unchecked`.

### Summary

```json
{
  "totalDonators": 109,
  "totalSum": 49867.27,
  "unchecked": 97,
  "error": 12,
  "checked": 0,
  "checkedWithoutCertificate": 0,
  "done": 0
}
```

`checked` zählt nur Spender mit `createCertificate: true`, die übrigen geprüften stehen in
`checkedWithoutCertificate`.

### State

Antwort aller Endpunkte, die Spender lesen oder ändern:

```json
{
  "year": 2025,
  "syncedAt": "2026-11-11T13:45:00.000Z",
  "summary": { "...": "siehe Summary" },
  "donators": [ { "...": "siehe Donator" } ]
}
```

Ist noch nichts geladen, sind `year` und `syncedAt` `null` und `donators` ist leer.

## Endpunkte

### System

#### `GET /api/health`

Server-Status, z. B. für die Anzeige „Server erreichbar“.

```json
{ "status": "ok", "version": "2.0.0", "tokenConfigured": true, "syncRunning": false }
```

### Spenderdaten

#### `GET /api/state`

Liefert den aktuellen [State](#state).

#### `POST /api/sync`

Holt alle Spenden eines Jahres neu von SevDesk. **Der bisherige Stand wird vollständig
ersetzt**, alle Prüfstatus gehen verloren.

Body: `{ "year": 2025 }` → Antwort: State

Fehler: `VALIDATION_ERROR`, `TOKEN_MISSING`, `SYNC_RUNNING`, `SEVDESK_*`

#### `POST /api/sync/new`

Holt die Spenden des geladenen Jahres und ergänzt nur Spender, die noch nicht im Stand
sind. Bestehende Spender bleiben unverändert (für neue Spenden eines bestehenden Spenders:
`POST /api/donators/:id/refetch`).

Body: keiner → Antwort: State

Fehler: `NO_YEAR`, `TOKEN_MISSING`, `SYNC_RUNNING`, `SEVDESK_*`

#### `PATCH /api/donators/:id`

Ändert Status und/oder `createCertificate` eines Spenders.

Body (mindestens eines der Felder):

```json
{ "status": "checked", "createCertificate": false }
```

Antwort: State. Fehler: `VALIDATION_ERROR`, `NOT_FOUND`

#### `PATCH /api/donators`

Wie oben, aber für mehrere Spender auf einmal (z. B. „alle ausgewählten als geprüft
markieren“). Unbekannte IDs führen zu `NOT_FOUND`, dann wird nichts geändert.

```json
{ "ids": ["37188678", "37188601"], "changes": { "status": "checked" } }
```

Antwort: State

#### `POST /api/donators/:id/refetch`

Lädt einen Spender neu von SevDesk (z. B. nachdem dort die Adresse korrigiert wurde). Der
Spender bekommt danach wieder den Status `unchecked` bzw. `error`.

Antwort: State. Fehler: `NOT_FOUND`, `NO_YEAR`, `TOKEN_MISSING`, `SYNC_RUNNING`, `SEVDESK_*`

#### `DELETE /api/donators/:id`

Entfernt einen Spender aus dem Tool. In SevDesk wird nichts gelöscht, mit
`POST /api/sync/new` kommt er wieder.

Antwort: State. Fehler: `NOT_FOUND`

### Bescheinigungen

#### `POST /api/certificates`

Erzeugt eine `.tex`-Datei mit allen Spendern mit `status: "checked"` und
`createCertificate: true` und setzt diese auf `done`.

Optionaler Body, um genau bestimmte Spender auszuwählen (z. B. für einen Neudruck). Erlaubt
sind dann Spender mit Status `checked` oder `done` und `createCertificate: true`:

```json
{ "ids": ["37188678"] }
```

Antwort (`201 Created`):

```json
{ "file": { "name": "Spendenbescheinigungen_2025_2026-11-11_14-30-00.tex", "size": 48211, "createdAt": "2026-11-11T14:30:00.000Z", "count": 42 }, "state": { "...": "State" } }
```

Fehler: `NO_YEAR`, `NO_CERTIFICATES`, `VALIDATION_ERROR`, `NOT_FOUND`

#### `GET /api/certificates`

Liste aller erzeugten Dateien, neueste zuerst:

```json
[ { "name": "Spendenbescheinigungen_2025_2026-11-11_14-30-00.tex", "size": 48211, "createdAt": "2026-11-11T14:30:00.000Z" } ]
```

#### `GET /api/certificates/:name`

Download der Datei (`Content-Disposition: attachment`). Fehler: `NOT_FOUND`

#### `DELETE /api/certificates/:name`

Löscht die Datei. Antwort: `204 No Content`. Fehler: `NOT_FOUND`

### Einstellungen

#### `PUT /api/token`

Speichert den SevDesk-API-Token. Der Token wird nie zurückgegeben, ob einer gesetzt ist,
steht in `GET /api/health`.

Body: `{ "token": "..." }` → Antwort: `204 No Content`

#### `GET /api/config`

Vereinsdaten und Zeilenschema für die Spendentabelle:

```json
{
  "company": {
    "name": "Theologische Fernschule e.\\,V.",
    "address": { "street": "...", "zip": "...", "city": "..." },
    "phone": "...", "email": "...", "url": "...",
    "bank": { "name": "...", "iban": "...", "bic": "..." }
  },
  "donationScheme": "<<donationdate>> & <<donationtype>> & <<donationtax>> & <<donationsum>> \\\\\n"
}
```

Die Werte werden unverändert in LaTeX eingesetzt, dürfen also LaTeX-Befehle enthalten
(z. B. `e.\,V.`).

#### `PUT /api/config`

Ersetzt die Konfiguration. Body: wie die Antwort von `GET /api/config`, alle Felder sind
Pflicht (Strings). Antwort: die gespeicherte Konfiguration.

Fehler: `VALIDATION_ERROR`

#### `GET /api/template`

Download der aktiven LaTeX-Vorlage (`template.tex`).

#### `PUT /api/template`

Ersetzt die LaTeX-Vorlage. Body: der Dateiinhalt als Text
(`Content-Type: text/plain` oder `application/x-tex`, max. 5 MB). Die bisherige Vorlage
wird vorher in `LaTeX-Templates/backup/` gesichert.

Die Vorlage muss die Marker `<<LETTERSTART>>` und `<<LETTEREND>>` enthalten. Antwort:
`{ "name": "template.tex", "size": 5123, "updatedAt": "..." }`

Fehler: `INVALID_TEMPLATE`

## Platzhalter in der Vorlage

Alles vor `<<LETTERSTART>>` ist der Kopf, alles nach `<<LETTEREND>>` der Schluss. Der Teil
dazwischen wird für jeden Spender wiederholt.

| Bereich | Platzhalter |
|---|---|
| Kopf | `<<fromname>>`, `<<fromstreet>>`, `<<fromzipcode>>`, `<<fromcity>>`, `<<fromphone>>`, `<<fromemail>>`, `<<fromurl>>`, `<<frombankname>>`, `<<fromiban>>`, `<<frombic>>`, `<<date>>` |
| Brief | `<<surename>>` (inkl. Titel), `<<familyname>>`, `<<street>>`, `<<zip>>`, `<<city>>`, `<<country>>`, `<<totalsum>>`, `<<suminwords>>`, `<<timeframe>>`, `<<donations>>` |
| `donationScheme` | `<<donationdate>>`, `<<donationtype>>`, `<<donationtax>>` (`ja`/`nein`), `<<donationsum>>` |

Spenderdaten werden LaTeX-sicher eingesetzt (Sonderzeichen wie `&`, `%`, `_`, `#` werden
maskiert). Vereinsdaten aus der Konfiguration werden unverändert übernommen.
