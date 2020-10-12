import datetime
import decimal
import os
import sys
import unittest
import unittest.mock
from base64 import b64encode
from unittest.mock import patch

import latex
import numpy as np
import pandas
import psycopg2

sys.path.insert(1, os.path.join(sys.path[0], '..'))
import dbutility  # nopep8
import pdfutility  # nopep8


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


class CreateDownloadlinkForVerifiedReport(unittest.TestCase):
    def test_calls_pdfutility_function_correctly(self):
        with patch.object(pdfutility, "generate_b64_pdf_from_tex", return_value="abc") as mock:
            pdfutility.create_pdf_downloadlink_for_verified_report(
                datetime.datetime.now(), b64encode(b"template"))
        mock.assert_called_once_with(b"template")

    def test_returns_expected_result(self):
        with patch.object(pdfutility, "generate_b64_pdf_from_tex", return_value="abc") as mock:
            actual = pdfutility.create_pdf_downloadlink_for_verified_report(
                datetime.datetime.now(), b64encode(b"template"))
        expected = f'<a href="data:file/pdf;base64,abc" download="technikliste_{datetime.date.today().strftime("%Y-%m-%d")}.pdf">Orginal Herunterladen</a>'
        self.assertEqual(expected, actual)


class CreatePdfDownloadlinkForNewReport(unittest.TestCase):
    def test_calls_pdfutility_function_correctly(self):
        pass


if __name__ == "__main__":
    unittest.main()  # run all tests
