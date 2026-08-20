import psycopg2
conn = psycopg2.connect(dbname='PublisherAgentDB', user='postgres', password='yash@3375', host='localhost', port='5433')
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
tables = [r[0] for r in cur.fetchall()]
print(tables)
cur.close()
conn.close()
