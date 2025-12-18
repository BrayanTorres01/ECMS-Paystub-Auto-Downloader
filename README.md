# ECMS Paystub Auto Downloader

A Tampermonkey userscript that automatically downloads all employee paystub PDFs from the ECMS Employee History Inquiry page.

This script is designed to be simple for end users while safely handling large batches of paystubs without disrupting normal ECMS usage.

---

## Features

- One-click automatic download of all paystubs on the page
- Runs downloads in a separate worker tab to keep ECMS usable
- Progress indicator showing how many paystubs have been processed
- Clear completion message when finished
- Optional custom filename prefix
- Optional inclusion of the week-ending date in filenames
- Clean, integrated toolbar that matches ECMS styling
- Safe handling of missing or skipped documents

---

## Installation

1. Install the Tampermonkey browser extension
2. Create a new userscript
3. Paste the script code into Tampermonkey
4. Save the script

The script will automatically activate on ECMS pages.

---

## How to Use

1. Log into ECMS
2. Navigate to:
   Payroll → Employee History Inquiry
3. Load an employee so the paystub table is visible
4. At the top of the page, locate the Paystub Download toolbar
5. Optional:
   - Enter text in the filename field to prefix downloaded PDFs
   - Toggle “Include weekend date” to control filename format
6. Click **Auto Download Paystubs**
7. Downloads will begin in a separate tab
8. A status message will appear when all paystubs are finished

You may continue working in ECMS while downloads are running.

---

## Filename Rules

- If text is entered and “Include weekend date” is checked:
# ECMS Paystub Auto Downloader

A Tampermonkey userscript that automatically downloads all employee paystub PDFs from the ECMS Employee History Inquiry page.

This script is designed to be simple for end users while safely handling large batches of paystubs without disrupting normal ECMS usage.

---

## Features

- One-click automatic download of all paystubs on the page
- Runs downloads in a separate worker tab to keep ECMS usable
- Progress indicator showing how many paystubs have been processed
- Clear completion message when finished
- Optional custom filename prefix
- Optional inclusion of the week-ending date in filenames
- Clean, integrated toolbar that matches ECMS styling
- Safe handling of missing or skipped documents

---

## Installation

1. Install the Tampermonkey browser extension
2. Create a new userscript
3. Paste the script code into Tampermonkey
4. Save the script

The script will automatically activate on ECMS pages.

---

## How to Use

1. Log into ECMS
2. Navigate to:
   Payroll → Employee History Inquiry
3. Load an employee so the paystub table is visible
4. At the top of the page, locate the Paystub Download toolbar
5. Optional:
   - Enter text in the filename field to prefix downloaded PDFs
   - Toggle “Include weekend date” to control filename format
6. Click **Auto Download Paystubs**
7. Downloads will begin in a separate tab
8. A status message will appear when all paystubs are finished

You may continue working in ECMS while downloads are running.

---

## Filename Rules

- If text is entered and “Include weekend date” is checked:
YourText 03-31-2019.pdf
- If text is entered and date is unchecked:
YourText.pdf
- If no text is entered:
03-31-2019.pdf


The script will always ensure filenames are valid and never blank.

---

## Status Messages

- **Ready**: Script is idle
- **Running**: Downloads are in progress
- **Finished**: All available paystubs have been downloaded
- **Skipped**: Indicates documents that could not be retrieved

The completion message is shown only once per run to avoid duplicate alerts.

---

## Safety and Notes

- The script does not modify ECMS data
- Downloads are read-only
- Popup blockers must allow the worker tab to open
- Designed for internal ECMS environments

---

## Versioning

This repository may evolve as ECMS layouts change or additional usability improvements are needed.

---

## Disclaimer

This script is intended for internal business use only.  
Use only with systems you are authorized to access.
