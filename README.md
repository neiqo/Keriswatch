
# Keriswatch
BED Assg
Keriswatch is ---

## How to run it
First, clone the repository. \
Then, run this in your terminal ``` npm install ``` \
Keriswatch uses Microsoft SQL Server (MSSQL). Ensure you have it installed and configured. Then, update the database configuration: \
Edit the *dbConfig.js* file in the project directory: \
```
const config = {
    user: 'your_username',
    password: 'your_password',
    server: 'your_server',
    database: 'your_database',
    options: {
        encrypt: true, // Use encryption
        enableArithAbort: true
    }
};
module.exports = config;
```
Then, run the *finalised_database_creation.sql* script.
Lastly, run this in your terminal:
```node app.js```
## Branches


 - country-stats-siankim
	 - Create charts and map for homepage 
		 - Done by: Sian Kim
 - bookmark-articles-siankim
	 - Ability to bookmark articles on the website
		 - Done by: Sian Kim
 - account-diontae
	 - Account management and comments on articles
		 - Done by: Diontae
 - news-search-neil
	 - News articles and ability to search articles based on keyword
		 - Done by: Neil 
 - events-vincent
	 - Creating, getting, deleting, updating events and ability for users to join events 
		 - Done by: Vincent
  

## Modules Used

1.  Express
2.  Body-parser
3.  Joi
4.  MSSQL
5.  fs
		- module for interacting with file system
6.  util
		- module for debugging and logging
7.  multer
		- module for uploading files
8.  JWT
		- module for user authentication token

## Notes

If editing any JS files, turn off Prettier extension because the formatting will remove some things and make things not work, a bit annoying

Articles have 3 images, first image will be the cover image or main image while other 2 will be in the body of the article

When making a login, remove password expiration in Server (SQLEXPRESS) Properties > Security so that life is easier
