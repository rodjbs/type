#!/bin/python3

import sqlite3

import traceback
from sys import stdout

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

cursor = sqlite3.connect('db').cursor()

categories = ["grave", "circunflexo", "cedilha", "til", "agudo", "hífen"]

@app.route('/words', methods=['POST'])
def words():
    try:
        return jsonify(exec_query(request.get_json()))
    except Exception as err:
        traceback.print_exc(file=stdout)
        response = jsonify('something went wrong')
        response.status_code = 500
        return response

# returns array of words
def exec_query(wordset):
    n = wordset['n']
    assert(n > 0 and n < 500) # possivelmente vou querer aumentar o limite
    conditions = read_categories(wordset)
    join_conditions = 'WHERE ' + ' AND '.join(conditions) if len(conditions) > 0 else ''
    query = 'SELECT lower(word) FROM words ' + join_conditions + ' ORDER BY RANDOM() LIMIT ' + str(n)
    print(query)
    cursor.execute(query)
    res = cursor.fetchall()
    return [word_tuple[0] for word_tuple in res]

def read_categories(wordset):
    conditions = []
    for k in wordset.keys():
        if k in categories:
            conditions.append(k + '=' + str(int(wordset[k])))
    return conditions
