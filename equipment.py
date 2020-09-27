import streamlit as st
import pandas
import numpy as np


st.title('Technikliste')


def load_data():
    # loads the csv file into a dataframe and replaces all occurances of NaN with an empty String
    data = pandas.read_csv("Inventar_akvideo.csv", delimiter=";")
    return data.replace(np.nan, '', regex=True)


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


# apply filters to data, if specified
if len(sidebar_index) != 0:
    data = data[(data['Index'].isin(sidebar_index))]

if len(sidebar_category) != 0:
    data = data[(data['Kategorie'].isin(sidebar_category))]

if len(sidebar_location) != 0:
    data = data[(data['Lagerort'].isin(sidebar_location))]

if len(sidebar_container) != 0:
    data = data[(data['Behälter'].isin(sidebar_container))]

if len(sidebar_brand) != 0:
    data = data[(data['Marke'].isin(sidebar_brand))]

if not sidebar_searchbar == "":
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


if len(sidebar_index) + len(sidebar_category) + len(sidebar_location) + len(sidebar_container) + len(sidebar_brand) == 0:
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
