import datetime
import decimal
import os
import sys
import unittest
import unittest.mock
from base64 import b64encode
from unittest.mock import MagicMock, call, patch

import latex
import numpy as np
import pandas
import psycopg2

sys.path.insert(1, os.path.join(sys.path[0], '..'))
import dbutility  # nopep8
import equipment  # nopep8
import pdfutility  # nopep8


class FormatPriceTestCase(unittest.TestCase):

    def test_return_empty_string_for_everything_else(self):
        """
        Test that format_price() returns empty String if input is neither float nor string nor nan
        """
        self.assertAlmostEqual(equipment.format_price([]), "")

    def test_return_empty_string_for_nan(self):
        """
        Test that format_price() returns empty String for NaN Input
        """
        actual = equipment.format_price(np.nan)
        self.assertEqual(actual, "", )

    def test_convert_float_to_decimal(self):
        """
        Test that format_price() returns correct Decimal for float input
        """
        actual = equipment.format_price(9.85)
        self.assertEqual(actual, decimal.Decimal.from_float(9.85))

    def test_convert_string_with_point_to_decimal(self):
        """
        Test that format_price() returns correct Decimal for String input with point as Decimal Seperator
        """
        actual = equipment.format_price("9.85")
        self.assertEqual(actual, decimal.Decimal("9.85"))

    def test_convert_string_with_comma_to_decimal(self):
        """
        Test that format_price() returns correct Decimal for String Input with Comma as Decimal Seperator
        """
        actual = equipment.format_price("9,85")
        self.assertEqual(actual, decimal.Decimal("9.85"))

    def test_pad_price_intlike(self):
        """
        Test that format_price() pads Output with Zeros for Integer-like String Input
        """
        actual = equipment.format_price("9")
        self.assertEqual(actual, decimal.Decimal("9.00"))

    def test_pad_price_floatlike(self):
        """
        Test that format_price() pads Output with Zeros for Float-like String Input
        """
        actual = equipment.format_price("9,8")
        self.assertEqual(actual, decimal.Decimal("9.80"))

    def test_cut_off_price(self):
        """
        Test that format_price() cuts Number of after 2 Decimal Places for String Input with more than 2 Decimal Places
        """
        actual = equipment.format_price("8.9999")
        self.assertEqual(actual, decimal.Decimal("8.99"))


class EscapeSpecialCharactersCase(unittest.TestCase):

    def test_return_unmodified_input_if_no_character_needs_to_be_escaped(self):
        """
        Test that escape_special_charcters() does not change string if it does not contain characters that need to be escaped in LaTeX
        """
        string = r"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXJZ0123456789!§-/()=?´`+*'ß,.:;°"
        result = pdfutility.escape_special_characters(string)
        self.assertEqual(string, result)

    def test_escape_hashtag(self):
        """
        Test that escape_special_charcters() does escape Hashtag Symbol ("#")
        """
        self.assertEqual(pdfutility.escape_special_characters("#"), r"\#")

    def test_escape_dollar_sign(self):
        """
        Test that escape_special_charcters() does escape Dollar Sign ("$")
        """
        self.assertEqual(pdfutility.escape_special_characters("$"), r"\$")

    def test_escape_percentage(self):
        """
        Test that escape_special_charcters() does escape Percentage Sign ("%")
        """
        self.assertEqual(pdfutility.escape_special_characters("%"), r"\%")

    def test_escape_and(self):
        """
        Test that escape_special_charcters() does escape "&"-Symbol
        """
        self.assertEqual(pdfutility.escape_special_characters("&"), r"\&")

    def test_escape_tilde(self):
        """
        Test that escape_special_charcters() does escape Tilde ("~")
        """
        self.assertEqual(pdfutility.escape_special_characters(
            "~"), r"\textasciitilde ")

    def test_escape_underscore(self):
        """
        Test that escape_special_charcters() does escape underscore ("_")
        """
        self.assertEqual(pdfutility.escape_special_characters("_"), r"\_")

    def test_escape_circum(self):
        """
        Test that escape_special_charcters() does escape Circum ("^")
        """
        self.assertEqual(pdfutility.escape_special_characters(
            "^"), r"\textasciicircum ")

    def test_escape_backslash(self):
        """
        Test that escape_special_charcters() does escape Backslash ("\")
        """
        self.assertEqual(pdfutility.escape_special_characters(
            "\\"), r"\textbackslash ")

    def test_escape_opening_braces(self):
        """
        Test that escape_special_charcters() does escape Tilde ("{")
        """
        self.assertEqual(pdfutility.escape_special_characters("{"), r"\{")

    def test_escape_closing_braces(self):
        """
        Test that escape_special_charcters() does escape Tilde ("}")
        """
        self.assertEqual(pdfutility.escape_special_characters("}"), r"\}")

    def test_replace_empty_strings_with_na(self):
        """
        Test that escape_special_charcters() does replace empty Strings with "n/a"
        """
        self.assertEqual(pdfutility.escape_special_characters(""), r"n/a")

    def test_escape_multiple_occurrences(self):
        """
        Test that escape_special_charcters() does escape and symbol ("&") even if its found in the input multiple times
        """
        self.assertEqual(pdfutility.escape_special_characters(
            "test##test#"), r"test\#\#test\#")


class CheckIfAllPackagesAreInstalled(unittest.TestCase):

    def test_return_true_if_all_packages_exist(self):
        """
        Test that check_if_all_packages_are_installed() returns True if all packages exist in the expected location
        """
        patcher = unittest.mock.patch('os.path.isfile')
        mock_thing = patcher.start()
        mock_thing.return_value = True
        ret = equipment.check_if_all_packages_are_installed()
        self.assertTrue(ret)

    def test_return_false_if_no_package_exists(self):
        """
        Test that check_if_all_packages_are_installed() returns False if no package exists in the expected location
        """
        patcher = unittest.mock.patch('os.path.isfile')
        mock_thing = patcher.start()
        mock_thing.return_value = False
        ret = equipment.check_if_all_packages_are_installed()
        self.assertFalse(ret)

    def test_return_false_if_first_package_is_missing(self):
        """
        Test that check_if_all_packages_are_installed() returns False after the first package was not found in the expected location
        """
        patcher = unittest.mock.patch('os.path.isfile')
        mock_thing = patcher.start()
        mock_thing.return_value = False
        equipment.check_if_all_packages_are_installed()
        mock_thing.assert_called_once()

    def test_return_false_if_last_package_is_missing(self):
        """
        Test that check_if_all_packages_are_installed() returns False if the last package exists in the expected location
        """
        def side_effect(arg):
            if(arg == "/app/.TinyTeX/texmf-dist/tex/latex/ms/everysel.sty"):
                return False
            return True
        patcher = unittest.mock.patch('os.path.isfile')
        mock_thing = patcher.start()
        mock_thing.side_effect = side_effect
        ret = equipment.check_if_all_packages_are_installed()
        self.assertFalse(ret)

    def test_has_checked_every_package(self):
        """
        Test that check_if_all_packages_are_installed() checks every package it is supposed to check
        """
        patcher = unittest.mock.patch('os.path.isfile')
        mock_thing = patcher.start()
        mock_thing.return_value = True
        equipment.check_if_all_packages_are_installed()
        expected_calls = []
        expected_calls.append(
            call("/app/.TinyTeX/texmf-dist/tex/latex/lastpage/lastpage.sty"))
        expected_calls.append(
            call("/app/.TinyTeX/texmf-dist/tex/latex/tabu/tabu.sty"))
        expected_calls.append(
            call("/app/.TinyTeX/texmf-dist/tex/latex/varwidth/varwidth.sty"))
        expected_calls.append(
            call("/app/.TinyTeX/texmf-dist/tex/latex/colortbl/colortbl.sty"))
        expected_calls.append(
            call("/app/.TinyTeX/texmf-dist/tex/latex/fancyhdr/fancyhdr.sty"))
        expected_calls.append(
            call("/app/.TinyTeX/texmf-dist/tex/latex/ragged2e/ragged2e.sty"))
        expected_calls.append(
            call("/app/.TinyTeX/texmf-dist/tex/latex/ms/everysel.sty"))
        mock_thing.assert_has_calls(expected_calls)


class GenerateLatexTableFromDataframe(unittest.TestCase):
    def test_generates_table_for_empty_Dataframe(self):
        """
        Test that generate_latex_table_from(dataframe) returns empty String for empty Dataframe
        """
        self.assertEqual(pdfutility.generate_latex_table_from(
            pandas.DataFrame()), "")


class GenerateUniqueID(unittest.TestCase):
    def test_returns_xx_prefix_for_empty_name_and_type(self):
        """
        Test that generate_unique_id() generates an ID with "XX" prefix if type is not "General Report" and name is empty String
        """
        patcher = unittest.mock.patch(
            'dbutility.VerificationDatabase.get_taken_ids')
        mock_thing = patcher.start()
        mock_thing.return_value = []

        self.assertTrue(pdfutility.generate_unique_id("", "").startswith("XX"))

    def test_returns_xx_prefix_for_one_character_name_and_empty_type(self):
        """
        Test that generate_unique_id() generates an ID with "XX" prefix if
        type is not "General Report" and name is a one-character-long String
        """
        patcher = unittest.mock.patch(
            'dbutility.VerificationDatabase.get_taken_ids')
        mock_thing = patcher.start()
        mock_thing.return_value = []
        self.assertTrue(pdfutility.generate_unique_id(
            "", "a").startswith("XX"))

    def test_returns_gr_prefix_for_general_report_type_even_if_name_is_specified(
            self):
        """
        Test that generate_unique_id() generates an ID with "GR" prefix if
        type is "General Report" and name is not empty String
        """
        patcher = unittest.mock.patch(
            'dbutility.VerificationDatabase.get_taken_ids')
        mock_thing = patcher.start()
        mock_thing.return_value = []
        self.assertTrue(pdfutility.generate_unique_id(
            "General Report", "valid Name").startswith("GR"))

    def test_returns_gr_prefix_for_general_report_type_if_name_is_empty(self):
        """
        Test that generate_unique_id() generates an ID with "GR" prefix if
        type is "General Report" and name is empty String
        """
        patcher = unittest.mock.patch(
            'dbutility.VerificationDatabase.get_taken_ids')
        mock_thing = patcher.start()
        mock_thing.return_value = []
        self.assertTrue(pdfutility.generate_unique_id(
            "General Report", "").startswith("GR"))

    def test_returns_initials_as_prefix_for_empty_type_and_valid_name(self):
        """
        Test that generate_unique_id() generates an ID with Initials of first and
        second name as prefix if type is not "General Report" and name consists of two words
        """
        patcher = unittest.mock.patch(
            'dbutility.VerificationDatabase.get_taken_ids')
        mock_thing = patcher.start()
        mock_thing.return_value = []
        self.assertTrue(pdfutility.generate_unique_id(
            "", "Yannick Lang").startswith("YL"))

    def test_returns_initials_as_prefix_for_empty_type_and_one_word_name(self):
        """
        Test that generate_unique_id() generates an ID with first two characters of name as
        prefix if type is not "General Report" and name consists of one word with at least two characters
        """
        patcher = unittest.mock.patch(
            'dbutility.VerificationDatabase.get_taken_ids')
        mock_thing = patcher.start()
        mock_thing.return_value = []
        self.assertTrue(pdfutility.generate_unique_id(
            "", "Yannick").startswith("YA"))

    def test_returns_initials_as_prefix_for_empty_type_and_valid_long_name(
            self):
        """
        Test that generate_unique_id() generates an ID with Initials of first and second name as
        prefix if type is not "General Report" and name consists of more than two words
        """
        patcher = unittest.mock.patch(
            'dbutility.VerificationDatabase.get_taken_ids')
        mock_thing = patcher.start()
        mock_thing.return_value = []
        self.assertTrue(pdfutility.generate_unique_id(
            "", "Yannick Stephan Lang").startswith("YS"))

    def test_unique_id_must_be_exactly_8_characters_long(self):
        """
        Test that generate_unique_id() generates an ID that is exactly 8 characters long regardless of input
        """
        patcher = unittest.mock.patch(
            'dbutility.VerificationDatabase.get_taken_ids')
        mock_thing = patcher.start()
        mock_thing.return_value = []
        self.assertEqual(len(pdfutility.generate_unique_id("", "")), 8)
        self.assertEqual(
            len(pdfutility.generate_unique_id("General Report", "")), 8)
        self.assertEqual(
            len(pdfutility.generate_unique_id("", "Valid Name")), 8)
        self.assertEqual(len(pdfutility.generate_unique_id(
            "General Report", "Valid Name")), 8)
        self.assertEqual(len(pdfutility.generate_unique_id("", "Name")), 8)
        self.assertEqual(
            len(pdfutility.generate_unique_id("General Report", "Name")), 8)
        self.assertEqual(
            len(pdfutility.generate_unique_id("", "Long Valid Name")), 8)

    def test_return_empty_string_if_database_connection_fails(self):
        """
        Test that generate_unique_id() returns an empty string if dbutility.VerificationDatabase().get_taken_ids() returns an error
        """
        with patch.object(dbutility.VerificationDatabase, 'get_taken_ids', return_value=psycopg2.Error()):
            self.assertEqual(pdfutility.generate_unique_id("", ""), "")


def try_something():
    min_latex = (r"\documentclass{article}"
                 r"\begin{document}"
                 r"Hello, world!"
                 r"\end{document}")
    pdf = latex.build_pdf(min_latex)
    return bytes(pdf, encoding="ascii")


class GenerateB64PdfFromTex(unittest.TestCase):
    def test_returns_expected_result(self):
        """
        Test that generate_b64_pdf_from_tex(tex) returns the expected b64 encoded String
        """
        with patch.object(latex, 'build_pdf', return_value=b"helloWorld"):
            self.assertEqual(pdfutility.generate_b64_pdf_from_tex(
                "anything"), "aGVsbG9Xb3JsZA==")


class FillInLatexTemplate(unittest.TestCase):
    def test_returns_expected_result(self):
        """
        Test that fill_in_latex_template(filters_are_active, sort_by_col, sort_by_col2, order, dataframe) returns the expected template and id
        """
        with patch.object(pdfutility, 'generate_latex_table_from', return_value=r"&&&&\\"):
            with patch.object(pdfutility, 'generate_unique_id', return_value="AAAAAAAA"):
                with open("tests/expected_template.tex", "r", encoding="utf8") as expected_template:
                    expected = (
                        expected_template.read().replace(
                            "08.10.2020",
                            datetime.date.today().strftime("%d.%m.%Y")),
                        "AAAAAAAA")
                actual = pdfutility.fill_in_latex_template(
                    True, "Preis", "Index", "aufsteigend", pandas.DataFrame(
                        columns=["Index"]))
        self.assertTupleEqual(expected, actual)

    def test_returns_expected_result_no_filters_active(self):
        """
        Test that fill_in_latex_template(filters_are_active, sort_by_col, sort_by_col2, order, dataframe) returns the expected template and id
        """
        with patch.object(pdfutility, 'generate_latex_table_from', return_value=r"&&&&\\"):
            with patch.object(pdfutility, 'generate_unique_id', return_value="AAAAAAAA"):
                with open("tests/expected_template_2.tex", "r", encoding="utf8") as expected_template:
                    expected = (
                        expected_template.read().replace(
                            "08.10.2020",
                            datetime.date.today().strftime("%d.%m.%Y")),
                        "AAAAAAAA")
                actual = pdfutility.fill_in_latex_template(
                    False, "Preis", "Preis", "aufsteigend", pandas.DataFrame(
                        columns=["Index"]))
        self.assertTupleEqual(expected, actual)


class CreateDownloadlinkForVerifiedReport(unittest.TestCase):
    def test_calls_pdfutility_function_correctly(self):
        with patch.object(pdfutility, "generate_b64_pdf_from_tex", return_value="abc") as mock:
            equipment.create_pdf_downloadlink_for_verified_report(
                datetime.datetime.now(), b64encode(b"template"))
        mock.assert_called_once_with(b"template")

    def test_returns_expected_result(self):
        with patch.object(pdfutility, "generate_b64_pdf_from_tex", return_value="abc") as mock:
            actual = equipment.create_pdf_downloadlink_for_verified_report(
                datetime.datetime.now(), b64encode(b"template"))
        expected = f'<a href="data:file/pdf;base64,abc" download="technikliste_{datetime.date.today().strftime("%Y-%m-%d")}.pdf">Orginal Herunterladen</a>'
        self.assertEqual(expected, actual)


class CreatePdfDownloadlinkForNewReport(unittest.TestCase):
    def test_calls_pdfutility_function_correctly(self):
        pass


"""
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

    # replaces placeholders in latex template with actual values and tries to generate a unique, 8 character long id
    template, unique_id = pdfutility.fill_in_latex_template(filters_are_active, sort_by_col, sort_by_col2, order, dataframe)

    # if generation of id fails, for example due to connection error to database, unique_id is empty string,
    # and validation will not be available for this document
    if unique_id == "":
        st.warning(
            "Datenbankverbindung konnte nicht hergestellt werden. Verifizierung wird für dieses Dokument nicht möglich sein.")

    pdf_base64_string = pdfutility.generate_b64_pdf_from_tex(template)

    # create a filename with the current date
    filename = "technikliste_" + datetime.now().strftime("%Y-%m-%d") + ".pdf"

    # if unique_id is empty string, connection to db failed prior and verification is not available for this document as a result
    if not unique_id == "":
        return_value = VerificationDatabase().save_record(
            template=template, id=unique_id, devices=len(dataframe["Index"]), query="")
        if return_value == -1:
            st.warning(
                "Datenbankverbindung konnte nicht hergestellt werden. Verifizierung wird für dieses Dokument nicht möglich sein.")

    # create and return actual download-link with base64 encoded pdf and filename
    download_link = f'<a href="data:file/pdf;base64,{pdf_base64_string}" download="{filename}">PDF Datei Herunterladen</a>'
    return download_link
"""

if __name__ == "__main__":
    unittest.main()  # run all tests
