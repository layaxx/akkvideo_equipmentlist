import unittest
import os,sys
from numpy.testing._private.utils import assert_equal

from pandas.core.frame import DataFrame
sys.path.insert(1, os.path.join(sys.path[0], '..'))
import equipment
import pandas
import numpy as np
import decimal

class LoadDataTestCase(unittest.TestCase):

    def testReadCSV(self):
        actual = equipment.load_data("tests/test1.csv")
        expected = pandas.DataFrame(np.array([[1,1,"Produkt1","Medienraum","Stahlschrank","","Software","Magix","","","","unklar ob auf PC / welchem PC"],
                    [2,1,"Produkt2","Medienraum","Stahlschrank","","Zubehör","Coast",decimal.Decimal("27.90"),"GHW","",""],
                    [3,1,"Produkt3","Medienraum","Stahlschrank","","Kabel","",decimal.Decimal("21.41"),"","",""]]),
                    columns=["Index","Menge","Gerätebezeichnung","Lagerort","Lagerort_konkret","Behälter","Kategorie","Marke","Preis","wo_gekauft","zusätzliche_Tags","Anmerkungen"])

        pandas.testing.assert_frame_equal(actual, expected, check_dtype=False)

    def testConvertIndexToInteger(self):
        DataFrame = equipment.load_data("tests/test1.csv")

        assert_equal(type(DataFrame["Index"][1]), np.int64)

    def testConvertMengeToInteger(self):
        DataFrame = equipment.load_data("tests/test1.csv")

        assert_equal(type(DataFrame["Menge"][1]), np.int64)

    def testConvertPreisToDecimal(self):
        DataFrame = equipment.load_data("tests/test1.csv")

        assert_equal(type(DataFrame["Preis"][1]), decimal.Decimal)

    def testFormatPreis(self):
        DataFrame = equipment.load_data("tests/test1.csv")

        assert_equal(len(str(DataFrame["Preis"][1])), 5)

class FormatPriceTestCase(unittest.TestCase):

    def testReturnEmptyStringForNan(self):
        actual = equipment.format_price(np.nan)
        assert_equal(actual, "")

    def testConvertFloatToDecimal(self):
        actual = equipment.format_price(9.85)
        assert_equal(actual, decimal.Decimal.from_float(9.85))

    def testConvertStringWithPointToDecimal(self):
        actual = equipment.format_price("9.85")
        assert_equal(actual, decimal.Decimal("9.85"))

    def testConvertStringWithCommaToDecimal(self):
        actual = equipment.format_price("9,85")
        assert_equal(actual, decimal.Decimal("9.85"))

    def testPadPrice(self):
        actual = equipment.format_price("9")
        assert_equal(actual, decimal.Decimal("9.00"))

    def testPadPrice2(self):
        actual = equipment.format_price("9,8")
        assert_equal(actual, decimal.Decimal("9.80"))

    def testPadPrice3(self):
        actual = equipment.format_price("8.9999")
        assert_equal(actual, decimal.Decimal("8.99"))
    

class EscapeSpecialCharactersCase(unittest.TestCase):

    def testReturnUnmodifiedInputIfNoCharacterNeedsToBeEscaped(self):
        input= r"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXJZ0123456789!§-/()=?´`+*'ß,.:;°"
        actual = equipment.escape_special_characters(input)
        assert_equal(input, actual)

    # escapes all occurrences of # $ % & ~ _ ^ \ { } and escapes them in order to make them safe for latex compiling

    def testEscapeHashtag(self):
        assert_equal(equipment.escape_special_characters("#"), r"\#")

    def testEscapeDollarSign(self):
        assert_equal(equipment.escape_special_characters("$"), r"\$")

    def testEscapePercentage(self):
        assert_equal(equipment.escape_special_characters("%"), r"\%")

    def testEscapeAnd(self):
        assert_equal(equipment.escape_special_characters("&"), r"\&")

    def testEscapeTilde(self):
        assert_equal(equipment.escape_special_characters("~"), r"\textasciitilde")

    def testEscapeUnderscore(self):
        assert_equal(equipment.escape_special_characters("_"), r"\_")

    def testEscapeCircum(self):
        assert_equal(equipment.escape_special_characters("^"), r"\textasciicircum")

    def testEscapeBackslash(self):
        assert_equal(equipment.escape_special_characters("\\"), r"\textbackslash")

    def testEscapeOpeningBraces(self):
        assert_equal(equipment.escape_special_characters("{"), r"\{")

    def testEscapeClosingBraces(self):
        assert_equal(equipment.escape_special_characters("}"), r"\}")

    def testreplaceEmptyStringsWithNA(self):
        assert_equal(equipment.escape_special_characters(""), r"n/a")


if __name__ == "__main__":
    unittest.main() # run all tests

