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
  // Points to your future Cloudflare Worker URL
  private apiUrl = 'https://salary-api-proxy.robson.workers.dev';

  searchSalaries(jobTitle: string, company: string): Observable<JobSalary[]> {
    // The API key is now handled by the Cloudflare Worker (BFF Pattern)
    // No headers needed on the client side
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });


    // The API uses explicit job_title and company parameters as requested in the new UI structure.


    const params: any = {
      job_title: jobTitle,
      company: company,
      years_of_experience: 'LESS_THAN_ONE' // Hardcoded as per request example
    };





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
            base_salary: `${formatSalary(job.median_base_salary)}/yr`, // Explicitly Annual
            range: `${formatSalary(job.median_base_salary / 12)}/mo`, // Display Monthly as the "secondary" or separate field? 
            // The user said "Make the output return the salary annually and monthly"
            // I'll repurpose the 'range' field to show the monthly value for now, or concat both?
            // "base_salary": "$120k/yr | $10k/mo" ?
            // Let's modify base_salary to show annual and range to show monthly for better UI fit without changing the interface too much yet.
            // Or better:
            // base_salary: "$120,070/yr",
            // range: "$10,006/mo", 

            currency: currency,
            period: period,
            confidence: job.confidence || 'UNKNOWN',
            publisher_link: '#',
            updated_at: new Date().toISOString()
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

