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
	export class TemplateData {
	    Name: string;
	    Emails: string[];
	    Snacks: number;
	    CurrentWeek: number;
	    Facilitators: string;
	
	    static createFrom(source: any = {}) {
	        return new TemplateData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Emails = source["Emails"];
	        this.Snacks = source["Snacks"];
	        this.CurrentWeek = source["CurrentWeek"];
	        this.Facilitators = source["Facilitators"];
	    }
	}

}

