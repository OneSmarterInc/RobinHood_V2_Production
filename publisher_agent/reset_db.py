import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
conn = psycopg2.connect(dbname='postgres', user='postgres', password='yash@3375', host='localhost', port='5433')
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()
cur.execute('DROP DATABASE IF EXISTS "PublisherAgentDB"')
cur.execute('CREATE DATABASE "PublisherAgentDB"')
cur.close()
conn.close()
