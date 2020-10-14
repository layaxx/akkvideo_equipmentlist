from base64 import b64encode
import pandas
import psycopg2
import os

'''
Pseudo Documentation for Database

The Datatabse is a postgres database running on heroku and kenn be accessed with the DATABASE_URL environment variable
It consists of two tables verify and devices, which where created with the following commands:
CREATE TABLE verify (
	timestamp TIMESTAMP DEFAULT current_timestamp,      # datetime representing the date and time of insertion into the database
	devices INTEGER NOT NULL,                           # integer representing the amount of devices included in the report
	query TEXT,                                         # string representing the filters with which the report was generated TODO: not yet implemented
	tex TEXT,                                           # base64 encoded LaTeX soruce file with which the report can be regenerated
	id CHAR(8) PRIMARY KEY                              # 8 character unique ID containing captial letters A-Z and digits 2-9 (limiting risk of confusion of similar looking characters)
);

CREATE TABLE devices (
    index INTEGER NOT NULL,                             # integer mostly for backwards compatibility
    amount INTEGER DEFAULT 1,                           # integer representing the amount of identical devices
    description TEXT NOT NULL,                          # string containing a description of the item
    location TEXT DEFAULT 'Medienraum',                 # string representing the current location of the item (e.g. "Medienraum")
    location_prec TEXT DEFAULT '',                      # string specifying the location of the item in more Detail (e.g. "Stahlschrank)
    container TEXT DEFAULT '',                          # string stating what conatiner the item is in, if any (e.g. "Tontasche")
    category TEXT DEFAULT 'Sonstiges',                  # comma seperated list of tags for the item (e.g. "Kamera" or "Ton")
    brand TEXT DEFAULT '',                              # string representing the brand name of the item (e.g. "Canon")
    price NUMERIC(7,2),                                 # Decimal storing the price per unit for the item
    store TEXT DEFAULT '',                              # String specifying where the item was bought (e.g. "Amazon.com")
    comments TEXT DEFAULT '',                           # String storing additional information about the item (e.g. "display is broken")
    history TEXT DEFAULT '',                            # TODO: to be implemented
    id CHAR(6) PRIMARY KEY,                             # 6 character unique ID containing captial letters A-Z and digits 2-9 (limiting risk of confusion of similar looking characters)
    date DATE
);
'''


class VerificationDatabase():

    def __init__(self) -> None:
        self.DATABASE_URL = os.environ.get("DATABASE_URL")

    def get_taken_ids(self, prefix):
        '''
        Connects to Database specified in the "DATABASE_URL" environment variable and retrieves every "id" value
        starting with given preset from table "verify".
        Returns list of Ids (may be an empty list of none were present in the table) if succesfull
        Returns error instead if one occurs during interaction with database
        '''
        connection = None
        try:
            '''
            Connect to Database
            '''
            if "REQUIRE_SSL" in os.environ:
                connection = psycopg2.connect(
                    self.DATABASE_URL, sslmode='require')
            else:
                connection = psycopg2.connect(self.DATABASE_URL)
            cur = connection.cursor()
            '''
            Get all IDs from table "verify" that start with the given prefix
            '''
            prefix = "".join([prefix, "%"])
            cur.execute("SELECT id FROM verify WHERE id LIKE %s", [prefix])
            records = cur.fetchall()
            ids = [record[0] for record in records]
            connection.commit()
            cur.close()
        except psycopg2.Error as e:
            return e
        finally:
            if connection is not None:
                connection.close()
        return ids

    def save_record(self, template, id, devices, query=""):
        '''
        Connects to Database specified in the "DATABASE_URL" environment variable and creates a new row for the created document
        takes the documents latex source code, the unique id, the amount of devices in the report and optionally the query as inputs
        '''
        connection = None
        try:
            '''
            Connect to Database
            '''
            if "REQUIRE_SSL" in os.environ:
                connection = psycopg2.connect(
                    self.DATABASE_URL, sslmode='require')
            else:
                connection = psycopg2.connect(self.DATABASE_URL)
            cur = connection.cursor()
            '''
            Insert new Row into table "verify"
            '''
            template = str(b64encode(bytes(template, encoding="utf8")))[2:-1]
            cur.execute(
                "INSERT INTO verify (devices, query, tex, id) VALUES (%s, %s, %s, %s)", [
                    devices, query, template, id])
            connection.commit()
            cur.close()
        except psycopg2.Error as e:
            print(e)
            return -1
        finally:
            if connection is not None:
                connection.close()

    def verify(self, unique_id):
        '''
        Connects to Database specified in the "DATABASE_URL" environment variable and searches the "verify" table for
        the given id.
        Returns empty dict indicating that the report does not exist if no corresponding row is found
        Returns dict containing values for columns "devices", "timestamp", "query" and "tex"
        '''
        connection = None
        try:
            '''
            Connect to Database
            '''
            if "REQUIRE_SSL" in os.environ:
                connection = psycopg2.connect(
                    self.DATABASE_URL, sslmode='require')
            else:
                connection = psycopg2.connect(self.DATABASE_URL)
            cur = connection.cursor()
            '''
            Get row with ID matching given unique_id from table "verify" if it exists
            '''
            cur.execute("SELECT * FROM verify WHERE id = %s", (unique_id,))
            record = cur.fetchone()
            connection.commit()
            cur.close()
            if record is None:
                return {}
            else:
                print(record)
                result = {
                    "timestamp": record[0],
                    "devices": record[1],
                    "query": record[2],
                    "tex": record[3]}
                return result
        except psycopg2.Error as e:
            print(e)
            return -1
        finally:
            if connection is not None:
                connection.close()


class DevicesDatabase():
    def __init__(self) -> None:
        self.DATABASE_URL = os.environ.get("DATABASE_URL")
        self.columns_dict = {
            'index': 'Index',
            "amount": "Menge",
            "description": "Gerätebezeichnung",
            "location": "Lagerort",
            "location_prec": "Lagerort_konkret",
            "container": "Behälter",
            "category": "Kategorie",
            "brand": "Marke",
            "price": "Preis",
            "store": "wo_gekauft",
            "comments": "Anmerkungen"}

    def load_all_devices_into_dataframe(self):
        '''
        Connects to Database specified in the "DATABASE_URL" environment variable and searches the "devices" table for
        all devices
        Returns sanitized DataFrame containing one row per device present in the DB table if everything goes well
        Returns -1 and prints error to console if one occurs during Database interaction
        '''
        connection = None
        try:
            '''
            Connect to Database
            '''
            if "REQUIRE_SSL" in os.environ:
                connection = psycopg2.connect(
                    self.DATABASE_URL, sslmode='require')
            else:
                connection = psycopg2.connect(self.DATABASE_URL)
            dataframe = pandas.read_sql_query(
                "SELECT * FROM devices", connection, coerce_float=False)
            dataframe.rename(columns=self.columns_dict, index={
                'ONE': 'one'}, inplace=True)
            dataframe = dataframe.convert_dtypes()
            connection.commit()
            return dataframe
        except psycopg2.Error as e:
            print(e)
            return -1
        finally:
            if connection is not None:
                connection.close()
                    
    def insert_device(self,index,amount,description,location,location_prec,container,category,brand,price,store,comments,id,date):
        '''
        Connects to Database specified in the "DATABASE_URL" environment variable and creates a new row for the created document
        takes the documents latex source code, the unique id, the amount of devices in the report and optionally the query as inputs
        '''
        connection = None
        try:
            '''
            Connect to Database
            '''
            if "REQUIRE_SSL" in os.environ:
                connection = psycopg2.connect(
                    self.DATABASE_URL, sslmode='require')
            else:
                connection = psycopg2.connect(self.DATABASE_URL)
            cur = connection.cursor()
            '''
            Insert new Row into table "verify"
            '''
            cur.execute(
                "INSERT INTO devices (index,amount,description,location,location_prec,container,category,brand,price,store,comments,id,date) VALUES (%s, %s, %s, %s, %s,%s,%s,%s,%s,%s,%s,%s,%s)", [
                    index,amount,description,location,location_prec,container,category,brand,price,store,comments,id,date])
            connection.commit()
            cur.close()
        except psycopg2.Error as e:
            print(e)
            return -1
        finally:
            if connection is not None:
                connection.close()