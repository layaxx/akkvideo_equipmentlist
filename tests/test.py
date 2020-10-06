import os,sys, unittest, unittest.mock
from unittest.mock import call
sys.path.insert(1, os.path.join(sys.path[0], '..'))
import equipment
import pandas, decimal
import numpy as np

class LoadDataTestCase(unittest.TestCase):

    def setUp(self):
        self.dataframe = equipment.load_data("tests/test1.csv")

    def tearDown(self):
        self.dataframe = None

    def test_read_csv(self):
        actual = self.dataframe
        expected = pandas.DataFrame(np.array([[1,1,"Produkt1","Medienraum","Stahlschrank","","Software","Magix","","","","unklar ob auf PC / welchem PC"],
                    [2,1,"Produkt2","Medienraum","Stahlschrank","","Zubehör","Coast",decimal.Decimal("27.90"),"GHW","",""],
                    [3,1,"Produkt3","Medienraum","Stahlschrank","","Kabel","",decimal.Decimal("21.41"),"","",""]]),
                    columns=["Index","Menge","Gerätebezeichnung","Lagerort","Lagerort_konkret","Behälter","Kategorie","Marke","Preis","wo_gekauft","zusätzliche_Tags","Anmerkungen"])

        pandas.testing.assert_frame_equal(actual, expected, check_dtype=False)

    def test_convert_index_to_integer(self):
        """
        Test if values in Index column are converted to Integer during loading
        """
        self.assertEqual(type(self.dataframe["Index"][1]), np.int64)

    def test_convert_menge_to_integer(self):
        """
        Test that values in Menge column are converted to Integer during loading
        """
        self.assertEqual(type(self.dataframe["Menge"][1]), np.int64)

    def test_convert_preis_to_decimal(self):
        """
        Test that values in Preis column are converted to Decimal during loading
        """
        self.assertEqual(type(self.dataframe["Preis"][1]), decimal.Decimal)

    def test_format_preis(self):
        """
        Test that values in preis column have correct formatting
        """
        self.assertEqual(len(str(self.dataframe["Preis"][1])), 5)

class FormatPriceTestCase(unittest.TestCase):

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
        result = equipment.escape_special_characters(string)
        self.assertEqual(string, result)

    def test_escape_hashtag(self):
        """
        Test that escape_special_charcters() does escape Hashtag Symbol ("#")
        """
        self.assertEqual(equipment.escape_special_characters("#"), r"\#")

    def test_escape_dollar_sign(self):
        """
        Test that escape_special_charcters() does escape Dollar Sign ("$")
        """
        self.assertEqual(equipment.escape_special_characters("$"), r"\$")

    def test_escape_percentage(self):
        """
        Test that escape_special_charcters() does escape Percentage Sign ("%")
        """
        self.assertEqual(equipment.escape_special_characters("%"), r"\%")

    def test_escape_and(self):
        """
        Test that escape_special_charcters() does escape "&"-Symbol
        """
        self.assertEqual(equipment.escape_special_characters("&"), r"\&")

    def test_escape_tilde(self):
        """
        Test that escape_special_charcters() does escape Tilde ("~")
        """
        self.assertEqual(equipment.escape_special_characters("~"), r"\textasciitilde ")

    def test_escape_underscore(self):
        """
        Test that escape_special_charcters() does escape underscore ("_")
        """
        self.assertEqual(equipment.escape_special_characters("_"), r"\_")

    def test_escape_circum(self):
        """
        Test that escape_special_charcters() does escape Circum ("^")
        """
        self.assertEqual(equipment.escape_special_characters("^"), r"\textasciicircum ")

    def test_escape_backslash(self):
        """
        Test that escape_special_charcters() does escape Backslash ("\")
        """
        self.assertEqual(equipment.escape_special_characters("\\"), r"\textbackslash ")

    def test_escape_opening_braces(self):
        """
        Test that escape_special_charcters() does escape Tilde ("{")
        """
        self.assertEqual(equipment.escape_special_characters("{"), r"\{")

    def test_escape_closing_braces(self):
        """
        Test that escape_special_charcters() does escape Tilde ("}")
        """
        self.assertEqual(equipment.escape_special_characters("}"), r"\}")

    def test_replace_empty_strings_with_na(self):
        """
        Test that escape_special_charcters() does replace empty Strings with "n/a"
        """
        self.assertEqual(equipment.escape_special_characters(""), r"n/a")

    def test_escape_multiple_occurrences(self):
        """
        Test that escape_special_charcters() does escape and symbol ("&") even if its found in the input multiple times 
        """
        self.assertEqual(equipment.escape_special_characters("test##test#"), r"test\#\#test\#")

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
        expected_calls.append(call("/app/.TinyTeX/texmf-dist/tex/latex/lastpage/lastpage.sty"))
        expected_calls.append(call("/app/.TinyTeX/texmf-dist/tex/latex/tabu/tabu.sty"))
        expected_calls.append(call("/app/.TinyTeX/texmf-dist/tex/latex/varwidth/varwidth.sty"))
        expected_calls.append(call("/app/.TinyTeX/texmf-dist/tex/latex/colortbl/colortbl.sty"))
        expected_calls.append(call("/app/.TinyTeX/texmf-dist/tex/latex/fancyhdr/fancyhdr.sty"))
        expected_calls.append(call("/app/.TinyTeX/texmf-dist/tex/latex/ragged2e/ragged2e.sty"))
        expected_calls.append(call("/app/.TinyTeX/texmf-dist/tex/latex/ms/everysel.sty"))
        mock_thing.assert_has_calls(expected_calls)


class GenerateLatexTableFromDataframe(unittest.TestCase):
    def test_generates_table_for_empty_Dataframe(self):
        """
        Test that generate_latex_table_from(dataframe) returns empty String for empty Dataframe
        """
        self.assertEqual(equipment.generate_latex_table_from(pandas.DataFrame()), "")

    def test_generates_expected_table_for_nonempty_Dataframe(self):
        """
        Test that generate_latex_table_from(dataframe) returns expected String for non empty Dataframe
        """
        with open("tests" + os.sep + "expected_table.txt", "r") as file:
            expected = file.read()
        actual = equipment.generate_latex_table_from(equipment.load_data("tests/test1.csv"))
        self.assertEqual(expected, actual)

    def test_escapes_characters(self):
        """
        Test that generate_latex_table_from(dataframe) returns escaped String for Dataframe with characters that need to be escaped
        """
        with open("tests" + os.sep + "expected_table2.txt", "r") as file:
            expected = file.read()
        actual = equipment.generate_latex_table_from(equipment.load_data("tests/test2.csv"))
        self.assertEqual(expected, actual)

if __name__ == "__main__":
    unittest.main() # run all tests

