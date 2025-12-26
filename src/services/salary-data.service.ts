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



  private apiKey = process.env.API_KEY;

  private mockData: JobSalary[] = [
    { id: '1', title: 'Senior Software Engineer', location: 'San Francisco, CA', base_salary: '$185,000/yr', range: '$150K - $220K' },
    { id: '2', title: 'Product Manager', location: 'New York, NY', base_salary: '$160,000/yr', range: '$130K - $190K' },
    { id: '3', title: 'Data Scientist', location: 'Austin, TX', base_salary: '$145,000/yr', range: '$120K - $170K' },
    { id: '4', title: 'UX Designer', location: 'Remote', base_salary: '$130,000/yr', range: '$110K - $150K' },
    { id: '5', title: 'DevOps Engineer', location: 'Seattle, WA', base_salary: '$170,000/yr', range: '$145K - $200K' },
  ];

  searchSalaries(jobTitle: string, location: string, useMock: boolean): Observable<JobSalary[]> {
    const query = `${jobTitle} in ${location}`.trim();
    if (useMock) {
      // Filter mock data by query if possible
      const filtered = this.mockData.filter(j =>
        j.title.toLowerCase().includes(jobTitle.toLowerCase()) ||
        j.location.toLowerCase().includes(location.toLowerCase())
      );

      return new Observable(observer => {
        setTimeout(() => {
          observer.next(filtered.length > 0 ? filtered : this.mockData);
          observer.complete();
        }, 1000);
      });
    }


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
            id: `job-${index}`,
            title: job.job_title || 'Unknown Title',
            location: job.location || 'Unknown Location',
            base_salary: `${formatSalary(job.median_base_salary)}${period}`,
            range: `${formatSalary(job.min_base_salary)} - ${formatSalary(job.max_base_salary)}`
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

