import psycopg2
import os
from base64 import b64encode


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
            cur.execute("INSERT INTO verify (devices, query, tex, id) VALUES (%s, %s, %s, %s)", [
                        devices, query, template, id])
            connection.commit()
            cur.close()
        except psycopg2.Error as e:
            print(e)
            return -1
        finally:
            if connection is not None:
                connection.close()