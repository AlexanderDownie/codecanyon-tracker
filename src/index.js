import cron from "node-cron";
import Scraper from "./Scraper.js";
import Database from "./Database.js";
import config from "config";

const cronSchedule = config.get('cron');

console.log(`Starting cron job with schedule: ${cronSchedule}`);

cron.schedule(cronSchedule, async () => {
    // Connect to the database
    const db = new Database();

    // Get all listings
    const listings = await db.getListings();

    // Loop through the listings
    for (let listing of listings) {
        console.log(`Scraping listing #${listing.id} - ${listing.url}`)

        // Scrape the listing
        const response = await Scraper.getListing(listing.url);

        // Save the scrape data to the database
        await db.saveScrapeData({
            listing_id: listing.id,
            is_successful: response.success,
            sales: response.data.sales || 0,
            price: response.data.price || 0,
            last_update: response.data.lastUpdate || null,
            published: response.data.published || null,
            error_message: response.error || "",
            timestamp: response.timestamp
        });

        // Update the last successful scrape timestamp
        if (response.success) {
            await db.updateLastSuccessfulScrape(listing.id, response.timestamp);
        }

        console.log(`Scraped listing #${listing.id} - Data saved to database`)
    }

    // Disconnect from the database
    db.disconnect();
});

