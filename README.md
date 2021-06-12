# type
Web based game for training typing portuguese words with accents or hyphens

To run the application, execute start_server (requires python, flask and flask_cors) and open app.html in a web browser.

This application runs well in Chromium on Arch Linux. Other OS/browser combinations don't work because of portability issues with key codes. I might fix those issues one day.

Architecture: the game uses a python server (server.py) that fetches words from an sqlite database (db) in order to provide those words to the web client (app.html + client.js).

Certain files in this repository were generated programatically: the sqlite database ("db") and most of the images that are used by the client (in the subdirectory "img"). The script "createdb.py" creates the database. Running the script requires aspell to be installed. In order to create the letter images in the "img" subdirectory, you need to run the script "gimp.py" through gimp's "python-fu" console. More detailed instructions can be found in the comments of that script. Note that some of the images were generated manually.
