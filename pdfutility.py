from base64 import b64encode
import latex
from datetime import datetime
from dbutility import VerificationDatabase
import random, os


def generate_b64_pdf_from_tex(tex):
    # Compile LaTeX Code to Data object
    pdf = latex.build_pdf(tex)
    # convert Data Object to Bytes
    pdf_binary = bytes(pdf)
    # Base64 encode the bytes
    pdf_base64 = b64encode(pdf_binary)
    # convert to string and trim
    return str(pdf_base64)[2:-1]


def fill_in_latex_template(
        filters_are_active,
        sort_by_col,
        sort_by_col2,
        order,
        dataframe):
    # load LaTeX Template
    with open("pdf_assets/template.tex", "r", encoding="utf8") as tex:
        template = tex.read()

    # replace placeholders in the templates with actual values
    if filters_are_active:
        template = template.replace(
            "MESSAGE", "Dies ist eine unvollständige Liste")
    else:
        template = template.replace("MESSAGE", "")
        template = template.replace("orange", "black")

    if(sort_by_col == sort_by_col2):
        sort_by_string = sort_by_col
    else:
        sort_by_string = f'{sort_by_col} und {sort_by_col2}'

    path_to_logo = os.path.abspath("pdf_assets/logo.png")
    path_to_logo = path_to_logo.replace("\\", "/")

    template = template.replace("/app/pdf_assets/logo.png", path_to_logo)

    header_info = f'Diese Liste enthält {len(dataframe["Index"])} Einträge und ist {order} nach {sort_by_string} sortiert.'

    template = template.replace("HEADER-INFO", header_info)

    template = template.replace("DATUM", datetime.now().strftime("%d.%m.%Y"))

    unique_id = generate_unique_id()
    template = template.replace("IDNUMBER", unique_id)
    template = template.replace(
        "TABLE&&&&", generate_latex_table_from(dataframe))

    return template, unique_id


def generate_unique_id(type_of_report="General Report", name=""):
    '''
    Generates a unique, 8 character long String as identifier for reports in the database.
    '''
    if type_of_report == "General Report":
        prefix = "GR"
    elif len(name.split(" ")) >= 2:
        prefix = name.split(" ")[0][0].upper() + name.split(" ")[1][0].upper()
    elif len(name) >= 2:
        prefix = name[0:2].upper()
    else:
        prefix = "XX"

    list_of_taken_ids = VerificationDatabase().get_taken_ids(prefix)

    if not isinstance(list_of_taken_ids, list):
        return ""

    unique_id = prefix + get_six_digit_id()

    while(unique_id in list_of_taken_ids):
        unique_id = prefix + get_six_digit_id()

    return unique_id


def get_six_digit_id():
    result = ""
    allowed_characters = list(map(chr, range(ord('A'), ord('Z') + 1)))
    allowed_characters.extend(range(2, 10))
    for _ in range(6):
        result += str(random.choice(allowed_characters))
    return result


def generate_latex_table_from(dataframe):
    # generates the table for the PDF from the given Dataframe
    # Table has the columns Menge, Name, Standort, Preis, Anschaffungsjahr, in that order
    # values are converted to strings iff needed and then checked for characters that need to be escaped using escape_special_characters()
    # returns String with LaTeX Code representing a table with the columns
    # mentioned above and one row for every device in the given dataframe

    table = ""
    # Format is: Menge & Name & Standort & Preis & Anschaffungsjahr \\%
    for index, row in dataframe.iterrows():
        menge = escape_special_characters(str(row["Menge"]))
        name = escape_special_characters(row["Gerätebezeichnung"])
        lagerort = escape_special_characters(row["Lagerort"])
        preis = escape_special_characters(str(row["Preis"]).replace(".", ","))
        jahr = "n/a"  # .csv does currently not have information about year of purchase
        table += f"{menge}&{name}&{lagerort}&{preis}&{jahr}\\\\%\n"
    return table


def escape_special_characters(input_string):
    # escapes all occurrences of # $ % & ~ _ ^ \ { } and escapes them in order
    # to make them safe for latex compiling
    if input_string == "":
        return "n/a"
    input_string = input_string.replace("\\", "\\textbackslash ")\
        .replace("#", "\\#")\
        .replace("$", "\\$")\
        .replace("%", "\\%")\
        .replace("^", "\\textasciicircum ")\
        .replace("}", "\\}")\
        .replace("{", "\\{")\
        .replace("&", "\\&")\
        .replace("~", "\\textasciitilde ")\
        .replace("_", "\\_")
    return input_string
