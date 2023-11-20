# SevDeskDonations

 A tool to automatically create Donation-Certificates depending on the data from SevDesk

## Simple structure

- Back-End
  - [x] get info from SevDesk
  - [x] sort all information from SevDesk Data (get relevant Data from Donors)
  - [x] Backend Cleanup
  - [ ] Format Array to push useful information to GUI only
  <!-- - [ ] code the possibility to change wrong Data in the GUI and push to sevDesk -->
    <!-- - List all Data of specific user to be changend/corrected and then saved -->
  - [ ] manipulate latex files to the Data points in the table
  - [ ] code the possibility to set tags in Sevdesk and pull these to check whether a Donation-Certificate has been created
  - [ ] create LaTeX files
  - [ ] manage LaTeX files as PDF(Save to local Machine/send via mail/send via letter at sevdesk or other)
  - [ ] Save Data parsed from Frontend

- Front-End/GUI
  - [ ] View all Data sorted by customernumber
  - [ ] Determine wether application is Standanlone and saves changed data and status to SevDesk before closing or as a Server with Access-Tool (Tauri Win Form)
  - [ ] create Styling
    - Finish Colorscheme for light/darkmode
    - finish titlebar
  - [ ] Gathering Data:
    - Enter Authorization-Key
    - Button for Requesting Data with selectable Year
  - [ ] Automatically create a Table for all Sorted-Data-Points
    - Alert: first save then overwrite existing Table

- Extras
  - [ ] create LaTeX-Template

- Tag für successful erstellte Donation Certificates

- abhaken, wenn geprüft
- mehrere gleichzeitig abhaken
- Button zum pdf erstellen
(- Frage ob alles passt, wenn ja wird Tag geschrieben (bei Contact als auch allen Voucher))
