from dbutility import VerificationDatabase
import streamlit as st
import pandas
import numpy as np
from platform import system
from os import path
import subprocess
from datetime import datetime
from latex import LatexBuildError
from math import isnan
import decimal
from base64 import b64decode
import pdfutility
import dbutility


# Draw Title of Page
st.title('Technikliste')
st.markdown("## 1. Überblick")


@st.cache
def load_data(location="Inventar_akvideo.csv"):
    '''
    return ssanitized Dataframe
    '''
    return dbutility.DevicesDatabase().load_all_devices_into_dataframe()


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

list_of_unique_categories = []
for entry in data["Kategorie"].unique():
    for keyword in entry.split(","):
        list_of_unique_categories.append(keyword.strip())
list_of_unique_categories = list(set(list_of_unique_categories))

# display the filters in the sidebar
sidebar_searchterm = st.sidebar.text_input("Suche nach Einträgen")
sidebar_indices = st.sidebar.multiselect(
    "Index eingrenzen", data["Index"].unique())
sidebar_categories = st.sidebar.multiselect(
    "Kategorie eingrenzen", list_of_unique_categories)
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
    for index, row in data.iterrows():
        for selected_category in sidebar_categories:
            if selected_category.lower() in row["Kategorie"].lower():
                break
        else:
            data = data.drop([index])

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


st.markdown("## 2. PDF Berichte")

with st.beta_expander("Bericht verifizieren"):
    '''
    Verify Report Section
    '''
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
            elif isinstance(verify_result, dict) and len(verify_result) == 4:
                st.markdown("### Dokument gefunden!")
                st.markdown(
                    f'Das Dokument wurde am {verify_result["timestamp"].strftime("%d.%m.%Y um %H:%M")} generiert und enthält {verify_result["devices"]} Geräte.')
                with st.spinner('Originaldokument wird wiederhergestellt'):
                    try:
                        pdf_link = pdfutility.create_pdf_downloadlink_for_verified_report(
                            verify_result["timestamp"], verify_result["tex"])
                        st.markdown(pdf_link, unsafe_allow_html=True)
                    except RuntimeError:
                        st.error(
                            "PDF konnte leider nicht generiert werden. Bitte versuche es in 2 Minuten erneut.")
                    except LatexBuildError as e:
                        print(e)
                        st.error(
                            "PDF konnte leider nicht generiert werden. Bitte versuche es in 2 Minuten erneut. Falls der Fehler dann erneut auftritt, kontaktiere uns bitte: dev@arbeitskreis.video")

with st.beta_expander("Bericht generieren"):
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
    sort_by_secondary = st.selectbox(
        "secondary", list_of_options_for_sort_by, 0)
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
    data = data.drop(['history'], axis=1)
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

        # check that all required latex packages are in the location they are
        # expected to be in
        if(not pdfutility.check_if_all_packages_are_installed()):

            if system() == "Linux":
                with st.spinner('Notwendige LaTeX Pakete werden installiert. Das kann zwei bis drei Minuten dauern'):
                    subprocess.run(["sh", "./latex_setup.sh"])
            else:
                st.error(
                    "Es fehlen zur Erstellung des PDFs benötigte LaTeX Pakete. Bitte installiere diese manuell")
                st.info(
                    "Folgende Pakete werden benötigt: \n lastpage \n tabu \n varwidth \n colortbl \n fancyhdr \n ragged2e \n ms")

        # create PDF and show download link
        with st.spinner('PDF wird erstellt'):
            try:
                pdf_link = pdfutility.create_pdf_downloadlink_for_new_report(
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
            except LatexBuildError as error:
                print(error)
                st.error("PDF konnte leider nicht generiert werden. Bitte versuche es in 2 Minuten erneut. Falls der Fehler dann erneut auftritt, kontaktiere uns bitte: dev@arbeitskreis.video")


# display footer
st.write("-------------------------------------------------")
st.write("[Zur Hauptseite](https://arbeitskreis.video)")
