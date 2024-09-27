export namespace main {
	
	export class RenderedTemplate {
	    emailAddresses: string[];
	    subject: string;
	    body: string;
	
	    static createFrom(source: any = {}) {
	        return new RenderedTemplate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.emailAddresses = source["emailAddresses"];
	        this.subject = source["subject"];
	        this.body = source["body"];
	    }
	}

}

