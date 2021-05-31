#!/bin/python3

import json
import subprocess
import sqlite3

def read_letter_groups():
	with open('special_letters.json', 'r') as f:
		return json.loads(f.read())

def word_in_group(word, group, groups):
	for s in groups[group]:
		if word.find(s) != -1:
			return True
	return False

def word_in_groups(word, groups):
	return [word_in_group(word, group, groups) for group in groups]

def dictionary():
	proc = subprocess.run('aspell -d pt_PT dump master'.split(), encoding='utf-8', stdout=subprocess.PIPE)
	return proc.stdout.splitlines()

def create_db():
	groups = read_letter_groups()
	conn = sqlite3.connect('db')
	c = conn.cursor()
	c.execute('CREATE TABLE words (word text,' + ','.join(group + ' integer' for group in groups) + ')')
	data = []
	for word in dictionary():
		data.append([word] + word_in_groups(word, groups))
	q = 'INSERT INTO words VALUES (?,' + ','.join('?' for group in groups) + ')'
	c.executemany(q, data)
	conn.commit()
	conn.close()

if(__name__ == '__main__'):
	create_db()
