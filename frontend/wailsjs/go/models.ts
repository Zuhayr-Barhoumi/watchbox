export namespace main {
	
	export class Job {
	    ID: number;
	    Name: string;
	    LocalPath: string;
	    S3Bucket: string;
	    S3Key: string;
	    Schedule: string;
	    Enabled: boolean;
	    LastRun?: string;
	    LastError?: string;
	    LastStatus?: string;
	    CreatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Job(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Name = source["Name"];
	        this.LocalPath = source["LocalPath"];
	        this.S3Bucket = source["S3Bucket"];
	        this.S3Key = source["S3Key"];
	        this.Schedule = source["Schedule"];
	        this.Enabled = source["Enabled"];
	        this.LastRun = source["LastRun"];
	        this.LastError = source["LastError"];
	        this.LastStatus = source["LastStatus"];
	        this.CreatedAt = source["CreatedAt"];
	    }
	}

}

