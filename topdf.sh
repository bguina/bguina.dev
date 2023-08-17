#!/usr/bin/env bash

# Gets the front page in printable layout and save as pdf.
# Requirements: 
#	apt-get install xvfb wkhtmltopdf

xvfb-run wkhtmltopdf --zoom .75 -s A4 http://localhost:3000/?pdf=1 public/cv.pdf
