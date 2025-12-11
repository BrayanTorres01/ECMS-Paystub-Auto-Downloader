# ECMS-Paystub-Auto-Downloader
A Tampermonkey userscript that automates downloading paystub PDFs from the ECMS Employee History Inquiry screen.
This script removes the need for manually clicking each check, opening the imaging viewer, and saving every PDF one at a time.

This tool is intended to improve payroll efficiency when downloading multiple historical checks.

Overview

The script performs the following functions:

Detects all paystub rows in the ECMS paystub table

Builds an internal queue of download targets

Automatically navigates through ECMS imaging pages

Opens each PDF viewer page

Downloads each paystub as a properly named PDF file

Continues until all paystubs on the page are completed

This allows the user to download every available paystub with one click.

Features

• Automatically identifies all paystub rows on the page
• Saves PDFs using the correct week-ending date (MM-DD-YYYY.pdf)
• Handles ECMS navigation: associationRedirect.faces, viewImageContent.faces, and viewImage.jsp
• Fully automated downloading using GM_download
• Works for any number of checks on the page
• Queue persists through page loads
• Includes retry logic for slow-loading ECMS iframes

Installation

Install Tampermonkey
https://www.tampermonkey.net/

Open Tampermonkey and create a new script

Paste the contents of
src/ECMS-Paystub-Auto-Downloader.js

Save the script

Usage

Log into ECMS

Open
Payroll > Employee History Inquiry

Load an employee

A button will appear on the page titled:
AUTO DOWNLOAD ALL PAYSTUBS

Click the button

The script will begin downloading each paystub automatically

A message will appear when complete

No further user action is required during the process.

Technical Explanation

The script operates in two main stages:

Stage 1: Queue Creation

The script scans the ECMS paystub table to collect:
• Week-ending date
• openImaging() parameters
• Direct imaging URL

A download queue is created in the following structure:

[
  { "filename": "03-31-2019.pdf", "assocUrl": "..." },
  { "filename": "03-24-2019.pdf", "assocUrl": "..." }
]


The queue is stored using GM_setValue.
The browser is then redirected to the first imaging link.

Stage 2: Automatic Navigation and Downloading

The script handles three ECMS page types:

associationRedirect.faces

viewImageContent.faces

viewImage.jsp

The logic is as follows:

• Wait for the iframe containing the PDF link
• Locate the viewImage.jsp link
• Redirect to it
• Trigger GM_download to save the PDF
• Move to the next queue item
• When the queue is empty, reset values and notify the user

This continues until all paystubs are downloaded.
