import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface JobSalary {
  id: string;
  title: string;
  location: string;
  base_salary: string;
  range: string;
  currency: string;
  period: string;
  confidence: string;
  publisher_link: string;
  updated_at: string;
}

interface PiloterrResponse {
  jobs: JobSalary[];
}

@Injectable({
  providedIn: 'root'
})
export class SalaryDataService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.openwebninja.com/jsearch/company-job-salary';





  searchSalaries(jobTitle: string, location: string): Observable<JobSalary[]> {



    const apiKey = (window as any).process?.env?.API_KEY;

    if (!apiKey) {
      console.error('API_KEY environment variable is not set.');
      return throwError(() => new Error('Search failed: API configuration missing.'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    });


    // We need to extract company and job title from the single input or adjust the UI.
    // For now, let's assume the user enters "Job Title at Company" or we just treat the input as job_title and maybe add a company field later?
    // The user requirement says "change the api call to this... specific for a salary in a company".
    // However, our UI has "Job Title" and "Location" inputs. 
    // To support the new API properly, we should ideally have a company input. 
    // But as a quick fix/transition, I will split the jobTitle input if it contains " at " or use a default/fallback strategy.
    // OR, I can pass the location input as is, and use the jobTitle input as 'job_title' and maybe try to extract company?
    // Wait, the new API has 'company' as a required parameter in the example curl? 
    // curl '...company=Amazon&job_title=software%20developer...'

    // Let's parse the jobTitle string. If it's "Software Engineer at Google", company="Google", title="Software Engineer".
    const parts = jobTitle.split(' at ');
    const titleParam = parts[0];
    const companyParam = parts.length > 1 ? parts[1] : '';

    // If no company is provided, the API might fail or we might need to change the UI. 
    // Let's assume for this step we try to parse, and if not present, maybe we send it as just job_title and see (or maybe the user wants us to hardcode or just change the logic).
    // The user asked "change the api call to this", implying the parameters SHOULD be used.

    const params: any = {
      job_title: titleParam,
      location: location, // The new API response example has "location": "United States", so it likely accepts location too.
      years_of_experience: 'LESS_THAN_ONE' // Hardcoded as per request example or maybe exposed later
    };

    if (companyParam) {
      params['company'] = companyParam;
    }





    return this.http.get<any>(this.apiUrl, { headers, params }).pipe(
      map(response => {
        const rawJobs = response.data || [];
        return rawJobs.map((job: any, index: number) => {
          const currency = job.salary_currency || 'USD';
          const period = job.salary_period === 'YEAR' ? '/yr' : (job.salary_period === 'MONTH' ? '/mo' : '');

          const formatSalary = (val: number | null) => val ? new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val) : 'N/A';

          return {
            id: response.request_id || `job-${index}`, // Request ID is at root in new response
            title: job.job_title || 'Unknown Title',
            location: job.location || 'Unknown Location',
            base_salary: formatSalary(job.median_base_salary),
            range: `${formatSalary(job.min_base_salary)} - ${formatSalary(job.max_base_salary)}`,
            currency: currency,
            period: period,
            confidence: job.confidence || 'UNKNOWN',
            publisher_link: '#', // New response doesn't show publisher_link in example, defaulting to #
            updated_at: new Date().toISOString() // New response doesn't show salaries_updated_at in example
          };
        };
      });
  }),
  catchError(error => {
    console.error('API Error:', error);
return throwError(() => new Error('Failed to fetch data from OpenWeb Ninja API.'));
      })
    );


  }
}

