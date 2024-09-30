# RoadMap

## Backend

- [x] manipulate latex files to the Data points in the table
- [x] create LaTeX file (on header, then blocks for each donator, then footer)
- [x] request to delete specific Item(s) in index.js
- [ ] Save the config properties to specific file.

- LATER:
  - [ ] code the possibility to set tags in Sevdesk and pull these to check whether a Donation-Certificate has been created
  - [x] rewrite Latex-Output to use a Template with specified IDs
  - [ ] manage LaTeX files as PDF(Save to local Machine/send via mail/send via letter at sevdesk or other)
  - Refactor and Cleanup
    - [x] formatting
    - [x] config
    - [x] fileHandling
    - [x] output
    - [x] requests

## Frontend

- [ ] Recreate Frontend in React
- [ ] sorting for different criterias (maybe with arrows next to column-heading) (either sort in react-Table or in sorting.js in backend)

- [ ] Set SaveData Path in FileSaveDialog
- [ ] Create some form of indicator, if the Server is doing something or not (Loadingbar, rotating Circle, ...)
- [ ] Make Latex Template bindings in admin Panel (let user create own bindings to the template shortcuts)

Es gibt zwei Stadien:
Offen: alle ungeprüften Spenden
Geprüft: alle Spendeneinträge die geprüft wurden. Hier gibt es zwei unterkategorien:

- Geprüft und zum Pool der zu erstellenden Spendenquittungen hinzufügen.
- Geprüft und nicht zum Pool hinzufügen, aber trotzdem in der Prüfsumme berücksichtigen.

## Extras

- [x] create LaTeX-Template
- [ ] create Documentation
- [ ] create Executable for Server
- [ ] create Documentation for Frontend
- [ ] - Button zum pdf erstellen

## Future Stuff

(- Frage ob alles passt, wenn ja wird Tag geschrieben (bei Contact als auch allen Voucher))

## Fragen

- Wird bei der Signature in Latex das tatsächliche Datum genommen oder immer der 1.1.xx?
