# Roskilde_UI_Node
A copy of my other project at https://github.com/joipoi/Roskilde_UI. However this one is written in node while that one is written in Java Spring, there are also some other changes to the functionality.

## Installing / Getting started

You need to have node and mysql installed before starting

To download the project and install the node modules run:
```shell
git clone https://github.com/joipoi/roskilde_ui_node.git
cd roskilde_ui_node/
npm install
```

After this you need to configure the .env file and import the database

In the project root make a new file called ".env". Add the following variables(you need to input your own data here)

- SESSION_SECRET=
- DB_USER=
- DB_PASS=
- PORT=
- ADMIN_ID=

then import the database using the dump.sql file, this could vary depening on your operative system, but it could look like this:

```shell
mysql -u username -p  < dump.sql
```

## Features
- web server with express
- api calls with axios
- user auth with passport + express_session
- html templating with handlebars
- passport encrypting with bcrypt
- enviroment variables with dotenv
