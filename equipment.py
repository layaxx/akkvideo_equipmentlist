from enum import unique
from dbutility import VerificationDatabase
import streamlit as st
import pandas
import numpy as np
from platform import system
from os import path
import subprocess
from datetime import datetime
from latex import build_pdf, LatexBuildError
from math import isnan
import decimal
import random
from base64 import b64decode, b64encode
import pdfutility


# Draw Title of Page
st.title('Technikliste')
st.markdown("## 1. Überblick")


def format_price(val):
    # this function takes an input and formats it to fit into the price column.
    # if price is a number, it should have exactly two decimal places
    # otherwise, it should be an empty String
    # TODO: this is somewhat messy
    if isinstance(val, str):
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
    try:
        if isnan(val):
            return ""
    except TypeError as e:
        return ""
    if isinstance(val, float):
        return decimal.Decimal.from_float(val)
    return ""


@st.cache
def load_data(location="Inventar_akvideo.csv"):
    # loads the csv file into a dataframe and replaces all occurances of NaN
    # with an empty String
    data = pandas.read_csv(location, delimiter=";")
    # change format of "Index" and "Menge" rows from float to Integer
    # make sure the .csv does not contain emoty rows, or this will fail
    data["Index"] = data["Index"].apply(np.int64)
    data["Menge"] = data["Menge"].apply(np.int64)
    data["Preis"] = data["Preis"].map(format_price)

    return data.replace(np.nan, '', regex=True)



def check_if_all_packages_are_installed():
    # checks if all latex packages that are mentioned in latex_setup.sh and therefore should be installed, are actually installed
    # returns False iff one or more packages mentioned in latex_setup.sh are
    # not in the expected location (i.e.
    # /app/.TinyTeX/texmf-dist/tex/latex/{name_of_latex_package}/{name_of_latex_package}.sty),
    # else True
    with open("latex_setup.sh", "r") as latex_setup_file:
        lines = list(latex_setup_file)
        for line in lines:
            if line.startswith("tlmgr install"):
                name_of_latex_package = line.split(" ")[-1].strip()
                if(name_of_latex_package == "ms"):
                    if(not path.isfile(f'/app/.TinyTeX/texmf-dist/tex/latex/ms/everysel.sty')):
                        return False
                else:
                    if(not path.isfile(f'/app/.TinyTeX/texmf-dist/tex/latex/{name_of_latex_package}/{name_of_latex_package}.sty')):
                        return False
    return True



def create_pdf_downloadlink_for_verified_report(timestamp, tex_base64):
    tex_string = b64decode(tex_base64)
    
    pdf_base64_string = pdfutility.generate_b64_pdf_from_tex(tex_string)

    # create a filename with the current date
    filename = "technikliste_" + timestamp.strftime("%Y-%m-%d") + ".pdf"
    # create and return actual download-link with base64 encoded pdf and filename
    download_link = f'<a href="data:file/pdf;base64,{pdf_base64_string}" download="{filename}">Orginal Herunterladen</a>'
    return download_link


def create_pdf_downloadlink_for_new_report(
        dataframe,
        filters_are_active,
        sort_by_col,
        sort_by_col2,
        order):
    # this function creates a PDF from the given dataframe and returns a html download link with the base64 encoded PDF (data-url)
    # the PDF is based on the LaTeX File ./pdf_assets/template.tex
    # this function inserts the current date, an identification number, a table of all selected devices and
    # a message, if filters are active (and therefore not all devices that are tracked will be in the pdf)

    template, unique_id = pdfutility.fill_in_latex_template(filters_are_active, sort_by_col, sort_by_col2, order, dataframe)

    if unique_id == "":
        st.warning(
            "Datenbankverbindung konnte nicht hergestellt werden. Verifizierung wird für dieses Dokument nicht möglich sein.")

    pdf_base64_string = pdfutility.generate_b64_pdf_from_tex(template)

    # create a filename with the current date
    filename = "technikliste_" + datetime.now().strftime("%Y-%m-%d") + ".pdf"

    # if unique_id is empty string, connection to db failed prior and verification is not available for this document as a result
    if not unique_id == "":
        return_value = VerificationDatabase().save_record(
            template=template, id=unique_id, devices=len(data["Index"]), query="")
        if return_value == -1:
            st.warning(
                "Datenbankverbindung konnte nicht hergestellt werden. Verifizierung wird für dieses Dokument nicht möglich sein.")

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

st.write(
    "Zurzeit sind ",
    amount_devices_total,
    " Geräte registriert, davon befinden sich ",
    amount_devices_in_medienraum,
    " im Medienraum.")

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

one_or_more_filters_are_active = not (
    amount_devices_selected == amount_devices_total)

if not one_or_more_filters_are_active:
    st.subheader("Alle Geräte:")
else:
    st.subheader("Ausgewählte Geräte:")

    st.write(
        "In der Auswahl befinden sich ",
        amount_devices_selected,
        " Geräte, davon sind ",
        amount_devices_selected_in_medienraum,
        " aktuell im Medienraum.")

# placeholder where the dataframe is inserted after sorting it
dataframe_placeholder = st.empty()

'''
Verify Report Section
'''
st.markdown("## 2. PDF Berichte")
st.subheader("Bericht verifizieren")
st.write("Die ID befindet sich unten rechts auf PDF Reports. Sie besteht aus einer Kombination von genau 8 Großbuchstaben (A-Z) und/oder Ziffern (2-9)")
id_input = st.text_input("ID eingeben, mit Enter bestätigen", max_chars=8)
if len(id_input) in range(1, 8):
    st.info("Die ID muss aus genau 8 Zeichen bestehen.")
if len(id_input) == 8:
    disallowed_chars = list(map(chr, range(97, 123)))
    disallowed_chars.extend(["0", "1"])
    if any(char in id_input for char in disallowed_chars):
        st.info(
            "Die ID muss aus einer Kombination von genau 8 Großbuchstaben (A-Z) und/oder Ziffern (2-9) bestehen")
    else:
        verify_result = VerificationDatabase().verify(id_input)
        if verify_result == -1:
            st.error(
                "Leider konnte keine Verbindung zur Datenbank hergestellt werden.")
        elif verify_result == {}:
            st.info("Leider konnte kein passendes Dokument gefunden werden.")
        elif type(verify_result) == dict and len(verify_result) == 4:
            st.markdown("### Dokument gefunden!")
            st.markdown(
                f'Das Dokument wurde am {verify_result["timestamp"].strftime("%d.%m.%Y um %H:%M")} generiert und enthält {verify_result["devices"]} Geräte.')
            with st.spinner('Originaldokument wird wiederhergestellt'):
                try:
                    pdf_link = create_pdf_downloadlink_for_verified_report(
                        verify_result["timestamp"], verify_result["tex"])
                    st.markdown(pdf_link, unsafe_allow_html=True)
                except RuntimeError:
                    st.error(
                        "PDF konnte leider nicht generiert werden. Bitte versuche es in 2 Minuten erneut.")
                except LatexBuildError as e:
                    print(e)
                    st.error("PDF konnte leider nicht generiert werden. Bitte versuche es in 2 Minuten erneut. Falls der Fehler dann erneut auftritt, kontaktiere uns bitte: dev@arbeitskreis.video")


# generate PDF report
st.subheader("Bericht generieren")
st.write("aktuelle Auswahl als PDF speichern:")
st.write("Sortierung wählen:")
list_of_options_for_sort_by = [
    "Index",
    "Menge",
    "Gerätebezeichnung",
    "Lagerort",
    "Kategorie",
    "Preis"]
sort_by_primary = st.selectbox("primary", list_of_options_for_sort_by, 0)
sort_by_secondary = st.selectbox("secondary", list_of_options_for_sort_by, 0)
order = st.selectbox("", ["aufsteigend", "absteigend"], 0)

# sort DataFrame
if(sort_by_primary == "Preis"):
    data = data.sort_values(
        by=[
            sort_by_primary,
            sort_by_secondary],
        ascending=(order == "aufsteigend"),
        key=lambda column: column.apply(
            lambda value: value if not value == "" else 99999))
else:
    data = data.sort_values(
        by=[sort_by_primary, sort_by_secondary], ascending=(order == "aufsteigend"))

# display interactive table, if applicable with the filters specified in
# the sidebar and the order specified in the fields below it.
dataframe_placeholder.dataframe(data)

'''
Generate PDF Section
'''
button_generate_pdf = st.button("PDF generieren*")
st.info("*Achtung: Die Erstellung des PDFs wird circa eine halbe Minute dauern.")
# show warning that pdf will have reference to the fact that not all
# devices are included
if(one_or_more_filters_are_active):
    st.warning(
        "Achtung: PDF wird nur die ausgewählten Geräte enthalten, und einen Hinweis auf die Unvollständigkeit")

if button_generate_pdf:
    operatingSystemIsLinux = system() == "Linux"

    if(not operatingSystemIsLinux):
        st.error(
            "PDF Creation is currently only supported on the server, not on localhost")
    else:
        # check that all required latex packages are in the location they are
        # excpected to be in
        if(not check_if_all_packages_are_installed()):
            with st.spinner('Notwendige LaTeX Pakete werden installiert. Das kann zwei bis drei Minuten dauern'):
                subprocess.run(["sh", "./latex_setup.sh"])

        # create PDF and show download link
        with st.spinner('PDF wird erstellt'):
            try:
                pdf_link = create_pdf_downloadlink_for_new_report(
                    data,
                    one_or_more_filters_are_active,
                    sort_by_primary,
                    sort_by_secondary,
                    order)
                st.success('Fertig!')
                st.markdown(pdf_link, unsafe_allow_html=True)
            except RuntimeError:
                st.error(
                    "PDF konnte leider nicht generiert werden. Bitte versuche es in 2 Minuten erneut.")
            except LatexBuildError:
                st.error("PDF konnte leider nicht generiert werden. Bitte versuche es in 2 Minuten erneut. Falls der Fehler dann erneut auftritt, kontaktiere uns bitte: dev@arbeitskreis.video")


# display footer
st.write("-------------------------------------------------")
st.write("[Zur Hauptseite](https://arbeitskreis.video)")
