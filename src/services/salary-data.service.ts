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
  private apiUrl = 'https://api.openwebninja.com/jsearch/estimated-salary';





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




    const params = {
      job_title: jobTitle,
      location: location
    };


    return this.http.get<any>(this.apiUrl, { headers, params }).pipe(
      map(response => {
        const rawJobs = response.data || [];
        return rawJobs.map((job: any, index: number) => {
          const currency = job.salary_currency || 'USD';
          const period = job.salary_period === 'YEAR' ? '/yr' : (job.salary_period === 'MONTH' ? '/mo' : '');

          const formatSalary = (val: number | null) => val ? new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val) : 'N/A';

          return {
            id: job.request_id || `job-${index}`,
            title: job.job_title || 'Unknown Title',
            location: job.location || 'Unknown Location',
            base_salary: formatSalary(job.median_base_salary),
            range: `${formatSalary(job.min_base_salary)} - ${formatSalary(job.max_base_salary)}`,
            currency: currency,
            period: period,
            confidence: job.confidence || 'UNKNOWN',
            publisher_link: job.publisher_link || '#',
            updated_at: job.salaries_updated_at || new Date().toISOString()
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

