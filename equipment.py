import streamlit as st
import pandas
import numpy as np
from platform import system
from os import path
import subprocess
from datetime import datetime
from latex import build_pdf
from math import isnan
import decimal 
from base64 import b64encode

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
    with open("latex_setup.sh", "r") as latex_setup_file:
        lines = list(latex_setup_file)
        for line in lines:
            if(line.startswith("tlmgr install")):
                name_of_latex_package = line.split(" ")[-1].strip()
                if(name_of_latex_package == "ms"):
                    if(not path.isfile(f'/app/.TinyTeX/texmf-dist/tex/latex/ms/everysel.sty')):
                        return False
                else:
                    if(not path.isfile(f'/app/.TinyTeX/texmf-dist/tex/latex/{name_of_latex_package}/{name_of_latex_package}.sty')):
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

def create_pdf_downloadlink(dataframe, filters_are_active, sort_by_col, sort_by_col2, order):
    # this function creates a PDF from the given dataframe and returns a html download link with the base64 encoded PDF (data-url)
    # the PDF is based on the LaTeX File ./pdf_assets/template.tex
    # this function inserts the current date, an identification number (TODO: WIP: ID Number for PDFs), a table of all selected devices and 
    # a message, if filters are active (and therefore not all devices that are tracked will be in the pdf) 
    # TODO: add verification of IDs
    # TODO: add logging, maybe save .tex files for every export instead of .pdf files to save storage space

    order_ascending = order == "aufsteigend" 

    # sort DataFrame
    if(sort_by_col == "Preis"):
        dataframe = dataframe.sort_values(by=[sort_by_col,sort_by_col2], ascending=order_ascending, key=lambda column: column.apply(lambda value: value if not value == "" else 99999))
    else:
        dataframe = dataframe.sort_values(by=[sort_by_col,sort_by_col2], ascending=order_ascending)

    # load LaTeX Template
    with open("pdf_assets/template.tex", "r") as tex:
        template = tex.read()

    # replace placeholders in the templates with actual values
    if filters_are_active:    
        template = template.replace("MESSAGE", "Dies ist eine unvollständige Liste")
    else:
        template = template.replace("MESSAGE", "")
        template = template.replace("orange", "black")

    if(sort_by_col == sort_by_col2):
        sort_by_string = sort_by_col
    else:
        sort_by_string = f'{sort_by_col} und {sort_by_col2}'

    header_info = f'Diese Liste enthält {len(data["Index"])} Einträge und ist {order} nach {sort_by_string} sortiert.'

    template = template.replace("HEADER-INFO", header_info)

    template = template.replace("DATUM", datetime.now().strftime("%d.%m.%Y"))
    template = template.replace("IDNUMBER", "1337") # ID is currently not implemented
    template = template.replace("TABLE&&&&", generate_latex_table_from(dataframe))

    # Compile LaTeX Code to Data object
    pdf = build_pdf(template)
    # convert Data Object to Bytes
    pdf_binary = bytes(pdf)
    # Base64 encode the bytes
    pdf_base64 = b64encode(pdf_binary)
    # convert to string and trim 
    pdf_base64_string = str(pdf_base64)[2:-1]
    
    # create a filename with the current date
    filename = "technikliste_"+ datetime.now().strftime("%Y-%m-%d") + ".pdf"

    # create and return actual download-link with base64 encoded pdf and filename
    download_link = f'<a href="data:file/pdf;base64,{pdf_base64_string}" download="{filename}">PDF Datei Herunterladen</a>'
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

# apply filters to data, if specified
if len(sidebar_indices) != 0:
    data = data[(data['Index'].isin(sidebar_indices))]

if len(sidebar_categories) != 0:
    data = data[(data['Kategorie'].isin(sidebar_categories))]

if len(sidebar_locations) != 0:
    data = data[(data['Lagerort'].isin(sidebar_locations))]

if len(sidebar_containers) != 0:
    data = data[(data['Behälter'].isin(sidebar_containers))]

if len(sidebar_brands) != 0:
    data = data[(data['Marke'].isin(sidebar_brands))]

if not sidebar_searchterm == "":
    keywords = sidebar_searchterm.split(" ")
    for index, row in data.iterrows():
        string = ""
        for kategorie in list_of_categories:
            string += str(row[kategorie])
        for keyword in keywords:
            if not keyword.lower() in string.lower():
                data = data.drop([index])
                break

# calculate amount of devices in selection
amount_devices_selected = len(data["Lagerort"])
# calculate amount of devices in selection and with location "Medienraum"
amount_devices_selected_in_medienraum = data["Lagerort"].to_list().count(
    "Medienraum")

one_or_more_filters_are_active = not (amount_devices_selected == amount_devices_total )

if not one_or_more_filters_are_active:
    st.subheader("Alle Geräte:")
else:
    st.subheader("Ausgewählte Geräte:")

    st.write("In der Auswahl befinden sich ", amount_devices_selected, " Geräte, davon sind ",
             amount_devices_selected_in_medienraum, " aktuell im Medienraum.")


# display interactive table, if applicable with the filters specified in the sidebar
st.write(data)


# TODO: you should be able to select how devices will be sorted in the PDF
# for example: sorted by price, sorted by name, sorted by year
# generate PDF report
st.subheader("Bericht generieren")
st.write("aktuelle Auswahl als PDF speichern:")
st.write("Sortierung wählen:")
list_of_options_for_sort_by = ["Index", "Menge", "Gerätebezeichnung", "Lagerort", "Kategorie", "Preis"]
sort_by_primary = st.selectbox("primary", list_of_options_for_sort_by, 0)
sort_by_secondary = st.selectbox("secondary", list_of_options_for_sort_by, 0)
order = st.selectbox("", ["aufsteigend", "absteigend"], 0)

button_generate_pdf = st.button("PDF generieren*")
st.info("*Achtung: Die Erstellung des PDFs wird circa eine halbe Minute dauern.")
# show warning that pdf will have reference to the fact that not all devices are included
if(one_or_more_filters_are_active):
    st.warning("Achtung: PDF wird nur die ausgewählten Geräte enthalten, und einen Hinweis auf die Unvollständigkeit")

if button_generate_pdf:
    operatingSystemIsLinux = system() == "Linux"

    if(not operatingSystemIsLinux):
        st.error("PDF Creation is currently only supported on the server, not on localhost")
    else: 
        # check that all required latex packages are in the location they are excpected to be in
        if(not check_if_all_packages_are_installed()):
            with st.spinner('Notwendige LaTeX Pakete werden installiert. Das kann zwei bis drei Minuten dauern'):
                subprocess.run(["sh", "./latex_setup.sh"])
        
        # create PDF and show download link
        with st.spinner('PDF wird erstellt'):
            try:
                pdf_link = create_pdf_downloadlink(data, one_or_more_filters_are_active, sort_by_primary, sort_by_secondary, order)
                st.success('Fertig!')
                st.markdown(pdf_link, unsafe_allow_html=True)
            except: 
                st.error("PDF konnte leider nicht generiert werden. Bitte versuche es in 2 Minuten erneut.")

# display footer
st.write("-------------------------------------------------")
st.write("[Zur Hauptseite](https://arbeitskreis.video)")
