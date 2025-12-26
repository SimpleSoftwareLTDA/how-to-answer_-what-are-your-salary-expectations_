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
  private apiUrl = '/api/v2/glassdoor/job-salary';

  private apiKey = process.env.API_KEY;

  private mockData: JobSalary[] = [
    { id: '1', title: 'Senior Software Engineer', location: 'San Francisco, CA', base_salary: '$185,000/yr', range: '$150K - $220K' },
    { id: '2', title: 'Product Manager', location: 'New York, NY', base_salary: '$160,000/yr', range: '$130K - $190K' },
    { id: '3', title: 'Data Scientist', location: 'Austin, TX', base_salary: '$145,000/yr', range: '$120K - $170K' },
    { id: '4', title: 'UX Designer', location: 'Remote', base_salary: '$130,000/yr', range: '$110K - $150K' },
    { id: '5', title: 'DevOps Engineer', location: 'Seattle, WA', base_salary: '$170,000/yr', range: '$145K - $200K' },
  ];

  searchSalaries(query: string, useMock: boolean): Observable<JobSalary[]> {
    if (useMock) {
      // Filter mock data by query if possible
      const filtered = this.mockData.filter(j =>
        j.title.toLowerCase().includes(query.toLowerCase()) ||
        j.location.toLowerCase().includes(query.toLowerCase())
      );

      return new Observable(observer => {
        setTimeout(() => {
          observer.next(filtered.length > 0 ? filtered : this.mockData);
          observer.complete();
        }, 1000);
      });
    }

    const apiKey = (window as any).process?.env?.API_KEY;

    if (!apiKey || apiKey === 'YOUR_PILOTERR_API_KEY_HERE') {
      console.error('API key is not configured.');
      return throwError(() => new Error('API key is missing or placeholder. Please set a valid Piloterr API key.'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    });


    const params = { query };

    return this.http.get<any>(this.apiUrl, { headers, params }).pipe(
      map(response => {
        // Based on Piloterr documentation: response is an array of jobs or an object containing it
        const rawJobs = Array.isArray(response) ? response : (response.data || response.jobs || []);
        return rawJobs.map((job: any, index: number) => ({
          id: job.id || `job-${index}`,
          title: job.job_title || job.title || 'Unknown Title',
          location: job.location || 'Unknown Location',
          base_salary: job.salary_base || job.base_salary || 'N/A',
          range: job.salary_range || job.range || 'N/A'
        }));
      }),
      catchError(error => {
        console.error('API Error:', error);
        return throwError(() => new Error('Failed to fetch data from Piloterr API.'));
      })
    );
  }
}

