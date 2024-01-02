# SevDeskDonations

 A tool to automatically create Donation-Certificates depending on the data from SevDesk

## Simple structure

- Back-End
  - [x] get info from SevDesk
  - [x] sort all information from SevDesk Data (get relevant Data from Donors)
  - [x] Backend Cleanup
  - [x] Format Array to push only useful information to GUI
  <!-- - [ ] code the possibility to change wrong Data in the GUI and push to sevDesk -->
    <!-- - List all Data of specific user to be changend/corrected and then saved -->
  - [x] Add to JSON-Object Zeitraum IMMER 01.01.XXXX - 31.12.XXXX des jeweiligen Jahres
  - [x] Create String für Anrede Kommasepariert (Name, Straße Hausnummer, PLZ Stadt, (Land nur wenn nicht Deutschland))

  - [x] manipulate latex files to the Data points in the table
  - [x] create LaTeX file (on header, then blocks for each donator, then footer)
  - [ ] request to delete specific Item(s) in index.js
  - [ ] save current Status
    - [ ] When not yet successfully done: save JSON-Doc locally. On Startup look for JSON-File. If existent, load data from there automatically in the table

- LATER:
  - [ ] code the possibility to set tags in Sevdesk and pull these to check whether a Donation-Certificate has been created
    <!-- - [ ] manage LaTeX files as PDF(Save to local Machine/send via mail/send via letter at sevdesk or other) -->

- Front-End/GUI
  - [ ] open "Window"/MessageBox on the open Main-Window with the background Greyed out
  - [x] View all Data sorted by customernumber
  - [x] Determine wether application is Standanlone and saves changed data and status to SevDesk before closing or as a Server with Access-Tool (Tauri Win Form)
  - [ ] create Styling
    - [ ] Finish Colorscheme for light/darkmode
    - [ ] finish titlebar
  - [ ] Gathering Data:
    - [ ] Change Donation-Table to one column more with sum as writtenWord
    - [ ] Enter Authorization-Key
    - [ ] Button for Requesting Data with selectable Year
  - [ ] Automatically create a Table for all Sorted-Data-Points
    - [ ] Alert: first save then overwrite existing Table
    - [ ] only show Status speficic listings
    - [ ] create ErrorListing for Entries without a customernumber with ID, supplierAtSave, date; (Create a DonationTable aswell)
- Extras
  - [x] create LaTeX-Template

- Tag für successful erstellte Donation Certificates

- abhaken, wenn geprüft
- mehrere gleichzeitig abhaken      [FutureMusic](ttps://stackoverflow.com/questions/659508/how-can-i-shift-select-multiple-checkboxes-like-gmail)
- Button zum pdf erstellen
(- Frage ob alles passt, wenn ja wird Tag geschrieben (bei Contact als auch allen Voucher))
