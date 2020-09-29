import streamlit as st
import pandas
import numpy as np
import platform
import os
import subprocess
import time
from datetime import datetime
from latex import build_pdf
from xmlrpc.client import Binary
from io import StringIO

st.title('Technikliste')


def load_data():
    # loads the csv file into a dataframe and replaces all occurances of NaN with an empty String
    data = pandas.read_csv("Inventar_akvideo.csv", delimiter=";")
    return data.replace(np.nan, '', regex=True)

def createPDFLink(dataFrame, filtersActive):
    with open("pdf_assets/template.tex", "r") as tex:
        text = tex.read()

    if filtersActive:    
        text = text.replace("MESSAGE", "Dies ist eine unvollständige Liste")
    else:
        text = text.replace("MESSAGE", "")
        text = text.replace("orange", "black")
    text = text.replace("DATUM", datetime.now().strftime("%d.%m.%Y"))
    text = text.replace("IDNUMBER", "1454165")


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

# change format of "Index" and "Menge" rows from float to Integer
# make sure the .csv does not contain emoty rows, or this will fail
data["Index"] = data["Index"].apply(np.int64)
data["Menge"] = data["Menge"].apply(np.int64)

# display interactive table, if applicable with the filters specified in the sidebar
st.write(data)


# generate PDF report
st.subheader("Bericht generieren")
st.write("aktuelle Auswahl als PDF speichern:")
generatePDF = st.button("PDF generieren*")
st.info("*Diese Aktion kann 1-2 Minuten dauern.")

if generatePDF:
    st.write("Button was pressed")

    operatingSystemIsLinux = platform.system() == "Linux"
    if(not operatingSystemIsLinux):
        st.error("PDF Creation is currently not supported under windows")
    else: 
        # check that latex is installed
        if( os.listdir(".").count(".TinyTeX") == 0):
            warning = st.warning("Server is currently missing important files. Download and installation could take about 1-2 minutes.")
            subprocess.run(["sh", "./latex_setup.sh"])
            time.sleep(120) # force 2 minute wait. not optimal but better than without
            warning = st.empty()

        if(oneOrMoreFiltersActive):
            st.warning("Achtung: PDF wird nur die ausgewählten Geräte enthalten, und einen Hinweis auf die Unvollständigkeit")
        
        st.markdown(createPDFLink(data, oneOrMoreFiltersActive), unsafe_allow_html=True)

# show footer
st.write("-------------------------------------------------")
st.write("[Zur Hauptseite](https://arbeitskreis.video)")
