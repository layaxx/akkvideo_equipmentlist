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
from math import isnan
import decimal 

st.title('Technikliste')

def format_price(val):
    # this function takes an input and formats it to fit into the price column.
    # if price is a number, it should have exactly two decimal places
    # otherwise, it should be an empty String
    # TODO: this is somewhat messy
    if type(val) == str:
        if val.count(",") == 1:
            before_point, after_point = val.split(",")
            after_point += "00"
            after_point = after_point[0:2]
            return decimal.Decimal(before_point + "." + after_point)
        elif val.count(".") == 0:
            return decimal.Decimal(val + ".00")
        else:
            before_point, after_point = val.split(".")
            after_point += "00"
            after_point = after_point[0:2]
            return decimal.Decimal(before_point + "." + after_point)
            return decimal.Decimal(val + "00")
    if isnan(val):
        return ""
    elif type(val) == float:
        return decimal.Decimal.from_float(val)
    return ""

@st.cache
def load_data():

    # loads the csv file into a dataframe and replaces all occurances of NaN with an empty String
    data = pandas.read_csv("Inventar_akvideo.csv", delimiter=";")
    # change format of "Index" and "Menge" rows from float to Integer
    # make sure the .csv does not contain emoty rows, or this will fail
    data["Index"] = data["Index"].apply(np.int64)
    data["Menge"] = data["Menge"].apply(np.int64)
    data["Preis"] = data["Preis"].map(format_price)

    return data.replace(np.nan, '', regex=True)

def escape_special_characters(input_string):
    # escapes all occurrences of # $ % & ~ _ ^ \ { } and escapes them in order to make them safe for latex compiling
    if(input_string == ""):
        return "n.A."
    input_string = input_string.replace("\\", "\\textbackslash").replace("#", "\\#").replace("$", "").replace("%", "\\%").replace("^", "\\textasciicircum").replace("}", "\\}").replace("{", "\\{")
    return input_string

def check_if_all_packages_are_installed():
    # checks if all latex packages that are mentioned in latex_setup.sh and therefore should be installed, are actually installed
    # returns False iff one or more packages mentioned in latex_setup.sh are not in the expected location (i.e. /app/.TinyTeX/texmf-dist/tex/latex/{name_of_latex_package}/{name_of_latex_package}.sty), else True  
    with open("latex_setup.sh", "r") as reqfile:
        lines = list(reqfile)
        for line in lines[3:-1]:
            if(len(line) < 10):
                continue
            name_of_latex_package = line.split(" ")[-1][0:-2]
            if(path.isfile(f'/app/.TinyTeX/texmf-dist/tex/latex/{name_of_latex_package}/{name_of_latex_package}.sty')):
                return False
    return True



def generate_latex_table_from(dataframe):
    # generates the table for the PDF from the given Dataframe
    # Table has the columns Menge, Name, Standort, Preis, Anschaffungsjahr, in that order
    # values are converted to strings iff needed and then checked for characters that need to be escaped using escape_special_characters()
    # returns String with LaTeX Code representing a table with the columns mentioned above and one row for every device in the given dataframe
    
    table = ""
    # Format is: Menge & Name & Standort & Preis & Anschaffungsjahr \\%
    for index, row in dataframe.iterrows():
        menge = escape_special_characters(str(row["Menge"]))
        name = escape_special_characters(row["Gerätebezeichnung"])
        lagerort = escape_special_characters(row["Lagerort"])
        preis = escape_special_characters(str(row["Preis"]))
        jahr = "n.A." # .csv does currently not have information about year of purchase
        table += f"{menge}&{name}&{lagerort}&{preis}&{jahr}\\\\%\n"    
    return table

def create_pdf_downloadlink(dataframe, filters_are_active):
    # this function creates a PDF from the given dataframe and returns a html download link with the base64 encoded PDF (data-url)
    # the PDF is based on the LaTeX File ./pdf_assets/template.tex
    # this function inserts the current date, an identification number (TODO: WIP: ID Number for PDFs), a table of all selected devices and 
    # a message, if filters are active (and therefore not all devices that are tracked will be in the pdf) 
    # TODO: this is not necessarily true, as filters could be set that include every tracked device
    # TODO: currently the PDF is saved after creation and before encoding it in base64. this may be unnecessary
    # TODO: add verification of IDs
    # TODO: add logging, maybe save .tex files for every export instead of .pdf files to save storage space

    with open("pdf_assets/template.tex", "r") as tex:
        text = tex.read()

    if filters_are_active:    
        text = text.replace("MESSAGE", "Dies ist eine unvollständige Liste")
    else:
        text = text.replace("MESSAGE", "")
        text = text.replace("orange", "black")

    text = text.replace("DATUM", datetime.now().strftime("%d.%m.%Y"))
    text = text.replace("IDNUMBER", "1337")
    text = text.replace("TABLE&&&&",generate_latex_table_from(dataframe))

    pdf = build_pdf(text)

    filename = datetime.now().strftime("%Y-%m-%d--%H-%M-%S") + ".pdf"

    pdf.save_to(filename)

    with open(filename, "rb") as handle:
        binary_encoded_pdf = Binary(handle.read())
        stream = StringIO("")
        binary_encoded_pdf.encode(stream)
        b64_encoded_pdf = stream.getvalue()[15:-18]
        filename = "technikliste_"+ datetime.now().strftime("%Y-%m-%d") + ".pdf"
        download_link = f'<a href="data:file/pdf;base64,{b64_encoded_pdf}" download="{filename}">Download pdf file</a>'
        return download_link


# Create a text element and let the reader know the data is loading.
# Not really necessary as long as the .csv is somewhat short
data_load_state = st.text('Loading data...')
data = load_data()
list_of_categories = list(data.columns)
# Notify the reader that the data was successfully loaded.
data_load_state.text("")

st.subheader("Allgemeine Informationen:")

# calculate amount of devices 
amount_devices_total = len(data["Lagerort"])
# calculate amount of devices with location "Medienraum"
amount_devices_in_medienraum = data["Lagerort"].to_list().count(
    "Medienraum")

st.write("Zurzeit sind ", amount_devices_total, " Geräte registriert, davon befinden sich ",
         amount_devices_in_medienraum, " im Medienraum.")

# display the filters in the sidebar
sidebar_searchterm = st.sidebar.text_input("Suche nach Einträgen")
sidebar_indices = st.sidebar.multiselect(
    "Index eingrenzen", data["Index"].unique())
sidebar_categories = st.sidebar.multiselect(
    "Kategorie eingrenzen", data["Kategorie"].unique())
sidebar_locations = st.sidebar.multiselect(
    "Ort eingrenzen", data["Lagerort"].unique())
sidebar_containers = st.sidebar.multiselect(
    "Behälter eingrenzen", data["Behälter"].unique())
sidebar_brands = st.sidebar.multiselect(
    "Marke eingrenzen", data["Marke"].unique())

oneOrMoreFiltersActive = False

# apply filters to data, if specified
if len(sidebar_indices) != 0:
    data = data[(data['Index'].isin(sidebar_indices))]
    oneOrMoreFiltersActive = True

if len(sidebar_categories) != 0:
    data = data[(data['Kategorie'].isin(sidebar_categories))]
    oneOrMoreFiltersActive = True

if len(sidebar_locations) != 0:
    data = data[(data['Lagerort'].isin(sidebar_locations))]
    oneOrMoreFiltersActive = True

if len(sidebar_containers) != 0:
    data = data[(data['Behälter'].isin(sidebar_containers))]
    oneOrMoreFiltersActive = True

if len(sidebar_brands) != 0:
    data = data[(data['Marke'].isin(sidebar_brands))]
    oneOrMoreFiltersActive = True

if not sidebar_searchterm == "":
    oneOrMoreFiltersActive = True
    keywords = sidebar_searchterm.split(" ")
    for index, row in data.iterrows():
        string = ""
        for kategorie in list_of_categories:
            string += str(row[kategorie])
        for keyword in keywords:
            if not keyword.lower() in string.lower():
                data = data.drop([index])
                break


if oneOrMoreFiltersActive:
    st.subheader("Alle Geräte:")
else:
    st.subheader("Ausgewählte Geräte:")

    # calculate amount of devices in selection
    amount_devices_selected = len(data["Lagerort"])
    # calculate amount of devices in selection and with location "Medienraum"
    amount_devices_selected_in_medienraum = data["Lagerort"].to_list().count(
        "Medienraum")

    st.write("In der Auswahl befinden sich ", amount_devices_selected, " Geräte, davon sind ",
             amount_devices_selected_in_medienraum, " aktuell im Medienraum.")


# display interactive table, if applicable with the filters specified in the sidebar
st.write(data)


# TODO: you should be able to select, how devices will be sorted in the PDF
# for example: sorted by price, sorted by name, sorted by year
# generate PDF report
st.subheader("Bericht generieren")
st.write("aktuelle Auswahl als PDF speichern:")
button_generate_pdf = st.button("PDF generieren*")
st.info("*Diese Aktion kann 1-2 Minuten dauern.")

if button_generate_pdf:
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

        if(not check_if_all_packages_are_installed()):
            warning = st.error("files missing. Attempting reinstall of dependencies. Could take 2-3 minutes.")
            subprocess.run(["sh", "./latex_setup.sh"])
            sleep(120) # force 2 minute wait. not optimal but better than without
            warning = st.empty()

        if(oneOrMoreFiltersActive):
            st.warning("Achtung: PDF wird nur die ausgewählten Geräte enthalten, und einen Hinweis auf die Unvollständigkeit")
        
        text_progress = st.write("PDF wird erstellt.")
        st.markdown(create_pdf_downloadlink(data, oneOrMoreFiltersActive), unsafe_allow_html=True)
        text_progress = st.empty()


# display footer
st.write("-------------------------------------------------")
st.write("[Zur Hauptseite](https://arbeitskreis.video)")
