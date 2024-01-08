# RoadMap

## Backend

- [x] get info from SevDesk
- [x] sort all information from SevDesk Data (get relevant Data from Donors)
- [x] Backend Cleanup
- [x] Format Array to push only useful information to GUI
- [x] Error: Numbers with more than 12 digits in Cent
<!-- - [ ] code the possibility to change wrong Data in the GUI and push to sevDesk -->
  <!-- - List all Data of specific user to be changend/corrected and then saved -->
- [x] Add to JSON-Object Zeitraum IMMER 01.01.XXXX - 31.12.XXXX des jeweiligen Jahres
- [x] Create String für Anrede Kommasepariert (Name, Straße Hausnummer, PLZ Stadt, (Land nur wenn nicht Deutschland))

- [x] manipulate latex files to the Data points in the table
- [x] create LaTeX file (on header, then blocks for each donator, then footer)
- [x] request to delete specific Item(s) in index.js
- [x] save current Status
- [x] If existent, load data from data.json automatically in server and wait for request in the table

- LATER:
  - [ ] code the possibility to set tags in Sevdesk and pull these to check whether a Donation-Certificate has been created
    <!-- - [ ] manage LaTeX files as PDF(Save to local Machine/send via mail/send via letter at sevdesk or other) -->

## Frontend

- [x] open "Window"/MessageBox on the open Main-Window with the background Greyed out
  - [x] Message Box (status-Info);
  - [x] View all Data sorted by customernumber
  - [x] Determine wether application is Standanlone and saves changed data and status to SevDesk before closing or as a Server with Access-Tool (Tauri Win Form)
- [x] create Styling
  - [x] Finish Colorscheme for light/darkmode
  - [x] finish titlebar
- [x] Gathering Data:
  - [x] Change Donation-Table to one column more with sum as writtenWord
  - [x] Enter Authorization-Key
  - [x] Button for Requesting Data with selectable Year
  - [x] Get Data on Startup
- [x] Automatically create a Table for all Sorted-Data-Points
  - [x] Delete Selected Data
  - [x] Move Donators between statuses and Send for individual Donator Info to Server to update the status
  - [x] Select all Donators at the Same Time
  - [x] only show Status speficic listings
  - [x] create ErrorListing for Entries without a customernumber with ID, supplierAtSave, date; (Create a DonationTable aswell)

## Extras

- [x] create LaTeX-Template
- [ ] create Documentation
- [ ] create Executable for Server and Frontend

## Future Stuff

- Button zum pdf erstellen
(- Frage ob alles passt, wenn ja wird Tag geschrieben (bei Contact als auch allen Voucher))
