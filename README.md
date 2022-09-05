# Upwork Jobs Analysis
<br>
As a new Upwork freelancer, I want to analyze offer and demand of jobs I can cover with my skillset, to position myself in the best possible spot. 
<br><br>
The goal of the research is to gain general insights, and also to look into specific ideas like finding the projects with the best market position, to then propose them in the project catalog. 
<br><br>
Analyzing the jobs demand should be enough by itself, as a strong assumption is that whoever posted a custom job request, could not find a satisfying templated project offer. Anyway, also projects offers will be analyzed, and data from both the streams will be crossed to gather the most information. 

## Process
JobScraper.js will iteratively search a list of keywords input_keywords on upwork.com, crawling all job listings. Data is stored on a cloud mongo database. 

KeywordsAnalyzer.js performs the analysis and prints the results. 

Intended analysis was to analyze all words while filtering out irrelevant ones through a blacklist file. Of course this approach failed since keywords of interests are probably somenthing like 0.001%. So in the end I bounded the output to a filter_keywords list.

input_keywords: 
```
'solidity', 'ethereum', 'blockchain', 'evm', 'smart contract', 'nft', 'defi', 'web3'
```

filter_keywords: 
```
'ethereum', 'frontend', 'web3', 'mev', 'backend', 'database', 'evm', 'smart contract', 'full stack', 'full-stack', 'audit', 'solidity', 'nft', 'blockchain', 'python', 'solana', 'rust', 'golang', 'bitcoin'
```
Here I sprinkled some tangent topic to see their performance related to the web3 environment

### Output
Here 'recordings' stands for the number of job listings having a value set for the current metric


Printing results ordered by Price Amount  
```                             
{ key: 'ethereum', avgBudgetUSD: 4785, priceRecordings: 92 }           
{ key: 'evm', avgBudgetUSD: 4453, priceRecordings: 20 }                
{ key: 'solidity', avgBudgetUSD: 4125, priceRecordings: 84 }           
{ key: 'blockchain', avgBudgetUSD: 4074, priceRecordings: 277 }        
{ key: 'nft', avgBudgetUSD: 3706, priceRecordings: 236 }               
{ key: 'web3', avgBudgetUSD: 3459, priceRecordings: 127 }              
{ key: 'smart contract', avgBudgetUSD: 2737, priceRecordings: 180 }    
{ key: 'solana', avgBudgetUSD: 2672, priceRecordings: 52 }             
{ key: 'frontend', avgBudgetUSD: 2583, priceRecordings: 41 }           
{ key: 'full stack', avgBudgetUSD: 2525, priceRecordings: 50 }         
{ key: 'backend', avgBudgetUSD: 2037, priceRecordings: 55 }            
{ key: 'python', avgBudgetUSD: 1822, priceRecordings: 34 }             
{ key: 'rust', avgBudgetUSD: 1195, priceRecordings: 16 }               
{ key: 'database', avgBudgetUSD: 1069, priceRecordings: 19 }           
{ key: 'bitcoin', avgBudgetUSD: 870, priceRecordings: 26 }             
{ key: 'audit', avgBudgetUSD: 423, priceRecordings: 22 }    
```           
Printing results ordered by Price Hourly            
```                   
{ key: 'evm', avgHourlyUSD: 37, priceRecordings: 53 }                  
{ key: 'solidity', avgHourlyUSD: 37, priceRecordings: 136 }            
{ key: 'ethereum', avgHourlyUSD: 33, priceRecordings: 131 }            
{ key: 'smart contract', avgHourlyUSD: 30, priceRecordings: 264 }      
{ key: 'blockchain', avgHourlyUSD: 28, priceRecordings: 412 }          
{ key: 'backend', avgHourlyUSD: 28, priceRecordings: 100 }             
{ key: 'frontend', avgHourlyUSD: 28, priceRecordings: 70 }             
{ key: 'rust', avgHourlyUSD: 27, priceRecordings: 50 }                 
{ key: 'nft', avgHourlyUSD: 26, priceRecordings: 324 }                 
{ key: 'database', avgHourlyUSD: 26, priceRecordings: 49 }             
{ key: 'solana', avgHourlyUSD: 25, priceRecordings: 66 }               
{ key: 'web3', avgHourlyUSD: 24, priceRecordings: 295 }                
{ key: 'full stack', avgHourlyUSD: 24, priceRecordings: 89 }           
{ key: 'python', avgHourlyUSD: 23, priceRecordings: 54 }               
{ key: 'bitcoin', avgHourlyUSD: 23, priceRecordings: 23 }              
{ key: 'audit', avgHourlyUSD: 22, priceRecordings: 38 }         
```       
Printing results ordered by Job Count                       
```           
{ key: 'blockchain', jobs: 890 }                                       
{ key: 'nft', jobs: 707 }                                              
{ key: 'smart contract', jobs: 553 }                                   
{ key: 'web3', jobs: 528 }                                             
{ key: 'ethereum', jobs: 268 }                                         
{ key: 'solidity', jobs: 262 }                                         
{ key: 'backend', jobs: 180 }                                          
{ key: 'full stack', jobs: 166 }                                       
{ key: 'solana', jobs: 158 }                                           
{ key: 'frontend', jobs: 118 }                                         
{ key: 'python', jobs: 115 }                                           
{ key: 'rust', jobs: 90 }                                              
{ key: 'database', jobs: 82 }                                          
{ key: 'evm', jobs: 81 }                                               
{ key: 'audit', jobs: 78 }                                             
{ key: 'bitcoin', jobs: 55 }                                           
{ key: 'golang', jobs: 26 }                                            
{ key: 'mev', jobs: 8 }                                    
```            
Printing results ordered by Applications per Job          
```             
{ key: 'solidity', applications: 33, recordings: 262 }                 
{ key: 'full stack', applications: 32, recordings: 166 }               
{ key: 'ethereum', applications: 32, recordings: 268 }                 
{ key: 'backend', applications: 30, recordings: 180 }                  
{ key: 'nft', applications: 30, recordings: 707 }                      
{ key: 'frontend', applications: 30, recordings: 118 }                 
{ key: 'smart contract', applications: 29, recordings: 553 }           
{ key: 'evm', applications: 29, recordings: 81 }                       
{ key: 'blockchain', applications: 27, recordings: 890 }               
{ key: 'web3', applications: 26, recordings: 528 }                     
{ key: 'solana', applications: 26, recordings: 158 }                   
{ key: 'audit', applications: 23, recordings: 78 }                     
{ key: 'database', applications: 21, recordings: 82 }                  
{ key: 'python', applications: 20, recordings: 115 }                   
{ key: 'rust', applications: 20, recordings: 90 }                      
{ key: 'bitcoin', applications: 20, recordings: 55 }                   
{ key: 'golang', applications: 17, recordings: 26 }                    
```

### Insights
- Fixed price and hourly price rankings didn't differ that much
- Auditing ranks low in all metrics. I was expecting it to perform well at least on an hourly basis, but nope. I guess the amateur market differs quite much from the established one. Taking into account the high amount of low price auditing jobs on the upwork job catalog, auditing as a freelancer seems a bad direction
- Solidity is still solid across the board, but it's also where most competition is
- Python jobs in web3 environment rank low
- Javascript is a solid top tier a bit less competitive then Solidity
- Solana/Rust still has a noticeable gap vs Ethereum/Solidity
- Golang despite the Cosmos ecosystem is still a small market
- NFTs rank mid price-tier but still account for a ton of jobs
