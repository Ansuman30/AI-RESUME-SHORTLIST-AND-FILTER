const axios = require("axios");
const cheerio = require("cheerio");

async function webscrape(role) {
    const n_role = role.replace(/\s+/g, "%20");
    const url = `https://www.linkedin.com/jobs/search?keywords=${n_role}&location=India&geoId=102713980&trk=public_jobs_jobs-search-bar_search-submit&original_referer=https%3A%2F%2Fwww.linkedin.com%2Fjobs%2Fsearch%3Fkeywords%3D%26location%3Dindia%26geoId%3D%26trk%3Dpublic_jobs_jobs-search-bar_search-submit%26position%3D1%26pageNum%3D0&position=1&pageNum=0`;

    const jobs = await axios.get(url).then((response) => {
        const jobs = [];
        const html = response.data;

        const scrape = cheerio.load(html);
        const element = scrape(".base-search-card__info");
        const link = scrape(".base-card__full-link");
        const title = element.find(".base-search-card__title");
        const c_name = element.find(".hidden-nested-link");
        const location = element.find(".job-search-card__location");
        const time = element.find(".job-search-card__listdate");


        for (let i = 0; i < title.length; i++) {
            const a = (scrape(title[i]).text().trim());
            const b = (scrape(c_name[i]).text().trim());
            const c = (scrape(location[i]).text().trim());
            const d = (scrape(time[i]).text().trim());
            const e = (scrape(link[i]).attr("href").trim());

            const newjob = {
                title: a,
                company: b,
                location: c,
                time_posted: d,
                link_to_job: e,
            }
            jobs.push(newjob);
        }
        return jobs;
    })
    return jobs;
}

module.exports={webscrape};


