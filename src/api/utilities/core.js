// core.js

// the entry point (consturctor class) for the API requests, 
// defines which API resources that are going to be requested

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

import { apiProvider } from './provider.js'

export class ApiCore {

    constructor(options){

        if(options.getSimplify) {
            this.simplifiedResponse = () => {
                return apiProvider.getSimplify(options.textData)
            }
        }

        if(options.getSummarize) {
            this.summarizedResponse = () => {
                return apiProvider.getSummarize(options.textData)
            }
        }

        if(options.getDictionary) {
            this.dictionaryResponse = () => {
                return apiProvider.getDictionary(options.textData)
            }
        }
    }

}