const puppeteer = require('puppeteer-extra');
const { MongoClient, ServerApiVersion } = require('mongodb');


const keywords = ['solidity']
const nextButtonXP = "//span[contains(@class,'up-pagination-label') and contains(text(), 'Next')]/.."

let _keyword = null
let page

main()

async function main(){
    await puppeteerBoot()
    await setRequestInterceptor()
    // mongodb setup

    for(let keyword of keywords){
        _keyword = keyword
        await scrapeKeyword()
    }
}

async function scrapeKeyword(){
    // todo decide filters vs attributes to analyze
    let url = "https://www.upwork.com/nx/jobs/search/?q=" + _keyword + "&sort=recency"
    await page.goto(url)
    await scrapePage()
    console.log("Keyword " + _keyword + " scraping done")
}

async function scrapePage(){
    // if next button disabled return 
    // else wait load + click next + await scrapePage()
}

function parseJobs(jobs){
    // clean
    // update to database into keyword folder
}

async function puppeteerBoot() {
	const StealthPlugin = require('puppeteer-extra-plugin-stealth');
	puppeteer.use(StealthPlugin());
	browser = await puppeteer.launch({
	  headless: false,
	}) 
    page = (await browser.pages())[0]
}

async function setRequestInterceptor(){
	await page.setRequestInterception(true);
    await page.on('request', request => {
        request.continue();
    });
	await page.on('response', async(response) => {
		const request = response.request();
		if(request.method() == "GET" && (request.url().includes("https://www.upwork.com/ab/jobs/search/url") || request.url().includes("https://www.upwork.com/search/jobs/url"))){
            let responseRaw = await response.text()
            let jobs = JSON.parse(responseRaw).searchResults.jobs
        }
    })
}
