import mysql from 'mysql';
import config from "config";
export default class Database {

    constructor() {
        let connection = mysql.createConnection({
            host: config.get('database.host'),
            port: config.get('database.port'),
            user: config.get('database.username'),
            password: config.get('database.password'),
            database: config.get('database.database')
        });

        connection.connect(function(err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }

            console.log("Connected to the database...");
        });

        this.connection = connection;

        return this;
    }

    disconnect() {
        this.connection.end();
        console.log("Disconnected from the database...")
    }

    async getListings() {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM listings";

            this.connection.query(sql, function (err, result) {
                if (err) reject(err);

                // Loop results and remove any listings without urls
                for (let i = 0; i < result.length; i++) {
                    if (!result[i].url) {
                        result.splice(i, 1);
                    }
                }

                resolve(result);
            });
        })
    }

    saveScrapeData(values) {
        return new Promise((resolve, reject) => {
            let sql = "INSERT INTO scrape_data SET ?";

            this.connection.query(sql, values, function (err, result) {
                if (err) reject(err);
                resolve(result);
            });
        })
    }
}