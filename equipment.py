import streamlit as st
import pandas
import numpy as np
from platform import system
from os import listdir
from os import linesep
from os import path
import subprocess
from time import sleep
from datetime import datetime
from latex import build_pdf
from xmlrpc.client import Binary
from io import StringIO

st.title('Technikliste')

@st.cache
def load_data():
    # loads the csv file into a dataframe and replaces all occurances of NaN with an empty String
    data = pandas.read_csv("Inventar_akvideo.csv", delimiter=";")
    # change format of "Index" and "Menge" rows from float to Integer
    # make sure the .csv does not contain emoty rows, or this will fail
    data["Index"] = data["Index"].apply(np.int64)
    data["Menge"] = data["Menge"].apply(np.int64)
    return data.replace(np.nan, '', regex=True)

def escapeSpecialCharacters(str):
    # escapes all occurrences of # $ % & ~ _ ^ \ { } and escapes them in order to make them safe for latex compiling
    str = str.replace("\\", "\\textbackslash")
    str = str.replace("#", "\\#")
    str = str.replace("$", "")
    str = str.replace("%", "\\%")
    str = str.replace("^", "\\textasciicircum")
    str = str.replace("}", "\\}")
    str = str.replace("{", "\\{")
    return str

def allFilesExist():
    with open("latex_setup.sh", "r") as reqfile:
        lines = list(reqfile)
        for line in lines[3:-1]:
            if(len(line) < 10):
                continue
            packageName = line.split(" ")[-1][0:-2]
            if(path.isfile(f'/app/.TinyTeX/texmf-dist/tex/latex/{packageName}/{packageName}.sty')):
                return False
    return True

def generateTable(dataFrame):
    table = ""
    #    Menge & Name & Standort & Preis & Anschaffungsjahr \\%
    for index in range(len(dataFrame)):
        table += escapeSpecialCharacters(str(dataFrame["Menge"][index])) + "&"
        table += escapeSpecialCharacters(dataFrame["Gerätebezeichnung"][index]) + "&"
        table += escapeSpecialCharacters(dataFrame["Lagerort"][index]) + "&"
        if dataFrame["Preis"][index] == "":
            table += "n.A." + "&" # .csv does currently not have price for every device
        else:
            table += escapeSpecialCharacters(dataFrame["Preis"][index]) + "&"
        table += "n.A." + "\\\\%\n" # .csv does currently not have information about year of purchase
    return table

def createPDFLink(dataFrame, filtersActive):
    with open("pdf_assets/template.tex", "r") as tex:
        text = tex.read()

    if filtersActive:    
        text = text.replace("MESSAGE", "Dies ist eine unvollständige Liste")
    else:
        text = text.replace("MESSAGE", "")
        text = text.replace("orange", "black")
    text = text.replace("DATUM", datetime.now().strftime("%d.%m.%Y"))
    text = text.replace("IDNUMBER", "1337")
    text = text.replace("TABLE&&&&",generateTable(dataFrame))

    pdf = build_pdf(text)

    filename = datetime.now().strftime("%Y-%m-%d--%H-%M-%S") + ".pdf"

    pdf.save_to(filename)

    with open(filename, "rb") as handle:
        binaryPDF = Binary(handle.read())
        stream = StringIO("")
        binaryPDF.encode(stream)
        b64 = stream.getvalue()[15:-18]
        filename = "technikliste_"+ datetime.now().strftime("%Y-%m-%d") + ".pdf"
        dllink = f'<a href="data:file/pdf;base64,{b64}" download="{filename}">Download pdf file</a>'
        return dllink


# Create a text element and let the reader know the data is loading.
data_load_state = st.text('Loading data...')
data = load_data()
kategorien = list(data.columns)
# Notify the reader that the data was successfully loaded.
data_load_state.text("")

st.subheader("Allgemeine Informationen:")

# calculate amount of devices in selection
anzahlGeräteTotal = len(data["Lagerort"])
# calculate amount of devices in selection and with location "Medienraum"
anzahlGeräteImMedienraum = data["Lagerort"].to_list().count(
    "Medienraum")

st.write("Zurzeit sind ", anzahlGeräteTotal, " Geräte registriert, davon befinden sich ",
         anzahlGeräteImMedienraum, " im Medienraum.")

# display the filters in the sidebar
sidebar_searchbar = st.sidebar.text_input("Suche nach Einträgen")
sidebar_index = st.sidebar.multiselect(
    "Index eingrenzen", data["Index"].unique())
sidebar_category = st.sidebar.multiselect(
    "Kategorie eingrenzen", data["Kategorie"].unique())
sidebar_location = st.sidebar.multiselect(
    "Ort eingrenzen", data["Lagerort"].unique())
sidebar_container = st.sidebar.multiselect(
    "Behälter eingrenzen", data["Behälter"].unique())
sidebar_brand = st.sidebar.multiselect(
    "Marke eingrenzen", data["Marke"].unique())

oneOrMoreFiltersActive = False

# apply filters to data, if specified
if len(sidebar_index) != 0:
    data = data[(data['Index'].isin(sidebar_index))]
    oneOrMoreFiltersActive = True

if len(sidebar_category) != 0:
    data = data[(data['Kategorie'].isin(sidebar_category))]
    oneOrMoreFiltersActive = True

if len(sidebar_location) != 0:
    data = data[(data['Lagerort'].isin(sidebar_location))]
    oneOrMoreFiltersActive = True

if len(sidebar_container) != 0:
    data = data[(data['Behälter'].isin(sidebar_container))]
    oneOrMoreFiltersActive = True

if len(sidebar_brand) != 0:
    data = data[(data['Marke'].isin(sidebar_brand))]
    oneOrMoreFiltersActive = True

if not sidebar_searchbar == "":
    oneOrMoreFiltersActive = True
    keywords = sidebar_searchbar.split(" ")
    array = []
    for index in range(0, len(data)):
        string = ""
        for kategorie in kategorien:
            string += str(data[kategorie][index])
        flag = False
        for keyword in keywords:
            if not keyword.lower() in string.lower():
                flag = True
        if not flag:
            array.append(data["Gerätebezeichnung"][index])
    # st.write(array)
    data = data[data["Gerätebezeichnung"].isin(array)]


if oneOrMoreFiltersActive:
    st.subheader("Alle Geräte:")
else:
    st.subheader("Ausgewählte Geräte:")

    # calculate amount of devices in selection
    anzahlGeräteInAuswahl = len(data["Lagerort"])
    # calculate amount of devices in selection and with location "Medienraum"
    anzahlGeräteImMedienraumInAuswahl = data["Lagerort"].to_list().count(
        "Medienraum")

    st.write("In der Auswahl befinden sich ", anzahlGeräteInAuswahl, " Geräte, davon sind ",
             anzahlGeräteImMedienraumInAuswahl, " aktuell im Medienraum.")


# display interactive table, if applicable with the filters specified in the sidebar
st.write(data)

# TODO: you should be able to select, how devices will be sorted in the PDF
# for example: sorted by price, sorted by name, sorted by year
# generate PDF report
st.subheader("Bericht generieren")
st.write("aktuelle Auswahl als PDF speichern:")
generatePDF = st.button("PDF generieren*")
st.info("*Diese Aktion kann 1-2 Minuten dauern.")

if generatePDF:
    st.write("Button was pressed")

    operatingSystemIsLinux = system() == "Linux"
    if(not operatingSystemIsLinux):
        st.error("PDF Creation is currently only supported on the server, not on localhost")
    else: 
        # check that latex is installed
        if( listdir(".").count(".TinyTeX") == 0):
            warning = st.warning("Server is currently missing important files. Download and installation could take about 2-3 minutes.")
            subprocess.run(["sh", "./latex_setup.sh"])
            sleep(120) # force 2 minute wait. not optimal but better than without
            warning = st.empty()

        if(not allFilesExist()):
            warning = st.error("files missing. Attempting reinstall of dependencies. Could take 1-2 minutes.")
            subprocess.run(["sh", "./latex_setup.sh"])
            sleep(120) # force 2 minute wait. not optimal but better than without
            warning = st.empty()

        if(oneOrMoreFiltersActive):
            st.warning("Achtung: PDF wird nur die ausgewählten Geräte enthalten, und einen Hinweis auf die Unvollständigkeit")
        
        textElem = st.write("PDF wird erstellt.")
        st.markdown(createPDFLink(data, oneOrMoreFiltersActive), unsafe_allow_html=True)
        textElem = st.empty()


# show footer
st.write("-------------------------------------------------")
st.write("[Zur Hauptseite](https://arbeitskreis.video)")
