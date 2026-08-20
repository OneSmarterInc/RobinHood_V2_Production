import psycopg2
conn = psycopg2.connect(dbname='postgres', user='postgres', password='yash@3375', host='localhost', port='5433')
cur = conn.cursor()
cur.execute("SELECT app, name FROM django_migrations")
print(cur.fetchall())
cur.close()
conn.close()
