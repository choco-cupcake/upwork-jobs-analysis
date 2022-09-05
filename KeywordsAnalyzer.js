const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require("fs")
require("dotenv").config()

let mongoDB
let mongo_dbName = 'UpworkJobsAnalysis'
let excludedKeywords 
const searchKeywords = ['solidity', 'ethereum', 'blockchain', 'evm', 'smart contract', 'nft', 'defi', 'web3']
const filterKeywords = ['ethereum', 'frontend', 'web3', 'mev', 'backend', 'database', 'evm', 'smart contract', 'full stack', 'full-stack', 'audit', 'solidity', 'nft', 'blockchain', 'python', 'solana', 'rust', 'golang', 'bitcoin']
const settings = {
    filterJobSearch: 'all', // db-collection-name or 'all' to consider all results at once
    analyzePrices: true,
    analyzeApplicationsVolume: true,
    removeTrailingS: true,
    toLowerCase: true,
    multiWordKeywords: ['smart contract', 'full stack'],
    multiWordKeywordsReplaceSingles: true,
    filters: {
        priceAmount:{
            maxVal: 50000,
            enabled: true,
            minRecordings: 2
        },
        priceHourly:{
            enabled: true,
            minRecordings: 2
        },
        applications:{
            enabled: true,
            minRecordings: 2
        }
    }
    
}


let result = {
    keywordsCount: {}, // total keyword count, even if multiple times in the same job
    keywordsJobCount: {}, // for each keyword, in how many jobs appeared
    keywordPriceAmount: {}, // converts Hourly rate and budgets to a uniform price scale -once per job-
    keywordHasPriceAmount: {}, // support structure to normalize keywordPricePoints
    keywordPriceHourly: {}, // converts Hourly rate and budgets to a uniform price scale -once per job-
    keywordHasPriceHourly: {}, // support structure to normalize keywordPricePoints
    keywordApplications: {}, // for each keyword, the total applications -once per job-
    keywordHasApplications: {} // support structure to normalize keywordApplications
}

main()

async function main(){
    getExcludedKeywords()
    await setupMongoDB()
    console.log("MongoDB setup done")

    let jobs = await getJobs(settings.filterJobSearch)
    console.log("Got jobs from mongo")

    
    for(let job of jobs){
        let bow = craftBOW(job) // get text concat of title, descr, and relevant fields
        analyzeBOW(bow, job)
    }


    sortByPriceAmount()

    sortByPriceHourly()

    sortByJobCount()

    sortByApplicationsPerJob()
    
}

function sortByApplicationsPerJob(){
    console.log("Printing results ordered by Applications per Job")
    // order result by highest paying keywords (by budget amount)
    
    let applicationsPerJob = []
    for(let k of Object.keys(result.keywordApplications)){
        let _applicationsPerJob = Math.floor((result.keywordApplications[k] / result.keywordHasApplications[k]))
        applicationsPerJob.push({key: k, applications: _applicationsPerJob, recordings: result.keywordHasApplications[k]})
    }
    if(settings.filters.applications.enabled){
        applicationsPerJob = applicationsPerJob.filter(e => e.recordings > settings.filters.applications.minRecordings)
    }
    applicationsPerJob = applicationsPerJob.filter(e => filterKeywords.includes(e.key))
    applicationsPerJob.sort((a,b) => {return b.applications - a.applications})
    for(let s of applicationsPerJob.map(e => e))
        console.log(s)
}

function sortByJobCount(){
    console.log("Printing results ordered by Job Count")
    // order result by highest paying keywords (by budget amount)
    let jobCountClone = []
    for(let k of Object.keys(result.keywordsCount)){
        jobCountClone.push({key: k, jobs: result.keywordsJobCount[k]})
    }
    jobCountClone = jobCountClone.filter(e => filterKeywords.includes(e.key))
    jobCountClone.sort((a,b) => {return b.jobs - a.jobs})
    for(let s of jobCountClone.map(e => e))
        console.log(s)
}

function sortByPriceAmount(){
    console.log("Printing results ordered by Price Amount")
    // order result by highest paying keywords (by budget amount)
    let normalizedPriceAmount = []
    for(let k of Object.keys(result.keywordPriceAmount)){
        let _normalizedPriceAmount = Math.floor(result.keywordPriceAmount[k] / result.keywordHasPriceAmount[k])
        normalizedPriceAmount.push({key: k, avgBudgetUSD: _normalizedPriceAmount, priceRecordings: result.keywordHasPriceAmount[k]})
    }
    if(settings.filters.priceAmount.enabled){
        normalizedPriceAmount = normalizedPriceAmount.filter(e => e.priceRecordings > settings.filters.priceAmount.minRecordings)
    }
    normalizedPriceAmount = normalizedPriceAmount.filter(e => filterKeywords.includes(e.key))
    normalizedPriceAmount.sort((a,b) => {return b.avgBudgetUSD - a.avgBudgetUSD})
    for(let s of normalizedPriceAmount.map(e => e))
        console.log(s)
}

function sortByPriceHourly(){
    console.log("Printing results ordered by Price Hourly")
    // order result by highest paying keywords (by budget amount)
    let normalizedPriceHourly = []
    for(let k of Object.keys(result.keywordPriceAmount)){
        let _normalizedPriceHourly = Math.floor(result.keywordPriceHourly[k] / result.keywordHasPriceHourly[k])
        normalizedPriceHourly.push({key: k, avgHourlyUSD: _normalizedPriceHourly, priceRecordings: result.keywordHasPriceHourly[k]})
    }
    if(settings.filters.priceHourly.enabled){
        normalizedPriceHourly = normalizedPriceHourly.filter(e => e.priceRecordings > settings.filters.priceHourly.minRecordings)
    }
    normalizedPriceHourly = normalizedPriceHourly.filter(e => filterKeywords.includes(e.key))
    normalizedPriceHourly.sort((a,b) => {return b.avgHourlyUSD - a.avgHourlyUSD})
    for(let s of normalizedPriceHourly.map(e => e))
        console.log(s)
}

async function getJobs(collection){
    if(collection == 'all'){
        let ret = []
        for(let k of searchKeywords){
            let jobs = await (await mongoDB.db(mongo_dbName).collection(k).find({})).toArray()
            for(let j of jobs){
                let _new = true
                for(let r of ret){
                    if(cleanString(r.title) == cleanString(j.title) && cleanString(r.description).substring(0,50) == cleanString(j.description).substring(0,50)){
                        _new = false
                        break
                    }
                }
                if(_new) ret.push(j)
            }
            console.log("job list " + k + " inserted")
        }
        return ret
    }
    return await (await mongoDB.db(mongo_dbName).collection(collection).find({})).toArray()
}

async function setupMongoDB(){
    const uri = "mongodb+srv://admin:" + process.env.MONGODB_PWD + "@cluster0.9pbl5q2.mongodb.net/?retryWrites=true&w=majority";
    mongoDB = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await mongoDB.connect();
}

function cleanString(text){
    // strip chars 
    text = text.replaceAll(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,' ')

    // strip syntax highlight 
    text = text.replaceAll(/^<.*>$/g,' ')

    // remove trailing s, gotta do it before excluded and multiword keywords
    if(settings.removeTrailingS){
        text = text.replaceAll(/\s+/g, ' ') // remove multiple spaces

        let words = text.split(' ')
        for(let i=0;i<words.length;i++){
            if(words[i][words.length - 1] == 's')
                words[i] = words[i].substring(0, words[i].length - 1)
        }
        text = words.join(' ')

    }

    // text to lowercase
    if(settings.toLowerCase) {
        text = text.toLowerCase()
    }

    // remove excluded keywords
    for(let ew of excludedKeywords){
        text = text.replaceAll(ew, ' ')
    }
    return text
}

function craftBOW(job){
    let bow = {}
    let text = job.title + ' ' + job.description

    text = cleanString(text)

    // check for multiwordkeywords
    for(let mwk of settings.multiWordKeywords){
        let re = new RegExp(mwk, 'g');
        let occurrences = [...text.matchAll(re)]
        if(occurrences.length){
            bow[mwk] ? bow[mwk] += occurrences : bow[mwk] = occurrences // bow[mwk] += occurrences
            if(settings.multiWordKeywordsReplaceSingles){
                text = text.replaceAll(mwk, '')
            }
        }
    }

    // remove multiple spaces
    text = text.replaceAll(/\s+/g, ' ')

    // compute the rest one word keywords
    let words = text.split(' ') // .filter(e => e.length >= 3)  deprecated since introduction of filter keywords
    for(let w of words){
        bow[w] ? bow[w] += 1 : bow[w] = 1  
    }


    return bow
}

function fillKeywordExtras(keyword, job){
    if(settings.analyzePrices){
        // compute price points using both amount and hourlyBudgetText
        if(job.amount && job.amount.currencyCode == 'USD' && job.amount.amount != 0 && job.amount.amount <= settings.filters.priceAmount.maxVal){
            result.keywordPriceAmount[keyword] ? result.keywordPriceAmount[keyword] += job.amount.amount : result.keywordPriceAmount[keyword] = job.amount.amount // result.keywordPriceAmount[keyword] += amount
            result.keywordHasPriceAmount[keyword] ? result.keywordHasPriceAmount[keyword] += 1 : result.keywordHasPriceAmount[keyword] = 1 // result.keywordPricePriceAmount[keyword] += 1
        }
        else if(job.hourlyBudgetText){
            avgHourly = getAverageHourly(job.hourlyBudgetText)
            result.keywordPriceHourly[keyword] ? result.keywordPriceHourly[keyword] += avgHourly : result.keywordPriceHourly[keyword] = avgHourly
            result.keywordHasPriceHourly[keyword] ? result.keywordHasPriceHourly[keyword] += 1 : result.keywordHasPriceHourly[keyword] = 1
        }   
    }
    if(settings.analyzeApplicationsVolume){
        // get application volume
        if(job.proposalsTier){
            let appl = getAverageApplications(job.proposalsTier)
            if(appl){
                result.keywordApplications[keyword] ? result.keywordApplications[keyword] += appl : result.keywordApplications[keyword] = appl
                result.keywordHasApplications[keyword] ? result.keywordHasApplications[keyword] += 1 : result.keywordHasApplications[keyword] = 1
            }
            else    
                console.log("appl null")
        }
    }
}

function getExcludedKeywords(){
    let raw = fs.readFileSync("./excluded_keywords.txt", {encoding:'utf8', flag:'r'})
    excludedKeywords = raw.split("\r\n").filter(e => !!e.length)
}

function analyzeBOW(bow, job){
    for(let k of Object.keys(bow)){
        // update keywordsCount
        if(result.keywordsCount[k])
            result.keywordsCount[k] += bow[k]
        else
            result.keywordsCount[k] = bow[k]
        // update keywordsJobCount
        if(result.keywordsJobCount[k])
            result.keywordsJobCount[k] += 1
        else
            result.keywordsJobCount[k] = 1
        // update extra structures
        fillKeywordExtras(k, job)
    }
}

function getAverageHourly(hourly){
    if(hourly.match(/^\$\d{2}.\d{2}\-\$\d{2}.\d{2}$/)){
        // clean, cast and get avg
        let t = hourly.replaceAll('$','').split('-')
        return Math.floor((Number(t[0]) + Number(t[1])) / 2)
    }
    return null
}

function getAverageApplications(proposalsTier){
    if(proposalsTier.match(/^\d+ to \d+$/)){
        // cast and get avg
        let t = proposalsTier.split(' to ')
        return Math.floor((Number(t[0]) + Number(t[1])) / 2)
    }
    else if(proposalsTier.match(/^\d+\+$/)){
        // add a 25% bonus to hopefully make things more accurate
        return Math.floor(Number(proposalsTier.substring(0, proposalsTier.length - 1)) * 1.25)
    }
    else if(proposalsTier.match('Less than 5')){
        return 2
    }
    return null // no recognized format
}
