const puppeteer = require('puppeteer-extra');
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config()

let mongoDB
let mongo_dbName = 'UpworkJobsAnalysis'

const keywords = ['solidity', 'ethereum', 'blockchain', 'evm', 'smart contract', 'nft', 'defi', 'web3']
const nextButtonXP = "//span[contains(@class,'up-pagination-label') and contains(text(), 'Next')]/.."
const nextButtonDisabledXP = "//button[@disabled]/span[contains(@class,'up-pagination-label') and contains(text(), 'Next')]"

let _keyword = null
let page

main()

async function main(){
    await setupMongoDB()
    await puppeteerBoot()
    await page.goto("https://www.upwork.com")
    await sleep(90000) // turned out login is needed to unlock proposalsTier data, one run job not worth coding
    await setRequestInterceptor()
    for(let keyword of keywords){
        _keyword = keyword
        await createDbCollection()
        await scrapeKeyword()
    }
}

async function createDbCollection(){
    try {
        await mongoDB.db(mongo_dbName).createCollection(_keyword)
    } catch(e) {}
}

async function scrapeKeyword(){
    let url = "https://www.upwork.com/nx/jobs/search/?q=" + _keyword + "&sort=recency"
    await page.goto(url)
    await scrapePage()
    console.log("Keyword " + _keyword + " scraping done")
}

async function scrapePage(){
    await page.waitForXPath(nextButtonXP, {timeout: 10000});
    await sleep(1500 + Math.floor(Math.random() * 5000))
    let nextBtnElem = (await page.$x(nextButtonXP))[0];
    let nextBtnDisabled = await page.$x(nextButtonDisabledXP);
    if(nextBtnDisabled.length) 
        return
    await nextBtnElem.click()
    await scrapePage()
}

async function parseJobs(jobs){
    for(let job of jobs){
        console.log("proposalsTier:" + job.proposalsTier)
    }
    await mongoDB.db(mongo_dbName).collection(_keyword).insertMany(jobs)
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
            await parseJobs(jobs)
        }
    })
}

async function setupMongoDB(){
    const uri = "mongodb+srv://admin:" + process.env.MONGODB_PWD + "@cluster0.9pbl5q2.mongodb.net/?retryWrites=true&w=majority";
    mongoDB = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await mongoDB.connect();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}