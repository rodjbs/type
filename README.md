# type
Web based game for training typing words with accents or hyphens

The game uses a python server (server.py) that provides words to the web client (app.html + client.js).

In order to run this application, there are certain files that need to be generated: the sqlite database ("db") and the images that are used by the client (in the subdirectory "img"). The script "createdb.py" creates the database. Running the script requires aspell to be installed. In order to create the images in the "img" subdirectory, you need to run the script "gimp.py" through gimp's "python-fu" console. More detailed instructions can be found in the comments of that script.
